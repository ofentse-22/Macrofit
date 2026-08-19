import { useState } from "react";
import { supabase } from "../supabaseClient";
import exerciseLibrary from "../data/exercises";
import { workoutService } from "../services/supabaseService";

const predefinedTemplates = [
  {
    id: 1,
    name: "Push Day",
    level: "Intermediate",
    focus: "Chest, Shoulders, Triceps",
    exercises: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Tricep Dips"]
  },
  {
    id: 2,
    name: "Pull Day",
    level: "Intermediate",
    focus: "Back, Biceps",
    exercises: ["Pull Ups", "Bent Over Rows", "Face Pulls", "Bicep Curls"]
  },
  {
    id: 3,
    name: "Leg Day",
    level: "Intermediate",
    focus: "Quads, Hamstrings, Glutes",
    exercises: ["Squats", "Romanian Deadlift", "Leg Press", "Calf Raises"]
  }
];

export default function WorkoutTemplates() {
  const [customName, setCustomName] = useState("");
  const [customExercises, setCustomExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  const loadTemplate = async (template) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first to load templates");
      return;
    }

    const newExercises = template.exercises.map(name => {
      const ex = exerciseLibrary.find(e => e.name === name);
      return {
        user_id: user.id,
        name: name,
        category: ex ? ex.category : "",
        sets: 4,
        reps: 8,
        weight_kg: null,
        rest_time_seconds: 60,
        completed_sets: 0
      };
    });

    const { error } = await supabase
      .from('workouts')
      .insert(newExercises);

    if (error) {
      alert("Error loading template: " + error.message);
    } else {
      alert(`Template "${template.name}" loaded successfully!`);
      window.location.reload(); // Refresh WorkoutTracker
    }
  };

  const addCustomExercise = () => {
    if (selectedExercise && !customExercises.includes(selectedExercise)) {
      setCustomExercises((current) => [...current, selectedExercise]);
      setSelectedExercise("");
    }
  };

  const createCustomTemplate = async () => {
    if (!customName || customExercises.length === 0) {
      alert("Please enter template name and select exercises");
      return;
    }

    try {
      await workoutService.saveTemplate({ name: customName.trim(), exercises: customExercises.map((name) => ({ name, sets: 3, reps: 10 })), description: "Custom workout template", is_public: false });
      alert(`Template "${customName}" saved to your account.`);
      setCustomName("");
      setCustomExercises([]);
    } catch (error) { alert(error.message || "Unable to save template. Please log in and try again."); }
  };

  return (
    <div className="templates-container">
      <h2>Workout Templates</h2>
      <p className="templates-subtitle">Choose a template to load into your workout</p>

      <div className="templates-grid">
        {predefinedTemplates.map(template => (
          <div key={template.id} className="template-card">
            <h3>{template.name}</h3>
            <p className="level">{template.level}</p>
            <p className="focus">{template.focus}</p>
            <div className="template-exercises">
              {template.exercises.map((ex, i) => (
                <div key={i} className="template-exercise">{ex}</div>
              ))}
            </div>
            <button className="btn-load" onClick={() => loadTemplate(template)}>
              Load Template
            </button>
          </div>
        ))}
      </div>

      
      <div className="custom-template">
        <h3>Create Custom Template</h3>
        <input
          type="text"
          placeholder="Template Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
          <option value="">Choose an exercise</option>
          {exerciseLibrary.map((exercise) => <option key={exercise.name} value={exercise.name}>{exercise.name}</option>)}
        </select>
        <button type="button" onClick={addCustomExercise} className="btn-create">Add Exercise</button>
        {customExercises.length > 0 && <div className="template-exercises">{customExercises.map((name) => <button type="button" key={name} className="template-exercise" onClick={() => setCustomExercises((current) => current.filter((exercise) => exercise !== name))}>{name} ×</button>)}</div>}
        <button onClick={createCustomTemplate} className="btn-create">
          Create Template
        </button>
      </div>
    </div>
  );
}
