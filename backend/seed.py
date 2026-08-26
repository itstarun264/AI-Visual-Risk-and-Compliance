import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal

# Add current path to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import User, UserProfile, FinancialRecord, StudyRecord, HabitRecord, VisualDetection, Alert, UserActivityHistory
from app.security import get_password_hash
from app.services import RiskIntelligenceEngine

def seed_database(seed_mock_data=True):
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding users...")
        # Create a demo user
        hashed_password = get_password_hash("password123")
        user = User(
            name="Arjun Mehta",
            email="inspector@compliance.ai",
            password_hash=hashed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Created user: {user.email} (ID: {user.id})")

        # Create Profile
        profile = UserProfile(
            user_id=user.id,
            age=29,
            occupation="Senior HSE Inspector",
            risk_tolerance="Medium",
            compliance_policy="Standard Compliance",
            bio="Managing plant audits, workforce PPE adherence, safety visual intelligence integrations, and financial compliance models."
        )
        db.add(profile)
        db.commit()

        if not seed_mock_data:
            # Sync Risk Profile and finish
            print("Recalculating and syncing Risk Profile...")
            RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=user.id)
            print("Database initialized successfully (clear state)!")
            return

        print("Seeding financial records...")
        # Add a couple of financial records to show history
        # 1. 2 months ago (Low risk)
        fin1 = FinancialRecord(
            user_id=user.id,
            monthly_income=Decimal("9000.00"),
            monthly_expenses=Decimal("4100.00"),
            savings_goal=Decimal("1500.00"),
            total_debt=Decimal("4500.00"),
            expense_ratio=Decimal("0.4556"),
            savings_ratio=Decimal("0.1667"),
            debt_ratio=Decimal("0.5000"),
            risk_category="LOW",
            compliance_status="COMPLIANT",
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        # 2. 1 month ago (Medium risk)
        fin2 = FinancialRecord(
            user_id=user.id,
            monthly_income=Decimal("9000.00"),
            monthly_expenses=Decimal("5800.00"),
            savings_goal=Decimal("1500.00"),
            total_debt=Decimal("11000.00"),
            expense_ratio=Decimal("0.6444"),
            savings_ratio=Decimal("0.1667"),
            debt_ratio=Decimal("1.2222"),
            risk_category="MEDIUM",
            compliance_status="COMPLIANT",
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        # 3. Present record (High Risk)
        fin3 = FinancialRecord(
            user_id=user.id,
            monthly_income=Decimal("8000.00"),
            monthly_expenses=Decimal("6900.00"),
            savings_goal=Decimal("1000.00"),
            total_debt=Decimal("26000.00"),
            expense_ratio=Decimal("0.8625"),
            savings_ratio=Decimal("0.1250"),
            debt_ratio=Decimal("3.2500"),
            risk_category="HIGH",
            compliance_status="NON_COMPLIANT",
            created_at=datetime.utcnow()
        )
        db.add_all([fin1, fin2, fin3])

        print("Seeding study logs...")
        # Add study records
        s1 = StudyRecord(
            user_id=user.id,
            subject="Neural Networks & Object Detection",
            study_hours=Decimal("4.50"),
            focus_rating=5,
            tools="PyTorch, Jupyter Notebooks",
            focus_score=Decimal("100.00"),
            learning_risk_score=Decimal("15.00"),
            learning_risk_marker="SAFE",
            created_at=datetime.utcnow() - timedelta(days=4)
        )
        s2 = StudyRecord(
            user_id=user.id,
            subject="FastAPI Service Optimizations",
            study_hours=Decimal("2.00"),
            focus_rating=3,
            tools="FastAPI, PostgreSQL",
            focus_score=Decimal("60.00"),
            learning_risk_score=Decimal("35.00"),
            learning_risk_marker="LOW",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        s3 = StudyRecord(
            user_id=user.id,
            subject="YOLO v8 PPE Model Tuning",
            study_hours=Decimal("3.50"),
            focus_rating=4,
            tools="YOLO v8, OpenCV",
            focus_score=Decimal("80.00"),
            learning_risk_score=Decimal("15.00"),
            learning_risk_marker="SAFE",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add_all([s1, s2, s3])

        print("Seeding compliance habits...")
        # Add habit records
        h1 = HabitRecord(
            user_id=user.id,
            habit_name="Pre-shift PPE Site Walkthrough",
            category="Health & Safety",
            completed_today=True,
            is_risk_associated=False,
            streak=12,
            last_completed=datetime.utcnow(),
            compliance_status="COMPLIANT",
            created_at=datetime.utcnow() - timedelta(days=12)
        )
        h2 = HabitRecord(
            user_id=user.id,
            habit_name="Review Monthly Budget & Cash Flow",
            category="Financial Compliance",
            completed_today=True,
            is_risk_associated=False,
            streak=4,
            last_completed=datetime.utcnow(),
            compliance_status="COMPLIANT",
            created_at=datetime.utcnow() - timedelta(days=4)
        )
        h3 = HabitRecord(
            user_id=user.id,
            habit_name="Late-night Coding (Fatigue Hazard)",
            category="Productivity",
            completed_today=False,
            is_risk_associated=True,
            streak=0,
            last_completed=None,
            compliance_status="NON_COMPLIANT",
            created_at=datetime.utcnow()
        )
        db.add_all([h1, h2, h3])

        print("Seeding visual detections...")
        # Add mock visual detections (safety violations)
        d1 = VisualDetection(
            user_id=user.id,
            image_path="uploads/demo_violation.jpg",
            model_name="MockVisionModel",
            class_name="Missing Helmet (PPE Violation)",
            confidence=0.94,
            risk_level="HIGH",
            bounding_box={"left": 28.0, "top": 17.0, "width": 10.0, "height": 12.0},
            timestamp=datetime.utcnow() - timedelta(hours=2)
        )
        d2 = VisualDetection(
            user_id=user.id,
            image_path="uploads/demo_violation.jpg",
            model_name="MockVisionModel",
            class_name="Electrical Panel (Exposed Wiring)",
            confidence=0.87,
            risk_level="HIGH",
            bounding_box={"left": 52.0, "top": 27.0, "width": 27.0, "height": 45.0},
            timestamp=datetime.utcnow() - timedelta(hours=2)
        )
        db.add_all([d1, d2])

        print("Seeding alerts...")
        # Alert warning
        a1 = Alert(
            user_id=user.id,
            severity="WARNING",
            title="Exceeded Safe Expense Threshold",
            description="Your recent financial entry shows an expense-to-income ratio of 86%, exceeding the safe compliance limit of 70%.",
            status="UNREAD",
            timestamp=datetime.utcnow() - timedelta(hours=1)
        )
        db.add(a1)

        print("Seeding activity audit logs...")
        # Activities
        act1 = UserActivityHistory(
            user_id=user.id,
            action_type="USER_REGISTER",
            endpoint="/api/v1/auth/register",
            ip_address="127.0.0.1",
            status_code=201,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            metadata={"email": user.email}
        )
        act2 = UserActivityHistory(
            user_id=user.id,
            action_type="USER_LOGIN",
            endpoint="/api/v1/auth/login",
            ip_address="127.0.0.1",
            status_code=200,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            metadata={"email": user.email}
        )
        act3 = UserActivityHistory(
            user_id=user.id,
            action_type="PROFILE_UPDATE",
            endpoint="/api/v1/profile",
            ip_address="127.0.0.1",
            status_code=200,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            metadata={"occupation": profile.occupation}
        )
        db.add_all([act1, act2, act3])
        db.commit()

        # Calculate final aggregated Risk Profile
        print("Recalculating and syncing Risk Profile...")
        RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=user.id)
        
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    seed_mock = True
    if "--clear-only" in sys.argv:
        seed_mock = False
    seed_database(seed_mock_data=seed_mock)
