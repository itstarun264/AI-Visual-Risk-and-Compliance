from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, UserActivityHistory
from app.schemas import UserActivityHistoryOut
from app.security import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[UserActivityHistoryOut])
def get_audit_trail(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user activities (we can fetch all activities related to this user)
    # Plus any system-wide logs (like registration, failed logins) that don't have user_id
    # but for simplicity, let's fetch all activities since there is only one inspector user running locally.
    # This aligns with displaying a comprehensive audit trail of what PostgreSQL has.
    logs = db.query(UserActivityHistory).order_by(
        UserActivityHistory.timestamp.desc()
    ).limit(limit).all()
    return logs
