# Stage 2: Lead Scoring Engine
# Implement LeadScorer, FastAPI Endpoint, and Pytest coverage in one robust file.

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status

# =========================================================================
# LEAD SCORER CORE CLASS
# =========================================================================
class LeadScorer:
    REQUIRED_FIELDS = {"name", "phone", "email"}

    def __init__(self, required_fields: Optional[List[str]] = None):
        self.required_fields = set(required_fields) if required_fields else self.REQUIRED_FIELDS

    def calculate_score(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates lead quality score (0 to 100) and maps status category based on inputs.
        
        Input Schema:
        {
            "source": str,                  # 'form', 'ads', 'referral', etc.
            "filled_fields": List[str],      # list of fields completed by lead
            "response_time_hours": float,    # lead response resolution time in hours
            "page_views": int                # website/tracking visit count
        }
        """
        score = 0
        source = contact.get("source", "").lower()
        filled_fields = set(contact.get("filled_fields", []))
        response_time = contact.get("response_time_hours", float("inf"))
        views = contact.get("page_views", 0)

        # 1. Scoring by acquisition channel
        if source == "referral":
            score += 40
        elif source == "form":
            score += 30
        elif source == "ads":
            score += 20
        
        # 2. Complete essential profile details completed
        if self.required_fields.issubset(filled_fields):
            score += 20

        # 3. High-velocity SLA action (processed under 2 hours)
        if response_time is not None and response_time <= 2.0:
            score += 25

        # 4. Elevated website engagement (above 3 pages views)
        if views is not None and views > 3:
            score += 15

        # Bound boundaries between 0 and 100
        score = max(0, min(score, 100))

        # Categorize status based on scoring bounds
        if score > 70:
            status_label = "hot"
        elif score >= 40:
            status_label = "warm"
        else:
            status_label = "cold"

        return {
            "score": score,
            "status": status_label
        }


# =========================================================================
# FASTAPI APP DEFINITIONS & SCHEMAS
# =========================================================================
app = FastAPI(
    title="Marketing Funnel Lead Scoring API",
    description="Engine for analyzing leads parameters and mapping temperatures.",
    version="1.0.0"
)

class ScoreRequestSchema(BaseModel):
    source: str = Field(..., description="Lead acquisition source", example="form")
    filled_fields: List[str] = Field(..., description="Fields filled in by lead", example=["name", "email", "phone"])
    response_time_hours: float = Field(..., description="SLA response speed in hours", example=1.5)
    page_views: int = Field(..., description="Page views count on tracking pixels", example=5)

class ScoreResponseSchema(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Calculated value between 0-100", example=90)
    status: str = Field(..., description="Lead category status thermal", example="hot")


@app.post("/leads/score", response_model=ScoreResponseSchema, status_code=status.HTTP_200_OK)
async def score_lead(payload: ScoreRequestSchema):
    """
    Calculates dynamic scoring for input leads based on response speed, fields, and channel attribution.
    """
    try:
        scorer = LeadScorer()
        result = scorer.calculate_score(payload.dict())
        return ScoreResponseSchema(
            score=result["score"],
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An exception occurred during pipeline calculation: {str(e)}"
        )


# =========================================================================
# PYTEST UNIT TESTS SUITE
# =========================================================================
# Put these in a separate file or execute them with "pytest stage2_scorer.py" using python test frameworks.
# We present them inline so they can be copy-pasted or run.

"""
# save as test_stage2_scorer.py and run `pytest test_stage2_scorer.py`

import pytest
from stage2_scorer import LeadScorer

@pytest.fixture
def scorer():
    return LeadScorer()

def test_perfect_hot_lead(scorer):
    # referral (+40) + fields (+20) + fast response (+25) + page views (+15) = 100 (Capped at 100)
    contact = {
        "source": "referral",
        "filled_fields": ["name", "phone", "email", "notes"],
        "response_time_hours": 0.5,
        "page_views": 8
    }
    res = scorer.calculate_score(contact)
    assert res["score"] == 100
    assert res["status"] == "hot"

def test_warm_lead_ads(scorer):
    # ads (+20) + fields (+20) + slow response (+0) + views (+0) = 40 (Warm)
    contact = {
        "source": "ads",
        "filled_fields": ["name", "phone", "email"],
        "response_time_hours": 12.0,
        "page_views": 2
    }
    res = scorer.calculate_score(contact)
    assert res["score"] == 40
    assert res["status"] == "warm"

def test_cold_lead_missing_fields(scorer):
    # form (+30) + missing field (+0) + slow response (+0) + high views (+15) = 45 (Warm)
    # let's try a colder one: 
    # other source (+0) + missing phone (+0) + response time (+0) + low views (+0) = 0 (Cold)
    contact = {
        "source": "organic_search",
        "filled_fields": ["name", "email"],
        "response_time_hours": 24.0,
        "page_views": 1
    }
    res = scorer.calculate_score(contact)
    assert res["score"] == 0
    assert res["status"] == "cold"

def test_edge_cases_boundary_response_time(scorer):
    # Boundary check at response time = exactly 2.0 hours (should score +25 points)
    contact = {
        "source": "organic",
        "filled_fields": [],
        "response_time_hours": 2.0,
        "page_views": 1
    }
    res = scorer.calculate_score(contact)
    assert res["score"] == 25
    assert res["status"] == "cold"

def test_edge_cases_page_views(scorer):
    # page_views exactly 3 should not qualify (views > 3 trigger required)
    contact_3_views = {
        "source": "organic",
        "filled_fields": [],
        "response_time_hours": 10,
        "page_views": 3
    }
    assert scorer.calculate_score(contact_3_views)["score"] == 0
    
    # 4 views should trigger +15
    contact_4_views = {
        "source": "organic",
        "filled_fields": [],
        "response_time_hours": 10,
        "page_views": 4
    }
    assert scorer.calculate_score(contact_4_views)["score"] == 15
"""
