import { useEffect, useState } from 'react';

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
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickTarget, setQuickTarget] = useState(null);
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    localStorage.setItem('fitlab-theme', 'dark');
  }, []);

  const tabs = [
    ['dashboard', 'Home'],
    ['training', 'Training'],
    ['health', 'Nutrition'],
    ['progress', 'Progress'],
    ['account', 'Profile'],
  ];

  const secondaryTabs = [
    ['plan', 'Plan'],
    ['library', 'Exercise Library'],
    ['export', 'Account & Export'],
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>FitLab</h1>
            <p>Your personal fitness companion</p>
          </div>
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

      <nav className="secondary-nav" aria-label="Secondary navigation">
        {secondaryTabs.map(([id, label]) => (
          <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'training' && <div className="workspace-stack"><WorkoutTracker /><WorkoutHistory /><WorkoutCalendar /></div>}
        {activeTab === 'progress' && <div className="workspace-stack"><Analytics /><ProgressiveOverload /><PersonalRecords /><Gamification /></div>}
        {activeTab === 'plan' && <div className="workspace-stack"><WorkoutGenerator /><WorkoutTemplates /></div>}
        {activeTab === 'library' && <ExerciseLibrary />}
        {activeTab === 'health' && <div className="workspace-stack"><NutritionTracker autoOpen={quickTarget === 'food'} /><WeightTracker autoOpen={quickTarget === 'weight'} /><BodyComposition /></div>}
        {activeTab === 'account' && <div className="workspace-stack"><AuthPanel /><DataExport /></div>}
        {activeTab === 'export' && <div className="workspace-stack"><AuthPanel /><DataExport /></div>}
      </main>

      {quickActionsOpen && <div className="quick-action-menu" role="menu"><button type="button" onClick={() => { setQuickTarget(null); setActiveTab('training'); setQuickActionsOpen(false); }}>Log Workout</button><button type="button" onClick={() => { setQuickTarget('food'); setActiveTab('health'); setQuickActionsOpen(false); }}>Log Food</button><button type="button" onClick={() => { setQuickTarget('weight'); setActiveTab('health'); setQuickActionsOpen(false); }}>Log Weight</button></div>}
      <button className="quick-action" type="button" onClick={() => setQuickActionsOpen((open) => !open)} aria-label="Open quick actions" aria-expanded={quickActionsOpen}>
        <span aria-hidden="true">+</span>
        <span>{quickActionsOpen ? "Close" : "Log activity"}</span>
      </button>

      <footer className="app-footer">
        <p>2026 FitTrack. Build strength, track progress, stay consistent.</p>
      </footer>
    </div>
  );
}

export default App;
