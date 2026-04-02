const STORAGE_KEY = "powerlifting-log-v1";
const SEEDED_KEY = "powerlifting-log-seeded-v1";

const SEEDED_WORKOUTS = [
  { date: "2026-03-29", bench: 45, squat: 52.5, deadlift: 85 },
  { date: "2026-03-27", bench: 42.5, squat: 50, deadlift: 82.5 },
  { date: "2026-03-24", bench: 42.5, squat: 50, deadlift: 82.5 },
  { date: "2026-03-22", bench: 40, squat: 47.5, deadlift: 80 },
  { date: "2026-03-18", bench: 40, squat: 47.5, deadlift: 80 },
  { date: "2026-02-07", bench: 45, squat: 45, deadlift: 85 },
  { date: "2026-02-05", bench: 45, squat: 45, deadlift: 85 },
  { date: "2026-02-03", bench: 45, squat: 45, deadlift: 85 },
  { date: "2026-02-01", bench: 45, squat: 45, deadlift: 85 },
  { date: "2026-01-30", bench: 42.5, squat: 42.5, deadlift: 82.5 },
  { date: "2026-01-28", bench: 42.5, squat: 42.5, deadlift: 82.5 },
  { date: "2026-01-25", bench: 42.5, squat: 42.5, deadlift: 82.5 },
  { date: "2026-01-23", bench: 40, squat: 40, deadlift: 80 },
  { date: "2026-01-21", bench: 40, squat: 40, deadlift: 60 },
  { date: "2026-01-18", bench: 40, squat: 40, deadlift: 80 },
  { date: "2026-01-16", bench: 37.5, squat: 37.5, deadlift: 77.5 },
  { date: "2026-01-14", bench: 37.5, squat: 37.5, deadlift: 77.5 },
  { date: "2026-01-12", bench: 37.5, squat: 37.5, deadlift: 77.5 },
  { date: "2026-01-10", bench: 35, squat: 35, deadlift: 75 },
  { date: "2026-01-08", bench: 35, squat: 35, deadlift: 75 },
  { date: "2026-01-04", bench: 32.5, squat: 32.5, deadlift: 72.5 },
  { date: "2025-12-31", bench: 32.5, squat: 32.5, deadlift: 72.5 },
  { date: "2025-12-29", bench: 32.5, squat: 32.5, deadlift: 72.5 },
  { date: "2025-12-27", bench: 30, squat: 30, deadlift: 70 },
  { date: "2025-12-24", bench: 30, squat: 30, deadlift: 70 },
  { date: "2025-10-05", bench: 30, squat: 30, deadlift: 70 },
];

const form = document.getElementById("workout-form");
const dateInput = document.getElementById("date");
const historyBody = document.getElementById("history");
const clearButton = document.getElementById("clear");
const chartCanvas = document.getElementById("progress-chart");
const chartEmpty = document.getElementById("chart-empty");

const prBench = document.getElementById("pr-bench");
const prSquat = document.getElementById("pr-squat");
const prDeadlift = document.getElementById("pr-deadlift");

const today = new Date().toISOString().slice(0, 10);
dateInput.value = today;
const chartCtx = chartCanvas.getContext("2d");

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function seedHistoryIfNeeded() {
  const existing = loadWorkouts();
  if (existing.length) return;
  if (localStorage.getItem(SEEDED_KEY) === "true") return;
  saveWorkouts(SEEDED_WORKOUTS);
  localStorage.setItem(SEEDED_KEY, "true");
}

function formatWeight(value) {
  return `${Number(value).toFixed(1)} kg`;
}

function renderPRs(workouts) {
  if (!workouts.length) {
    prBench.textContent = "-";
    prSquat.textContent = "-";
    prDeadlift.textContent = "-";
    return;
  }

  const benchPR = Math.max(...workouts.map((w) => Number(w.bench)));
  const squatPR = Math.max(...workouts.map((w) => Number(w.squat)));
  const deadliftPR = Math.max(...workouts.map((w) => Number(w.deadlift)));

  prBench.textContent = formatWeight(benchPR);
  prSquat.textContent = formatWeight(squatPR);
  prDeadlift.textContent = formatWeight(deadliftPR);
}

function renderHistory(workouts) {
  historyBody.innerHTML = "";

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  for (const workout of sorted) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${workout.date}</td>
      <td>${formatWeight(workout.bench)}</td>
      <td>${formatWeight(workout.squat)}</td>
      <td>${formatWeight(workout.deadlift)}</td>
    `;
    historyBody.appendChild(tr);
  }
}

function formatDateShort(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

function drawLine(ctx, points, color) {
  if (!points.length) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  ctx.fillStyle = color;
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function resizeChartCanvas() {
  const deviceRatio = window.devicePixelRatio || 1;
  const displayWidth = chartCanvas.clientWidth;
  const displayHeight = Math.round(displayWidth * 0.42);
  chartCanvas.width = Math.round(displayWidth * deviceRatio);
  chartCanvas.height = Math.round(displayHeight * deviceRatio);
  chartCanvas.style.height = `${displayHeight}px`;
  chartCtx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
}

function renderChart(workouts) {
  const width = chartCanvas.clientWidth;
  const height = chartCanvas.clientHeight;
  chartCtx.clearRect(0, 0, width, height);

  if (!workouts.length) {
    chartEmpty.hidden = false;
    return;
  }

  chartEmpty.hidden = true;

  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
  const allWeights = sorted.flatMap((w) => [Number(w.bench), Number(w.squat), Number(w.deadlift)]);
  const minWeightRaw = Math.min(...allWeights);
  const maxWeightRaw = Math.max(...allWeights);
  const minWeight = Math.floor((minWeightRaw - 2.5) / 5) * 5;
  const maxWeight = Math.ceil((maxWeightRaw + 2.5) / 5) * 5;
  const range = Math.max(5, maxWeight - minWeight);

  const margin = { top: 20, right: 20, bottom: 60, left: 56 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const getX = (index) => {
    if (sorted.length === 1) return margin.left + plotWidth / 2;
    return margin.left + (index / (sorted.length - 1)) * plotWidth;
  };
  const getY = (value) => margin.top + ((maxWeight - value) / range) * plotHeight;

  chartCtx.strokeStyle = "#e2e8f0";
  chartCtx.lineWidth = 1;
  chartCtx.fillStyle = "#64748b";
  chartCtx.font = "12px 'Avenir Next', 'Segoe UI', sans-serif";

  const yTicks = 5;
  for (let tick = 0; tick <= yTicks; tick += 1) {
    const ratio = tick / yTicks;
    const y = margin.top + ratio * plotHeight;
    const weightValue = maxWeight - ratio * range;
    chartCtx.beginPath();
    chartCtx.moveTo(margin.left, y);
    chartCtx.lineTo(width - margin.right, y);
    chartCtx.stroke();
    chartCtx.fillText(`${weightValue.toFixed(0)} kg`, 6, y + 4);
  }

  chartCtx.strokeStyle = "#94a3b8";
  chartCtx.beginPath();
  chartCtx.moveTo(margin.left, margin.top);
  chartCtx.lineTo(margin.left, height - margin.bottom);
  chartCtx.lineTo(width - margin.right, height - margin.bottom);
  chartCtx.stroke();

  chartCtx.fillStyle = "#64748b";
  const xLabelCount = Math.min(6, sorted.length);
  for (let i = 0; i < xLabelCount; i += 1) {
    const dataIndex = Math.round((i / Math.max(1, xLabelCount - 1)) * (sorted.length - 1));
    const x = getX(dataIndex);
    const y = height - margin.bottom + 16;
    chartCtx.fillText(formatDateShort(sorted[dataIndex].date), x - 18, y);
  }

  const benchPoints = sorted.map((w, i) => ({ x: getX(i), y: getY(Number(w.bench)) }));
  const squatPoints = sorted.map((w, i) => ({ x: getX(i), y: getY(Number(w.squat)) }));
  const deadliftPoints = sorted.map((w, i) => ({ x: getX(i), y: getY(Number(w.deadlift)) }));

  drawLine(chartCtx, benchPoints, "#1d4ed8");
  drawLine(chartCtx, squatPoints, "#0f766e");
  drawLine(chartCtx, deadliftPoints, "#b45309");
}

function render() {
  const workouts = loadWorkouts();
  resizeChartCanvas();
  renderPRs(workouts);
  renderHistory(workouts);
  renderChart(workouts);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = {
    date: data.get("date"),
    bench: Number(data.get("bench")),
    squat: Number(data.get("squat")),
    deadlift: Number(data.get("deadlift")),
  };

  if (!entry.date) return;

  const workouts = loadWorkouts();
  workouts.push(entry);
  saveWorkouts(workouts);
  form.reset();
  dateInput.value = today;
  render();
});

clearButton.addEventListener("click", () => {
  const shouldClear = window.confirm("Delete all workouts?");
  if (!shouldClear) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

window.addEventListener("resize", render);

seedHistoryIfNeeded();
render();
