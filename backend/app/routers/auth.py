from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import User, UserProfile, RiskProfile
from app.schemas import UserRegister, UserLogin, Token, UserOut
from app.security import verify_password, get_password_hash, create_access_token, get_current_user, log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        log_activity(
            db=db,
            user_id=None,
            action_type="USER_REGISTER_FAILED",
            endpoint="/api/v1/auth/register",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status_code=400,
            metadata={"email": user_in.email, "reason": "Email already registered"}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize profile
    profile = UserProfile(
        user_id=new_user.id,
        age=30,
        risk_tolerance="Medium",
        occupation="Professional",
        compliance_policy="Standard Compliance",
        bio=""
    )
    db.add(profile)
    
    # Initialize Risk Profile
    risk_profile = RiskProfile(
        user_id=new_user.id,
        overall_risk_score=10,
        financial_risk_score=10,
        academic_risk_score=10,
        behavioral_risk_score=10,
        visual_risk_score=10,
        compliance_score=90,
        factors=["New user registration initialized."]
    )
    db.add(risk_profile)
    db.commit()
    
    # Log successful registration
    log_activity(
        db=db,
        user_id=new_user.id,
        action_type="USER_REGISTER",
        endpoint="/api/v1/auth/register",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=201,
        metadata={"email": new_user.email}
    )
    
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        log_activity(
            db=db,
            user_id=None,
            action_type="USER_LOGIN_FAILED",
            endpoint="/api/v1/auth/login",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status_code=401,
            metadata={"email": user_in.email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id})
    
    log_activity(
        db=db,
        user_id=user.id,
        action_type="USER_LOGIN",
        endpoint="/api/v1/auth/login",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"email": user.email}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="LOGOUT",
        endpoint="/api/v1/auth/logout",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={}
    )
    return {"message": "Successfully logged out"}
