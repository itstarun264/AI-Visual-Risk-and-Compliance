from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile
from app.schemas import ProfileCreateOrUpdate, ProfileOut
from app.security import get_current_user, log_activity
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/profile", tags=["User Profiles"])

@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        # Lazy initialization
        profile = UserProfile(
            user_id=current_user.id,
            age=30,
            risk_tolerance="Medium",
            occupation="Professional",
            compliance_policy="Standard Compliance",
            bio=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.post("", response_model=ProfileOut)
@router.put("", response_model=ProfileOut)
def update_profile(
    profile_in: ProfileCreateOrUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        
    profile.age = profile_in.age
    profile.risk_tolerance = profile_in.risk_tolerance
    profile.occupation = profile_in.occupation
    profile.compliance_policy = profile_in.compliance_policy
    profile.bio = profile_in.bio
    db.commit()
    db.refresh(profile)
    
    # Recalculate overall risk and compliance profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="PROFILE_UPDATE",
        endpoint="/api/v1/profile",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={
            "age": profile.age,
            "risk_tolerance": profile.risk_tolerance,
            "compliance_policy": profile.compliance_policy
        }
    )
    
    return profile
