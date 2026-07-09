// src/components/BodyFatCalculator.jsx
import { useState } from "react";
import "./BodyFatCalculator.css";

export default function BodyFatCalculator() {
  const [gender, setGender] = useState("male");
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState("cm");
  const [error, setError] = useState("");
  const [bodyFat, setBodyFat] = useState(null);
  const [category, setCategory] = useState(null);

  // Pure function - no side effects
  const calculateBodyFat = (waistVal, heightVal, genderVal, unitVal) => {
    const waistNum = parseFloat(waistVal);
    const heightNum = parseFloat(heightVal);
    
    if (!waistNum || !heightNum) {
      return { error: "Please fill in all required fields" };
    }

    if (waistNum <= 0 || heightNum <= 0) {
      return { error: "All measurements must be greater than 0" };
    }

    let waistCm = unitVal === "in" ? waistNum * 2.54 : waistNum;
    let heightCm = unitVal === "in" ? heightNum * 2.54 : heightNum;

    let bodyFatResult = 0;

    try {
      if (genderVal === "male") {
        bodyFatResult = 64 - 20 * (heightCm / waistCm);
      } else {
        bodyFatResult = 76 - 20 * (heightCm / waistCm);
      }
    } catch (err) {
      return { error: "Error calculating body fat. Please check your measurements." };
    }

    if (isNaN(bodyFatResult) || !isFinite(bodyFatResult)) {
      return { error: "Invalid measurements. Please check your inputs." };
    }

    if (bodyFatResult < 1) bodyFatResult = 1;
    if (bodyFatResult > 70) bodyFatResult = 70;

    return { result: Math.round(bodyFatResult * 10) / 10 };
  };

  // Pure function to get category
  const getBodyFatCategory = (bf, genderVal) => {
    if (bf === null) return null;
    
    if (genderVal === "male") {
      if (bf < 6) return { 
        name: "Essential Fat", 
        range: "2-5%", 
        description: "Essential for survival. Only seen in elite athletes.",
        color: "#4CAF50"
      };
      if (bf < 14) return { 
        name: "Athletic", 
        range: "6-13%", 
        description: "Common in fitness enthusiasts and athletes.",
        color: "#2196F3"
      };
      if (bf < 18) return { 
        name: "Fitness", 
        range: "14-17%", 
        description: "Good fitness level with visible muscle definition.",
        color: "#FF9800"
      };
      if (bf < 25) return { 
        name: "Average", 
        range: "18-24%", 
        description: "Average body fat percentage for men.",
        color: "#FF5722"
      };
      return { 
        name: "High", 
        range: "25%+", 
        description: "Consider lifestyle changes to reduce body fat.",
        color: "#F44336"
      };
    } else {
      if (bf < 14) return { 
        name: "Essential Fat", 
        range: "10-13%", 
        description: "Essential for survival. Only seen in elite athletes.",
        color: "#4CAF50"
      };
      if (bf < 21) return { 
        name: "Athletic", 
        range: "14-20%", 
        description: "Common in fitness enthusiasts and athletes.",
        color: "#2196F3"
      };
      if (bf < 25) return { 
        name: "Fitness", 
        range: "21-24%", 
        description: "Good fitness level with visible muscle definition.",
        color: "#FF9800"
      };
      if (bf < 32) return { 
        name: "Average", 
        range: "25-31%", 
        description: "Average body fat percentage for women.",
        color: "#FF5722"
      };
      return { 
        name: "High", 
        range: "32%+", 
        description: "Consider lifestyle changes to reduce body fat.",
        color: "#F44336"
      };
    }
  };

  const handleCalculate = () => {
    const result = calculateBodyFat(waist, height, gender, unit);
    
    if (result.error) {
      setError(result.error);
      setBodyFat(null);
      setCategory(null);
    } else {
      setError("");
      setBodyFat(result.result);
      // Calculate category here, not during render
      const categoryResult = getBodyFatCategory(result.result, gender);
      setCategory(categoryResult);
    }
  };

  const handleClear = () => {
    setWaist("");
    setHeight("");
    setError("");
    setBodyFat(null);
    setCategory(null);
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setError("");
    setBodyFat(null);
    setCategory(null);
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setError("");
    setBodyFat(null);
    setCategory(null);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setBodyFat(null);
    setCategory(null);
  };

  return (
    <div className="bodyfat-container">
      <div className="bodyfat-card">
        <h2>Body Fat Calculator</h2>
        
        <div className="gender-selector">
          <button 
            className={gender === "male" ? "active" : ""}
            onClick={() => handleGenderChange("male")}
          >
            Male
          </button>
          <button 
            className={gender === "female" ? "active" : ""}
            onClick={() => handleGenderChange("female")}
          >
            Female
          </button>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <label>Waist Circumference *</label>
            <input
              type="number"
              placeholder={`Enter waist measurement (${unit})`}
              value={waist}
              onChange={handleInputChange(setWaist)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="input-wrapper">
            <label>Height *</label>
            <input
              type="number"
              placeholder={`Enter height (${unit})`}
              value={height}
              onChange={handleInputChange(setHeight)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="unit-selector">
            <span className="unit-label">Units:</span>
            <button 
              className={unit === "cm" ? "active" : ""}
              onClick={() => handleUnitChange("cm")}
            >
              cm
            </button>
            <button 
              className={unit === "in" ? "active" : ""}
              onClick={() => handleUnitChange("in")}
            >
              inches
            </button>
          </div>

          <div className="button-group">
            <button className="btn-calculate" onClick={handleCalculate}>
              Calculate Body Fat
            </button>
            <button className="btn-clear" onClick={handleClear}>
              Clear All
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {bodyFat !== null && category && (
          <div className="result-container">
            <div className="bf-result">
              <div className="bf-value" style={{ color: category.color }}>
                <span className="number">{bodyFat}%</span>
                <span className="label">Body Fat Percentage</span>
              </div>
              <div className="bf-details">
                <div className="category-badge" style={{ backgroundColor: category.color }}>
                  {category.name}
                </div>
                <p>Healthy Range: <strong>{category.range}</strong></p>
                <p className="category-description">{category.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="info-section">
          <h4>How to Measure</h4>
          <ul>
            <li><strong>Waist:</strong> Measure at the narrowest point (for men) or at the navel (for women)</li>
            <li><strong>Height:</strong> Measure without shoes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
