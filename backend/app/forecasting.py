"""Validated forecasting orchestration for user-owned tracking data."""
from __future__ import annotations

from collections import defaultdict
from datetime import timedelta
from typing import Any, Iterable

from app.predictive_models import forecast_study_hours, forecast_time_series


def _linear_slope(values: list[float]) -> float:
    """Least-squares trend per logged period; zero when history is insufficient."""
    if len(values) < 2:
        return 0.0
    mean_x = (len(values) - 1) / 2
    mean_y = sum(values) / len(values)
    numerator = sum((index - mean_x) * (value - mean_y) for index, value in enumerate(values))
    denominator = sum((index - mean_x) ** 2 for index in range(len(values)))
    return numerator / denominator if denominator else 0.0


def _money(value: float) -> float:
    return round(max(0, value), 2)


class ForecastingEngine:
    """Select trained models when sufficient history exists and safe fallbacks otherwise.

    These projections indicate likely direction from recorded behaviour. They are
    not financial advice. Validation metrics are calculated on chronological
    holdouts so model quality remains visible and auditable.
    """

    @classmethod
    def summary(cls, financials: Iterable[Any], studies: Iterable[Any], habits: Iterable[Any], goals: Iterable[Any]) -> dict[str, Any]:
        financials = sorted(list(financials), key=lambda record: record.created_at)
        studies = sorted(list(studies), key=lambda record: record.created_at)
        habits = list(habits)
        goals = list(goals)

        financial = cls._financial(financials)
        productivity = cls._productivity(studies)
        habit_predictions = cls._habits(habits)
        goal_assessments = cls._goals(goals, financial, productivity, habit_predictions)

        data_points = len(financials) + len(studies) + len(habits)
        trained_models = [financial.get("model", {}).get("trained"), productivity.get("model", {}).get("trained")]
        confidence = "High" if all(trained_models) else "Medium" if any(trained_models) else "Starter"
        return {
            "source": "live",
            "confidence": confidence,
            "data_points": data_points,
            "financial": financial,
            "productivity": productivity,
            "habits": habit_predictions,
            "goals": goal_assessments,
            "recommendations": cls._recommendations(financial, productivity, habit_predictions, goal_assessments),
            "model_summary": {
                "financial": financial.get("model", {}).get("selected", "Unavailable"),
                "productivity": productivity.get("model", {}).get("selected", "Unavailable"),
                "habits": "Behavioral heuristic" if habit_predictions else "Unavailable",
                "selection_method": "Chronological holdout validation with safe fallback for sparse histories",
            },
        }

    @staticmethod
    def _financial(records: list[Any]) -> dict[str, Any]:
        if not records:
            return {
                "has_data": False, "current_expenses": 0, "next_week_expenses": 0, "next_month_expenses": 0,
                "projected_savings": 0, "expense_change_percent": 0, "trend": "Awaiting financial data",
                "series": [],
                "model": {"selected": "Unavailable", "trained": False, "validation": {"mae": None, "rmse": None, "mape": None}, "evaluated_models": [], "note": "Add financial history to train a model."},
            }
        expenses = [float(record.monthly_expenses) for record in records]
        incomes = [float(record.monthly_income) for record in records]
        forecast_result = forecast_time_series(expenses, [record.created_at for record in records], horizon=1, frequency="MS")
        raw_prediction = forecast_result["predictions"][0]
        # Guardrail remains active even when a trained model is selected.
        predicted_expenses = _money(max(expenses[-1] * .75, min(raw_prediction, expenses[-1] * 1.25)))
        income = incomes[-1]
        projected_savings = round(income - predicted_expenses, 2)
        change = round((predicted_expenses - expenses[-1]) / expenses[-1] * 100, 1) if expenses[-1] else 0
        recent_records = records[-4:]
        series = [{"label": record.created_at.strftime("%d %b %Y"), "actual": round(float(record.monthly_expenses)), "projected": None} for record in recent_records]
        series[-1]["projected"] = series[-1]["actual"]
        series.append({"label": "Next month", "actual": None, "projected": round(predicted_expenses)})
        return {
            "has_data": True,
            "current_expenses": round(expenses[-1], 2),
            "next_week_expenses": round(predicted_expenses / 4.33, 2),
            "next_month_expenses": predicted_expenses,
            "projected_savings": projected_savings,
            "expense_change_percent": change,
            "trend": "Rising" if change > 2 else "Reducing" if change < -2 else "Stable",
            "series": series,
            "model": forecast_result["model"],
        }

    @staticmethod
    def _productivity(records: list[Any]) -> dict[str, Any]:
        if not records:
            return {"has_data": False, "weekly_study_hours": 0, "next_week_hours": 0, "focus_score": 0, "completion_probability": 0, "trend": "Awaiting study data", "series": [], "model": {"selected": "Unavailable", "trained": False, "validation": {"mae": None, "rmse": None, "mape": None}, "evaluated_models": [], "note": "Add dated study history to train a model."}}
        recent = records[-7:]
        hours = [float(record.study_hours) for record in recent]
        average_focus = sum(record.focus_rating for record in recent) / len(recent)
        all_hours = [float(record.study_hours) for record in records]
        forecast_result = forecast_study_hours(all_hours, [record.created_at for record in records], horizon=7)
        projected = round(sum(forecast_result["predictions"]), 1)
        focus_score = round(average_focus * 20)
        completion_probability = min(97, max(35, round(45 + focus_score * 0.45 + min(projected, 20) * 0.5)))
        weekly_totals: dict[Any, float] = defaultdict(float)
        for record in records:
            observed = record.created_at
            week_start = (observed - timedelta(days=observed.weekday())).date()
            weekly_totals[week_start] += float(record.study_hours)
        weekly_history = sorted(weekly_totals.items())[-6:]
        series = [{"label": observed.strftime("%d %b"), "actual": round(value, 1), "projected": None} for observed, value in weekly_history]
        series[-1]["projected"] = series[-1]["actual"]
        series.append({"label": "Next week", "actual": None, "projected": projected})
        return {
            "has_data": True,
            "weekly_study_hours": round(sum(hours), 1),
            "next_week_hours": round(projected, 1),
            "focus_score": focus_score,
            "completion_probability": completion_probability,
            "trend": "Improving" if _linear_slope(hours) > .15 else "Needs consistency" if _linear_slope(hours) < -.15 else "Stable",
            "model": forecast_result["model"],
            "series": series,
        }

    @staticmethod
    def _habits(records: list[Any]) -> list[dict[str, Any]]:
        if not records:
            return []
        result = []
        for habit in records:
            base = 45 + min(habit.streak, 14) * 3
            if habit.completed_today:
                base += 12
            if habit.is_risk_associated:
                base -= 18
            likelihood = max(15, min(96, round(base)))
            result.append({
                "name": habit.habit_name,
                "category": habit.category,
                "likelihood": likelihood,
                "streak": habit.streak,
                "status": "Likely to continue" if likelihood >= 70 else "Needs support" if likelihood >= 45 else "At risk of stopping",
                "recommendation": "Keep the same cue and schedule next check-in." if likelihood >= 70 else "Set a smaller daily action and schedule a reminder.",
                "model": {"selected": "Behavioral heuristic", "trained": False, "validation": {"accuracy": None}, "note": "Live habits currently store the latest state; imported daily history enables Random Forest classification."},
            })
        return sorted(result, key=lambda habit: habit["likelihood"], reverse=True)

    @staticmethod
    def _goals(goals: list[Any], financial: dict[str, Any], productivity: dict[str, Any], habits: list[dict[str, Any]]) -> list[dict[str, Any]]:
        habit_likelihoods = {habit["name"].lower(): habit["likelihood"] for habit in habits}
        assessments = []
        for goal in goals:
            if goal.goal_type == "FINANCIAL":
                forecast = financial["projected_savings"] if goal.timeframe == "MONTHLY" else financial["projected_savings"] / 4.33
                unit = "savings"
            elif goal.goal_type == "STUDY":
                forecast = productivity["next_week_hours"] if goal.timeframe == "WEEKLY" else productivity["next_week_hours"] * 4.33
                unit = "study hours"
            else:
                forecast = habit_likelihoods.get((goal.habit_name or goal.title).lower(), 45)
                unit = "completion likelihood"
            target = float(goal.target_value)
            probability = max(5, min(99, round((forecast / target) * 100))) if target else 0
            assessments.append({
                "id": str(goal.id), "title": goal.title, "goal_type": goal.goal_type, "timeframe": goal.timeframe,
                "target": target, "forecast": round(forecast, 1), "probability": probability, "unit": unit,
                "status": "On track" if probability >= 85 else "Reachable with action" if probability >= 60 else "Unlikely on current trend",
            })
        return assessments

    @staticmethod
    def _recommendations(financial: dict[str, Any], productivity: dict[str, Any], habits: list[dict[str, Any]], goals: list[dict[str, Any]]) -> list[dict[str, str]]:
        recommendations = []
        if financial["has_data"]:
            if financial["expense_change_percent"] > 3:
                recommendations.append({"area": "Cash flow", "message": f"Spending is projected to rise {financial['expense_change_percent']}%. Set a weekly cap of {financial['next_week_expenses']:.0f} and review the largest category before month-end."})
            elif financial["projected_savings"] < 0:
                recommendations.append({"area": "Cash flow", "message": "The current expense trend could create a monthly shortfall. Pause non-essential spending and protect your debt payment first."})
        if productivity["has_data"] and productivity["focus_score"] < 75:
            recommendations.append({"area": "Productivity", "message": "Your focus pattern is below the strong range. Protect one 60–90 minute distraction-free block on your three highest-value days."})
        at_risk = next((habit for habit in habits if habit["likelihood"] < 70), None)
        if at_risk:
            recommendations.append({"area": "Habit", "message": f"{at_risk['name']} has a {at_risk['likelihood']}% continuation likelihood. Make the next action smaller and attach it to an existing routine."})
        behind = next((goal for goal in goals if goal["probability"] < 85), None)
        if behind:
            recommendations.append({"area": "Goal", "message": f"{behind['title']} is {behind['status'].lower()}. Adjust the weekly plan now rather than waiting for the end of the period."})
        return recommendations or [{"area": "Momentum", "message": "Your recorded trend is stable. Keep logging entries on the same day each week to improve forecast confidence."}]
