from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FinancialRecord, StudyRecord, HabitRecord, RiskProfile, VisualDetection
from app.schemas import DashboardSummaryOut
from app.security import get_current_user
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence Summary"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure risk profile is calculated
    rp = RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    
    financial_count = db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).count()
    study_count = db.query(StudyRecord).filter(StudyRecord.user_id == current_user.id).count()
    habit_count = db.query(HabitRecord).filter(HabitRecord.user_id == current_user.id).count()

    # Active risks count:
    # 1. Financial records with risk in HIGH or CRITICAL
    latest_fin = db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).order_by(FinancialRecord.created_at.desc()).first()
    active_fin = 1 if latest_fin and latest_fin.risk_category in ["HIGH", "CRITICAL"] else 0
    high_fin = 1 if latest_fin and latest_fin.risk_category == "CRITICAL" else 0

    # 2. Visual detections with risk in MEDIUM, HIGH, CRITICAL
    active_vis = db.query(VisualDetection).filter(
        VisualDetection.user_id == current_user.id,
        VisualDetection.risk_level.in_(["MEDIUM", "HIGH", "CRITICAL"])
    ).count()
    high_vis = db.query(VisualDetection).filter(
        VisualDetection.user_id == current_user.id,
        VisualDetection.risk_level.in_(["HIGH", "CRITICAL"])
    ).count()

    # 3. Habits marked as risk associated
    active_hab = db.query(HabitRecord).filter(
        HabitRecord.user_id == current_user.id,
        HabitRecord.is_risk_associated == True
    ).count()

    active_risks = active_fin + active_vis + active_hab
    high_risks = high_fin + high_vis
    has_user_records = financial_count + study_count + habit_count + active_vis > 0

    # Calculate risk level from score
    if rp.overall_risk_score <= 20:
        overall_level = "SAFE"
    elif rp.overall_risk_score <= 40:
        overall_level = "LOW"
    elif rp.overall_risk_score <= 60:
        overall_level = "MEDIUM"
    elif rp.overall_risk_score <= 80:
        overall_level = "HIGH"
    else:
        overall_level = "CRITICAL"

    return {
        "financial_count": financial_count,
        "study_count": study_count,
        "habit_count": habit_count,
        "compliance_score": rp.compliance_score if has_user_records else 0,
        "overall_risk_score": rp.overall_risk_score if has_user_records else 0,
        "overall_risk_level": overall_level if has_user_records else "NO DATA",
        "active_risks_count": active_risks,
        "high_risks_count": high_risks,
        "financial_risk_score": rp.financial_risk_score if has_user_records else 0,
        "academic_risk_score": rp.academic_risk_score if has_user_records else 0,
        "behavioral_risk_score": rp.behavioral_risk_score if has_user_records else 0,
        "visual_risk_score": rp.visual_risk_score if has_user_records else 0
    }
