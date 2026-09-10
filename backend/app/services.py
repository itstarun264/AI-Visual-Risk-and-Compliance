from decimal import Decimal
from typing import List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import UserProfile, FinancialRecord, UnexpectedExpense, StudyRecord, HabitRecord, VisualDetection, RiskProfile, Alert

class FinancialRiskEngine:
    @staticmethod
    def calculate_metrics(
        income: Decimal, expenses: Decimal, savings_goal: Decimal, debt: Decimal
    ) -> Tuple[Decimal, Decimal, Decimal, str, str]:
        """
        Calculates:
        - expense_ratio = expenses / income
        - savings_ratio = savings_goal / income
        - debt_ratio = debt / income
        - risk_category: LOW, MEDIUM, HIGH, CRITICAL
        - compliance_status: COMPLIANT, NON_COMPLIANT
        """
        if income <= 0:
            return Decimal("0.0"), Decimal("0.0"), Decimal("0.0"), "CRITICAL", "NON_COMPLIANT"

        expense_ratio = expenses / income
        savings_ratio = savings_goal / income
        debt_ratio = debt / income

        # Risk categories based on expense ratio and debt ratio
        # Low: Expense < 0.50, Debt < 1.0
        # Medium: Expense 0.50-0.70, Debt 1.0-2.0
        # High: Expense 0.70-0.90, Debt 2.0-4.0
        # Critical: Expense > 0.90, Debt > 4.0

        # We take the maximum of the two risk signals
        exp_score = 0
        if expense_ratio < Decimal("0.50"):
            exp_score = 1  # LOW
        elif expense_ratio <= Decimal("0.70"):
            exp_score = 2  # MEDIUM
        elif expense_ratio <= Decimal("0.90"):
            exp_score = 3  # HIGH
        else:
            exp_score = 4  # CRITICAL

        debt_score = 0
        if debt_ratio < Decimal("1.0"):
            debt_score = 1
        elif debt_ratio <= Decimal("2.0"):
            debt_score = 2
        elif debt_ratio <= Decimal("4.0"):
            debt_score = 3
        else:
            debt_score = 4

        final_score = max(exp_score, debt_score)
        
        categories = {1: "LOW", 2: "MEDIUM", 3: "HIGH", 4: "CRITICAL"}
        risk_category = categories.get(final_score, "LOW")

        # Compliance determination
        if final_score >= 3:
            compliance_status = "NON_COMPLIANT"
        else:
            compliance_status = "COMPLIANT"

        return (
            round(expense_ratio, 4),
            round(savings_ratio, 4),
            round(debt_ratio, 4),
            risk_category,
            compliance_status
        )

class ComplianceEngine:
    @staticmethod
    def evaluate(
        policy_level: str,
        habits: List[HabitRecord],
        financial_risk: str,
        visual_violations_count: int
    ) -> Tuple[int, str, List[str], List[str]]:
        """
        Calculates compliance score (0-100), status, list of violations, and list of recommendations.
        """
        score = 100
        violations = []
        recommendations = []

        # 1. Habit Compliance Evaluation
        if habits:
            total_habits = len(habits)
            completed_habits = sum(1 for h in habits if h.completed_today)
            risk_habits = sum(1 for h in habits if h.is_risk_associated)
            
            completion_rate = (completed_habits / total_habits) * 100
            
            # Deduct for low completion rate
            if completion_rate < 50:
                score -= 15
                violations.append(f"Habit completion rate is low: {completion_rate:.1f}%")
                recommendations.append("Increase routine compliance and log daily habits consistently.")
            elif completion_rate < 80:
                score -= 5
                
            # Deduct for risk-associated habits
            if risk_habits > 0:
                score -= (risk_habits * 10)
                violations.append(f"Detected {risk_habits} active risk-associated behaviors in logged habits.")
                recommendations.append("Review and eliminate flagged risk habits immediately.")

        # 2. Financial Risk Evaluation
        if financial_risk == "HIGH":
            score -= 15
            violations.append("Financial risk state is flagged as HIGH.")
            recommendations.append("Reduce monthly expenses or debt levels to stabilize financial ratios.")
        elif financial_risk == "CRITICAL":
            score -= 30
            violations.append("Financial risk state is flagged as CRITICAL.")
            recommendations.append("Urgent: Seek financial advisory and draft a debt restructuring plan.")

        # 3. Visual Violations Evaluation
        if visual_violations_count > 0:
            score -= (visual_violations_count * 15)
            violations.append(f"Detected {visual_violations_count} visual safety/compliance violations.")
            recommendations.append("Ensure full PPE compliance and clear all safety zones in workspace.")

        # Bound score between 0 and 100
        score = max(0, min(100, score))

        # Compliance Status mapping based on score and policy level
        # Strict/Enterprise compliance policies demand higher scores for COMPLIANT status
        if policy_level == "Strict Compliance" or policy_level == "Enterprise Compliance":
            compliant_threshold = 85
            partially_threshold = 65
        else:
            compliant_threshold = 75
            partially_threshold = 50

        if score >= compliant_threshold:
            status = "COMPLIANT"
        elif score >= partially_threshold:
            status = "PARTIALLY_COMPLIANT"
        elif score > 30:
            status = "NON_COMPLIANT"
        else:
            status = "CRITICAL"

        # Default recommendations if compliant
        if not violations:
            status = "COMPLIANT"
            recommendations.append("Keep maintaining your current positive compliance routines.")

        return score, status, violations, recommendations

class RiskIntelligenceEngine:
    @staticmethod
    def calculate_scores(
        profile: UserProfile,
        financial_records: List[FinancialRecord],
        study_records: List[StudyRecord],
        habits: List[HabitRecord],
        detections: List[VisualDetection],
        unexpected_expenses: List[UnexpectedExpense] | None = None,
    ) -> Dict[str, Any]:
        """
        Combines profile settings, financials, study sessions, habits, and visual detections.
        Generates overall_risk_score, sub-scores, and list of contributing factors.
        """
        factors = []
        
        # 1. Financial Risk Score (0-100)
        fin_score = 0
        current_financial_risk = "LOW"
        if financial_records:
            latest_fin = max(financial_records, key=lambda x: x.created_at)
            month_extras = sum(
                (expense.amount for expense in (unexpected_expenses or []) if expense.expense_date.year == latest_fin.created_at.year and expense.expense_date.month == latest_fin.created_at.month),
                Decimal("0"),
            )
            _, _, _, current_financial_risk, _ = FinancialRiskEngine.calculate_metrics(
                latest_fin.monthly_income,
                latest_fin.monthly_expenses + month_extras,
                latest_fin.savings_goal,
                latest_fin.total_debt,
            )
            risk_mapping = {"LOW": 15, "MEDIUM": 45, "HIGH": 75, "CRITICAL": 95}
            fin_score = risk_mapping.get(current_financial_risk, 15)
            
            if current_financial_risk in ["HIGH", "CRITICAL"]:
                factors.append(f"High debt or expense ratio ({current_financial_risk} Financial Risk)")
        else:
            fin_score = 20  # neutral/baseline

        # 2. Academic / Study Risk Score (0-100)
        study_score = 0
        if study_records:
            # Calculate averages of focus rating and study hours in last 7 entries
            recent_study = sorted(study_records, key=lambda x: x.created_at, reverse=True)[:7]
            avg_hours = sum(float(s.study_hours) for s in recent_study) / len(recent_study)
            avg_focus = sum(s.focus_rating for s in recent_study) / len(recent_study)
            
            # Risk calculation: low hours or low focus = high risk
            # Focus: 5 -> 0, 4 -> 15, 3 -> 40, 2 -> 70, 1 -> 95
            focus_risk = (5 - avg_focus) * 23.75
            # Hours: > 4h -> 0, 0h -> 95
            hours_risk = max(0, (4 - avg_hours)) * 23.75
            
            study_score = int(max(0, min(100, (focus_risk + hours_risk) / 2)))
            
            if study_score > 60:
                factors.append("Low study hours or weak cognitive focus registered recently")
        else:
            study_score = 25  # baseline

        # 3. Behavioral Risk Score (0-100)
        beh_score = 0
        if habits:
            total_habits = len(habits)
            risk_associated = sum(1 for h in habits if h.is_risk_associated)
            completion_rate = sum(1 for h in habits if h.completed_today) / total_habits if total_habits else 1
            
            # Risk score grows with risk-associated actions and lower completion
            comp_risk = (1 - completion_rate) * 60
            flag_risk = (risk_associated / total_habits) * 100 if total_habits else 0
            
            beh_score = int(max(0, min(100, (comp_risk + flag_risk) / 2)))
            
            if risk_associated > 0:
                factors.append(f"Habits include {risk_associated} active compliance risk flags")
            if completion_rate < 0.6:
                factors.append("Low daily habit completion rate")
        else:
            beh_score = 20

        # 4. Visual Risk Score (0-100)
        # Visual risk is driven by detected violations in workspace images
        vis_score = 0
        recent_detections = [d for d in detections if d.risk_level in ["MEDIUM", "HIGH", "CRITICAL"]]
        if recent_detections:
            # Count the counts of different levels
            crit_cnt = sum(1 for d in recent_detections if d.risk_level == "CRITICAL")
            high_cnt = sum(1 for d in recent_detections if d.risk_level == "HIGH")
            med_cnt = sum(1 for d in recent_detections if d.risk_level == "MEDIUM")
            
            vis_score = (crit_cnt * 45) + (high_cnt * 25) + (med_cnt * 10)
            vis_score = max(0, min(100, vis_score))
            
            if vis_score > 40:
                factors.append(f"Visual AI identified {len(recent_detections)} compliance safety hazards")
        else:
            vis_score = 10

        # 5. Combine everything into Overall Risk Score (0-100)
        # We weigh them: Financial 25%, Academic 15%, Behavioral 30%, Visual 30%
        overall_score = int(
            (fin_score * 0.25) +
            (study_score * 0.15) +
            (beh_score * 0.30) +
            (vis_score * 0.30)
        )
        
        # User risk tolerance scaling adjustment
        # If user's threshold setting is Low, we amplify the risk score (hypersensitive compliance)
        # If Critical, they tolerate high risks, so we reduce the overall risk calculation slightly
        tolerance = profile.risk_tolerance if profile else "Medium"
        if tolerance == "Low":
            overall_score = int(overall_score * 1.15)
        elif tolerance == "High":
            overall_score = int(overall_score * 0.90)
        elif tolerance == "Critical":
            overall_score = int(overall_score * 0.80)
            
        overall_score = max(0, min(100, overall_score))

        # Map to level text
        if overall_score <= 20:
            level = "SAFE"
        elif overall_score <= 40:
            level = "LOW"
        elif overall_score <= 60:
            level = "MEDIUM"
        elif overall_score <= 80:
            level = "HIGH"
        else:
            level = "CRITICAL"

        # 6. Compliance Score calculation (0-100)
        # It is inversely related to risk score, but has its own logic (handled by ComplianceEngine)
        comp_score = 100 - overall_score
        # Check against policy settings
        policy = profile.compliance_policy if profile else "Standard Compliance"
        
        # Execute ComplianceEngine evaluate helper
        raw_comp_score, comp_status, violations, recommendations = ComplianceEngine.evaluate(
            policy_level=policy,
            habits=habits,
            financial_risk=current_financial_risk,
            visual_violations_count=len(recent_detections)
        )

        return {
            "overall_risk_score": overall_score,
            "overall_risk_level": level,
            "financial_risk_score": fin_score,
            "academic_risk_score": study_score,
            "behavioral_risk_score": beh_score,
            "visual_risk_score": vis_score,
            "compliance_score": raw_comp_score,
            "compliance_status": comp_status,
            "factors": factors or ["No significant risk factors detected in logged inputs."],
            "violations": violations,
            "recommendations": recommendations
        }

    @staticmethod
    def sync_risk_profile(db: Session, user_id: UUID) -> RiskProfile:
        """
        Aggregates all data, computes risks/compliance, stores in risk_profiles table,
        triggers alerts if needed, and returns the updated profile.
        """
        # Fetch profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id, age=30, risk_tolerance="Medium", occupation="Professional", compliance_policy="Standard Compliance", bio="")
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # Fetch records
        financials = db.query(FinancialRecord).filter(FinancialRecord.user_id == user_id).all()
        unexpected_expenses = db.query(UnexpectedExpense).filter(UnexpectedExpense.user_id == user_id).all()
        studies = db.query(StudyRecord).filter(StudyRecord.user_id == user_id).all()
        habits = db.query(HabitRecord).filter(HabitRecord.user_id == user_id).all()
        detections = db.query(VisualDetection).filter(VisualDetection.user_id == user_id).all()

        results = RiskIntelligenceEngine.calculate_scores(
            profile=profile,
            financial_records=financials,
            study_records=studies,
            habits=habits,
            detections=detections,
            unexpected_expenses=unexpected_expenses,
        )

        # Find or create risk profile
        rp = db.query(RiskProfile).filter(RiskProfile.user_id == user_id).first()
        if not rp:
            rp = RiskProfile(user_id=user_id)
            db.add(rp)

        rp.overall_risk_score = results["overall_risk_score"]
        rp.financial_risk_score = results["financial_risk_score"]
        rp.academic_risk_score = results["academic_risk_score"]
        rp.behavioral_risk_score = results["behavioral_risk_score"]
        rp.visual_risk_score = results["visual_risk_score"]
        rp.compliance_score = results["compliance_score"]
        rp.factors = results["factors"]
        rp.updated_at = datetime.utcnow()

        # Check if we should trigger alerts
        # 1. Critical Financial Risk
        if financials:
            if results["financial_risk_score"] >= 95:
                alert_exists = db.query(Alert).filter(
                    Alert.user_id == user_id, 
                    Alert.title == "Critical Financial Risk Detected",
                    Alert.status == "UNREAD"
                ).first()
                if not alert_exists:
                    alert = Alert(
                        user_id=user_id,
                        severity="CRITICAL",
                        title="Critical Financial Risk Detected",
                        description="Your monthly financial risk is critical after including base spending, sudden expenses, and debt."
                    )
                    db.add(alert)

        # 2. Critical Visual Safety Hazards
        if detections:
            crit_detections = [d for d in detections if d.risk_level == "CRITICAL"]
            if crit_detections:
                alert_exists = db.query(Alert).filter(
                    Alert.user_id == user_id,
                    Alert.title == "Critical Visual Hazard Detected",
                    Alert.status == "UNREAD"
                ).first()
                if not alert_exists:
                    alert = Alert(
                        user_id=user_id,
                        severity="CRITICAL",
                        title="Critical Visual Hazard Detected",
                        description=f"AI Vision engine flagged critical hazards: {', '.join(set(d.class_name for d in crit_detections))}."
                    )
                    db.add(alert)

        # 3. General Low Compliance Score
        if rp.compliance_score < 50:
            alert_exists = db.query(Alert).filter(
                Alert.user_id == user_id,
                Alert.title == "Compliance Score Warning",
                Alert.status == "UNREAD"
            ).first()
            if not alert_exists:
                alert = Alert(
                    user_id=user_id,
                    severity="WARNING",
                    title="Compliance Score Warning",
                    description=f"Your overall Compliance score has dropped to {rp.compliance_score}%. Review your violations list to restore compliance status."
                )
                db.add(alert)

        db.commit()
        db.refresh(rp)
        return rp
