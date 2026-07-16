import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import "./ExerciseLibrary.css";
import exercises from "../data/exercises";

const categories = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
];

export default function ExerciseLibrary() {

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredExercises =
    selectedCategory === "All"
      ? exercises
      : exercises.filter(
          (exercise) =>
            exercise.category === selectedCategory
        );

  return (
    <div className="exercise-library">

      <h2>Exercise Library</h2>

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      <div className="exercise-grid">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
          />
        ))}
      </div>

    </div>
  );
}