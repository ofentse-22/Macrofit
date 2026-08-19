import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import WorkoutHistory from './components/WorkoutHistory';
import WorkoutTemplates from './components/WorkoutTemplates';
import ExerciseLibrary from './components/ExerciseLibrary';
import BodyComposition from './components/BodyComposition';
import NutritionTracker from './components/NutritionTracker';
import WeightTracker from './components/WeightTracker';
import ProgressiveOverload from './components/ProgressiveOverload';
import PersonalRecords from './components/PersonalRecords';
import WorkoutCalendar from './components/WorkoutCalendar';
import WorkoutGenerator from './components/WorkoutGenerator';
import Gamification from './components/Gamification';
import Analytics from './components/Analytics';
import AuthPanel from './components/AuthPanel';
import DataExport from './components/DataExport';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('fitlab-theme') || 'dark');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log("Current logged in user:", data.user);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fitlab-theme', theme);
  }, [theme]);

  const tabs = [
    ['dashboard', 'Dashboard'],
    ['workout', 'Workout'],
    ['history', 'History'],
    ['progress', 'Progress & Records'],
    ['calendar', 'Calendar'],
    ['templates', 'Templates'],
    ['library', 'Exercise library'],
    ['bodycomp', 'Body Composition'],
    ['nutrition', 'Nutrition'],
    ['weight', 'Weight Tracker'],
    ['generator', 'Workout Generator'],
    ['analytics', 'Analytics'],
    ['account', 'Account'],
    ['export', 'Export'],
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>FitLab</h1>
            <p>Your personal fitness companion</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'light'}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>

      <nav className="app-nav" aria-label="Primary navigation">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? 'active' : ''}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'workout' && <WorkoutTracker />}
        {activeTab === 'history' && <WorkoutHistory />}
        {activeTab === 'progress' && <><ProgressiveOverload /><PersonalRecords /><Gamification /></>}
        {activeTab === 'calendar' && <WorkoutCalendar />}
        {activeTab === 'templates' && <WorkoutTemplates />}
        {activeTab === 'library' && <ExerciseLibrary />}
        {activeTab === 'bodycomp' && <BodyComposition />}
        {activeTab === 'nutrition' && <NutritionTracker />}
        {activeTab === 'weight' && <WeightTracker />}
        {activeTab === 'generator' && <WorkoutGenerator />}
        {activeTab === 'analytics' && <Analytics />}
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
