import jwt
from datetime import datetime, timedelta
from typing import Union, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User, UserActivityHistory

# Password Hashing Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Scheme Configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store user ID as string in token payload
    if "sub" in to_encode and isinstance(to_encode["sub"], UUID):
        to_encode["sub"] = str(to_encode["sub"])
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = UUID(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def log_activity(
    db: Session,
    user_id: Optional[UUID],
    action_type: str,
    endpoint: str,
    ip_address: Optional[str],
    user_agent: Optional[str],
    status_code: int,
    metadata: Optional[dict] = None
):
    """
    Utility function to create audit logs inside user_activity_history table
    """
    try:
        activity = UserActivityHistory(
            user_id=user_id,
            action_type=action_type,
            endpoint=endpoint,
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=status_code,
            activity_metadata=metadata or {}
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        db.rollback()
        # In a real app we might log this to stderr, but we don't block requests if auditing fails
        print(f"Failed to log activity: {e}")
