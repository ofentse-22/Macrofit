import { useState, useEffect } from "react";
import "./WorkoutTracker.css";

const loadSavedExercises = () => {
  const saved = localStorage.getItem("workouts");

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("workouts");
    return [];
  }
};

const createExerciseId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
};

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState(loadSavedExercises);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [editingId, setEditingId] = useState(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(exercises));
  }, [exercises]);

  const addExercise = () => {
    if (!exerciseName || !sets || !reps) return;

    const newExercise = {
      id: createExerciseId(),
      name: exerciseName,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : 0,
      restTime: parseInt(restTime),
      completedSets: 0,
      createdAt: new Date().toISOString()
    };

    setExercises([...exercises, newExercise]);
    clearForm();
  };

  const updateExercise = () => {
    if (!exerciseName || !sets || !reps) return;

    setExercises(exercises.map(ex => 
      ex.id === editingId ? {
        ...ex,
        name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        restTime: parseInt(restTime)
      } : ex
    ));
    clearForm();
    setEditingId(null);
  };

  const clearForm = () => {
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
    setRestTime("60");
  };

  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const editExercise = (exercise) => {
    setEditingId(exercise.id);
    setExerciseName(exercise.name);
    setSets(exercise.sets.toString());
    setReps(exercise.reps.toString());
    setWeight(exercise.weight.toString());
    setRestTime(exercise.restTime.toString());
  };

  const completeSet = (id) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id && ex.completedSets < ex.sets) {
        return { ...ex, completedSets: ex.completedSets + 1 };
      }
      return ex;
    }));
  };

  const resetExercise = (id) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completedSets: 0 } : ex
    ));
  };

  const getProgress = (exercise) => {
    return (exercise.completedSets / exercise.sets) * 100;
  };

  return (
    <div className="workout-container">
      <div className="workout-card">
        <h2>Workout Tracker</h2>

        <div className="exercise-form">
          <h3>{editingId ? "Edit Exercise" : "Add Exercise"}</h3>
          
          <div className="form-grid">
            <div className="input-wrapper">
              <label>Exercise Name</label>
              <input
                type="text"
                placeholder="e.g., Bench Press"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
            </div>

            <div className="input-wrapper">
              <label>Sets</label>
              <input
                type="number"
                placeholder="Number of sets"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min="1"
              />
            </div>

            <div className="input-wrapper">
              <label>Reps per Set</label>
              <input
                type="number"
                placeholder="Reps per set"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
              />
            </div>

            <div className="input-wrapper">
              <label>Weight (kg)</label>
              <input
                type="number"
                placeholder="Weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>

            <div className="input-wrapper">
              <label>Rest Time (seconds)</label>
              <input
                type="number"
                placeholder="Rest between sets"
                value={restTime}
                onChange={(e) => setRestTime(e.target.value)}
                min="10"
                step="5"
              />
            </div>
          </div>

          <div className="form-actions">
            {editingId ? (
              <>
                <button className="btn-update" onClick={updateExercise}>
                  Update Exercise
                </button>
                <button className="btn-cancel" onClick={() => {
                  clearForm();
                  setEditingId(null);
                }}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn-add" onClick={addExercise}>
                Add Exercise
              </button>
            )}
          </div>
        </div>

        <div className="exercises-list">
          <h3>Your Workout</h3>
          {exercises.length === 0 ? (
            <p className="empty-message">No exercises added yet. Start tracking your workout!</p>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-header">
                  <div className="exercise-info">
                    <h4>{exercise.name}</h4>
                    <div className="exercise-stats">
                      <span>{exercise.sets} sets x {exercise.reps} reps</span>
                      {exercise.weight > 0 && <span>{exercise.weight} kg</span>}
                      <span className="rest-badge">Rest: {exercise.restTime}s</span>
                    </div>
                  </div>
                  <div className="exercise-actions">
                    <button className="btn-edit" onClick={() => editExercise(exercise)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => deleteExercise(exercise.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="exercise-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgress(exercise)}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {exercise.completedSets} / {exercise.sets} sets completed
                  </span>
                </div>

                <div className="exercise-controls">
                  <button 
                    className="btn-complete"
                    onClick={() => completeSet(exercise.id)}
                    disabled={exercise.completedSets >= exercise.sets}
                  >
                    Complete Set
                  </button>
                  <button 
                    className="btn-reset"
                    onClick={() => resetExercise(exercise.id)}
                    disabled={exercise.completedSets === 0}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
