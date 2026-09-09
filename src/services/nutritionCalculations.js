export function calculateExerciseCalories(workouts, date = new Date().toISOString().slice(0, 10)) {
  // Simple estimate: each completed set contributes roughly 10 kcal.
  return (Array.isArray(workouts) ? workouts : [])
    .filter((workout) => (workout.last_completed_at || workout.created_at || workout.createdAt || "").slice(0, 10) === date)
    .reduce((total, workout) => total + Math.max(0, Number(workout.completed_sets) || 0) * 10, 0);
}

export function calculateCaloriesRemaining(baseGoal, foodCalories, exerciseCalories) {
  return Math.max(0, (Number(baseGoal) || 0) - (Number(foodCalories) || 0) + (Number(exerciseCalories) || 0));
}