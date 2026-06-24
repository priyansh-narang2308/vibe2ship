import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.services.firebase import get_db
from google.cloud import firestore

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the distance in meters between two GPS coordinates."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

async def get_issues_in_radius(latitude: float, longitude: float, radius_meters: float) -> List[Dict[str, Any]]:
    """
    Get all issues within a radial distance (meters).
    Uses a bounding box query on latitude first to respect Firestore inequality limits,
    then filters on longitude and exact distance client-side.
    """
    db = get_db()
    if db is None:
        return []

    # 1 degree of lat ~ 111,000 meters
    delta_lat = radius_meters / 111000.0
    lat_min = latitude - delta_lat
    lat_max = latitude + delta_lat

    # Bounding box longitude approximation
    # 1 degree of lng ~ 111,000 * cos(lat) meters
    cos_lat = math.cos(math.radians(latitude))
    if cos_lat > 0:
        delta_lng = radius_meters / (111000.0 * cos_lat)
    else:
        delta_lng = radius_meters / 111000.0
    
    lng_min = longitude - delta_lng
    lng_max = longitude + delta_lng

    # Query Firestore by latitude range
    issues_ref = db.collection("issues")
    query = issues_ref.where(filter=firestore.FieldFilter("location.latitude", ">=", lat_min)) \
                      .where(filter=firestore.FieldFilter("location.latitude", "<=", lat_max))
    
    docs = query.stream()
    
    nearby_issues = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        
        doc_location = data.get("location", {})
        doc_lat = doc_location.get("latitude")
        doc_lng = doc_location.get("longitude")
        
        if doc_lat is not None and doc_lng is not None:
            # Filter by longitude bounding box
            if lng_min <= doc_lng <= lng_max:
                # Calculate exact distance
                dist = haversine_distance(latitude, longitude, doc_lat, doc_lng)
                if dist <= radius_meters:
                    data["distance_meters"] = dist
                    nearby_issues.append(data)
                    
    return nearby_issues

async def get_citizen_profile(citizen_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a citizen's profile from Firestore."""
    db = get_db()
    if db is None:
        return None
    
    doc_ref = db.collection("citizens").document(citizen_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None

async def create_citizen_profile(citizen_id: str, name: str, email: str) -> Dict[str, Any]:
    """Create a new citizen profile."""
    db = get_db()
    if db is None:
        raise Exception("Database not initialized")
        
    doc_ref = db.collection("citizens").document(citizen_id)
    profile = {
        "name": name,
        "email": email,
        "reliability_score": 100.0,
        "reports_submitted": 0,
        "reports_verified": 0,
        "reports_false": 0,
        "xp": 0,
        "badges": [],
        "created_at": firestore.SERVER_TIMESTAMP
    }
    doc_ref.set(profile)
    profile["id"] = citizen_id
    return profile

async def update_citizen_reputation(citizen_id: str, reliability_delta: float, xp_delta: int = 0) -> None:
    """Update citizen reliability score and XP."""
    db = get_db()
    if db is None:
        return
        
    doc_ref = db.collection("citizens").document(citizen_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        new_reliability = max(0.0, min(100.0, data.get("reliability_score", 100.0) + reliability_delta))
        new_xp = max(0, data.get("xp", 0) + xp_delta)
        
        doc_ref.update({
            "reliability_score": new_reliability,
            "xp": new_xp
        })

async def create_issue(issue_id: str, issue_data: Dict[str, Any]) -> None:
    """Store a newly created civic issue report."""
    db = get_db()
    if db is None:
        raise Exception("Database not initialized")
        
    doc_ref = db.collection("issues").document(issue_id)
    # Add server timestamp if not present
    if "created_at" not in issue_data:
        issue_data["created_at"] = firestore.SERVER_TIMESTAMP
    doc_ref.set(issue_data)

async def update_issue_status(issue_id: str, status: str, log_entry: Optional[Dict[str, Any]] = None) -> None:
    """Update issue status and append to the agent logs."""
    db = get_db()
    if db is None:
        return
        
    doc_ref = db.collection("issues").document(issue_id)
    updates = {"status": status}
    
    if log_entry:
        log_entry["timestamp"] = datetime.utcnow().isoformat()
        updates["agent_logs"] = firestore.ArrayUnion([log_entry])
        
    doc_ref.update(updates)

async def get_all_issues(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve all issues from Firestore, ordered by creation time descending."""
    db = get_db()
    if db is None:
        return []
    
    issues_ref = db.collection("issues")
    query = issues_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
    
    issues = []
    for doc in query.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        # Convert Timestamp objects to ISO strings for JSON serialization
        for key, val in data.items():
            if hasattr(val, "isoformat"):
                data[key] = val.isoformat()
        issues.append(data)
    
    return issues
