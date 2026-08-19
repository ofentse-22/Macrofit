import React, { useState, useEffect } from 'react';
import './Analytics.css';

export default function Analytics() {
  const [data, setData] = useState({
    weightTrend: [],
    caloriesTrend: [],
    workoutTrend: [],
    volumeTrend: [],
    stats: {},
  });
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    try {
      const weightHistory = JSON.parse(localStorage.getItem('weightHistory') || '[]');
      const nutritionLog = JSON.parse(localStorage.getItem('nutritionLog') || '[]');
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

      // Filter by time range
      const now = new Date();
      let startDate = new Date();

      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeRange === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Process weight trend
      const filteredWeight = weightHistory.filter(w => new Date(w.date) >= startDate).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Process calorie trend
      const dailyCalories = {};
      nutritionLog.forEach(meal => {
        const date = meal.date;
        if (new Date(date) >= startDate) {
          dailyCalories[date] = (dailyCalories[date] || 0) + (meal.calories || 0);
        }
      });
      const caloriesTrend = Object.entries(dailyCalories)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, calories]) => ({
          date,
          calories: Math.round(calories),
        }));

      // Process workout trend
      const dailyWorkouts = {};
      workoutHistory.forEach(workout => {
        const date = new Date(workout.completedAt).toISOString().split('T')[0];
        if (new Date(date) >= startDate) {
          dailyWorkouts[date] = (dailyWorkouts[date] || 0) + 1;
        }
      });
      const workoutTrend = Object.entries(dailyWorkouts)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, count]) => ({ date, count }));

      // Process volume trend
      const dailyVolume = {};
      workoutHistory.forEach(workout => {
        const date = new Date(workout.completedAt).toISOString().split('T')[0];
        if (new Date(date) >= startDate) {
          dailyVolume[date] = (dailyVolume[date] || 0) + (workout.totalSets || 0);
        }
      });
      const volumeTrend = Object.entries(dailyVolume)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, sets]) => ({ date, sets }));

      // Calculate stats
      const avgWeight = filteredWeight.length > 0
        ? (filteredWeight.reduce((sum, w) => sum + w.weight, 0) / filteredWeight.length).toFixed(1)
        : 0;

      const avgCalories = caloriesTrend.length > 0
        ? Math.round(caloriesTrend.reduce((sum, c) => sum + c.calories, 0) / caloriesTrend.length)
        : 0;

      const totalSets = workoutHistory
        .filter(w => new Date(w.completedAt) >= startDate)
        .reduce((sum, w) => sum + (w.totalSets || 0), 0);

      const avgSetsPerWorkout = workoutHistory.filter(w => new Date(w.completedAt) >= startDate).length > 0
        ? (totalSets / workoutHistory.filter(w => new Date(w.completedAt) >= startDate).length).toFixed(1)
        : 0;

      const completionRate = workoutHistory.filter(w => new Date(w.completedAt) >= startDate).length > 0
        ? Math.round(
          (workoutHistory.filter(w => new Date(w.completedAt) >= startDate && w.completedRatio === 100).length /
            workoutHistory.filter(w => new Date(w.completedAt) >= startDate).length) * 100
        )
        : 0;

      setData({
        weightTrend: filteredWeight,
        caloriesTrend,
        workoutTrend,
        volumeTrend,
        stats: {
          avgWeight,
          avgCalories,
          totalSets,
          avgSetsPerWorkout,
          completionRate,
        },
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const SimpleLineChart = ({ data, dataKey, color, height = 200 }) => {
    if (!data || data.length === 0) {
      return <div className="empty-chart">No data available</div>;
    }

    const values = data.map(d => d[dataKey]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => ({
      x: (i / (data.length - 1 || 1)) * 100,
      y: 100 - ((d[dataKey] - minValue) / range) * 100,
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="chart-container" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" className="grid-line" />
          <line x1="0" y1="50" x2="100" y2="50" className="grid-line" />
          <line x1="0" y1="75" x2="100" y2="75" className="grid-line" />

          {/* Line */}
          <path d={pathData} className="chart-line" style={{ stroke: color }} fill="none" strokeWidth="2" />

          {/* Fill under line */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            className="chart-fill"
            style={{ fill: color, opacity: 0.1 }}
          />
        </svg>

        {/* Labels */}
        <div className="chart-labels">
          {data.length > 0 && (
            <>
              <span className="label-first">{data[0][dataKey]}</span>
              <span className="label-last">{data[data.length - 1][dataKey]}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="analytics-container loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <p>Track your fitness progress over time</p>
      </header>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        {['week', 'month', 'year'].map(range => (
          <button
            key={range}
            className={`range-button ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <section className="stats-section">
        <h3>Overview</h3>
        <div className="stats-grid">
          {data.stats.avgWeight > 0 && (
            <div className="stat-item">

              <span className="stat-label">Average Weight</span>
              <span className="stat-value">{data.stats.avgWeight} kg</span>
            </div>
          )}
          {data.stats.avgCalories > 0 && (
            <div className="stat-item">
              <span className="stat-icon">🍎</span>
              <span className="stat-label">Avg Daily Calories</span>
              <span className="stat-value">{data.stats.avgCalories}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Total Sets</span>
            <span className="stat-value">{data.stats.totalSets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Sets/Workout</span>
            <span className="stat-value">{data.stats.avgSetsPerWorkout}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completion Rate</span>
            <span className="stat-value">{data.stats.completionRate}%</span>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <h3>Trends</h3>

        {data.weightTrend.length > 0 && (
          <div className="chart-card">
            <h4>Weight Trend</h4>
            <SimpleLineChart
              data={data.weightTrend}
              dataKey="weight"
              color="#60a5fa"
              height={250}
            />
            <div className="chart-info">
              <span>Start: {data.weightTrend[0]?.weight}kg</span>
              <span>Current: {data.weightTrend[data.weightTrend.length - 1]?.weight}kg</span>
              <span>
                Change: {(data.weightTrend[data.weightTrend.length - 1]?.weight - data.weightTrend[0]?.weight).toFixed(1)}kg
              </span>
            </div>
          </div>
        )}

        {data.caloriesTrend.length > 0 && (
          <div className="chart-card">
            <h4>Daily Calorie Intake</h4>
            <SimpleLineChart
              data={data.caloriesTrend}
              dataKey="calories"
              color="#4ade80"
              height={250}
            />
            <div className="chart-info">
              <span>Avg: {data.stats.avgCalories} cal/day</span>
              <span>
                High: {Math.max(...data.caloriesTrend.map(c => c.calories))} cal
              </span>
              <span>
                Low: {Math.min(...data.caloriesTrend.map(c => c.calories))} cal
              </span>
            </div>
          </div>
        )}

        {data.workoutTrend.length > 0 && (
          <div className="chart-card">
            <h4>Workout Frequency</h4>
            <SimpleLineChart
              data={data.workoutTrend}
              dataKey="count"
              color="#f59e0b"
              height={250}
            />
            <div className="chart-info">
              <span>Total: {data.workoutTrend.reduce((sum, w) => sum + w.count, 0)} workouts</span>
              <span>Avg: {(data.workoutTrend.reduce((sum, w) => sum + w.count, 0) / data.workoutTrend.length).toFixed(1)} per day</span>
              <span>Peak: {Math.max(...data.workoutTrend.map(w => w.count))} workouts</span>
            </div>
          </div>
        )}

        {data.volumeTrend.length > 0 && (
          <div className="chart-card">
            <h4>Training Volume (Sets)</h4>
            <SimpleLineChart
              data={data.volumeTrend}
              dataKey="sets"
              color="#a78bfa"
              height={250}
            />
            <div className="chart-info">
              <span>Total: {data.stats.totalSets} sets</span>
              <span>
                Avg: {(data.stats.totalSets / data.volumeTrend.length).toFixed(1)} sets/day
              </span>
              <span>
                Peak: {Math.max(...data.volumeTrend.map(v => v.sets))} sets
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Insights */}
      <section className="insights-section">
        <h3>Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Consistency</h4>
            <p>
              {data.stats.completionRate >= 80
                ? 'Excellent workout completion rate! Keep up the consistency.'
                : 'Try to complete more of your planned workouts for better results.'}
            </p>
          </div>

          <div className="insight-card">
            <h4>Progress</h4>
            <p>
              {data.stats.avgSetsPerWorkout > 15
                ? 'You\'re doing high volume workouts. Ensure adequate recovery.'
                : 'Consider increasing your training volume for better results.'}
            </p>
          </div>

          <div className="insight-card">
            <h4>Nutrition</h4>
            <p>
              {data.stats.avgCalories > 2000 && data.stats.avgCalories < 2500
                ? 'Your calorie intake appears balanced for maintenance or lean gains.'
                : data.stats.avgCalories > 0
                ? 'Review your nutrition goals and adjust intake accordingly.'
                : 'Start logging meals to track your nutrition patterns.'}
            </p>
          </div>

          <div className="insight-card">
            <span className="insight-icon">⚖️</span>
            <h4>Weight Trend</h4>
            <p>
              {data.weightTrend.length > 0
                ? data.weightTrend[data.weightTrend.length - 1].weight < data.weightTrend[0].weight
                  ? 'Great progress on your weight loss journey!'
                  : 'Your weight is stable. Adjust your nutrition and training if needed.'
                : 'Start logging your weight to track your progress.'}
            </p>
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section className="export-section">
        <h3>Export Data</h3>
        <p>Download your analytics data for further analysis</p>
        <button className="export-button" onClick={() => {
          const csvData = JSON.stringify(data, null, 2);
          const blob = new Blob([csvData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fitlab-analytics-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
        }}>
          Download Analytics (JSON)
        </button>
      </section>
    </div>
  );
}
