export default function DataExport() {
  const exportWorkouts = async () => {
    const workouts = await workoutService.getWorkouts();

    const rows = [
      ["Name", "Category", "Sets", "Reps", "Weight (kg)", "Completed Sets", "Rest Time", "Date"]
    ];

    workouts.forEach(w => {
      rows.push([
        w.name,
        w.category,
        w.sets,
        w.reps,
        w.weight_kg ?? '',
        w.completed_sets ?? 0,
        w.rest_time_seconds ?? '',
        new Date(w.created_at).toLocaleDateString()
      ]);
    });

    const csv = rows.map(row => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = 'macrofit-workouts.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="export-panel feature-panel">
      <p className="eyebrow">Data Export</p>
      <h2>Take your progress with you</h2>
      <p>Download your complete workout history or print your progress.</p>
      
      <div className="export-buttons">
        <button className="primary-button" onClick={exportWorkouts} type="button">
          Export Workout History (CSV)
        </button>
        <button className="primary-button" onClick={() => window.print()} type="button">
          Print / Save as PDF
        </button>
      </div>
    </section>
  );
}
import { workoutService } from '../services/supabaseService';
