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

export default function WorkoutTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadedTemplates, setLoadedTemplates] = useState([]);

  const loadTemplate = (template) => {
    const currentWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");

    const newExercises = template.exercises.map(name => {
      const exerciseData = exerciseLibrary.find(ex => ex.name === name);
      
      return {
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now(),
        name: name,
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
    setLoadedTemplates(prev => [...prev, template.id]);
  };

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

      <div className="template-grid">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className={`template-card ${loadedTemplates.includes(template.id) ? "loaded" : ""}`}
          >
            <div className="template-level">{template.level}</div>
            
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