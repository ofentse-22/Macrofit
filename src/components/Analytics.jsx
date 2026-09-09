import { useCallback, useEffect, useState } from 'react';
import './Analytics.css';
import { nutritionService, weightService, workoutService } from '../services/supabaseService';

function SimpleLineChart({ data, dataKey, color, height = 200 }) {
  const safeData = (Array.isArray(data) ? data : [])
    .map((entry) => ({
      ...entry,
      [dataKey]: Number.isFinite(Number(entry?.[dataKey])) ? Number(entry[dataKey]) : 0,
    }));

  if (safeData.length === 0) {
    return <div className="empty-chart">No data available</div>;
  }

  const values = safeData.map(d => d[dataKey]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const points = safeData.map((d, i) => ({
    x: (i / (safeData.length - 1 || 1)) * 100,
    y: 100 - ((d[dataKey] - minValue) / range) * 100,
  }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
        <line x1="0" y1="25" x2="100" y2="25" className="grid-line" />
        <line x1="0" y1="50" x2="100" y2="50" className="grid-line" />
        <line x1="0" y1="75" x2="100" y2="75" className="grid-line" />
        <path d={pathData} className="chart-line" style={{ stroke: color }} fill="none" strokeWidth="2" />
        <path d={`${pathData} L 100 100 L 0 100 Z`} className="chart-fill" style={{ fill: color, opacity: 0.1 }} />
      </svg>
      <div className="chart-labels">
        <span className="label-first">{safeData[0][dataKey]}</span>
        <span className="label-last">{safeData[safeData.length - 1][dataKey]}</span>
      </div>
    </div>
  );
}

function DualLineChart({ data, firstKey, secondKey, firstLabel, secondLabel }) {
  const safeData = (Array.isArray(data) ? data : []).map((entry) => ({
    ...entry,
    [firstKey]: Number.isFinite(Number(entry[firstKey])) ? Number(entry[firstKey]) : 0,
    [secondKey]: Number.isFinite(Number(entry[secondKey])) ? Number(entry[secondKey]) : 0,
  }));
  if (!safeData.length) return <div className="empty-chart">Not enough data for this comparison yet.</div>;
  const values = safeData.flatMap((entry) => [entry[firstKey], entry[secondKey]]);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const path = (key) => safeData.map((entry, index) => {
    const x = (index / Math.max(safeData.length - 1, 1)) * 100;
    const y = 94 - ((entry[key] - min) / range) * 82;
    return `${index ? "L" : "M"} ${x} ${y}`;
  }).join(" ");
  return <div className="dual-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d={path(firstKey)} className="chart-line" style={{ stroke: "var(--accent-color)" }} /><path d={path(secondKey)} className="chart-line" style={{ stroke: "#7ea6f5" }} /></svg><div className="dual-chart-legend"><span><i className="legend-dot primary" />{firstLabel}</span><span><i className="legend-dot secondary" />{secondLabel}</span></div></div>;
}

export default function Analytics({ onNavigate }) {
  const [data, setData] = useState({
    weightTrend: [],
    caloriesTrend: [],
    workoutTrend: [],
    volumeTrend: [],
    volumeWeightTrend: [],
    calorieBalanceTrend: [],
    stats: {},
  });
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    try {
      const now = new Date();
      const startDate = new Date(now);
      if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
      if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);
      if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1);
      const start = startDate.toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      const [weightHistory, nutritionLog, workoutHistory, nutritionGoals] = await Promise.all([
        weightService.getLogsForRange(start, end),
        nutritionService.getLogsByDateRange(start, end),
        workoutService.getWorkouts(),
        nutritionService.getGoals(),
      ]);
      const filteredWorkouts = workoutHistory.filter((workout) => {
        const date = (workout.created_at || '').slice(0, 10);
        return date >= start && date <= end;
      });
      const dailyCalories = {};
      nutritionLog.forEach((meal) => { dailyCalories[meal.meal_date] = (dailyCalories[meal.meal_date] || 0) + (Number(meal.calories) || 0); });
      const caloriesTrend = Object.entries(dailyCalories).sort(([a], [b]) => a.localeCompare(b)).map(([date, calories]) => ({ date, calories: Math.round(calories) }));
      const dailyWorkouts = {};
      const dailyVolume = {};
      filteredWorkouts.forEach((workout) => {
        const date = (workout.created_at || '').slice(0, 10);
        dailyWorkouts[date] = (dailyWorkouts[date] || 0) + 1;
        dailyVolume[date] = (dailyVolume[date] || 0) + (Number(workout.sets) || 0);
      });
      const workoutTrend = Object.entries(dailyWorkouts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
      const volumeTrend = Object.entries(dailyVolume).sort(([a], [b]) => a.localeCompare(b)).map(([date, sets]) => ({ date, sets }));
      const weightByDate = Object.fromEntries(weightHistory.map((entry) => [entry.weight_date, Number(entry.weight_kg) || 0]));
      const combinedDates = [...new Set([...Object.keys(dailyVolume), ...Object.keys(weightByDate)])].sort();
      const volumeWeightTrend = combinedDates.map((date) => ({ date, volume: dailyVolume[date] || 0, weight: weightByDate[date] || 0 }));
      const calorieTarget = Number(nutritionGoals?.daily_calories) || 2500;
      const calorieBalanceTrend = caloriesTrend.map((entry) => ({ date: entry.date, intake: entry.calories, target: calorieTarget }));
      const totalSets = filteredWorkouts.reduce((sum, workout) => sum + (Number(workout.sets) || 0), 0);
      const completedSets = filteredWorkouts.reduce((sum, workout) => sum + (Number(workout.completed_sets) || 0), 0);
      setData({
        weightTrend: weightHistory.map((entry) => ({ date: entry.weight_date, weight: Number(entry.weight_kg) || 0 })).sort((a, b) => a.date.localeCompare(b.date)),
        caloriesTrend,
        workoutTrend,
        volumeTrend,
        volumeWeightTrend,
        calorieBalanceTrend,
        stats: {
          avgWeight: weightHistory.length ? (weightHistory.reduce((sum, entry) => sum + (Number(entry.weight_kg) || 0), 0) / weightHistory.length).toFixed(1) : 0,
          avgCalories: caloriesTrend.length ? Math.round(caloriesTrend.reduce((sum, entry) => sum + entry.calories, 0) / caloriesTrend.length) : 0,
          totalSets,
          avgSetsPerWorkout: filteredWorkouts.length ? (totalSets / filteredWorkouts.length).toFixed(1) : 0,
          completionRate: totalSets ? Math.round((completedSets / totalSets) * 100) : 0,
        },
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) loadAnalyticsData();
    });

    return () => {
      cancelled = true;
    };
  }, [loadAnalyticsData]);

  if (loading) {
    return <div className="analytics-container loading">Loading analytics...</div>;
  }

  const hasProgressData = data.weightTrend.length || data.caloriesTrend.length || data.workoutTrend.length || data.volumeTrend.length;
  if (!hasProgressData) {
    return <div className="analytics-container progress-empty"><div className="empty-state-panel"><p className="panel-kicker">Progress starts with one entry</p><h3>No progress data yet</h3><p>Log a workout or meal and your trends will appear here.</p><button type="button" onClick={() => onNavigate?.("training")}>Log your first workout</button></div></div>;
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

        <div className="combined-chart-grid">
          <div className="chart-card"><h4>Volume and body weight</h4><p>Daily training volume beside your latest weight entries.</p><DualLineChart data={data.volumeWeightTrend} firstKey="volume" secondKey="weight" firstLabel="Volume" secondLabel="Weight" /></div>
          <div className="chart-card"><h4>Calories and daily goal</h4><p>Intake compared with your daily calorie goal.</p><DualLineChart data={data.calorieBalanceTrend} firstKey="intake" secondKey="target" firstLabel="Intake" secondLabel="Daily Goal" /></div>
        </div>

        {data.weightTrend.length > 0 && (
          <div className="chart-card">
            <h4>Weight Trend</h4>
            <SimpleLineChart
              data={data.weightTrend}
              dataKey="weight"
              color="#0b1833"
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
              color="#1d56c7"
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
              color="#1d56c7"
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
              color="#1d56c7"
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
