import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/tarun/OneDrive/Desktop/7.0/outputs/forecasting-demo-20260903";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
const monthly = workbook.worksheets.add("Monthly Data");
const models = workbook.worksheets.add("Model Results");
const assumptions = workbook.worksheets.add("Assumptions");
const dictionary = workbook.worksheets.add("Data Dictionary");

const navy = "#102A56";
const blue = "#2563EB";
const lightBlue = "#EAF2FF";
const pale = "#F6F8FC";
const ink = "#172033";
const muted = "#667085";
const green = "#059669";
const rose = "#E11D48";
const line = "#D9E2F0";

for (const sheet of [dashboard, monthly, models, assumptions, dictionary]) {
  sheet.showGridLines = false;
}

// Assumptions: editable drivers used by forecast formulas.
assumptions.getRange("A1:F1").merge();
assumptions.getRange("A1").values = [["Forecast assumptions & controls"]];
assumptions.getRange("A1:F1").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 16 }, rowHeight: 30 };
assumptions.getRange("A3:C13").values = [
  ["Driver", "Value", "Purpose"],
  ["Monthly income growth", 0.005, "Expected change in recurring income"],
  ["Expense momentum", 0.025, "Short-run persistence used by ARIMA-style projection"],
  ["Prophet trend factor", 0.8, "Moderates the long-run expense trend"],
  ["Linear monthly increment", 750, "Slope applied by linear regression scenario"],
  ["Study improvement", 0.02, "Expected monthly improvement in study hours"],
  ["Focus improvement", 0.01, "Expected monthly improvement in focus score"],
  ["Habit improvement", 0.015, "Expected monthly improvement in completion rate"],
  ["Monthly savings goal", 18000, "Target used for goal-achievement probability"],
  ["History months", 18, "Number of actual months"],
  ["Forecast months", 6, "Number of projected months"],
];
assumptions.getRange("A3:C3").format = { fill: blue, font: { bold: true, color: "#FFFFFF" } };
assumptions.getRange("A4:C13").format.borders = { preset: "inside", style: "thin", color: line };
assumptions.getRange("B4:B6").format.numberFormat = "0.0%";
assumptions.getRange("B8:B10").format.numberFormat = "0.0%";
assumptions.getRange("B7").format.numberFormat = "₹#,##0";
assumptions.getRange("B11").format.numberFormat = "₹#,##0";
assumptions.getRange("A3:A13").format.columnWidth = 28;
assumptions.getRange("B3:B13").format.columnWidth = 16;
assumptions.getRange("C3:C13").format.columnWidth = 55;

// Monthly historical dataset.
monthly.getRange("A1:J1").merge();
monthly.getRange("A1").values = [["Personal performance forecasting dataset · Mar 2025–Feb 2027"]];
monthly.getRange("A1:J1").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 16 }, rowHeight: 30 };
monthly.getRange("A3:J3").values = [["Month", "Record Type", "Income (₹)", "Expenses (₹)", "Net Savings (₹)", "Debt Balance (₹)", "Study Hours", "Focus Score", "Habit Completion", "Goal Progress"]];
monthly.getRange("A3:J3").format = { fill: blue, font: { bold: true, color: "#FFFFFF" }, wrapText: true, rowHeight: 30 };

const income = [78000, 78000, 80000, 80000, 82000, 82000, 84000, 84000, 86000, 86000, 87000, 87000, 88000, 88000, 89000, 89000, 90000, 90000];
const expenses = [49200, 50800, 50100, 52500, 51700, 54200, 53800, 55100, 56300, 55700, 57900, 58800, 59600, 60400, 61800, 62500, 64100, 65200];
const debt = [220000, 216000, 211500, 208000, 203000, 199500, 195000, 192000, 188000, 185000, 182500, 179000, 176500, 174000, 171000, 168500, 166000, 164000];
const study = [8.2, 8.8, 8.5, 9.1, 9.4, 9.2, 10.1, 10.4, 10.0, 10.8, 11.2, 11.0, 11.8, 12.1, 12.4, 12.8, 13.2, 13.8];
const focus = [0.62, 0.64, 0.63, 0.66, 0.67, 0.68, 0.70, 0.71, 0.72, 0.73, 0.75, 0.74, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81];
const habit = [0.58, 0.60, 0.59, 0.62, 0.63, 0.65, 0.66, 0.68, 0.70, 0.69, 0.72, 0.73, 0.75, 0.76, 0.78, 0.79, 0.81, 0.82];
const progress = [0.44, 0.46, 0.45, 0.49, 0.52, 0.54, 0.57, 0.59, 0.61, 0.64, 0.66, 0.68, 0.70, 0.72, 0.74, 0.76, 0.78, 0.79];

const historyRows = [];
for (let i = 0; i < 18; i++) {
  historyRows.push([new Date(2025, 2 + i, 1), "Actual", income[i], expenses[i], null, debt[i], study[i], focus[i], habit[i], progress[i]]);
}
monthly.getRange("A4:J21").values = historyRows;
monthly.getRange("E4").formulas = [["=C4-D4"]];
monthly.getRange("E4:E21").fillDown();

// Model result formulas for the six-month forecast horizon.
models.getRange("A1:N1").merge();
models.getRange("A1").values = [["Forecast model comparison · six-month horizon"]];
models.getRange("A1:N1").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 16 }, rowHeight: 30 };
models.getRange("A3:N3").values = [["Month", "ARIMA Expense", "Prophet Expense", "Linear Expense", "Ensemble Expense", "Projected Income", "ARIMA Savings", "Prophet Savings", "Linear Savings", "Ensemble Savings", "Study Hours", "Focus Score", "Habit Completion", "Goal Probability"]];
models.getRange("A3:N3").format = { fill: blue, font: { bold: true, color: "#FFFFFF" }, wrapText: true, rowHeight: 34 };

for (let i = 0; i < 6; i++) {
  const row = 4 + i;
  const dataRow = 22 + i;
  models.getRange(`A${row}`).values = [[new Date(2026, 8 + i, 1)]];
  models.getRange(`B${row}`).formulas = [[i === 0 ? "=ROUND('Monthly Data'!$D$21*(1+'Assumptions'!$B$5),0)" : `=ROUND(B${row - 1}*(1+'Assumptions'!$B$5*0.7),0)`]];
  models.getRange(`C${row}`).formulas = [[`=ROUND('Monthly Data'!$D$21+(ROW(A${row})-3)*'Assumptions'!$B$7*'Assumptions'!$B$6,0)`]];
  models.getRange(`D${row}`).formulas = [[`=ROUND('Monthly Data'!$D$21+(ROW(A${row})-3)*'Assumptions'!$B$7,0)`]];
  models.getRange(`E${row}`).formulas = [[`=ROUND(AVERAGE(B${row}:D${row}),0)`]];
  models.getRange(`F${row}`).formulas = [[i === 0 ? "=ROUND('Monthly Data'!$C$21*(1+'Assumptions'!$B$4),0)" : `=ROUND(F${row - 1}*(1+'Assumptions'!$B$4),0)`]];
  models.getRange(`G${row}:J${row}`).formulas = [[`=ROUND(F${row}-B${row},0)`, `=ROUND(F${row}-C${row},0)`, `=ROUND(F${row}-D${row},0)`, `=ROUND(F${row}-E${row},0)`]];
  models.getRange(`K${row}`).formulas = [[i === 0 ? "='Monthly Data'!$G$21*(1+'Assumptions'!$B$8)" : `=K${row - 1}*(1+'Assumptions'!$B$8)`]];
  models.getRange(`L${row}`).formulas = [[i === 0 ? "=MIN(1,'Monthly Data'!$H$21*(1+'Assumptions'!$B$9))" : `=MIN(1,L${row - 1}*(1+'Assumptions'!$B$9))`]];
  models.getRange(`M${row}`).formulas = [[i === 0 ? "=MIN(1,'Monthly Data'!$I$21*(1+'Assumptions'!$B$10))" : `=MIN(1,M${row - 1}*(1+'Assumptions'!$B$10))`]];
  models.getRange(`N${row}`).formulas = [[`=MIN(1,AVERAGE(L${row},M${row},MAX(0,J${row}/'Assumptions'!$B$11)))`]];

  monthly.getRange(`A${dataRow}:B${dataRow}`).values = [[new Date(2026, 8 + i, 1), "Forecast"]];
  monthly.getRange(`C${dataRow}`).formulas = [[`=ROUND('Model Results'!F${row},0)`]];
  monthly.getRange(`D${dataRow}`).formulas = [[`=ROUND('Model Results'!E${row},0)`]];
  monthly.getRange(`E${dataRow}`).formulas = [[`=ROUND(C${dataRow}-D${dataRow},0)`]];
  monthly.getRange(`F${dataRow}`).formulas = [[i === 0 ? `=ROUND(MAX(0,F21-MAX(0,E${dataRow})*0.25),0)` : `=ROUND(MAX(0,F${dataRow - 1}-MAX(0,E${dataRow})*0.25),0)`]];
  monthly.getRange(`G${dataRow}:I${dataRow}`).formulas = [[`='Model Results'!K${row}`, `='Model Results'!L${row}`, `='Model Results'!M${row}`]];
  monthly.getRange(`J${dataRow}`).formulas = [[i === 0 ? "=MIN(1,J21+0.03)" : `=MIN(1,J${dataRow - 1}+0.03)`]];
}

monthly.getRange("A4:A27").setNumberFormat("mmm yyyy");
monthly.getRange("C4:F27").setNumberFormat("₹#,##0");
monthly.getRange("G4:G27").setNumberFormat("0.0");
monthly.getRange("H4:J27").setNumberFormat("0%");
monthly.getRange("A22:J27").format.fill = lightBlue;
monthly.getRange("B4:B27").dataValidation = { rule: { type: "list", values: ["Actual", "Forecast"] } };
monthly.freezePanes.freezeRows(3);
monthly.getRange("A3:J27").format.borders = { preset: "inside", style: "thin", color: line };
monthly.getRange("A3:J27").format.autofitColumns();
monthly.getRange("A3:A27").format.columnWidth = 14;
monthly.getRange("B3:B27").format.columnWidth = 15;

models.getRange("A4:A9").setNumberFormat("mmm yyyy");
models.getRange("B4:J9").setNumberFormat("₹#,##0");
models.getRange("K4:K9").setNumberFormat("0.0");
models.getRange("L4:N9").setNumberFormat("0%");
models.getRange("A3:N9").format.borders = { preset: "inside", style: "thin", color: line };
models.getRange("A3:N9").format.autofitColumns();
models.getRange("A3:A15").format.columnWidth = 14;
models.getRange("B3:J9").format.columnWidth = 17;
models.getRange("A12:A15").format.columnWidth = 20;

// Model accuracy table.
models.getRange("A12:E12").values = [["Model", "MAE", "RMSE", "MAPE", "Rank"]];
models.getRange("A12:E15").values = [
  ["Model", "MAE", "RMSE", "MAPE", "Rank"],
  ["ARIMA", 1180, 1490, 0.021, 1],
  ["Prophet", 1475, 1820, 0.026, 2],
  ["Linear Regression", 2140, 2630, 0.038, 3],
];
models.getRange("A12:E12").format = { fill: navy, font: { bold: true, color: "#FFFFFF" } };
models.getRange("B13:C15").setNumberFormat("₹#,##0");
models.getRange("D13:D15").setNumberFormat("0.0%");
models.getRange("A12:E15").format.borders = { preset: "inside", style: "thin", color: line };

// Chart helper data on Model Results.
models.getRange("P3:U3").values = [["Month", "Actual", "ARIMA", "Prophet", "Linear", "Ensemble"]];
for (let i = 0; i < 24; i++) {
  const helperRow = 4 + i;
  const monthlyRow = 4 + i;
  models.getRange(`P${helperRow}`).formulas = [[`=TEXT('Monthly Data'!A${monthlyRow},"mmm yy")`]];
  if (i < 18) {
    models.getRange(`Q${helperRow}`).formulas = [[`='Monthly Data'!D${monthlyRow}`]];
    models.getRange(`R${helperRow}:U${helperRow}`).values = [[null, null, null, null]];
  } else {
    const modelRow = 4 + (i - 18);
    models.getRange(`Q${helperRow}`).values = [[null]];
    models.getRange(`R${helperRow}:U${helperRow}`).formulas = [[`=B${modelRow}`, `=C${modelRow}`, `=D${modelRow}`, `=E${modelRow}`]];
  }
}
models.getRange("P3:P27").format.columnWidth = 13;
models.getRange("Q3:U27").format.columnWidth = 15;
models.getRange("Q4:U27").setNumberFormat("₹#,##0");

// Data dictionary.
dictionary.getRange("A1:D1").merge();
dictionary.getRange("A1").values = [["Data dictionary"]];
dictionary.getRange("A1:D1").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 16 }, rowHeight: 30 };
dictionary.getRange("A3:D17").values = [
  ["Field", "Type", "Definition", "Source / formula"],
  ["Month", "Date", "Monthly observation or forecast period", "Input"],
  ["Record Type", "Category", "Actual or Forecast", "Input"],
  ["Income", "Currency", "Recurring monthly income", "Historical input; forecast assumption"],
  ["Expenses", "Currency", "Total monthly expenditure", "Historical input; ensemble model"],
  ["Net Savings", "Currency", "Income less expenses", "Income - Expenses"],
  ["Debt Balance", "Currency", "Outstanding debt", "Input; forecast reduction rule"],
  ["Study Hours", "Number", "Average focused study hours per week", "Input; growth assumption"],
  ["Focus Score", "Percent", "Normalized focus rating", "Input; growth assumption"],
  ["Habit Completion", "Percent", "Share of planned routines completed", "Input; growth assumption"],
  ["Goal Progress", "Percent", "Progress across active goals", "Input; monthly increment"],
  ["ARIMA", "Currency", "Short-memory expense projection", "Momentum model"],
  ["Prophet", "Currency", "Moderated trend projection", "Trend-factor model"],
  ["Linear", "Currency", "Straight-line expense projection", "Latest actual + monthly slope"],
  ["Ensemble", "Currency", "Selected forecast used on dashboard", "Average of three models"],
];
dictionary.getRange("A3:D3").format = { fill: blue, font: { bold: true, color: "#FFFFFF" } };
dictionary.getRange("A3:D17").format.borders = { preset: "inside", style: "thin", color: line };
dictionary.getRange("A3:A17").format.columnWidth = 22;
dictionary.getRange("B3:B17").format.columnWidth = 15;
dictionary.getRange("C3:C17").format.columnWidth = 48;
dictionary.getRange("D3:D17").format.columnWidth = 38;
dictionary.getRange("C4:D17").format.wrapText = true;

// Dashboard: reference-inspired KPI cards and result panels.
dashboard.getRange("A1:P2").merge();
dashboard.getRange("A1").values = [["Forecasting & Predictive Analytics"]];
dashboard.getRange("A1:P2").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 20 }, verticalAlignment: "center" };
dashboard.getRange("A3:P3").merge();
dashboard.getRange("A3").values = [["A complete demo dataset for financial, productivity, habit, and goal forecasting"]];
dashboard.getRange("A3:P3").format = { fill: "#DCE9FF", font: { color: navy, italic: true } };

const cards = [
  { range: "A5:C8", title: "Projected income", formula: "='Model Results'!F9", format: "₹#,##0", fill: "#EAF2FF" },
  { range: "D5:F8", title: "Projected expenses", formula: "='Model Results'!E9", format: "₹#,##0", fill: "#FCE7F3" },
  { range: "G5:I8", title: "Projected savings", formula: "='Model Results'!J9", format: "₹#,##0", fill: "#E7F8F0" },
  { range: "J5:L8", title: "Savings rate", formula: "='Model Results'!J9/'Model Results'!F9", format: "0.0%", fill: "#F0EDFF" },
  { range: "M5:P8", title: "Goal probability", formula: "='Model Results'!N9", format: "0%", fill: "#FFF3E6" },
];
for (const card of cards) {
  dashboard.getRange(card.range).format = { fill: card.fill, borders: { preset: "outside", style: "thin", color: line } };
  const [start] = card.range.split(":");
  const end = card.range.split(":")[1];
  const startCol = start.match(/[A-Z]+/)[0];
  const endCol = end.match(/[A-Z]+/)[0];
  const startRow = Number(start.match(/\d+/)[0]);
  dashboard.getRange(`${startCol}${startRow}:${endCol}${startRow}`).merge();
  dashboard.getRange(`${startCol}${startRow}`).values = [[card.title]];
  dashboard.getRange(`${startCol}${startRow}:${endCol}${startRow}`).format = { font: { bold: true, color: muted }, horizontalAlignment: "center" };
  dashboard.getRange(`${startCol}${startRow + 2}:${endCol}${startRow + 2}`).merge();
  const displayFormula = card.format.includes("%")
    ? `=TEXT(${card.formula.slice(1)},"${card.format}")`
    : `="₹ "&TEXT(${card.formula.slice(1)},"#,##0")`;
  dashboard.getRange(`${startCol}${startRow + 2}`).formulas = [[displayFormula]];
  dashboard.getRange(`${startCol}${startRow + 2}:${endCol}${startRow + 2}`).format = { font: { bold: true, color: ink, size: 16 }, horizontalAlignment: "center" };
  dashboard.getRange(`${startCol}${startRow + 2}`).setNumberFormat(card.format);
}

const expenseChart = dashboard.charts.add("line", models.getRange("P3:U27"));
expenseChart.title = "Expense forecast · Actual vs three models";
expenseChart.hasLegend = true;
expenseChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
expenseChart.yAxis = { numberFormatCode: "₹#,##0" };
expenseChart.setPosition("A10", "H27");

// Productivity helper and chart.
dashboard.getRange("R3:U3").values = [["Month", "Study Hours", "Focus Score", "Habit Completion"]];
for (let i = 0; i < 24; i++) {
  const row = 4 + i;
  const sourceRow = 4 + i;
  dashboard.getRange(`R${row}:U${row}`).formulas = [[`=TEXT('Monthly Data'!A${sourceRow},"mmm yy")`, `='Monthly Data'!G${sourceRow}`, `='Monthly Data'!H${sourceRow}*15`, `='Monthly Data'!I${sourceRow}*15`]];
}
const productivityChart = dashboard.charts.add("line", dashboard.getRange("R3:U27"));
productivityChart.title = "Productivity & habit trend";
productivityChart.hasLegend = true;
productivityChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
productivityChart.yAxis = { numberFormatCode: "0.0" };
productivityChart.setPosition("I10", "P27");

dashboard.getRange("A29:F29").merge();
dashboard.getRange("A29").values = [["Forecast summary · Feb 2027"]];
dashboard.getRange("A29:F29").format = { fill: navy, font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("A30:F35").values = [
  ["Metric", "ARIMA", "Prophet", "Linear", "Ensemble", "Selected"],
  ["Expenses", null, null, null, null, "Ensemble"],
  ["Savings", null, null, null, null, "Ensemble"],
  ["Study hours", null, null, null, null, "Trend"],
  ["Focus score", null, null, null, null, "Trend"],
  ["Habit completion", null, null, null, null, "Trend"],
];
dashboard.getRange("B31:E31").formulas = [["=\"₹ \"&TEXT('Model Results'!B9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!C9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!D9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!E9,\"#,##0\")"]];
dashboard.getRange("B32:E32").formulas = [["=\"₹ \"&TEXT('Model Results'!G9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!H9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!I9,\"#,##0\")", "=\"₹ \"&TEXT('Model Results'!J9,\"#,##0\")"]];
dashboard.getRange("E33:E35").formulas = [["='Model Results'!K9"], ["='Model Results'!L9"], ["='Model Results'!M9"]];
dashboard.getRange("A30:F30").format = { fill: blue, font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("B31:E32").setNumberFormat("₹#,##0");
dashboard.getRange("E33").setNumberFormat("0.0");
dashboard.getRange("E34:E35").setNumberFormat("0%");
dashboard.getRange("A30:F35").format.borders = { preset: "inside", style: "thin", color: line };

dashboard.getRange("H29:L29").merge();
dashboard.getRange("H29").values = [["Model performance"]];
dashboard.getRange("H29:L29").format = { fill: navy, font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("H30:L33").formulas = [
  ["='Model Results'!A12", "='Model Results'!B12", "='Model Results'!C12", "='Model Results'!D12", "='Model Results'!E12"],
  ["='Model Results'!A13", "='Model Results'!B13", "='Model Results'!C13", "='Model Results'!D13", "='Model Results'!E13"],
  ["='Model Results'!A14", "='Model Results'!B14", "='Model Results'!C14", "='Model Results'!D14", "='Model Results'!E14"],
  ["='Model Results'!A15", "='Model Results'!B15", "='Model Results'!C15", "='Model Results'!D15", "='Model Results'!E15"],
];
dashboard.getRange("H30:L30").format = { fill: blue, font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("I31:J33").setNumberFormat("₹#,##0");
dashboard.getRange("K31:K33").setNumberFormat("0.0%");
dashboard.getRange("H30:L33").format.borders = { preset: "inside", style: "thin", color: line };

dashboard.getRange("N29:P29").merge();
dashboard.getRange("N29").values = [["Top insights"]];
dashboard.getRange("N29:P29").format = { fill: navy, font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("N30:P35").merge(true);
dashboard.getRange("N30:N35").values = [
  ["↑ Expenses continue rising; use the ensemble forecast for the monthly cap."],
  ["↑ Study hours and focus remain on an improving trend."],
  ["✓ ARIMA has the lowest historical error across the three models."],
  ["! Savings growth is slower than expense growth; review discretionary spend."],
  ["✓ Habit completion is projected above 90% by the end of the horizon."],
  ["→ Goal probability combines savings, focus, and routine consistency."],
];
dashboard.getRange("N30:P35").format = { fill: pale, font: { color: ink }, wrapText: true, rowHeight: 34, borders: { preset: "inside", style: "thin", color: line } };

dashboard.getRange("A1:P35").format.font = { name: "Aptos" };
dashboard.getRange("A1:P35").format.columnWidth = 12;
dashboard.getRange("A1:A35").format.columnWidth = 16;
dashboard.freezePanes.freezeRows(3);

// Visual and formula verification artifacts.
const checks = await workbook.inspect({ kind: "table", range: "Dashboard!A1:P35", include: "values,formulas", tableMaxRows: 35, tableMaxCols: 16 });
console.log(checks.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
console.log(errors.ndjson);

for (const [sheetName, range] of [["Dashboard", "A1:P35"], ["Monthly Data", "A1:J27"], ["Model Results", "A1:U27"], ["Assumptions", "A1:F13"], ["Data Dictionary", "A1:D17"]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/${sheetName.replaceAll(" ", "-").toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/predictive-analytics-demo-dataset.xlsx`);
console.log(`${outputDir}/predictive-analytics-demo-dataset.xlsx`);
