import { useEffect, useMemo, useState } from "react";
import "./DashBoard.css";
import { workoutService } from "../services/supabaseService";

export default function WorkoutHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    workoutService.getWorkouts().then((workouts) => {
      if (!active) return;
      setHistory(workouts.map((workout) => ({
        ...workout,
        title: workout.name,
        completedAt: workout.completed_at || workout.created_at,
        exerciseCount: 1,
        totalSets: Number(workout.sets) || 0,
        completedSets: Number(workout.completed_sets) || 0,
        completedRatio: workout.sets ? Math.round((Number(workout.completed_sets || 0) / Number(workout.sets)) * 100) : 0,
        exercises: [{ name: workout.name }],
      })));
    });
    return () => { active = false; };
  }, []);

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
        <span className="status-pill">Synced</span>
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
