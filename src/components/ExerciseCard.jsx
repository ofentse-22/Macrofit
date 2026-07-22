export default function ExerciseCard({ exercise, isFavorite, onToggleFavorite }) {
  return (
    <div className="exercise-card">
      <div className="exercise-card-head">
        <h3>{exercise.name}</h3>
        <button
          className={`favorite-toggle ${isFavorite ? "active" : ""}`}
          onClick={() => onToggleFavorite(exercise.name)}
          type="button"
        >
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>
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