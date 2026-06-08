# Stage 4: Secure Payment Webhook & Celery Notification Pipeline
# Includes HMAC-SHA256 headers signing verification, transaction idempotency indexing,
# asynchronous Celery routing, and automated audit writing.

import os
import hmac
import hashlib
from typing import Dict, Any
from fastapi import FastAPI, Request, Header, HTTPException, status, Depends
from pydantic import BaseModel, Field
from celery import Celery
from sqlalchemy import create_engine, text, Column, String, Numeric, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# =========================================================================
# WEBHOOK CONFIG & CELERY WORKER BOOTSTRAP
# =========================================================================
WEBHOOK_SECRET = os.getenv("PAYMENT_WEBHOOK_SECRET", "super_secret_webhook_signature_key_2026")
REDIS_BROKER_URL = os.getenv("REDIS_BROKER_URL", "redis://localhost:6379/0")

# Celery task configuration
celery_app = Celery("payments_orchestrator", broker=REDIS_BROKER_URL)

@celery_app.task
def send_notification(deal_id: str, channels: list):
    """
    Celery task run asynchronously in background thread worker pools to log/notify events.
    """
    print(f"[CELERY WORKER] Triggering alert notifications for Deal {deal_id} through channels: {channels}")
    # In production, dispatch emails and Slack Webhook endpoints here
    return {"status": "dispatched", "deal_id": deal_id}


# =========================================================================
# DATABASE MODELS & SCHEMAS
# =========================================================================
Base = declarative_base()

class DbDeal(Base):
    __tablename__ = "deals"
    id = Column(String(36), primary_key=True)
    lead_id = Column(String(36), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    status = Column(String(50), default="open")          # 'open', 'closed_won', 'closed_lost', 'nurture'
    payment_status = Column(String(50), default="unpaid") # 'unpaid', 'partially_paid', 'paid', 'payment_failed'

class ProcessedTransaction(Base):
    """
    Idempotency registry table to track completed payments, preventing double-processing.
    """
    __tablename__ = "processed_transactions"
    transaction_id = Column(String(255), primary_key=True)
    deal_id = Column(String(36), nullable=False)
    processed_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

class DbAuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(String(36), primary_key=True) # or BIGSERIAL
    table_name = Column(String(100))
    record_id = Column(String(255))
    field_changed = Column(String(100))
    old_value = Column(String(1000))
    new_value = Column(String(1000))
    changed_by = Column(String(255))


# =========================================================================
# WEBHOOK SCHEMAS
# =========================================================================
class WebhookPayload(BaseModel):
    deal_id: str = Field(..., example="deal_99af241b")
    amount: float = Field(..., example=12000000.00)
    status: str = Field(..., description="'success' or 'failed'", example="success")
    transaction_id: str = Field(..., example="TXN_2026_06_06_8830111")
    paid_at: str = Field(..., example="2026-06-06T04:50:00Z")


app = FastAPI(title="Payment Gateways Webhook Engine", version="1.0.0")

DATABASE_URL = "sqlite:///./payment_webhooks.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================================
# HELPER: AUDIT LOG WRITER
# =========================================================================
def log_to_audit(db: Session, table: str, record_id: str, field: str, old: str, new: str):
    import uuid
    log_entry = DbAuditLog(
        id=str(uuid.uuid4()),
        table_name=table,
        record_id=record_id,
        field_changed=field,
        old_value=old,
        new_value=new,
        changed_by="payment_webhook_system"
    )
    db.add(log_entry)


# =========================================================================
# SECURED POST WEBHOOK ENDPOINT
# =========================================================================
@app.post("/webhooks/payment", status_code=status.HTTP_200_OK)
async def handle_payment_webhook(
    request: Request,
    x_signature: str = Header(..., alias="X-Signature"),
    db: Session = Depends(get_db)
):
    """
    Receives bank notifications webhooks:
    1. Verifies SHA256 HMAC headers signature against secret.
    2. Runs transaction idempotency checks (rejects duplicate calls).
    3. Triggers atomic updates on Deal parameters.
    4. Queues background notification processes in Redis/Celery.
    """
    # 1. Read raw body bytes for signature validation
    raw_body = await request.body()
    
    # Generate expected HMAC digest
    computed_signature = hmac.new(
        key=WEBHOOK_SECRET.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    # Avoid timing-attack vulnerability by utilizing constant-time comparison
    if not hmac.compare_digest(computed_signature, x_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Signature validation failed. Unauthorized webhook payload source source."
        )

    # 2. Parse payload safely
    import json
    try:
        data_dict = json.loads(raw_body.decode("utf-8"))
        payload = WebhookPayload(**data_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Malformed webhook JSON structural body: {str(e)}"
        )

    # 3. Idempotency assertion
    existing_txn = db.query(ProcessedTransaction).filter(
        ProcessedTransaction.transaction_id == payload.transaction_id
    ).first()
    
    if existing_txn:
        # Avoid duplicate ingestion by skipping with success code
        return {
            "status": "ignored",
            "message": f"Idempotency Guard: Transaction {payload.transaction_id} already synced.",
            "transaction_id": payload.transaction_id
        }

    # Fetch corresponding deal in records
    deal = db.query(DbDeal).filter(DbDeal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Validation error: Registered Deal ID {payload.deal_id} was not located."
        )

    # Cache old record values for the audit writer
    old_payment_status = deal.payment_status
    old_deal_status = deal.status

    # 4. Route state machine updates based on gateway status outcome
    if payload.status == "success":
        deal.payment_status = "paid"
        deal.status = "closed_won"
        
        # Log to database audit trails
        log_to_audit(db, "deals", deal.id, "payment_status", old_payment_status, "paid")
        log_to_audit(db, "deals", deal.id, "status", old_deal_status, "closed_won")

        # Trigger non-blocking asynchronous workers task allocation
        send_notification.delay(deal.id, channels=["email", "slack"])
        
    elif payload.status == "failed":
        deal.payment_status = "payment_failed"
        log_to_audit(db, "deals", deal.id, "payment_status", old_payment_status, "payment_failed")
        
        # In a real environment, trigger secondary alert flow for the owner reps here
        print(f"[REPRESENTATIVE ALERT] Deal ID {deal.id} was flagged with payment failure!")

    # 5. Populate transaction cache to solidify idempotency
    fresh_txn_marker = ProcessedTransaction(
        transaction_id=payload.transaction_id,
        deal_id=payload.deal_id
    )
    db.add(fresh_txn_marker)
    db.commit()

    return {
        "status": "acknowledged",
        "message": f"Webhook processed successfully for transaction {payload.transaction_id} under Deal status status.",
        "transaction_id": payload.transaction_id
    }
