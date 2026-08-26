from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, FinancialRecord, StudyRecord, HabitRecord, VisualDetection
from app.security import get_current_user
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/compliance", tags=["Compliance Engine"])

@router.get("")
def get_compliance_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, compliance_policy="Standard Compliance", risk_tolerance="Medium")

    financials = db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).all()
    studies = db.query(StudyRecord).filter(StudyRecord.user_id == current_user.id).all()
    habits = db.query(HabitRecord).filter(HabitRecord.user_id == current_user.id).all()
    detections = db.query(VisualDetection).filter(VisualDetection.user_id == current_user.id).all()

    # Calculate detailed scores
    analysis = RiskIntelligenceEngine.calculate_scores(
        profile=profile,
        financial_records=financials,
        study_records=studies,
        habits=habits,
        detections=detections
    )

    # Build category breakdown scores
    # 1. PPE compliance: base 90%, reduces if detections show missing helmets/vests
    ppe_score = 100
    missing_ppe = [d for d in detections if "PPE" in d.class_name or "Helmet" in d.class_name or "Vest" in d.class_name]
    if missing_ppe:
        ppe_score -= (len(missing_ppe) * 15)
    ppe_score = max(50, min(100, ppe_score))

    # 2. Fire Safety: reduces if blocked paths or fire risks detected
    fire_score = 100
    fire_hazards = [d for d in detections if "Exit" in d.class_name or "Pathway" in d.class_name or "Fire" in d.class_name or "Smoke" in d.class_name]
    if fire_hazards:
        fire_score -= (len(fire_hazards) * 20)
    fire_score = max(40, min(100, fire_score))

    # 3. Electrical Safety: reduces if electrical panels or exposed wires are flagged
    elec_score = 100
    elec_hazards = [d for d in detections if "Panel" in d.class_name or "Electrical" in d.class_name or "wiring" in d.class_name or "wire" in d.class_name]
    if elec_hazards:
        elec_score -= (len(elec_hazards) * 20)
    elec_score = max(35, min(100, elec_score))

    # 4. Workplace Safety: composite of habits completed in security/health & safety
    work_score = 100
    workplace_habits = [h for h in habits if h.category in ["Security", "Health & Safety", "Work Compliance"]]
    if workplace_habits:
        completed = sum(1 for h in workplace_habits if h.completed_today)
        work_score = int((completed / len(workplace_habits)) * 100)
    else:
        # Default safety baseline
        work_score = 90

    return {
        "compliance_score": analysis["compliance_score"],
        "compliance_status": analysis["compliance_status"],
        "violations": analysis["violations"],
        "recommendations": analysis["recommendations"],
        "category_scores": {
            "ppe_compliance": ppe_score,
            "fire_safety": fire_score,
            "electrical_safety": elec_score,
            "workplace_safety": work_score
        }
    }
