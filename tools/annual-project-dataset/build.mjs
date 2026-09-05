import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/tarun/OneDrive/Desktop/7.0/outputs/project-365-day-dataset-20260905";
const csvDir = `${outputDir}/csv`;
await fs.mkdir(csvDir, { recursive: true });

const DAY = 86_400_000;
const startDate = new Date(Date.UTC(2025, 8, 6));
const endDate = new Date(Date.UTC(2026, 8, 5));
const userId = "6f168c2c-529c-4ec8-9932-90d1b493cf87";
const navy = "#17345E";
const blue = "#2563EB";
const ink = "#172033";
const muted = "#64748B";
const paleBlue = "#EAF2FF";
const paleRose = "#FCE7F3";
const paleGreen = "#E7F8F0";
const paleViolet = "#F1EDFF";
const paleAmber = "#FFF4E5";
const line = "#D8E1EE";
const font = "Arial";

function rngFactory(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = rngFactory(20260905);
const random = (min, max) => min + rng() * (max - min);
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const chance = (probability) => rng() < probability;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 0) => Number(value.toFixed(digits));
const iso = (date) => date.toISOString().slice(0, 10);
const monthKey = (date) => iso(date).slice(0, 7);
const uuid = (key) => {
  const hex = createHash("sha256").update(key).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const atTime = (date, hour, minute = 0) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour, minute));
const daysInMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
const weekStart = (date) => {
  const day = date.getUTCDay();
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - ((day + 6) % 7));
  return copy;
};
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const profileHeaders = ["user_id", "name", "email", "age", "occupation", "risk_tolerance", "compliance_policy", "dataset_type", "period_start", "period_end"];
const profileRows = [[userId, "Arjun Mehta", "arjun.demo@example.com", 24, "Graduate student and part-time analyst", "Medium", "Standard Compliance", "Synthetic demonstration data", startDate, endDate]];

const financeHeaders = ["transaction_id", "date", "user_id", "type", "category", "subcategory", "amount_inr", "payment_method", "merchant", "is_recurring", "is_essential", "note"];
const studyHeaders = ["session_id", "date", "user_id", "subject", "start_time", "duration_hours", "focus_rating", "tool", "tasks_planned", "tasks_completed", "distractions", "focus_score", "learning_risk_score", "risk_marker"];
const habitHeaders = ["log_id", "date", "user_id", "habit_name", "category", "scheduled", "completed", "target_value", "actual_value", "unit", "streak", "risk_associated", "compliance_status"];
const goalHeaders = ["goal_id", "user_id", "title", "goal_type", "target_value", "unit", "timeframe", "start_date", "end_date", "status"];
const goalProgressHeaders = ["record_id", "date", "goal_id", "goal_type", "target_value", "actual_value", "progress_percent", "forecast_value", "achievement_probability", "status"];
const riskHeaders = ["date", "user_id", "financial_risk_score", "academic_risk_score", "behavioral_risk_score", "overall_risk_score", "compliance_score", "risk_level", "risk_factors"];
const alertHeaders = ["alert_id", "date", "user_id", "severity", "category", "title", "description", "status", "resolved_date"];
const activityHeaders = ["activity_id", "timestamp", "user_id", "action_type", "endpoint", "status_code", "device", "metadata"];
const dailyHeaders = ["date", "day_of_week", "week_start", "month", "is_weekend", "user_id", "income_inr", "total_expenses_inr", "net_cash_flow_inr", "daily_budget_inr", "budget_variance_inr", "cash_balance_inr", "debt_balance_inr", "essential_expenses_inr", "discretionary_expenses_inr", "financial_risk_score", "finance_compliance_status", "study_hours", "focus_rating", "focus_score", "tasks_planned", "tasks_completed", "learning_risk_score", "habit_completion_rate", "average_habit_streak", "sleep_hours", "steps", "water_liters", "mood_score", "stress_score", "screen_time_hours", "goal_progress_score", "compliance_score", "overall_risk_score", "risk_level", "active_alerts", "productivity_score"];
const everydayHeaders = [
  "date", "day_of_week", "week_start", "month", "is_weekend", "user_id",
  "income_inr", "total_expenses_inr", "essential_expenses_inr", "discretionary_expenses_inr",
  "housing_inr", "food_inr", "transport_inr", "utilities_inr", "debt_payment_inr", "education_inr", "healthcare_inr", "dining_inr", "shopping_inr", "entertainment_inr", "subscriptions_inr",
  "net_cash_flow_inr", "daily_budget_inr", "budget_variance_inr", "cash_balance_inr", "debt_balance_inr",
  "study_subject", "study_hours", "focus_rating", "focus_score", "tasks_planned", "tasks_completed", "study_tool", "learning_risk_score",
  "exercise_scheduled", "exercise_completed", "exercise_minutes", "exercise_streak",
  "reading_scheduled", "reading_completed", "reading_minutes", "reading_streak",
  "meditation_scheduled", "meditation_completed", "meditation_minutes", "meditation_streak",
  "sleep_before_11_scheduled", "sleep_before_11_completed", "sleep_before_11_streak",
  "budget_review_scheduled", "budget_review_completed", "budget_review_streak",
  "meal_prep_scheduled", "meal_prep_completed", "meal_prep_streak",
  "habit_completion_rate", "average_habit_streak", "sleep_hours", "steps", "water_liters", "mood_score", "stress_score", "screen_time_hours",
  "savings_goal_progress", "study_goal_progress", "exercise_goal_progress", "reading_goal_progress", "debt_goal_progress", "sleep_goal_progress", "overall_goal_progress_score",
  "financial_risk_score", "academic_risk_score", "behavioral_risk_score", "overall_risk_score", "compliance_score", "risk_level", "active_alerts", "productivity_score",
];

const goals = [
  { key: "save", title: "Save ₹18,000 each month", type: "FINANCIAL", target: 18000, unit: "INR", timeframe: "MONTHLY", end: endDate },
  { key: "study", title: "Study 14 hours each week", type: "STUDY", target: 14, unit: "hours", timeframe: "WEEKLY", end: endDate },
  { key: "exercise", title: "Exercise five times each week", type: "HABIT", target: 5, unit: "sessions", timeframe: "WEEKLY", end: endDate },
  { key: "read", title: "Read 25 minutes each day", type: "HABIT", target: 25, unit: "minutes", timeframe: "DAILY", end: endDate },
  { key: "debt", title: "Reduce debt by ₹96,000", type: "FINANCIAL", target: 96000, unit: "INR", timeframe: "ANNUAL", end: endDate },
  { key: "sleep", title: "Average at least 7.2 hours of sleep", type: "HABIT", target: 7.2, unit: "hours", timeframe: "DAILY", end: endDate },
].map((goal) => ({ ...goal, id: uuid(`goal-${goal.key}`) }));
const goalRows = goals.map((goal) => [goal.id, userId, goal.title, goal.type, goal.target, goal.unit, goal.timeframe, startDate, goal.end, "ACTIVE"]);

const financeRows = [];
const studyRows = [];
const habitRows = [];
const goalProgressRows = [];
const riskRows = [];
const alertRows = [];
const activityRows = [];
const dailyRows = [];
const everydayRows = [];
const dayObjects = [];
let cashBalance = 120000;
let debtBalance = 180000;
let txCounter = 0;
let sessionCounter = 0;
let habitCounter = 0;
let goalProgressCounter = 0;
let alertCounter = 0;
let activityCounter = 0;
const streaks = new Map();
const monthAcc = new Map();
const weekAcc = new Map();

function addTransaction(date, type, category, subcategory, amount, paymentMethod, merchant, recurring, essential, note = "") {
  txCounter += 1;
  const row = [uuid(`tx-${txCounter}`), date, userId, type, category, subcategory, round(amount, 2), paymentMethod, merchant, recurring, essential, note];
  financeRows.push(row);
  return { type, category, amount: round(amount, 2), essential };
}

function addActivity(date, action, endpoint, statusCode, metadata, hour = 18) {
  activityCounter += 1;
  activityRows.push([uuid(`activity-${activityCounter}`), atTime(date, hour, randomInt(0, 55)), userId, action, endpoint, statusCode, chance(0.72) ? "Web · Windows" : "Mobile · Android", metadata]);
}

function addAlert(date, severity, category, title, description) {
  alertCounter += 1;
  const recent = (endDate - date) / DAY < 10;
  const status = recent && severity !== "INFO" ? (chance(0.55) ? "UNREAD" : "READ") : "RESOLVED";
  const resolved = status === "RESOLVED" ? new Date(date.getTime() + randomInt(1, 3) * DAY) : null;
  alertRows.push([uuid(`alert-${alertCounter}`), date, userId, severity, category, title, description, status, resolved]);
  return 1;
}

const habitDefinitions = [
  { name: "Exercise", category: "Health", target: 30, unit: "minutes", schedule: (d) => ![0, 3].includes(d.getUTCDay()), base: 0.66 },
  { name: "Reading", category: "Learning", target: 25, unit: "minutes", schedule: () => true, base: 0.72 },
  { name: "Meditation", category: "Wellbeing", target: 10, unit: "minutes", schedule: () => true, base: 0.58 },
  { name: "Sleep before 11 pm", category: "Recovery", target: 1, unit: "completed", schedule: () => true, base: 0.64 },
  { name: "Budget review", category: "Finance", target: 1, unit: "completed", schedule: (d) => d.getUTCDay() === 0, base: 0.82 },
  { name: "Meal preparation", category: "Nutrition", target: 1, unit: "completed", schedule: (d) => [0, 3].includes(d.getUTCDay()), base: 0.69 },
];

for (let index = 0; index < 365; index += 1) {
  const date = new Date(startDate.getTime() + index * DAY);
  const progress = index / 364;
  const weekend = [0, 6].includes(date.getUTCDay());
  const examSeason = (index >= 75 && index <= 115) || (index >= 245 && index <= 290);
  const stress = clamp(round(2.35 + (examSeason ? 0.85 : 0) + 0.35 * Math.sin(index / 17) + random(-0.65, 0.65), 1), 1, 5);
  const sleepHours = clamp(round(7.15 + (weekend ? 0.45 : 0) - Math.max(0, stress - 3) * 0.22 + random(-0.65, 0.55), 1), 4.8, 9.2);
  const transactions = [];
  const monthNumber = date.getUTCMonth();
  const salary = index > 180 ? 88000 : 85000;
  if (date.getUTCDate() === 1) transactions.push(addTransaction(date, "INCOME", "Salary", "Primary salary", salary, "Bank transfer", "Employer", true, true));
  if (date.getUTCDate() === 18 && monthNumber % 2 === 0) transactions.push(addTransaction(date, "INCOME", "Freelance", "Project payment", randomInt(5000, 10500), "UPI", "Freelance client", false, true));
  if (date.getUTCDate() === 2) transactions.push(addTransaction(date, "EXPENSE", "Housing", "Rent", 22000, "Bank transfer", "Landlord", true, true));
  if (date.getUTCDate() === 5) transactions.push(addTransaction(date, "EXPENSE", "Utilities", "Electricity and water", randomInt(2800, 4200), "UPI", "Utility provider", true, true));
  if (date.getUTCDate() === 7) transactions.push(addTransaction(date, "EXPENSE", "Utilities", "Internet", 899, "Card", "Internet provider", true, true));
  if (date.getUTCDate() === 8) transactions.push(addTransaction(date, "EXPENSE", "Subscriptions", "Digital services", 799, "Card", "Subscription services", true, false));
  if (date.getUTCDate() === 10) {
    transactions.push(addTransaction(date, "EXPENSE", "Debt", "Loan payment", 8000, "Bank transfer", "Loan account", true, true));
    debtBalance = Math.max(0, debtBalance - 8000);
  }
  if (chance(0.46)) transactions.push(addTransaction(date, "EXPENSE", "Food", "Groceries", randomInt(250, 1250), chance(0.7) ? "UPI" : "Card", "Grocery store", false, true));
  if (!weekend && chance(0.83)) transactions.push(addTransaction(date, "EXPENSE", "Transport", "Commute", randomInt(90, 420), chance(0.8) ? "UPI" : "Cash", "Local transport", false, true));
  if (chance(weekend ? 0.44 : 0.12)) transactions.push(addTransaction(date, "EXPENSE", "Dining", "Restaurant or delivery", randomInt(320, 1450), "UPI", "Food outlet", false, false));
  if (chance(0.055)) transactions.push(addTransaction(date, "EXPENSE", "Shopping", "Personal purchase", randomInt(650, 3200), "Card", "Retail store", false, false));
  if (weekend && chance(0.15)) transactions.push(addTransaction(date, "EXPENSE", "Entertainment", "Leisure", randomInt(350, 1800), "UPI", "Entertainment venue", false, false));
  if (chance(0.025)) transactions.push(addTransaction(date, "EXPENSE", "Healthcare", "Medicine or consultation", randomInt(450, 2800), "Card", "Healthcare provider", false, true));
  if (chance(0.045)) transactions.push(addTransaction(date, "EXPENSE", "Education", "Course or materials", randomInt(500, 2400), "UPI", "Education provider", false, true));

  const dailyIncome = transactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const dailyExpense = transactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);
  const essentialExpense = transactions.filter((item) => item.type === "EXPENSE" && item.essential).reduce((sum, item) => sum + item.amount, 0);
  const discretionaryExpense = dailyExpense - essentialExpense;
  const expenseByCategory = new Map();
  for (const item of transactions.filter((transaction) => transaction.type === "EXPENSE")) {
    expenseByCategory.set(item.category, (expenseByCategory.get(item.category) || 0) + item.amount);
  }
  const categoryExpense = (category) => round(expenseByCategory.get(category) || 0, 2);
  cashBalance = round(cashBalance + dailyIncome - dailyExpense, 2);
  const dailyBudget = weekend ? 2600 : 2100;

  const habitResults = [];
  for (const definition of habitDefinitions) {
    const scheduled = definition.schedule(date);
    const adjustedProbability = clamp(definition.base + progress * 0.14 - Math.max(0, stress - 3) * 0.055 + (weekend && definition.name === "Reading" ? 0.06 : 0), 0.25, 0.94);
    const completed = scheduled && chance(adjustedProbability);
    const previousStreak = streaks.get(definition.name) || 0;
    const streak = scheduled ? (completed ? previousStreak + 1 : 0) : previousStreak;
    streaks.set(definition.name, streak);
    let actual = 0;
    if (completed) {
      if (definition.unit === "minutes") actual = randomInt(Math.round(definition.target * 0.9), Math.round(definition.target * 1.8));
      else actual = 1;
    }
    const riskAssociated = scheduled && !completed && ["Sleep before 11 pm", "Budget review"].includes(definition.name);
    habitCounter += 1;
    habitRows.push([uuid(`habit-${habitCounter}`), date, userId, definition.name, definition.category, scheduled, completed, definition.target, actual, definition.unit, streak, riskAssociated, !scheduled ? "NOT_SCHEDULED" : completed ? "COMPLIANT" : "NON_COMPLIANT"]);
    habitResults.push({ ...definition, scheduled, completed, actual, streak });
  }
  const scheduledHabits = habitResults.filter((habit) => habit.scheduled);
  const completedHabits = scheduledHabits.filter((habit) => habit.completed);
  const habitRate = completedHabits.length / scheduledHabits.length;
  const avgStreak = habitResults.reduce((sum, habit) => sum + habit.streak, 0) / habitResults.length;
  const readingMinutes = habitResults.find((habit) => habit.name === "Reading")?.actual || 0;
  const exerciseCompleted = habitResults.some((habit) => habit.name === "Exercise" && habit.completed);
  const water = clamp(round(1.65 + completedHabits.length * 0.07 + random(-0.25, 0.35), 1), 1.0, 3.6);
  const steps = Math.round(clamp(5400 + (exerciseCompleted ? 4200 : 0) + random(-1600, 1900), 1800, 15500));
  const mood = clamp(round(3.55 + (sleepHours - 7) * 0.28 - (stress - 3) * 0.25 + random(-0.55, 0.55), 1), 1, 5);
  const screenTime = clamp(round(5.2 + (weekend ? 0.8 : 0) + stress * 0.18 - progress * 0.45 + random(-0.8, 0.8), 1), 2.4, 9.5);

  let studyHours = 0;
  let focusRating = 0;
  let focusScore = 0;
  let tasksPlanned = 0;
  let tasksCompleted = 0;
  let learningRisk = 65;
  let subject = "";
  let studyTool = "";
  const studyPlanned = !weekend || date.getUTCDay() === 0 || examSeason;
  if (studyPlanned && chance(clamp(0.69 + progress * 0.12 + (examSeason ? 0.1 : 0) - Math.max(0, stress - 4) * 0.08, 0.4, 0.95))) {
    studyHours = round(random(1.0, examSeason ? 4.1 : 3.2), 1);
    focusRating = clamp(Math.round(3.6 + (sleepHours - 7) * 0.35 - (stress - 3) * 0.28 + random(-0.9, 0.9)), 1, 5);
    focusScore = clamp(round(focusRating * 17 + studyHours * 3 + habitRate * 8, 0), 20, 100);
    tasksPlanned = randomInt(2, 6);
    tasksCompleted = clamp(Math.round(tasksPlanned * (0.45 + focusScore / 180)), 1, tasksPlanned);
    learningRisk = clamp(round(100 - focusScore + Math.max(0, 2 - studyHours) * 8, 0), 0, 100);
    const subjects = ["Data Structures", "System Design", "Mathematics", "Data Analytics", "Database Systems", "Communication Skills"];
    subject = subjects[(index + randomInt(0, 2)) % subjects.length];
    studyTool = chance(0.45) ? "Video and notes" : chance(0.5) ? "Practice problems" : "Flashcards";
    sessionCounter += 1;
    const riskMarker = learningRisk >= 70 ? "CRITICAL" : learningRisk >= 55 ? "HIGH" : learningRisk >= 35 ? "MEDIUM" : learningRisk >= 20 ? "LOW" : "SAFE";
    studyRows.push([uuid(`study-${sessionCounter}`), date, userId, subject, atTime(date, weekend ? 10 : 19, randomInt(0, 45)), studyHours, focusRating, studyTool, tasksPlanned, tasksCompleted, randomInt(0, Math.max(1, 6 - focusRating)), focusScore, learningRisk, riskMarker]);
  }

  const mk = monthKey(date);
  const wkDate = weekStart(date);
  const wk = iso(wkDate);
  const monthState = monthAcc.get(mk) || { income: 0, expense: 0, reading: 0, days: 0 };
  monthState.income += dailyIncome;
  monthState.expense += dailyExpense;
  monthState.reading += readingMinutes;
  monthState.days += 1;
  monthAcc.set(mk, monthState);
  const weekState = weekAcc.get(wk) || { study: 0, exercise: 0, days: 0 };
  weekState.study += studyHours;
  weekState.exercise += exerciseCompleted ? 1 : 0;
  weekState.days += 1;
  weekAcc.set(wk, weekState);

  const monthDay = date.getUTCDate();
  const weekDayNumber = ((date.getUTCDay() + 6) % 7) + 1;
  const savingActual = monthState.income - monthState.expense;
  const savingForecast = monthDay ? savingActual / monthDay * daysInMonth(date) : savingActual;
  const studyForecast = weekState.study / weekDayNumber * 7;
  const exerciseForecast = weekState.exercise / weekDayNumber * 7;
  const debtReduced = 180000 - debtBalance;
  const goalStates = [
    { goal: goals[0], actual: savingActual, forecast: savingForecast },
    { goal: goals[1], actual: weekState.study, forecast: studyForecast },
    { goal: goals[2], actual: weekState.exercise, forecast: exerciseForecast },
    { goal: goals[3], actual: readingMinutes, forecast: readingMinutes },
    { goal: goals[4], actual: debtReduced, forecast: debtReduced / Math.max(1, index + 1) * 365 },
    { goal: goals[5], actual: sleepHours, forecast: sleepHours },
  ];
  let goalScore = 0;
  const goalDaily = [];
  for (const state of goalStates) {
    const progressPercent = clamp(state.actual / state.goal.target, 0, 1.5);
    const probability = clamp((state.forecast / state.goal.target) * 0.72 + progressPercent * 0.18 + 0.08, 0.05, 0.99);
    const status = probability >= 0.85 ? "ON_TRACK" : probability >= 0.6 ? "NEEDS_ATTENTION" : "AT_RISK";
    goalProgressCounter += 1;
    goalProgressRows.push([uuid(`goal-progress-${goalProgressCounter}`), date, state.goal.id, state.goal.type, state.goal.target, round(state.actual, 2), round(progressPercent, 4), round(state.forecast, 2), round(probability, 4), status]);
    goalDaily.push({ key: state.goal.key, progress: round(progressPercent, 4), probability: round(probability, 4), status });
    goalScore += Math.min(1, progressPercent);
  }
  goalScore = round(goalScore / goalStates.length * 100, 0);

  const expenseRatio = monthState.income > 0 ? monthState.expense / monthState.income : 1;
  const financialRisk = clamp(round(20 + expenseRatio * 45 + (dailyExpense > dailyBudget * 2 ? 10 : 0) + (cashBalance < 50000 ? 18 : 0), 0), 5, 95);
  const academicRisk = clamp(round(studyHours === 0 ? 62 + (examSeason ? 15 : 0) : learningRisk, 0), 5, 95);
  const behavioralRisk = clamp(round((1 - habitRate) * 62 + Math.max(0, stress - 3) * 9 + Math.max(0, screenTime - 6) * 4, 0), 3, 95);
  const overallRisk = clamp(round(financialRisk * 0.42 + academicRisk * 0.3 + behavioralRisk * 0.28, 0), 0, 100);
  const complianceScore = clamp(round(100 - overallRisk * 0.65 + habitRate * 8, 0), 0, 100);
  const riskLevel = overallRisk >= 75 ? "CRITICAL" : overallRisk >= 58 ? "HIGH" : overallRisk >= 38 ? "MEDIUM" : "LOW";
  const factors = [];
  if (financialRisk >= 58) factors.push("High spending pressure");
  if (academicRisk >= 58) factors.push("Low study consistency");
  if (behavioralRisk >= 58) factors.push("Habit completion below target");
  if (stress >= 4) factors.push("Elevated stress");
  riskRows.push([date, userId, financialRisk, academicRisk, behavioralRisk, overallRisk, complianceScore, riskLevel, factors.length ? factors.join("; ") : "No material risk factors"]);

  let activeAlerts = 0;
  if (dailyExpense > 9000) activeAlerts += addAlert(date, "HIGH", "Finance", "Large daily expenditure", `Daily expenses reached ₹${Math.round(dailyExpense).toLocaleString("en-IN")}. Review recurring and discretionary transactions.`);
  if (academicRisk >= 70 && index % 3 === 0) activeAlerts += addAlert(date, "WARNING", "Study", "Study consistency at risk", `Academic risk reached ${academicRisk}. Schedule a focused session within the next 24 hours.`);
  if (habitRate < 0.45 && scheduledHabits.length >= 4) activeAlerts += addAlert(date, "WARNING", "Habits", "Habit completion below target", `Only ${Math.round(habitRate * 100)}% of scheduled habits were completed.`);
  if (stress >= 4.6 && index % 4 === 0) activeAlerts += addAlert(date, "HIGH", "Wellbeing", "High stress pattern detected", "Stress and screen-time signals are above the normal range. Protect sleep and reduce the next task load.");
  if (overallRisk < 28 && index % 45 === 0) activeAlerts += addAlert(date, "INFO", "Progress", "Stable performance trend", "Financial, study, and habit indicators are within the low-risk range.");

  const productivity = clamp(round((focusScore || 45) * 0.45 + habitRate * 30 + (tasksPlanned ? tasksCompleted / tasksPlanned * 25 : 10), 0), 0, 100);
  const financeCompliance = expenseRatio <= 0.82 && cashBalance >= 30000 ? "COMPLIANT" : expenseRatio <= 0.95 ? "PARTIALLY_COMPLIANT" : "NON_COMPLIANT";
  const habitByName = Object.fromEntries(habitResults.map((habit) => [habit.name, habit]));
  const goalByKey = Object.fromEntries(goalDaily.map((goal) => [goal.key, goal]));
  everydayRows.push([
    date, dayNames[date.getUTCDay()], wkDate, mk, weekend, userId,
    round(dailyIncome, 2), round(dailyExpense, 2), round(essentialExpense, 2), round(discretionaryExpense, 2),
    categoryExpense("Housing"), categoryExpense("Food"), categoryExpense("Transport"), categoryExpense("Utilities"), categoryExpense("Debt"), categoryExpense("Education"), categoryExpense("Healthcare"), categoryExpense("Dining"), categoryExpense("Shopping"), categoryExpense("Entertainment"), categoryExpense("Subscriptions"),
    round(dailyIncome - dailyExpense, 2), dailyBudget, round(dailyExpense - dailyBudget, 2), cashBalance, debtBalance,
    subject, studyHours, focusRating || null, focusScore || null, tasksPlanned, tasksCompleted, studyTool, academicRisk,
    habitByName.Exercise.scheduled, habitByName.Exercise.completed, habitByName.Exercise.actual, habitByName.Exercise.streak,
    habitByName.Reading.scheduled, habitByName.Reading.completed, habitByName.Reading.actual, habitByName.Reading.streak,
    habitByName.Meditation.scheduled, habitByName.Meditation.completed, habitByName.Meditation.actual, habitByName.Meditation.streak,
    habitByName["Sleep before 11 pm"].scheduled, habitByName["Sleep before 11 pm"].completed, habitByName["Sleep before 11 pm"].streak,
    habitByName["Budget review"].scheduled, habitByName["Budget review"].completed, habitByName["Budget review"].streak,
    habitByName["Meal preparation"].scheduled, habitByName["Meal preparation"].completed, habitByName["Meal preparation"].streak,
    round(habitRate, 4), round(avgStreak, 1), sleepHours, steps, water, mood, stress, screenTime,
    goalByKey.save.progress, goalByKey.study.progress, goalByKey.exercise.progress, goalByKey.read.progress, goalByKey.debt.progress, goalByKey.sleep.progress, goalScore,
    financialRisk, academicRisk, behavioralRisk, overallRisk, complianceScore, riskLevel, activeAlerts, productivity,
  ]);
  dailyRows.push([date, dayNames[date.getUTCDay()], wkDate, mk, weekend, userId, round(dailyIncome, 2), round(dailyExpense, 2), round(dailyIncome - dailyExpense, 2), dailyBudget, round(dailyExpense - dailyBudget, 2), cashBalance, debtBalance, round(essentialExpense, 2), round(discretionaryExpense, 2), financialRisk, financeCompliance, studyHours, focusRating || null, focusScore || null, tasksPlanned, tasksCompleted, academicRisk, round(habitRate, 4), round(avgStreak, 1), sleepHours, steps, water, mood, stress, screenTime, goalScore, complianceScore, overallRisk, riskLevel, activeAlerts, productivity]);
  dayObjects.push({ date, mk, wk, income: dailyIncome, expense: dailyExpense, savings: dailyIncome - dailyExpense, studyHours, focusScore: focusScore || null, habitRate, sleepHours, stress, goalScore, complianceScore, overallRisk, activeAlerts, productivity });

  if (chance(weekend ? 0.68 : 0.94)) addActivity(date, "USER_LOGIN", "/api/v1/auth/login", 200, "Successful login", weekend ? 10 : 8);
  if (transactions.length) addActivity(date, "FINANCIAL_LOG", "/api/v1/financial", 201, `${transactions.length} transactions represented`, 20);
  if (studyHours > 0) addActivity(date, "STUDY_LOG", "/api/v1/study", 201, `${studyHours} study hours logged`, 21);
  addActivity(date, "HABIT_UPDATE", "/api/v1/habits", 200, `${completedHabits.length}/${scheduledHabits.length} scheduled habits completed`, 22);
  if (activeAlerts && chance(0.62)) addActivity(date, "ALERT_READ", "/api/v1/alerts", 200, `${activeAlerts} alert(s) reviewed`, 22);
}

function aggregateBy(key) {
  const groups = new Map();
  for (const day of dayObjects) {
    const groupKey = day[key];
    const state = groups.get(groupKey) || { dates: [], income: 0, expense: 0, savings: 0, studyHours: 0, focus: [], habit: [], sleep: [], stress: [], goal: [], compliance: [], risk: [], alerts: 0, productivity: [] };
    state.dates.push(day.date);
    state.income += day.income;
    state.expense += day.expense;
    state.savings += day.savings;
    state.studyHours += day.studyHours;
    if (day.focusScore !== null) state.focus.push(day.focusScore);
    state.habit.push(day.habitRate);
    state.sleep.push(day.sleepHours);
    state.stress.push(day.stress);
    state.goal.push(day.goalScore);
    state.compliance.push(day.complianceScore);
    state.risk.push(day.overallRisk);
    state.alerts += day.activeAlerts;
    state.productivity.push(day.productivity);
    groups.set(groupKey, state);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
const avg = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const weeklyGroups = aggregateBy("wk");
const weeklyHeaders = ["week_start", "week_end", "total_income_inr", "total_expenses_inr", "net_savings_inr", "expense_growth_rate", "study_hours", "average_focus_score", "habit_completion_rate", "average_sleep_hours", "average_stress_score", "goal_progress_score", "compliance_score", "overall_risk_score", "alert_count", "productivity_score", "next_week_expenses_target_inr", "next_week_habit_rate_target"];
const weeklyRows = weeklyGroups.map(([key, state], index) => {
  const next = weeklyGroups[index + 1]?.[1];
  const previous = weeklyGroups[index - 1]?.[1];
  return [new Date(`${key}T00:00:00Z`), new Date(state.dates.at(-1)), round(state.income, 2), round(state.expense, 2), round(state.savings, 2), previous && previous.expense ? round((state.expense - previous.expense) / previous.expense, 4) : null, round(state.studyHours, 1), round(avg(state.focus), 1), round(avg(state.habit), 4), round(avg(state.sleep), 1), round(avg(state.stress), 1), round(avg(state.goal), 1), round(avg(state.compliance), 1), round(avg(state.risk), 1), state.alerts, round(avg(state.productivity), 1), next ? round(next.expense, 2) : null, next ? round(avg(next.habit), 4) : null];
});
const monthlyGroups = aggregateBy("mk");
const monthlyHeaders = ["month", "month_label", "total_income_inr", "total_expenses_inr", "net_savings_inr", "savings_rate", "expense_growth_rate", "study_hours", "average_focus_score", "habit_completion_rate", "average_sleep_hours", "average_stress_score", "goal_progress_score", "compliance_score", "overall_risk_score", "alert_count", "productivity_score", "next_month_expenses_target_inr"];
const monthlyRows = monthlyGroups.map(([key, state], index) => {
  const next = monthlyGroups[index + 1]?.[1];
  const previous = monthlyGroups[index - 1]?.[1];
  const date = new Date(`${key}-01T00:00:00Z`);
  return [date, date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }), round(state.income, 2), round(state.expense, 2), round(state.savings, 2), state.income ? round(state.savings / state.income, 4) : null, previous && previous.expense ? round((state.expense - previous.expense) / previous.expense, 4) : null, round(state.studyHours, 1), round(avg(state.focus), 1), round(avg(state.habit), 4), round(avg(state.sleep), 1), round(avg(state.stress), 1), round(avg(state.goal), 1), round(avg(state.compliance), 1), round(avg(state.risk), 1), state.alerts, round(avg(state.productivity), 1), next ? round(next.expense, 2) : null];
});

const everydayDefinitionOverrides = {
  date: "Calendar date for the daily observation",
  week_start: "Monday date for the observation week",
  month: "Calendar month for grouping and forecasting",
  income_inr: "Income received on the date",
  total_expenses_inr: "Total expenditure on the date",
  essential_expenses_inr: "Daily expenses marked essential",
  discretionary_expenses_inr: "Daily expenses not marked essential",
  net_cash_flow_inr: "Daily income less total daily expenses",
  budget_variance_inr: "Daily expenses less the daily budget",
  habit_completion_rate: "Completed scheduled habits divided by scheduled habits",
  average_habit_streak: "Average current streak across the six tracked habits",
  overall_goal_progress_score: "Average capped progress across the six active goals, scaled from 0 to 100",
  overall_risk_score: "Weighted financial, academic, and behavioral risk score",
  compliance_score: "Combined daily finance and behavior compliance score",
  active_alerts: "Number of alerts triggered on the date",
  productivity_score: "Combined focus, habit completion, and task completion score",
};
const everydayDictionaryRows = everydayHeaders.map((field) => {
  const isBoolean = field === "is_weekend" || field.endsWith("_scheduled") || field.endsWith("_completed");
  const isDate = ["date", "week_start", "month"].includes(field);
  const isCurrency = field.endsWith("_inr");
  const isPercent = field === "habit_completion_rate" || field.endsWith("_goal_progress");
  const isText = ["day_of_week", "user_id", "study_subject", "study_tool", "risk_level"].includes(field);
  const dataType = isBoolean ? "Boolean" : isDate ? "Date" : isCurrency ? "Currency" : isPercent ? "Percent" : isText ? "Text" : "Number";
  const validRange = isBoolean ? "TRUE, FALSE" : isDate ? `${iso(startDate)} to ${iso(endDate)}` : isCurrency ? "Signed amount in INR" : isPercent ? "0 to 1.5" : field.includes("score") || field.includes("rating") ? "0 to 100 unless stated" : ">= 0 or controlled text";
  const definition = everydayDefinitionOverrides[field] || field.replaceAll("_", " ").replace(/\binr\b/i, "in INR");
  const modelRole = field === "date" || field === "user_id" ? "Key" : field.includes("risk") || field.includes("progress") || field === "productivity_score" ? "Feature / target" : "Feature";
  return ["Everyday Activity", field, dataType, definition, modelRole, validRange];
});

const dictionaryRows = [
  ...everydayDictionaryRows,
  ["Daily Summary", "date", "Date", "Daily observation date", "Key", "2025-09-06 to 2026-09-05"],
  ["Daily Summary", "income_inr", "Currency", "Income received on the day", "Feature", ">= 0"],
  ["Daily Summary", "total_expenses_inr", "Currency", "Total daily expenditure", "Feature / target", ">= 0"],
  ["Daily Summary", "net_cash_flow_inr", "Currency", "Income less expenses", "Feature", "Signed value"],
  ["Daily Summary", "cash_balance_inr", "Currency", "Running cash balance", "Feature", "Signed value"],
  ["Daily Summary", "debt_balance_inr", "Currency", "Remaining debt balance", "Feature", ">= 0"],
  ["Daily Summary", "focus_score", "Number", "Calculated focus score", "Feature", "0 to 100; blank without session"],
  ["Daily Summary", "habit_completion_rate", "Percent", "Completed scheduled habits divided by scheduled habits", "Feature / target", "0 to 1"],
  ["Daily Summary", "goal_progress_score", "Number", "Average capped progress across active goals", "Feature", "0 to 100"],
  ["Daily Summary", "overall_risk_score", "Number", "Weighted financial, academic, and behavioral risk", "Feature / target", "0 to 100"],
  ["Daily Summary", "productivity_score", "Number", "Combined focus, habit, and task completion score", "Feature / target", "0 to 100"],
  ["Finance Transactions", "amount_inr", "Currency", "Transaction value in Indian rupees", "Feature", "> 0"],
  ["Finance Transactions", "type", "Category", "Income or expense direction", "Feature", "INCOME, EXPENSE"],
  ["Study Sessions", "duration_hours", "Number", "Length of a completed study session", "Feature", "0 to 24"],
  ["Study Sessions", "learning_risk_score", "Number", "Risk derived from focus and study duration", "Target", "0 to 100"],
  ["Habit Log", "scheduled", "Boolean", "Whether the habit was planned for the date", "Filter", "TRUE, FALSE"],
  ["Habit Log", "completed", "Boolean", "Whether the scheduled habit was completed", "Target", "TRUE, FALSE"],
  ["Habit Log", "streak", "Integer", "Consecutive scheduled completions", "Feature", ">= 0"],
  ["Goals", "target_value", "Number", "Goal target in the stated unit and timeframe", "Reference", "> 0"],
  ["Goal Progress", "achievement_probability", "Percent", "Estimated probability based on pace and progress", "Target", "0 to 1"],
  ["Risk & Compliance", "compliance_score", "Number", "Combined compliance measure", "Target", "0 to 100"],
  ["Alerts", "severity", "Category", "Alert urgency", "Target", "INFO, WARNING, HIGH, CRITICAL"],
  ["Activity History", "action_type", "Category", "User or system action recorded for audit", "Feature", "Controlled list"],
  ["Weekly Features", "next_week_expenses_target_inr", "Currency", "Following week's expenses for supervised forecasting", "ML target", "Blank for final week"],
  ["Weekly Features", "next_week_habit_rate_target", "Percent", "Following week's habit completion rate", "ML target", "Blank for final week"],
  ["Monthly Features", "next_month_expenses_target_inr", "Currency", "Following month's expenses for supervised forecasting", "ML target", "Blank for final month"],
];
const dictionaryHeaders = ["sheet", "field", "data_type", "definition", "model_role", "valid_values_or_range"];

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const formatted = value instanceof Date ? iso(value) : String(value);
  return /[",\n]/.test(formatted) ? `"${formatted.replaceAll('"', '""')}"` : formatted;
}
async function writeCsv(fileName, headers, rows) {
  const text = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  await fs.writeFile(`${csvDir}/${fileName}`, text, "utf8");
}

const csvExports = [
  ["user_profile.csv", profileHeaders, profileRows],
  ["everyday_activity.csv", everydayHeaders, everydayRows],
  ["daily_summary.csv", dailyHeaders, dailyRows],
  ["finance_transactions.csv", financeHeaders, financeRows],
  ["study_sessions.csv", studyHeaders, studyRows],
  ["habit_log.csv", habitHeaders, habitRows],
  ["goals.csv", goalHeaders, goalRows],
  ["goal_progress.csv", goalProgressHeaders, goalProgressRows],
  ["risk_compliance.csv", riskHeaders, riskRows],
  ["alerts.csv", alertHeaders, alertRows],
  ["activity_history.csv", activityHeaders, activityRows],
  ["weekly_features.csv", weeklyHeaders, weeklyRows],
  ["monthly_features.csv", monthlyHeaders, monthlyRows],
];
await Promise.all(csvExports.map(([name, headers, rows]) => writeCsv(name, headers, rows)));

const workbook = Workbook.create();
const readme = workbook.worksheets.add("Read Me");
const dashboard = workbook.worksheets.add("Dashboard");
const profile = workbook.worksheets.add("User Profile");
const everyday = workbook.worksheets.add("Everyday Activity");
const daily = workbook.worksheets.add("Daily Summary");
const finance = workbook.worksheets.add("Finance Transactions");
const study = workbook.worksheets.add("Study Sessions");
const habits = workbook.worksheets.add("Habit Log");
const goalsSheet = workbook.worksheets.add("Goals");
const goalProgress = workbook.worksheets.add("Goal Progress");
const risk = workbook.worksheets.add("Risk & Compliance");
const alerts = workbook.worksheets.add("Alerts");
const activity = workbook.worksheets.add("Activity History");
const weekly = workbook.worksheets.add("Weekly Features");
const monthly = workbook.worksheets.add("Monthly Features");
const dictionary = workbook.worksheets.add("Data Dictionary");

function colLetter(index) {
  let result = "";
  let number = index;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    number = Math.floor((number - 1) / 26);
  }
  return result;
}

function styleDataSheet(sheet, title, subtitle, headers, rows, tableName) {
  const lastCol = colLetter(headers.length);
  const lastRow = rows.length + 4;
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastCol}1`).format.borders = { bottom: { style: "thin", color: navy } };
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format = { font: { name: font, size: 16, bold: true, color: navy } };
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastCol}2`).format = { font: { name: font, size: 10, italic: true, color: muted } };
  sheet.getRange(`A4:${lastCol}4`).values = [headers];
  if (rows.length) sheet.getRange(`A5:${lastCol}${lastRow}`).values = rows;
  sheet.getRange(`A4:${lastCol}${lastRow}`).format.font = { name: font, size: 9, color: ink };
  sheet.getRange(`A4:${lastCol}4`).format = { fill: navy, font: { name: font, size: 9, bold: true, color: "#FFFFFF" }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center", rowHeight: 34 };
  const hasLongText = headers.some((header) => ["description", "metadata", "note", "risk_factors", "definition", "valid_values_or_range"].includes(header));
  sheet.getRange(`A5:${lastCol}${lastRow}`).format.rowHeight = hasLongText ? 32 : 20;
  sheet.getRange(`A4:${lastCol}${lastRow}`).format.columnWidth = 14;
  const preferredWidths = {
    transaction_id: 38, session_id: 38, log_id: 38, goal_id: 38, record_id: 38, alert_id: 38, activity_id: 38, user_id: 38,
    name: 22, email: 30, age: 10, occupation: 36, risk_tolerance: 18, compliance_policy: 24, dataset_type: 32,
    title: 34, description: 52, metadata: 34, note: 34, risk_factors: 50, endpoint: 24, device: 20,
    subject: 24, study_subject: 24, tool: 22, study_tool: 22, habit_name: 24, compliance_status: 22, finance_compliance_status: 24, risk_marker: 16,
    category: 18, subcategory: 24, payment_method: 18, merchant: 24, action_type: 20,
    sheet: 24, field: 32, data_type: 16, definition: 52, model_role: 22, valid_values_or_range: 38,
    month_label: 16, day_of_week: 16, risk_level: 16, status: 20,
  };
  for (let column = 0; column < headers.length; column += 1) {
    const header = headers[column];
    const letter = colLetter(column + 1);
    const range = sheet.getRange(`${letter}5:${letter}${lastRow}`);
    if (header.includes("timestamp") || header === "start_time") range.setNumberFormat("yyyy-mm-dd hh:mm");
    else if (["date", "month", "week_start", "week_end", "start_date", "end_date", "period_start", "period_end", "resolved_date"].includes(header)) range.setNumberFormat("yyyy-mm-dd");
    else if (header.includes("inr") || header.includes("amount") || header.includes("balance") || header.includes("budget")) range.setNumberFormat('₹#,##0.00');
    else if (header.includes("rate") || header.includes("percent") || header.includes("probability") || header.endsWith("_goal_progress")) range.setNumberFormat("0.0%");
    else if (header.includes("hours") || header.includes("liters")) range.setNumberFormat("0.0");
    else if (header.includes("score") || header.includes("rating") || header.includes("streak") || header.includes("count")) range.setNumberFormat("0.0");
    if (preferredWidths[header]) sheet.getRange(`${letter}4:${letter}${lastRow}`).format.columnWidth = preferredWidths[header];
    else if (header.includes("_id")) sheet.getRange(`${letter}4:${letter}${lastRow}`).format.columnWidth = 38;
    if (["description", "metadata", "note", "risk_factors"].includes(header)) sheet.getRange(`${letter}4:${letter}${lastRow}`).format = { columnWidth: 36, wrapText: true };
  }
  const table = sheet.tables.add(`A4:${lastCol}${lastRow}`, true, tableName);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  sheet.freezePanes.freezeRows(4);
  sheet.freezePanes.freezeColumns(1);
  return { lastCol, lastRow };
}

styleDataSheet(profile, "Synthetic user profile", "One demonstration user aligned to the project's profile schema", profileHeaders, profileRows, "UserProfileTable");
styleDataSheet(everyday, "Everyday activity", "One complete row for each of 365 days covering finance, study, habits, wellbeing, goals, risk, compliance, and alerts", everydayHeaders, everydayRows, "EverydayActivityTable");
const everydaySections = [
  ["A3:F3", "Date and profile", paleBlue],
  ["G3:Z3", "Finance", paleGreen],
  ["AA3:AH3", "Study", paleViolet],
  ["AI3:BC3", "Habits", paleAmber],
  ["BD3:BK3", "Wellbeing", paleBlue],
  ["BL3:BR3", "Goals", paleGreen],
  ["BS3:BZ3", "Risk and performance", paleRose],
];
for (const [range, label, fill] of everydaySections) {
  everyday.getRange(range).merge();
  everyday.getRange(range.split(":")[0]).values = [[label]];
  everyday.getRange(range).format = { fill, font: { name: font, size: 9, bold: true, color: navy }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: line } };
}
everyday.getRange("A4:BZ4").format.rowHeight = 46;
styleDataSheet(daily, "Daily project dataset", "365 daily observations covering finance, study, habits, wellbeing, goals, compliance, risk, and alerts", dailyHeaders, dailyRows, "DailySummaryTable");
styleDataSheet(finance, "Finance transactions", "Normalized income and expense events used to calculate daily and monthly financial metrics", financeHeaders, financeRows, "FinanceTransactionsTable");
styleDataSheet(study, "Study sessions", "Completed study sessions with focus, productivity, and learning-risk measures", studyHeaders, studyRows, "StudySessionsTable");
styleDataSheet(habits, "Habit log", "Six tracked routines evaluated every day, including scheduled and unscheduled states", habitHeaders, habitRows, "HabitLogTable");
styleDataSheet(goalsSheet, "Goals", "Goal definitions used by the daily forecasting and progress records", goalHeaders, goalRows, "GoalsTable");
styleDataSheet(goalProgress, "Goal progress", "Daily progress and achievement probability for six active goals", goalProgressHeaders, goalProgressRows, "GoalProgressTable");
styleDataSheet(risk, "Risk and compliance", "Daily risk components, overall level, compliance score, and contributing factors", riskHeaders, riskRows, "RiskComplianceTable");
styleDataSheet(alerts, "Alerts", "Triggered finance, study, habit, wellbeing, and progress notifications", alertHeaders, alertRows, "AlertsTable");
styleDataSheet(activity, "Activity history", "Audit-ready user and system actions mapped to project endpoints", activityHeaders, activityRows, "ActivityHistoryTable");
styleDataSheet(weekly, "Weekly model features", "Aggregated features with next-week targets for supervised forecasting", weeklyHeaders, weeklyRows, "WeeklyFeaturesTable");
styleDataSheet(monthly, "Monthly model features", "Aggregated features with next-month expense targets for dashboard and model training", monthlyHeaders, monthlyRows, "MonthlyFeaturesTable");
styleDataSheet(dictionary, "Data dictionary", "Field definitions, model roles, and valid ranges for the dataset", dictionaryHeaders, dictionaryRows, "DataDictionaryTable");

// Useful dynamic visual signals.
daily.getRange(`H5:H${dailyRows.length + 4}`).conditionalFormats.add("colorScale", { colors: ["#DCFCE7", "#FEF3C7", "#FECACA"], thresholds: ["min", { type: "percentile", value: 60 }, "max"] });
daily.getRange(`AH5:AH${dailyRows.length + 4}`).conditionalFormats.add("colorScale", { colors: ["#DCFCE7", "#FEF3C7", "#FECACA"], thresholds: ["min", { type: "percentile", value: 50 }, "max"] });
everyday.freezePanes.freezeColumns(6);
const everydayColumn = (field) => colLetter(everydayHeaders.indexOf(field) + 1);
for (const field of everydayHeaders.filter((header) => header.endsWith("_scheduled") || header.endsWith("_completed") || header.endsWith("_goal_progress") || header.endsWith("_risk_score"))) {
  const letter = everydayColumn(field);
  everyday.getRange(`${letter}4:${letter}${everydayRows.length + 4}`).format.columnWidth = 18;
}
everyday.getRange(`${everydayColumn("total_expenses_inr")}5:${everydayColumn("total_expenses_inr")}${everydayRows.length + 4}`).conditionalFormats.add("colorScale", { colors: ["#DCFCE7", "#FEF3C7", "#FECACA"], thresholds: ["min", { type: "percentile", value: 60 }, "max"] });
everyday.getRange(`${everydayColumn("habit_completion_rate")}5:${everydayColumn("habit_completion_rate")}${everydayRows.length + 4}`).conditionalFormats.add("dataBar", { color: blue, gradient: true });
everyday.getRange(`${everydayColumn("overall_risk_score")}5:${everydayColumn("overall_risk_score")}${everydayRows.length + 4}`).conditionalFormats.add("colorScale", { colors: ["#DCFCE7", "#FEF3C7", "#FECACA"], thresholds: ["min", 50, "max"] });
risk.getRange(`F5:F${riskRows.length + 4}`).conditionalFormats.add("colorScale", { colors: ["#DCFCE7", "#FEF3C7", "#FECACA"], thresholds: ["min", 50, "max"] });
goalProgress.getRange(`G5:G${goalProgressRows.length + 4}`).conditionalFormats.add("dataBar", { color: blue, gradient: true });

// Read Me.
readme.showGridLines = false;
readme.getRange("A1:G1").format.borders = { bottom: { style: "thin", color: navy } };
readme.getRange("A1").values = [["365-day project dataset"]];
readme.getRange("A1").format = { font: { name: font, size: 17, bold: true, color: navy } };
readme.getRange("A2").values = [["Synthetic demonstration records for application testing, analytics, and forecasting"]];
readme.getRange("A2:G2").format = { font: { name: font, size: 10, italic: true, color: muted } };
readme.getRange("A4:B11").values = [
  ["Dataset type", "Synthetic data; no real personal information"],
  ["Period", `${iso(startDate)} to ${iso(endDate)} (365 days)`],
  ["Currency", "INR"],
  ["Demo user", "Arjun Mehta"],
  ["Everyday rows", everydayRows.length],
  ["Daily rows", dailyRows.length],
  ["Habit rows", habitRows.length],
  ["Goal progress rows", goalProgressRows.length],
];
readme.getRange("A4:A11").format = { fill: paleBlue, font: { name: font, bold: true, color: navy } };
readme.getRange("A4:B11").format.borders = { preset: "inside", style: "thin", color: line };
readme.getRange("A13:G13").values = [["Sheet", "Purpose", "Primary grain", "Rows", "Use", null, null]];
readme.getRange("A13:G13").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
const sheetGuide = [
  ["Dashboard", "Annual overview and trends", "Summary", 1, "Reporting"],
  ["Everyday Activity", "Complete daily record across every project area", "Day", everydayRows.length, "Filtering, analysis, and ML"],
  ["Daily Summary", "Integrated features across all project domains", "Day", dailyRows.length, "Dashboard and ML"],
  ["Finance Transactions", "Normalized income and expenses", "Transaction", financeRows.length, "Financial analysis"],
  ["Study Sessions", "Study and focus records", "Session", studyRows.length, "Productivity analysis"],
  ["Habit Log", "Scheduled routine outcomes", "Habit/day", habitRows.length, "Habit prediction"],
  ["Goal Progress", "Goal progress and probability", "Goal/day", goalProgressRows.length, "Goal forecasting"],
  ["Risk & Compliance", "Daily risk and compliance measures", "Day", riskRows.length, "Alerts and monitoring"],
  ["Weekly Features", "Forecast-ready weekly table", "Week", weeklyRows.length, "Model training"],
  ["Monthly Features", "Forecast-ready monthly table", "Month", monthlyRows.length, "Model training"],
];
readme.getRange(`A14:E${13 + sheetGuide.length}`).values = sheetGuide;
readme.getRange(`A13:E${13 + sheetGuide.length}`).format = { font: { name: font, size: 10 }, borders: { preset: "inside", style: "thin", color: line } };
readme.getRange("A:A").format.columnWidth = 24;
readme.getRange("B:B").format.columnWidth = 45;
readme.getRange("C:E").format.columnWidth = 18;

// Dashboard.
dashboard.showGridLines = false;
dashboard.getRange("A1:P1").format.borders = { bottom: { style: "thin", color: navy } };
dashboard.getRange("A1").values = [["Annual performance overview"]];
dashboard.getRange("A1").format = { font: { name: font, size: 17, bold: true, color: navy } };
dashboard.getRange("A2").values = [[`Synthetic daily data from ${iso(startDate)} to ${iso(endDate)}; currency in INR`]];
dashboard.getRange("A2:P2").format = { font: { name: font, size: 10, italic: true, color: muted } };
const cards = [
  { range: "A4:C7", title: "Total income", formula: `=SUM('Daily Summary'!G5:G${dailyRows.length + 4})`, format: "₹#,##0", fill: paleBlue },
  { range: "D4:F7", title: "Total expenses", formula: `=SUM('Daily Summary'!H5:H${dailyRows.length + 4})`, format: "₹#,##0", fill: paleRose },
  { range: "G4:I7", title: "Net cash flow", formula: "=A6-D6", format: "₹#,##0", fill: paleGreen },
  { range: "J4:L7", title: "Habit completion", formula: `=AVERAGE('Daily Summary'!X5:X${dailyRows.length + 4})`, format: "0.0%", fill: paleViolet },
  { range: "M4:P7", title: "Average compliance", formula: `=AVERAGE('Daily Summary'!AG5:AG${dailyRows.length + 4})`, format: "0.0", fill: paleAmber },
];
for (const card of cards) {
  const [start, end] = card.range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const endCol = end.match(/[A-Z]+/)[0];
  dashboard.getRange(card.range).format = { fill: card.fill, borders: { preset: "outside", style: "thin", color: line } };
  dashboard.getRange(`${startCol}4:${endCol}4`).merge();
  dashboard.getRange(`${startCol}4`).values = [[card.title]];
  dashboard.getRange(`${startCol}4:${endCol}4`).format = { font: { name: font, size: 10, bold: true, color: muted }, horizontalAlignment: "center" };
  dashboard.getRange(`${startCol}6:${endCol}6`).merge();
  dashboard.getRange(`${startCol}6`).formulas = [[card.formula]];
  dashboard.getRange(`${startCol}6`).setNumberFormat(card.format);
  dashboard.getRange(`${startCol}6:${endCol}6`).format = { font: { name: font, size: 16, bold: true, color: ink }, horizontalAlignment: "center" };
}

const monthlyLast = monthlyRows.length + 4;
const financeChart = dashboard.charts.add("line", [monthly.getRange(`B4:B${monthlyLast}`), monthly.getRange(`C4:C${monthlyLast}`), monthly.getRange(`D4:D${monthlyLast}`), monthly.getRange(`E4:E${monthlyLast}`)]);
financeChart.title = "Monthly income, expenses, and savings";
financeChart.legend = { position: "top", textStyle: { typeface: font, fontSize: 9 } };
financeChart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 9 } };
financeChart.yAxis = { numberFormatCode: "₹#,##0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
financeChart.setPosition("A10", "H25");

dashboard.getRange("R4:U4").values = [["month", "average_focus_score", "habit_completion_percent", "goal_progress_score"]];
for (let row = 5; row <= monthlyLast; row += 1) {
  dashboard.getRange(`R${row}:U${row}`).formulas = [[`='Monthly Features'!B${row}`, `='Monthly Features'!I${row}`, `='Monthly Features'!J${row}*100`, `='Monthly Features'!M${row}`]];
}
const performanceChart = dashboard.charts.add("line", dashboard.getRange(`R4:U${monthlyLast}`));
performanceChart.title = "Focus, habits, and goal progress";
performanceChart.legend = { position: "top", textStyle: { typeface: font, fontSize: 9 } };
performanceChart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 9 } };
performanceChart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
performanceChart.setPosition("I10", "P25");

const riskChart = dashboard.charts.add("line", [monthly.getRange(`B4:B${monthlyLast}`), monthly.getRange(`N4:N${monthlyLast}`), monthly.getRange(`O4:O${monthlyLast}`)]);
riskChart.title = "Compliance and risk";
riskChart.legend = { position: "top", textStyle: { typeface: font, fontSize: 9 } };
riskChart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 9 } };
riskChart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
riskChart.setPosition("A28", "H43");

dashboard.getRange("I28:P28").merge();
dashboard.getRange("I28").values = [["Latest month summary"]];
dashboard.getRange("I28:P28").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
dashboard.getRange("I29:L37").values = [["Metric", "Value", "Unit", "Interpretation"], ["Month", null, "", "Most recent partial month"], ["Income", null, "INR", "Income received"], ["Expenses", null, "INR", "Total expenditure"], ["Net savings", null, "INR", "Income less expenses"], ["Average focus", null, "0-100", "Study-session focus"], ["Habit completion", null, "%", "Scheduled habits completed"], ["Compliance", null, "0-100", "Combined compliance score"], ["Overall risk", null, "0-100", "Weighted risk score"]];
dashboard.getRange("J30:J37").formulas = [[`='Monthly Features'!B${monthlyLast}`], [`='Monthly Features'!C${monthlyLast}`], [`='Monthly Features'!D${monthlyLast}`], [`='Monthly Features'!E${monthlyLast}`], [`='Monthly Features'!I${monthlyLast}`], [`='Monthly Features'!J${monthlyLast}`], [`='Monthly Features'!N${monthlyLast}`], [`='Monthly Features'!O${monthlyLast}`]];
dashboard.getRange("I29:L29").format = { fill: blue, font: { name: font, bold: true, color: "#FFFFFF" } };
dashboard.getRange("I29:L37").format.borders = { preset: "inside", style: "thin", color: line };
dashboard.getRange("J31:J33").setNumberFormat("₹#,##0");
dashboard.getRange("J35").setNumberFormat("0.0%");
dashboard.getRange("I29:I37").format.columnWidth = 22;
dashboard.getRange("J:J").format.columnWidth = 16;
dashboard.getRange("K:K").format.columnWidth = 12;
dashboard.getRange("L:L").format.columnWidth = 28;
dashboard.getRange("A1:P43").format.font.name = font;

// Compact validation output and visual previews.
const dashboardCheck = await workbook.inspect({ kind: "table", range: "Dashboard!A1:P37", include: "values,formulas", tableMaxRows: 37, tableMaxCols: 16 });
console.log(dashboardCheck.ndjson);
const dailyCheck = await workbook.inspect({ kind: "table", range: "Daily Summary!A1:AL10", include: "values,formulas", tableMaxRows: 10, tableMaxCols: 38 });
console.log(dailyCheck.ndjson);
const everydayCheck = await workbook.inspect({ kind: "table", range: "Everyday Activity!A1:BZ10", include: "values,formulas", tableMaxRows: 10, tableMaxCols: 78 });
console.log(everydayCheck.ndjson);
const formulaErrors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
console.log(formulaErrors.ndjson);

const previews = [
  ["Read Me", "A1:G24", "read-me.png"],
  ["Dashboard", "A1:P43", "dashboard.png"],
  ["User Profile", "A1:J7", "user-profile.png"],
  ["Everyday Activity", "A1:Z20", "everyday-activity-finance.png"],
  ["Everyday Activity", "AA1:BD20", "everyday-activity-habits.png"],
  ["Everyday Activity", "BE1:BZ20", "everyday-activity-goals-risk.png"],
  ["Daily Summary", "A1:L20", "daily-summary-finance.png"],
  ["Daily Summary", "Q1:AL20", "daily-summary-performance.png"],
  ["Finance Transactions", "A1:L20", "finance-transactions.png"],
  ["Study Sessions", "A1:N20", "study-sessions.png"],
  ["Habit Log", "A1:M20", "habit-log.png"],
  ["Goals", "A1:J12", "goals.png"],
  ["Goal Progress", "A1:J20", "goal-progress.png"],
  ["Risk & Compliance", "A1:I20", "risk-compliance.png"],
  ["Alerts", "A1:I20", "alerts.png"],
  ["Activity History", "A1:H20", "activity-history.png"],
  ["Weekly Features", "A1:R20", "weekly-features.png"],
  ["Monthly Features", "A1:R18", "monthly-features.png"],
  ["Data Dictionary", "A1:F30", "data-dictionary.png"],
];
for (const [sheetName, range, fileName] of previews) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/${fileName}`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
const workbookPath = `${outputDir}/project-365-day-complete-dataset.xlsx`;
await output.save(workbookPath);

const manifest = {
  period: { start: iso(startDate), end: iso(endDate), days: dailyRows.length },
  synthetic: true,
  user_id: userId,
  counts: {
    everyday_activity: everydayRows.length,
    daily_summary: dailyRows.length,
    finance_transactions: financeRows.length,
    study_sessions: studyRows.length,
    habit_log: habitRows.length,
    goals: goalRows.length,
    goal_progress: goalProgressRows.length,
    risk_compliance: riskRows.length,
    alerts: alertRows.length,
    activity_history: activityRows.length,
    weekly_features: weeklyRows.length,
    monthly_features: monthlyRows.length,
  },
  workbook: workbookPath,
  csv_directory: csvDir,
};
await fs.writeFile(`${outputDir}/manifest.json`, JSON.stringify(manifest, null, 2), "utf8");
console.log(JSON.stringify(manifest));
