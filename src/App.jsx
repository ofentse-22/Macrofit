import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import WorkoutHistory from './components/WorkoutHistory';
import WorkoutTemplates from './components/WorkoutTemplates';
import ExerciseLibrary from './components/ExerciseLibrary';
import BodyComposition from './components/BodyComposition';
import AuthPanel from './components/AuthPanel';
import DataExport from './components/DataExport';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    return window.localStorage.getItem('fit-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('fit-theme', theme);
  }, [theme]);

  const tabs = [
    ['dashboard', 'Dashboard'],
    ['workout', 'Workout'],
    ['history', 'History'],
    ['templates', 'Templates'],
    ['library', 'Exercise library'],
    ['bodycomp', 'Body Composition'],
    ['account', 'Account'],
    ['export', 'Export'],
  ];

  return (
    <div className={`app theme-${theme}`}>
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>FitLab</h1>
            <p>Your personal fitness companion</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            type="button"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? 'active' : ''}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'workout' && <WorkoutTracker />}
        {activeTab === 'history' && <WorkoutHistory />}
        {activeTab === 'templates' && <WorkoutTemplates />}
        {activeTab === 'library' && <ExerciseLibrary />}
        {activeTab === 'bodycomp' && <BodyComposition />}

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