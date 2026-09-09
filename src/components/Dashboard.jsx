import { useEffect, useRef, useState } from "react";
import { bodyCompositionService, goalsService, nutritionService, userService, weightService, workoutService } from "../services/supabaseService";
import { calculateCaloriesRemaining, calculateExerciseCalories } from "../services/nutritionCalculations";

function calculateStreak(workouts) {
  if (!Array.isArray(workouts) || workouts.length === 0) return 0;

  const uniqueDates = [...new Set(workouts
    .filter((workout) => workout?.createdAt || workout?.created_at)
    .map((workout) => {
      const date = new Date(workout.createdAt || workout.created_at);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split("T")[0];
    }))];

  if (uniqueDates.length === 0) return 0;

  const sortedDates = uniqueDates
    .map((dateStr) => new Date(`${dateStr}T00:00:00`))
    .sort((a, b) => b - a);

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const workoutDate of sortedDates) {
    const diffDays = Math.round((expectedDate - workoutDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak += 1;
      expectedDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}

export default function Dashboard({ onNavigate }) {
  const [workouts, setWorkouts] = useState([]);
  const [bodyCompositionHistory, setBodyCompositionHistory] = useState([]);
  const [nutritionLog, setNutritionLog] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [nutritionGoals, setNutritionGoals] = useState({});
  const [showFirstRun, setShowFirstRun] = useState(false);
  const [firstRunForm, setFirstRunForm] = useState({ calories: "2500", weight: "" });
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceTime] = useState(() => Date.now());
  const [goals, setGoals] = useState({ weight: "", strength: "" });
  const [goalForm, setGoalForm] = useState({ weight: "", strength: "" });
  const [reminders, setReminders] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("fitReminders") || "[]");
    } catch {
      return [];
    }
  });
  const [reminderForm, setReminderForm] = useState({ title: "", minutes: "30" });
  const reminderTimers = useRef([]);

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    Promise.all([
      workoutService.getWorkouts(),
      bodyCompositionService.getLogsForRange(startDate.toISOString().slice(0, 10), today),
      weightService.getLogsForRange(startDate.toISOString().slice(0, 10), today),
      nutritionService.getLogsForDate(today),
      nutritionService.getGoals(),
      goalsService.getGoal(),
      userService.getProfile(),
    ]).then(([savedWorkouts, bodyLogs, weightLogs, meals, savedNutritionGoals, savedGoal, savedProfile]) => {
      if (!active) return;
      setWorkouts(savedWorkouts);
      setBodyCompositionHistory(bodyLogs);
      setWeightHistory(weightLogs);
      setNutritionLog(meals);
      setNutritionGoals(savedNutritionGoals || {});
      setShowFirstRun(Boolean(savedNutritionGoals?.is_default && !savedWorkouts.length && !meals.length));
      setProfile(savedProfile);
      setGoals({ weight: savedGoal?.target_weight_kg ?? "", strength: savedGoal?.target_strength_kg ?? "" });
      setIsLoading(false);
    }).catch(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fitReminders", JSON.stringify(reminders));
    }
  }, [reminders]);

  useEffect(() => {
    reminderTimers.current.forEach((timer) => window.clearTimeout(timer));
    reminderTimers.current = [];

    reminders.forEach((reminder) => {
      const delay = Math.max(1000, Number(reminder.minutes) * 60000);
      const timer = window.setTimeout(() => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(reminder.title || "Fitness Reminder", {
            body: "Time to train and stay consistent.",
          });
        } else {
          window.alert(`Reminder: ${reminder.title || "Fitness reminder"}`);
        }
      }, delay);
      reminderTimers.current.push(timer);
    });

    return () => {
      reminderTimers.current.forEach((timer) => window.clearTimeout(timer));
      reminderTimers.current = [];
    };
  }, [reminders]);

  if (isLoading) {
    return <section className="dashboard dashboard-loading" aria-label="Loading dashboard"><div className="skeleton skeleton-heading" /><div className="skeleton-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton skeleton-card" key={item} />)}</div><div className="skeleton skeleton-wide" /></section>;
  }

  const progressData = bodyCompositionHistory.map((entry) => {
    const heightM = Number(profile?.height_cm) / 100;
    return { date: entry.measurement_date, bmi: heightM ? Number(entry.weight_kg) / (heightM * heightM) : 0 };
  });
  const latestBmi = progressData.length > 0 && progressData[progressData.length - 1].bmi > 0 ? progressData[progressData.length - 1].bmi.toFixed(1) : "--";
  const totalExercises = workouts.length;
  const completedSets = workouts.reduce((sum, w) => sum + (w.completed_sets || 0), 0);
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets || 0), 0);
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const currentStreak = calculateStreak(workouts);
  const recentBodyHistory = bodyCompositionHistory.slice(-3).reverse();
  // Nutrition data for today
  const today = new Date().toISOString().split("T")[0];
  const todayNutrition = nutritionLog;
  const nutritionTotals = todayNutrition.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
    }),
    { calories: 0, protein: 0 }
  );
  const nutritionGoal = Number(nutritionGoals.daily_calories) || 2500;
  const proteinGoal = Number(nutritionGoals.daily_protein_g) || 150;
  const exerciseCalories = calculateExerciseCalories(workouts, today);
  const calorieBudget = nutritionGoal + exerciseCalories;
  const caloriesRemaining = calculateCaloriesRemaining(nutritionGoal, nutritionTotals.calories, exerciseCalories);
  const calorieProgress = Math.min(100, Math.round((nutritionTotals.calories / calorieBudget) * 100));
  const proteinProgress = Math.min(100, Math.round((nutritionTotals.protein / proteinGoal) * 100));
  const volume = workouts.reduce((sum, workout) => sum + (Number(workout.sets) || 0) * (Number(workout.reps) || 0), 0);
  const nutritionDays = new Set(nutritionLog.map((meal) => meal.meal_date || meal.date).filter(Boolean));
  const combinedStreak = currentStreak + (nutritionDays.size > 0 ? 1 : 0);
  const weeklyWorkouts = workouts.filter((workout) => {
    const date = new Date(workout.createdAt || workout.created_at);
    return Number.isFinite(date.getTime()) && referenceTime - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
  });
  const weeklyVolume = weeklyWorkouts.reduce((sum, workout) => sum + (Number(workout.sets) || 0) * (Number(workout.reps) || 0), 0);
  const weeklyCalories = nutritionLog.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  const recentFoods = nutritionLog.slice(0, 3);
  const recentWorkout = workouts[0];

  const saveFirstRun = async (event) => {
    event.preventDefault();
    const calories = Math.max(500, Number(firstRunForm.calories) || 2500);
    const weight = Number(firstRunForm.weight) || null;
    try {
      await Promise.all([
        nutritionService.updateGoals({ daily_calories: calories, daily_protein_g: 150, daily_carbs_g: 300, daily_fat_g: 70 }),
        goalsService.upsertGoal({ goal_type: "maintenance", target_weight_kg: weight }),
      ]);
      setNutritionGoals({ daily_calories: calories, daily_protein_g: 150, daily_carbs_g: 300, daily_fat_g: 70 });
      setGoals((current) => ({ ...current, weight: weight || "" }));
      setShowFirstRun(false);
    } catch {
      alert("We couldn't save your starting goals. Please try again.");
    }
  };

  const quickLogFood = async (food) => {
    try {
      await nutritionService.addLog({ meal_date: today, meal_type: food.mealType || "snacks", food_name: food.name, quantity: food.quantity || null, quantity_unit: food.quantity ? "g" : null, calories: food.calories, protein_g: food.protein_g || food.protein, carbs_g: food.carbs_g || food.carbs, fat_g: food.fat_g || food.fat });
      setNutritionLog((current) => [food, ...current]);
    } catch {
      alert("Unable to log this food. Please try again.");
    }
  };

  // Weight data for today
  const todayWeight = weightHistory.find((entry) => entry.weight_date === today);

  const shareProgress = async () => {
    const text = `FitTrack Progress: ${currentStreak} day streak | BMI: ${latestBmi} | ${totalExercises} exercises tracked`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Progress copied to clipboard");
    } catch {
      alert(text);
    }
  };

  const saveGoal = async (event) => {
    event.preventDefault();
    const nextGoals = {
      weight: goalForm.weight || goals.weight || "",
      strength: goalForm.strength || goals.strength || "",
    };
    try {
      await goalsService.upsertGoal({ goal_type: "maintenance", target_weight_kg: Number(nextGoals.weight) || null, target_strength_kg: Number(nextGoals.strength) || null });
      setGoals(nextGoals);
      setGoalForm({ weight: "", strength: "" });
    } catch { alert("Unable to save your goal. Please try again."); }
  };

  const saveReminder = (event) => {
    event.preventDefault();

    if (!reminderForm.title.trim()) return;

    const nextReminder = {
      id: `${Date.now()}`,
      title: reminderForm.title.trim(),
      minutes: Math.max(1, Number(reminderForm.minutes) || 30),
      createdAt: new Date().toISOString(),
    };

    setReminders((current) => [nextReminder, ...current]);
    setReminderForm({ title: "", minutes: "30" });

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };

  const removeReminder = (id) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  };

  return (
    <section className="dashboard feature-panel">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
          <h2>Good to see you{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h2>
          <p className="dashboard-subtitle">{combinedStreak ? `${combinedStreak}-day streak. Keep the momentum going.` : "Start your first training and nutrition streak today."}</p>
        </div>
        <span className="status-pill">Today at a glance</span>
      </div>

      {showFirstRun && (
        <form className="first-run-panel" onSubmit={saveFirstRun}>
          <div>
            <p className="eyebrow">Welcome to FitLab</p>
            <h3>Set your starting goals</h3>
            <p>Choose a daily calorie target and add a weight goal if you have one.</p>
          </div>
          <div className="first-run-fields">
            <label><span>Daily calorie goal</span><input type="number" min="500" max="5000" step="50" value={firstRunForm.calories} onChange={(event) => setFirstRunForm({ ...firstRunForm, calories: event.target.value })} /></label>
            <label><span>Weight goal <small>optional</small></span><input type="number" min="30" max="300" step="0.1" placeholder="kg" value={firstRunForm.weight} onChange={(event) => setFirstRunForm({ ...firstRunForm, weight: event.target.value })} /></label>
          </div>
          <button type="submit">Save &amp; start</button>
        </form>
      )}

      <div className="daily-overview">
        <article className="daily-panel training-panel clickable-panel" onClick={() => onNavigate?.("training")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onNavigate?.("training"); }} role="button" tabIndex="0">
          <div className="daily-panel-heading"><span className="panel-kicker">Today’s Training</span><span className="panel-icon">TR</span></div>
          <div className="training-summary-row"><div className="training-number">{completionRate}<small>%</small></div><div><strong>{totalSets ? `${completedSets} of ${totalSets} sets` : "No workout planned"}</strong><span>{totalSets ? "Completion for today’s plan" : "Choose a plan to get started"}</span></div></div>
          <div className="metric-progress"><span style={{ width: `${completionRate}%` }} /></div>
          {!totalSets && <button type="button" className="empty-card-action" onClick={(event) => { event.stopPropagation(); onNavigate?.("training"); }}>Add your first exercise</button>}
          <div className="daily-meta"><span>{totalExercises} exercises</span><span>{volume} total reps</span><span>Rest timer ready</span></div>
        </article>
        <article className="daily-panel nutrition-panel clickable-panel" onClick={() => onNavigate?.("health")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onNavigate?.("health"); }} role="button" tabIndex="0">
          <div className="daily-panel-heading"><span className="panel-kicker">Today’s Nutrition</span><span className="panel-icon">NF</span></div>
          <div className="nutrition-summary-row"><ProgressRing value={calorieProgress} /><div><strong>{caloriesRemaining.toFixed(0)} <small>kcal remaining</small></strong><span>{nutritionLog.length ? `${nutritionTotals.calories.toFixed(0)} food + ${exerciseCalories} exercise / ${calorieBudget} kcal budget` : "No food logged yet"}</span></div></div>
          {!nutritionLog.length && <button type="button" className="empty-card-action" onClick={(event) => { event.stopPropagation(); onNavigate?.("health"); }}>Log a meal</button>}
          <div className="protein-track"><div><span>Protein</span><strong>{nutritionTotals.protein.toFixed(0)} / {proteinGoal} g</strong></div><div className="metric-progress"><span style={{ width: `${proteinProgress}%` }} /></div></div>
        </article>
      </div>

      <div className="dashboard-ctas"><button type="button" onClick={() => onNavigate?.("training")}>Continue Workout <span aria-hidden="true">→</span></button><button type="button" onClick={() => onNavigate?.("health")}>Log Food <span aria-hidden="true">→</span></button></div>

      <article className="streak-card"><div className="streak-mark">{combinedStreak}</div><div><p className="panel-kicker">Consistency streak</p><h3>{combinedStreak} active day{combinedStreak === 1 ? "" : "s"}</h3><span>Training and nutrition are moving together.</span></div><div className="streak-breakdown"><span>Training <strong>{currentStreak}</strong></span><span>Nutrition <strong>{nutritionDays.size > 0 ? 1 : 0}</strong></span></div></article>

      <div className="stats-grid">
        <StatCard label="Current Streak" value={`${currentStreak} days`} detail="Keep the momentum" icon="ST" />
        <StatCard label="Weight / BMI" value={todayWeight ? `${Number(todayWeight.weight_kg).toFixed(1)} kg` : latestBmi} detail={todayWeight ? `BMI ${latestBmi}` : "Add a body check-in"} icon="WT" />
        <StatCard label="Exercises" value={totalExercises} detail={`${volume} reps in plan`} icon="EX" />
        <StatCard label="Completion" value={`${completionRate}%`} detail={`${completedSets} sets finished`} icon="CP" />
      </div>

      <div className="weekly-recap">
        <div><p className="eyebrow">This week</p><h3>A little consistency goes a long way.</h3><p>Training and nutrition context, at a glance.</p></div>
        <div className="recap-metric"><strong>{weeklyWorkouts.length}</strong><span>workouts</span></div><div className="recap-metric"><strong>{weeklyVolume}</strong><span>volume reps</span></div><div className="recap-metric"><strong>{weeklyCalories}</strong><span>calories logged</span></div>
      </div>

      <article className="quick-log-card">
        <div><p className="eyebrow">Quick log</p><h3>Pick up where you left off</h3></div>
        <div className="quick-log-actions">
          {recentFoods.map((food) => <button type="button" key={food.id} onClick={() => quickLogFood(food)}><span>{food.name}</span><small>Log again</small></button>)}
          {recentWorkout && <button type="button" onClick={() => onNavigate?.("training")}><span>{recentWorkout.name}</span><small>Open workout</small></button>}
          {!recentFoods.length && !recentWorkout && <button type="button" onClick={() => onNavigate?.("health")}><span>Start your diary</span><small>Add your first meal</small></button>}
        </div>
      </article>

      <div className="history-card">
        <div className="history-card-header">
          <div>
            <h3>Body Composition History</h3>
            <p>Recent snapshots saved from the analyzer</p>
          </div>
          <span className="status-pill">Saved</span>
        </div>

        {recentBodyHistory.length > 0 ? (
          <div className="history-list">
            {recentBodyHistory.map((entry, index) => (
              <div key={entry.id || index} className="history-item">
                <strong>{entry.measurement_date}</strong>
                <span>BMI {Number(profile?.height_cm) > 0 ? (Number(entry.weight_kg) / ((Number(profile.height_cm) / 100) ** 2)).toFixed(1) : "--"} • Body Fat {entry.body_fat_percentage}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="history-empty">Save a body composition result to see it here.</p>
        )}
      </div>

      <div className="chart-grid-stack">
        <article className="goal-card">
          <h4>Goal Setting</h4>
          <p>Set a target weight loss or strength milestone.</p>
          <form onSubmit={saveGoal}>
            <input
              type="text"
              placeholder="Target weight (kg)"
              value={goalForm.weight}
              onChange={(event) => setGoalForm((current) => ({ ...current, weight: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Strength target (kg)"
              value={goalForm.strength}
              onChange={(event) => setGoalForm((current) => ({ ...current, strength: event.target.value }))}
            />
            <button className="primary-button" type="submit">Save Goal</button>
          </form>

          <div className="goal-summary">
            {goals.weight && <span className="goal-pill">Weight target: {goals.weight} kg</span>}
            {goals.strength && <span className="goal-pill">Strength target: {goals.strength} kg</span>}
            {!goals.weight && !goals.strength && <span className="goal-pill">No goals set yet</span>}
          </div>
        </article>

        <article className="reminder-card">
          <h4>Reminders</h4>
          <p>Get local reminders for your training sessions.</p>
          <form onSubmit={saveReminder}>
            <input
              type="text"
              placeholder="Reminder title"
              value={reminderForm.title}
              onChange={(event) => setReminderForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              placeholder="Minutes"
              value={reminderForm.minutes}
              onChange={(event) => setReminderForm((current) => ({ ...current, minutes: event.target.value }))}
            />
            <button className="primary-button" type="submit">Add Reminder</button>
          </form>

          <div className="reminder-list">
            {reminders.length === 0 ? (
              <span className="reminder-pill">No reminders yet</span>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-item">
                  <span>{reminder.title} • {reminder.minutes}m</span>
                  <button className="btn-delete" type="button" onClick={() => removeReminder(reminder.id)}>Remove</button>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <button className="primary-button share-btn" onClick={shareProgress}>
        Share My Progress
      </button>
    </section>
  );
}

function ProgressRing({ value }) {
  return <div className="progress-ring" style={{ "--ring-progress": `${value * 3.6}deg` }}><div><strong>{value}%</strong><span>goal</span></div></div>;
}

function StatCard({ label, value, detail, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top"><p>{label}</p><span className="stat-icon">{icon}</span></div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
