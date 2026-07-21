import { useMemo, useState } from "react";
import "./DashBoard.css";

function getSavedHistory() {
  try {
    return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
  } catch {
    return [];
  }
}

export default function WorkoutHistory() {
  const [history] = useState(() => getSavedHistory());

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }, [history]);

  return (
    <section className="dashboard feature-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Workout history</p>
          <h2>Past sessions</h2>
        </div>
        <span className="status-pill">Saved locally</span>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="history-card">
          <p className="history-empty">No saved workouts yet. Save a workout from the tracker to build your history.</p>
        </div>
      ) : (
        <div className="history-list">
          {sortedHistory.map((entry) => (
            <article key={entry.id} className="history-card">
              <div className="history-card-header">
                <div>
                  <h3>{entry.title}</h3>
                  <p>{new Date(entry.completedAt).toLocaleString()}</p>
                </div>
                <span className="status-pill">{entry.completedRatio}% done</span>
              </div>

              <div className="history-metrics">
                <span>{entry.exerciseCount} exercises</span>
                <span>{entry.totalSets} total sets</span>
                <span>{entry.completedSets} completed</span>
              </div>

              <ul className="history-exercises">
                {entry.exercises?.map((exercise) => (
                  <li key={exercise.name}>{exercise.name}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
