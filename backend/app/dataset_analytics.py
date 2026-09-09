"""Analytics for user-uploaded tabular datasets.

The importer keeps the uploaded rows separate from records entered through the
application. These helpers calculate dashboard and forecast results directly
from the selected dataset without copying it into the user's live records.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from statistics import mean
from typing import Any

from app.predictive_models import forecast_study_hours, forecast_time_series, predict_habit_continuation


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
    dated_expenses = [
        (_date_value(_value(row, "date")), _number(_value(row, "expenses")))
        for row in ordered if _date_value(_value(row, "date")) and _value(row, "expenses") is not None
    ]
    use_daily_history = len(dated_expenses) >= 30 and (dated_expenses[-1][0] - dated_expenses[0][0]).days / max(1, len(dated_expenses) - 1) <= 3
    if use_daily_history:
        weekly_totals: dict[datetime, float] = defaultdict(float)
        for observed, value in dated_expenses:
            week_start = datetime(observed.year, observed.month, observed.day) - timedelta(days=observed.weekday())
            weekly_totals[week_start] += value
        weekly_dates = sorted(weekly_totals)
        finance_forecast = forecast_time_series(
            [weekly_totals[observed] for observed in weekly_dates], weekly_dates,
            horizon=5, frequency="W",
        )
        next_week = round(finance_forecast["predictions"][0], 2)
        next_month = round(mean(finance_forecast["predictions"]) * 4.33, 2)
    elif expense_values:
        monthly_dates = [datetime.strptime(item["month"], "%b %Y") if not item["month"].startswith("Period") else datetime(2000, min(index + 1, 12), 1) for index, item in enumerate(monthly)]
        finance_forecast = forecast_time_series(expense_values, monthly_dates, horizon=1, frequency="MS")
        raw_prediction = finance_forecast["predictions"][0]
        next_month = round(max(current_expenses * .75, min(raw_prediction, current_expenses * 1.25)), 2) if current_expenses else round(raw_prediction, 2)
        next_week = round(next_month / 4.33, 2)
    else:
        finance_forecast = {"model": {"selected": "Unavailable", "trained": False, "validation": {"mae": None, "rmse": None, "mape": None}, "evaluated_models": [], "note": "No financial fields were found."}, "predictions": []}
        next_month = 0
        next_week = 0
    projected_income = round(mean(income_values[-3:]), 2) if income_values else 0
    financial_series = [{"label": item["month"], "actual": item["expenses"], "projected": None} for item in monthly[-5:]]
    if monthly:
        financial_series.append({"label": "Next month", "actual": None, "projected": next_month})
    financial = {
        "has_data": bool(expense_values),
        "current_expenses": current_expenses,
        "next_week_expenses": next_week,
        "next_month_expenses": next_month,
        "projected_savings": round(projected_income - next_month, 2),
        "expense_change_percent": round((next_month - current_expenses) / current_expenses * 100, 1) if current_expenses else 0,
        "trend": "Rising" if next_month > current_expenses * 1.02 else "Reducing" if next_month < current_expenses * 0.98 else "Stable" if expense_values else "Awaiting financial data",
        "series": financial_series,
        "model": finance_forecast["model"],
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
    focus_score = round(mean(focus_values)) if focus_values else 0
    dated_study = [
        (_date_value(_value(row, "date")), _number(_value(row, "study_hours")))
        for row in ordered if _date_value(_value(row, "date")) and _value(row, "study_hours") is not None
    ]
    study_forecast = forecast_study_hours(
        [value for _, value in dated_study], [observed for observed, _ in dated_study], horizon=7,
    ) if dated_study else {"predictions": [], "model": {"selected": "Unavailable", "trained": False, "validation": {"mae": None, "rmse": None, "mape": None}, "evaluated_models": [], "note": "No dated study fields were found."}}
    next_week_hours = round(sum(study_forecast["predictions"]), 1) if study_forecast["predictions"] else round(max(0, weekly_hours + _linear_slope(hours) * 7), 1) if hours else 0
    productivity = {
        "has_data": bool(hours), "weekly_study_hours": weekly_hours, "next_week_hours": next_week_hours,
        "focus_score": focus_score, "completion_probability": min(99, round(focus_score * .7 + min(next_week_hours, 20) * 1.5)) if hours else 0,
        "trend": "Improving" if hours and next_week_hours > weekly_hours + .5 else "Needs consistency" if hours and next_week_hours < weekly_hours - .5 else "Stable" if hours else "Awaiting study data",
        "model": study_forecast["model"],
    }

    habit_columns = [column for column in (ordered[0].keys() if ordered else []) if column.endswith("_completed") and column != "tasks_completed"]
    habits = []
    for column in habit_columns:
        scheduled_column = column.replace("_completed", "_scheduled")
        relevant = [row for row in ordered[-30:] if scheduled_column not in row or _truthy(row.get(scheduled_column))]
        historical = [row for row in ordered if (scheduled_column not in row or _truthy(row.get(scheduled_column))) and _date_value(_value(row, "date"))]
        habit_prediction = predict_habit_continuation(
            [_truthy(row.get(column)) for row in historical], [_date_value(_value(row, "date")) for row in historical],
        ) if historical else {"likelihood": 0, "model": {"selected": "Unavailable", "trained": False, "validation": {"accuracy": None}, "evaluated_models": [], "note": "No dated habit outcomes were found."}}
        likelihood = habit_prediction["likelihood"] if historical else round(sum(1 for row in relevant if _truthy(row.get(column))) / len(relevant) * 100) if relevant else 0
        name = column.removesuffix("_completed").replace("_", " ").title()
        habits.append({"name": name, "category": "Imported activity", "likelihood": likelihood, "streak": round(_number(ordered[-1].get(column.replace("_completed", "_streak")))) if ordered else 0, "status": "Likely to continue" if likelihood >= 70 else "Needs support" if likelihood >= 45 else "At risk of stopping", "recommendation": "Keep the same cue and schedule." if likelihood >= 70 else "Reduce the next action and add a reminder.", "model": habit_prediction["model"]})
    if not habits:
        rates = [_ratio(_value(row, "habit_rate")) for row in ordered[-30:] if _value(row, "habit_rate") is not None]
        if rates:
            likelihood = round(mean(rates) * 100)
            habits.append({"name": "Overall habit routine", "category": "Imported activity", "likelihood": likelihood, "streak": 0, "status": "Likely to continue" if likelihood >= 70 else "Needs support" if likelihood >= 45 else "At risk of stopping", "recommendation": "Keep tracking the same routines." if likelihood >= 70 else "Choose one routine to stabilize first.", "model": {"selected": "Recent completion-rate fallback", "trained": False, "validation": {"accuracy": None}, "evaluated_models": [], "note": "Per-habit daily completion columns are required to train a classifier."}})

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
    trained_models = [financial["model"].get("trained"), productivity["model"].get("trained")] + [habit.get("model", {}).get("trained") for habit in habits]
    return {
        "source": "dataset", "confidence": "High" if sum(bool(value) for value in trained_models) >= 2 else "Medium" if any(trained_models) else "Starter",
        "data_points": data_points, "financial": financial, "productivity": productivity, "habits": habits[:8],
        "goals": goals[:8], "recommendations": recommendations,
        "model_summary": {
            "financial": financial["model"]["selected"],
            "productivity": productivity["model"]["selected"],
            "habits": habits[0]["model"]["selected"] if habits else "Unavailable",
            "selection_method": "Chronological holdout validation; lowest-error time-series model selected automatically",
        },
    }
