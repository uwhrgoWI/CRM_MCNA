# Stage 5 - Component 2: FastAPI Anomaly Detection Middleware
# Tracks fast deal close operations (sliding window tracker < 1 hour)
# Logs anomalies directly to the SQL database tables

import json
import datetime
from collections import defaultdict, deque
from typing import Dict
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Local database schemas for anomaly logging
Base = declarative_base()

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sales_id = Column(String(100), nullable=False, index=True)
    deals_closed_count = Column(Integer, nullable=False)
    time_window = Column(String(50), default="1 hour")
    severity = Column(String(20), default="High") -- "Info", "Medium", "High"
    alert_details = Column(String(1000))
    logged_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


DATABASE_URL = "sqlite:///./anomaly_tracking.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


# =========================================================================
# EXPERT: SLIDING-WINDOW ANOMALY INTERCEPTOR MIDDLEWARE
# =========================================================================
class AnomalyAuditMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, window_seconds: int = 3600, deal_threshold: int = 5):
        super().__init__(app)
        self.window_seconds = window_seconds
        self.deal_threshold = deal_threshold
        
        # Sliding deques mapped dynamically per sales rep
        # In multi-instance k8s clusters, replace with distributed Redis sorted-sets (ZREMRANGEBYSCORE/ZADD)
        self.deal_history = defaultdict(deque)

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Intercepts endpoints to track sales representative activity velocity.
        """
        # Look for deal update operations: e.g. PUT/POST endpoints targeting deal closure statuses
        if request.method in ["POST", "PUT", "PATCH"] and "/deals" in request.url.path:
            # We clone the stream of the body so it can still be processed down the chain
            body_bytes = await request.body()
            
            # Setup a wrapper stream so standard ASGI servers don't freeze on empty byte streams
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive

            try:
                # Resolve details from either JWT headers, session scopes, or payload bodies
                # For this demonstration, we parse standard JSON payloads: {"sales_id": "rep_xyz", "status": "closed_won"}
                payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
                
                # Check if the active action represents a deal closure event
                if payload.get("status") == "closed_won" and "sales_id" in payload:
                    sales_id = payload["sales_id"]
                    now = datetime.datetime.utcnow()

                    # 1. Clean stale timestamps from sliding window queue (removes entries older than 1 hr)
                    cutoff = now - datetime.timedelta(seconds=self.window_seconds)
                    while self.deal_history[sales_id] and self.deal_history[sales_id][0] < cutoff:
                        self.deal_history[sales_id].popleft()

                    # 2. Append current action timestamp
                    self.deal_history[sales_id].append(now)
                    current_volume = len(self.deal_history[sales_id])

                    # 3. Anomaly evaluation: closed > 5 deals in 1 hour
                    if current_volume > self.deal_threshold:
                        self.trigger_anomaly_logging(sales_id, current_volume)

            except Exception as e:
                # Graceful pipeline degradation: log error but guarantee API uptime
                print(f"[MIDDLEWARE FAULT WARNING] Failed tracking transaction velocity: {str(e)}")

        response = await call_next(request)
        return response

    def trigger_anomaly_logging(self, sales_id: str, count: int):
        """
        Writes high-severity alerts to database tables to flag potential fake pipeline entries.
        """
        db = SessionLocal()
        try:
            alert = AnomalyAlert(
                sales_id=sales_id,
                deals_closed_count=count,
                time_window="1 hour",
                severity="High",
                alert_details=(
                    f"Warning: Representative '{sales_id}' closed {count} deals within an hour. "
                    f"This exceeds the velocity limit threshold of {self.deal_threshold} and may "
                    f"indicate bulk fake entries."
                )
            )
            db.add(alert)
            db.commit()
            print(f"!!! [ANOMALY SYSTEM ALERT] !!! High-velocity activity flagged for representative {sales_id}")
        except Exception as ex:
            print(f"Failed to log alert database connection states: {str(ex)}")
        finally:
            db.close()


# =========================================================================
# FASTAPI INTEGRATION
# =========================================================================
app = FastAPI(title="Anomaly-Aware CRM Host Server")

# Bind the sliding window middleware
app.add_middleware(AnomalyAuditMiddleware, window_seconds=3600, deal_threshold=5)

@app.post("/deals/update")
async def dummy_deal_update(payload: dict):
    return {"status": "ok", "action": "update_processed"}
