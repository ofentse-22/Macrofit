import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./PersonalRecords.css";

export default function PersonalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPRs, setNewPRs] = useState([]);

  useEffect(() => {
    const loadPersonalRecords = async () => {
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

      // Group by exercise and find max weight
      const exerciseMaxes = {};
      const detectedNewPRs = [];

      data?.forEach((exercise) => {
        const weight = Number(exercise.weight_kg) || 0;
        if (weight > 0) {
          if (!exerciseMaxes[exercise.name]) {
            exerciseMaxes[exercise.name] = {
              weight: weight,
              reps: exercise.reps,
              sets: exercise.sets,
              date: new Date(exercise.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              fullDate: new Date(exercise.created_at),
            };
          } else if (weight > exerciseMaxes[exercise.name].weight) {
            const previousPR = exerciseMaxes[exercise.name];
            exerciseMaxes[exercise.name] = {
              weight: weight,
              reps: exercise.reps,
              sets: exercise.sets,
              date: new Date(exercise.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              fullDate: new Date(exercise.created_at),
            };

            detectedNewPRs.push({ name: exercise.name, previous: previousPR.weight, current: weight, increase: (weight - previousPR.weight).toFixed(1), date: exerciseMaxes[exercise.name].date });
          }
        }
      });

      // Convert to array and sort by weight
      const recordsArray = Object.entries(exerciseMaxes)
        .map(([name, data]) => ({
          name,
          ...data,
        }))
        .sort((a, b) => b.weight - a.weight);

      setRecords(recordsArray);
      setNewPRs(detectedNewPRs);

      setLoading(false);
    };

    loadPersonalRecords();
  }, []);

  const getEmojiForExercise = () => {
    return '';
  };

  if (loading) {
    return (
      <div className="personal-records-container">
        <div className="loading">Loading personal records...</div>
      </div>
    );
  }

  return (
    <div className="personal-records-container">
      <div className="records-header">
        <h2>Personal Records</h2>
        <p>Your strongest lifts to date</p>
      </div>

      {newPRs.length > 0 && (
        <div className="new-prs-section">
          <h3>🎉 New Personal Records!</h3>
          <div className="pr-alerts">
            {newPRs.map((pr, i) => (
              <div key={i} className="pr-alert">
                <div className="pr-alert-header">
                  <span className="pr-emoji">{getEmojiForExercise(pr.name)}</span>
                  <span className="pr-name">{pr.name}</span>
                </div>
                <div className="pr-alert-body">
                  <div className="pr-comparison">
                    <span className="pr-previous">
                      Previous: {pr.previous}kg
                    </span>
                    <span className="pr-arrow">→</span>
                    <span className="pr-current">
                      New: <strong>{pr.current}kg</strong>
                    </span>
                  </div>
                  <div className="pr-increase">
                    +{pr.increase}kg ({((pr.increase / pr.previous) * 100).toFixed(1)}%)
                  </div>
                  <div className="pr-date">{pr.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state">
          <p>No personal records yet. Log weights in your workouts to establish records.</p>
        </div>
      ) : (
        <div className="records-grid">
          {records.map((record) => (
            <div key={record.name} className="pr-card">
              <div className="pr-card-emoji">{getEmojiForExercise(record.name)}</div>
              <div className="pr-card-body">
                <h3 className="pr-card-name">{record.name}</h3>
                <div className="pr-card-weight">
                  <span className="weight-value">{record.weight}</span>
                  <span className="weight-unit">kg</span>
                </div>
                <div className="pr-card-details">
                  <span className="detail">{record.sets}x{record.reps}</span>
                  <span className="detail date">{record.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total Exercises</span>
            <span className="stat-value">{records.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Lifted</span>
            <span className="stat-value">
              {records.reduce((sum, r) => sum + r.weight, 0).toFixed(0)}kg
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average PR</span>
            <span className="stat-value">
              {(records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)}kg
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Heaviest Lift</span>
            <span className="stat-value">{Math.max(...records.map((r) => r.weight))}kg</span>
          </div>
        </div>
      )}
    </div>
  );
}
