import { useState } from 'react';
import BMICalculator from './components/BMICalculator';
import BodyFatCalculator from './components/BodyFatCalculator';
import WorkoutTracker from './components/WorkoutTracker';
import Dashboard from './components/Dashboard';
import AuthPanel from './components/AuthPanel';
import WorkoutTemplates from './components/WorkoutTemplates';
import ExerciseLibrary from './components/ExerciseLibrary';
import DataExport from './components/DataExport';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const tabs = [
    ['dashboard', 'Dashboard'], ['workout', 'Workout'], ['templates', 'Templates'],
    ['library', 'Exercise library'], ['bmi', 'BMI'], ['bodyfat', 'Body fat'], ['account', 'Account'], ['export', 'Export'],
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>FitTrack</h1>
        <p>Your personal fitness companion</p>
      </header>

      <nav className="app-nav">
        {tabs.map(([id, label]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}</button>)}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'bmi' && <BMICalculator />}
        {activeTab === 'bodyfat' && <BodyFatCalculator />}
        {activeTab === 'workout' && <WorkoutTracker />}
        {activeTab === 'templates' && <WorkoutTemplates />}
        {activeTab === 'library' && <ExerciseLibrary />}
        {activeTab === 'account' && <AuthPanel />}
        {activeTab === 'export' && <DataExport />}
      </main>

      <footer className="app-footer">
        <p>2026 FitTrack. Build strength, track progress, stay consistent.</p>
      </footer>
    </div>
  );
}

export default App;
