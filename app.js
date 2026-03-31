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

const prBench = document.getElementById("pr-bench");
const prSquat = document.getElementById("pr-squat");
const prDeadlift = document.getElementById("pr-deadlift");

const today = new Date().toISOString().slice(0, 10);
dateInput.value = today;

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

function render() {
  const workouts = loadWorkouts();
  renderPRs(workouts);
  renderHistory(workouts);
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

seedHistoryIfNeeded();
render();
