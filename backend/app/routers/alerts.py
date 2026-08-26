from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Alert
from app.schemas import AlertOut
from app.security import get_current_user, log_activity

router = APIRouter(prefix="/alerts", tags=["Alert & Notification System"])

class AlertUpdate(BaseModel):
    status: str # UNREAD, READ, RESOLVED

@router.get("", response_model=List[AlertOut])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Alert).filter(
        Alert.user_id == current_user.id
    ).order_by(Alert.timestamp.desc()).all()

@router.put("/{id}", response_model=AlertOut)
def update_alert(
    id: UUID,
    alert_in: AlertUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(
        Alert.id == id,
        Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = alert_in.status
    db.commit()
    db.refresh(alert)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="ALERT_UPDATE",
        endpoint=f"/api/v1/alerts/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"alert_id": str(id), "status": alert.status}
    )

    return alert

@router.delete("/{id}")
def delete_alert(
    id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(
        Alert.id == id,
        Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(alert)
    db.commit()

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="ALERT_DELETE",
        endpoint=f"/api/v1/alerts/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"alert_id": str(id)}
    )

    return {"message": "Alert successfully deleted"}
