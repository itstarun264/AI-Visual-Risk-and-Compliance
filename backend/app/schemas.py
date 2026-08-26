from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import List, Optional, Any, Dict
from uuid import UUID
from decimal import Decimal

# Shared ORM Mode
class ORMBase(BaseModel):
    model_config = {
        "from_attributes": True
    }

# ==========================================
# AUTHENTICATION SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str

    @field_validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values.data and v != values.data["password"]:
            raise ValueError("passwords do not match")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None

class UserOut(ORMBase):
    id: UUID
    name: str
    email: str
    created_at: datetime

# ==========================================
# USER PROFILE SCHEMAS
# ==========================================
class ProfileCreateOrUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120)
    risk_tolerance: str = Field("Medium", pattern="^(Low|Medium|High|Critical)$")
    occupation: Optional[str] = Field(None, max_length=255)
    compliance_policy: str = Field("Standard Compliance", pattern="^(Basic|Standard|Strict|Enterprise) Compliance$")
    bio: Optional[str] = None

class ProfileOut(ORMBase):
    id: UUID
    user_id: UUID
    age: Optional[int]
    risk_tolerance: str
    occupation: Optional[str]
    compliance_policy: str
    bio: Optional[str]
    updated_at: datetime

# ==========================================
# FINANCIAL DATA SCHEMAS
# ==========================================
class FinancialRecordCreate(BaseModel):
    monthly_income: Decimal = Field(..., gt=0)
    monthly_expenses: Decimal = Field(..., ge=0)
    savings_goal: Decimal = Field(..., ge=0)
    total_debt: Decimal = Field(..., ge=0)

class FinancialRecordOut(ORMBase):
    id: UUID
    user_id: UUID
    monthly_income: Decimal
    monthly_expenses: Decimal
    savings_goal: Decimal
    total_debt: Decimal
    expense_ratio: Decimal
    savings_ratio: Decimal
    debt_ratio: Decimal
    risk_category: str
    compliance_status: str
    created_at: datetime

# ==========================================
# STUDY / ACADEMIC DATA SCHEMAS
# ==========================================
class StudyRecordCreate(BaseModel):
    subject: str = Field(..., min_length=2, max_length=180)
    study_hours: Decimal = Field(..., ge=0, le=24)
    focus_rating: int = Field(..., ge=1, le=5)
    tools: Optional[str] = Field(None, max_length=255)

class StudyRecordOut(ORMBase):
    id: UUID
    user_id: UUID
    subject: str
    study_hours: Decimal
    focus_rating: int
    tools: Optional[str]
    focus_score: Decimal
    learning_risk_score: Decimal
    learning_risk_marker: str
    created_at: datetime

# ==========================================
# HABIT SCHEMAS
# ==========================================
class HabitRecordCreate(BaseModel):
    habit_name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    completed_today: bool = False
    is_risk_associated: bool = False

class HabitRecordUpdate(BaseModel):
    completed_today: bool
    is_risk_associated: bool

class HabitRecordOut(ORMBase):
    id: UUID
    user_id: UUID
    habit_name: str
    category: str
    completed_today: bool
    is_risk_associated: bool
    streak: int
    last_completed: Optional[datetime]
    compliance_status: str
    created_at: datetime

# ==========================================
# RISK PROFILE SCHEMAS
# ==========================================
class RiskProfileOut(ORMBase):
    id: UUID
    user_id: UUID
    overall_risk_score: int
    financial_risk_score: int
    academic_risk_score: int
    behavioral_risk_score: int
    visual_risk_score: int
    compliance_score: int
    factors: List[str]
    updated_at: datetime

# ==========================================
# VISUAL DETECTION SCHEMAS
# ==========================================
class BoundingBox(BaseModel):
    left: float
    top: float
    width: float
    height: float

class VisualDetectionOut(ORMBase):
    id: UUID
    user_id: UUID
    image_path: str
    model_name: str
    class_name: str
    confidence: float
    risk_level: str
    bounding_box: Dict[str, Any]
    timestamp: datetime

# ==========================================
# ALERT SCHEMAS
# ==========================================
class AlertOut(ORMBase):
    id: UUID
    user_id: UUID
    severity: str
    title: str
    description: str
    status: str
    timestamp: datetime

# ==========================================
# AUDIT TRAIL SCHEMAS
# ==========================================
class UserActivityHistoryOut(ORMBase):
    id: UUID
    user_id: Optional[UUID]
    timestamp: datetime
    action_type: str
    endpoint: str
    ip_address: Optional[str]
    activity_metadata: Optional[Dict[str, Any]]
    status_code: int
    user_agent: Optional[str]

# ==========================================
# DASHBOARD SCHEMAS
# ==========================================
class DashboardSummaryOut(BaseModel):
    financial_count: int
    study_count: int
    habit_count: int
    compliance_score: int
    overall_risk_score: int
    overall_risk_level: str
    active_risks_count: int
    high_risks_count: int
    financial_risk_score: int = 0
    academic_risk_score: int = 0
    behavioral_risk_score: int = 0
    visual_risk_score: int = 0
