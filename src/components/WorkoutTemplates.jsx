import { useState } from "react";
import exerciseLibrary from "../data/exercises";

const templates = [
  {
    id: 1,
    name: "Full Body Strength",
    level: "Intermediate",
    schedule: "3 days per week",
    focus: "Overall strength & muscle building",
    exercises: [
      "Goblet Squat", "Incline Dumbbell Bench Press", "Bent Over Row",
      "Dumbbell Curl", "Overhead Tricep Extension", "Plank"
    ]
  },
  {
    id: 2,
    name: "Upper Body Push/Pull",
    level: "Beginner",
    schedule: "3 days per week",
    focus: "Chest, Back & Shoulders",
    exercises: [
      "Incline Barbell Bench Press", "Chest Fly", "Arnold Press",
      "Lateral Raise", "Reverse Fly", "Hammer Curl", "Tricep Dip"
    ]
  },
  {
    id: 3,
    name: "Lower Body Power",
    level: "Advanced",
    schedule: "2-3 days per week",
    focus: "Legs & Glutes",
    exercises: [
      "Bulgarian Split Squat", "Barbell Romanian Deadlift", "Leg Press",
      "Lunge", "Calf Raise", "Goblet Squat", "Dumbbell Step-Up"
    ]
  },
  {
    id: 4,
    name: "Fat Loss HIIT Circuit",
    level: "All Levels",
    schedule: "4 days per week",
    focus: "Burn fat & improve cardio",
    exercises: [
      "Kettlebell Swing", "Jumping Jack", "Burpee", "Mountain Climber",
      "Bicycle Crunch", "Russian Twist", "Leg Raise"
    ]
  },
  {
    id: 5,
    name: "Push Pull Legs (PPL)",
    level: "Intermediate",
    schedule: "6 days per week",
    focus: "Classic bodybuilding split",
    exercises: [
      "Incline Dumbbell Bench Press", "Decline Barbell Bench Press", "Chest Fly",
      "Lateral Raise", "Front Raise", "Reverse Fly", "Leg Press", "Bulgarian Split Squat"
    ]
  },
  {
    id: 6,
    name: "Core & Abs Focus",
    level: "All Levels",
    schedule: "3 days per week",
    focus: "Build a strong core",
    exercises: [
      "Plank", "Side Plank", "Russian Twist", "Bicycle Crunch",
      "Leg Raise", "Mountain Climber"
    ]
  },
  {
    id: 7,
    name: "Arms & Shoulders",
    level: "Intermediate",
    schedule: "2 days per week",
    focus: "Bigger arms and capped shoulders",
    exercises: [
      "Dumbbell Curl", "Hammer Curl", "Cross-Body Hammer Curl",
      "Overhead Tricep Extension", "Tricep Dip", "Arnold Press",
      "Lateral Raise", "Front Raise"
    ]
  }
];

const getStoredCustomTemplates = () => {
  try {
    return JSON.parse(localStorage.getItem("customTemplates") || "[]");
  } catch {
    return [];
  }
};

const createExerciseId = () => {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now();
};

export default function WorkoutTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadedTemplates, setLoadedTemplates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState(getStoredCustomTemplates);
  const [form, setForm] = useState({
    name: "",
    level: "Intermediate",
    schedule: "",
    focus: "",
    exercises: []
  });

  const loadTemplate = (template) => {
    const currentWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");

    const newExercises = template.exercises.map((name) => {
      const exerciseData = exerciseLibrary.find((ex) => ex.name === name);

      return {
        id: createExerciseId(),
        name,
        image: exerciseData?.image || "",
        instructions: exerciseData?.instructions || "",
        category: exerciseData?.category || "",
        sets: 4,
        reps: name.toLowerCase().includes("plank") || name.toLowerCase().includes("raise") ? 12 : 10,
        weight: 0,
        restTime: 60,
        completedSets: 0,
        createdAt: new Date().toISOString()
      };
    });

    const updatedWorkouts = [...currentWorkouts, ...newExercises];
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));

    alert(`✅ Template "${template.name}" loaded!\n\n${newExercises.length} exercises added to your workout.`);

    setSelectedTemplate(template);
    setLoadedTemplates((prev) => [...prev, template.id]);
  };

  const handleExerciseToggle = (name) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.includes(name)
        ? prev.exercises.filter((exercise) => exercise !== name)
        : [...prev.exercises, name]
    }));
  };

  const saveCustomTemplate = (event) => {
    event.preventDefault();

    if (!form.name.trim() || form.exercises.length === 0) {
      alert("Please give your template a name and select at least one exercise.");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: form.name.trim(),
      level: form.level || "Custom",
      schedule: form.schedule.trim() || "Your own schedule",
      focus: form.focus.trim() || "Personalized training plan",
      exercises: form.exercises,
      isCustom: true
    };

    const updatedTemplates = [newTemplate, ...customTemplates];
    setCustomTemplates(updatedTemplates);
    localStorage.setItem("customTemplates", JSON.stringify(updatedTemplates));

    setForm({
      name: "",
      level: "Intermediate",
      schedule: "",
      focus: "",
      exercises: []
    });

    alert(`✅ Custom template "${newTemplate.name}" saved!`);
  };

  const allTemplates = [...customTemplates, ...templates];

  return (
    <section className="feature-panel templates-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Workout templates</p>
          <h2>Start with a proven plan</h2>
        </div>
      </div>

      <p className="templates-intro">
        Choose a template to instantly add recommended exercises to your current workout.
      </p>

      <form className="custom-template-form" onSubmit={saveCustomTemplate}>
        <div className="custom-template-header">
          <h3>Create a custom template</h3>
          <p>Build your own plan and load it directly into your workout page.</p>
        </div>

        <div className="custom-template-fields">
          <label>
            <span>Template name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. Upper Body Burn"
            />
          </label>

          <label>
            <span>Level</span>
            <input
              value={form.level}
              onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
              placeholder="Beginner / Intermediate"
            />
          </label>

          <label>
            <span>Schedule</span>
            <input
              value={form.schedule}
              onChange={(event) => setForm((prev) => ({ ...prev, schedule: event.target.value }))}
              placeholder="3 days per week"
            />
          </label>

          <label>
            <span>Focus</span>
            <input
              value={form.focus}
              onChange={(event) => setForm((prev) => ({ ...prev, focus: event.target.value }))}
              placeholder="Chest, core and endurance"
            />
          </label>
        </div>

        <div className="custom-template-exercises">
          <span>Select exercises</span>
          <div className="exercise-chip-list">
            {exerciseLibrary.map((exercise) => (
              <button
                key={exercise.name}
                type="button"
                className={`exercise-chip ${form.exercises.includes(exercise.name) ? "active" : ""}`}
                onClick={() => handleExerciseToggle(exercise.name)}
              >
                {exercise.name}
              </button>
            ))}
          </div>
        </div>

        <button className="primary-button" type="submit">Save Custom Template</button>
      </form>

      <div className="template-grid">
        {allTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${loadedTemplates.includes(template.id) ? "loaded" : ""}`}
          >
            <div className="template-level">{template.isCustom ? "Custom" : template.level}</div>

            <h3>{template.name}</h3>
            <p className="schedule">{template.schedule}</p>
            <p className="focus">{template.focus}</p>

            <div className="template-exercises">
              <strong>Key Exercises:</strong>
              <ul>
                {template.exercises.slice(0, 6).map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
                {template.exercises.length > 6 && (
                  <li>+{template.exercises.length - 6} more</li>
                )}
              </ul>
            </div>

            <button
              className="primary-button"
              onClick={() => loadTemplate(template)}
              disabled={loadedTemplates.includes(template.id)}
            >
              {loadedTemplates.includes(template.id) ? "✓ Already Loaded" : "Use This Template"}
            </button>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="template-success">
          <p>
            <strong>{selectedTemplate.name}</strong> has been added to your workout!
            Go to the <strong>Workout</strong> tab to begin training.
          </p>
        </div>
      )}

      <div className="template-tip">
        💡 <strong>Tip:</strong> You can mix multiple templates or edit exercises after loading.
      </div>
    </section>
  );
}