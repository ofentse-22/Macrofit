const getLocalData = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

export default function DataExport() {
  const exportCsv = () => {
    const rows = getLocalData("workouts");
    const columns = ["name", "sets", "reps", "weight", "completedSets", "createdAt"];
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "fittrack-workouts.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return <section className="export-panel feature-panel"><p className="eyebrow">Data export</p><h2>Take your progress with you</h2><p>Download workout data as a spreadsheet-compatible CSV, or print this page and choose Save as PDF.</p><div><button className="primary-button" onClick={exportCsv}>Export for Excel</button><button className="secondary-button" onClick={() => window.print()}>Save as PDF</button></div></section>;
}
