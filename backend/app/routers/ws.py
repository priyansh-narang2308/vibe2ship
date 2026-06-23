import asyncio
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.schemas import CitizenReport, GPSCoordinates
from app.agents.orchestrator import CivicOrchestrator
import json

router = APIRouter()
orchestrator = CivicOrchestrator()

@router.websocket("/ws/{report_id}")
async def websocket_report_endpoint(websocket: WebSocket, report_id: str):
    """
    WebSocket endpoint that accepts connection, waits for a 'start' command,
    runs the multi-agent pipeline, and streams logs back in real-time.
    """
    await websocket.accept()
    print(f"WebSocket client connected for Report ID: {report_id}")
    
    try:
        # 1. Define the callback that gets injected into agents to stream log states
        async def stream_log_callback(agent_name: str, message: str, status: str):
            try:
                await websocket.send_json({
                    "event": "agent_log",
                    "report_id": report_id,
                    "agent": agent_name,
                    "message": message,
                    "status": status,  # INFO, SUCCESS, WARNING, ERROR
                    "timestamp": datetime.utcnow().isoformat()
                })
                # Visual delay for demo pacing (judges can watch the agent "thinking")
                await asyncio.sleep(0.6)
            except Exception as e:
                print(f"Error streaming log: {e}")

        # 2. Connection keeps open, waiting for start signal
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
            except json.JSONDecodeError:
                await websocket.send_json({"event": "error", "message": "Invalid JSON format."})
                continue
                
            action = data.get("action")
            if action == "start":
                await websocket.send_json({
                    "event": "status", 
                    "message": "Initializing processing agents...",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Parse report data
                try:
                    loc = data.get("location", {})
                    coordinates = GPSCoordinates(
                        latitude=float(loc.get("latitude", 0.0)),
                        longitude=float(loc.get("longitude", 0.0))
                    )
                    
                    report = CitizenReport(
                        id=report_id,
                        citizen_id=data.get("citizen_id", "anonymous_citizen"),
                        media_url=data.get("media_url", ""),
                        location=coordinates,
                        description=data.get("description", ""),
                        timestamp=datetime.utcnow()
                    )
                except Exception as e:
                    await websocket.send_json({
                        "event": "error", 
                        "message": f"Failed to parse report fields: {e}"
                    })
                    continue

                # Run the pipeline
                try:
                    result = await orchestrator.process_report(
                        report=report,
                        log_callback=stream_log_callback
                    )
                    
                    # Send final completed result
                    await websocket.send_json({
                        "event": "pipeline_complete",
                        "result": result.model_dump(),
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    await websocket.send_json({
                        "event": "pipeline_failed",
                        "message": f"Pipeline crashed: {str(e)}",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            elif action == "ping":
                await websocket.send_json({"event": "pong"})
            else:
                await websocket.send_json({"event": "unknown_action", "action": action})

    except WebSocketDisconnect:
        print(f"WebSocket client disconnected for Report ID: {report_id}")
    except Exception as e:
        print(f"WebSocket session error: {e}")
