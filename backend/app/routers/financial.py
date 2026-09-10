from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.database import get_db
from app.models import User, FinancialRecord, UnexpectedExpense
from app.schemas import FinancialRecordCreate, FinancialRecordOut, UnexpectedExpenseCreate, UnexpectedExpenseOut
from app.security import get_current_user, log_activity
from app.services import FinancialRiskEngine, RiskIntelligenceEngine

router = APIRouter(prefix="/financial", tags=["Financial Records"])

@router.post("", response_model=FinancialRecordOut, status_code=status.HTTP_201_CREATED)
def create_financial_record(
    record_in: FinancialRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate ratios and risk categories using engine
    expense_ratio, savings_ratio, debt_ratio, risk_cat, compliance = FinancialRiskEngine.calculate_metrics(
        income=record_in.monthly_income,
        expenses=record_in.monthly_expenses,
        savings_goal=record_in.savings_goal,
        debt=record_in.total_debt
    )

    new_record = FinancialRecord(
        user_id=current_user.id,
        monthly_income=record_in.monthly_income,
        monthly_expenses=record_in.monthly_expenses,
        savings_goal=record_in.savings_goal,
        total_debt=record_in.total_debt,
        expense_ratio=expense_ratio,
        savings_ratio=savings_ratio,
        debt_ratio=debt_ratio,
        risk_category=risk_cat,
        compliance_status=compliance
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="FINANCIAL_CREATE",
        endpoint="/api/v1/financial",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=201,
        metadata={
            "record_id": str(new_record.id),
            "risk_category": risk_cat,
            "compliance_status": compliance
        }
    )

    return new_record

@router.get("", response_model=List[FinancialRecordOut])
def list_financial_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve all records for user, ordered newest first
    records = db.query(FinancialRecord).filter(
        FinancialRecord.user_id == current_user.id
    ).order_by(FinancialRecord.created_at.desc()).all()
    return records


@router.post("/unexpected", response_model=UnexpectedExpenseOut, status_code=status.HTTP_201_CREATED)
def create_unexpected_expense(
    expense_in: UnexpectedExpenseCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = UnexpectedExpense(user_id=current_user.id, **expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    log_activity(
        db=db, user_id=current_user.id, action_type="UNEXPECTED_EXPENSE_CREATE", endpoint="/api/v1/financial/unexpected",
        ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"),
        status_code=201, metadata={"expense_id": str(expense.id), "amount": float(expense.amount), "category": expense.category},
    )
    return expense


@router.get("/unexpected", response_model=List[UnexpectedExpenseOut])
def list_unexpected_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UnexpectedExpense).filter(UnexpectedExpense.user_id == current_user.id).order_by(UnexpectedExpense.expense_date.desc(), UnexpectedExpense.created_at.desc()).all()


@router.delete("/unexpected/{id}", status_code=status.HTTP_200_OK)
def delete_unexpected_expense(
    id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(UnexpectedExpense).filter(UnexpectedExpense.id == id, UnexpectedExpense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Sudden expense not found")
    db.delete(expense)
    db.commit()
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)
    log_activity(
        db=db, user_id=current_user.id, action_type="UNEXPECTED_EXPENSE_DELETE", endpoint=f"/api/v1/financial/unexpected/{id}",
        ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"),
        status_code=200, metadata={"expense_id": str(id)},
    )
    return {"message": "Sudden expense successfully deleted"}

@router.get("/{id}", response_model=FinancialRecordOut)
def get_financial_record(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == id,
        FinancialRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Financial record not found")
    return record

@router.put("/{id}", response_model=FinancialRecordOut)
def update_financial_record(
    id: UUID,
    record_in: FinancialRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == id,
        FinancialRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Financial record not found")

    expense_ratio, savings_ratio, debt_ratio, risk_cat, compliance = FinancialRiskEngine.calculate_metrics(
        income=record_in.monthly_income,
        expenses=record_in.monthly_expenses,
        savings_goal=record_in.savings_goal,
        debt=record_in.total_debt
    )

    record.monthly_income = record_in.monthly_income
    record.monthly_expenses = record_in.monthly_expenses
    record.savings_goal = record_in.savings_goal
    record.total_debt = record_in.total_debt
    record.expense_ratio = expense_ratio
    record.savings_ratio = savings_ratio
    record.debt_ratio = debt_ratio
    record.risk_category = risk_cat
    record.compliance_status = compliance

    db.commit()
    db.refresh(record)

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="FINANCIAL_UPDATE",
        endpoint=f"/api/v1/financial/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"record_id": str(id), "risk_category": risk_cat}
    )

    return record

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_financial_record(
    id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == id,
        FinancialRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Financial record not found")

    db.delete(record)
    db.commit()

    # Sync Risk Profile
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="FINANCIAL_DELETE",
        endpoint=f"/api/v1/financial/{id}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={"record_id": str(id)}
    )

    return {"message": "Financial record successfully deleted"}
