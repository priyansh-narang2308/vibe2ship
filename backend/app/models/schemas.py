from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class IssueType(str, Enum):
    POTHOLE = "POTHOLE"
    WATER_LEAK = "WATER_LEAK"
    BROKEN_STREETLIGHT = "BROKEN_STREETLIGHT"
    WASTE = "WASTE"
    ROAD_DAMAGE = "ROAD_DAMAGE"
    OTHER = "OTHER"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IssueStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    ANALYZING = "ANALYZING"
    VERIFYING = "VERIFYING"
    PLANNING = "PLANNING"
    EXECUTING = "EXECUTING"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"

class GPSCoordinates(BaseModel):
    latitude: float
    longitude: float

class CitizenReport(BaseModel):
    id: str
    citizen_id: str
    media_url: str
    location: GPSCoordinates
    description: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HistoricalContext(BaseModel):
    prior_reports: List[Dict[str, Any]] = []
    avg_resolution_days: float = 0.0
    is_chronic: bool = False
    citizen_reliability_score: float = 100.0

class GovernanceContext(BaseModel):
    ward_id: str
    ward_name: str
    dept_id: str
    dept_name: str
    officer_name: str
    officer_email: str
    officer_phone: str

class InfrastructureContext(BaseModel):
    nearby_utilities: List[str] = []
    risk_of_secondary_damage: bool = False

class EnvironmentalContext(BaseModel):
    rainfall_7day_forecast: float = 0.0  # percentage probability
    temp: Optional[float] = None
    humidity: Optional[float] = None

class SensitivityFlags(BaseModel):
    near_school: bool = False
    near_hospital: bool = False
    near_market: bool = False

class ResearchEnrichment(BaseModel):
    governance: GovernanceContext
    infrastructure: InfrastructureContext
    environmental: EnvironmentalContext
    sensitivity: SensitivityFlags

class PredictionOutput(BaseModel):
    risk_score: float = 0.0  # 0 to 100
    severity_trajectory: Dict[str, str] = {}  # e.g., {"24h": "STABLE", "7d": "WORSENING"}
    economic_impact_estimate: float = 0.0  # cost in local currency/USD
    population_affected_estimate: int = 0
    cluster_alert: bool = False

class VisionAnalysis(BaseModel):
    issue_type: IssueType
    severity: Severity
    confidence_score: float = 1.0
    estimated_dimensions: Dict[str, Any] = {}
    safety_risk: bool = False
    is_authentic: bool = True
    authenticity_explanation: str = ""

class VerificationResult(BaseModel):
    authenticity_score: float = 100.0  # 0 to 100
    community_consensus: bool = False
    credibility_tier: str = "MEDIUM"  # LOW, MEDIUM, HIGH, VERIFIED
    cross_validation_count: int = 0
    alert: Optional[str] = None
    vision_analysis: Optional[VisionAnalysis] = None

class ActionTask(BaseModel):
    task_id: str
    action_type: str  # e.g., "GENERATE_DOC", "SEND_EMAIL", "SEND_SMS", "POST_DASHBOARD"
    status: str = "PENDING"  # PENDING, COMPLETED, FAILED
    payload: Dict[str, Any] = {}
    timestamp: Optional[datetime] = None

class ActionPlan(BaseModel):
    tasks: List[ActionTask]
    complaint_document_spec: Dict[str, Any]
    escalation_ladder: List[Dict[str, Any]]
    follow_up_schedule: List[Dict[str, Any]]

class IssueResult(BaseModel):
    issue_id: str
    status: IssueStatus
    priority_score: float
    action_plan: ActionPlan
    tracking_url: str
