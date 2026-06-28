# CivicPulse — Project Description

> **Vibe2Ship Hackathon | Community Hero — Hyperlocal Problem Solver**
> **Team Submission | June 2026**

---

## 1. Problem Statement Selected

**Community Hero — Hyperlocal Problem Solver**

Every city on Earth has the same problem: broken infrastructure, frustrated citizens, and overwhelmed governments. In India alone, 47 million potholes are reported annually — yet less than 30% are resolved within 90 days. Not because governments are malicious, but because the system is structurally broken:

- **Citizens** have no easy way to report. Government portals are buried, require account creation, and accept only text — no photo evidence, no GPS coordinates.
- **Reports disappear into a void.** No tracking, no status updates, no accountability. Citizens file complaints and never hear back.
- **Governments are flooded** with unstructured, unverified, duplicate complaints across WhatsApp, phone calls, email, and in-person visits. There is no way to prioritize.
- **No one follows up.** The citizen who reported the pothole 3 months ago has no mechanism to check if anyone is even working on it.

The result: a $2.5 trillion global smart city market where the most basic citizen-to-government communication channel is still broken.

---

## 2. Solution Overview

**CivicPulse** is an autonomous civic intelligence platform powered by 7 collaborating AI agents built on Google Gemini. It transforms how communities identify, report, validate, track, and resolve public infrastructure failures.

The core innovation: **the agents do not wait for humans.** Once a citizen submits a 30-second photo report, the system autonomously runs through the entire pipeline — analysis, validation, risk scoring, planning, document generation, email/SMS dispatch, and escalation monitoring — without requiring any government intervention in the submission pipeline.

**The 30-second citizen flow:**

1. Open CivicPulse → Take a photo or upload evidence
2. GPS auto-detects location (or manual pin drop)
3. Add optional voice/description → Submit

**What happens next (autonomous, no human required):**

```
[Phase 1 — Parallel Intelligence]
  Memory Agent → Queries Firestore for history at this GPS (200m radius)
  Research Agent → Geocodes to ward, finds responsible department, checks weather

[Phase 2 — Multimodal Verification]
  Verification Agent → Gemini Vision analyzes photo for type, severity, authenticity

[Phase 3 — Risk Prediction]
  Prediction Agent → Scores risk 0-100 using weather + history + infrastructure

[Phase 4 — Strategic Planning]
  Planner Agent → Generates action plan, escalation ladder, document spec

[Phase 5 — Autonomous Execution]
  Execution Agent → Generates PDF complaint, emails officer, SMS to councilor
  Escalation Agent → Monitors SLA, auto-escalates at 48h, drafts RTI at 30 days
```

The citizen receives a case number and real-time tracking URL within seconds. They never need to follow up manually again.

---

## 3. Key Features

### Citizen-Facing Features

| Feature                       | Implementation                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Photo + GPS Reporting**     | Drag-and-drop upload or camera capture with browser Geolocation API. Demo presets for potholes, water leaks, broken streetlights.                                                            |
| **Voice Dictation**           | Web Speech API with `en-IN` locale for Indian English accent compatibility. Fallback text simulation for unsupported browsers.                                                               |
| **Instant AI Analysis**       | Gemini Vision processes uploaded images in <3 seconds, returning structured JSON: issue type, severity (LOW/MEDIUM/HIGH/CRITICAL), confidence score, estimated dimensions, safety risk flag. |
| **Real-Time Agent Tracking**  | WebSocket connection streams live agent logs to the tracking page. Each agent's decision is visible as it happens. Falls back to client-side simulation for demo reliability.                |
| **Complaint Document Viewer** | Generated PDF displayed in-app with legal formatting, case number, GPS coordinates, evidence photos, and government addressee.                                                               |
| **SLA Escalation Timeline**   | Visual timeline showing escalation path: Ward Officer (0-48h) → Department Head (48-72h) → District Commissioner (72h+) → RTI Auto-Draft (30 days).                                          |

### Government Dashboard Features

| Feature                    | Implementation                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-Time Issue Feed**   | Fetches from Firestore via `GET /api/v1/issues`. Displays all active issues in a sortable table with severity badges and escalation levels.               |
| **Search & Filter**        | Full-text search across issue ID, type, and ward name.                                                                                                    |
| **Detail Drawer**          | Click any issue to see: media evidence, description, assigned officer, escalation state, community proximity flags (school/hospital).                     |
| **SLA Escalation Sweep**   | One-click button triggers the Escalation Agent via `POST /api/v1/escalation/check`. Scans all active issues for SLA breaches and escalates automatically. |
| **Status Management**      | Acknowledge (SUBMITTED → MONITORING) and Resolve (→ RESOLVED) actions with instant UI updates.                                                            |
| **RTI Auto-Draft Display** | For issues escalated past 48h, displays the auto-generated Right to Information application text.                                                         |

### AI Agent Features

| Feature                          | Implementation                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autonomous PDF Generation**    | ReportLab generates formal complaint letters with structured layouts, case numbers, GPS coordinates, and government-standard formatting. Uploaded to GCS. |
| **Auto-Escalation**              | Escalation Agent runs background SLA checks. Unresolved cases auto-escalate through the governance hierarchy without citizen action.                      |
| **RTI Application Drafting**     | At 30+ days unresolved, the system auto-generates a Right to Information (India) application text, ready for citizen submission.                          |
| **Historical Pattern Detection** | Memory Agent queries Firestore for prior reports within 200m radius. Detects chronic issues (3+ same-type reports) and adjusts priority accordingly.      |
| **Weather-Amplified Risk**       | Open-Meteo API provides real 7-day precipitation forecast. Potholes near water mains with 80%+ rain probability get critical risk scores.                 |
| **Community Consensus**          | Verification Agent cross-references multiple citizen reports of the same location to build credibility scores and prevent false reporting.                |

---

## 4. Technologies Used

### Frontend

| Technology       | Version             | Purpose                                                                |
| ---------------- | ------------------- | ---------------------------------------------------------------------- |
| **Next.js**      | 16.2.9 (App Router) | React framework with server components, file-based routing, TypeScript |
| **React**        | 19.2.4              | UI library with hooks (useState, useEffect, useCallback)               |
| **TypeScript**   | 5.x                 | Type safety across all components and API calls                        |
| **Tailwind CSS** | 4.x                 | Utility-first CSS with oklch color system, custom animations           |
| **shadcn/ui**    | 4.11.0              | Component library (Button, Card primitives)                            |
| **Lucide React** | 1.21.0              | Icon library (40+ icons used across the app)                           |
| **Radix UI**     | 1.6.0               | Accessible component primitives                                        |

### Backend

| Technology                   | Purpose                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| **FastAPI**                  | Python async web framework with WebSocket support, automatic OpenAPI docs |
| **Python 3.10+**             | Backend language with asyncio for concurrent agent execution              |
| **Pydantic v2**              | Schema validation for all agent inputs/outputs, structured API models     |
| **ReportLab**                | PDF generation for formal complaint documents                             |
| **httpx**                    | Async HTTP client for external API calls (weather, geocoding)             |
| **Firebase Admin SDK**       | Firestore database operations, Cloud Storage bucket access                |
| **Google Generative AI SDK** | Gemini API integration with structured output support                     |

### Data & Infrastructure

| Technology                | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Firebase Firestore**    | Primary database — issues, citizen profiles, government contacts, agent logs |
| **Google Cloud Storage**  | Media uploads (photos/videos) and generated PDF documents                    |
| **Open-Meteo API**        | Free weather forecast API — 7-day precipitation probability                  |
| **Google Maps Geocoding** | GPS coordinates → structured address, ward name, district identification     |
| **WebSockets**            | Real-time agent log streaming from backend to frontend tracking page         |
| **Web Speech API**        | Browser-native voice dictation with Indian English locale                    |

---

## 5. Google Technologies Utilized

This section details every Google technology used in CivicPulse, how it is used, and why it is essential.

### Google AI Studio / Gemini API

**Gemini 1.5 Pro** — Used for complex reasoning tasks requiring deep analysis:

| Integration Point                         | How It's Used                                                                                                                                                                                                                                                                | Why Gemini                                                                                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vision Analysis** (`verification.py`)   | Citizen-uploaded photos are sent to Gemini Pro with a structured output schema. Returns: `issue_type` (POTHOLE/WATER_LEAK/etc.), `severity` (LOW-MEDIUM-HIGH-CRITICAL), `confidence_score` (0-1), `estimated_dimensions`, `safety_risk` (boolean), `is_authentic` (boolean). | No other model combines multimodal vision with structured JSON output in a single API call. GPT-4 Vision exists but lacks integrated function calling in the same context window. |
| **Action Plan Generation** (`planner.py`) | Full pipeline context (history + research + verification + prediction) is loaded into a single Gemini Pro prompt. Generates a structured `ActionPlan` with ordered tasks, document spec, escalation ladder, and follow-up schedule.                                          | Gemini's 1M token context window allows loading the complete ward history + all agent outputs in one inference call — no chunking, no retrieval loss.                             |
| **Risk Prediction** (`prediction.py`)     | Weather data, historical patterns, infrastructure proximity, and sensitivity flags are fed to Gemini Flash for structured risk scoring (0-100) with severity trajectory over 24h/7d/30d.                                                                                     | Gemini Flash provides fast classification at lower cost while maintaining structured output accuracy.                                                                             |

**Gemini 1.5 Flash** — Used for high-speed classification and real-time scoring:

| Integration Point        | How It's Used                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Risk Scoring**         | Fast inference for composite risk score calculation with weather + history context |
| **Issue Classification** | Rapid categorization of citizen reports into structured issue types                |

**Gemini Structured Outputs** — All agent outputs are enforced via Pydantic schemas:

```python
# Example: Verification Agent structured output
class VisionAnalysis(BaseModel):
    issue_type: IssueType      # Enum: POTHOLE, WATER_LEAK, etc.
    severity: Severity          # Enum: LOW, MEDIUM, HIGH, CRITICAL
    confidence_score: float     # 0.0 to 1.0
    estimated_dimensions: Dict  # Physical measurements
    safety_risk: bool           # Immediate danger flag
    is_authentic: bool          # Anti-fraud check
```

This is configured via `response_mime_type="application/json"` and `response_schema=VisionAnalysis` in the Gemini API call — ensuring zero hallucination on critical fields.

### Firebase / Google Cloud

| Google Technology             | Integration                                          | Purpose                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Firebase Firestore**        | `database.py` — CRUD operations with spatial queries | Primary database for issues, citizen profiles, government contacts. Uses bounding-box pre-filter + Haversine distance for geospatial queries within 200m radius.                     |
| **Firebase Cloud Storage**    | `document_generator.py` — GCS upload                 | Stores citizen-uploaded photos, videos, and AI-generated complaint PDFs. `blob.make_public()` for government officer access.                                                         |
| **Firebase Admin SDK**        | `firebase.py` — initialization + client              | Server-side SDK for Firestore and Storage operations. Supports Application Default Credentials (ADC) for production deployment.                                                      |
| **Google Maps Geocoding API** | `maps.py` — reverse geocoding                        | Converts GPS coordinates (latitude, longitude) to structured address with ward name, district, and administrative area components. Identifies the responsible government department. |

### Google Cloud Platform

| Technology               | Integration                    | Purpose                                                                                                                                        |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Cloud Run**     | Backend deployment target      | Serverless deployment of FastAPI backend. Auto-scales to zero when idle. Docker container with Python 3.10+, all agent code, and dependencies. |
| **Google Cloud Logging** | `main.py` — structured logging | All agent decisions, Gemini API calls, and execution logs are captured as structured JSON for observability and debugging.                     |

### Why Gemini Is Essential (Not Just a Wrapper)

The architecture of CivicPulse is **architecturally dependent on Gemini capabilities that no other model provides:**

1. **Multimodal + Structured Output in one call.** Citizen photos go directly to Gemini with a Pydantic schema. No other platform combines vision understanding with JSON schema enforcement in a single API call. OpenAI requires separate image analysis + text generation.

2. **1M token context window.** The Memory Agent loads full ward history (typically 10K-50K tokens of prior reports, resolution times, citizen profiles) into a single Gemini context for pattern recognition. No chunking. No RAG retrieval loss.

3. **Function Calling.** The Research Agent uses Gemini function calling to invoke external tools — Maps Geocoding API, weather API, government directory lookup. Gemini decides which tools to call based on context, enabling true agentic behavior.

4. **Flash + Pro model tiering.** Simple classification (risk scoring, issue type) uses Flash for speed and cost. Complex reasoning (action plan generation, document creation) uses Pro for depth. This cost-aware architecture is only possible with Gemini's model family.

---

## 6. Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   CITIZEN INTERFACE                        │
│   Next.js 16 Web App (Vercel) + PWA Mobile               │
│   Photo/GPS/Voice → FastAPI Backend                       │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API + WebSocket
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                         │
│   /api/v1/report    — Submit citizen report               │
│   /api/v1/issues    — Fetch all issues (dashboard)        │
│   /api/v1/ws/{id}   — Real-time agent log streaming       │
│   /api/v1/escalation/check — Trigger SLA sweep            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              CIVIC ORCHESTRATOR                            │
│   5-Phase Pipeline with asyncio.gather parallelism        │
│                                                           │
│   Phase 1 (Parallel):                                     │
│     ├─ Memory Agent ─── Firestore spatial query           │
│     └─ Research Agent ─ Geocoding + Weather + GIS         │
│                                                           │
│   Phase 2:                                                │
│     └─ Verification Agent ─ Gemini Vision + Cross-Check   │
│                                                           │
│   Phase 3:                                                │
│     └─ Prediction Agent ─ Risk Score + Trajectory         │
│                                                           │
│   Phase 4:                                                │
│     └─ Planner Agent ─ Action Plan + Document Spec        │
│                                                           │
│   Phase 5:                                                │
│     └─ Execution Agent ─ PDF + Email + SMS + Dashboard    │
│                                                           │
│   Background:                                             │
│     └─ Escalation Agent ─ SLA Monitor + Auto-Escalate     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  DATA LAYER                                │
│   Firestore (issues, profiles, logs)                      │
│   Google Cloud Storage (media, PDFs)                      │
│   Open-Meteo (weather forecast)                           │
│   Google Maps Geocoding (address resolution)              │
└──────────────────────────────────────────────────────────┘
```

### Agent Communication Protocol

All agents communicate via the Orchestrator using structured Pydantic models:

```python
# Agent input/output chain:
MemoryAgent.run(location, issue_type) → HistoricalContext
ResearchAgent.run(location, issue_type) → ResearchEnrichment
VerificationAgent.run(report, historical_ctx) → (VerificationResult, VisionAnalysis)
PredictionAgent.run(report, historical_ctx, research_ctx) → PredictionOutput
PlannerAgent.run(report, historical_ctx, research_ctx, verification, vision, prediction) → ActionPlan
ExecutionAgent.run(action_plan, original_report_data) → execution_log
```

Phase 1 agents (Memory + Research) execute in parallel via `asyncio.gather()`. Phases 2-5 execute sequentially because each depends on prior outputs.

---

## 7. Codebase Summary

| Metric                        | Value                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **Backend files**             | 27 Python files                                                                                  |
| **Frontend files**            | 14 TSX/TS/CSS files                                                                              |
| **Total lines of code**       | ~5,500                                                                                           |
| **Backend agents**            | 7 (Memory, Research, Verification, Prediction, Planner, Execution, Escalation)                   |
| **Backend services**          | 8 (Gemini, Firebase, Database, Maps, Weather, Govt Directory, Document Generator, Notifications) |
| **Frontend pages**            | 5 (Landing, Report, Dashboard, Map, Track)                                                       |
| **Frontend components**       | 7 (Navbar, AgentStatusPanel, MediaPicker, LocationPicker, IssueMap, Button)                      |
| **API endpoints**             | 4 (POST /report, GET /issues, POST /escalation/check, WebSocket /ws/{id})                        |
| **Pydantic schemas**          | 12 models with full type validation                                                              |
| **Gemini integration points** | 3 (Vision analysis, Risk prediction, Action plan generation)                                     |

### Key Source Files

| File                                         | Purpose                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `backend/app/agents/orchestrator.py`         | Central pipeline controller — 5-phase agent execution with parallel Phase 1      |
| `backend/app/agents/verification.py`         | Gemini Vision integration — photo analysis, authenticity check, cross-validation |
| `backend/app/agents/planner.py`              | Action plan generation via Gemini structured output                              |
| `backend/app/agents/execution.py`            | PDF generation, GCS upload, Firestore write, email/SMS dispatch                  |
| `backend/app/services/gemini.py`             | Gemini API wrapper with async-to-thread conversion for non-blocking calls        |
| `backend/app/services/database.py`           | Firestore CRUD with Haversine spatial queries                                    |
| `backend/app/services/document_generator.py` | ReportLab PDF generation with formal government letter formatting                |
| `frontend/app/report/page.tsx`               | 3-step citizen report form (media → location → description) with voice dictation |
| `frontend/app/dashboard/page.tsx`            | Government portal with real-time issue feed, search, escalation controls         |
| `frontend/app/track/[id]/page.tsx`           | Individual report tracking with agent logs, risk score, complaint viewer         |
| `frontend/components/AgentStatusPanel.tsx`   | WebSocket-based real-time agent log streaming with simulation fallback           |
| `frontend/lib/api.ts`                        | API client with REST endpoints, WebSocket URLs, and full demo simulator          |

---

## 8. What Makes This Different

| Existing Apps (FixMyStreet, SeeClickFix, Samara) | CivicPulse                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| Manual category selection from dropdown          | Gemini Vision analyzes photo and auto-categorizes in <3 seconds           |
| Citizen must follow up manually                  | 7 agents autonomously process, escalate, and track without citizen action |
| No prediction or risk scoring                    | Weather + history + infrastructure data predicts issue worsening          |
| Simple upvote for community verification         | AI cross-validates multiple citizen reports with credibility scoring      |
| No document generation                           | Auto-generates formal complaint letters, RTI applications                 |
| Single channel (web form)                        | Web + voice dictation + photo/GPS + video evidence                        |
| No escalation automation                         | SLA monitoring auto-escalates through government hierarchy                |

---

## 9. Demo Plan (3 Minutes)

| Time      | Action                                           | What Judges See                                            |
| --------- | ------------------------------------------------ | ---------------------------------------------------------- |
| 0:00–0:20 | Show a real pothole photo. State the problem.    | Emotional hook — every judge has seen this frustration     |
| 0:20–0:45 | Upload photo on CivicPulse. Submit report.       | 30-second citizen flow — fast, simple, no account needed   |
| 0:45–1:00 | Agent status panel lights up — 7 agents running  | Visible AI autonomy — real-time log of agent decisions     |
| 1:00–1:15 | Show generated complaint PDF                     | Practical value — official document generated in seconds   |
| 1:15–1:30 | Show email sent to government officer            | "It actually works" — real notification to real department |
| 1:30–1:45 | Open government dashboard — see the issue appear | Both sides of the platform — citizen + government          |
| 1:45–2:00 | Trigger SLA escalation sweep                     | Accountability — system escalates if government ignores    |
| 2:00–2:20 | Show tracking page — risk score, timeline, map   | Depth — prediction, history, escalation all visible        |
| 2:20–2:40 | Voice-dictate a second issue                     | Multimodal — voice input works alongside photo             |
| 2:40–3:00 | Market size + vision + "Live now"                | Startup potential — $2.5T market, 4B urban residents       |

---

## 10. Future Roadmap

**Phase 1 (Post-Hackathon):**

- Firebase Authentication for citizen and government SSO
- Real Mapbox GL integration replacing SVG map
- WhatsApp bot via Twilio for no-app-install reporting
- Multi-language support (Hindi, Tamil, Kannada, Marathi)

**Phase 2 (3 months):**

- Integration with 10 Tier-1 Indian cities' government directories
- Predictive maintenance contracts with municipal corporations
- Before/after photo verification for resolution confirmation

**Phase 3 (12 months):**

- Pan-India deployment across 500+ municipalities
- Government ERP integration (SAP, NIC)
- Satellite imagery analysis for rural infrastructure monitoring
- UN Habitat partnership for developing-world deployment

---

_Built for Vibe2Ship Hackathon | June 22–29, 2026_
_Powered by Google Gemini, Firebase, and Cloud Run_
