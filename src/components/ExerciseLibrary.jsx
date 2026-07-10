// src/components/ExerciseLibrary.jsx
export default function ExerciseLibrary() {
  const exercises = [
    { 
      name: "Bench Press", 
      category: "Chest", 
      image: "/exercises/bench-press.jpg",
      instructions: "Lie on bench, grip bar shoulder-width, lower to chest"
    },
    // ... more exercises
  ];

  return (
    <div className="exercise-library">
      <h2>🏋️ Exercise Library</h2>
      <div className="exercise-grid">
        {exercises.map(exercise => (
          <ExerciseCard key={exercise.name} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}