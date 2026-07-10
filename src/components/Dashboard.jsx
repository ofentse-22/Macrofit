import { useEffect, useState } from "react";

const fallbackProgress = [
  { date: "Week 1", bmi: 25.8 },
  { date: "Week 2", bmi: 25.2 },
  { date: "Week 3", bmi: 24.7 },
  { date: "Week 4", bmi: 24.1 },
];

function ProgressChart({ data }) {
  const values = data.map((entry) => Number(entry.bmi)).filter(Number.isFinite);
  const chartData = values.length > 1 ? data.filter((entry) => Number.isFinite(Number(entry.bmi))) : fallbackProgress;
  const numbers = chartData.map((entry) => Number(entry.bmi));
  const min = Math.min(...numbers) - 0.5;
  const max = Math.max(...numbers) + 0.5;
  const points = numbers.map((value, index) => {
    const x = 8 + (index * 84) / Math.max(numbers.length - 1, 1);
    const y = 88 - ((value - min) / (max - min || 1)) * 72;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="progress-chart" aria-label="BMI progress chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <line x1="8" y1="16" x2="92" y2="16" className="chart-grid" />
        <line x1="8" y1="52" x2="92" y2="52" className="chart-grid" />
        <line x1="8" y1="88" x2="92" y2="88" className="chart-grid" />
        <polyline points={points} className="chart-line" />
        {points.split(" ").map((point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="2" className="chart-dot" />;
        })}
      </svg>
      <div className="chart-labels">{chartData.map((entry, index) => <span key={`${entry.date}-${index}`}>{entry.date}</span>)}</div>
    </div>
  );
}

export default function Dashboard() {
  const [progressData, setProgressData] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    try {
      setProgressData(JSON.parse(localStorage.getItem("fitnessHistory") || "[]"));
      setWorkouts(JSON.parse(localStorage.getItem("workouts") || "[]"));
    } catch {
      setProgressData([]);
      setWorkouts([]);
    }
  }, []);

  const latestBmi = progressData.at(-1)?.bmi ?? "--";
  const completedSets = workouts.reduce((total, workout) => total + (workout.completedSets || 0), 0);

  return (
    <section className="dashboard feature-panel">
      <div className="section-heading"><div><p className="eyebrow">Client dashboard</p><h2>Progress at a glance</h2></div><span className="status-pill">Active plan</span></div>
      <div className="stats-grid">
        <StatCard label="Current BMI" value={latestBmi} detail="Latest recorded result" />
        <StatCard label="Exercises tracked" value={workouts.length} detail="In your current workout" />
        <StatCard label="Completed sets" value={completedSets} detail="Keep your momentum going" />
        <StatCard label="Weekly goal" value="3 / 4" detail="Workouts completed" />
      </div>
      <div className="dashboard-chart-card"><div><h3>BMI trend</h3><p>Your recorded BMI measurements over time.</p></div><ProgressChart data={progressData} /></div>
    </section>
  );
}

function StatCard({ label, value, detail }) {
  return <article className="stat-card"><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}
