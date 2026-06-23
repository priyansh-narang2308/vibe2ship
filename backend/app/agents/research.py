from typing import Optional
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import (
    GPSCoordinates, IssueType, ResearchEnrichment, 
    GovernanceContext, InfrastructureContext, EnvironmentalContext, SensitivityFlags
)
from app.services.maps import reverse_geocode
from app.services.govt_directory import lookup_government_officer, query_infrastructure_risk
from app.services.weather import get_weather_forecast

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__("ResearchAgent")

    async def run(
        self,
        location: GPSCoordinates,
        issue_type: IssueType,
        log_callback: Optional[LogCallback] = None
    ) -> ResearchEnrichment:
        
        await self.log(
            f"Starting research phase for coordinates ({location.latitude}, {location.longitude})...",
            "INFO",
            log_callback
        )

        # 1. Reverse geocode to find ward details
        await self.log("Performing reverse geocoding to identify municipal boundaries...", "INFO", log_callback)
        geo_data = await reverse_geocode(location.latitude, location.longitude)
        ward_id = geo_data.get("ward_id")
        ward_name = geo_data.get("ward_name")
        district = geo_data.get("district")
        address = geo_data.get("address")
        
        await self.log(
            f"Geocoded location to: Address: '{address}', Ward: '{ward_name}' ({ward_id}), District: '{district}'",
            "INFO",
            log_callback
        )

        # 2. Look up the assigned government officer and department contacts
        await self.log(f"Querying municipal directory for '{issue_type.value}' division contacts in {ward_name}...", "INFO", log_callback)
        officer_data = lookup_government_officer(ward_id, issue_type.value)
        
        gov_ctx = GovernanceContext(
            ward_id=ward_id,
            ward_name=ward_name,
            dept_id=officer_data["dept_id"],
            dept_name=officer_data["dept_name"],
            officer_name=officer_data["officer_name"],
            officer_email=officer_data["officer_email"],
            officer_phone=officer_data["officer_phone"]
        )
        
        await self.log(
            f"Assigned department: {gov_ctx.dept_name}. Assigned officer: {gov_ctx.officer_name} ({gov_ctx.officer_email})",
            "INFO",
            log_callback
        )

        # 3. Check for underground infrastructure risks
        await self.log("Checking underground infrastructure layers (water mains, gas lines, power cables)...", "INFO", log_callback)
        infra_data = query_infrastructure_risk(location.latitude, location.longitude, issue_type.value)
        
        infra_ctx = InfrastructureContext(
            nearby_utilities=infra_data["nearby_utilities"],
            risk_of_secondary_damage=infra_data["risk_of_secondary_damage"]
        )
        
        if infra_ctx.risk_of_secondary_damage:
            await self.log(
                f"WARNING: Proximity risk! Found critical utilities: {', '.join(infra_ctx.nearby_utilities)}. Risk of secondary damage is HIGH.",
                "WARNING",
                log_callback
            )
        else:
            await self.log("No critical underground utility lines detected in immediate proximity.", "INFO", log_callback)

        # 4. Fetch weather forecast for risk evaluation
        await self.log("Retrieving environmental data and rain forecasts...", "INFO", log_callback)
        weather_data = await get_weather_forecast(location.latitude, location.longitude)
        
        env_ctx = EnvironmentalContext(
            rainfall_7day_forecast=weather_data["rainfall_7day_forecast"],
            temp=weather_data["temp"],
            humidity=weather_data["humidity"]
        )
        
        await self.log(
            f"Environmental data retrieved. Temperature: {env_ctx.temp or 'N/A'}°C, 7-day max rain probability: {env_ctx.rainfall_7day_forecast}%",
            "INFO",
            log_callback
        )

        # 5. Evaluate local sensitivity (proximity to schools, hospitals, markets)
        await self.log("Scanning local Point of Interest (POI) sensitivity map...", "INFO", log_callback)
        # Mock sensitivity flags based on coordinate hashes
        hash_val = int((location.latitude + location.longitude) * 1000)
        sensitivity = SensitivityFlags(
            near_school=(hash_val % 3 == 0),
            near_hospital=(hash_val % 5 == 0),
            near_market=(hash_val % 7 == 0)
        )
        
        flags = []
        if sensitivity.near_school: flags.append("School Zone")
        if sensitivity.near_hospital: flags.append("Hospital Zone")
        if sensitivity.near_market: flags.append("Market Area")
        
        if flags:
            await self.log(f"ALERT: Issue is located inside a sensitive area: {', '.join(flags)}.", "WARNING", log_callback)
        else:
            await self.log("No high-sensitivity public zones detected within immediate range.", "INFO", log_callback)

        enrichment = ResearchEnrichment(
            governance=gov_ctx,
            infrastructure=infra_ctx,
            environmental=env_ctx,
            sensitivity=sensitivity
        )

        await self.log(
            "Research and data enrichment complete.",
            "SUCCESS",
            log_callback
        )
        return enrichment
