import { useEffect, useMemo, useState } from "react";
import "./WorkoutTracker.css";
import exerciseLibrary from "../data/exercises";
import RestTimer from "./RestTimer";
import { supabase } from '../supabaseClient';

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState([]);
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [editingId, setEditingId] = useState(null);

  
  useEffect(() => {
    const loadExercises = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error("Error loading workouts:", error);
      else setExercises(data || []);
    };

    loadExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return exerciseLibrary.filter((ex) => {
      const matchesCategory = !category || ex.category === category;
      const matchesSearch = normalizedQuery.length === 0 || 
        ex.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [category, searchTerm]);

  const clearForm = () => {
    setCategory("");
    setSearchTerm("");
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
    setRestTime("60");
  };

  const addExercise = async () => {
    if (!exerciseName || !sets || !reps) {
      alert("Please select Category, Exercise, and fill Sets & Reps");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first");
      return;
    }

    const selected = exerciseLibrary.find(ex => ex.name === exerciseName);

    const newExercise = {
      user_id: user.id,
      name: exerciseName,
      category,
      image_url: selected?.image || null,
      instructions: selected?.instructions || null,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight_kg: weight ? parseFloat(weight) : null,
      rest_time_seconds: parseInt(restTime),
      completed_sets: 0
    };

    const { data, error } = await supabase
      .from("workouts")
      .insert([newExercise])
      .select();

    console.log("Inserted:", data);
    console.log("Error:", error);

    if (error) {
      alert("Error saving exercise: " + error.message);
    } else {
      alert("Exercise added successfully!");
      setExercises(prev => [...data, ...prev]);
      clearForm();
    }
  };

  const updateExercise = async () => {
    if (!exerciseName || !sets || !reps) return;

    const { error } = await supabase
      .from('workouts')
      .update({
        name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight_kg: weight ? parseFloat(weight) : null,
        rest_time_seconds: parseInt(restTime)
      })
      .eq('id', editingId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) alert("Error updating: " + error.message);
    else {
      alert("Exercise updated!");
      setExercises(exercises.map(ex => 
        ex.id === editingId 
          ? { ...ex, name: exerciseName, sets: parseInt(sets), reps: parseInt(reps), weight_kg: weight ? parseFloat(weight) : null, rest_time_seconds: parseInt(restTime) }
          : ex
      ));
      setEditingId(null);
      clearForm();
    }
  };

  const deleteExercise = async (id) => {
    if (!window.confirm("Delete this exercise?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('workouts').delete().eq('id', id).eq('user_id', user?.id);
    if (error) alert("Error deleting: " + error.message);
    else {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const editExercise = (exercise) => {
    setEditingId(exercise.id);
    setExerciseName(exercise.name);
    setSets(exercise.sets.toString());
    setReps(exercise.reps.toString());
    setWeight(exercise.weight_kg?.toString() || "");
    setRestTime(exercise.rest_time_seconds?.toString() || "60");
    setCategory(exercise.category);
  };

  const completeSet = async (id) => {
    const exercise = exercises.find(ex => ex.id === id);
    if (!exercise) return;

    const { error } = await supabase
      .from('workouts')
      .update({ completed_sets: exercise.completed_sets + 1 })
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) console.error(error);
    else {
      setExercises(exercises.map(ex => 
        ex.id === id 
          ? { ...ex, completed_sets: ex.completed_sets + 1 }
          : ex
      ));
    }
  };

  const resetExercise = async (id) => {
    const { error } = await supabase
      .from('workouts')
      .update({ completed_sets: 0 })
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) console.error(error);
    else {
      setExercises(exercises.map(ex => 
        ex.id === id 
          ? { ...ex, completed_sets: 0 }
          : ex
      ));
    }
  };

  const getProgress = (exercise) => {
    return exercise.sets > 0 ? (exercise.completed_sets / exercise.sets) * 100 : 0;
  };

  const clearAllExercises = async () => {
    if (!window.confirm("Clear entire workout?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('workouts').delete().eq('user_id', user.id);
    setExercises([]);
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
              <select value={category} onChange={(e) => { setCategory(e.target.value); setExerciseName(""); setSearchTerm(""); }}>
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
              <label>Search exercises</label>
              <input 
                type="text" 
                placeholder="Search by name" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                disabled={!category} 
              />
            </div>

            <div className="input-wrapper">
              <label>Exercise</label>
              <select value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} disabled={!category}>
                <option value="">Select Exercise</option>
                {filteredExercises.map((ex) => (
                  <option key={ex.name} value={ex.name}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div className="input-wrapper">
              <label>Sets</label>
              <input type="number" placeholder="Number of sets" value={sets} onChange={(e) => setSets(e.target.value)} min="1" />
            </div>

            <div className="input-wrapper">
              <label>Reps per Set</label>
              <input type="number" placeholder="Reps per set" value={reps} onChange={(e) => setReps(e.target.value)} min="1" />
            </div>

            <div className="input-wrapper">
              <label>Weight (kg)</label>
              <input type="number" placeholder="Weight in kg" value={weight} onChange={(e) => setWeight(e.target.value)} min="0" step="0.5" />
            </div>

            <div className="input-wrapper">
              <label>Rest Time (seconds)</label>
              <input type="number" placeholder="Rest between sets" value={restTime} onChange={(e) => setRestTime(e.target.value)} min="10" step="5" />
            </div>
          </div>

          <div className="form-actions">
            {editingId ? (
              <>
                <button className="btn-update" onClick={updateExercise}>Update Exercise</button>
                <button className="btn-cancel" onClick={() => { setEditingId(null); clearForm(); }}>Cancel</button>
              </>
            ) : (
              <button className="btn-add" onClick={addExercise}>Add to Workout</button>
            )}
          </div>
        </div>

        <div className="exercises-list">
          <div className="workout-header">
            <h3>Your Current Workout ({exercises.length})</h3>
            {exercises.length > 0 && (
              <button className="btn-delete clear-all-btn" onClick={clearAllExercises}>
                Clear All
              </button>
            )}
          </div>

          {exercises.length === 0 ? (
            <p className="empty-message">No exercises added yet. Start building your workout!</p>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-header">
                  {exercise.image_url && (
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="workout-image"
                      onError={() => console.log("Image failed to load:", exercise.image_url)}
                    />
                  )}
                  <div className="exercise-info">
                    <h4>{exercise.name}</h4>
                    <div className="exercise-stats">
                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                      {exercise.weight_kg > 0 && <span>{exercise.weight_kg} kg</span>}
                      <span className="rest-badge">Rest: {exercise.rest_time_seconds}s</span>
                    </div>
                  </div>

                  <div className="exercise-actions">
                    <button className="btn-edit" onClick={() => editExercise(exercise)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteExercise(exercise.id)}>Delete</button>
                  </div>
                </div>

                <div className="exercise-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${getProgress(exercise)}%` }} />
                  </div>
                  <span className="progress-text">
                    {exercise.completed_sets} / {exercise.sets} sets completed
                  </span>
                </div>

                {exercise.completed_sets > 0 && exercise.completed_sets < exercise.sets && (
                  <RestTimer restTime={exercise.rest_time_seconds} isActive={true} onComplete={() => {}} />
                )}

                <div className="exercise-controls">
                  <button className="btn-complete" onClick={() => completeSet(exercise.id)} disabled={exercise.completed_sets >= exercise.sets}>
                    Complete Set
                  </button>
                  <button className="btn-reset" onClick={() => resetExercise(exercise.id)} disabled={exercise.completed_sets === 0}>
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
