from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import User, HabitRecord
from app.schemas import HabitRecordCreate, HabitRecordUpdate, HabitRecordOut
from app.security import get_current_user, log_activity
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/habits", tags=["Habit Tracking"])

def determine_habit_compliance(completed: bool, risk_associated: bool) -> str:
    if risk_associated:
        return "NON_COMPLIANT"
    return "COMPLIANT" if completed else "PARTIALLY_COMPLIANT"

@router.post("", response_model=HabitRecordOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit_in: HabitRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    compliance = determine_habit_compliance(habit_in.completed_today, habit_in.is_risk_associated)
    
    streak = 1 if habit_in.completed_today else 0
    last_completed = datetime.utcnow() if habit_in.completed_today else None

    new_habit = HabitRecord(
        user_id=current_user.id,
        habit_name=habit_in.habit_name,
        category=habit_in.category,
        completed_today=habit_in.completed_today,
        is_risk_associated=habit_in.is_risk_associated,
        streak=streak,
        last_completed=last_completed,
        compliance_status=compliance
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="HABIT_CREATE",
        endpoint="/api/v1/habits",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=201,
        metadata={
            "habit_id": str(new_habit.id),
            "habit_name": new_habit.habit_name,
            "compliance_status": compliance
        }
    )

    return new_habit

@router.get("", response_model=List[HabitRecordOut])
def list_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(HabitRecord).filter(
        HabitRecord.user_id == current_user.id
    ).order_by(HabitRecord.created_at.desc()).all()

@router.put("/{id}", response_model=HabitRecordOut)
def update_habit(
    id: UUID,
    habit_in: HabitRecordUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(HabitRecord).filter(
        HabitRecord.id == id,
        HabitRecord.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit record not found")

    compliance = determine_habit_compliance(habit_in.completed_today, habit_in.is_risk_associated)
    
    # Adjust streak
    if habit_in.completed_today and not habit.completed_today:
        habit.streak += 1
        habit.last_completed = datetime.utcnow()
    elif not habit_in.completed_today:
        habit.streak = 0
        
    habit.completed_today = habit_in.completed_today
    habit.is_risk_associated = habit_in.is_risk_associated
    habit.compliance_status = compliance

    db.commit()
    db.refresh(habit)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="HABIT_UPDATE",
        endpoint=f"/api/v1/habits/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"habit_id": str(id), "completed_today": habit.completed_today}
    )

    return habit

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_habit(
    id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(HabitRecord).filter(
        HabitRecord.id == id,
        HabitRecord.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit record not found")

    db.delete(habit)
    db.commit()

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="HABIT_DELETE",
        endpoint=f"/api/v1/habits/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"habit_id": str(id)}
    )

    return {"message": "Habit successfully deleted"}
