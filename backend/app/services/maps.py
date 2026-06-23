import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

# Mock geocoding data for Bangalore/Pune regions commonly used in demos
MOCK_WARDS = [
    {
        "lat_min": 12.90, "lat_max": 12.95, "lng_min": 77.55, "lng_max": 77.62,
        "ward_id": "KA-BLR-W191", "ward_name": "Singasandra", "district": "Bangalore South"
    },
    {
        "lat_min": 12.95, "lat_max": 13.00, "lng_min": 77.60, "lng_max": 77.68,
        "ward_id": "KA-BLR-W150", "ward_name": "Koramangala 5th Block", "district": "Bangalore South"
    },
    {
        "lat_min": 18.50, "lat_max": 18.55, "lng_min": 73.80, "lng_max": 73.88,
        "ward_id": "MH-PNE-W12", "ward_name": "Shivajinagar", "district": "Pune Central"
    }
]

def get_mock_geocode(lat: float, lng: float) -> Dict[str, Any]:
    """Fallback local geocoder to prevent failures if no API key is supplied."""
    for ward in MOCK_WARDS:
        if ward["lat_min"] <= lat <= ward["lat_max"] and ward["lng_min"] <= lng <= ward["lng_max"]:
            return {
                "status": "OK",
                "address": f"{ward['ward_name']}, District: {ward['district']}, Karnataka, India",
                "ward_id": ward["ward_id"],
                "ward_name": ward["ward_name"],
                "district": ward["district"]
            }
            
    # Default fallback
    return {
        "status": "OK",
        "address": "Indiranagar, Bangalore East, Karnataka, 560038, India",
        "ward_id": "KA-BLR-W80",
        "ward_name": "Indiranagar",
        "district": "Bangalore East"
    }

async def reverse_geocode(lat: float, lng: float) -> Dict[str, Any]:
    """
    Query Google Maps Geocoding API to get address components,
    with a graceful mock fallback.
    """
    if not settings.GOOGLE_MAPS_API_KEY or settings.GOOGLE_MAPS_API_KEY == "your_google_maps_api_key_here":
        return get_mock_geocode(lat, lng)

    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={settings.GOOGLE_MAPS_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK" and data.get("results"):
                    result = data["results"][0]
                    address = result.get("formatted_address")
                    
                    # Parse ward/sublocality from address components
                    ward_name = None
                    district = None
                    
                    for component in result.get("address_components", []):
                        types = component.get("types", [])
                        if "sublocality" in types or "neighborhood" in types:
                            ward_name = component.get("long_name")
                        elif "administrative_area_level_2" in types:
                            district = component.get("long_name")
                            
                    # Fallback default values if not parsed
                    ward_name = ward_name or "Ward 68"
                    district = district or "Central District"
                    ward_id = f"LOC-WARD-{ward_name.upper().replace(' ', '-')[:8]}"

                    return {
                        "status": "OK",
                        "address": address,
                        "ward_id": ward_id,
                        "ward_name": ward_name,
                        "district": district
                    }
    except Exception as e:
        print(f"WARNING: Google Maps Geocoding failed: {e}. Using mock fallback.")
        
    return get_mock_geocode(lat, lng)
