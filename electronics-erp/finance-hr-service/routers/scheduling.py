from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(
    prefix="/admin/scheduling",
    tags=["Workforce Optimization Engine"]
)

# Explicit schema models tracking parameters
class ShiftRequirement(BaseModel):
    station_identifier: str
    start_time: datetime
    end_time: datetime
    required_cert_tag: Optional[str] = None

class EmployeeCandidate(BaseModel):
    user_id: str
    name: str
    active_cert_tags: List[str]
    is_available: bool

class AutoAssignmentResponse(BaseModel):
    station_identifier: str
    assigned_user_id: str
    assigned_name: str
    optimization_score: float

@router.post("/optimize-empty-slots", response_model=List[AutoAssignmentResponse])
async def run_shift_allocation_matrix(
    requirements: List[ShiftRequirement], 
    candidates: List[EmployeeCandidate]
):
    """
    Automated Optimization Engine:
    Parses open shift parameters and matches them against the available staff pools while 
    enforcing skills tracking rules to prevent compliance lockout failures on the floor.
    """
    allocation_results = []

    for shift in requirements:
        matched_candidate = None
        highest_score = 0.0

        for worker in candidates:
            # Rule 1: Immediate dropout if worker availability validation fails
            if not worker.is_available:
                continue

            # Rule 2: Enforce Skills Matrix compliance constraints
            if shift.required_cert_tag and shift.required_cert_tag not in worker.active_cert_tags:
                continue  # Skip employee if they lack the active cert tag

            # Calculate a mock matching score (in production, link this to historical bench speeds or overtime caps)
            current_score = 100.0 if shift.required_cert_tag in worker.active_cert_tags else 50.0

            if current_score > highest_score:
                highest_score = current_score
                matched_candidate = worker

        # Complete tracking matrix generation step
        if matched_candidate:
            allocation_results.append(
                AutoAssignmentResponse(
                    station_identifier=shift.station_identifier,
                    assigned_user_id=matched_candidate.user_id,
                    assigned_name=matched_candidate.name,
                    optimization_score=highest_score
                )
            )
        else:
            # Raise an operational exception if a critical shift cannot be filled safely by any active employee
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"SCHEDULING_GAP_ALERT: No qualified employee matches station criteria for '{shift.station_identifier}' requiring certification '{shift.required_cert_tag}'."
            )

    return allocation_results
