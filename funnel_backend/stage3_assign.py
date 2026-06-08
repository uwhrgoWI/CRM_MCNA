# Stage 3: Auto-assign Sales Reps
# Robust FastAPI deployment utilizing SQLAlchemy Core for transaction safety,
# automatic sorting, active utilization screening, and assignment logs.

import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, ForeignKey, text, func, asc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# =========================================================================
# DATABASE SETUP & ORM SCHEMA DEFINITIONS
# =========================================================================
Base = declarative_base()

class SalesRep(Base):
    __tablename__ = "sales_reps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  -- False if on leave/break
    
    # Track historic assignments globally
    last_assigned_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # Relationships
    assignments = relationship("LeadAssignment", back_populates="sales_rep")

class LeadAssignment(Base):
    __tablename__ = "lead_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lead_id = Column(String(36), nullable=False, index=True)
    sales_rep_id = Column(String(36), ForeignKey("sales_reps.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String(50), default="active", nullable=False) -- "active", "completed", "transferred"
    
    # Relationships
    sales_rep = relationship("SalesRep", back_populates="assignments")


# =========================================================================
# SCHEMAS FOR API INPUT/OUTPUT
# =========================================================================
class SalesRepResponse(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool
    active_load: int
    last_assigned_at: datetime.datetime

    class Config:
        orm_mode = True

class AssignmentResponse(BaseModel):
    assignment_id: str
    lead_id: str
    sales_rep_id: str
    sales_rep_name: str
    assigned_at: datetime.datetime


# =========================================================================
# FASTAPI INSTANCE & ROUTEPATHS
# =========================================================================
app = FastAPI(
    title="Automated Sales Assignment Service",
    description="Routing leads context to least-active sales representatives with SLA safety limits.",
    version="1.0.0"
)

# Mock in-memory sqlite instance for direct demonstration. 
# In production, swap for PostgreSQL: postgresql://username:password@localhost:5432/crmdb
DATABASE_URL = "sqlite:///./sales_assignment.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# In-flight hook to construct tables immediately (if testing local environment)
Base.metadata.create_all(bind=engine)

# Dependency to retrieve database session safely
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/sales/available", response_model=List[SalesRepResponse])
def get_available_sales(db: Session = Depends(get_db)):
    """
    Returns lists of active sales representatives alongside their current lead occupancy tracking.
    """
    # Fetch active reps
    reps = db.query(SalesRep).filter(SalesRep.is_active == True).all()
    results = []
    
    for rep in reps:
        # Count active assigned leads (where assignment is in progress)
        active_load = db.query(LeadAssignment).filter(
            LeadAssignment.sales_rep_id == rep.id,
            LeadAssignment.status == "active"
        ).count()
        
        results.append({
            "id": rep.id,
            "name": rep.name,
            "email": rep.email,
            "is_active": rep.is_active,
            "active_load": active_load,
            "last_assigned_at": rep.last_assigned_at
        })
        
    return results


@app.post("/leads/{id}/assign", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_lead(id: str, db: Session = Depends(get_db)):
    """
    Executes load-based assignment of raw leads:
    1. Filters on-duty reps (is_active=True).
    2. Enforces active workload cap (< 20 leads).
    3. Finds the list of smallest load counts.
    4. Applies Round-Robin as tiebreaker using 'last_assigned_at ASC' sort order!
    5. Returns 409 Conflict if no reps can take on additional volume.
    """
    # Begin transactional thread context
    all_reps = db.query(SalesRep).filter(SalesRep.is_active == True).all()
    if not all_reps:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Assignment failure: No active Sales Representatives registered."
        )

    eligible_reps = []
    for rep in all_reps:
        load = db.query(LeadAssignment).filter(
            LeadAssignment.sales_rep_id == rep.id,
            LeadAssignment.status == "active"
        ).count()
        
        if load < 20:
            eligible_reps.append((rep, load))

    if not eligible_reps:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Assignment failure: All active representatives have hit their capacity threshold limit (20 leads max)."
        )

    # Clean sorting:
    # Key 1: active lead load (Ascending - least loaded rep wins)
    # Key 2: last_assigned_at (Ascending - oldest assigned timestamp wins which guarantees Round-Robin equity)
    eligible_reps.sort(key=lambda item: (item[1], item[0].last_assigned_at))
    chosen_rep, current_load = eligible_reps[0]

    # Create assignment and log
    new_assignment = LeadAssignment(
        lead_id=id,
        sales_rep_id=chosen_rep.id,
        status="active",
        assigned_at=datetime.datetime.utcnow()
    )
    
    # Update chosen rep's scheduling queue sequence
    chosen_rep.last_assigned_at = datetime.datetime.utcnow()

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return AssignmentResponse(
        assignment_id=new_assignment.id,
        lead_id=new_assignment.lead_id,
        sales_rep_id=chosen_rep.id,
        sales_rep_name=chosen_rep.name,
        assigned_at=new_assignment.assigned_at
    )
