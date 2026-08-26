from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RiskProfile
from app.schemas import RiskProfileOut
from app.security import get_current_user
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/risk", tags=["Risk Profiling"])

@router.get("", response_model=RiskProfileOut)
def get_risk_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Sync first to ensure calculations are up to date
    risk_profile = RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    return risk_profile

@router.post("/recalculate", response_model=RiskProfileOut)
def force_recalculate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    risk_profile = RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    return risk_profile
