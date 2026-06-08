# Stage 5 - Component 1: Data Validation Engine (Validation Pydantic Models)
# Standardizes input checking with robust Regex systems, Vietnam phone constraints formats,
# disposable domain lists filters, and name-safety check.

import re
from typing import List
from pydantic import BaseModel, Field, EmailStr, field_validator
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy import create_engine, Column, String, Integer, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# List of disposable domains to drop immediately during ingestion
DISPOSABLE_DOMAINS = {
    "mailinator.com", "mailinator", 
    "tempmail.com", "tempmail", "temp-mail.org", 
    "10minutemail.com", "guerrillamail.com", "yopmail.com"
}

# =========================================================================
# MODEL DEFINITIONS & VALIDATORS
# =========================================================================
class LeadCreateSchema(BaseModel):
    full_name: str = Field(..., description="Lead full name, no digits, min 5 chars", example="Nguyen Van An")
    email: EmailStr = Field(..., description="Valid company email address", example="vanan@gmail.com")
    phone: str = Field(..., description="Vietnamese formatted cell number", example="0912345678")
    source: str = Field(..., description="Acquisition origin channels")

    @field_validator("full_name")
    @classmethod
    def check_full_name(cls, value: str) -> str:
        trimmed = value.strip()
        # Constraint 1: Minimum character length
        if len(trimmed) < 5:
            raise ValueError("Invalid full name: Must contain at least 5 characters.")
        
        # Constraint 2: No numbers/digits allowed in human full names
        if any(char.isdigit() for char in trimmed):
            raise ValueError("Invalid full name: Numeric characters are forbidden in representative contact names.")
            
        return trimmed

    @field_validator("phone")
    @classmethod
    def check_vietnam_phone(cls, value: str) -> str:
        trimmed = value.strip().replace(" ", "")
        # Vietnam Phone Format Regex: Must begin with 0, followed by 3, 5, 7, 8, or 9, followed by 8 numbers.
        pattern = r"^0[35789]\d{8}$"
        if not re.match(pattern, trimmed):
            raise ValueError(
                "Invalid phone format: Vietnamese numbers must follow the 10-digit structure (e.g. 03xxxxxxxx or 09xxxxxxxx)."
            )
        return trimmed

    @field_validator("email")
    @classmethod
    def check_disposable_email(cls, value: EmailStr) -> EmailStr:
        domain = value.split("@")[-1].lower()
        if domain in DISPOSABLE_DOMAINS:
            raise ValueError(
                f"Validation Failure: Disposable email domains (such as @{domain}) are blocked to enforce CRM data safety rules."
            )
        return value


# =========================================================================
# FASTAPI DEMONSTRATION GATEWAY
# =========================================================================
app = FastAPI(title="Data Quality Control API Gateways", version="1.0.0")

Base = declarative_base()

class DbContact(Base):
    __tablename__ = "contacts"
    id = Column(String(36), primary_key=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50), unique=True, nullable=False)

DATABASE_URL = "sqlite:///./data_qc.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/leads", status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreateSchema, db: Session = Depends(get_db)):
    """
    Submits a validated lead. Validates that the phone contact is unique.
    """
    # 1. Perform database state constraint check (duplication prevention)
    phone_exists = db.query(DbContact).filter(DbContact.phone == payload.phone).first()
    if phone_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CRM Collision Guard: A contact with phone number {payload.phone} already exists in records."
        )

    # In a real environment, persist Contact and Lead database rows here
    import uuid
    new_contact = DbContact(
        id=str(uuid.uuid4()),
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone
    )
    db.add(new_contact)
    db.commit()

    return {
        "status": "success",
        "message": f"Lead profile created successfully for {payload.full_name}.",
        "contact_id": new_contact.id
    }
