export type ForecastRow = {
  month: string;
  recordType: "Actual" | "Forecast";
  income: number;
  actualExpense: number | null;
  arimaExpense: number | null;
  prophetExpense: number | null;
  linearExpense: number | null;
  ensembleExpense: number | null;
  savings: number;
  studyHours: number;
  focusScore: number;
  habitCompletion: number;
  goalProgress: number;
};

const months = [
  "Mar 25", "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25",
  "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26",
  "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26",
];
const income = [78000, 78000, 80000, 80000, 82000, 82000, 84000, 84000, 86000, 86000, 87000, 87000, 88000, 88000, 89000, 89000, 90000, 90000];
const expense = [49200, 50800, 50100, 52500, 51700, 54200, 53800, 55100, 56300, 55700, 57900, 58800, 59600, 60400, 61800, 62500, 64100, 65200];
const study = [8.2, 8.8, 8.5, 9.1, 9.4, 9.2, 10.1, 10.4, 10, 10.8, 11.2, 11, 11.8, 12.1, 12.4, 12.8, 13.2, 13.8];
const focus = [62, 64, 63, 66, 67, 68, 70, 71, 72, 73, 75, 74, 76, 77, 78, 79, 80, 81];
const habit = [58, 60, 59, 62, 63, 65, 66, 68, 70, 69, 72, 73, 75, 76, 78, 79, 81, 82];
const goal = [44, 46, 45, 49, 52, 54, 57, 59, 61, 64, 66, 68, 70, 72, 74, 76, 78, 79];

const actualRows: ForecastRow[] = months.map((month, index) => ({
  month,
  recordType: "Actual",
  income: income[index],
  actualExpense: expense[index],
  arimaExpense: null,
  prophetExpense: null,
  linearExpense: null,
  ensembleExpense: null,
  savings: income[index] - expense[index],
  studyHours: study[index],
  focusScore: focus[index],
  habitCompletion: habit[index],
  goalProgress: goal[index],
}));

const forecastValues = [
  ["Sep 26", 90450, 66830, 65800, 65950, 66193, 24257, 14.1, 82, 83, 82],
  ["Oct 26", 90902, 67999, 66400, 66700, 67033, 23869, 14.4, 83, 84, 85],
  ["Nov 26", 91357, 69190, 67000, 67450, 67880, 23477, 14.6, 83, 86, 88],
  ["Dec 26", 91814, 70401, 67600, 68200, 68734, 23080, 14.9, 84, 87, 91],
  ["Jan 27", 92273, 71633, 68200, 68950, 69594, 22679, 15.2, 85, 88, 94],
  ["Feb 27", 92734, 72887, 68800, 69700, 70462, 22272, 15.5, 86, 90, 97],
] as const;

export const forecastDataset: ForecastRow[] = [
  ...actualRows,
  ...forecastValues.map(([month, projectedIncome, arima, prophet, linear, ensemble, projectedSavings, projectedStudy, projectedFocus, projectedHabit, projectedGoal]) => ({
    month,
    recordType: "Forecast" as const,
    income: projectedIncome,
    actualExpense: null,
    arimaExpense: arima,
    prophetExpense: prophet,
    linearExpense: linear,
    ensembleExpense: ensemble,
    savings: projectedSavings,
    studyHours: projectedStudy,
    focusScore: projectedFocus,
    habitCompletion: projectedHabit,
    goalProgress: projectedGoal,
  })),
];

export const modelPerformance = [
  { model: "ARIMA", mae: 1180, rmse: 1490, mape: 2.1, rank: 1 },
  { model: "Prophet", mae: 1475, rmse: 1820, mape: 2.6, rank: 2 },
  { model: "Linear regression", mae: 2140, rmse: 2630, mape: 3.8, rank: 3 },
];

export const forecastInsights = [
  { tone: "warning", title: "Expense pressure is rising", detail: "The ensemble projects February expenses at ₹70,462, 8.1% above the last actual month." },
  { tone: "positive", title: "The savings goal remains achievable", detail: "Projected savings stay above the ₹18,000 monthly goal throughout the six-month horizon." },
  { tone: "positive", title: "Study consistency should improve", detail: "Weekly study time is expected to move from 13.8 to 15.5 hours with focus reaching 86%." },
  { tone: "neutral", title: "ARIMA is the most accurate model", detail: "It has the lowest historical MAPE (2.1%); the dashboard uses an ensemble to reduce single-model risk." },
];
