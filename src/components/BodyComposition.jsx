import { useState } from "react";
import "./BMICalculator.css";

export default function BodyComposition() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("cm");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

    const calculate = () => {
  const h = Number(height);
  const w = Number(weight);
  const ageNum = Number(age);

  if (!h || !w || !ageNum) {
    setError("Please fill all required fields.");
    return;
  }

  const heightCm = unit === "in" ? h * 2.54 : h;
  const heightM = heightCm / 100;

  // BMI
  const bmi = w / (heightM * heightM);

  let bmiCategory = "";

  if (bmi < 18.5)
    bmiCategory = "Underweight";
  else if (bmi < 25)
    bmiCategory = "Healthy";
  else if (bmi < 30)
    bmiCategory = "Overweight";
  else
    bmiCategory = "Obese";

  // Body Fat %
  let bodyFat =
    1.2 * bmi +
    0.23 * ageNum -
    (gender === "male" ? 16.2 : 5.4);

  bodyFat = Math.max(3, Math.min(bodyFat, 60));

  let bodyFatCategory = "";

  if (gender === "male") {

    if (bodyFat < 6)
      bodyFatCategory = "Essential";

    else if (bodyFat < 14)
      bodyFatCategory = "Athlete";

    else if (bodyFat < 18)
      bodyFatCategory = "Fitness";

    else if (bodyFat < 25)
      bodyFatCategory = "Average";

    else
      bodyFatCategory = "Obese";

  } else {

    if (bodyFat < 14)
      bodyFatCategory = "Essential";

    else if (bodyFat < 21)
      bodyFatCategory = "Athlete";

    else if (bodyFat < 25)
      bodyFatCategory = "Fitness";

    else if (bodyFat < 32)
      bodyFatCategory = "Average";

    else
      bodyFatCategory = "Obese";

  }

  // Lean Mass
  const leanMass = w * (1 - bodyFat / 100);

  // Fat Mass
  const fatMass = w - leanMass;

  // Muscle %
  const musclePercent = 100 - bodyFat - 15;

  // Water %
  const waterPercent =
    gender === "male"
      ? 60
      : 55;

  // BMR
  let bmr;

  if (gender === "male") {

    bmr =
      10 * w +
      6.25 * heightCm -
      5 * ageNum +
      5;

  } else {

    bmr =
      10 * w +
      6.25 * heightCm -
      5 * ageNum -
      161;

  }

  // Maintenance Calories
  const maintenanceCalories =
    Math.round(bmr * Number(activityLevel));

  // Targets
  const lose05 =
    maintenanceCalories - 500;

  const lose1 =
    maintenanceCalories - 1000;

  const gain025 =
    maintenanceCalories + 250;

  const gain05 =
    maintenanceCalories + 500;

  setResults({

    bmi: bmi.toFixed(1),

    bmiCategory,

    bodyFat: bodyFat.toFixed(1),

    bodyFatCategory,

    leanMass: leanMass.toFixed(1),

    fatMass: fatMass.toFixed(1),

    musclePercent: musclePercent.toFixed(1),

    waterPercent,

    metabolism: Math.round(bmr),

    maintenance: maintenanceCalories,

    lose05,

    lose1,

    gain025,

    gain05

  });

  setError("");
};


  const saveResults = () => {
    if (!results) return;

    const history = JSON.parse(localStorage.getItem("bodyCompositionHistory") || "[]");
    const newEntry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...results,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("bodyCompositionHistory", JSON.stringify([newEntry, ...history]));
    alert("Body Composition saved successfully!");
  };

  const clear = () => {
    setHeight("");
    setWeight("");
    setAge("");
    setResults(null);
    setError("");
  };

    return (
    <div className="bmi-container">
      <div className="bmi-card">
        <h2>Body Composition Analyzer</h2>

        <div className="gender-selector">
          <button className={gender === "male" ? "active" : ""} onClick={() => setGender("male")}>Male</button>
          <button className={gender === "female" ? "active" : ""} onClick={() => setGender("female")}>Female</button>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <label>Age (years)</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" min="15" />
          </div>

          <div className="input-wrapper">
            <label>Height ({unit})</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" min="0" step="0.1" />
          </div>

          <div className="input-wrapper">
            <label>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" min="0" step="0.1" />
          </div>
          

          <div className="input-wrapper">
         <label>Activity Level</label>

    <select
    value={activityLevel}
    onChange={(e) => setActivityLevel(e.target.value)}
  >
    <option value="1.2">Sedentary</option>
    <option value="1.375">Light Exercise</option>
    <option value="1.55">Moderate Exercise</option>
    <option value="1.725">Very Active</option>
    <option value="1.9">Athlete</option>
  </select>
</div>

          <div className="unit-selector">
            <button className={unit === "cm" ? "active" : ""} onClick={() => setUnit("cm")}>cm</button>
            <button className={unit === "in" ? "active" : ""} onClick={() => setUnit("in")}>inches</button>
          </div>

          <div className="button-group">
            <button className="btn-calculate" onClick={calculate}>Calculate</button>
            <button className="btn-clear" onClick={clear}>Clear All</button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="result-container">
            <h3>Your Body Composition Results</h3>
            <div className="body-metrics-grid">
              <Metric label="BMI" value={results.bmi} />
              <Metric label="BMI Status" value={results.bmiCategory} />
              <Metric label="Body Fat" value={`${results.bodyFat}%`} />
              <Metric label="Body Fat Status" value={results.bodyFatCategory} />
              <Metric label="BMR" value={`${results.metabolism} kcal/day`} />
              <Metric label="Maintenance" value={`${results.maintenance} kcal/day`} />
              <Metric label="Lose 0.5kg/week" value={`${results.lose05} kcal/day`} />
              <Metric label="Lose 1kg/week" value={`${results.lose1} kcal/day`} />
              <Metric label="Gain 0.25kg/week" value={`${results.gain025} kcal/day`} />
              <Metric label="Gain 0.5kg/week" value={`${results.gain05} kcal/day`} />
            </div>

            <p className="estimate-note">
              These values are estimates based on common formulas and are not a real body composition scan.
            </p>

            <button className="primary-button" onClick={saveResults} style={{ marginTop: "20px" }}>
              Save Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
