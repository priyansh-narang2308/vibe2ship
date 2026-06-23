from typing import Optional, Dict
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import (
    CitizenReport, HistoricalContext, ResearchEnrichment, PredictionOutput
)
from app.services.gemini import generate_structured

class PredictionAgent(BaseAgent):
    def __init__(self):
        super().__init__("PredictionAgent")

    def _get_fallback_prediction(
        self,
        report: CitizenReport,
        historical_ctx: HistoricalContext,
        research_ctx: ResearchEnrichment
    ) -> PredictionOutput:
        """Calculate a deterministic fallback risk prediction in case the Gemini API fails/is unavailable."""
        issue_type_val = getattr(report, "issue_type", "OTHER")  # Fallback check if parsed earlier
        
        # Base risk calculation
        risk = 20.0
        
        # Adjust by issue type
        if issue_type_val in ["POTHOLE", "ROAD_DAMAGE", "WATER_LEAK"]:
            risk += 25.0
        elif issue_type_val == "BROKEN_STREETLIGHT":
            risk += 15.0
            
        # Adjust by weather (monsoon risk)
        rain_prob = research_ctx.environmental.rainfall_7day_forecast
        if rain_prob > 70:
            risk += 20.0
        elif rain_prob > 30:
            risk += 10.0
            
        # Adjust by community/history
        if historical_ctx.is_chronic:
            risk += 15.0
            
        # Adjust by sensitive zones
        if research_ctx.sensitivity.near_hospital:
            risk += 15.0
        if research_ctx.sensitivity.near_school:
            risk += 10.0
        if research_ctx.sensitivity.near_market:
            risk += 10.0
            
        # Adjust by utility proximity
        if research_ctx.infrastructure.risk_of_secondary_damage:
            risk += 15.0
            
        # Cap risk between 10 and 98
        risk = max(10.0, min(98.0, risk))
        
        # Heuristic trajectory
        trajectory = {
            "24h": "STABLE",
            "7d": "WORSENING" if (rain_prob > 50 or risk > 50) else "STABLE",
            "30d": "CRITICAL" if (risk > 60 or historical_ctx.is_chronic) else "WORSENING"
        }
        
        # Heuristic estimates
        pop_multiplier = 1
        if research_ctx.sensitivity.near_school: pop_multiplier += 2
        if research_ctx.sensitivity.near_hospital: pop_multiplier += 3
        if research_ctx.sensitivity.near_market: pop_multiplier += 4
        
        pop_affected = 150 * pop_multiplier
        daily_cost = round(risk * 150.0, 2)  # In local currency (e.g. INR)
        
        return PredictionOutput(
            risk_score=risk,
            severity_trajectory=trajectory,
            economic_impact_estimate=daily_cost,
            population_affected_estimate=pop_affected,
            cluster_alert=len(historical_ctx.prior_reports) >= 3
        )

    async def run(
        self,
        report: CitizenReport,
        historical_ctx: HistoricalContext,
        research_ctx: ResearchEnrichment,
        issue_type_override: Optional[str] = None,
        log_callback: Optional[LogCallback] = None
    ) -> PredictionOutput:
        
        await self.log("Starting predictive analysis of the issue...", "INFO", log_callback)
        
        issue_type = issue_type_override or "POTHOLE"  # Default if not verified yet
        
        # Construct the prompt context
        prompt_context = f"""
        Analyze the following civic issue data and predict safety/failure risks.
        
        Issue details:
        - Issue Type: {issue_type}
        - Citizen Description: "{report.description or 'No description provided'}"
        
        Geographic and Environmental Context:
        - Coordinates: Lat {report.location.latitude}, Lng {report.location.longitude}
        - Location Address: {research_ctx.governance.ward_name}, District {research_ctx.governance.district}
        - 7-Day Precipitation Forecast: {research_ctx.environmental.rainfall_7day_forecast}%
        - Local Sensitivity Flags: Near School: {research_ctx.sensitivity.near_school}, Near Hospital: {research_ctx.sensitivity.near_hospital}, Near Market: {research_ctx.sensitivity.near_market}
        
        Infrastructure Proximity:
        - Underground utilities: {', '.join(research_ctx.infrastructure.nearby_utilities) if research_ctx.infrastructure.nearby_utilities else 'None'}
        - Utility Damage Risk: {research_ctx.infrastructure.risk_of_secondary_damage}
        
        Historical Context:
        - Prior issues in area: {len(historical_ctx.prior_reports)}
        - Average resolution speed: {historical_ctx.avg_resolution_days} days
        - Chronic issue pattern: {historical_ctx.is_chronic}
        - Submitting citizen reliability rating: {historical_ctx.citizen_reliability_score}/100
        """
        
        system_instruction = """
        You are the Prediction Agent for CivicPulse. 
        Your role is to calculate a composite 0-100 risk score, a 30-day severity trajectory, and estimates for daily economic cost of inaction (in local currency/INR) and population affected.
        Be analytical and consider weather factors (e.g. rain heavily accelerates road/water pipe failure).
        Return output ONLY as a valid JSON object matching the requested schema.
        """

        try:
            await self.log("Generating risk models using Gemini Flash inference...", "INFO", log_callback)
            prediction = await generate_structured(
                prompt=prompt_context,
                response_schema=PredictionOutput,
                use_pro=False,  # Use Flash for speed
                system_instruction=system_instruction
            )
            
            await self.log(
                f"Prediction model generated. Risk Score: {prediction.risk_score}/100, Est. Daily Cost: INR {prediction.economic_impact_estimate}, Impacted Population: {prediction.population_affected_estimate} citizens",
                "SUCCESS",
                log_callback
            )
            return prediction
            
        except Exception as e:
            await self.log(
                f"Gemini API failure during prediction: {e}. Executing fallback heuristics...",
                "WARNING",
                log_callback
            )
            fallback = self._get_fallback_prediction(report, historical_ctx, research_ctx)
            await self.log(
                f"Fallback model generated. Risk Score: {fallback.risk_score}/100, Est. Daily Cost: INR {fallback.economic_impact_estimate}, Impacted Population: {fallback.population_affected_estimate} citizens",
                "SUCCESS",
                log_callback
            )
            return fallback
