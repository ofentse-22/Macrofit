import { useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        exercise.category.toLowerCase().includes(normalizedQuery) ||
        exercise.instructions?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="exercise-library">
      <h2>Exercise Library</h2>

      <div className="library-toolbar">
        <label className="search-bar">
          <span>🔎</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises or muscle groups"
          />
        </label>

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <p className="empty-state">No exercises match your search yet.</p>
      ) : (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.name} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}