import asyncio
from typing import Optional, Dict, Any, Callable
from app.agents.base import LogCallback
from app.models.schemas import CitizenReport, IssueResult, IssueStatus
from app.agents.memory import MemoryAgent
from app.agents.research import ResearchAgent
from app.agents.verification import VerificationAgent
from app.agents.prediction import PredictionAgent
from app.agents.planner import PlannerAgent
from app.agents.execution import ExecutionAgent

class CivicOrchestrator:
    def __init__(self):
        self.memory_agent = MemoryAgent()
        self.research_agent = ResearchAgent()
        self.verification_agent = VerificationAgent()
        self.prediction_agent = PredictionAgent()
        self.planner_agent = PlannerAgent()
        self.execution_agent = ExecutionAgent()

    async def process_report(
        self,
        report: CitizenReport,
        log_callback: Optional[LogCallback] = None
    ) -> IssueResult:
        """
        Coordinate the 5-phase multi-agent processing pipeline:
        1. Parallel Context: Memory + Research
        2. Verification: Auditing + Proximity Cross-Check
        3. Prediction: Risk Trajectory
        4. Strategic Plan: Planner
        5. Execution: Dispatch
        """
        if log_callback:
            await log_callback("Orchestrator", f"Initializing multi-agent pipeline for Report ID: {report.id}...", "INFO")

        # Phase 1: Parallel Intelligence Gathering
        if log_callback:
            await log_callback("Orchestrator", "PHASE 1: Launching Memory and Research agents in parallel...", "INFO")
            
        # We temporarily assume a default issue type for geolookup and matching prior to vision verification
        initial_type = report.description or "POTHOLE"
        
        # Async parallel execution of Memory & Research
        memory_task = self.memory_agent.run(
            location=report.location,
            issue_type=initial_type,
            citizen_id=report.citizen_id,
            log_callback=log_callback
        )
        research_task = self.research_agent.run(
            location=report.location,
            issue_type=initial_type,
            log_callback=log_callback
        )
        
        memory_ctx, research_ctx = await asyncio.gather(memory_task, research_task)

        # Phase 2: Multimodal Verification
        if log_callback:
            await log_callback("Orchestrator", "PHASE 2: Launching Verification Agent for visual analysis...", "INFO")
            
        verification, vision = await self.verification_agent.run(
            report=report,
            historical_ctx=memory_ctx,
            log_callback=log_callback
        )

        # Phase 3: Proactive Risk Prediction
        if log_callback:
            await log_callback("Orchestrator", "PHASE 3: Launching Prediction Agent for risk/impact modeling...", "INFO")
            
        prediction = await self.prediction_agent.run(
            report=report,
            historical_ctx=memory_ctx,
            research_ctx=research_ctx,
            issue_type_override=vision.issue_type.value,
            log_callback=log_callback
        )

        # Phase 4: Strategic Action Planning
        if log_callback:
            await log_callback("Orchestrator", "PHASE 4: Launching Planner Agent for task synthesis...", "INFO")
            
        action_plan = await self.planner_agent.run(
            report=report,
            historical_ctx=memory_ctx,
            research_ctx=research_ctx,
            verification=verification,
            vision=vision,
            prediction=prediction,
            log_callback=log_callback
        )

        # Phase 5: Autonomous Dispatch
        if log_callback:
            await log_callback("Orchestrator", "PHASE 5: Launching Execution Agent to execute task sequences...", "INFO")
            
        original_report_dict = {
            "id": report.id,
            "citizen_id": report.citizen_id,
            "media_url": report.media_url,
            "location": report.location.model_dump(),
            "description": report.description,
            "timestamp": report.timestamp.isoformat(),
            "issue_type": vision.issue_type.value,
            "severity": vision.severity.value,
            "safety_risk": vision.safety_risk,
            "address": research_ctx.governance.ward_name,
            "district": research_ctx.governance.district,
            "ward_id": research_ctx.governance.ward_id,
            "reliability_score": memory_ctx.citizen_reliability_score,
            "risk_score": prediction.risk_score
        }

        # Run the Execution Agent logic
        await self.execution_agent.run(
            action_plan=action_plan,
            original_report_data=original_report_dict,
            log_callback=log_callback
        )

        tracking_url = f"/track/{report.id}"
        if log_callback:
            await log_callback("Orchestrator", f"Pipeline execution complete. Issue tracked at {tracking_url}", "SUCCESS")

        return IssueResult(
            issue_id=report.id,
            status=IssueStatus.EXECUTING,
            priority_score=prediction.risk_score,
            action_plan=action_plan,
            tracking_url=tracking_url
        )
