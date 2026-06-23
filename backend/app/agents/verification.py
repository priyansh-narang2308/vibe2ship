import httpx
from typing import Optional, Tuple, Dict, Any, List
from app.agents.base import BaseAgent, LogCallback
from app.models.schemas import CitizenReport, VerificationResult, VisionAnalysis, IssueType, Severity, HistoricalContext
from app.services.gemini import generate_structured, get_pro_model
from app.services.firebase import get_bucket
import google.generativeai as genai
import json

class VerificationAgent(BaseAgent):
    def __init__(self):
        super().__init__("VerificationAgent")

    async def _download_media(self, media_url: str) -> Optional[bytes]:
        """Download image/video bytes from GCS, HTTP URLs, or read locally."""
        if not media_url:
            return None
            
        try:
            # Case 1: GCS URL (starts with gs://)
            if media_url.startswith("gs://"):
                path_without_gs = media_url[5:]
                parts = path_without_gs.split("/", 1)
                if len(parts) == 2:
                    blob_name = parts[1]
                    bucket = get_bucket()
                    blob = bucket.blob(blob_name)
                    return blob.download_as_bytes()
                    
            # Case 2: HTTP(S) URL
            elif media_url.startswith("http://") or media_url.startswith("https://"):
                async with httpx.AsyncClient() as client:
                    response = await client.get(media_url, timeout=10.0)
                    if response.status_code == 200:
                        return response.content
                        
            # Case 3: Local file path
            else:
                with open(media_url, "rb") as f:
                    return f.read()
        except Exception as e:
            self.logger.warning(f"Failed to download media from {media_url}: {e}")
            
        return None

    def _get_fallback_vision_analysis(self, report: CitizenReport) -> VisionAnalysis:
        """Fallback analysis if Gemini multimodal vision fails."""
        desc = (report.description or "").lower()
        
        issue_type = IssueType.OTHER
        severity = Severity.MEDIUM
        explanation = "Programmatic fallback applied due to API unavailability."
        
        if "pothole" in desc or "crater" in desc or "road" in desc:
            issue_type = IssueType.POTHOLE
            severity = Severity.HIGH
        elif "water" in desc or "leak" in desc or "pipe" in desc:
            issue_type = IssueType.WATER_LEAK
            severity = Severity.CRITICAL
        elif "light" in desc or "dark" in desc or "lamp" in desc:
            issue_type = IssueType.BROKEN_STREETLIGHT
            severity = Severity.LOW
        elif "garbage" in desc or "waste" in desc or "trash" in desc or "dump" in desc:
            issue_type = IssueType.WASTE
            severity = Severity.HIGH
            
        return VisionAnalysis(
            issue_type=issue_type,
            severity=severity,
            confidence_score=0.5,
            estimated_dimensions={"width_cm": 50, "depth_cm": 10},
            safety_risk=(severity in [Severity.HIGH, Severity.CRITICAL]),
            is_authentic=True,
            authenticity_explanation=explanation
        )

    async def compare_images(self, img1_bytes: bytes, img2_bytes: bytes) -> bool:
        """Use Gemini 1.5 Pro to verify if two images show the exact same physical issue/defect."""
        try:
            model = get_pro_model()
            prompt = """
            Compare these two images uploaded by citizens in the same neighborhood.
            Do they show the exact same physical issue (e.g., the exact same pothole, the exact same water leak, or the exact same broken light)?
            Respond in JSON format with a single boolean field: "is_same_issue".
            
            JSON schema: {"is_same_issue": boolean}
            """
            
            image_part_1 = {"mime_type": "image/jpeg", "data": img1_bytes}
            image_part_2 = {"mime_type": "image/jpeg", "data": img2_bytes}
            
            response = model.generate_content(
                [prompt, image_part_1, image_part_2],
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            
            result = json.loads(response.text)
            return bool(result.get("is_same_issue", False))
        except Exception as e:
            self.logger.warning(f"Failed to visually compare images: {e}")
            return False

    async def run(
        self,
        report: CitizenReport,
        historical_ctx: Optional[HistoricalContext] = None,
        log_callback: Optional[LogCallback] = None
    ) -> Tuple[VerificationResult, VisionAnalysis]:
        
        await self.log(f"Downloading citizen report media from: {report.media_url}...", "INFO", log_callback)
        media_bytes = await self._download_media(report.media_url)
        
        # 1. Base verification fallback if no media content is retrieved
        if not media_bytes:
            await self.log("No media file retrieved or invalid URL. Applying default textual classification...", "WARNING", log_callback)
            analysis = self._get_fallback_vision_analysis(report)
            result = VerificationResult(
                authenticity_score=50.0,
                credibility_tier="LOW",
                alert="No valid media attachment verified.",
                vision_analysis=analysis
            )
            return result, analysis

        await self.log("Analyzing image evidence using Gemini Multimodal Vision...", "INFO", log_callback)
        
        # Format the image parts for the Gemini API
        image_part = {
            "mime_type": "image/jpeg",
            "data": media_bytes
        }

        # Prompt for Gemini Pro 1.5 Vision analysis
        prompt = f"""
        You are the Multimodal Vision unit of the CivicPulse Verification Agent.
        Analyze this image uploaded by a citizen.

        Citizen description of the issue: "{report.description or 'No description provided'}"
        
        Tasks:
        1. Identify if this image represents a genuine civic infrastructure issue in a public space (POTHOLE, WATER_LEAK, BROKEN_STREETLIGHT, WASTE, ROAD_DAMAGE).
        2. Set is_authentic to false if the image is fake, unrelated (e.g. household interior, unrelated meme, generic animal), or AI generated.
        3. Assess the severity based on size and safety hazard.
        4. Estimate dimensions (e.g. pothole diameter/depth in cm, leakage area) if visible.
        5. Flag if it presents immediate safety risks to pedestrians or vehicles.
        6. Provide an authenticity explanation summarizing your visual observations.

        Return ONLY a JSON object that strictly adheres to the requested schema.
        """

        system_instruction = """
        You are a highly precise civic intelligence visual inspector. 
        Your job is to identify infrastructure defects, filter out fraudulent/fake reports, and estimate safety metrics.
        Return output matching the VisionAnalysis schema.
        """

        try:
            analysis = await generate_structured(
                prompt=[prompt, image_part],
                response_schema=VisionAnalysis,
                use_pro=True,
                system_instruction=system_instruction
            )
            
            auth_score = 100.0 if analysis.is_authentic else 10.0
            if analysis.confidence_score < 0.7:
                auth_score -= 20.0
                
            result = VerificationResult(
                authenticity_score=max(0.0, auth_score),
                credibility_tier="HIGH" if auth_score > 80 else "MEDIUM" if auth_score > 40 else "LOW",
                alert=None if analysis.is_authentic else "Suspicious image: possibly unrelated or fake.",
                vision_analysis=analysis
            )
            
            await self.log(
                f"Visual verification complete. Issue Type: {analysis.issue_type.value}, Severity: {analysis.severity.value}, Authenticity: {result.authenticity_score}/100",
                "SUCCESS",
                log_callback
            )
            
        except Exception as e:
            await self.log(f"Gemini Multimodal Vision API call failed: {e}. Running fallback...", "WARNING", log_callback)
            analysis = self._get_fallback_vision_analysis(report)
            result = VerificationResult(
                authenticity_score=70.0,
                credibility_tier="MEDIUM",
                alert="API failed. Textual heuristics applied.",
                vision_analysis=analysis
            )

        # 2. Cross-validation logic with historical reports
        if historical_ctx and historical_ctx.prior_reports:
            await self.log("Cross-referencing reported issue with nearby records for community validation...", "INFO", log_callback)
            
            cross_val_count = 0
            matching_report_id = None
            
            for prior in historical_ctx.prior_reports:
                # Check for active unresolved reports of the same type
                if prior.get("issue_type") == analysis.issue_type.value and prior.get("status") != "RESOLVED":
                    cross_val_count += 1
                    
                    # Try to visually compare images if a media URL is present
                    prior_media_url = prior.get("media_url")
                    if prior_media_url and media_bytes:
                        await self.log(f"Attempting visual similarity match with nearby report {prior.get('id')}...", "INFO", log_callback)
                        prior_bytes = await self._download_media(prior_media_url)
                        if prior_bytes:
                            is_same = await self.compare_images(media_bytes, prior_bytes)
                            if is_same:
                                matching_report_id = prior.get("id")
                                await self.log(
                                    f"Visual match CONFIRMED! This issue is the exact same entity as report {matching_report_id}.",
                                    "WARNING",
                                    log_callback
                                )
                                break

            result.cross_validation_count = cross_val_count
            if cross_val_count > 0 or matching_report_id:
                result.community_consensus = True
                # Elevate reputation tier
                result.credibility_tier = "VERIFIED"
                
                if matching_report_id:
                    result.alert = f"Duplicated issue detected. Links to active report ID {matching_report_id}."
                    # Boost score since it is verified to exist by a previous report
                    result.authenticity_score = 100.0
                else:
                    # Generic consensus boost
                    result.authenticity_score = min(100.0, result.authenticity_score + 10.0)
                    
                await self.log(
                    f"Community consensus verified! {cross_val_count} overlapping reports. Promoted credibility to VERIFIED.",
                    "SUCCESS",
                    log_callback
                )
            else:
                await self.log("No overlapping active reports found in immediate proximity. Independent report validated.", "INFO", log_callback)

        return result, analysis
