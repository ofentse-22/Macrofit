import { useState, useEffect } from "react";
import "./WeightTracker.css";

function getDataSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function WeightCard({ label, value, unit, color }) {
  return (
    <div className="weight-card" style={{ borderLeftColor: color }}>
      <span className="weight-label">{label}</span>
      <div className="weight-value">
        {value}
        <span className="weight-unit">{unit}</span>
      </div>
    </div>
  );
}

function ProgressChart({ data, valueKey, labelKey, color = "#60a5fa" }) {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [{ [labelKey]: "No data", [valueKey]: 0 }];
  const values = safeData.map((entry) => Number(entry[valueKey]));
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;

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

export default function WeightTracker() {
  const [weightHistory, setWeightHistory] = useState(() => {
    return getDataSaved("weightHistory");
  });

  const [weightGoals, setWeightGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("weightGoals") || "{}");
    } catch {
      return {};
    }
  });

  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState(weightGoals);

  const today = getTodayDate();
  const todayEntry = weightHistory.find((entry) => entry.date === today);

  // Calculate weekly average
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoDate = weekAgo.toISOString().split("T")[0];

  const weekHistory = weightHistory.filter((entry) => entry.date >= weekAgoDate);
  const weeklyAverage = weekHistory.length > 0
    ? (weekHistory.reduce((sum, entry) => sum + entry.weight, 0) / weekHistory.length).toFixed(1)
    : "N/A";

  const currentWeight = todayEntry ? todayEntry.weight : null;
  const previousWeight = weightHistory.length > 1 ? weightHistory[1].weight : null;
  const startingWeight = Number(weightGoals.startingWeight) || null;
  const goalWeight = Number(weightGoals.goalWeight) || null;

  const weightChange = previousWeight && currentWeight 
    ? (currentWeight - previousWeight).toFixed(1)
    : null;

  const totalChange = startingWeight && currentWeight
    ? (currentWeight - startingWeight).toFixed(1)
    : null;

  const remainingKg = goalWeight && currentWeight
    ? Math.max(0, (goalWeight - currentWeight).toFixed(1))
    : null;

  // Estimate days to goal
  let estimatedDays = null;
  if (weightHistory.length >= 7) {
    const recentHistory = weightHistory.slice(0, 7);
    const avgWeeklyChange = (
      (recentHistory[0].weight - recentHistory[6].weight) / 7
    ).toFixed(3);

    if (goalWeight && currentWeight && avgWeeklyChange !== "0.000") {
      const daysNeeded = Math.abs((goalWeight - currentWeight) / (avgWeeklyChange / 7));
      estimatedDays = Math.round(daysNeeded);
    }
  }

  const addWeight = (e) => {
    e.preventDefault();
    if (!newWeight) return;

    const newEntry = {
      date: today,
      weight: Number(newWeight),
      addedAt: new Date().toISOString(),
    };

    const updated = weightHistory.filter((entry) => entry.date !== today);
    const newHistory = [newEntry, ...updated];

    localStorage.setItem("weightHistory", JSON.stringify(newHistory));
    setWeightHistory(newHistory);
    setNewWeight("");
    setShowWeightForm(false);
  };

  const saveWeightGoals = (e) => {
    e.preventDefault();
    const newGoals = {
      startingWeight: Number(goalForm.startingWeight) || null,
      goalWeight: Number(goalForm.goalWeight) || null,
    };
    setWeightGoals(newGoals);
    localStorage.setItem("weightGoals", JSON.stringify(newGoals));
    setShowGoalForm(false);
  };

  const deleteEntry = (date) => {
    if (!window.confirm("Delete this weight entry?")) return;
    const updated = weightHistory.filter((entry) => entry.date !== date);
    localStorage.setItem("weightHistory", JSON.stringify(updated));
    setWeightHistory(updated);
  };

  const clearAll = () => {
    if (!window.confirm("Clear all weight history? This cannot be undone.")) return;
    localStorage.setItem("weightHistory", JSON.stringify([]));
    setWeightHistory([]);
  };

  const recentTrendData = weightHistory.slice(0, 10).reverse();

  return (
    <div className="weight-tracker-container">
      <div className="weight-header">
        <h2>Weight Tracker</h2>
        <div className="weight-header-buttons">
          <button onClick={() => setShowGoalForm(!showGoalForm)} className="btn-secondary">
            {showGoalForm ? "Cancel" : "Set Goals"}
          </button>
          <button onClick={clearAll} className="btn-danger">
            Clear All
          </button>
        </div>
      </div>

      {showGoalForm && (
        <form onSubmit={saveWeightGoals} className="weight-goals-form">
          <h3>Weight Goals</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Starting Weight (kg)</label>
              <input
                type="number"
                value={goalForm.startingWeight || ""}
                onChange={(e) => setGoalForm({ ...goalForm, startingWeight: e.target.value })}
                min="30"
                max="300"
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label>Goal Weight (kg)</label>
              <input
                type="number"
                value={goalForm.goalWeight || ""}
                onChange={(e) => setGoalForm({ ...goalForm, goalWeight: e.target.value })}
                min="30"
                max="300"
                step="0.1"
                placeholder="0.0"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Goals</button>
        </form>
      )}

      <div className="weight-summary">
        <div className="summary-row">
          <div className="summary-section">
            <h3>Current Status</h3>
            <div className="cards-grid">
              <WeightCard
                label="Today's Weight"
                value={currentWeight !== null ? currentWeight.toFixed(1) : "--"}
                unit="kg"
                color="#3b82f6"
              />
              <WeightCard
                label="Previous Weight"
                value={previousWeight !== null ? previousWeight.toFixed(1) : "--"}
                unit="kg"
                color="#8b5cf6"
              />
              <WeightCard
                label="Weekly Average"
                value={weeklyAverage !== "N/A" ? weeklyAverage : "N/A"}
                unit="kg"
                color="#06b6d4"
              />
              <WeightCard
                label="Weight Change"
                value={weightChange !== null ? (weightChange > 0 ? "+" : "") + weightChange : "--"}
                unit="kg"
                color={weightChange > 0 ? "#f87171" : "#4ade80"}
              />
            </div>
          </div>

          {(startingWeight || goalWeight) && (
            <div className="summary-section goals-section">
              <h3>Goal Progress</h3>
              <div className="cards-grid">
                {startingWeight && (
                  <WeightCard
                    label="Starting Weight"
                    value={startingWeight.toFixed(1)}
                    unit="kg"
                    color="#f59e0b"
                  />
                )}
                {goalWeight && (
                  <WeightCard
                    label="Goal Weight"
                    value={goalWeight.toFixed(1)}
                    unit="kg"
                    color="#10b981"
                  />
                )}
                {totalChange !== null && startingWeight && (
                  <WeightCard
                    label="Total Change"
                    value={(totalChange > 0 ? "+" : "") + totalChange}
                    unit="kg"
                    color={totalChange > 0 ? "#f87171" : "#4ade80"}
                  />
                )}
                {remainingKg !== null && (
                  <WeightCard
                    label="Remaining"
                    value={remainingKg}
                    unit="kg"
                    color="#ec4899"
                  />
                )}
              </div>
              {estimatedDays !== null && (
                <div className="estimated-goal">
                  <p>
                    <strong>Estimated goal date:</strong> {new Date(new Date().getTime() + estimatedDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="small">Based on {weightHistory.length >= 7 ? "recent trends" : "limited data"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {recentTrendData.length > 0 && (
        <div className="weight-chart-section">
          <h3>Weight Trend</h3>
          <ProgressChart
            data={recentTrendData}
            valueKey="weight"
            labelKey="date"
            color="#3b82f6"
          />
        </div>
      )}

      <div className="weight-entry-section">
        <div className="entry-header">
          <h3>📝 Weight Log</h3>
          <button onClick={() => setShowWeightForm(!showWeightForm)} className="btn-primary">
            {showWeightForm ? "Cancel" : "Add Weight"}
          </button>
        </div>

        {showWeightForm && (
          <form onSubmit={addWeight} className="weight-entry-form">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                min="30"
                max="300"
                step="0.1"
                placeholder="Enter weight"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary">Log Weight</button>
          </form>
        )}

        <div className="weight-history">
          {weightHistory.length === 0 ? (
            <p className="no-entries">No weight entries yet. Add your first weight entry!</p>
          ) : (
            <div className="history-table">
              <div className="table-header">
                <span className="col-date">Date</span>
                <span className="col-weight">Weight</span>
                <span className="col-change">Change</span>
                <span className="col-action">Action</span>
              </div>
              {weightHistory.map((entry, index) => {
                const prevEntry = weightHistory[index + 1];
                const change = prevEntry ? (entry.weight - prevEntry.weight).toFixed(1) : null;

                return (
                  <div key={entry.date} className="table-row">
                    <span className="col-date">
                      {new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="col-weight">{entry.weight.toFixed(1)} kg</span>
                    <span className="col-change">
                      {change !== null ? (
                        <span className={change > 0 ? "positive" : "negative"}>
                          {change > 0 ? "+" : ""}{change} kg
                        </span>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span className="col-action">
                      <button
                        onClick={() => deleteEntry(entry.date)}
                        className="btn-remove"
                        aria-label="Delete entry"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
