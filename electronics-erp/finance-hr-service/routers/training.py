from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/admin/training",
    tags=["Personnel Training & Certifications Compliance"]
)

# ====================================================================
# DATA SCHEMAS (PYDANTIC)
# ====================================================================

class CourseEnrollment(BaseModel):
    user_id: str
    course_id: str
    course_name: str
    certification_tag: str  # e.g., 'WISE_L2', 'IPC-A-610'

class ModuleCompletionSubmission(BaseModel):
    user_id: str
    course_id: str
    certification_tag: str
    final_score: float = Field(..., ge=0.0, le=100.0)
    instructor_id: str

class CertificationStatusResponse(BaseModel):
    user_id: str
    certification_tag: str
    issued_at: datetime
    expires_at: datetime
    is_valid: bool

# ====================================================================
# OPERATIONAL ROUTERS / CORE ENGINE
# ====================================================================

@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_technician_in_module(enrollment: CourseEnrollment):
    """
    Registers an active staff member or service technician into an 
    advanced technical hardware compliance module tracking pipeline.
    """
    # In production, substitute this block with an active database connection execution:
    # await db.execute("INSERT INTO training_enrollments ...")
    
    return {
        "status": "ENROLLMENT_SUCCESSFUL",
        "user_id": enrollment.user_id,
        "course_id": enrollment.course_id,
        "enrolled_at": datetime.utcnow()
    }

@router.post("/verify-completion", response_model=CertificationStatusResponse)
async def evaluate_module_completion(submission: ModuleCompletionSubmission):
    """
    Evaluates final grades for service certifications. If the score matches 
    or exceeds corporate compliance benchmarks (e.g., >= 85.0%), a valid, 
    secure hardware skill certification tag is appended to the user profile.
    """
    COMPLIANCE_PASS_THRESHOLD = 85.0

    if submission.final_score < COMPLIANCE_PASS_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"COMPLIANCE_FAILURE: Final module score ({submission.final_score}%) falls below statutory certification thresholds ({COMPLIANCE_PASS_THRESHOLD}%)."
        )

    # Calculate statutory certification life cycle (e.g., certificates expire after 2 years)
    issued_date = datetime.utcnow()
    expiration_date = issued_date + timedelta(days=730)

    # Database update pipeline mock-up:
    # Update the user_certifications cross-reference schema matrix inside PostgreSQL 
    # to naturally update automated shift capabilities checked by 'scheduling.py'.
    
    return CertificationStatusResponse(
        user_id=submission.user_id,
        certification_tag=submission.certification_tag.upper(),
        issued_at=issued_date,
        expires_at=expiration_date,
        is_valid=True
    )

@router.get("/audit-log/{user_id}", response_model=List[CertificationStatusResponse])
async def check_technician_certification_matrix(user_id: str):
    """
    Returns the complete structured array of active and expired skill 
    tags belonging to a target technician for labor compliance verification.
    """
    # Sample fallback telemetry response mapping standard historical db schema queries
    mock_compliance_matrix = [
        CertificationStatusResponse(
            user_id=user_id,
            certification_tag="COMPTIA_A+",
            issued_at=datetime.utcnow() - timedelta(days=400),
            expires_at=datetime.utcnow() + timedelta(days=330),
            is_valid=True
        ),
        CertificationStatusResponse(
            user_id=user_id,
            certification_tag="WISE_L1",
            issued_at=datetime.utcnow() - timedelta(days=800),
            expires_at=datetime.utcnow() - timedelta(days=70), # Outdated certificate
            is_valid=False
        )
    ]
    
    return mock_compliance_matrix
