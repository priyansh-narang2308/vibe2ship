import httpx
from typing import Dict, Any

async def get_weather_forecast(lat: float, lng: float) -> Dict[str, Any]:
    """
    Fetch weather forecast from Open-Meteo (public API, no key required).
    Returns temperature and 7-day max rain probability.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true&daily=precipitation_probability_max&timezone=auto"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current_weather", {})
                daily = data.get("daily", {})
                
                # Get max precipitation probability in next 7 days
                rain_probs = daily.get("precipitation_probability_max", [])
                max_rain_prob = max(rain_probs) if rain_probs else 0.0
                
                return {
                    "temp": current.get("temperature"),
                    "humidity": None,  # Open-meteo current doesn't include humidity without extra params
                    "rainfall_7day_forecast": float(max_rain_prob)
                }
    except Exception as e:
        print(f"WARNING: Weather API lookup failed: {e}. Returning default summer values.")
        
    return {
        "temp": 30.0,
        "humidity": 65.0,
        "rainfall_7day_forecast": 10.0  # low default risk
    }
