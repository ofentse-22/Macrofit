import { useState } from "react";
import WorkoutTracker from "./WorkoutTracker";
import WorkoutGenerator from "./WorkoutGenerator";
import WorkoutTemplates from "./WorkoutTemplates";
import ExerciseLibrary from "./ExerciseLibrary";
import WorkoutHistory from "./WorkoutHistory";
import WorkoutCalendar from "./WorkoutCalendar";

const sections = [
  ["workout", "Active workout"],
  ["plans", "Plans"],
  ["library", "Exercise library"],
  ["history", "History"],
];

export default function TrainingWorkspace() {
  const [section, setSection] = useState("workout");

  return (
    <section className="workspace-page" aria-labelledby="training-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Training</p>
          <h2 id="training-heading">Build your next session</h2>
          <p>Log sets first. Keep planning and history one tap away.</p>
        </div>
        <span className="workspace-status">Active plan</span>
      </div>
      <nav className="workspace-tabs" aria-label="Training sections">
        {sections.map(([id, label]) => (
          <button key={id} type="button" className={section === id ? "active" : ""} onClick={() => setSection(id)} aria-pressed={section === id}>
            {label}
          </button>
        ))}
      </nav>
      <div className="workspace-content">
        {section === "workout" && <WorkoutTracker />}
        {section === "plans" && <div className="workspace-stack"><WorkoutGenerator /><WorkoutTemplates /></div>}
        {section === "library" && <ExerciseLibrary />}
        {section === "history" && <div className="workspace-stack"><WorkoutHistory /><WorkoutCalendar /></div>}
      </div>
    </section>
  );
}
