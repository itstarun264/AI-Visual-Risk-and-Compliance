import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime
from decimal import Decimal
import uuid

# Set up test DB using memory SQLite for isolated, fast execution
from app.database import Base, get_db
from app.main import app
from app.models import User, UserProfile
from app.security import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_user_registration_and_login():
    # 1. Register User
    reg_payload = {
        "name": "Arjun Test",
        "email": "test@compliance.ai",
        "password": "password123",
        "confirm_password": "password123"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@compliance.ai"
    assert "id" in data
    
    # 2. Login User
    login_payload = {
        "email": "test@compliance.ai",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]
    
    # 3. Read current user details
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@compliance.ai"

def test_profile_crud():
    # Register and login
    reg_payload = {
        "name": "Arjun Test",
        "email": "test@compliance.ai",
        "password": "password123",
        "confirm_password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    token = client.post("/api/v1/auth/login", json={"email": "test@compliance.ai", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET default profile
    response = client.get("/api/v1/profile", headers=headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["risk_tolerance"] == "Medium"
    
    # PUT update profile
    update_payload = {
        "age": 28,
        "risk_tolerance": "High",
        "occupation": "Developer",
        "compliance_policy": "Strict Compliance",
        "bio": "Test biography"
    }
    response = client.put("/api/v1/profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["age"] == 28
    assert profile["risk_tolerance"] == "High"
    assert profile["compliance_policy"] == "Strict Compliance"

def test_financial_calculations():
    # Register and login
    reg_payload = {
        "name": "Arjun Test",
        "email": "test@compliance.ai",
        "password": "password123",
        "confirm_password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    token = client.post("/api/v1/auth/login", json={"email": "test@compliance.ai", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Post new financial record (low risk scenario)
    fin_payload = {
        "monthly_income": 10000.00,
        "monthly_expenses": 3000.00,
        "savings_goal": 2000.00,
        "total_debt": 5000.00
    }
    response = client.post("/api/v1/financial", json=fin_payload, headers=headers)
    assert response.status_code == 201
    record = response.json()
    assert float(record["expense_ratio"]) == 0.3
    assert float(record["savings_ratio"]) == 0.2
    assert float(record["debt_ratio"]) == 0.5
    assert record["risk_category"] == "LOW"
    assert record["compliance_status"] == "COMPLIANT"

    # Post critical financial record (critical risk scenario)
    fin_payload_critical = {
        "monthly_income": 10000.00,
        "monthly_expenses": 9500.00,
        "savings_goal": 500.00,
        "total_debt": 45000.00
    }
    response = client.post("/api/v1/financial", json=fin_payload_critical, headers=headers)
    assert response.status_code == 201
    record = response.json()
    assert record["risk_category"] == "CRITICAL"
    assert record["compliance_status"] == "NON_COMPLIANT"

def test_study_records():
    # Register and login
    reg_payload = {
        "name": "Arjun Test",
        "email": "test@compliance.ai",
        "password": "password123",
        "confirm_password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    token = client.post("/api/v1/auth/login", json={"email": "test@compliance.ai", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create session
    payload = {
        "subject": "Python Basics",
        "study_hours": 4.5,
        "focus_rating": 5,
        "tools": "VSCode"
    }
    response = client.post("/api/v1/study", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["subject"] == "Python Basics"
    assert float(data["focus_score"]) == 100.0
    assert data["learning_risk_marker"] == "SAFE"

def test_habit_compliance():
    # Register and login
    reg_payload = {
        "name": "Arjun Test",
        "email": "test@compliance.ai",
        "password": "password123",
        "confirm_password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    token = client.post("/api/v1/auth/login", json={"email": "test@compliance.ai", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create habit
    payload = {
        "habit_name": "Check Alarms",
        "category": "Security",
        "completed_today": True,
        "is_risk_associated": False
    }
    response = client.post("/api/v1/habits", json=payload, headers=headers)
    assert response.status_code == 201
    habit = response.json()
    assert habit["streak"] == 1
    assert habit["compliance_status"] == "COMPLIANT"


def test_dataset_import_is_separate_and_drives_analytics():
    client.post("/api/v1/auth/register", json={
        "name": "Dataset User", "email": "dataset@example.com",
        "password": "password123", "confirm_password": "password123",
    })
    token = client.post("/api/v1/auth/login", json={"email": "dataset@example.com", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    csv_data = """date,income_inr,total_expenses_inr,study_hours,focus_score,habit_completion_rate,savings_goal_progress,overall_risk_score,compliance_score,active_alerts
2026-06-01,80000,50000,2,75,0.70,0.60,40,78,0
2026-07-01,82000,54000,2.5,80,0.75,0.72,36,82,1
2026-08-01,84000,58000,3,85,0.80,0.84,32,86,0
"""
    response = client.post(
        "/api/v1/datasets/import",
        headers=headers,
        files={"file": ("activity.csv", csv_data, "text/csv")},
        data={"name": "Activity history"},
    )
    assert response.status_code == 201, response.text
    dataset = response.json()
    assert dataset["row_count"] == 3
    assert dataset["column_count"] == 10

    # Imported rows are not copied into user-entered finance records.
    assert client.get("/api/v1/financial", headers=headers).json() == []

    dashboard = client.get(f"/api/v1/datasets/{dataset['id']}/dashboard-analysis", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["summary"]["financial_count"] == 3
    assert dashboard.json()["summary"]["alert_count"] == 1

    forecast = client.get(f"/api/v1/datasets/{dataset['id']}/forecast-summary", headers=headers)
    assert forecast.status_code == 200
    result = forecast.json()
    assert result["source"] == "dataset"
    assert result["data_points"] == 3
    assert result["financial"]["next_month_expenses"] > 58000
    assert result["goals"][0]["probability"] == 84
