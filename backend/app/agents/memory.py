from typing import Optional, Any, Dict, List
from datetime import datetime, timedelta
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import GPSCoordinates, IssueType, HistoricalContext
from app.services.database import get_issues_in_radius, get_citizen_profile

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__("MemoryAgent")

    async def run(
        self,
        location: GPSCoordinates,
        issue_type: IssueType,
        citizen_id: str,
        log_callback: Optional[LogCallback] = None
    ) -> HistoricalContext:
        
        await self.log(
            f"Retrieving historical context for coordinates ({location.latitude}, {location.longitude}) and issue type '{issue_type.value}'...",
            "INFO",
            log_callback
        )
        
        # 1. Fetch prior reports within a 200-meter radius
        # Typically, chronic issues like potholes or leaks occur in the exact same spot or very close
        radius_meters = 200.0
        try:
            nearby_issues = await get_issues_in_radius(
                location.latitude,
                location.longitude,
                radius_meters
            )
            await self.log(
                f"Found {len(nearby_issues)} reports in the last 90 days within a {radius_meters}m radius.",
                "INFO",
                log_callback
            )
        except Exception as e:
            await self.log(
                f"Error retrieving issues from database: {e}",
                "ERROR",
                log_callback
            )
            nearby_issues = []

        # 2. Analyze prior reports and calculate stats
        prior_reports = []
        resolution_times = []
        same_type_count = 0
        
        for issue in nearby_issues:
            # We want to format the issue dictionary nicely for context
            created_at = issue.get("created_at")
            resolved_at = issue.get("resolved_at")
            
            # Count issues of the same type to check for chronic patterns
            if issue.get("issue_type") == issue_type.value:
                same_type_count += 1
            
            # Calculate resolution time if it has been resolved
            if resolved_at and created_at:
                try:
                    # Handle both datetime objects and string formats
                    if isinstance(created_at, str):
                        c_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    else:
                        c_dt = created_at
                        
                    if isinstance(resolved_at, str):
                        r_dt = datetime.fromisoformat(resolved_at.replace("Z", "+00:00"))
                    else:
                        r_dt = resolved_at
                        
                    delta = r_dt - c_dt
                    resolution_times.append(delta.total_seconds() / (24 * 3600))  # in days
                except Exception as e:
                    self.logger.warning(f"Error parsing dates for issue {issue.get('id')}: {e}")

            prior_reports.append({
                "id": issue.get("id"),
                "issue_type": issue.get("issue_type"),
                "status": issue.get("status"),
                "created_at": str(created_at),
                "distance_meters": round(issue.get("distance_meters", 0.0), 1),
                "media_url": issue.get("media_url"),
                "description": issue.get("description")
            })

        # Calculate average resolution time in days
        avg_res_days = 0.0
        if resolution_times:
            avg_res_days = round(sum(resolution_times) / len(resolution_times), 1)

        # Chronic flag: if there have been 3 or more issues of the same type in this radius
        is_chronic = same_type_count >= 3
        if is_chronic:
            await self.log(
                f"ALERT: Chronic issue pattern detected! Same type '{issue_type.value}' has occurred {same_type_count} times in this area.",
                "WARNING",
                log_callback
            )

        # 3. Retrieve citizen reliability score
        citizen_score = 100.0
        try:
            profile = await get_citizen_profile(citizen_id)
            if profile:
                citizen_score = profile.get("reliability_score", 100.0)
                await self.log(
                    f"Citizen reliability profile loaded. Score: {citizen_score}/100",
                    "INFO",
                    log_callback
                )
            else:
                await self.log(
                    f"No existing profile found for citizen {citizen_id}. Defaulting reliability score to 100.",
                    "INFO",
                    log_callback
                )
        except Exception as e:
            await self.log(
                f"Error retrieving citizen profile: {e}. Defaulting to 100.",
                "WARNING",
                log_callback
            )

        context = HistoricalContext(
            prior_reports=prior_reports,
            avg_resolution_days=avg_res_days,
            is_chronic=is_chronic,
            citizen_reliability_score=citizen_score
        )

        await self.log(
            "Historical context retrieval complete.",
            "SUCCESS",
            log_callback
        )
        return context
