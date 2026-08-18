import React, { useState, useEffect } from 'react';
import './Gamification.css';

export default function Gamification() {
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalWorkouts: 0,
    achievements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = () => {
    try {
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');

      // Calculate streaks
      const sortedDates = workoutHistory
        .map(w => new Date(w.completedAt).toDateString())
        .sort((a, b) => new Date(b) - new Date(a));

      const uniqueDates = [...new Set(sortedDates)];
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 1;

      // Check if workout was today
      const today = new Date().toDateString();
      if (uniqueDates.length > 0 && uniqueDates[0] === today) {
        currentStreak = 1;
      }

      // Calculate streaks
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const nextDate = new Date(uniqueDates[i + 1]);
        const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);

      // Generate achievements
      const generatedAchievements = generateAchievements(workoutHistory, uniqueDates.length);

      setStats({
        currentStreak,
        bestStreak,
        totalWorkouts: workoutHistory.length,
        achievements: generatedAchievements,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setLoading(false);
    }
  };

  const generateAchievements = (workoutHistory, totalDays) => {
    const achievements = [];

    // Milestone achievements
    const milestones = [
      { count: 1, name: 'First Workout', icon: '🎉', xp: 50 },
      { count: 5, name: 'Consistent', icon: '💪', xp: 100 },
      { count: 10, name: 'Dedicated', icon: '🏆', xp: 200 },
      { count: 25, name: 'Seasoned Lifter', icon: '👑', xp: 500 },
      { count: 50, name: 'Iron Warrior', icon: '⚔️', xp: 1000 },
      { count: 100, name: 'Legend', icon: '🌟', xp: 2000 },
    ];

    milestones.forEach(milestone => {
      if (workoutHistory.length >= milestone.count) {
        achievements.push({
          name: milestone.name,
          description: `Complete ${milestone.count} workouts`,
          icon: milestone.icon,
          xp: milestone.xp,
          unlocked: true,
        });
      }
    });

    // Streak achievements
    const streakMilestones = [
      { days: 3, name: 'On Fire', icon: '🔥', xp: 75 },
      { days: 7, name: 'Weekly Warrior', icon: '📅', xp: 150 },
      { days: 14, name: 'Fortnight Champ', icon: '💎', xp: 300 },
      { days: 30, name: 'Monthly Master', icon: '🎖️', xp: 500 },
    ];

    // Note: We can't calculate actual streaks here without date info, so we'll show them as locked
    streakMilestones.forEach(milestone => {
      achievements.push({
        name: milestone.name,
        description: `${milestone.days}-day workout streak`,
        icon: milestone.icon,
        xp: milestone.xp,
        unlocked: false,
      });
    });

    // Volume achievements
    if (workoutHistory.length > 0) {
      const totalSets = workoutHistory.reduce((sum, w) => sum + (w.totalSets || 0), 0);
      const volumeAchievements = [
        { sets: 50, name: 'Volume Builder', icon: '📈', xp: 100 },
        { sets: 200, name: 'Mass Constructor', icon: '🏗️', xp: 250 },
        { sets: 500, name: 'Volume Machine', icon: '⚙️', xp: 500 },
      ];

      volumeAchievements.forEach(achievement => {
        if (totalSets >= achievement.sets) {
          achievements.push({
            name: achievement.name,
            description: `Complete ${achievement.sets} total sets`,
            icon: achievement.icon,
            xp: achievement.xp,
            unlocked: true,
          });
        }
      });
    }

    return achievements.filter((a, i, arr) => arr.findIndex(t => t.name === a.name) === i);
  };

  if (loading) {
    return <div className="gamification-container loading">Loading achievements...</div>;
  }

  const unlockedAchievements = stats.achievements.filter(a => a.unlocked);
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="gamification-container">
      <header className="gamification-header">
        <h2>Achievements & Streaks</h2>
        <p>Earn badges and build your streak</p>
      </header>

      {/* Streak Section */}
      <section className="streak-section">
        <div className="streak-card main-streak">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <h3>Current Streak</h3>
            <p className="streak-number">{stats.currentStreak}</p>
            <p className="streak-label">days</p>
          </div>
        </div>

        <div className="streak-card best-streak">
          <div className="streak-icon">🏆</div>
          <div className="streak-info">
            <h3>Best Streak</h3>
            <p className="streak-number">{stats.bestStreak}</p>
            <p className="streak-label">days</p>
          </div>
        </div>

        <div className="streak-card total-workouts">
          <div className="streak-icon">💪</div>
          <div className="streak-info">
            <h3>Total Workouts</h3>
            <p className="streak-number">{stats.totalWorkouts}</p>
            <p className="streak-label">sessions</p>
          </div>
        </div>

        <div className="streak-card total-xp">
          <div className="streak-icon">⭐</div>
          <div className="streak-info">
            <h3>Total XP</h3>
            <p className="streak-number">{totalXP}</p>
            <p className="streak-label">points</p>
          </div>
        </div>
      </section>

      {/* Streak Tips */}
      <section className="tips-section">
        <h3>Tips to Maintain Your Streak</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">📅</span>
            <p>Schedule workouts at the same time each day</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">⏰</span>
            <p>Set reminders for your workout time</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📱</span>
            <p>Log each workout immediately after completion</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🎯</span>
            <p>Don't miss a day - consistency is key</p>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <h3>Achievements</h3>

        {unlockedAchievements.length > 0 && (
          <div className="achievements-subsection">
            <h4 className="subsection-title">Unlocked ({unlockedAchievements.length})</h4>
            <div className="achievements-grid">
              {unlockedAchievements.map((achievement, idx) => (
                <div key={idx} className="achievement-card unlocked">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h4>{achievement.name}</h4>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-xp">+{achievement.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.achievements.filter(a => !a.unlocked).length > 0 && (
          <div className="achievements-subsection">
            <h4 className="subsection-title">Locked</h4>
            <div className="achievements-grid">
              {stats.achievements.filter(a => !a.unlocked).map((achievement, idx) => (
                <div key={idx} className="achievement-card locked">
                  <div className="achievement-icon locked-icon">{achievement.icon}</div>
                  <h4>{achievement.name}</h4>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-xp">+{achievement.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Leaderboard Info */}
      <section className="leaderboard-section">
        <h3>Your Stats</h3>
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">Workouts This Week</span>
            <span className="stat-value">
              {(() => {
                const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return workoutHistory.filter(w => new Date(w.completedAt) > oneWeekAgo).length;
              })()}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Average Sets Per Workout</span>
            <span className="stat-value">
              {(() => {
                const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
                if (workoutHistory.length === 0) return 0;
                const totalSets = workoutHistory.reduce((sum, w) => sum + (w.totalSets || 0), 0);
                return (totalSets / workoutHistory.length).toFixed(1);
              })()}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Consistency Rate</span>
            <span className="stat-value">
              {(() => {
                const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
                if (workoutHistory.length === 0) return '0%';
                const completed = workoutHistory.filter(w => (w.completedRatio || 0) === 100).length;
                return `${Math.round((completed / workoutHistory.length) * 100)}%`;
              })()}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
