import { useState } from "react";

const templates = [
  { name: "Full body strength", level: "Intermediate", schedule: "3 days per week", exercises: "Squat, bench press, row" },
  { name: "Upper body focus", level: "Beginner", schedule: "2 days per week", exercises: "Press, pulldown, curls" },
  { name: "Lower body power", level: "Advanced", schedule: "2 days per week", exercises: "Deadlift, lunge, calf raise" },
];

export default function WorkoutTemplates() {
  const [selected, setSelected] = useState("");
  return <section className="feature-panel"><div className="section-heading"><div><p className="eyebrow">Workout templates</p><h2>Start with a structured plan</h2></div></div><div className="template-grid">{templates.map((template) => <article className={`template-card ${selected === template.name ? "selected" : ""}`} key={template.name}><span>{template.level}</span><h3>{template.name}</h3><p>{template.schedule}</p><small>{template.exercises}</small><button onClick={() => setSelected(template.name)}>{selected === template.name ? "Selected" : "Use template"}</button></article>)}</div></section>;
}
