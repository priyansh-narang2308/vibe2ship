from typing import Dict, Any, Optional

# Mock Government Directory mapping: Ward ID -> Issue Type -> Department & Officer
GOVT_DIRECTORY = {
    "KA-BLR-W191": {
        "POTHOLE": {
            "dept_id": "BBMP-RD",
            "dept_name": "BBMP Roads Division",
            "officer_name": "Anoop Kumar",
            "officer_email": "anoop.roads.bbmp@gmail.com",
            "officer_phone": "+91 98450 11223"
        },
        "WATER_LEAK": {
            "dept_id": "BWSSB-WD",
            "dept_name": "BWSSB Water Division",
            "officer_name": "Manjunath Swamy",
            "officer_email": "manjunath.bwssb@gmail.com",
            "officer_phone": "+91 98450 44556"
        },
        "BROKEN_STREETLIGHT": {
            "dept_id": "BESCOM-ED",
            "dept_name": "BESCOM Electrical Division",
            "officer_name": "Savitha Rao",
            "officer_email": "savitha.bescom@gmail.com",
            "officer_phone": "+91 98450 77889"
        },
        "WASTE": {
            "dept_id": "BBMP-SWM",
            "dept_name": "BBMP Solid Waste Management",
            "officer_name": "Kiran Hegde",
            "officer_email": "kiran.swm.bbmp@gmail.com",
            "officer_phone": "+91 98450 99001"
        }
    },
    "KA-BLR-W150": {
        "POTHOLE": {
            "dept_id": "BBMP-RD-KOR",
            "dept_name": "BBMP Koramangala Roads Division",
            "officer_name": "Suresh Chandra",
            "officer_email": "suresh.chandra.bbmp@gmail.com",
            "officer_phone": "+91 99000 12345"
        },
        "WATER_LEAK": {
            "dept_id": "BWSSB-KOR",
            "dept_name": "BWSSB Koramangala Maintenance",
            "officer_name": "Ramesh Rao",
            "officer_email": "ramesh.bwssb.kor@gmail.com",
            "officer_phone": "+91 99000 67890"
        },
        "BROKEN_STREETLIGHT": {
            "dept_id": "BESCOM-KOR",
            "dept_name": "BESCOM Koramangala Electrical",
            "officer_name": "Meera Nair",
            "officer_email": "meera.bescom.kor@gmail.com",
            "officer_phone": "+91 99000 54321"
        },
        "WASTE": {
            "dept_id": "BBMP-SWM-KOR",
            "dept_name": "BBMP Koramangala Waste Division",
            "officer_name": "Venkatesh Prasad",
            "officer_email": "venkatesh.swm.kor@gmail.com",
            "officer_phone": "+91 99000 98765"
        }
    }
}

# General Fallback contacts for issues outside our specific mocks
FALLBACK_CONTACTS = {
    "POTHOLE": {
        "dept_id": "GEN-RD",
        "dept_name": "Municipal Roads & Infrastructure",
        "officer_name": "Rajesh Gupta",
        "officer_email": "rajesh.gupta.roads@gmail.com",
        "officer_phone": "+91 90000 11111"
    },
    "WATER_LEAK": {
        "dept_id": "GEN-WD",
        "dept_name": "Municipal Water Supply Board",
        "officer_name": "Asha Patil",
        "officer_email": "asha.patil.water@gmail.com",
        "officer_phone": "+91 90000 22222"
    },
    "BROKEN_STREETLIGHT": {
        "dept_id": "GEN-ED",
        "dept_name": "Municipal Electrical Dept",
        "officer_name": "Prakash Joshi",
        "officer_email": "prakash.joshi.elec@gmail.com",
        "officer_phone": "+91 90000 33333"
    },
    "WASTE": {
        "dept_id": "GEN-SWM",
        "dept_name": "Municipal Solid Waste Authority",
        "officer_name": "Vikram Sen",
        "officer_email": "vikram.sen.waste@gmail.com",
        "officer_phone": "+91 90000 44444"
    },
    "OTHER": {
        "dept_id": "GEN-ADMIN",
        "dept_name": "Municipal Grievance Cell",
        "officer_name": "Grievance Officer",
        "officer_email": "grievances.city@gmail.com",
        "officer_phone": "+91 90000 55555"
    }
}

def lookup_government_officer(ward_id: str, issue_type: str) -> Dict[str, Any]:
    """Retrieve government officer contact information based on location and issue type."""
    # Look for exact match in our directory
    if ward_id in GOVT_DIRECTORY:
        ward_contacts = GOVT_DIRECTORY[ward_id]
        if issue_type in ward_contacts:
            return ward_contacts[issue_type]
            
    # Return general fallback based on issue type
    return FALLBACK_CONTACTS.get(issue_type, FALLBACK_CONTACTS["OTHER"])

# Mock infrastructure database
def query_infrastructure_risk(latitude: float, longitude: float, issue_type: str) -> Dict[str, Any]:
    """Check if any utilities or critical infrastructures are nearby."""
    # Simple mock heuristic based on lat/lng remainder
    checksum = int((latitude + longitude) * 1000) % 5
    
    nearby_utilities = []
    risk_of_secondary_damage = False
    
    if issue_type == "POTHOLE" or issue_type == "ROAD_DAMAGE":
        if checksum == 1:
            nearby_utilities = ["Underground Water Main (2m below)"]
            risk_of_secondary_damage = True
        elif checksum == 2:
            nearby_utilities = ["High Voltage Power Cable (1.5m below)"]
            risk_of_secondary_damage = True
        elif checksum == 3:
            nearby_utilities = ["Gas Pipe (0.8m below)"]
            risk_of_secondary_damage = True
    elif issue_type == "WATER_LEAK":
        nearby_utilities = ["Telecom Fiber Optic Conduit"]
        risk_of_secondary_damage = True
        
    return {
        "nearby_utilities": nearby_utilities,
        "risk_of_secondary_damage": risk_of_secondary_damage
    }
