const getLocalData = (key) => {
  try { 
    return JSON.parse(localStorage.getItem(key) || "[]"); 
  } catch { 
    return []; 
  }
};

export default function DataExport() {
  const exportWorkouts = () => {
    const workouts = getLocalData("workouts");
    const user = JSON.parse(localStorage.getItem("fitTrackUser") || "{}");

    const rows = [
      ["Name", "Category", "Sets", "Reps", "Weight (kg)", "Completed Sets", "Rest Time", "Date"]
    ];

    workouts.forEach(w => {
      rows.push([
        w.name,
        w.category,
        w.sets,
        w.reps,
        w.weight,
        w.completedSets,
        w.restTime,
        new Date(w.createdAt).toLocaleDateString()
      ]);
    });

    const csv = rows.map(row => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `fittrack-workout-${user.fullName || 'user'}.csv`;
    link.click();
  };

  return (
    <section className="export-panel feature-panel">
      <p className="eyebrow">Data Export</p>
      <h2>Take your progress with you</h2>
      <p>Download your complete workout history or print your progress.</p>
      
      <div className="export-buttons">
        <button className="primary-button" onClick={exportWorkouts}>
          Export Workout History (CSV)
        </button>
        <button className="secondary-button" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
    </section>
  );
}