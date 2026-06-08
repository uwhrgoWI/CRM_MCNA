# Stage 6 — Suggest 5 PowerBI Visuals with DAX Measures

To display and analyze your CRM's Marketing Funnel (**AWARENESS → LEAD SCORING → SALES → PAYMENT → CONTROL LAYER**), we recommend building these 5 strategic visuals.

---

### Visual 1: Full-Funnel Conversion Cascade (Conversion Funnel)
*   **Aesthetic & Form**: Funnel Chart or Horizontal Bar Chart.
*   **Purpose**: Track cumulative leads count at each stage of the funnel to pinpoint drop-offs.
*   **DAX Measures**:
    ```dax
    -- Calculate active leads under management within the selected time window
    LeadsCount = DISTINCTCOUNT(leads[id])
    
    -- Measure active conversion drop-off between stages in the sequence
    FunnelDropOffPct = 
    VAR CurrentStageCount = [LeadsCount]
    VAR PreviousStageCount = 
        CALCULATE(
            [LeadsCount],
            FILTER(
                ALLSELECTED(leads),
                leads[stage_sequence_id] = MAX(leads[stage_sequence_id]) - 1
            )
        )
    RETURN
        IF(
            ISBLANK(PreviousStageCount) || PreviousStageCount = 0,
            0,
            DIVIDE(PreviousStageCount - CurrentStageCount, PreviousStageCount)
        )
    ```

### Visual 2: Sales Rep Velocity & Pipeline Health Grid
*   **Aesthetic & Form**: Clustered Column & Line Combo Chart (X-Axis: Sales Rep, Column: Won Revenue, Line: Win Rate %).
*   **Purpose**: Identify top performers and flag agents displaying anomalous high/low conversions.
*   **DAX Measures**:
    ```dax
    -- Sum of realized revenues
    ClosedWonRevenue = 
    CALCULATE(
        SUM(deals[amount]),
        deals[status] = "closed_won"
    )

    -- Dynamic Win Rate % mapping
    WinRatePct = 
    VAR LeadsAssigned = DISTINCTCOUNT(leads[id])
    VAR WonDeals = CALCULATE(DISTINCTCOUNT(deals[id]), deals[status] = "closed_won")
    RETURN
        DIVIDE(WonDeals, LeadsAssigned, 0)
    ```

### Visual 3: Lead Source Acquisition ROI Map
*   **Aesthetic & Form**: Treemap or Tornado Chart.
*   **Purpose**: Evaluate which channels (forms, ads, referrers) drive maximum finalized cash flow.
*   **DAX Measures**:
    ```dax
    -- Map average deal sizes achieved per source channel
    AvgDealSize = 
    DIVIDE(
        CALCULATE(SUM(deals[amount]), deals[status] = "closed_won"),
        CALCULATE(COUNT(deals[id]), deals[status] = "closed_won"),
        0
    )
    ```

### Visual 4: Cash Flow SLA Realization Rate
*   **Aesthetic & Form**: Radial Gauge Chart.
*   **Purpose**: Display the ratio of received payments (payment status = 'paid' or deal status = 'closed_won' vs total invoiced pipeline value).
*   **DAX Measures**:
    ```dax
    RealizedSLA_Pct = 
    VAR InvoiceTotal = SUM(deals[amount])
    VAR ClearedVolume = CALCULATE(SUM(deals[amount]), deals[payment_status] = "paid")
    RETURN
        DIVIDE(ClearedVolume, InvoiceTotal, 0)
    ```

### Visual 5: Control Layer Anomaly Risk Scorecard
*   **Aesthetic & Form**: Table Grid Card with conditional formatting highlighting anomalous sales.
*   **Purpose**: Highlight reps exceeding normal operational speed bounds (e.g., > 5 completed deals per hour).
*   **DAX Measures**:
    ```dax
    -- Flag anomalously fast closures
    RepVelocityFlag = 
    VAR HourlyCloses = CALCULATE(COUNT(deals[id]), deals[status] = "closed_won") -- can slice by hour
    RETURN
        IF(HourlyCloses > 5, "🚨 Anomaly: Bulk Entry Alert", "✅ Nominal Velocity")
    ```

---
---

# Bonus — Architectural Code Review & Refactoring Report

This report evaluates security, scalability, and operational flow gaps in traditional Python/FastAPI CRM implementations.

### 1. Security Vulnerabilities Identified
*   **Critical: Direct SQL Injection Risk**: Concatenating input strings directly into database cursors (e.g., `f"SELECT * FROM contacts WHERE id = '{input_id}'"`) opens the application to database compromises.
    *   *Fix*: Always implement parameterized queries via ORMs (SQLAlchemy/SQLModel) or pass inputs as tuple variables inside execution commands.
*   **High: Exposure of Core Secret Keys**: Hardcoding HMAC keys, JWT tokens, or external API passwords in git commits.
    *   *Fix*: Load credentials at runtime through secured environment namespaces via Pydantic Settings packages.

### 2. Performance Bottlenecks Checked
*   **High: Database Connection Exhaustion (No Connection Pools)**: Allocating new database connections on every HTTP thread without using pools or context-scoped thread managers.
    *   *Fix*: Adopt modern SQLAlchemy `sessionmaker` patterns inside FastAPI `Depends(get_db)` blocks to recycle connections seamlessly.
*   **Medium: Synchronous Operations Blocking ASGI Event Loop**: Running heavy processes synchronously (e.g., matching signatures or communicating with external web services using blocking libraries like `requests` instead of `httpx`).
    *   *Fix*: Refactor network boundaries over to asynchronous endpoints `async def` and delegate tasks to Celery queues.

### 3. Business Logic Gaps Checked
*   **Missing Funnel Progression Enforcements**: Deals created directly for contacts without completing the **LEAD SCORING** validation phase, creating database state inconsistency.
    *   *Fix*: Create an strict state-machine guard to reject creation of a deal if `leads.status` holds a value distinct from `'hot'` or `'warm'`, and enforce mandatory fields before progressing to stage assignments.

### 4. Code Refactoring Example: Before vs. After

#### ❌ BEFORE (Vulnerable, blocking synchronous implementation)
```python
# Vulnerable to SQL injections, blocks event-loop, contains hardcoded secrets
import hmac, hashlib, sqlite3

@app.post("/receive-payment")
def bad_payment(deal_id: str, amount: float, signature: str):
    # Hardcoded secrets!
    secret = "my_private_secret_key"
    
    # Vulnerable signature match
    if signature != hmac.new(secret.encode(), deal_id.encode(), hashlib.sha256).hexdigest():
        return {"error": "unauthorized"}

    # Database vulnerabilities
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(f"UPDATE deals SET status = 'closed_won', payment = 'paid' WHERE id = '{deal_id}'")
    conn.commit()
    conn.close()
    
    # Blocks thread with heavy operations
    send_slack_and_email_alert_blocking(deal_id)
    return {"status": "success"}
```

#### ✅ AFTER (Secure, Non-Blocking, Parameterized, Scalable)
```python
# Secured, parameterized execution, background delegation, environment-aware
import hmac, hashlib, os
from fastapi import APIRouter, Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from celery import Celery

router = APIRouter()
celery_worker = Celery("crm", broker=os.getenv("REDIS_BROKER_URL"))
WEBHOOK_SECRET = os.getenv("PAYMENT_WEBHOOK_SECRET")

@router.post("/webhooks/payment", status_code=status.HTTP_200_OK)
async def secure_payment_webhook(
    payload: WebhookPayload, 
    x_signature: str = Header(...), 
    db: Session = Depends(get_db)
):
    # Constant-time security check against timing attacks
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload.json().encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    # Secure Parameterized Query implementation utilizing SQLAlchemy Session
    deal = db.query(DbDeal).filter(DbDeal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal.status = "closed_won"
    deal.payment_status = "paid"
    db.commit()

    # Offload blocking operations async using Celery
    celery_worker.send_task("tasks.send_notification", args=[deal.id, ["email", "slack"]])
    return {"status": "queued"}
```
