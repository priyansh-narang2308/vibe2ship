import uuid
from typing import Optional, Dict, Any, List
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import (
    CitizenReport, HistoricalContext, ResearchEnrichment, 
    VerificationResult, VisionAnalysis, PredictionOutput, ActionPlan, ActionTask
)
from app.services.gemini import generate_structured

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__("PlannerAgent")

    def _get_fallback_action_plan(
        self,
        report: CitizenReport,
        historical_ctx: HistoricalContext,
        research_ctx: ResearchEnrichment,
        verification: VerificationResult,
        vision: VisionAnalysis,
        prediction: PredictionOutput
    ) -> ActionPlan:
        """Create a default deterministic ActionPlan if Gemini planning fails."""
        gov = research_ctx.governance
        
        # 1. Create standard tasks
        tasks = [
            ActionTask(
                task_id=str(uuid.uuid4()),
                action_type="GENERATE_DOC",
                status="PENDING",
                payload={
                    "issue_id": report.id,
                    "issue_type": vision.issue_type.value,
                    "location_address": research_ctx.governance.ward_name,
                    "severity": vision.severity.value,
                    "description": report.description or ""
                }
            ),
            ActionTask(
                task_id=str(uuid.uuid4()),
                action_type="POST_DASHBOARD",
                status="PENDING",
                payload={
                    "issue_id": report.id,
                    "status": "SUBMITTED",
                    "priority_score": prediction.risk_score
                }
            ),
            ActionTask(
                task_id=str(uuid.uuid4()),
                action_type="SEND_EMAIL",
                status="PENDING",
                payload={
                    "to_email": gov.officer_email,
                    "officer_name": gov.officer_name,
                    "subject": f"ALERT: Urgent {vision.issue_type.value} reported in {gov.ward_name}",
                    "recipient_title": f"Ward Officer, {gov.dept_name}"
                }
            )
        ]
        
        # Add SMS task if phone number is available
        if gov.officer_phone:
            tasks.append(ActionTask(
                task_id=str(uuid.uuid4()),
                action_type="SEND_SMS",
                status="PENDING",
                payload={
                    "phone_number": gov.officer_phone,
                    "message": f"CivicPulse Notification: {vision.issue_type.value} reported at {gov.ward_name}. Severity: {vision.severity.value}. Assigned to you."
                }
            ))

        # 2. Bounded complaint document spec
        doc_spec = {
            "title": f"FORMAL INFRASTRUCTURE GRIEVANCE REPORT — {vision.issue_type.value}",
            "recipient_name": gov.officer_name,
            "recipient_title": f"Division Officer, {gov.dept_name}",
            "ward_name": gov.ward_name,
            "district": gov.district,
            "subject_line": f"Immediate resolution required: {vision.issue_type.value} on coordinates {report.location.latitude}, {report.location.longitude}",
            "body_paragraphs": [
                f"This official grievance is filed under citizen safety regulations concerning a {vision.issue_type.value.lower()} issue detected in {gov.ward_name} on {datetime_now_str()}.",
                f"Multimodal AI visual audit classified this issue at {vision.severity.value} severity. Proximity analysis indicates immediate safety risk: {prediction.risk_score > 60}.",
                f"We expect an acknowledgement within 48 hours and complete resolution within the standard SLA period of 5 days, failing which the issue will be escalated."
            ]
        }

        # 3. Escalation ladder
        escalation_ladder = [
            {
                "level": 1,
                "title": f"Ward Officer: {gov.officer_name}",
                "contact_email": gov.officer_email,
                "sla_hours": 48
            },
            {
                "level": 2,
                "title": f"District Commissioner, {gov.district}",
                "contact_email": f"commissioner.{gov.district.lower().replace(' ', '')}@gov.in",
                "sla_hours": 168  # 7 days
            }
        ]

        # 4. Follow up checkpoints
        follow_up = [
            {"checkpoint_id": "T+48h_sla_check", "due_hours": 48},
            {"checkpoint_id": "T+168h_final_check", "due_hours": 168}
        ]

        return ActionPlan(
            tasks=tasks,
            complaint_document_spec=doc_spec,
            escalation_ladder=escalation_ladder,
            follow_up_schedule=follow_up
        )

    async def run(
        self,
        report: CitizenReport,
        historical_ctx: HistoricalContext,
        research_ctx: ResearchEnrichment,
        verification: VerificationResult,
        vision: VisionAnalysis,
        prediction: PredictionOutput,
        log_callback: Optional[LogCallback] = None
    ) -> ActionPlan:
        
        await self.log("Synthesizing agent intelligence into a strategic action plan...", "INFO", log_callback)

        # Build context prompt
        prompt = f"""
        You are the Planner Agent for CivicPulse. 
        You must synthesize all gathered intelligence data to output an optimal ActionPlan.
        
        Grievance Report Details:
        - Report ID: {report.id}
        - Description: "{report.description or 'No description provided'}"
        - Location coordinates: {report.location.latitude}, {report.location.longitude}
        
        Verifications:
        - Visual Analysis: Issue Type: {vision.issue_type.value}, Severity: {vision.severity.value}, Safety Risk: {vision.safety_risk}
        - Authenticity Score: {verification.authenticity_score}/100, Consensus verified: {verification.community_consensus}
        
        Proximity Risk:
        - Rain forecast (7 days): {research_ctx.environmental.rainfall_7day_forecast}%
        - Proximity risk details: Proximity to School ({research_ctx.sensitivity.near_school}), Hospital ({research_ctx.sensitivity.near_hospital})
        - Utility lines in danger: {research_ctx.infrastructure.nearby_utilities}
        
        Governance Contacts:
        - Responsible Ward: {research_ctx.governance.ward_name} ({research_ctx.governance.ward_id})
        - Assigned Officer: {research_ctx.governance.officer_name} (Email: {research_ctx.governance.officer_email}, Phone: {research_ctx.governance.officer_phone})
        - Department: {research_ctx.governance.dept_name}
        
        Predicted Trajectory:
        - Risk Score: {prediction.risk_score}/100
        - 7-Day Trajectory: {prediction.severity_trajectory.get('7d', 'STABLE')}
        
        Tasks to output:
        1. Formulate sequential execution tasks (ActionTask). Standard types:
           - GENERATE_DOC: To draft the official complaint PDF. payload must include details for the document.
           - POST_DASHBOARD: To post tracking details to the real-time public portal.
           - SEND_EMAIL: To dispatch formal notification to the Ward Officer.
           - SEND_SMS: To send SMS reminder to the Councilor/Officer.
        2. Draft a `complaint_document_spec` detailing recipient name, title, subject_line, and 3 body_paragraphs summarizing the issue facts.
        3. Define a contact escalation ladder (e.g. Ward Officer -> Division Head -> District Commissioner) based on the district name.
        4. Setup a follow_up_schedule list of checkpoints (due_hours).
        
        Format output strictly as JSON matching the requested ActionPlan schema.
        """

        system_instruction = """
        You are the Planner Agent. Your job is to construct the perfect action sequence for resolving civic issues.
        Use formal, official, and authoritative tone in the document spec.
        Ensure task payloads contain all required fields for downstream processors (emails, phone numbers, PDF specs).
        """

        try:
            await self.log("Generating action strategy using Gemini Pro structured output...", "INFO", log_callback)
            plan = await generate_structured(
                prompt=prompt,
                response_schema=ActionPlan,
                use_pro=True,  # Pro is essential for complex planning/document specs
                system_instruction=system_instruction
            )
            
            await self.log(
                f"Action plan generated successfully. Created {len(plan.tasks)} sequential tasks. Escalation ladder configured with {len(plan.escalation_ladder)} tiers.",
                "SUCCESS",
                log_callback
            )
            return plan
            
        except Exception as e:
            await self.log(
                f"Gemini Planning inference failed: {e}. Generating default programmatic ActionPlan...",
                "WARNING",
                log_callback
            )
            fallback = self._get_fallback_action_plan(
                report, historical_ctx, research_ctx, verification, vision, prediction
            )
            await self.log(
                f"Programmatic fallback plan generated. Created {len(fallback.tasks)} sequential tasks.",
                "SUCCESS",
                log_callback
            )
            return fallback

def datetime_now_str() -> str:
    from datetime import datetime
    return datetime.utcnow().strftime("%B %d, %Y")
