import { useState, useEffect, useMemo } from "react";
import "./WorkoutTracker.css";
import exerciseLibrary from "../data/exercises";
import RestTimer from "./RestTimer";

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
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now();
};

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState(loadSavedExercises);
  const [category, setCategory] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(exercises));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    if (!category) return [];
    return exerciseLibrary.filter((ex) => ex.category === category);
  }, [category]);

  const addExercise = () => {
    if (!exerciseName || !sets || !reps) return;

    const selectedExercise = exerciseLibrary.find((ex) => ex.name === exerciseName);

    const newExercise = {
      id: createExerciseId(),
      name: exerciseName,
      image: selectedExercise?.image || "",
      instructions: selectedExercise?.instructions || "",
      category: selectedExercise?.category || "",

      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : 0,
      restTime: parseInt(restTime),

      completedSets: 0,
      createdAt: new Date().toISOString(),
    };

    setExercises((prev) => [...prev, newExercise]);
    clearForm();
  };

  const updateExercise = () => {
    if (!exerciseName || !sets || !reps) return;

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === editingId
          ? {
              ...ex,
              name: exerciseName,
              sets: parseInt(sets),
              reps: parseInt(reps),
              weight: weight ? parseFloat(weight) : 0,
              restTime: parseInt(restTime),
            }
          : ex
      )
    );

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
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const editExercise = (exercise) => {
    setEditingId(exercise.id);
    setExerciseName(exercise.name);
    setSets(exercise.sets.toString());
    setReps(exercise.reps.toString());
    setWeight(exercise.weight.toString());
    setRestTime(exercise.restTime.toString());
    setCategory(exercise.category);
  };

  const completeSet = (id) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id && ex.completedSets < ex.sets
          ? { ...ex, completedSets: ex.completedSets + 1 }
          : ex
      )
    );
  };

  const resetExercise = (id) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, completedSets: 0 } : ex
      )
    );
  };

  const getProgress = (exercise) => {
    return exercise.sets > 0 ? (exercise.completedSets / exercise.sets) * 100 : 0;
  };

  return (
    <div className="workout-container">
      <div className="workout-card">
        <h2>Workout Tracker</h2>

        <div className="exercise-form">
          <h3>{editingId ? "Edit Exercise" : "Add Exercise"}</h3>

          <div className="form-grid">
            <div className="input-wrapper">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setExerciseName("");
                }}
              >
                <option value="">Select Category</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Core">Core</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>

            <div className="input-wrapper">
              <label>Exercise</label>
              <select
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                disabled={!category}
              >
                <option value="">Select Exercise</option>
                {filteredExercises.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
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
                <button
                  className="btn-cancel"
                  onClick={() => {
                    clearForm();
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn-add" onClick={addExercise}>
                Add to Workout
              </button>
            )}
            <button 
  className="btn-delete"
  onClick={() => {
    if (window.confirm("Clear entire workout?")) {
      localStorage.removeItem("workouts");
      window.location.reload();
    }
  }}
>
  Clear All Exercises
</button>
          </div>
        </div>

        <div className="exercises-list">
          <h3>Your Current Workout</h3>

          {exercises.length === 0 ? (
            <p className="empty-message">
              No exercises added yet. Start building your workout!
            </p>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-header">
                  {exercise.image && (
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="workout-image"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}

                  <div className="exercise-info">
                    <h4>{exercise.name}</h4>
                    <div className="exercise-stats">
                      <span>
                        {exercise.sets} sets × {exercise.reps} reps
                      </span>
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

                {exercise.completedSets > 0 && exercise.completedSets < exercise.sets && (
                  <RestTimer
                    restTime={exercise.restTime}
                    isActive={true}
                    onComplete={() => {}}
                  />
                )}

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
                    Reset Progress
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
