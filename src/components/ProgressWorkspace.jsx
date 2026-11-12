import { useState } from "react";
import Analytics from "./Analytics";
import ProgressiveOverload from "./ProgressiveOverload";
import PersonalRecords from "./PersonalRecords";
import Gamification from "./Gamification";
import WeightTracker from "./WeightTracker";
import BodyComposition from "./BodyComposition";

const sections = [
  ["overview", "Overview & insights"],
  ["strength", "Strength"],
  ["body", "Body"],
  ["achievements", "Achievements"],
];

export default function ProgressWorkspace({ onNavigate, autoOpenWeight = false }) {
  const [section, setSection] = useState(() => autoOpenWeight ? "body" : "overview");
  const [openWeightForm, setOpenWeightForm] = useState(autoOpenWeight);

  return (
    <section className="workspace-page" aria-labelledby="progress-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Progress</p>
          <h2 id="progress-heading">See the work add up</h2>
          <p>Trends, strength, body metrics, and consistency in one place.</p>
        </div>
        <span className="workspace-status">Live data</span>
      </div>
      <nav className="workspace-tabs" aria-label="Progress sections">
        {sections.map(([id, label]) => (
          <button key={id} type="button" className={section === id ? "active" : ""} onClick={() => { setSection(id); if (id !== "body") setOpenWeightForm(false); }} aria-pressed={section === id}>
            {label}
          </button>
        ))}
      </nav>
      <div className="workspace-content">
        {section === "overview" && <Analytics onNavigate={onNavigate} />}
        {section === "strength" && <div className="workspace-stack"><ProgressiveOverload /><PersonalRecords /></div>}
        {section === "body" && <div className="workspace-stack"><WeightTracker autoOpen={openWeightForm} /><BodyComposition /></div>}
        {section === "achievements" && <Gamification />}
      </div>
    </section>
  );
}
