// src/App.jsx
import { useState } from 'react';
import BMICalculator from './components/BMICalculator';
import BodyFatCalculator from './components/BodyFatCalculator';
import WorkoutTracker from './components/WorkoutTracker';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('bmi');

  return (
    <div className="app">
      <header className="app-header">
        <h1>💪 FitTrack</h1>
        <p>Your Complete Fitness Companion</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'bmi' ? 'active' : ''}
          onClick={() => setActiveTab('bmi')}
        >
          BMI Calculator
        </button>
        <button 
          className={activeTab === 'bodyfat' ? 'active' : ''}
          onClick={() => setActiveTab('bodyfat')}
        >
          Body Fat
        </button>
        <button 
          className={activeTab === 'workout' ? 'active' : ''}
          onClick={() => setActiveTab('workout')}
        >
          Workout Tracker
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'bmi' && <BMICalculator />}
        {activeTab === 'bodyfat' && <BodyFatCalculator />}
        {activeTab === 'workout' && <WorkoutTracker />}
      </main>

      <footer className="app-footer">
        <p>© 2026 FitTrack - Your Fitness Journey Starts Here</p>
      </footer>
    </div>
  );
}

export default App;