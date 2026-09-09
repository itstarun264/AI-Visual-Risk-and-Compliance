from datetime import datetime, timedelta

from app.predictive_models import (
    forecast_study_hours,
    forecast_time_series,
    predict_habit_continuation,
)


def dated_history(length: int) -> list[datetime]:
    start = datetime(2026, 1, 1)
    return [start + timedelta(days=index) for index in range(length)]


def test_financial_model_compares_arima_and_prophet_with_holdout_metrics():
    dates = dated_history(120)
    expenses = [1000 + index * 2 + (index % 7) * 15 for index in range(120)]

    result = forecast_time_series(expenses, dates, horizon=30)

    evaluated = {candidate["name"] for candidate in result["model"]["evaluated_models"]}
    assert "Prophet" in evaluated
    assert any(name.startswith("ARIMA") for name in evaluated)
    assert result["model"]["validation"]["rmse"] is not None
    assert len(result["predictions"]) == 30
    assert all(value >= 0 for value in result["predictions"])


def test_random_forest_models_train_for_productivity_and_habits():
    dates = dated_history(90)
    study_hours = [2 + (index % 7) * .25 for index in range(90)]
    habit_outcomes = [index % 5 != 0 for index in range(90)]

    study = forecast_study_hours(study_hours, dates, horizon=7)
    habit = predict_habit_continuation(habit_outcomes, dates)

    assert study["model"]["selected"] == "Random Forest Regressor"
    assert study["model"]["validation"]["mae"] is not None
    assert len(study["predictions"]) == 7
    assert habit["model"]["selected"] == "Random Forest Classifier"
    assert habit["model"]["validation"]["accuracy"] is not None
    assert 0 <= habit["likelihood"] <= 100


def test_sparse_history_uses_explicit_fallback_without_fake_accuracy():
    dates = dated_history(3)
    result = forecast_time_series([100, 120, 140], dates, horizon=1)

    assert result["model"]["trained"] is False
    assert result["model"]["selected"] == "Linear trend fallback"
    assert result["model"]["validation"]["mape"] is None
