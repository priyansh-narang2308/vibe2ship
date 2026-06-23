import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from app.agents.base import BaseAgent, LogCallback
from app.services.firebase import get_db
from app.services.notifications import send_email
from app.services.database import update_issue_status
from google.cloud import firestore

class EscalationAgent(BaseAgent):
    def __init__(self):
        super().__init__("EscalationAgent")

    def _generate_rti_text(self, issue: Dict[str, Any]) -> str:
        """Draft a formal Right to Information (RTI) application text (India-specific context)."""
        location = issue.get("location", {})
        created_at_str = issue.get("created_at")
        
        return f"""
        APPLICATION FOR INFORMATION UNDER THE RIGHT TO INFORMATION ACT, 2005
        
        To,
        The Public Information Officer (PIO),
        Office of the District Commissioner,
        {issue.get('district', 'Central District')}, State Authority.
        
        1. Full Name of the Applicant: Citizen Representative (via CivicPulse Platform)
        2. Address: CivicPulse Network, Bangalore, Karnataka
        3. Particulars of Information Required:
           Regarding the grievance reported for {issue.get('issue_type')} at coordinates ({location.get('latitude')}, {location.get('longitude')}).
           
           Please provide the following information:
           (a) What official actions have been taken by the division regarding the complaint ID {issue.get('id')} filed on {created_at_str}?
           (b) Provide copy of the file notes, site inspection reports, and repair schedules concerning this defect.
           (c) Name and designation of the officials who were responsible for resolving this defect within the standard SLA period but failed to do so.
           (d) What disciplinary actions or penalties have been initiated against such officials for negligence of duty?
           
        4. Application Fee Details: Paid via online portal receipt.
        
        Date: {datetime.utcnow().strftime("%Y-%m-%d")}
        Applicant Signature: [Digitally Filed via CivicPulse]
        """

    async def run(
        self,
        log_callback: Optional[LogCallback] = None
    ) -> List[Dict[str, Any]]:
        """
        Task 16 Logic: Monitor all open issues in Firestore for SLA breaches,
        and Task 17 Logic: Execute escalations (Email dispatch and RTI generation).
        """
        await self.log("Scanning database for active issues requiring SLA checks...", "INFO", log_callback)
        db = get_db()
        if db is None:
            await self.log("Database connection not available. Aborting scan.", "ERROR", log_callback)
            return []

        # Fetch issues that are NOT resolved
        issues_ref = db.collection("issues")
        query = issues_ref.where(filter=firestore.FieldFilter("status", "!=", "RESOLVED"))
        docs = list(query.stream())
        
        await self.log(f"Found {len(docs)} active issues in queue to evaluate.", "INFO", log_callback)
        escalation_results = []
        now = datetime.now(timezone.utc)

        for doc in docs:
            issue = doc.to_dict()
            issue["id"] = doc.id
            
            created_at = issue.get("created_at")
            if not created_at:
                continue
                
            # Parse created_at datetime
            if isinstance(created_at, str):
                try:
                    c_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except ValueError:
                    continue
            else:
                c_dt = created_at

            # Calculate elapsed time in hours
            elapsed_hours = (now - c_dt).total_seconds() / 3600.0
            current_escalation_level = issue.get("escalation_level", 1)
            
            action_plan_data = issue.get("action_plan", {})
            escalation_ladder = action_plan_data.get("escalation_ladder", [])
            
            if not escalation_ladder:
                continue

            # Find if there is a higher level in the ladder that has breached SLA
            target_level = None
            target_contact = None
            target_title = None
            
            for tier in escalation_ladder:
                tier_level = tier.get("level", 1)
                sla_hours = tier.get("sla_hours", 48)
                
                # Check if elapsed time has breached this tier's SLA, and we haven't escalated there yet
                if tier_level > current_escalation_level and elapsed_hours > sla_hours:
                    target_level = tier_level
                    target_contact = tier.get("contact_email")
                    target_title = tier.get("title", "Supervising Authority")

            if target_level and target_contact:
                # Trigger Task 17: Execute Escalation Action
                await self.log(
                    f"SLA BREACH DETECTED: Issue '{issue['id']}' elapsed {round(elapsed_hours, 1)} hours (SLA breached). Escalating to Level {target_level} ({target_title})...",
                    "WARNING",
                    log_callback
                )
                
                subject = f"ESCALATION ALERT: Unresolved {issue.get('issue_type')} complaint - Case ID {issue['id']}"
                body = f"""Dear {target_title},
                
                We are writing to escalate an unresolved civic infrastructure issue reported in your administrative circle.
                
                Issue Details:
                - Case ID: {issue['id']}
                - Type: {issue.get('issue_type')}
                - Reported Date: {c_dt.strftime('%Y-%m-%d %H:%M:%S')}
                - Elapsed Unresolved Hours: {round(elapsed_hours, 1)} hours
                - Original Complaint Letter URL: {issue.get('complaint_url', 'N/A')}
                
                A Level-1 notification was sent to the assigned Ward Officer, but no resolution confirmation has been received within the SLA timeframe. 
                
                Please intervene to ensure public safety and accountability.
                
                Regards,
                CivicPulse Autonomous Escalation Engine
                """
                
                # Send escalation email
                email_sent = await send_email(to_email=target_contact, subject=subject, body=body)
                
                if email_sent:
                    # Update escalation level in Firestore
                    doc_ref = db.collection("issues").document(issue["id"])
                    
                    log_entry = {
                        "agent": "EscalationAgent",
                        "message": f"Issue escalated to Level {target_level} ({target_title}) due to SLA breach at {round(elapsed_hours, 1)} hours.",
                        "status": "WARNING",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    doc_ref.update({
                        "escalation_level": target_level,
                        "status": "MONITORING",
                        "agent_logs": firestore.ArrayUnion([log_entry])
                    })
                    
                    await self.log(f"Successfully escalated issue '{issue['id']}' to {target_contact}.", "SUCCESS", log_callback)
                    escalation_results.append({"issue_id": issue["id"], "action": f"ESCALATED_TO_L{target_level}"})
                else:
                    await self.log(f"Failed to send escalation email to {target_contact}.", "ERROR", log_callback)

            # Check if unresolved for 30+ days (720 hours) to auto-draft an RTI complaint
            if elapsed_hours > 720.0 and not issue.get("rti_drafted"):
                await self.log(
                    f"CRITICAL: Issue '{issue['id']}' has been unresolved for 30+ days. Auto-drafting RTI (Right to Information) application...",
                    "WARNING",
                    log_callback
                )
                
                rti_text = self._generate_rti_text(issue)
                doc_ref = db.collection("issues").document(issue["id"])
                
                log_entry = {
                    "agent": "EscalationAgent",
                    "message": "Unresolved for 30+ days. Auto-drafted RTI legal application for citizen submission.",
                    "status": "WARNING",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                doc_ref.update({
                    "rti_drafted": True,
                    "rti_text": rti_text,
                    "agent_logs": firestore.ArrayUnion([log_entry])
                })
                
                await self.log(f"RTI Application generated for issue '{issue['id']}'.", "SUCCESS", log_callback)
                escalation_results.append({"issue_id": issue["id"], "action": "RTI_DRAFTED"})

        await self.log(f"Escalation monitoring cycle complete. Processed actions: {len(escalation_results)}", "SUCCESS", log_callback)
        return escalation_results
