import { useState, useEffect } from "react";
import "./NutritionTracker.css";

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
];

function getDataSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getMacroGoals() {
  try {
    return JSON.parse(localStorage.getItem("nutritionGoals") || "{}");
  } catch {
    return {};
  }
}

function MacroBar({ label, consumed, goal, color }) {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

  return (
    <div className="macro-bar">
      <div className="macro-label">
        <span>{label}</span>
        <span className="macro-value">{consumed.toFixed(0)} / {goal} {label === "Calories" ? "kcal" : label === "Protein" ? "g" : label === "Carbs" ? "g" : "g"}</span>
      </div>
      <div className="macro-progress" style={{ "--bar-color": color }}>
        <div className="macro-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function NutritionCard({ title, emoji, value, unit, color }) {
  return (
    <div className="nutrition-card" style={{ borderLeftColor: color }}>
      <div className="nutrition-card-header">
        <span className="nutrition-emoji">{emoji}</span>
        <span className="nutrition-title">{title}</span>
      </div>
      <div className="nutrition-value">
        {value}
        <span className="nutrition-unit">{unit}</span>
      </div>
    </div>
  );
}

export default function NutritionTracker() {
  const [meals, setMeals] = useState(() => {
    const today = getTodayDate();
    const saved = getDataSaved("nutritionLog");
    return saved.filter((meal) => meal.date === today);
  });

  const [macroGoals, setMacroGoals] = useState(getMacroGoals);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState(macroGoals);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });

  useEffect(() => {
    const today = getTodayDate();
    const allNutrition = getDataSaved("nutritionLog");
    setMeals(allNutrition.filter((meal) => meal.date === today));
  }, []);

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
    calories: Math.max(0, goals.calories - totals.calories),
    protein: Math.max(0, goals.protein - totals.protein),
    carbs: Math.max(0, goals.carbs - totals.carbs),
    fat: Math.max(0, goals.fat - totals.fat),
  };

  const mealsByType = {
    breakfast: meals.filter((m) => m.mealType === "breakfast"),
    lunch: meals.filter((m) => m.mealType === "lunch"),
    dinner: meals.filter((m) => m.mealType === "dinner"),
    snacks: meals.filter((m) => m.mealType === "snacks"),
  };

  const saveMacroGoals = (e) => {
    e.preventDefault();
    const newGoals = {
      calories: Number(goalForm.calories) || 2500,
      protein: Number(goalForm.protein) || 150,
      carbs: Number(goalForm.carbs) || 300,
      fat: Number(goalForm.fat) || 70,
    };
    setMacroGoals(newGoals);
    localStorage.setItem("nutritionGoals", JSON.stringify(newGoals));
    setShowGoalForm(false);
  };

  const addFood = (food) => {
    const today = getTodayDate();
    const allNutrition = getDataSaved("nutritionLog");
    const newMeal = {
      id: `${Date.now()}`,
      date: today,
      mealType: selectedMealType,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      addedAt: new Date().toISOString(),
    };

    const updatedNutrition = [newMeal, ...allNutrition];
    localStorage.setItem("nutritionLog", JSON.stringify(updatedNutrition));
    setMeals((current) => [newMeal, ...current]);
    setShowAddMeal(false);
  };

  const addCustomFood = (e) => {
    e.preventDefault();
    if (!customFood.name.trim() || !customFood.calories) return;

    const newFood = {
      name: customFood.name.trim(),
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
    };

    addFood(newFood);
    setCustomFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowCustomFood(false);
  };

  const removeMeal = (id) => {
    const allNutrition = getDataSaved("nutritionLog");
    const updated = allNutrition.filter((meal) => meal.id !== id);
    localStorage.setItem("nutritionLog", JSON.stringify(updated));
    setMeals((current) => current.filter((meal) => meal.id !== id));
  };

  const clearToday = () => {
    if (!window.confirm("Clear all meals for today?")) return;
    const allNutrition = getDataSaved("nutritionLog");
    const today = getTodayDate();
    const updated = allNutrition.filter((meal) => meal.date !== today);
    localStorage.setItem("nutritionLog", JSON.stringify(updated));
    setMeals([]);
  };

  return (
    <div className="nutrition-container">
      <div className="nutrition-header">
        <h2>Nutrition Tracker</h2>
        <div className="nutrition-header-buttons">
          <button onClick={() => setShowGoalForm(!showGoalForm)} className="btn-secondary">
            {showGoalForm ? "Cancel" : "Set Goals"}
          </button>
          <button onClick={clearToday} className="btn-danger">
            Clear Day
          </button>
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

      <div className="nutrition-summary">
        <div className="summary-section">
          <h3>Today's Goal</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" emoji="" value={goals.calories} unit="kcal" color="#ef4444" />
            <NutritionCard title="Protein" emoji="" value={goals.protein} unit="g" color="#f97316" />
            <NutritionCard title="Carbs" emoji="" value={goals.carbs} unit="g" color="#eab308" />
            <NutritionCard title="Fat" emoji="" value={goals.fat} unit="g" color="#22c55e" />
          </div>
        </div>

        <div className="summary-section">
          <h3>Consumed</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" emoji="" value={totals.calories.toFixed(0)} unit="kcal" color="#ef4444" />
            <NutritionCard title="Protein" emoji="" value={totals.protein.toFixed(0)} unit="g" color="#f97316" />
            <NutritionCard title="Carbs" emoji="" value={totals.carbs.toFixed(0)} unit="g" color="#eab308" />
            <NutritionCard title="Fat" emoji="" value={totals.fat.toFixed(0)} unit="g" color="#22c55e" />
          </div>
        </div>

        <div className="summary-section remaining">
          <h3>Remaining</h3>
          <div className="cards-grid">
            <NutritionCard title="Calories" emoji="" value={remaining.calories.toFixed(0)} unit="kcal" color="#ef4444" />
            <NutritionCard title="Protein" emoji="" value={remaining.protein.toFixed(0)} unit="g" color="#f97316" />
            <NutritionCard title="Carbs" emoji="" value={remaining.carbs.toFixed(0)} unit="g" color="#eab308" />
            <NutritionCard title="Fat" emoji="" value={remaining.fat.toFixed(0)} unit="g" color="#22c55e" />
          </div>
        </div>
      </div>

      <div className="macro-progress">
        <h3>Progress</h3>
        <MacroBar label="Calories" consumed={totals.calories} goal={goals.calories} color="#ef4444" />
        <MacroBar label="Protein" consumed={totals.protein} goal={goals.protein} color="#f97316" />
        <MacroBar label="Carbs" consumed={totals.carbs} goal={goals.carbs} color="#eab308" />
        <MacroBar label="Fat" consumed={totals.fat} goal={goals.fat} color="#22c55e" />
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
                onClick={() => setShowCustomFood(!showCustomFood)}
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
                <div className="form-grid">
                  <div className="form-group">
                    <label>Calories</label>
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
                    <label>Protein (g)</label>
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
                    <label>Carbs (g)</label>
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
                    <label>Fat (g)</label>
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
                <button type="submit" className="btn-primary">Add Custom Food</button>
              </form>
            )}

            {!showCustomFood && (
              <div className="common-foods">
                <h4>Common Foods</h4>
                <div className="foods-grid">
                  {COMMON_FOODS.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => addFood(food)}
                      className="food-button"
                    >
                      {food.name}
                      <br />
                      <small>{food.calories} kcal</small>
                    </button>
                  ))}
                </div>
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
                          <span>{meal.calories} cal</span>
                          <span>{meal.protein.toFixed(1)}g protein</span>
                          <span>{meal.carbs.toFixed(1)}g carbs</span>
                          <span>{meal.fat.toFixed(1)}g fat</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMeal(meal.id)}
                        className="btn-remove"
                        aria-label="Remove meal"
                      >
                        ✕
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
