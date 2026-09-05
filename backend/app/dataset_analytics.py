"""Analytics for user-uploaded tabular datasets.

The importer keeps the uploaded rows separate from records entered through the
application. These helpers calculate dashboard and forecast results directly
from the selected dataset without copying it into the user's live records.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from statistics import mean
from typing import Any


ALIASES = {
    "date": ("date", "created_at", "day", "timestamp"),
    "income": ("income_inr", "monthly_income", "income", "total_income_inr"),
    "expenses": ("total_expenses_inr", "monthly_expenses", "expenses", "expense", "total_expense_inr"),
    "study_hours": ("study_hours", "duration_hours", "weekly_study_hours"),
    "focus": ("focus_score", "focus_rating", "average_focus_score"),
    "habit_rate": ("habit_completion_rate", "habit_rate", "completion_rate"),
    "goal": ("overall_goal_progress_score", "goal_progress_score", "goal_progress"),
    "compliance": ("compliance_score",),
    "risk": ("overall_risk_score", "risk_score"),
    "financial_risk": ("financial_risk_score",),
    "academic_risk": ("academic_risk_score", "learning_risk_score"),
    "behavioral_risk": ("behavioral_risk_score",),
    "alerts": ("active_alerts", "alert_count"),
}


def _value(row: dict[str, Any], key: str, default: Any = None) -> Any:
    for name in ALIASES.get(key, (key,)):
        value = row.get(name)
        if value not in (None, ""):
            return value
    return default


def _number(value: Any, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return float(value)
    try:
        return float(str(value).replace(",", "").replace("₹", "").replace("$", "").strip())
    except (TypeError, ValueError):
        return default


def _ratio(value: Any) -> float:
    number = _number(value)
    return number / 100 if number > 1 else number


def _truthy(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y", "completed", "compliant"}


def _date_value(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if value in (None, ""):
        return None
    text = str(value).strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        for pattern in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(text, pattern)
            except ValueError:
                continue
    return None


def _ordered_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(rows, key=lambda row: _date_value(_value(row, "date")) or datetime.min)


def _linear_slope(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean_x = (len(values) - 1) / 2
    mean_y = mean(values)
    denominator = sum((index - mean_x) ** 2 for index in range(len(values)))
    return sum((index - mean_x) * (value - mean_y) for index, value in enumerate(values)) / denominator if denominator else 0.0


def _monthly_series(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})
    undated_index = 0
    for row in _ordered_rows(rows):
        observed = _date_value(_value(row, "date"))
        if observed:
            key = observed.strftime("%Y-%m")
            label = observed.strftime("%b %Y")
        else:
            undated_index += 1
            key = f"undated-{undated_index:04d}"
            label = f"Period {undated_index}"
        grouped[key]["label"] = label
        grouped[key]["income"] += _number(_value(row, "income"))
        grouped[key]["expenses"] += _number(_value(row, "expenses"))
    return [
        {"month": values["label"], "income": round(values["income"], 2), "expenses": round(values["expenses"], 2)}
        for _, values in sorted(grouped.items())
    ]


def dashboard_analysis(rows: list[dict[str, Any]]) -> dict[str, Any]:
    ordered = _ordered_rows(rows)
    monthly = _monthly_series(ordered)
    financial_count = sum(1 for row in ordered if _value(row, "income") is not None or _value(row, "expenses") is not None)
    study_count = sum(1 for row in ordered if _number(_value(row, "study_hours")) > 0)
    habit_count = sum(1 for row in ordered if _value(row, "habit_rate") is not None)
    compliance_values = [_number(_value(row, "compliance")) for row in ordered if _value(row, "compliance") is not None]
    risk_values = [_number(_value(row, "risk")) for row in ordered if _value(row, "risk") is not None]
    recent = ordered[-30:]
    active_risks = sum(1 for row in recent if _number(_value(row, "risk")) >= 58)
    high_risks = sum(1 for row in recent if _number(_value(row, "risk")) >= 75)
    alert_count = round(sum(_number(_value(row, "alerts")) for row in ordered))
    latest = ordered[-1] if ordered else {}
    overall_risk = round(mean(risk_values)) if risk_values else 0
    summary = {
        "financial_count": financial_count,
        "study_count": study_count,
        "habit_count": habit_count,
        "compliance_score": round(mean(compliance_values)) if compliance_values else 0,
        "overall_risk_score": overall_risk,
        "overall_risk_level": "CRITICAL" if overall_risk > 80 else "HIGH" if overall_risk > 60 else "MEDIUM" if overall_risk > 40 else "LOW" if overall_risk > 0 else "NO DATA",
        "active_risks_count": active_risks,
        "high_risks_count": high_risks,
        "financial_risk_score": round(_number(_value(latest, "financial_risk"))),
        "academic_risk_score": round(_number(_value(latest, "academic_risk"))),
        "behavioral_risk_score": round(_number(_value(latest, "behavioral_risk"))),
        "visual_risk_score": 0,
        "alert_count": alert_count,
    }
    return {"summary": summary, "monthly_series": monthly[-12:], "row_count": len(rows)}


def forecast_analysis(rows: list[dict[str, Any]]) -> dict[str, Any]:
    ordered = _ordered_rows(rows)
    monthly = _monthly_series(ordered)
    expense_values = [item["expenses"] for item in monthly]
    income_values = [item["income"] for item in monthly]
    current_expenses = expense_values[-1] if expense_values else 0
    slope = _linear_slope(expense_values[-6:])
    bounded_slope = max(-current_expenses * 0.25, min(slope, current_expenses * 0.25)) if current_expenses else 0
    next_month = round(max(0, current_expenses + bounded_slope), 2)
    projected_income = round(mean(income_values[-3:]), 2) if income_values else 0
    financial_series = [{"label": item["month"], "actual": item["expenses"], "projected": None} for item in monthly[-5:]]
    if monthly:
        financial_series.append({"label": "Next month", "actual": None, "projected": next_month})
    financial = {
        "has_data": bool(expense_values),
        "current_expenses": current_expenses,
        "next_week_expenses": round(next_month / 4.33, 2),
        "next_month_expenses": next_month,
        "projected_savings": round(projected_income - next_month, 2),
        "expense_change_percent": round((next_month - current_expenses) / current_expenses * 100, 1) if current_expenses else 0,
        "trend": "Rising" if next_month > current_expenses * 1.02 else "Reducing" if next_month < current_expenses * 0.98 else "Stable" if expense_values else "Awaiting financial data",
        "series": financial_series,
    }

    study_rows = [row for row in ordered if _number(_value(row, "study_hours")) > 0]
    recent_study = study_rows[-7:]
    hours = [_number(_value(row, "study_hours")) for row in recent_study]
    focus_values = []
    for row in recent_study:
        focus = _number(_value(row, "focus"))
        if "focus_rating" in row and "focus_score" not in row:
            focus *= 20
        focus_values.append(focus)
    weekly_hours = round(sum(hours), 1)
    next_week_hours = round(max(0, weekly_hours + _linear_slope(hours) * 7), 1) if hours else 0
    focus_score = round(mean(focus_values)) if focus_values else 0
    productivity = {
        "has_data": bool(hours), "weekly_study_hours": weekly_hours, "next_week_hours": next_week_hours,
        "focus_score": focus_score, "completion_probability": min(99, round(focus_score * .7 + min(next_week_hours, 20) * 1.5)) if hours else 0,
        "trend": "Improving" if hours and next_week_hours > weekly_hours + .5 else "Needs consistency" if hours and next_week_hours < weekly_hours - .5 else "Stable" if hours else "Awaiting study data",
    }

    habit_columns = [column for column in (ordered[0].keys() if ordered else []) if column.endswith("_completed") and column != "tasks_completed"]
    habits = []
    for column in habit_columns:
        scheduled_column = column.replace("_completed", "_scheduled")
        relevant = [row for row in ordered[-30:] if scheduled_column not in row or _truthy(row.get(scheduled_column))]
        likelihood = round(sum(1 for row in relevant if _truthy(row.get(column))) / len(relevant) * 100) if relevant else 0
        name = column.removesuffix("_completed").replace("_", " ").title()
        habits.append({"name": name, "category": "Imported activity", "likelihood": likelihood, "streak": round(_number(ordered[-1].get(column.replace("_completed", "_streak")))) if ordered else 0, "status": "Likely to continue" if likelihood >= 70 else "Needs support" if likelihood >= 45 else "At risk of stopping", "recommendation": "Keep the same cue and schedule." if likelihood >= 70 else "Reduce the next action and add a reminder."})
    if not habits:
        rates = [_ratio(_value(row, "habit_rate")) for row in ordered[-30:] if _value(row, "habit_rate") is not None]
        if rates:
            likelihood = round(mean(rates) * 100)
            habits.append({"name": "Overall habit routine", "category": "Imported activity", "likelihood": likelihood, "streak": 0, "status": "Likely to continue" if likelihood >= 70 else "Needs support" if likelihood >= 45 else "At risk of stopping", "recommendation": "Keep tracking the same routines." if likelihood >= 70 else "Choose one routine to stabilize first."})

    goals = []
    latest = ordered[-1] if ordered else {}
    for column in latest:
        if column.endswith("_goal_progress"):
            progress = _ratio(latest[column])
            probability = max(0, min(99, round(progress * 100)))
            title = column.removesuffix("_progress").replace("_", " ").title()
            goals.append({"id": column, "title": title, "goal_type": "IMPORTED", "timeframe": "CURRENT", "target": 100, "forecast": probability, "probability": probability, "unit": "progress", "status": "On track" if probability >= 85 else "Reachable with action" if probability >= 60 else "Unlikely on current trend"})
    if not goals and _value(latest, "goal") is not None:
        progress = _number(_value(latest, "goal"))
        probability = max(0, min(99, round(progress if progress > 1 else progress * 100)))
        goals.append({"id": "overall_goal", "title": "Overall goal progress", "goal_type": "IMPORTED", "timeframe": "CURRENT", "target": 100, "forecast": probability, "probability": probability, "unit": "progress", "status": "On track" if probability >= 85 else "Reachable with action" if probability >= 60 else "Unlikely on current trend"})

    recommendations = []
    if financial["has_data"] and financial["expense_change_percent"] > 3:
        recommendations.append({"area": "Cash flow", "message": f"Imported spending is projected to rise {financial['expense_change_percent']}%. Review the largest expense category and set a weekly cap."})
    if productivity["has_data"] and productivity["focus_score"] < 75:
        recommendations.append({"area": "Productivity", "message": "Imported focus performance is below the strong range. Protect a distraction-free study block on the most consistent days."})
    at_risk = next((habit for habit in habits if habit["likelihood"] < 70), None)
    if at_risk:
        recommendations.append({"area": "Habit", "message": f"{at_risk['name']} has a {at_risk['likelihood']}% continuation likelihood. Reduce the next action and attach it to an existing routine."})
    behind = next((goal for goal in goals if goal["probability"] < 85), None)
    if behind:
        recommendations.append({"area": "Goal", "message": f"{behind['title']} is {behind['status'].lower()}. Adjust the plan before the current period ends."})
    if not recommendations and rows:
        recommendations.append({"area": "Data", "message": "The imported trend is stable. Continue adding dated records to improve forecast quality."})

    data_points = len(rows)
    return {
        "source": "dataset", "confidence": "High" if data_points >= 90 else "Medium" if data_points >= 30 else "Starter",
        "data_points": data_points, "financial": financial, "productivity": productivity, "habits": habits[:8],
        "goals": goals[:8], "recommendations": recommendations,
    }
