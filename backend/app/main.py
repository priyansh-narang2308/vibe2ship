import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.schemas import CitizenReport, IssueResult
from app.routers.ws import router as ws_router
from app.agents.orchestrator import CivicOrchestrator
from app.agents.escalation import EscalationAgent
from app.services.firebase import initialize_firebase
from app.services.database import get_all_issues
from datetime import datetime

# Initialize Firebase on startup
initialize_firebase()

app = FastAPI(
    title="CivicPulse API",
    description="Autonomous Civic Intelligence Platform Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ws_router, prefix="/api/v1")

orchestrator = CivicOrchestrator()
escalation_agent = EscalationAgent()

@app.get("/")
async def root():
    return {
        "status": "active",
        "service": "CivicPulse API",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }

@app.get("/api/v1/issues")
async def list_issues(limit: int = 50):
    """Retrieve all active civic issues from Firestore."""
    try:
        issues = await get_all_issues(limit=limit)
        return {"issues": issues, "count": len(issues)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve issues: {str(e)}"
        )

@app.post("/api/v1/report", response_model=IssueResult, status_code=status.HTTP_201_CREATED)
async def submit_report(report: CitizenReport):
    """
    Synchronous REST endpoint to submit a citizen report and execute the
    entire multi-agent pipeline immediately, returning the result.
    """
    try:
        result = await orchestrator.process_report(report=report)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent orchestration failed: {str(e)}"
        )

@app.post("/api/v1/escalation/check", status_code=status.HTTP_200_OK)
async def run_escalation_monitoring():
    """
    Trigger the Escalation Agent to run a full sweep across all active issues
    and perform SLA check updates and higher level escalations.
    """
    try:
        results = await escalation_agent.run()
        return {
            "status": "complete",
            "timestamp": datetime.utcnow().isoformat(),
            "actions_executed": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Escalation monitoring cycle failed: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
