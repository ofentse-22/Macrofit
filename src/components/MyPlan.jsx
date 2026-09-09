import { useState, useEffect } from 'react';
import { goalsService, weightService, workoutService, streakService, analyticsService } from '../services/supabaseService';
import './MyPlan.css';

export default function MyPlan() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'weight_loss',
    target_weight_kg: '',
    training_days_per_week: 5,
    daily_calorie_target: 2350,
    daily_protein_target: 170,
  });

  useEffect(() => {
    loadPlanData();
  }, []);

  async function loadPlanData() {
    setLoading(true);
    try {
      const [userGoal, latestWeight, workouts, streak] = await Promise.all([
        goalsService.getGoal(),
        weightService.getLatestWeight(),
        workoutService.getWorkouts(),
        streakService.getStreak('workout'),
      ]);

      setGoal(userGoal);

      // Calculate progress and stats
      if (userGoal) {
        const currentWeight = latestWeight?.weight_kg || userGoal.current_weight_kg;
        const progress = calculateProgress(
          userGoal.current_weight_kg,
          userGoal.target_weight_kg,
          currentWeight
        );

        // Get this month's workouts
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString().split('T')[0];
        const monthEnd = today.toISOString().split('T')[0];

        const monthStats = await analyticsService.getWorkoutStats(monthStart, monthEnd);

        setStats({
          currentWeight,
          progress,
          weightChange: currentWeight - userGoal.current_weight_kg,
          workoutsThisMonth: monthStats.totalWorkouts,
          completionRate: monthStats.completionRate,
          streak: streak?.current_count || 0,
          nextWorkoutDays: calculateNextWorkoutDays(workouts),
        });
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startWeight, targetWeight, currentWeight) => {
    if (startWeight === targetWeight) return 0;
    const totalChange = targetWeight - startWeight;
    const currentChange = currentWeight - startWeight;
    return Math.max(0, Math.min(100, (currentChange / totalChange) * 100));
  };

  const calculateNextWorkoutDays = (workouts) => {
    if (workouts.length === 0) return 0;
    const lastWorkout = new Date(workouts[0].created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastWorkout.setHours(0, 0, 0, 0);
    return Math.ceil((today - lastWorkout) / (1000 * 60 * 60 * 24));
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      const updated = await goalsService.upsertGoal({
        ...goalForm,
        start_date: new Date().toISOString().split('T')[0],
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
      });
      setGoal(updated);
      setShowEditGoal(false);
      loadPlanData();
    } catch {
      alert('Unable to save your plan goal. Please try again.');
    }
  };

  const getGoalDescription = (type) => {
    const descriptions = {
      weight_loss: 'Lose weight and improve body composition',
      muscle_gain: 'Build muscle and increase strength',
      strength: 'Increase strength and power',
      maintenance: 'Maintain current weight and fitness',
    };
    return descriptions[type] || type;
  };

  const getDaysRemaining = () => {
    if (!goal?.target_date) return null;
    const today = new Date();
    const target = new Date(goal.target_date);
    const daysLeft = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return <div className="my-plan-container loading">Loading your plan...</div>;
  }

  if (!goal) {
    return (
      <div className="my-plan-container">
        <div className="my-plan-card">
          <h2>No Plan Yet</h2>
          <p>Let's create your fitness plan to get started!</p>
          <form onSubmit={handleSaveGoal} className="goal-form">
            <div className="form-group">
              <label>Goal Type</label>
              <select
                value={goalForm.goal_type}
                onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}
                required
              >
                <option value="weight_loss">Lose Weight</option>
                <option value="muscle_gain">Build Muscle</option>
                <option value="strength">Increase Strength</option>
                <option value="maintenance">Maintain Fitness</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Weight (kg)</label>
              <input
                type="number"
                value={goalForm.target_weight_kg}
                onChange={(e) => setGoalForm({ ...goalForm, target_weight_kg: e.target.value })}
                placeholder="85"
                step="0.5"
                required
              />
            </div>

            <div className="form-group">
              <label>Training Days Per Week</label>
              <input
                type="number"
                value={goalForm.training_days_per_week}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, training_days_per_week: parseInt(e.target.value) })
                }
                min="1"
                max="7"
                required
              />
            </div>

            <div className="form-group">
              <label>Daily Calorie Target</label>
              <input
                type="number"
                value={goalForm.daily_calorie_target}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, daily_calorie_target: parseInt(e.target.value) })
                }
                step="50"
                required
              />
            </div>

            <div className="form-group">
              <label>Daily Protein Target (g)</label>
              <input
                type="number"
                value={goalForm.daily_protein_target}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, daily_protein_target: parseInt(e.target.value) })
                }
                step="5"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Create My Plan
            </button>
          </form>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="my-plan-container">
      <div className="my-plan-header">
        <div>
          <h1>Your Fitness Plan</h1>
          <p>{getGoalDescription(goal.goal_type)}</p>
        </div>
        <button
          className="btn-edit"
          onClick={() => {
            setGoalForm({
              goal_type: goal.goal_type,
              target_weight_kg: goal.target_weight_kg,
              training_days_per_week: goal.training_days_per_week,
              daily_calorie_target: goal.daily_calorie_target,
              daily_protein_target: goal.daily_protein_target,
            });
            setShowEditGoal(true);
          }}
        >
          Edit Plan
        </button>
      </div>

      {showEditGoal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Your Plan</h2>
            <form onSubmit={handleSaveGoal} className="goal-form">
              <div className="form-group">
                <label>Goal Type</label>
                <select
                  value={goalForm.goal_type}
                  onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}
                >
                  <option value="weight_loss">Lose Weight</option>
                  <option value="muscle_gain">Build Muscle</option>
                  <option value="strength">Increase Strength</option>
                  <option value="maintenance">Maintain Fitness</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Weight (kg)</label>
                <input
                  type="number"
                  value={goalForm.target_weight_kg}
                  onChange={(e) => setGoalForm({ ...goalForm, target_weight_kg: e.target.value })}
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Training Days Per Week</label>
                <input
                  type="number"
                  value={goalForm.training_days_per_week}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, training_days_per_week: parseInt(e.target.value) })
                  }
                  min="1"
                  max="7"
                />
              </div>

              <div className="form-group">
                <label>Daily Calorie Target</label>
                <input
                  type="number"
                  value={goalForm.daily_calorie_target}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, daily_calorie_target: parseInt(e.target.value) })
                  }
                  step="50"
                />
              </div>

              <div className="form-group">
                <label>Daily Protein Target (g)</label>
                <input
                  type="number"
                  value={goalForm.daily_protein_target}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, daily_protein_target: parseInt(e.target.value) })
                  }
                  step="5"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditGoal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="plan-grid">
        {/* Goal Progress Card */}
        <div className="plan-card">
          <h3>Goal Progress</h3>
          <div className="goal-display">
            <div className="weight-metrics">
              <div className="metric">
                <span className="label">Goal</span>
                <span className="value">{goal.target_weight_kg}kg</span>
              </div>
              <div className="metric">
                <span className="label">Current</span>
                <span className="value">{stats?.currentWeight || '--'}kg</span>
              </div>
              <div className="metric">
                <span className="label">Remaining</span>
                <span className={`value ${stats?.weightChange < 0 ? 'positive' : 'negative'}`}>
                  {stats?.weightChange
                    ? (Math.abs(stats.weightChange) > 0
                        ? Math.abs(stats.weightChange).toFixed(1)
                        : '0')
                    : '--'}{' '}
                  kg
                </span>
              </div>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, stats?.progress || 0))}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(stats?.progress || 0)}% Complete</span>
            </div>

            {daysRemaining !== null && (
              <p className="days-remaining">
                {daysRemaining} days remaining to reach your goal
              </p>
            )}
          </div>
        </div>

        {/* Daily Targets Card */}
        <div className="plan-card">
          <h3>Daily Targets</h3>
          <div className="targets-grid">
            <div className="target-item">
              <span className="target-label">Calories</span>
              <span className="target-value">{goal.daily_calorie_target}</span>
              <span className="target-unit">kcal</span>
            </div>
            <div className="target-item">
              <span className="target-label">Protein</span>
              <span className="target-value">{goal.daily_protein_target}</span>
              <span className="target-unit">g</span>
            </div>
            <div className="target-item">
              <span className="target-label">Training</span>
              <span className="target-value">{goal.training_days_per_week}</span>
              <span className="target-unit">days/week</span>
            </div>
          </div>
        </div>

        {/* Current Performance Card */}
        <div className="plan-card">
          <h3>This Month's Performance</h3>
          <div className="performance-grid">
            <div className="perf-item">
              <span className="perf-label">Workouts Completed</span>
              <span className="perf-value">{stats?.workoutsThisMonth || 0}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Completion Rate</span>
              <span className="perf-value">{Math.round(stats?.completionRate || 0)}%</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Current Streak</span>
              <span className="perf-value">{stats?.streak || 0} days</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="plan-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <a href="#/workout" className="action-btn">
              Start Workout
            </a>
            <a href="#/nutrition" className="action-btn">
              Log Nutrition
            </a>
            <a href="#/weight" className="action-btn">
              Log Weight
            </a>
            <a href="#/analytics" className="action-btn">
              View Analytics
            </a>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <h2>Recommendations Based on Your Progress</h2>
        <div className="recommendations-grid">
          {stats?.completionRate < 60 && (
            <div className="recommendation-card">
              <h4>Improve Consistency</h4>
              <p>
                You're completing {Math.round(stats.completionRate)}% of planned sets. Try to
                push for 80%+.
              </p>
            </div>
          )}

          {stats?.workoutsThisMonth < goal.training_days_per_week * 3 && (
            <div className="recommendation-card">
              <h4>Schedule More Workouts</h4>
              <p>
                You've done {stats?.workoutsThisMonth || 0} workouts this month. Aim for{' '}
                {goal.training_days_per_week * 4} this month.
              </p>
            </div>
          )}

          {goal.goal_type === 'weight_loss' && stats?.weightChange > 0 && (
            <div className="recommendation-card">
              <h4>Review Your Nutrition</h4>
              <p>Your weight is trending up. Consider reviewing your calorie intake.</p>
            </div>
          )}

          {goal.goal_type === 'weight_loss' && stats?.weightChange < -2 && (
            <div className="recommendation-card">
              <h4>Great Progress!</h4>
              <p>You've lost {Math.abs(stats.weightChange).toFixed(1)}kg. Keep up the great work!</p>
            </div>
          )}

          <div className="recommendation-card">
            <h4>Track Your Data</h4>
            <p>
              Consistent tracking is key to success. Log your workouts and nutrition daily for
              better insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
