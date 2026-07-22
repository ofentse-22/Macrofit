import { useEffect, useRef, useState } from "react";

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
      return date.toISOString().split("T")[0];
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

function ProgressChart({ data, valueKey, labelKey, color = "#60a5fa" }) {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [{ [labelKey]: "No data", [valueKey]: 0 }];
  const values = safeData.map((entry) => Number(entry[valueKey]));
  const min = Math.min(...values, 0) - 1;
  const max = Math.max(...values, 5) + 1;

  const points = values.map((value, index) => {
    const x = 8 + (index * 84) / Math.max(values.length - 1, 1);
    const y = 88 - ((value - min) / (max - min || 1)) * 72;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="progress-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="8" y1="16" x2="92" y2="16" className="chart-grid" />
        <line x1="8" y1="52" x2="92" y2="52" className="chart-grid" />
        <line x1="8" y1="88" x2="92" y2="88" className="chart-grid" />
        <polyline points={points} className="chart-line" style={{ stroke: color }} />
        {points.split(" ").map((point, i) => {
          const [cx, cy] = point.split(",");
          return <circle key={i} cx={cx} cy={cy} r="2" className="chart-dot" style={{ fill: color }} />;
        })}
      </svg>
      <div className="chart-labels">
        {safeData.map((entry, index) => (
          <span key={index}>{entry[labelKey]}</span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [progressData] = useState(() => getDataSaved("fitnessHistory"));
  const [workouts] = useState(() => getDataSaved("workouts"));
  const [bodyCompositionHistory] = useState(() => getDataSaved("bodyCompositionHistory"));
  const [workoutHistory] = useState(() => getDataSaved("workoutHistory"));
  const [goals, setGoals] = useState(() => {
    if (typeof window === "undefined") return { weight: "", strength: "" };

    try {
      return JSON.parse(localStorage.getItem("fitGoals") || "{}");
    } catch {
      return { weight: "", strength: "" };
    }
  });
  const [goalForm, setGoalForm] = useState({ weight: "", strength: "" });
  const [reminders, setReminders] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("fitReminders") || "[]");
    } catch {
      return [];
    }
  });
  const [reminderForm, setReminderForm] = useState({ title: "", minutes: "30" });
  const reminderTimers = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fitGoals", JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fitReminders", JSON.stringify(reminders));
    }
  }, [reminders]);

  useEffect(() => {
    reminderTimers.current.forEach((timer) => window.clearTimeout(timer));
    reminderTimers.current = [];

    reminders.forEach((reminder) => {
      const delay = Math.max(1000, Number(reminder.minutes) * 60000);
      const timer = window.setTimeout(() => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(reminder.title || "Fitness Reminder", {
            body: "Time to train and stay consistent.",
          });
        } else {
          window.alert(`Reminder: ${reminder.title || "Fitness reminder"}`);
        }
      }, delay);
      reminderTimers.current.push(timer);
    });

    return () => {
      reminderTimers.current.forEach((timer) => window.clearTimeout(timer));
      reminderTimers.current = [];
    };
  }, [reminders]);

  const latestBmi = progressData.length > 0 ? progressData[progressData.length - 1].bmi.toFixed(1) : "--";
  const totalExercises = workouts.length;
  const completedSets = workouts.reduce((sum, w) => sum + (w.completedSets || 0), 0);
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets || 0), 0);
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const currentStreak = calculateStreak(workouts);
  const recentBodyHistory = bodyCompositionHistory.slice(0, 3);
  const bodyFatTrend = bodyCompositionHistory
    .slice(0, 6)
    .reverse()
    .map((entry) => ({ label: entry.date || "Saved", bodyFat: Number(entry.bodyFat) || 0 }));
  const workoutTrend = workoutHistory
    .slice(0, 6)
    .reverse()
    .map((entry) => ({ label: entry.title || "Workout", completedRatio: Number(entry.completedRatio) || 0 }));

  const shareProgress = async () => {
    const text = `FitTrack Progress: ${currentStreak} day streak | BMI: ${latestBmi} | ${totalExercises} exercises tracked`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Progress copied to clipboard");
    } catch {
      alert(text);
    }
  };

  const saveGoal = (event) => {
    event.preventDefault();
    const nextGoals = {
      weight: goalForm.weight || goals.weight || "",
      strength: goalForm.strength || goals.strength || "",
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    setGoals(nextGoals);
    setGoalForm({ weight: "", strength: "" });
  };

  const saveReminder = (event) => {
    event.preventDefault();

    if (!reminderForm.title.trim()) return;

    const nextReminder = {
      id: `${Date.now()}`,
      title: reminderForm.title.trim(),
      minutes: Math.max(1, Number(reminderForm.minutes) || 30),
      createdAt: new Date().toISOString(),
    };

    setReminders((current) => [nextReminder, ...current]);
    setReminderForm({ title: "", minutes: "30" });

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };

  const removeReminder = (id) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
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
        <ProgressChart data={progressData} valueKey="bmi" labelKey="date" />
      </div>

      <div className="chart-grid-stack">
        <article className="trend-card">
          <h4>Body Fat Trend</h4>
          <p>Recent body-fat snapshots from your analyzer</p>
          <ProgressChart data={bodyFatTrend} valueKey="bodyFat" labelKey="label" color="#8b5cf6" />
        </article>

        <article className="trend-card">
          <h4>Workout Completion</h4>
          <p>How complete your latest saved workouts were</p>
          <ProgressChart data={workoutTrend} valueKey="completedRatio" labelKey="label" color="#22c55e" />
        </article>
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

      <div className="chart-grid-stack">
        <article className="goal-card">
          <h4>Goal Setting</h4>
          <p>Set a target weight loss or strength milestone.</p>
          <form onSubmit={saveGoal}>
            <input
              type="text"
              placeholder="Target weight (kg)"
              value={goalForm.weight}
              onChange={(event) => setGoalForm((current) => ({ ...current, weight: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Strength target (kg)"
              value={goalForm.strength}
              onChange={(event) => setGoalForm((current) => ({ ...current, strength: event.target.value }))}
            />
            <button className="primary-button" type="submit">Save Goal</button>
          </form>

          <div className="goal-summary">
            {goals.weight && <span className="goal-pill">Weight target: {goals.weight} kg</span>}
            {goals.strength && <span className="goal-pill">Strength target: {goals.strength} kg</span>}
            {!goals.weight && !goals.strength && <span className="goal-pill">No goals set yet</span>}
          </div>
        </article>

        <article className="reminder-card">
          <h4>Reminders</h4>
          <p>Get local reminders for your training sessions.</p>
          <form onSubmit={saveReminder}>
            <input
              type="text"
              placeholder="Reminder title"
              value={reminderForm.title}
              onChange={(event) => setReminderForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              placeholder="Minutes"
              value={reminderForm.minutes}
              onChange={(event) => setReminderForm((current) => ({ ...current, minutes: event.target.value }))}
            />
            <button className="primary-button" type="submit">Add Reminder</button>
          </form>

          <div className="reminder-list">
            {reminders.length === 0 ? (
              <span className="reminder-pill">No reminders yet</span>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-item">
                  <span>{reminder.title} • {reminder.minutes}m</span>
                  <button className="btn-delete" type="button" onClick={() => removeReminder(reminder.id)}>Remove</button>
                </div>
              ))
            )}
          </div>
        </article>
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