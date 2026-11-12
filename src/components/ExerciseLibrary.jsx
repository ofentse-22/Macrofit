import { useEffect, useMemo, useState } from "react";
import ExerciseCard from "./ExerciseCard";
import "./ExerciseLibrary.css";
import exercises from "../data/exercises";
import { getRemoteExercises, mergeExerciseCatalog } from "../services/exerciseCatalogService";

const categories = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
  "Other",
];

export default function ExerciseLibrary() {
  const [catalogExercises, setCatalogExercises] = useState(exercises);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("favoriteExercises") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    getRemoteExercises()
      .then((remoteExercises) => {
        if (!active) return;
        setCatalogExercises(mergeExerciseCatalog(exercises, remoteExercises));
        setIsLoadingCatalog(false);
      })
      .catch((error) => {
        console.error("Unable to load online exercise catalog:", error);
        if (!active) return;
        setCatalogError("The online exercise catalog is unavailable. Showing the offline exercises.");
        setIsLoadingCatalog(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteExercises", JSON.stringify(favorites));
    }
  }, [favorites]);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return catalogExercises.filter((exercise) => {
      const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        exercise.category.toLowerCase().includes(normalizedQuery) ||
        exercise.instructions?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [catalogExercises, searchTerm, selectedCategory]);

  const favoriteExercises = useMemo(() => {
    return catalogExercises.filter((exercise) => favorites.includes(exercise.name));
  }, [catalogExercises, favorites]);
  const visibleExercises = filteredExercises.slice(0, visibleCount);

  const toggleFavorite = (exerciseName) => {
    setFavorites((current) =>
      current.includes(exerciseName)
        ? current.filter((name) => name !== exerciseName)
        : [...current, exerciseName]
    );
  };

  return (
    <div className="exercise-library">
      <h2>Exercise Library</h2>

      <div className="library-toolbar">
        <label className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(60); }}
            placeholder="Search exercises or muscle groups"
            aria-label="Search exercises or muscle groups"
          />
        </label>

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => { setSelectedCategory(category); setVisibleCount(60); }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <p className="catalog-status" aria-live="polite">
        {isLoadingCatalog
          ? `Loading the online catalog. Showing ${catalogExercises.length} offline exercises so far.`
          : `${filteredExercises.length} unique exercises`}
      </p>
      {catalogError && <p className="catalog-error" role="status">{catalogError}</p>}
      {!isLoadingCatalog && (
        <p className="catalog-attribution">
          Online exercises from <a href="https://wger.de/" target="_blank" rel="noreferrer">wger</a>.
          Entries retain their source attribution and license; see each exercise for details.
        </p>
      )}

      {favoriteExercises.length > 0 && (
        <section className="favorites-section">
          <div className="favorites-header">
            <h3>Favorites</h3>
            <span>{favoriteExercises.length} saved</span>
          </div>
          <div className="favorites-list">
            {favoriteExercises.map((exercise) => (
              <button key={exercise.name} className="favorite-chip" onClick={() => toggleFavorite(exercise.name)}>
                {exercise.name} · Saved
              </button>
            ))}
          </div>
        </section>
      )}

      {filteredExercises.length === 0 && !isLoadingCatalog ? (
        <p className="empty-state">No exercises match your search yet.</p>
      ) : (
        <div className="exercise-grid">
          {visibleExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              isFavorite={favorites.includes(exercise.name)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
      {visibleCount < filteredExercises.length && (
        <button className="load-more-exercises" type="button" onClick={() => setVisibleCount((count) => count + 60)}>
          Show more exercises ({filteredExercises.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}