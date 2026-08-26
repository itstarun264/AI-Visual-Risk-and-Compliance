from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from decimal import Decimal

from app.database import get_db
from app.models import User, StudyRecord
from app.schemas import StudyRecordCreate, StudyRecordOut
from app.security import get_current_user, log_activity
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/study", tags=["Study Records"])

def calculate_study_markers(hours: Decimal, focus_rating: int) -> tuple[Decimal, Decimal, str]:
    """
    Helper to calculate study focus_score, learning_risk_score, and marker.
    - focus_score: scale of 0-100 (rating * 20)
    - learning_risk_score: based on study volume (hours) and focus quality.
    """
    focus_score = Decimal(str(focus_rating * 20.0))
    
    # Calculate learning risk
    # High hours & high focus = low risk. Low hours & low focus = high risk.
    if hours >= Decimal("3.0") and focus_rating >= 4:
        risk_score = Decimal("15.0")
        marker = "SAFE"
    elif hours >= Decimal("2.0") and focus_rating >= 3:
        risk_score = Decimal("35.0")
        marker = "LOW"
    elif hours >= Decimal("1.0") and focus_rating >= 2:
        risk_score = Decimal("55.0")
        marker = "MEDIUM"
    elif hours > Decimal("0.0") and focus_rating >= 1:
        risk_score = Decimal("75.0")
        marker = "HIGH"
    else:
        risk_score = Decimal("95.0")
        marker = "CRITICAL"
        
    return focus_score, risk_score, marker

@router.post("", response_model=StudyRecordOut, status_code=status.HTTP_201_CREATED)
def create_study_record(
    record_in: StudyRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    focus_score, risk_score, marker = calculate_study_markers(
        record_in.study_hours, record_in.focus_rating
    )

    new_record = StudyRecord(
        user_id=current_user.id,
        subject=record_in.subject,
        study_hours=record_in.study_hours,
        focus_rating=record_in.focus_rating,
        tools=record_in.tools,
        focus_score=focus_score,
        learning_risk_score=risk_score,
        learning_risk_marker=marker
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="STUDY_CREATE",
        endpoint="/api/v1/study",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=201,
        metadata={
            "record_id": str(new_record.id),
            "subject": record_in.subject,
            "focus_rating": record_in.focus_rating
        }
    )

    return new_record

@router.get("", response_model=List[StudyRecordOut])
def list_study_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(StudyRecord).filter(
        StudyRecord.user_id == current_user.id
    ).order_by(StudyRecord.created_at.desc()).all()
    return records

@router.put("/{id}", response_model=StudyRecordOut)
def update_study_record(
    id: UUID,
    record_in: StudyRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(StudyRecord).filter(
        StudyRecord.id == id,
        StudyRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Study record not found")

    focus_score, risk_score, marker = calculate_study_markers(
        record_in.study_hours, record_in.focus_rating
    )

    record.subject = record_in.subject
    record.study_hours = record_in.study_hours
    record.focus_rating = record_in.focus_rating
    record.tools = record_in.tools
    record.focus_score = focus_score
    record.learning_risk_score = risk_score
    record.learning_risk_marker = marker

    db.commit()
    db.refresh(record)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="STUDY_UPDATE",
        endpoint=f"/api/v1/study/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"record_id": str(id), "subject": record.subject}
    )

    return record

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_study_record(
    id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(StudyRecord).filter(
        StudyRecord.id == id,
        StudyRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Study record not found")

    db.delete(record)
    db.commit()

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="STUDY_DELETE",
        endpoint=f"/api/v1/study/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"record_id": str(id)}
    )

    return {"message": "Study session successfully deleted"}
