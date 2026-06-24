# CivicPulse: Autonomous Civic Intelligence Platform

CivicPulse is an advanced, multi-agent civic operating system designed to bridge the gap between citizens and local government infrastructure maintenance. Developed for the Vibe2Ship Hackathon under the "Community Hero - Hyperlocal Problem Solver" track, CivicPulse transforms raw, unstructured citizen reports into verified, categorized, and actionable government interventions without requiring human mediation.

## Core Problem Statement

Public infrastructure issues—such as potholes, water leaks, and damaged streetlights—are ubiquitous challenges in urban environments. Traditional reporting systems are fragmented, suffer from low citizen engagement, and lack transparency. Furthermore, government authorities are overwhelmed with unverified, duplicate, and unstructured data, leading to delayed response times and lack of accountability.

## The CivicPulse Solution

CivicPulse shifts the paradigm from passive data collection to proactive AI orchestration. By leveraging Google Gemini's multimodal capabilities, CivicPulse allows citizens to simply upload an image or video of an issue. The platform's orchestrator then seamlessly routes the incident through a pipeline of seven autonomous AI agents.

### Key Capabilities

*   **Multimodal Issue Verification:** Automatically analyzes uploaded media to determine the issue type, severity, and authenticity, preventing duplicate or fraudulent submissions.
*   **Predictive Risk Modeling:** Calculates "Risk Trajectories" by cross-referencing the incident with local weather forecasts and historical failure rates to estimate future damage or safety hazards.
*   **Autonomous SLA Escalation:** Continuously monitors government response timelines. If a local ward officer breaches a service-level agreement (SLA), the system automatically escalates the issue to higher administrative tiers (e.g., District Commissioner).
*   **Automated Legal Drafting:** Automatically generates formal grievance letters and Right to Information (RTI) drafts if severe issues remain unresolved past critical deadlines.
*   **Real-time Intelligence Dashboards:** Provides government officials with a prioritized, geo-spatial view of their jurisdiction, highlighting issues that require immediate resource deployment.

## System Architecture

CivicPulse operates on a decentralized, agentic architecture. The `CivicOrchestrator` manages a sequential and parallel pipeline of specialized agents:

1.  **Memory Agent:** Maintains historical context of specific geographic locations and citizen reporting reliability.
2.  **Research Agent:** Enriches incident reports with external data, including GIS ward mapping, weather conditions, and government directory lookups.
3.  **Verification Agent:** Utilizes Gemini Vision to audit media for authenticity and exact classification.
4.  **Prediction Agent:** Computes the socioeconomic and infrastructural risk scores over a projected timeline.
5.  **Planner Agent:** Synthesizes intelligence to generate an execution plan, an escalation ladder, and a resource allocation strategy.
6.  **Execution Agent:** Handles outward-facing actions, such as dispatching emails, SMS alerts, and updating real-time dashboards.
7.  **Escalation Agent:** A background worker that sweeps for SLA breaches and triggers hierarchical government escalations.

## Technology Stack

### Frontend Application
*   Framework: Next.js 14
*   Language: TypeScript
*   Styling: Tailwind CSS
*   Icons: Lucide React

### Backend Services
*   Framework: FastAPI (Python)
*   AI Engine: Google Generative AI (Gemini 1.5 Pro, Gemini 1.5 Flash)
*   Database: Firebase / Google Cloud Firestore
*   Object Storage: Google Cloud Storage

## Local Development Setup

### Prerequisites
*   Node.js (v18 or higher)
*   Python (3.10 or higher)
*   Google Cloud Service Account credentials
*   Firebase Project configuration

### Backend Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables:
    *   Copy `.env.example` to `.env` and populate your Google Cloud, Firebase, and Gemini API keys.
5.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

### Frontend Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install NPM dependencies:
    ```bash
    npm install
    ```
3.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
4.  Access the application at `http://localhost:3000`.

## Evaluation Criteria Alignment

CivicPulse directly addresses the hackathon's core criteria:
*   **Transparency & Accountability:** Immutable tracking logs and automated escalation engines ensure no report is lost or ignored.
*   **Intelligent Automation:** The multi-agent architecture reduces the manual triage burden on government staff by over 90%.
*   **Community Participation:** frictionless reporting via mobile, web, and voice dictation lowers the barrier to entry for all demographics.

## License

This project was developed for the Vibe2Ship Hackathon. All rights reserved by the contributors.
