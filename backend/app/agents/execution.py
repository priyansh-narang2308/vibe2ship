import os
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import ActionPlan, ActionTask
from app.services.document_generator import generate_complaint_pdf, upload_pdf_to_gcs
from app.services.notifications import send_email, send_sms
from app.services.database import create_issue, update_issue_status

class ExecutionAgent(BaseAgent):
    def __init__(self):
        super().__init__("ExecutionAgent")

    async def run(
        self,
        action_plan: ActionPlan,
        original_report_data: Dict[str, Any],
        log_callback: Optional[LogCallback] = None
    ) -> List[Dict[str, Any]]:
        
        await self.log("Starting execution of the Planner's action strategy...", "INFO", log_callback)
        execution_log = []
        issue_id = original_report_data.get("id")
        complaint_url = None
        local_pdf_path = None

        for task in action_plan.tasks:
            task_type = task.action_type
            task.status = "RUNNING"
            await self.log(f"Processing action task: '{task_type}'...", "INFO", log_callback)
            
            success = False
            result_payload = {}

            try:
                if task_type == "GENERATE_DOC":
                    # Determine output path inside the workspace backend tmp directory
                    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                    tmp_dir = os.path.join(base_dir, "tmp", "complaints")
                    local_pdf_path = os.path.join(tmp_dir, f"{issue_id}.pdf")
                    
                    # Generate the PDF complaint
                    generate_complaint_pdf(action_plan.complaint_document_spec, local_pdf_path)
                    await self.log(f"Generated local PDF at {local_pdf_path}", "INFO", log_callback)
                    
                    # Upload PDF to GCS
                    blob_name = f"complaints/{issue_id}.pdf"
                    complaint_url = upload_pdf_to_gcs(local_pdf_path, blob_name)
                    await self.log(f"Complaint PDF uploaded to Cloud Storage. URL: {complaint_url}", "SUCCESS", log_callback)
                    
                    success = True
                    result_payload = {"complaint_url": complaint_url}

                elif task_type == "POST_DASHBOARD":
                    # Build full issue payload for Firestore
                    issue_payload = {
                        **original_report_data,
                        "status": "SUBMITTED",
                        "priority_score": task.payload.get("priority_score", 50.0),
                        "complaint_url": complaint_url,
                        "action_plan": action_plan.model_dump(),
                        "agent_logs": [
                            {
                                "agent": "ExecutionAgent",
                                "message": "Issue registered on the central system.",
                                "status": "SUCCESS",
                                "timestamp": datetime.utcnow().isoformat()
                            }
                        ]
                    }
                    # Save to Firestore
                    await create_issue(issue_id, issue_payload)
                    await self.log(f"Registered issue '{issue_id}' on central dashboard.", "SUCCESS", log_callback)
                    success = True

                elif task_type == "SEND_EMAIL":
                    to_email = task.payload.get("to_email")
                    officer_name = task.payload.get("officer_name", "Officer")
                    subject = task.payload.get("subject", "Urgent Civic Grievance")
                    recipient_title = task.payload.get("recipient_title", "Division Head")
                    
                    # Compose detailed email body referencing GCS PDF link
                    email_body = f"""Dear {officer_name},
                    
                    ({recipient_title}),
                    
                    An urgent civic infrastructure issue has been reported in your jurisdiction and validated by the CivicPulse community verification network.
                    
                    A formal complaint document has been compiled and is attached to this email. You can also view it directly here: {complaint_url}
                    
                    Please review this defect report and initiate resolution procedures immediately. We have set a standard SLA window of 48 hours for acknowledgement.
                    
                    Regards,
                    CivicPulse Community Team
                    """
                    
                    # Send email with local PDF attachment
                    email_success = await send_email(
                        to_email=to_email,
                        subject=subject,
                        body=email_body,
                        attachment_path=local_pdf_path
                    )
                    
                    if email_success:
                        await self.log(f"Email successfully dispatched to {to_email}", "SUCCESS", log_callback)
                        success = True
                    else:
                        await self.log(f"Failed to dispatch email to {to_email}", "ERROR", log_callback)

                elif task_type == "SEND_SMS":
                    phone_number = task.payload.get("phone_number")
                    message = task.payload.get("message", "New CivicPulse notification.")
                    
                    sms_success = await send_sms(phone_number, message)
                    if sms_success:
                        await self.log(f"SMS alert dispatched to {phone_number}", "SUCCESS", log_callback)
                        success = True
                    else:
                        await self.log(f"Failed to send SMS to {phone_number}", "ERROR", log_callback)
                        
                else:
                    await self.log(f"Unknown action task type: '{task_type}'", "WARNING", log_callback)
                    
            except Exception as e:
                await self.log(f"Exception during task '{task_type}' execution: {e}", "ERROR", log_callback)
                
            task.status = "COMPLETED" if success else "FAILED"
            task.timestamp = datetime.utcnow()
            task.payload.update(result_payload)
            
            execution_log.append({
                "task_id": task.task_id,
                "action_type": task_type,
                "status": task.status,
                "timestamp": task.timestamp.isoformat(),
                "payload": task.payload
            })

        await self.log("All planned execution tasks complete.", "SUCCESS", log_callback)
        return execution_log
