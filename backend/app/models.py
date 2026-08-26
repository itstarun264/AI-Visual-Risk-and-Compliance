import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, Numeric, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    financial_records = relationship("FinancialRecord", back_populates="user", cascade="all, delete-orphan")
    study_records = relationship("StudyRecord", back_populates="user", cascade="all, delete-orphan")
    habit_records = relationship("HabitRecord", back_populates="user", cascade="all, delete-orphan")
    risk_profiles = relationship("RiskProfile", back_populates="user", cascade="all, delete-orphan")
    visual_detections = relationship("VisualDetection", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    activity_history = relationship("UserActivityHistory", back_populates="user", cascade="all, delete-orphan")
    compliance_records = relationship("ComplianceRecord", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    age = Column(Integer, nullable=True)
    risk_tolerance = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    occupation = Column(String(255), nullable=True)
    compliance_policy = Column(String(100), default="Standard Compliance")  # Basic, Standard, Strict, Enterprise
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")

class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    monthly_income = Column(Numeric(12, 2), nullable=False)
    monthly_expenses = Column(Numeric(12, 2), nullable=False)
    savings_goal = Column(Numeric(12, 2), nullable=False)
    total_debt = Column(Numeric(12, 2), nullable=False)
    
    # Calculated metrics
    expense_ratio = Column(Numeric(5, 4), nullable=False)
    savings_ratio = Column(Numeric(5, 4), nullable=False)
    debt_ratio = Column(Numeric(8, 4), nullable=False)
    risk_category = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    compliance_status = Column(String(50), nullable=False)  # COMPLIANT, NON_COMPLIANT, etc.
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="financial_records")

class StudyRecord(Base):
    __tablename__ = "study_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(180), nullable=False)
    study_hours = Column(Numeric(5, 2), nullable=False)
    focus_rating = Column(Integer, nullable=False)  # 1 to 5
    tools = Column(String(255), nullable=True)
    
    # Calculated metrics
    focus_score = Column(Numeric(5, 2), nullable=False)
    learning_risk_score = Column(Numeric(5, 2), nullable=False)
    learning_risk_marker = Column(String(50), nullable=False)  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="study_records")

class HabitRecord(Base):
    __tablename__ = "habit_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    habit_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    completed_today = Column(Boolean, default=False, nullable=False)
    is_risk_associated = Column(Boolean, default=False, nullable=False)
    streak = Column(Integer, default=0, nullable=False)
    last_completed = Column(DateTime(timezone=True), nullable=True)
    compliance_status = Column(String(50), nullable=False)  # COMPLIANT, NON_COMPLIANT
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="habit_records")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overall_risk_score = Column(Integer, default=0, nullable=False)
    financial_risk_score = Column(Integer, default=0, nullable=False)
    academic_risk_score = Column(Integer, default=0, nullable=False)
    behavioral_risk_score = Column(Integer, default=0, nullable=False)
    visual_risk_score = Column(Integer, default=0, nullable=False)
    compliance_score = Column(Integer, default=100, nullable=False)
    factors = Column(JSON, default=list, nullable=False)  # List of strings explaining the risk factors
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="risk_profiles")

class VisualDetection(Base):
    __tablename__ = "visual_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    model_name = Column(String(100), nullable=False)
    class_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    bounding_box = Column(JSON, nullable=False)  # {left: float, top: float, width: float, height: float}
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="visual_detections")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(50), nullable=False)  # INFO, WARNING, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="UNREAD", nullable=False)  # UNREAD, READ, RESOLVED
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="alerts")

class UserActivityHistory(Base):
    __tablename__ = "user_activity_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    action_type = Column(String(100), nullable=False, index=True)  # PROFILE_UPDATE, USER_LOGIN, etc.
    endpoint = Column(String(255), nullable=False)
    ip_address = Column(String(100), nullable=True)
    activity_metadata = Column(JSON, nullable=True)
    status_code = Column(Integer, nullable=False)
    user_agent = Column(String(500), nullable=True)

    user = relationship("User", back_populates="activity_history")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    compliance_score = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)  # COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="compliance_records")
