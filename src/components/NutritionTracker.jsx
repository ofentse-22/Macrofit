import { useState, useEffect, useRef } from "react";
import "./NutritionTracker.css";
import { nutritionService, workoutService } from "../services/supabaseService";
import { cancelQueuedCreate, enqueue, updateQueuedCreate } from "../services/offlineQueue";
import { calculateCaloriesRemaining, calculateExerciseCalories } from "../services/nutritionCalculations";
import { getLocalDate } from "../services/dateUtils";
import { deduplicateFoods, getFoodIdentity, searchOpenFoodFacts } from "../services/openFoodFactsService";

const COMMON_FOODS = [
  { id: 1, name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 2, name: "Brown Rice (1 cup cooked)", calories: 215, protein: 5, carbs: 45, fat: 1.8 },
  { id: 3, name: "Broccoli (1 cup)", calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { id: 4, name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 5, name: "Eggs (1 large)", calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
  { id: 6, name: "Banana (medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { id: 7, name: "Almonds (28g/23 nuts)", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: 8, name: "Greek Yogurt (100g)", calories: 59, protein: 10, carbs: 3.3, fat: 0.4 },
  { id: 9, name: "Sweet Potato (100g cooked)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: 10, name: "Olive Oil (1 tbsp)", calories: 120, protein: 0, carbs: 0, fat: 14 },
  { id: 11, name: "Oats (40g)", calories: 150, protein: 5, carbs: 27, fat: 3 }, { id: 12, name: "White Rice (1 cup)", calories: 205, protein: 4, carbs: 45, fat: 0.4 },
  { id: 13, name: "Quinoa (1 cup cooked)", calories: 222, protein: 8, carbs: 39, fat: 3.6 }, { id: 14, name: "Whole Wheat Bread (slice)", calories: 81, protein: 4, carbs: 14, fat: 1.1 },
  { id: 15, name: "Pasta (1 cup cooked)", calories: 221, protein: 8, carbs: 43, fat: 1.3 }, { id: 16, name: "Couscous (1 cup cooked)", calories: 176, protein: 6, carbs: 36, fat: 0.3 },
  { id: 17, name: "Black Beans (1 cup)", calories: 227, protein: 15, carbs: 41, fat: 0.9 }, { id: 18, name: "Chickpeas (1 cup)", calories: 269, protein: 15, carbs: 45, fat: 4.3 },
  { id: 19, name: "Lentils (1 cup)", calories: 230, protein: 18, carbs: 40, fat: 0.8 }, { id: 20, name: "Kidney Beans (1 cup)", calories: 225, protein: 15, carbs: 40, fat: 0.9 },
  { id: 21, name: "Tofu (100g)", calories: 144, protein: 17, carbs: 3, fat: 9 }, { id: 22, name: "Tempeh (100g)", calories: 195, protein: 20, carbs: 8, fat: 11 },
  { id: 23, name: "Turkey Breast (100g)", calories: 135, protein: 29, carbs: 0, fat: 1 }, { id: 24, name: "Lean Beef (100g)", calories: 217, protein: 26, carbs: 0, fat: 12 },
  { id: 25, name: "Pork Tenderloin (100g)", calories: 143, protein: 26, carbs: 0, fat: 3.5 }, { id: 26, name: "Tuna (100g)", calories: 116, protein: 26, carbs: 0, fat: 1 },
  { id: 27, name: "Cod (100g)", calories: 105, protein: 23, carbs: 0, fat: 0.9 }, { id: 28, name: "Prawns (100g)", calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { id: 29, name: "Cottage Cheese (100g)", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 }, { id: 30, name: "Milk, low fat (250ml)", calories: 105, protein: 8.5, carbs: 12, fat: 2.5 },
  { id: 31, name: "Cheddar Cheese (30g)", calories: 121, protein: 7.5, carbs: 0.4, fat: 10 }, { id: 32, name: "Mozzarella (30g)", calories: 85, protein: 6, carbs: 1, fat: 6 },
  { id: 33, name: "Whey Protein (1 scoop)", calories: 120, protein: 24, carbs: 3, fat: 2 }, { id: 34, name: "Peanut Butter (2 tbsp)", calories: 188, protein: 8, carbs: 6, fat: 16 },
  { id: 35, name: "Walnuts (28g)", calories: 185, protein: 4, carbs: 4, fat: 18 }, { id: 36, name: "Cashews (28g)", calories: 157, protein: 5, carbs: 9, fat: 12 },
  { id: 37, name: "Chia Seeds (2 tbsp)", calories: 138, protein: 5, carbs: 12, fat: 9 }, { id: 38, name: "Avocado (half)", calories: 161, protein: 2, carbs: 8.5, fat: 15 },
  { id: 39, name: "Apple (medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }, { id: 40, name: "Orange (medium)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { id: 41, name: "Strawberries (1 cup)", calories: 49, protein: 1, carbs: 12, fat: 0.5 }, { id: 42, name: "Blueberries (1 cup)", calories: 84, protein: 1, carbs: 21, fat: 0.5 },
  { id: 43, name: "Grapes (1 cup)", calories: 104, protein: 1, carbs: 27, fat: 0.2 }, { id: 44, name: "Mango (1 cup)", calories: 99, protein: 1.4, carbs: 25, fat: 0.6 },
  { id: 45, name: "Pineapple (1 cup)", calories: 82, protein: 0.9, carbs: 22, fat: 0.2 }, { id: 46, name: "Pear (medium)", calories: 101, protein: 0.6, carbs: 27, fat: 0.2 },
  { id: 47, name: "Peach (medium)", calories: 59, protein: 1.4, carbs: 14, fat: 0.4 }, { id: 48, name: "Watermelon (1 cup)", calories: 46, protein: 0.9, carbs: 12, fat: 0.2 },
  { id: 49, name: "Carrots (1 cup)", calories: 52, protein: 1.2, carbs: 12, fat: 0.3 }, { id: 50, name: "Spinach (1 cup)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1 },
  { id: 51, name: "Kale (1 cup)", calories: 33, protein: 2.2, carbs: 6, fat: 0.6 }, { id: 52, name: "Green Beans (1 cup)", calories: 44, protein: 2.4, carbs: 10, fat: 0.3 },
  { id: 53, name: "Asparagus (1 cup)", calories: 27, protein: 3, carbs: 5, fat: 0.2 }, { id: 54, name: "Cauliflower (1 cup)", calories: 25, protein: 2, carbs: 5, fat: 0.3 },
  { id: 55, name: "Bell Pepper (1 cup)", calories: 39, protein: 1.5, carbs: 9, fat: 0.4 }, { id: 56, name: "Tomato (medium)", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2 },
  { id: 57, name: "Cucumber (1 cup)", calories: 16, protein: 0.7, carbs: 3.8, fat: 0.1 }, { id: 58, name: "Mushrooms (1 cup)", calories: 15, protein: 2.2, carbs: 2.3, fat: 0.2 },
  { id: 59, name: "Potato (medium baked)", calories: 161, protein: 4.3, carbs: 37, fat: 0.2 }, { id: 60, name: "Corn (1 cup)", calories: 143, protein: 5, carbs: 31, fat: 2 },
  { id: 61, name: "Granola (50g)", calories: 235, protein: 5, carbs: 32, fat: 10 }, { id: 62, name: "Cornflakes (30g)", calories: 107, protein: 2.1, carbs: 25, fat: 0.1 },
  { id: 63, name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fat: 7 }, { id: 64, name: "Rice Cakes (2)", calories: 70, protein: 1.4, carbs: 15, fat: 0.6 },
  { id: 65, name: "Dark Chocolate (30g)", calories: 170, protein: 2, carbs: 14, fat: 12 }, { id: 66, name: "Honey (1 tbsp)", calories: 64, protein: 0, carbs: 17, fat: 0 },
  { id: 67, name: "Jam (1 tbsp)", calories: 50, protein: 0, carbs: 13, fat: 0 }, { id: 68, name: "Hummus (2 tbsp)", calories: 70, protein: 2, carbs: 4, fat: 5 },
  { id: 69, name: "Guacamole (2 tbsp)", calories: 50, protein: 0.6, carbs: 3, fat: 4.5 }, { id: 70, name: "Mayonnaise (1 tbsp)", calories: 94, protein: 0.1, carbs: 0.1, fat: 10 },
  { id: 71, name: "Chicken Wrap", calories: 420, protein: 32, carbs: 42, fat: 14 }, { id: 72, name: "Turkey Sandwich", calories: 350, protein: 28, carbs: 38, fat: 10 },
  { id: 73, name: "Beef Burger", calories: 540, protein: 31, carbs: 40, fat: 29 }, { id: 74, name: "Grilled Chicken Salad", calories: 310, protein: 35, carbs: 16, fat: 12 },
  { id: 75, name: "Caesar Salad", calories: 330, protein: 12, carbs: 20, fat: 23 }, { id: 76, name: "Margherita Pizza (2 slices)", calories: 520, protein: 22, carbs: 64, fat: 20 },
  { id: 77, name: "Sushi Roll (8 pieces)", calories: 350, protein: 12, carbs: 62, fat: 5 }, { id: 78, name: "Burrito", calories: 650, protein: 32, carbs: 78, fat: 23 },
  { id: 79, name: "Scrambled Eggs (2)", calories: 182, protein: 13, carbs: 2, fat: 14 }, { id: 80, name: "Omelette (3 eggs)", calories: 250, protein: 19, carbs: 3, fat: 19 },
  { id: 81, name: "Pancakes (2)", calories: 227, protein: 6, carbs: 28, fat: 10 }, { id: 82, name: "French Toast (2 slices)", calories: 300, protein: 12, carbs: 35, fat: 12 },
  { id: 83, name: "Coffee with Milk", calories: 60, protein: 3, carbs: 6, fat: 2.5 }, { id: 84, name: "Orange Juice (250ml)", calories: 112, protein: 1.7, carbs: 26, fat: 0.5 },
  { id: 85, name: "Coca-Cola (330ml)", calories: 139, protein: 0, carbs: 35, fat: 0 }, { id: 86, name: "Sports Drink (500ml)", calories: 120, protein: 0, carbs: 30, fat: 0 },
  { id: 87, name: "Smoothie, fruit (300ml)", calories: 180, protein: 3, carbs: 42, fat: 1 }, { id: 88, name: "Protein Shake", calories: 180, protein: 30, carbs: 10, fat: 3 },
  { id: 89, name: "Biltong (50g)", calories: 150, protein: 27, carbs: 2, fat: 4 }, { id: 90, name: "Boerewors (100g)", calories: 290, protein: 17, carbs: 2, fat: 24 },
  { id: 91, name: "Pap (1 cup)", calories: 180, protein: 4, carbs: 39, fat: 0.6 }, { id: 92, name: "Chakalaka (1 cup)", calories: 110, protein: 3, carbs: 17, fat: 3 },
  { id: 93, name: "Bobotie (1 serving)", calories: 410, protein: 26, carbs: 24, fat: 23 }, { id: 94, name: "Vetkoek (1)", calories: 300, protein: 6, carbs: 40, fat: 13 },
  { id: 95, name: "Yogurt, plain (170g)", calories: 100, protein: 9, carbs: 11, fat: 2 }, { id: 96, name: "Kefir (250ml)", calories: 140, protein: 9, carbs: 12, fat: 6 },
  { id: 97, name: "Edamame (1 cup)", calories: 188, protein: 18, carbs: 14, fat: 8 }, { id: 98, name: "Seitan (100g)", calories: 120, protein: 24, carbs: 4, fat: 2 },
  { id: 99, name: "Trail Mix (50g)", calories: 240, protein: 6, carbs: 22, fat: 15 }, { id: 100, name: "Popcorn, air popped (3 cups)", calories: 93, protein: 3, carbs: 19, fat: 1 },
];

function MacroBar({ label, consumed, goal, color, displayValue }) {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

  return (
    <div className="macro-bar">
      <div className="macro-label">
        <span>{label}</span>
        <span className="macro-value">{displayValue || `${consumed.toFixed(0)} / ${goal} ${label === "Calories" ? "kcal" : "g"}`}</span>
      </div>
      <div className="macro-progress" style={{ "--bar-color": color }}>
        <div className="macro-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function NutritionCard({ title, value, unit, color }) {
  return (
    <div className="nutrition-card" style={{ borderLeftColor: color }}>
      <div className="nutrition-card-header">
        <span className="nutrition-title">{title}</span>
      </div>
      <div className="nutrition-value">
        {value}
        <span className="nutrition-unit">{unit}</span>
      </div>
    </div>
  );
}

export default function NutritionTracker({ autoOpen = false }) {
  const [meals, setMeals] = useState([]);
  const [exerciseCalories, setExerciseCalories] = useState(0);

  const [macroGoals, setMacroGoals] = useState({});
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState(macroGoals);
  const [showAddMeal, setShowAddMeal] = useState(autoOpen);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [onlineSearchRequest, setOnlineSearchRequest] = useState(0);
  const [onlineFoods, setOnlineFoods] = useState([]);
  const [foodSearchLoading, setFoodSearchLoading] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState("");
  const [foodSearchTotal, setFoodSearchTotal] = useState(0);
  const [foodSearchPage, setFoodSearchPage] = useState(1);
  const [foodSearchPageCount, setFoodSearchPageCount] = useState(0);
  const onlineFoodPages = useRef(new Map());
  const [macroView, setMacroView] = useState("grams");
  const [customFood, setCustomFood] = useState({ name: "", grams: "100", calories: "", protein: "", carbs: "", fat: "" });
  const [offlineMessage, setOfflineMessage] = useState("");

  useEffect(() => {
    Promise.all([nutritionService.getLogsForDate(getLocalDate()), nutritionService.getGoals(), workoutService.getWorkouts()]).then(([logs, savedGoals, workouts]) => {
      setMeals(logs.map((log) => ({ id: log.id, date: log.meal_date, mealType: log.meal_type, name: log.food_name, quantity: Number(log.quantity) || 0, calories: Number(log.calories) || 0, protein: Number(log.protein_g) || 0, carbs: Number(log.carbs_g) || 0, fat: Number(log.fat_g) || 0 })));
      setExerciseCalories(calculateExerciseCalories(workouts, getLocalDate()));
      const goals = savedGoals || {};
      setMacroGoals({ calories: goals.daily_calories, protein: goals.daily_protein_g, carbs: goals.daily_carbs_g, fat: goals.daily_fat_g });
      setGoalForm({ calories: goals.daily_calories, protein: goals.daily_protein_g, carbs: goals.daily_carbs_g, fat: goals.daily_fat_g });
    });
  }, []);

  useEffect(() => {
    const query = onlineSearchQuery.trim();
    if (query.length < 2) return undefined;

    const controller = new AbortController();
    searchOpenFoodFacts(query, foodSearchPage, controller.signal)
      .then((result) => {
        const previouslySeen = new Set();
        for (let page = 1; page < foodSearchPage; page += 1) {
          for (const food of onlineFoodPages.current.get(page) || []) {
            previouslySeen.add(getFoodIdentity(food));
          }
        }
        const uniqueProducts = deduplicateFoods(result.products, previouslySeen);
        onlineFoodPages.current.set(foodSearchPage, uniqueProducts);
        setOnlineFoods(uniqueProducts);
        setFoodSearchTotal(result.total);
        setFoodSearchPageCount(result.pageCount);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setOnlineFoods([]);
          setFoodSearchTotal(0);
          setFoodSearchPageCount(0);
          setFoodSearchError("Online food search is unavailable. Check your connection or clear the search to browse offline quick picks.");
          console.error("Open Food Facts search failed:", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setFoodSearchLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [onlineSearchQuery, foodSearchPage, onlineSearchRequest]);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goals = {
    calories: Number(macroGoals.calories) || 2500,
    protein: Number(macroGoals.protein) || 150,
    carbs: Number(macroGoals.carbs) || 300,
    fat: Number(macroGoals.fat) || 70,
  };

  const remaining = {
    calories: calculateCaloriesRemaining(goals.calories, totals.calories, exerciseCalories),
    protein: Math.max(0, goals.protein - totals.protein),
    carbs: Math.max(0, goals.carbs - totals.carbs),
    fat: Math.max(0, goals.fat - totals.fat),
  };

  const formatMacro = (value, goal) => {
    if (macroView === "remaining") return `${Math.max(0, goal - value).toFixed(0)}g left`;
    if (macroView === "percent") return `${goal > 0 ? Math.round((value / goal) * 100) : 0}%`;
    return `${value.toFixed(0)}g`;
  };

  const mealsByType = {
    breakfast: meals.filter((m) => m.mealType === "breakfast"),
    lunch: meals.filter((m) => m.mealType === "lunch"),
    dinner: meals.filter((m) => m.mealType === "dinner"),
    snacks: meals.filter((m) => m.mealType === "snacks"),
  };

  const saveMacroGoals = async (e) => {
    e.preventDefault();
    const newGoals = {
      calories: Number(goalForm.calories) || 2500,
      protein: Number(goalForm.protein) || 150,
      carbs: Number(goalForm.carbs) || 300,
      fat: Number(goalForm.fat) || 70,
    };
    try {
      await nutritionService.updateGoals({ daily_calories: newGoals.calories, daily_protein_g: newGoals.protein, daily_carbs_g: newGoals.carbs, daily_fat_g: newGoals.fat });
      setMacroGoals(newGoals);
      setShowGoalForm(false);
    } catch { alert("Unable to save nutrition goals. Please try again."); }
  };

  const searchOnlineFoods = (query) => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return;
    onlineFoodPages.current = new Map();
    setFoodSearch(normalizedQuery);
    setOnlineSearchQuery(normalizedQuery);
    setFoodSearchPage(1);
    setFoodSearchError("");
    setFoodSearchLoading(true);
    setOnlineSearchRequest((request) => request + 1);
  };

  const addFood = async (food) => {
    const today = getLocalDate();
    const payload = { meal_date: today, meal_type: selectedMealType, food_name: food.name, quantity: food.grams || null, quantity_unit: food.grams ? food.unit || "g" : null, calories: food.calories, protein_g: food.protein, carbs_g: food.carbs, fat_g: food.fat };
    try {
      const clientId = !navigator.onLine ? crypto.randomUUID() : null;
      const saved = navigator.onLine ? await nutritionService.addLog(payload) : { ...payload, id: clientId };
      if (clientId) enqueue({ type: "nutritionLog", clientId, payload });
      setMeals((current) => [{ id: saved.id, date: saved.meal_date, mealType: saved.meal_type, name: saved.food_name, quantity: Number(saved.quantity) || Number(food.grams) || 0, calories: Number(saved.calories) || 0, protein: Number(saved.protein_g) || 0, carbs: Number(saved.carbs_g) || 0, fat: Number(saved.fat_g) || 0 }, ...current]);
      setShowAddMeal(false);
    } catch { alert("Unable to save meal. Please try again."); }
  };

  const selectFood = (food) => {
    const defaultGrams = Number(food.grams) || 100;
    setSelectedFood({ food, grams: String(defaultGrams) });
  };

  const addSelectedFood = () => {
    if (!selectedFood) return;
    const defaultGrams = Number(selectedFood.food.grams) || 100;
    const grams = Math.max(1, Number(selectedFood.grams) || defaultGrams);
    const multiplier = grams / defaultGrams;
    addFood({
      ...selectedFood.food,
      grams,
      calories: Math.round(Number(selectedFood.food.calories) * multiplier),
      protein: Number((Number(selectedFood.food.protein || 0) * multiplier).toFixed(1)),
      carbs: Number((Number(selectedFood.food.carbs || 0) * multiplier).toFixed(1)),
      fat: Number((Number(selectedFood.food.fat || 0) * multiplier).toFixed(1)),
    });
    setSelectedFood(null);
  };

  const selectedFoodNutrition = selectedFood ? (() => {
    const defaultGrams = Number(selectedFood.food.grams) || 100;
    const grams = Math.max(1, Number(selectedFood.grams) || defaultGrams);
    const multiplier = grams / defaultGrams;
    return {
      grams,
      calories: Math.round(Number(selectedFood.food.calories) * multiplier),
      protein: Number((Number(selectedFood.food.protein || 0) * multiplier).toFixed(1)),
      carbs: Number((Number(selectedFood.food.carbs || 0) * multiplier).toFixed(1)),
      fat: Number((Number(selectedFood.food.fat || 0) * multiplier).toFixed(1)),
    };
  })() : null;

  const addCustomFood = (e) => {
    e.preventDefault();
    if (!customFood.name.trim() || !customFood.calories) return;

    const multiplier = (Number(customFood.grams) || 100) / 100;
    const newFood = {
      name: customFood.name.trim(),
      calories: Math.round(Number(customFood.calories) * multiplier),
      protein: Number((Number(customFood.protein || 0) * multiplier).toFixed(1)),
      carbs: Number((Number(customFood.carbs || 0) * multiplier).toFixed(1)),
      fat: Number((Number(customFood.fat || 0) * multiplier).toFixed(1)),
    };

    addFood({ ...newFood, grams: Number(customFood.grams) || 100 });
    setCustomFood({ name: "", grams: "100", calories: "", protein: "", carbs: "", fat: "" });
    setShowCustomFood(false);
  };

  const removeMeal = async (id) => {
    try {
      if (cancelQueuedCreate(id)) {
        setOfflineMessage("Meal removal queued and will sync when you are online.");
      } else if (!navigator.onLine) {
        enqueue({ type: "nutritionLogDelete", payload: { id } });
        setOfflineMessage("Meal removal queued and will sync when you are online.");
      } else if (navigator.onLine) {
        await nutritionService.deleteLog(id);
      }
      setMeals((current) => current.filter((meal) => meal.id !== id));
    } catch { alert("Unable to remove meal. Please try again."); }
  };

  const editMeal = async (meal) => {
    const name = window.prompt("Food name", meal.name);
    if (name === null || !name.trim()) return;
    const calories = Number(window.prompt("Calories", meal.calories));
    if (!Number.isFinite(calories)) return;
    const updates = { food_name: name.trim(), calories };
    try {
      if (updateQueuedCreate(meal.id, updates)) {
        setOfflineMessage("Meal edit queued and will sync when you are online.");
      } else if (!navigator.onLine) {
        enqueue({ type: "nutritionLogUpdate", payload: { id: meal.id, updates } });
        setOfflineMessage("Meal edit queued and will sync when you are online.");
      } else if (navigator.onLine) {
        await nutritionService.updateLog(meal.id, updates);
      }
      setMeals((current) => current.map((item) => item.id === meal.id ? { ...item, name: updates.food_name, calories } : item));
    } catch { alert("Unable to edit meal. Please try again."); }
  };

  const clearToday = async () => {
    if (!window.confirm("Clear all meals for today?")) return;
    try {
      if (!navigator.onLine) {
        meals.forEach((meal) => {
          if (!cancelQueuedCreate(meal.id)) enqueue({ type: "nutritionLogDelete", payload: { id: meal.id } });
        });
        setOfflineMessage("Meal clearing queued and will sync when you are online.");
      } else {
        await Promise.all(meals.map((meal) => nutritionService.deleteLog(meal.id)));
      }
      setMeals([]);
    } catch { alert("Unable to clear today's meals. Please try again."); }
  };

  const copyPreviousMeals = async () => {
    if (!meals.length) return;
    try {
      await Promise.all(meals.map((meal) => nutritionService.addLog({ meal_date: getLocalDate(), meal_type: meal.mealType, food_name: meal.name, quantity: meal.quantity || null, quantity_unit: meal.quantity ? "g" : null, calories: meal.calories, protein_g: meal.protein, carbs_g: meal.carbs, fat_g: meal.fat })));
      setMeals((current) => [...current, ...meals.map((meal) => ({ ...meal, id: `${meal.id}-copy-${Date.now()}` }))]);
    } catch {
      alert("Unable to copy yesterday's meals. Please try again.");
    }
  };

  return (
    <div className="nutrition-container">
      {offlineMessage && <p className="offline-notice" role="status">{offlineMessage}</p>}
      <div className="nutrition-header">
        <h2>Nutrition Tracker</h2>
        <div className="nutrition-header-buttons">
          <button onClick={() => setShowGoalForm(!showGoalForm)} className="btn-secondary">
            {showGoalForm ? "Cancel" : "Set Goals"}
          </button>
          <button onClick={clearToday} className="btn-danger">
            Clear Day
          </button>
          <button onClick={copyPreviousMeals} className="btn-secondary" disabled={!meals.length}>Copy Meals</button>
        </div>
      </div>

      {showGoalForm && (
        <form onSubmit={saveMacroGoals} className="nutrition-goals-form">
          <h3>Daily Nutrition Goals</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Calories (kcal)</label>
              <input
                type="number"
                value={goalForm.calories}
                onChange={(e) => setGoalForm({ ...goalForm, calories: e.target.value })}
                min="500"
                max="5000"
                step="50"
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                value={goalForm.protein}
                onChange={(e) => setGoalForm({ ...goalForm, protein: e.target.value })}
                min="20"
                max="400"
                step="5"
              />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input
                type="number"
                value={goalForm.carbs}
                onChange={(e) => setGoalForm({ ...goalForm, carbs: e.target.value })}
                min="50"
                max="600"
                step="10"
              />
            </div>
            <div className="form-group">
              <label>Fat (g)</label>
              <input
                type="number"
                value={goalForm.fat}
                onChange={(e) => setGoalForm({ ...goalForm, fat: e.target.value })}
                min="20"
                max="200"
                step="5"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Goals</button>
        </form>
      )}

      <section className="calorie-hero" aria-label="Today's calorie budget">
        <div className="calorie-hero-main">
          <p className="panel-kicker">Today's budget</p>
          <span className="calorie-remaining-label">Calories Remaining</span>
          <strong className="calorie-remaining-value">{remaining.calories.toFixed(0)} <small>kcal</small></strong>
          {!meals.length && <p className="calorie-empty-state">Start your diary with a meal.</p>}
        </div>
        <div className="calorie-breakdown">
          <div><span>Base Goal</span><strong>{goals.calories} kcal</strong></div>
          <div className="food-calorie-line"><span>Food</span><strong>- {totals.calories.toFixed(0)} kcal</strong></div>
          <div className="exercise-calorie-line"><span>Exercise</span><strong>+ {exerciseCalories} kcal</strong></div>
        </div>
      </section>

      <div className="nutrition-summary">
        <div className="summary-section">
          <h3>Today's Goal</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" value={goals.calories} unit="kcal" color="#1d56c7" />
            <NutritionCard title="Protein" value={goals.protein} unit="g" color="#1d56c7" />
            <NutritionCard title="Carbs" value={goals.carbs} unit="g" color="#1d56c7" />
            <NutritionCard title="Fat" value={goals.fat} unit="g" color="#1d56c7" />
          </div>
        </div>

        <div className="summary-section">
          <h3>Consumed</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" value={totals.calories.toFixed(0)} unit="kcal" color="#1d56c7" />
            <NutritionCard title="Protein" value={totals.protein.toFixed(0)} unit="g" color="#1d56c7" />
            <NutritionCard title="Carbs" value={totals.carbs.toFixed(0)} unit="g" color="#1d56c7" />
            <NutritionCard title="Fat" value={totals.fat.toFixed(0)} unit="g" color="#1d56c7" />
          </div>
        </div>

        <div className="summary-section remaining">
          <h3>Remaining</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" value={remaining.calories.toFixed(0)} unit="kcal" color="#1d56c7" />
            <NutritionCard title="Protein" value={remaining.protein.toFixed(0)} unit="g" color="#1d56c7" />
            <NutritionCard title="Carbs" value={remaining.carbs.toFixed(0)} unit="g" color="#1d56c7" />
            <NutritionCard title="Fat" value={remaining.fat.toFixed(0)} unit="g" color="#1d56c7" />
          </div>
        </div>
      </div>

      <div className="macro-progress">
        <div className="macro-heading"><h3>Progress</h3><div className="macro-view-toggle" role="group" aria-label="Macro display"><button type="button" className={macroView === "grams" ? "active" : ""} onClick={() => setMacroView("grams")}>Grams</button><button type="button" className={macroView === "percent" ? "active" : ""} onClick={() => setMacroView("percent")}>Percent</button><button type="button" className={macroView === "remaining" ? "active" : ""} onClick={() => setMacroView("remaining")}>Remaining</button></div></div>
        <MacroBar label="Calories" consumed={totals.calories} goal={goals.calories + exerciseCalories} color="#1d56c7" displayValue={macroView === "grams" ? `${totals.calories.toFixed(0)} / ${goals.calories + exerciseCalories} kcal` : formatMacro(totals.calories, goals.calories + exerciseCalories)} />
        <MacroBar label="Protein" consumed={totals.protein} goal={goals.protein} color="#1d56c7" displayValue={formatMacro(totals.protein, goals.protein)} />
        <MacroBar label="Carbs" consumed={totals.carbs} goal={goals.carbs} color="#1d56c7" displayValue={formatMacro(totals.carbs, goals.carbs)} />
        <MacroBar label="Fat" consumed={totals.fat} goal={goals.fat} color="#1d56c7" displayValue={formatMacro(totals.fat, goals.fat)} />
      </div>

      <div className="nutrition-support-row">
        {totals.protein < goals.protein * 0.5 && <article className="nutrition-nudge"><p className="panel-kicker">Daily nudge</p><h3>Protein is behind target</h3><p>Add a protein-rich meal to stay aligned with your goal.</p></article>}
      </div>

      <div className="meals-section">
        <div className="meals-header">
          <h3>Meals</h3>
          <button onClick={() => setShowAddMeal(!showAddMeal)} className="btn-primary">
            {showAddMeal ? "Cancel" : "Add Food"}
          </button>
        </div>

        {showAddMeal && (
          <div className="add-meal-panel">
            <div className="meal-type-selector">
              <label>Meal Type:</label>
              <select value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            <div className="food-buttons">
              <button
                onClick={() => { setShowCustomFood(!showCustomFood); setSelectedFood(null); }}
                className="btn-secondary"
              >
                {showCustomFood ? "Close" : "Add Custom Food"}
              </button>
            </div>

            {showCustomFood && (
              <form onSubmit={addCustomFood} className="custom-food-form">
                <div className="form-group">
                  <label>Food Name</label>
                  <input
                    type="text"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    placeholder="e.g., Pasta with sauce"
                  />
                </div>
                <div className="form-group">
                  <label>Amount eaten (g)</label>
                  <input type="number" min="1" step="1" value={customFood.grams} onChange={(e) => setCustomFood({ ...customFood, grams: e.target.value })} />
                  <small>Enter the weight from your kitchen scale.</small>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Calories per 100g</label>
                    <input
                      type="number"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                      min="0"
                      step="10"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein per 100g</label>
                    <input
                      type="number"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs per 100g</label>
                    <input
                      type="number"
                      value={customFood.carbs}
                      onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fat per 100g</label>
                    <input
                      type="number"
                      value={customFood.fat}
                      onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="estimate-note">Calculated total: {Math.round(Number(customFood.calories || 0) * ((Number(customFood.grams) || 100) / 100))} kcal for {customFood.grams || 100}g</p>
                <button type="submit" className="btn-primary">Calculate & Add Food</button>
              </form>
            )}

            {selectedFood && !showCustomFood && selectedFoodNutrition && (
              <div className="food-confirm-sheet" role="dialog" aria-label={`Add ${selectedFood.food.name}`}>
                <div className="food-confirm-header"><div><p className="panel-kicker">Ready to log</p><h4>{selectedFood.food.name}</h4></div><button type="button" className="btn-secondary" onClick={() => setSelectedFood(null)}>Cancel</button></div>
                <div className="food-confirm-fields">
                  <label>Amount ({selectedFood.food.unit || "g"})<input type="number" min="1" step="1" value={selectedFood.grams} onChange={(event) => setSelectedFood({ ...selectedFood, grams: event.target.value })} autoFocus /></label>
                  <label>Meal type<select value={selectedMealType} onChange={(event) => setSelectedMealType(event.target.value)}><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snacks">Snacks</option></select></label>
                </div>
                <div className="food-confirm-macros"><span>{selectedFoodNutrition.calories} kcal</span><span>{selectedFoodNutrition.protein}g protein</span><span>{selectedFoodNutrition.carbs}g carbs</span><span>{selectedFoodNutrition.fat}g fat</span></div>
                <button type="button" className="btn-primary" onClick={addSelectedFood}>Add to diary</button>
              </div>
            )}

            {!showCustomFood && !selectedFood && (
              <div className="common-foods">
                <h4>Search 30,000+ foods and products</h4>
                <p className="food-catalogue-attribution">Search packaged snacks, drinks, and more from <a href="https://world.openfoodfacts.org/" target="_blank" rel="noreferrer">Open Food Facts</a>. Nutrition data is provided by contributors; check product labels when accuracy matters.</p>
                <form className="food-search-controls" onSubmit={(event) => { event.preventDefault(); searchOnlineFoods(foodSearch); }}>
                  <input
                    type="search"
                    value={foodSearch}
                    onChange={(event) => setFoodSearch(event.target.value)}
                    placeholder="Search products, snacks, drinks..."
                    aria-label="Search foods and products"
                  />
                  <button type="submit" className="btn-primary" disabled={foodSearch.trim().length < 2}>Search online</button>
                </form>
                <div className="food-category-shortcuts" aria-label="Popular food searches">
                  <button type="button" className="btn-secondary" onClick={() => searchOnlineFoods("snacks")}>Snacks</button>
                  <button type="button" className="btn-secondary" onClick={() => searchOnlineFoods("drinks")}>Drinks</button>
                </div>
                <h5>Offline quick picks</h5>
                <div className="foods-grid">
                  {deduplicateFoods(COMMON_FOODS).filter((food) => food.name.toLowerCase().includes(foodSearch.trim().toLowerCase())).slice(0, 60).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="food-button"
                    >
                      {food.name}
                      <br />
                      <small>{food.calories} kcal</small>
                    </button>
                  ))}
                </div>
                {onlineSearchQuery.trim().length >= 2 && foodSearch.trim() === onlineSearchQuery.trim() && (
                  <section className="online-food-results" aria-live="polite">
                    <h5>Online product results for “{onlineSearchQuery}”</h5>
                    {foodSearchLoading && <p role="status">Searching Open Food Facts...</p>}
                    {foodSearchError && <p className="food-search-error" role="alert">{foodSearchError}</p>}
                    {!foodSearchLoading && !foodSearchError && onlineFoods.length === 0 && <p>No products with nutrition data were found for that search.</p>}
                    <div className="foods-grid">
                      {onlineFoods.map((food) => (
                        <button key={getFoodIdentity(food)} onClick={() => selectFood(food)} className="food-button">
                          {food.name}
                          <br />
                          <small>{food.calories} kcal / 100{food.unit}</small>
                        </button>
                      ))}
                    </div>
                    {!foodSearchLoading && foodSearchTotal > 0 && (
                      <div className="food-pagination">
                        <span>Page {foodSearchPage} of {foodSearchPageCount || "?"} · {foodSearchTotal.toLocaleString()} matching products</span>
                        <div>
                          <button type="button" className="btn-secondary" onClick={() => { setFoodSearchLoading(true); setFoodSearchPage((page) => Math.max(1, page - 1)); }} disabled={foodSearchPage <= 1 || foodSearchLoading}>Previous</button>
                          <button type="button" className="btn-secondary" onClick={() => { setFoodSearchLoading(true); setFoodSearchPage((page) => page + 1); }} disabled={foodSearchPage >= foodSearchPageCount || foodSearchLoading}>Next</button>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        <div className="meals-list">
          {Object.entries(mealsByType).map(([mealType, mealsList]) => (
            <div key={mealType} className="meal-section">
              <h4 className="meal-type-title">
                {mealType === "breakfast" && "Breakfast"}
                {mealType === "lunch" && "Lunch"}
                {mealType === "dinner" && "Dinner"}
                {mealType === "snacks" && "Snacks"}
              </h4>
              {mealsList.length === 0 ? (
                <p className="no-meals">No meals logged</p>
              ) : (
                <div className="meals-cards">
                  {mealsList.map((meal) => (
                    <div key={meal.id} className="meal-card">
                      <div className="meal-info">
                        <h5>{meal.name}</h5>
                        <div className="meal-macros">
                          <span>{meal.calories} kcal{meal.quantity ? ` · ${meal.quantity}g` : ""}</span>
                          <span>{meal.protein.toFixed(1)}g protein</span>
                          <span>{meal.carbs.toFixed(1)}g carbs</span>
                          <span>{meal.fat.toFixed(1)}g fat</span>
                        </div>
                      </div>
                      <button onClick={() => editMeal(meal)} className="btn-secondary" type="button">Edit</button>
                      <button
                        onClick={() => removeMeal(meal.id)}
                        className="btn-remove"
                        aria-label="Remove meal"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
