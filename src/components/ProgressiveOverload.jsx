import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./ProgressiveOverload.css";

function calculatePercentageChange(oldValue, newValue) {
  if (!oldValue || oldValue === 0) return 0;
  return (((newValue - oldValue) / oldValue) * 100).toFixed(1);
}

export default function ProgressiveOverload() {
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExerciseProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading workouts:", error);
        setLoading(false);
        return;
      }

      // Group exercises by name and calculate progression
      const progressMap = {};

      data?.forEach((exercise) => {
        if (!progressMap[exercise.name]) {
          progressMap[exercise.name] = [];
        }
        progressMap[exercise.name].push({
          weight: Number(exercise.weight_kg) || 0,
          reps: exercise.reps,
          sets: exercise.sets,
          date: new Date(exercise.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(exercise.created_at),
          id: exercise.id,
        });
      });

      // Calculate progression for each exercise
      const progress = Object.entries(progressMap)
        .map(([name, entries]) => {
          // Sort by date descending to get most recent first
          const sorted = entries.sort((a, b) => b.fullDate - a.fullDate);

          // Find recent entries with data
          const recentWithWeight = sorted.filter((e) => e.weight > 0);

          if (recentWithWeight.length < 1) {
            return null;
          }

          const current = recentWithWeight[0];
          const previous = recentWithWeight.length > 1 ? recentWithWeight[1] : null;

          const percentChange = previous
            ? calculatePercentageChange(previous.weight, current.weight)
            : 0;

          // Recommend next weight (5% increase)
          const nextRecommended = (current.weight * 1.05).toFixed(1);

          // Get last 5 entries for chart
          const last5 = sorted.slice(0, 5).reverse();

          return {
            name,
            current: current.weight,
            previous: previous?.weight,
            percentChange,
            nextRecommended,
            reps: current.reps,
            sets: current.sets,
            history: last5,
            lastUpdated: current.date,
          };
        })
        .filter((p) => p !== null)
        .sort((a, b) => b.current - a.current); // Sort by weight descending

      setExerciseProgress(progress);
      setLoading(false);
    };

    loadExerciseProgress();
  }, []);

  if (loading) {
    return (
      <div className="progressive-overload-container">
        <div className="loading">Loading progression data...</div>
      </div>
    );
  }

  return (
    <div className="progressive-overload-container">
      <div className="overload-header">
        <h2>Progressive Overload</h2>
        <p>Track your strength progression over time</p>
      </div>

      {exerciseProgress.length === 0 ? (
        <div className="empty-state">
          <p>No exercises tracked yet. Add exercises to your workout to track progression.</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {exerciseProgress.map((exercise) => (
            <div key={exercise.name} className="exercise-card">
              <div className="card-header">
                <h3>{exercise.name}</h3>
                <span className="reps-info">
                  {exercise.sets}x{exercise.reps}
                </span>
              </div>

              <div className="progression-section">
                <div className="weight-display">
                  {exercise.previous && (
                    <div className="weight-comparison">
                      <div className="weight-item previous">
                        <span className="label">Previous</span>
                        <span className="weight">{exercise.previous}kg</span>
                      </div>
                      <div className="arrow">→</div>
                      <div className="weight-item current">
                        <span className="label">Current</span>
                        <span className="weight">{exercise.current}kg</span>
                      </div>
                    </div>
                  )}
                  {!exercise.previous && (
                    <div className="weight-item current single">
                      <span className="label">Current Weight</span>
                      <span className="weight">{exercise.current}kg</span>
                    </div>
                  )}
                </div>

                {exercise.percentChange !== 0 && (
                  <div className={`progress-stat ${exercise.percentChange > 0 ? "positive" : "negative"}`}>
                    {exercise.percentChange > 0 ? "+" : ""}
                    {exercise.percentChange}%
                  </div>
                )}
              </div>

              <div className="recommendation">
                <div className="rec-label">Next recommended weight</div>
                <div className="rec-weight">{exercise.nextRecommended}kg</div>
                <div className="rec-hint">
                  5% increase for continuous progression
                </div>
              </div>

              {exercise.history.length > 1 && (
                <div className="history-chart">
                  <div className="chart-title">Recent Progression</div>
                  <div className="mini-chart">
                    <svg viewBox="0 0 100 50" preserveAspectRatio="none">
                      {exercise.history.length > 1 && (
                        <>
                          <polyline
                            points={exercise.history
                              .filter((entry) => Number.isFinite(Number(entry.weight)))
                              .map((entry, i) => {
                                const x = (i / (exercise.history.length - 1)) * 100;
                                const maxWeight = Math.max(
                                  ...exercise.history.filter((e) => Number.isFinite(Number(e.weight))).map((e) => Number(e.weight))
                                );
                                const minWeight = Math.min(
                                  ...exercise.history.filter((e) => Number.isFinite(Number(e.weight))).map((e) => Number(e.weight))
                                );
                                const range = maxWeight - minWeight || 1;
                                const y =
                                  50 -
                                  ((Number(entry.weight) - minWeight) / range) * 40;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                            className="chart-line"
                          />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="history-labels">
                    {exercise.history.map((entry, i) => (
                      <div key={i} className="label">
                        <div className="date">{entry.date}</div>
                        <div className="weight">{entry.weight}kg</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="last-updated">
                Updated: {exercise.lastUpdated}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tips-section">
        <h3>Progressive Overload Tips</h3>
        <ul>
          <li>
            <strong>Increase Weight:</strong> Add 2.5-5kg when you can complete all sets
            and reps with good form
          </li>
          <li>
            <strong>Increase Reps:</strong> If weight feels too heavy, aim for more reps
          </li>
          <li>
            <strong>Increase Sets:</strong> Add an extra set to build volume
          </li>
          <li>
            <strong>Decrease Rest Time:</strong> Reduce rest periods for conditioning
          </li>
        </ul>
      </div>
    </div>
  );
}
