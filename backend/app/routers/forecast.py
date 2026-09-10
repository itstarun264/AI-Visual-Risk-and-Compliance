from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.forecasting import ForecastingEngine
from app.models import FinancialRecord, Goal, HabitRecord, StudyRecord, UnexpectedExpense, User
from app.schemas import GoalCreate, GoalOut
from app.security import get_current_user, log_activity

router = APIRouter(prefix="/forecast", tags=["Forecasting & Predictive Analytics"])


@router.get("/summary")
def get_forecast_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ForecastingEngine.summary(
        financials=db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).all(),
        studies=db.query(StudyRecord).filter(StudyRecord.user_id == current_user.id).all(),
        habits=db.query(HabitRecord).filter(HabitRecord.user_id == current_user.id).all(),
        goals=db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all(),
        unexpected_expenses=db.query(UnexpectedExpense).filter(UnexpectedExpense.user_id == current_user.id).all(),
    )


@router.get("/goals", response_model=list[GoalOut])
def list_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()


@router.post("/goals", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(goal_in: GoalCreate, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = Goal(user_id=current_user.id, **goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    log_activity(
        db=db, user_id=current_user.id, action_type="GOAL_CREATE", endpoint="/api/v1/forecast/goals",
        ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"),
        status_code=201, metadata={"goal_id": str(goal.id), "goal_type": goal.goal_type, "timeframe": goal.timeframe},
    )
    return goal


@router.delete("/goals/{goal_id}", status_code=status.HTTP_200_OK)
def delete_goal(goal_id: UUID, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    log_activity(
        db=db, user_id=current_user.id, action_type="GOAL_DELETE", endpoint=f"/api/v1/forecast/goals/{goal_id}",
        ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"),
        status_code=200, metadata={"goal_id": str(goal_id)},
    )
    return {"message": "Goal removed"}
