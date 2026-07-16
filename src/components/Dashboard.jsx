import { useState } from "react";

function getDataSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function ProgressChart({ data }) {
  const validData = data.filter((entry) => Number.isFinite(Number(entry.bmi)));
  
  const fallbackProgress = [
    { date: "Week 1", bmi: 25.8 },
    { date: "Week 2", bmi: 25.2 },
    { date: "Week 3", bmi: 24.7 },
    { date: "Week 4", bmi: 24.1 },
  ];

  const chartData = validData.length > 1 ? validData : fallbackProgress;
  const numbers = chartData.map((entry) => Number(entry.bmi));
  
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

  const latestBmi = progressData.length > 0 
    ? progressData[progressData.length - 1].bmi.toFixed(1) 
    : "--";

  const totalExercises = workouts.length;
  const completedSets = workouts.reduce((total, workout) => 
    total + (workout.completedSets || 0), 0
  );

  const totalSets = workouts.reduce((total, workout) => 
    total + (workout.sets || 0), 0
  );

  const completionRate = totalSets > 0 
    ? Math.round((completedSets / totalSets) * 100) 
    : 0;

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
        <StatCard 
          label="Current BMI" 
          value={latestBmi} 
          detail="Latest recorded" 
        />
        <StatCard 
          label="Exercises" 
          value={totalExercises} 
          detail="In current workout" 
        />
        <StatCard 
          label="Sets Completed" 
          value={completedSets} 
          detail="Total this session" 
        />
        <StatCard 
          label="Completion Rate" 
          value={`${completionRate}%`} 
          detail="Sets finished" 
        />
      </div>

      <div className="dashboard-chart-card">
        <div className="chart-header">
          <h3>BMI Trend</h3>
          <p>Your BMI progress over the past weeks</p>
        </div>
        <ProgressChart data={progressData} />
      </div>

      {workouts.length > 0 && (
        <div className="recent-workout">
          <h3>Current Workout Summary</h3>
          <p>You have {workouts.length} exercises in your active workout.</p>
        </div>
      )}
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