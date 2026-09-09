"""Train, validate, and select forecasting models for user-owned time series.

ARIMA, Prophet, and Random Forest are fitted on the selected user's history at
request time.  They are not generic pretrained checkpoints.  Every model result
includes holdout metrics so the UI can distinguish measured performance from a
fallback estimate.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from math import isfinite, sqrt
from statistics import mean
from typing import Any, Iterable
import logging
import warnings


logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)


def _clean_numbers(values: Iterable[Any]) -> list[float]:
    cleaned: list[float] = []
    for value in values:
        try:
            number = float(value)
        except (TypeError, ValueError):
            continue
        if isfinite(number):
            cleaned.append(number)
    return cleaned


def _linear_predictions(train: list[float], horizon: int) -> list[float]:
    if not train:
        return [0.0] * horizon
    if len(train) == 1:
        return [train[-1]] * horizon
    mean_x = (len(train) - 1) / 2
    mean_y = mean(train)
    denominator = sum((index - mean_x) ** 2 for index in range(len(train)))
    slope = sum((index - mean_x) * (value - mean_y) for index, value in enumerate(train)) / denominator if denominator else 0
    intercept = mean_y - slope * mean_x
    return [max(0.0, intercept + slope * (len(train) + step)) for step in range(horizon)]


def regression_metrics(actual: list[float], predicted: list[float]) -> dict[str, float | None]:
    pairs = [(float(observed), float(estimate)) for observed, estimate in zip(actual, predicted) if isfinite(float(observed)) and isfinite(float(estimate))]
    if not pairs:
        return {"mae": None, "rmse": None, "mape": None}
    errors = [abs(observed - estimate) for observed, estimate in pairs]
    percentage_errors = [abs(observed - estimate) / abs(observed) * 100 for observed, estimate in pairs if observed != 0]
    return {
        "mae": round(mean(errors), 2),
        "rmse": round(sqrt(mean([(observed - estimate) ** 2 for observed, estimate in pairs])), 2),
        "mape": round(mean(percentage_errors), 2) if percentage_errors else None,
    }


def _model_meta(selected: str, trained: bool, metrics: dict[str, Any], evaluated: list[dict[str, Any]], note: str) -> dict[str, Any]:
    return {
        "selected": selected,
        "trained": trained,
        "validation": metrics,
        "evaluated_models": evaluated,
        "note": note,
    }


def _future_dates(last_date: datetime, horizon: int, frequency: str) -> list[datetime]:
    if frequency == "MS":
        year, month = last_date.year, last_date.month
        result = []
        for _ in range(horizon):
            month += 1
            if month == 13:
                year += 1
                month = 1
            result.append(datetime(year, month, 1))
        return result
    day_step = 7 if frequency.startswith("W") else 1
    return [last_date + timedelta(days=day_step * step) for step in range(1, horizon + 1)]


def forecast_time_series(
    values: Iterable[Any],
    dates: Iterable[datetime] | None = None,
    *,
    horizon: int = 1,
    frequency: str = "D",
    allow_prophet: bool = True,
) -> dict[str, Any]:
    """Compare linear trend, ARIMA, and Prophet on a chronological holdout."""
    series = _clean_numbers(values)
    date_list = list(dates or [])
    if len(date_list) != len(series):
        date_list = []
    horizon = max(1, int(horizon))

    if len(series) < 4:
        predictions = _linear_predictions(series, horizon)
        return {
            "predictions": [round(value, 2) for value in predictions],
            "model": _model_meta(
                "Linear trend fallback", False, {"mae": None, "rmse": None, "mape": None}, [],
                "At least 8 dated observations are required before ARIMA can be validated.",
            ),
        }

    validation_size = min(30, max(2, len(series) // 5))
    if len(series) - validation_size < 6:
        validation_size = max(1, len(series) - 6)
    train = series[:-validation_size]
    test = series[-validation_size:]
    candidates: list[dict[str, Any]] = []

    linear_validation = _linear_predictions(train, len(test))
    candidates.append({"name": "Linear Trend", "kind": "linear", "metrics": regression_metrics(test, linear_validation)})

    if len(train) >= 8:
        try:
            from statsmodels.tsa.arima.model import ARIMA

            best_arima: dict[str, Any] | None = None
            for order in ((1, 1, 0), (1, 1, 1), (2, 1, 0)):
                try:
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        fitted = ARIMA(train, order=order).fit()
                        predicted = [max(0.0, float(value)) for value in fitted.forecast(steps=len(test))]
                    metrics = regression_metrics(test, predicted)
                    result = {"name": f"ARIMA{order}", "kind": "arima", "order": order, "metrics": metrics}
                    if best_arima is None or float(metrics["rmse"] or float("inf")) < float(best_arima["metrics"]["rmse"] or float("inf")):
                        best_arima = result
                except Exception:
                    continue
            if best_arima:
                candidates.append(best_arima)
        except ImportError:
            pass

    if allow_prophet and date_list and len(train) >= 30:
        try:
            import pandas as pd
            from prophet import Prophet

            prophet_train = pd.DataFrame({"ds": pd.to_datetime(date_list[:len(train)]), "y": train})
            prophet_test = pd.DataFrame({"ds": pd.to_datetime(date_list[-len(test):])})
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model = Prophet(
                    weekly_seasonality=frequency == "D" and len(train) >= 42,
                    yearly_seasonality=frequency == "D" and len(train) >= 365,
                    daily_seasonality=False,
                    interval_width=0.90,
                )
                model.fit(prophet_train)
                predicted = [max(0.0, float(value)) for value in model.predict(prophet_test)["yhat"].tolist()]
            candidates.append({"name": "Prophet", "kind": "prophet", "metrics": regression_metrics(test, predicted)})
        except Exception:
            pass

    valid_candidates = [candidate for candidate in candidates if candidate["metrics"].get("rmse") is not None]
    selected = min(valid_candidates, key=lambda candidate: float(candidate["metrics"]["rmse"])) if valid_candidates else candidates[0]

    try:
        if selected["kind"] == "arima":
            from statsmodels.tsa.arima.model import ARIMA
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                fitted = ARIMA(series, order=selected["order"]).fit()
                predictions = [max(0.0, float(value)) for value in fitted.forecast(steps=horizon)]
        elif selected["kind"] == "prophet":
            import pandas as pd
            from prophet import Prophet
            full_frame = pd.DataFrame({"ds": pd.to_datetime(date_list), "y": series})
            future_frame = pd.DataFrame({"ds": pd.to_datetime(_future_dates(date_list[-1], horizon, frequency))})
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model = Prophet(
                    weekly_seasonality=frequency == "D" and len(series) >= 42,
                    yearly_seasonality=frequency == "D" and len(series) >= 365,
                    daily_seasonality=False,
                    interval_width=0.90,
                )
                model.fit(full_frame)
                predictions = [max(0.0, float(value)) for value in model.predict(future_frame)["yhat"].tolist()]
        else:
            predictions = _linear_predictions(series, horizon)
    except Exception:
        predictions = _linear_predictions(series, horizon)
        selected = candidates[0]

    evaluated = [{"name": candidate["name"], **candidate["metrics"]} for candidate in candidates]
    return {
        "predictions": [round(value, 2) for value in predictions],
        "model": _model_meta(
            selected["name"], selected["kind"] in {"linear", "arima", "prophet"}, selected["metrics"], evaluated,
            f"Selected by lowest RMSE on the latest {validation_size} held-out observations.",
        ),
    }


def forecast_study_hours(values: Iterable[Any], dates: Iterable[datetime], *, horizon: int = 7) -> dict[str, Any]:
    """Fit a Random Forest regressor using calendar, lag, and rolling features."""
    hours = _clean_numbers(values)
    date_list = list(dates)
    if len(date_list) != len(hours) or len(hours) < 21:
        predictions = _linear_predictions(hours[-7:], horizon)
        return {
            "predictions": [round(max(0.0, min(16.0, value)), 2) for value in predictions],
            "model": _model_meta(
                "Linear trend fallback", False, {"mae": None, "rmse": None, "mape": None}, [],
                "At least 21 dated study observations are required to train the Random Forest regressor.",
            ),
        }

    def features(index: int, history: list[float], observed_date: datetime) -> list[float]:
        recent = history[max(0, index - 7):index]
        return [float(index), float(observed_date.weekday()), float(observed_date.day), history[index - 1], mean(recent), max(recent) - min(recent)]

    rows = [features(index, hours, date_list[index]) for index in range(7, len(hours))]
    targets = hours[7:]
    validation_size = min(14, max(3, len(rows) // 5))
    split = len(rows) - validation_size

    try:
        from sklearn.ensemble import RandomForestRegressor

        validation_model = RandomForestRegressor(n_estimators=180, max_depth=7, min_samples_leaf=2, random_state=42, n_jobs=-1)
        validation_model.fit(rows[:split], targets[:split])
        validation_predictions = [max(0.0, float(value)) for value in validation_model.predict(rows[split:])]
        metrics = regression_metrics(targets[split:], validation_predictions)

        final_model = RandomForestRegressor(n_estimators=220, max_depth=7, min_samples_leaf=2, random_state=42, n_jobs=-1)
        final_model.fit(rows, targets)
        history = list(hours)
        future_predictions = []
        for step in range(horizon):
            future_date = date_list[-1] + timedelta(days=step + 1)
            index = len(history)
            estimate = max(0.0, min(16.0, float(final_model.predict([features(index, history, future_date)])[0])))
            history.append(estimate)
            future_predictions.append(round(estimate, 2))
        return {
            "predictions": future_predictions,
            "model": _model_meta(
                "Random Forest Regressor", True, metrics, [{"name": "Random Forest Regressor", **metrics}],
                f"Validated on the latest {validation_size} study observations using chronological holdout.",
            ),
        }
    except Exception:
        predictions = _linear_predictions(hours[-7:], horizon)
        return {
            "predictions": [round(max(0.0, min(16.0, value)), 2) for value in predictions],
            "model": _model_meta("Linear trend fallback", False, {"mae": None, "rmse": None, "mape": None}, [], "The Random Forest model could not be fitted to this history."),
        }


def predict_habit_continuation(completions: Iterable[Any], dates: Iterable[datetime]) -> dict[str, Any]:
    """Fit a Random Forest classifier and return next-day completion likelihood."""
    outcomes = [1 if bool(value) else 0 for value in completions]
    date_list = list(dates)
    recent_rate = mean(outcomes[-30:]) if outcomes else 0.0
    fallback = round(recent_rate * 100)
    if len(date_list) != len(outcomes) or len(outcomes) < 21 or len(set(outcomes)) < 2:
        return {
            "likelihood": fallback,
            "model": _model_meta(
                "Recent completion-rate fallback", False, {"accuracy": None}, [],
                "At least 21 dated outcomes containing both completed and missed days are required for classification.",
            ),
        }

    def build_features(index: int, history: list[int], observed_date: datetime) -> list[float]:
        recent = history[max(0, index - 7):index]
        streak = 0
        for value in reversed(history[:index]):
            if value != 1:
                break
            streak += 1
        return [float(observed_date.weekday()), float(observed_date.day), float(history[index - 1]), mean(recent), float(streak)]

    rows = [build_features(index, outcomes, date_list[index]) for index in range(7, len(outcomes))]
    targets = outcomes[7:]
    validation_size = min(14, max(3, len(rows) // 5))
    split = len(rows) - validation_size
    if len(set(targets[:split])) < 2:
        return {"likelihood": fallback, "model": _model_meta("Recent completion-rate fallback", False, {"accuracy": None}, [], "Training history does not contain both outcome classes.")}

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, precision_score, recall_score

        validation_model = RandomForestClassifier(n_estimators=180, max_depth=6, min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1)
        validation_model.fit(rows[:split], targets[:split])
        validation_predictions = validation_model.predict(rows[split:])
        forest_metrics = {
            "accuracy": round(float(accuracy_score(targets[split:], validation_predictions)) * 100, 2),
            "precision": round(float(precision_score(targets[split:], validation_predictions, zero_division=0)) * 100, 2),
            "recall": round(float(recall_score(targets[split:], validation_predictions, zero_division=0)) * 100, 2),
        }

        majority_class = 1 if mean(targets[:split]) >= .5 else 0
        baseline_predictions = [majority_class] * validation_size
        baseline_metrics = {
            "accuracy": round(float(accuracy_score(targets[split:], baseline_predictions)) * 100, 2),
            "precision": round(float(precision_score(targets[split:], baseline_predictions, zero_division=0)) * 100, 2),
            "recall": round(float(recall_score(targets[split:], baseline_predictions, zero_division=0)) * 100, 2),
        }
        evaluated = [
            {"name": "Random Forest Classifier", **forest_metrics},
            {"name": "Completion-rate Baseline", **baseline_metrics},
        ]
        if baseline_metrics["accuracy"] > forest_metrics["accuracy"]:
            return {
                "likelihood": fallback,
                "model": _model_meta(
                    "Completion-rate Baseline", False, baseline_metrics, evaluated,
                    f"The baseline was more accurate than Random Forest on the latest {validation_size} held-out outcomes.",
                ),
            }

        final_model = RandomForestClassifier(n_estimators=220, max_depth=6, min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1)
        final_model.fit(rows, targets)
        next_date = date_list[-1] + timedelta(days=1)
        probability_by_class = dict(zip(final_model.classes_, final_model.predict_proba([build_features(len(outcomes), outcomes, next_date)])[0]))
        likelihood = round(float(probability_by_class.get(1, 0.0)) * 100)
        return {
            "likelihood": likelihood,
            "model": _model_meta(
                "Random Forest Classifier", True, forest_metrics, evaluated,
                f"Validated on the latest {validation_size} habit outcomes using chronological holdout.",
            ),
        }
    except Exception:
        return {"likelihood": fallback, "model": _model_meta("Recent completion-rate fallback", False, {"accuracy": None}, [], "The Random Forest classifier could not be fitted to this history.")}
