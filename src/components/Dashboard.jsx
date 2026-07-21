import { useState } from "react";

function getDataSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function calculateStreak(workouts) {
  if (!Array.isArray(workouts) || workouts.length === 0) return 0;

  const uniqueDates = [...new Set(workouts
    .filter((workout) => workout?.createdAt)
    .map((workout) => {
      const date = new Date(workout.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split('T')[0];
    }))];

  if (uniqueDates.length === 0) return 0;

  const sortedDates = uniqueDates
    .map((dateStr) => new Date(`${dateStr}T00:00:00`))
    .sort((a, b) => b - a);

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const workoutDate of sortedDates) {
    const diffDays = Math.round((expectedDate - workoutDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak += 1;
      expectedDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}

function ProgressChart({ data }) {
  const validData = data.filter(entry => Number.isFinite(Number(entry.bmi)));
  const fallbackProgress = [
    { date: "Week 1", bmi: 25.8 },
    { date: "Week 2", bmi: 25.2 },
    { date: "Week 3", bmi: 24.7 },
    { date: "Week 4", bmi: 24.1 }
  ];

  const chartData = validData.length > 1 ? validData : fallbackProgress;
  const numbers = chartData.map(entry => Number(entry.bmi));
  const min = Math.min(...numbers) - 0.5;
  const max = Math.max(...numbers) + 0.5;

  const points = numbers.map((value, index) => {
    const x = 8 + (index * 84) / Math.max(numbers.length - 1, 1);
    const y = 88 - ((value - min) / (max - min || 1)) * 72;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="progress-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="8" y1="16" x2="92" y2="16" className="chart-grid" />
        <line x1="8" y1="52" x2="92" y2="52" className="chart-grid" />
        <line x1="8" y1="88" x2="92" y2="88" className="chart-grid" />
        <polyline points={points} className="chart-line" />
        {points.split(" ").map((point, i) => {
          const [cx, cy] = point.split(",");
          return <circle key={i} cx={cx} cy={cy} r="2" className="chart-dot" />;
        })}
      </svg>
      <div className="chart-labels">
        {chartData.map((entry, index) => (
          <span key={index}>{entry.date}</span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [progressData] = useState(() => getDataSaved("fitnessHistory"));
  const [workouts] = useState(() => getDataSaved("workouts"));
  const [bodyCompositionHistory] = useState(() => getDataSaved("bodyCompositionHistory"));

  const latestBmi = progressData.length > 0 
    ? progressData[progressData.length - 1].bmi.toFixed(1) 
    : "--";

  const totalExercises = workouts.length;
  const completedSets = workouts.reduce((sum, w) => sum + (w.completedSets || 0), 0);
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets || 0), 0);
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const currentStreak = calculateStreak(workouts);
  const recentBodyHistory = bodyCompositionHistory.slice(0, 3);

  const shareProgress = () => {
    const text = `FitTrack Progress: ${currentStreak} day streak | BMI: ${latestBmi} | ${totalExercises} exercises tracked`;
    navigator.clipboard.writeText(text);
    alert("Progress copied to clipboard");
  };

  return (
    <section className="dashboard feature-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Client dashboard</p>
          <h2>Progress at a glance</h2>
        </div>
        <span className="status-pill">Active Plan</span>
      </div>

      <div className="stats-grid">
        <StatCard label="Current Streak" value={currentStreak + " days"} detail="Keep the momentum" />
        <StatCard label="Current BMI" value={latestBmi} detail="Latest recorded" />
        <StatCard label="Exercises" value={totalExercises} detail="In current workout" />
        <StatCard label="Completion Rate" value={completionRate + "%"} detail="Sets finished" />
      </div>

      <div className="dashboard-chart-card">
        <div className="chart-header">
          <h3>BMI Trend</h3>
          <p>Your BMI progress over the past weeks</p>
        </div>
        <ProgressChart data={progressData} />
      </div>

      <div className="history-card">
        <div className="history-card-header">
          <div>
            <h3>Body Composition History</h3>
            <p>Recent snapshots saved from the analyzer</p>
          </div>
          <span className="status-pill">Saved</span>
        </div>

        {recentBodyHistory.length > 0 ? (
          <div className="history-list">
            {recentBodyHistory.map((entry, index) => (
              <div key={entry.timestamp || index} className="history-item">
                <strong>{entry.date}</strong>
                <span>BMI {entry.bmi} • Body Fat {entry.bodyFat}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="history-empty">Save a body composition result to see it here.</p>
        )}
      </div>

      <button className="primary-button share-btn" onClick={shareProgress}>
        Share My Progress
      </button>
    </section>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}