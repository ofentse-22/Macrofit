import { useEffect, useState } from 'react';

import Dashboard from './components/Dashboard';
import TrainingWorkspace from './components/TrainingWorkspace';
import NutritionTracker from './components/NutritionTracker';
import WeightTracker from './components/WeightTracker';
import BodyComposition from './components/BodyComposition';
import ProgressWorkspace from './components/ProgressWorkspace';
import AuthPanel from './components/AuthPanel';
import DataExport from './components/DataExport';
import SyncIndicator from './components/SyncIndicator';
import { flushQueue } from './services/offlineQueue';
import { nutritionService, weightService, workoutService } from './services/supabaseService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickTarget, setQuickTarget] = useState(null);
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    localStorage.setItem('fitlab-theme', 'dark');
  }, []);

  useEffect(() => {
    const sync = () => flushQueue({
      nutritionLog: (payload) => nutritionService.addLog(payload),
      nutritionLogUpdate: (payload) => nutritionService.updateLog(payload.id, payload.updates),
      nutritionLogDelete: (payload) => nutritionService.deleteLog(payload.id),
      weightLog: (payload) => weightService.addLog(payload.weight, payload.date, payload.notes),
      weightLogUpdate: (payload) => weightService.updateLog(payload.id, payload.updates),
      weightLogDelete: (payload) => weightService.deleteLog(payload.id),
      workoutSet: (payload) => workoutService.completeSet(payload.id, payload.completedAt),
      workoutUpdate: (payload) => workoutService.updateWorkout(payload.id, payload.updates),
      workoutDelete: (payload) => workoutService.deleteWorkout(payload.id),
    });
    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, []);

  const tabs = [
    ['dashboard', 'Home'],
    ['training', 'Training'],
    ['health', 'Nutrition'],
    ['progress', 'Progress'],
    ['account', 'Profile'],
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>MacroFit</h1>
            <p>Training and nutrition, in one place.</p>
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

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'training' && <TrainingWorkspace />}
        {activeTab === 'progress' && <ProgressWorkspace onNavigate={setActiveTab} />}
        {activeTab === 'health' && <div className="workspace-stack"><NutritionTracker autoOpen={quickTarget === 'food'} /><WeightTracker autoOpen={quickTarget === 'weight'} /><BodyComposition /></div>}
        {activeTab === 'account' && <div className="workspace-stack"><AuthPanel /><DataExport /></div>}
        {activeTab === 'export' && <div className="workspace-stack"><AuthPanel /><DataExport /></div>}
      </main>

      <SyncIndicator />

      {quickActionsOpen && <div className="quick-action-menu" role="menu"><button type="button" onClick={() => { setQuickTarget(null); setActiveTab('training'); setQuickActionsOpen(false); }}>Log Workout</button><button type="button" onClick={() => { setQuickTarget('food'); setActiveTab('health'); setQuickActionsOpen(false); }}>Log Food</button><button type="button" onClick={() => { setQuickTarget('weight'); setActiveTab('health'); setQuickActionsOpen(false); }}>Log Weight</button></div>}
      <button className="quick-action" type="button" onClick={() => setQuickActionsOpen((open) => !open)} aria-label="Open quick actions" aria-expanded={quickActionsOpen}>
        <span aria-hidden="true">+</span>
        <span>{quickActionsOpen ? "Close" : "Log activity"}</span>
      </button>

      <footer className="app-footer">
        <p>MacroFit · Training and nutrition tracking</p>
      </footer>
    </div>
  );
}

export default App;
