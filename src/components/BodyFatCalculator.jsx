import { useState } from "react";
import "./BodyFatCalculator.css";

export default function BodyFatCalculator() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [unit, setUnit] = useState("cm");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const calculateBodyComposition = () => {
    const heightCm = unit === "in" ? Number(height) * 2.54 : Number(height);
    const weightKg = Number(weight);
    const waistCm = unit === "in" ? Number(waist) * 2.54 : Number(waist);
    const ageNum = Number(age);

    if (!heightCm || !weightKg || !waistCm || !ageNum) {
      setError("Please fill in all fields");
      return;
    }

    // BMI
    const bmi = weightKg / ((heightCm / 100) ** 2);

    // Body Fat % (US Navy Method - more accurate)
    let bodyFat = 0;
    if (gender === "male") {
      bodyFat = 86.010 * Math.log10(waistCm - 0.0001) - 70.041 * Math.log10(heightCm) + 36.76;
    } else {
      bodyFat = 163.205 * Math.log10(waistCm + 0.0001) - 97.684 * Math.log10(heightCm) - 78.387;
    }

    bodyFat = Math.max(5, Math.min(50, bodyFat.toFixed(1)));

    // Other estimates
    const fatMass = (bodyFat / 100) * weightKg;
    const leanMass = weightKg - fatMass;
    const waterPercent = gender === "male" ? 60 : 55;
    const waterKg = (waterPercent / 100) * weightKg;
    const visceralFat = Math.round((waistCm - 80) / 5);

    const newResults = {
      bmi: bmi.toFixed(1),
      bodyFat: bodyFat,
      fatMass: fatMass.toFixed(1),
      leanMass: leanMass.toFixed(1),
      waterPercent: waterPercent,
      waterKg: waterKg.toFixed(1),
      visceralFat: Math.max(1, visceralFat),
      musclePercent: (100 - bodyFat - 15).toFixed(1), // rough estimate
    };

    setResults(newResults);
    setError("");
  };

  const clearAll = () => {
    setHeight("");
    setWeight("");
    setWaist("");
    setAge("");
    setResults(null);
    setError("");
  };

  return (
    <div className="bodyfat-container">
      <div className="bodyfat-card">
        <h2>Body Composition Analyzer</h2>

        <div className="gender-selector">
          <button className={gender === "male" ? "active" : ""} onClick={() => setGender("male")}>Male</button>
          <button className={gender === "female" ? "active" : ""} onClick={() => setGender("female")}>Female</button>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" min="15" />
          </div>

          <div className="input-wrapper">
            <label>Height ({unit})</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" min="0" step="0.1" />
          </div>

          <div className="input-wrapper">
            <label>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" min="0" step="0.1" />
          </div>

          <div className="input-wrapper">
            <label>Waist Circumference ({unit})</label>
            <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="Waist" min="0" step="0.1" />
          </div>

          <div className="unit-selector">
            <button className={unit === "cm" ? "active" : ""} onClick={() => setUnit("cm")}>cm</button>
            <button className={unit === "in" ? "active" : ""} onClick={() => setUnit("in")}>inches</button>
          </div>

          <div className="button-group">
            <button className="btn-calculate" onClick={calculateBodyComposition}>Calculate</button>
            <button className="btn-clear" onClick={clearAll}>Clear</button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="result-container">
            <h3>Your Body Composition</h3>
            <div className="body-metrics-grid">
              <Metric label="BMI" value={results.bmi} status="High" />
              <Metric label="Body Fat %" value={results.bodyFat + "%"} status="High" />
              <Metric label="Fat Mass" value={results.fatMass + " kg"} />
              <Metric label="Lean Mass" value={results.leanMass + " kg"} />
              <Metric label="Water %" value={results.waterPercent + "%"} />
              <Metric label="Visceral Fat" value={results.visceralFat} status="High" />
              <Metric label="Muscle %" value={results.musclePercent + "%"} status="Healthy" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, status }) {
  return (
    <div className="metric-item">
      <span>{label}</span>
      <strong>{value}</strong>
      {status && <span className="status">{status}</span>}
    </div>
  );
}