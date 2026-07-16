export default function ExerciseCard({ exercise }) {
  return (
    <div className="exercise-card">
      <h3>{exercise.name}</h3>
      <p><strong>Category:</strong> {exercise.category}</p>
      <p>{exercise.instructions}</p>

      {exercise.image && (
        <img
          src={exercise.image}
          alt={exercise.name}
          className="exercise-image"
        />
      )}
    </div>
  );
}