import { useState, useEffect } from 'react';
import './WorkoutGenerator.css';

export default function WorkoutGenerator() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    goal: 'muscle',
    experience: 'intermediate',
    equipment: 'full',
    frequency: 4,
    duration: 'moderate',
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    setSavedPlans(saved);
  }, []);

  const workoutTemplates = {
    muscle: {
      full: {
        3: [
          {
            name: 'Full Body Day 1',
            focus: 'Upper + Lower',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Barbell Rows', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Leg Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Flyes', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Leg Curls', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Full Body Day 2',
            focus: 'Upper + Lower',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Cable Chest Flyes', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Leg Extensions', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Full Body Day 3',
            focus: 'Upper + Lower',
            exercises: [
              { name: 'Dumbbell Bench Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Barbell Deadlift', sets: 3, reps: '5-6', rest: 120 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Machine Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: 45 },
              { name: 'Walking Lunges', sets: 3, reps: '8-10', rest: 60 },
            ],
          },
        ],
        4: [
          {
            name: 'Upper Power',
            focus: 'Chest & Back',
            exercises: [
              { name: 'Barbell Bench Press', sets: 5, reps: '3-5', rest: 120 },
              { name: 'Barbell Rows', sets: 5, reps: '3-5', rest: 120 },
              { name: 'Incline Dumbbell Press', sets: 3, reps: '6-8', rest: 90 },
              { name: 'Lat Pulldowns', sets: 3, reps: '8-10', rest: 60 },
            ],
          },
          {
            name: 'Lower Power',
            focus: 'Legs',
            exercises: [
              { name: 'Barbell Squats', sets: 5, reps: '3-5', rest: 120 },
              { name: 'Barbell Deadlifts', sets: 3, reps: '3-5', rest: 120 },
              { name: 'Leg Press', sets: 3, reps: '6-8', rest: 90 },
              { name: 'Leg Curls', sets: 3, reps: '8-10', rest: 60 },
            ],
          },
          {
            name: 'Upper Hypertrophy',
            focus: 'Shoulders & Arms',
            exercises: [
              { name: 'Dumbbell Incline Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Weighted Pull-ups', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Barbell Overhead Press', sets: 3, reps: '6-8', rest: 90 },
              { name: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Barbell Curls', sets: 3, reps: '8-10', rest: 60 },
              { name: 'Tricep Dips', sets: 3, reps: '8-10', rest: 60 },
            ],
          },
          {
            name: 'Lower Hypertrophy',
            focus: 'Quad & Ham Focus',
            exercises: [
              { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12', rest: 90 },
              { name: 'Leg Curls', sets: 4, reps: '10-12', rest: 60 },
              { name: 'Leg Extensions', sets: 3, reps: '12-15', rest: 60 },
              { name: 'Calf Raises', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
        ],
        5: [
          {
            name: 'Chest Day',
            focus: 'Pectorals',
            exercises: [
              { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Flyes', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Cable Crossovers', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Back Day',
            focus: 'Lats & Rhomboids',
            exercises: [
              { name: 'Barbell Rows', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Face Pulls', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Leg Day',
            focus: 'Quads & Hamstrings',
            exercises: [
              { name: 'Barbell Squats', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Romanian Deadlifts', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Leg Press', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Leg Curls', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Shoulders & Arms',
            focus: 'Delts & Biceps',
            exercises: [
              { name: 'Barbell Overhead Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Lateral Raises', sets: 4, reps: '10-12', rest: 60 },
              { name: 'Barbell Curls', sets: 3, reps: '8-10', rest: 60 },
              { name: 'Overhead Tricep Extensions', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Accessory Day',
            focus: 'Weak Points & Conditioning',
            exercises: [
              { name: 'Machine Chest Press', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Machine Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Leg Extensions', sets: 3, reps: '12-15', rest: 45 },
              { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
        ],
        6: [
          {
            name: 'Chest & Triceps',
            focus: 'Push Movement',
            exercises: [
              { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Tricep Dips', sets: 3, reps: '8-10', rest: 60 },
              { name: 'Rope Pushdowns', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Back & Biceps',
            focus: 'Pull Movement',
            exercises: [
              { name: 'Barbell Rows', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Weighted Pull-ups', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Barbell Curls', sets: 3, reps: '8-10', rest: 60 },
              { name: 'Cable Curls', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Legs (Quad Focus)',
            focus: 'Lower Body 1',
            exercises: [
              { name: 'Barbell Squats', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Leg Press', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Leg Extensions', sets: 3, reps: '12-15', rest: 60 },
              { name: 'Leg Curls', sets: 2, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Shoulders & Accessory',
            focus: 'Overhead Press',
            exercises: [
              { name: 'Barbell Overhead Press', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Lateral Raises', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Rear Delt Flyes', sets: 3, reps: '12-15', rest: 45 },
              { name: 'Machine Rows', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Legs (Ham Focus)',
            focus: 'Lower Body 2',
            exercises: [
              { name: 'Romanian Deadlifts', sets: 4, reps: '6-8', rest: 90 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Leg Curls', sets: 4, reps: '10-12', rest: 60 },
              { name: 'Calf Raises', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Full Body Finisher',
            focus: 'Conditioning',
            exercises: [
              { name: 'Deadlifts', sets: 3, reps: '3-5', rest: 120 },
              { name: 'Machine Chest Press', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Cable Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Leg Press', sets: 2, reps: '15-20', rest: 45 },
            ],
          },
        ],
      },
      dumbbells: {
        3: [
          {
            name: 'Full Body Day 1',
            focus: 'Upper & Lower',
            exercises: [
              { name: 'Dumbbell Bench Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Rows', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Goblet Squats', sets: 4, reps: '10-12', rest: 90 },
              { name: 'Dumbbell Flyes', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Single-Arm Rows', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Full Body Day 2',
            focus: 'Shoulders & Legs',
            exercises: [
              { name: 'Dumbbell Overhead Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Deadlifts', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12', rest: 90 },
              { name: 'Dumbbell Pullovers', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Dumbbell Curls', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Full Body Day 3',
            focus: 'All Movements',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Renegade Rows', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Turkish Get-ups', sets: 3, reps: '3-5', rest: 120 },
              { name: 'Dumbbell Lunges', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
        ],
        4: [
          {
            name: 'Upper Day 1',
            focus: 'Chest & Back',
            exercises: [
              { name: 'Dumbbell Bench Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Rows', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Flyes', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Single-Arm Rows', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Lower Day 1',
            focus: 'Quads & Glutes',
            exercises: [
              { name: 'Goblet Squats', sets: 4, reps: '10-12', rest: 90 },
              { name: 'Bulgarian Split Squats', sets: 4, reps: '10-12', rest: 90 },
              { name: 'Dumbbell Lunges', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Dumbbell Calf Raises', sets: 3, reps: '12-15', rest: 45 },
            ],
          },
          {
            name: 'Upper Day 2',
            focus: 'Shoulders & Arms',
            exercises: [
              { name: 'Dumbbell Overhead Press', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Lateral Raises', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Dumbbell Curls', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Tricep Extensions', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
          {
            name: 'Lower Day 2',
            focus: 'Hamstrings & Glutes',
            exercises: [
              { name: 'Dumbbell Romanian Deadlifts', sets: 4, reps: '8-10', rest: 90 },
              { name: 'Single-Leg Deadlifts', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Dumbbell Step-ups', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Dumbbell Pullovers', sets: 3, reps: '10-12', rest: 60 },
            ],
          },
        ],
      },
      bodyweight: {
        3: [
          {
            name: 'Full Body Day 1',
            focus: 'Push & Leg Focus',
            exercises: [
              { name: 'Push-ups', sets: 4, reps: '10-15', rest: 60 },
              { name: 'Pike Push-ups', sets: 4, reps: '8-12', rest: 60 },
              { name: 'Bodyweight Squats', sets: 4, reps: '15-20', rest: 60 },
              { name: 'Dips (Assisted)', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Jumping Lunges', sets: 3, reps: '10-12', rest: 45 },
            ],
          },
          {
            name: 'Full Body Day 2',
            focus: 'Pull & Core',
            exercises: [
              { name: 'Pull-ups', sets: 4, reps: '8-12', rest: 90 },
              { name: 'Chin-ups', sets: 4, reps: '8-12', rest: 90 },
              { name: 'Hanging Knee Raises', sets: 3, reps: '10-15', rest: 60 },
              { name: 'Inverted Rows', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Plank Hold', sets: 3, reps: '30-60s', rest: 45 },
            ],
          },
          {
            name: 'Full Body Day 3',
            focus: 'All Movements',
            exercises: [
              { name: 'Diamond Push-ups', sets: 4, reps: '10-15', rest: 60 },
              { name: 'Australian Pull-ups', sets: 4, reps: '10-12', rest: 60 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '12-15', rest: 60 },
              { name: 'Mountain Climbers', sets: 3, reps: '20-30', rest: 45 },
              { name: 'Leg Raises', sets: 3, reps: '10-15', rest: 45 },
            ],
          },
        ],
      },
    },
    strength: {
      full: {
        3: [
          {
            name: 'Power Day 1',
            focus: 'Lower Body',
            exercises: [
              { name: 'Barbell Squats', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Barbell Deadlifts', sets: 3, reps: '2-3', rest: 180 },
              { name: 'Leg Press', sets: 3, reps: '5-8', rest: 120 },
              { name: 'Leg Curls', sets: 3, reps: '8-10', rest: 90 },
            ],
          },
          {
            name: 'Power Day 2',
            focus: 'Upper Body',
            exercises: [
              { name: 'Barbell Bench Press', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Barbell Rows', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Weighted Pull-ups', sets: 3, reps: '5-8', rest: 120 },
              { name: 'Barbell Overhead Press', sets: 3, reps: '5-8', rest: 120 },
            ],
          },
          {
            name: 'Accessory Day',
            focus: 'Weak Points',
            exercises: [
              { name: 'Incline Bench Press', sets: 3, reps: '6-8', rest: 120 },
              { name: 'Lat Pulldowns', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '8-10', rest: 90 },
              { name: 'Barbell Curls', sets: 2, reps: '8-10', rest: 90 },
            ],
          },
        ],
        4: [
          {
            name: 'Upper Power',
            focus: 'Heavy Pressing',
            exercises: [
              { name: 'Barbell Bench Press', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Incline Bench Press', sets: 3, reps: '5-8', rest: 120 },
              { name: 'Weighted Dips', sets: 3, reps: '5-8', rest: 120 },
            ],
          },
          {
            name: 'Lower Power',
            focus: 'Heavy Squats',
            exercises: [
              { name: 'Barbell Squats', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Leg Press', sets: 3, reps: '5-8', rest: 120 },
              { name: 'Leg Curls', sets: 3, reps: '8-10', rest: 90 },
            ],
          },
          {
            name: 'Back & Rows',
            focus: 'Heavy Pulling',
            exercises: [
              { name: 'Barbell Rows', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Weighted Pull-ups', sets: 4, reps: '3-5', rest: 120 },
              { name: 'Face Pulls', sets: 3, reps: '12-15', rest: 60 },
            ],
          },
          {
            name: 'Deadlift & Assist',
            focus: 'Posterior Chain',
            exercises: [
              { name: 'Barbell Deadlifts', sets: 5, reps: '3-5', rest: 180 },
              { name: 'Romanian Deadlifts', sets: 3, reps: '5-8', rest: 120 },
              { name: 'Barbell Overhead Press', sets: 3, reps: '5-8', rest: 120 },
            ],
          },
        ],
      },
    },
    'weight-loss': {
      full: {
        4: [
          {
            name: 'HIIT Circuit 1',
            focus: 'Upper Body & Cardio',
            exercises: [
              { name: 'Push-ups', sets: 3, reps: '15-20', rest: 30 },
              { name: 'Burpees', sets: 3, reps: '10-15', rest: 30 },
              { name: 'Mountain Climbers', sets: 3, reps: '30 sec', rest: 30 },
              { name: 'Dumbbell Rows', sets: 3, reps: '12-15', rest: 45 },
              { name: 'Jump Rope', sets: 3, reps: '60 sec', rest: 30 },
            ],
          },
          {
            name: 'HIIT Circuit 2',
            focus: 'Lower Body & Cardio',
            exercises: [
              { name: 'Bodyweight Squats', sets: 3, reps: '20-25', rest: 30 },
              { name: 'Jumping Lunges', sets: 3, reps: '15-20', rest: 30 },
              { name: 'Leg Raises', sets: 3, reps: '15-20', rest: 30 },
              { name: 'Goblet Squats', sets: 3, reps: '15-20', rest: 45 },
              { name: 'High Knees', sets: 3, reps: '60 sec', rest: 30 },
            ],
          },
          {
            name: 'Strength & Cardio',
            focus: 'Full Body',
            exercises: [
              { name: 'Barbell Squats', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: 60 },
              { name: 'Rowing Machine', sets: 3, reps: '500m', rest: 90 },
              { name: 'Farmer Carries', sets: 3, reps: '40m', rest: 45 },
            ],
          },
          {
            name: 'Active Recovery',
            focus: 'Light Movement',
            exercises: [
              { name: 'Walking', sets: 1, reps: '30 min', rest: 0 },
              { name: 'Light Stretching', sets: 1, reps: '15 min', rest: 0 },
              { name: 'Yoga', sets: 1, reps: '20 min', rest: 0 },
            ],
          },
        ],
      },
    },
  };

  const generateWorkoutPlan = () => {
    const { goal, experience, equipment, frequency } = preferences;
    const templates = workoutTemplates[goal]?.[equipment]?.[frequency];

    if (templates) {
      const plan = {
        id: Date.now(),
        name: `${goal.charAt(0).toUpperCase() + goal.slice(1)} Program (${frequency}x/week)`,
        goal,
        experience,
        equipment,
        frequency,
        createdAt: new Date().toISOString(),
        workouts: templates,
      };
      setGeneratedPlan(plan);
      setStep(3);
    }
  };

  const savePlan = () => {
    if (generatedPlan) {
      const updated = [...savedPlans, generatedPlan];
      setSavedPlans(updated);
      localStorage.setItem('workoutPlans', JSON.stringify(updated));
      setMessage('Workout plan saved!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deletePlan = (id) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem('workoutPlans', JSON.stringify(updated));
  };

  const startPlan = (plan) => {
    localStorage.setItem('activePlan', JSON.stringify(plan));
    setGeneratedPlan(plan);
    setStep(3);
  };

  return (
      <div className="generator-container">
      {message && <p className="form-message success" role="status">{message}</p>}
      {step === 1 && (
        <div className="generator-step">
          <div className="step-header">
            <h2>Workout Generator</h2>
            <p>Create your personalized workout plan</p>
          </div>

          <div className="preferences-form">
            <div className="form-section">
              <h3>What's your fitness goal?</h3>
              <div className="option-grid">
                {[
                  { value: 'muscle', label: 'Build Muscle', icon: 'ᪧ' },
                  { value: 'strength', label: 'Build Strength', icon: '᪣' },
                  { value: 'weight-loss', label: 'Lose Weight', icon: '᪤' },
                ].map(option => (
                  <button
                    key={option.value}
                    className={`option-button ${preferences.goal === option.value ? 'active' : ''}`}
                    onClick={() => setPreferences({ ...preferences, goal: option.value })}
                  >
                    <span className="option-icon">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Training experience?</h3>
              <div className="option-grid">
                {[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ].map(option => (
                  <button
                    key={option.value}
                    className={`option-button ${preferences.experience === option.value ? 'active' : ''}`}
                    onClick={() => setPreferences({ ...preferences, experience: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Available equipment?</h3>
              <div className="option-grid">
                {[
                  { value: 'full', label: 'Full Gym' },
                  { value: 'dumbbells', label: 'Dumbbells Only' },
                  { value: 'bodyweight', label: 'Bodyweight' },
                ].map(option => (
                  <button
                    key={option.value}
                    className={`option-button ${preferences.equipment === option.value ? 'active' : ''}`}
                    onClick={() => setPreferences({ ...preferences, equipment: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>How many days per week?</h3>
              <div className="frequency-slider">
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={preferences.frequency}
                  onChange={(e) => setPreferences({ ...preferences, frequency: parseInt(e.target.value) })}
                />
                <div className="frequency-display">{preferences.frequency} days/week</div>
              </div>
            </div>

            <div className="form-actions">
              <button className="primary-button" onClick={() => { generateWorkoutPlan(); setStep(3); }}>
                Generate Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && generatedPlan && (
        <div className="generator-step plan-display">
          <div className="step-header">
            <h2>{generatedPlan.name}</h2>
            <p>{generatedPlan.frequency} workouts per week</p>
          </div>

          <div className="plan-details">
            <div className="plan-info">
              <span className="info-badge">{generatedPlan.goal}</span>
              <span className="info-badge">{generatedPlan.experience}</span>
              <span className="info-badge">{generatedPlan.equipment}</span>
            </div>

            <div className="workouts-list">
              {generatedPlan.workouts.map((workout, idx) => (
                <div key={idx} className="workout-card">
                  <div className="workout-header">
                    <h3>{workout.name}</h3>
                    <span className="focus-tag">{workout.focus}</span>
                  </div>

                  <div className="exercises-table">
                    <div className="table-header">
                      <span>Exercise</span>
                      <span>Sets</span>
                      <span>Reps</span>
                      <span>Rest</span>
                    </div>
                    {workout.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="table-row">
                        <span className="exercise-name">{ex.name}</span>
                        <span>{ex.sets}</span>
                        <span>{ex.reps}</span>
                        <span>{typeof ex.rest === 'number' ? `${ex.rest}s` : ex.rest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="plan-actions">
            <button className="secondary-button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="primary-button" onClick={savePlan}>
              Save This Plan
            </button>
          </div>
        </div>
      )}

      {savedPlans.length > 0 && (
        <div className="saved-plans">
          <h3>Saved Workout Plans</h3>
          <div className="plans-grid">
            {savedPlans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-card-header">
                  <h4>{plan.name}</h4>
                  <span className="plan-date">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="plan-card-info">
                  <span className="badge">{plan.frequency}x/week</span>
                  <span className="badge">{plan.goal}</span>
                </div>
                <div className="plan-card-actions">
                  <button className="action-button" onClick={() => startPlan(plan)}>
                    View
                  </button>
                  <button className="delete-button" onClick={() => deletePlan(plan.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
