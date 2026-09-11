import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { userService } from '../services/supabaseService';
import './UserProfile.css';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    experience: 'intermediate',
    fitnessGoal: 'general',
    activityLevel: 'moderate',
    units: 'metric',
    notifications: true,
    restTimerDefault: 90,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        const profileData = await userService.getProfile();

        if (profileData) {
          setProfile((current) => ({
            ...current,
            ...profileData,
            experience: profileData.experience_level || profileData.experience || current.experience,
            fitnessGoal: profileData.fitness_goal || profileData.fitnessGoal || current.fitnessGoal,
            activityLevel: profileData.activity_level || profileData.activityLevel || current.activityLevel,
            notifications: profileData.notifications_enabled ?? profileData.notifications ?? current.notifications,
            restTimerDefault: profileData.rest_timer_default || profileData.restTimerDefault || current.restTimerDefault,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Silently fail, use defaults
    } finally {
      setLoading(false);
    }
    };
    loadUserProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      if (!user) {
        setMessage('Error: Not logged in');
        setSaving(false);
        return;
      }

      await userService.upsertProfile({
        age: Number(profile.age) || null,
        gender: profile.gender || null,
        height_cm: Number(profile.height_cm) || null,
        weight_kg: Number(profile.weight_kg) || null,
        experience_level: profile.experience,
        fitness_goal: profile.fitnessGoal,
        activity_level: profile.activityLevel,
        units: profile.units,
        notifications_enabled: profile.notifications,
        rest_timer_default: profile.restTimerDefault,
      });

      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-container loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>Profile & Settings</h2>
        <p className="subtitle">Manage your MacroFit profile and settings</p>
      </header>

      {message && <div className="profile-message">{message}</div>}

      <div className="profile-sections">
        {/* Personal Information */}
        <section className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                min="13"
                max="120"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="e.g., 25"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={profile.height_cm}
                onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                placeholder="e.g., 180"
              />
            </div>

            <div className="form-group">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={profile.weight_kg}
                onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                placeholder="e.g., 75.5"
              />
            </div>
          </div>
        </section>

        {/* Fitness Profile */}
        <section className="profile-section">
          <h3>Fitness Profile</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Experience Level</label>
              <select
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              >
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="advanced">Advanced (2-5 years)</option>
                <option value="elite">Elite (5+ years)</option>
              </select>
              <small>How long have you been training regularly?</small>
            </div>

            <div className="form-group">
              <label>Fitness Goal</label>
              <select
                value={profile.fitnessGoal}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
              >
                <option value="general">General Fitness</option>
                <option value="muscle">Build Muscle</option>
                <option value="strength">Build Strength</option>
                <option value="weight-loss">Lose Weight</option>
                <option value="endurance">Build Endurance</option>
                <option value="athletic">Athletic Performance</option>
                <option value="rehabilitation">Rehabilitation</option>
              </select>
            </div>

            <div className="form-group">
              <label>Activity Level</label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary (little exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very-active">Very Active (athlete/professional)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Default Rest Timer (seconds)</label>
              <input
                type="number"
                min="30"
                max="300"
                step="15"
                value={profile.restTimerDefault}
                onChange={(e) => setProfile({ ...profile, restTimerDefault: parseInt(e.target.value) })}
              />
              <small>Default rest time between sets (can override per exercise)</small>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="profile-section">
          <h3>Preferences</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Units</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="metric"
                    checked={profile.units === 'metric'}
                    onChange={(e) => setProfile({ ...profile, units: e.target.value })}
                  />
                  <span>Metric (kg, cm)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="imperial"
                    checked={profile.units === 'imperial'}
                    onChange={(e) => setProfile({ ...profile, units: e.target.value })}
                  />
                  <span>Imperial (lb, in)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Notifications</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="checkbox"
                    checked={profile.notifications}
                    onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                  />
                  <span>Enable notifications for PRs and streak milestones</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="profile-section stats-section">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">BMI</span>
              <span className="stat-value">
                {profile.height_cm && profile.weight_kg
                  ? (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
                  : '—'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Experience</span>
              <span className="stat-value">
                {profile.experience.split('-')[0].charAt(0).toUpperCase() + profile.experience.split('-')[0].slice(1)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Activity Level</span>
              <span className="stat-value">
                {profile.activityLevel === 'very-active'
                  ? 'Very Active'
                  : profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Goal</span>
              <span className="stat-value">
                {profile.fitnessGoal
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
            </div>
          </div>
        </section>

        {/* Account Info */}
        {user && (
          <section className="profile-section account-section">
            <h3>Account Information</h3>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Created</span>
                <span className="info-value">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Sign In</span>
                <span className="info-value">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Save Button */}
        <div className="profile-actions">
          <button
            className="save-button"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
