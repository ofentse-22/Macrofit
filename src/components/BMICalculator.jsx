// src/components/BMICalculator.jsx
import { useState } from "react";
import "./BMICalculator.css";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");

  const calculateBMI = () => {
    let weightKg = weightUnit === "lb" ? Number(weight) * 0.453592 : Number(weight);
    let heightCm = heightUnit === "ft" ? Number(height) * 30.48 : Number(height);
    
    if (heightUnit === "in") {
      heightCm = Number(height) * 2.54;
    }

    if (!heightCm || !weightKg) return null;
    
    return weightKg / (heightCm / 100) ** 2;
  };

  const bmi = calculateBMI();

  const getCategory = (bmi) => {
    if (bmi === null) return "";
    if (bmi < 18.5) return { name: "Underweight", color: "#ffc107", range: "Below 18.5" };
    if (bmi < 25) return { name: "Normal weight", color: "#4caf50", range: "18.5 - 24.9" };
    if (bmi < 30) return { name: "Overweight", color: "#ff9800", range: "25 - 29.9" };
    return { name: "Obesity", color: "#f44336", range: "30 and above" };
  };

  const category = bmi !== null ? getCategory(bmi) : null;

  return (
    <div className="bmi-container">
      <div className="bmi-card">
        <h2>BMI Calculator</h2>
        
        <div className="input-group">
          <div className="input-wrapper">
            <label>Height</label>
            <div className="input-with-select">
              <input
                type="number"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="0"
              />
              <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)}>
                <option value="cm">cm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div className="input-wrapper">
            <label>Weight</label>
            <div className="input-with-select">
              <input
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
              />
              <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </div>

        {bmi !== null && (
          <div className="result-container">
            <div className="bmi-result">
              <div className="bmi-value">
                <span className="number">{bmi.toFixed(1)}</span>
                <span className="label">Your BMI</span>
              </div>
              <div 
                className="category-badge" 
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </div>
              <div className="bmi-range">Range: {category.range}</div>
            </div>

            <div className="bmi-scale">
              <div className="scale-bar">
                <div className="scale-segment underweight">Underweight</div>
                <div className="scale-segment normal">Normal</div>
                <div className="scale-segment overweight">Overweight</div>
                <div className="scale-segment obesity">Obesity</div>
              </div>
              <div 
                className="bmi-indicator" 
                style={{ 
                  left: `${Math.min((bmi / 40) * 100, 100)}%`,
                  backgroundColor: category.color
                }}
              >
                {bmi.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}