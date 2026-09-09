import { supabase } from '../supabaseClient';

const isMissingTableError = (error) => error?.code === 'PGRST205' || /could not find the table/i.test(error?.message || '');

// ==================== USER PROFILE SERVICES ====================

export const userService = {
  // Get current user profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error) return { ...data, ...(user.user_metadata?.profile || {}) };

    // The profile table is optional while an app is being set up. Keep profile
    // details safely attached to the authenticated account until the SQL schema
    // has been applied, instead of making the whole profile screen fail.
    if (isMissingTableError(error) || /user_profiles/i.test(error.message || '')) {
      return user.user_metadata?.profile || {
        full_name: user.user_metadata?.full_name || '',
        ...user.user_metadata?.profile,
      };
    }
    console.error('Error fetching profile:', error);
    return null;
  },

  // Create or update user profile
  async upsertProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const tableProfile = Object.fromEntries(Object.entries(profileData).filter(([key]) => [
      'full_name', 'age', 'gender', 'height_cm', 'weight_kg', 'experience_level',
    ].includes(key)));

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...tableProfile,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error && !isMissingTableError(error) && !/user_profiles/i.test(error.message || '')) {
      throw new Error(`Error updating profile: ${error.message}`);
    }

    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, profile: { ...(user.user_metadata?.profile || {}), ...profileData } },
    });
    if (authError) throw new Error(`Error updating profile: ${authError.message}`);
    return { ...data, ...(authData.user?.user_metadata?.profile || profileData) };
  },

  // Get user settings
  async getSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Create default settings if they don't exist
      return {
        theme: 'dark',
        notifications_enabled: true,
        language: 'en',
        units: 'metric'
      };
    }
    return data;
  },

  // Update user settings
  async updateSettings(settings) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        id: user.id,
        ...settings,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error updating settings: ${error.message}`);
    return data;
  }
};

// ==================== FITNESS GOALS SERVICES ====================

export const goalsService = {
  // Get user's current fitness goal
  async getGoal() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching goal:', error);
    }
    return data || null;
  },

  // Create or update fitness goal
  async upsertGoal(goalData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const existingGoal = await this.getGoal();

    const { data, error } = await supabase
      .from('fitness_goals')
      .upsert({
        id: existingGoal?.id || undefined,
        user_id: user.id,
        ...goalData,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error saving goal: ${error.message}`);
    return data;
  }
};

// ==================== WORKOUT SERVICES ====================

export const workoutService = {
  // Get all workouts for current user
  async getWorkouts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
    return data || [];
  },

  // Add new workout
  async addWorkout(workoutData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workouts')
      .insert([{
        user_id: user.id,
        ...workoutData,
        created_at: new Date(),
      }])
      .select();

    if (error) throw new Error(`Error adding workout: ${error.message}`);
    return data?.[0];
  },

  // Update workout
  async updateWorkout(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workouts')
      .update({
        ...updates,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) throw new Error(`Error updating workout: ${error.message}`);
    return data?.[0];
  },

  // Delete workout
  async deleteWorkout(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(`Error deleting workout: ${error.message}`);
  },

  async deleteAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('workouts').delete().eq('user_id', user.id);
    if (error) throw new Error(`Error clearing workouts: ${error.message}`);
  },

  // Complete a set
  async completeSet(id, completedAt = new Date().toISOString()) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current workout
    const { data: workout, error: fetchError } = await supabase
      .from('workouts')
      .select('completed_sets, sets, last_completed_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const totalSets = Number.isFinite(Number(workout.sets)) ? Number(workout.sets) : 0;
    const completedSets = Number.isFinite(Number(workout.completed_sets)) ? Number(workout.completed_sets) : 0;
    if (totalSets < 1 || completedSets >= totalSets) return workout;

    // Update completed sets
    const { data, error } = await supabase
      .from('workouts')
      .update({
        completed_sets: Math.min(completedSets + 1, totalSets),
        last_completed_at: completedAt,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) throw new Error(`Error completing set: ${error.message}`);
    return data?.[0];
  },

  // Reset workout progress
  async resetWorkout(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workouts')
      .update({
        completed_sets: 0,
        last_completed_at: null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) throw new Error(`Error resetting workout: ${error.message}`);
    return data?.[0];
  },

  // Get workout templates
  async getTemplates() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
    return data || [];
  },

  // Save workout template
  async saveTemplate(templateData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workout_templates')
      .insert([{
        user_id: user.id,
        ...templateData,
        created_at: new Date(),
      }])
      .select();

    if (error) throw new Error(`Error saving template: ${error.message}`);
    return data?.[0];
  },
};

// ==================== NUTRITION SERVICES ====================

export const nutritionService = {
  // Get nutrition logs for a specific date
  async getLogsForDate(date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('meal_date', date)
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return (user.user_metadata?.nutrition_logs || []).filter((log) => log.meal_date === date);
      console.error('Error fetching nutrition logs:', error);
      return [];
    }
    return data || [];
  },

  // Get nutrition logs for date range
  async getLogsByDateRange(startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('meal_date', startDate)
      .lte('meal_date', endDate)
      .order('meal_date', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return (user.user_metadata?.nutrition_logs || []).filter((log) => log.meal_date >= startDate && log.meal_date <= endDate);
      console.error('Error fetching nutrition logs:', error);
      return [];
    }
    return data || [];
  },

  // Add nutrition log entry
  async addLog(logData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert([{
        user_id: user.id,
        ...logData,
        created_at: new Date(),
      }])
      .select();

    if (!error) return data?.[0];
    if (!isMissingTableError(error)) throw new Error(`Error adding nutrition log: ${error.message}`);
    const entry = { id: crypto.randomUUID(), ...logData, created_at: new Date().toISOString() };
    const { data: authData, error: authError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, nutrition_logs: [entry, ...(user.user_metadata?.nutrition_logs || [])].slice(0, 250) } });
    if (authError) throw new Error(`Error adding nutrition log: ${authError.message}`);
    return authData.user?.user_metadata?.nutrition_logs?.[0] || entry;
  },

  async updateLog(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('nutrition_logs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(`Error updating nutrition log: ${error.message}`);
    return data;
  },

  // Delete nutrition log
  async deleteLog(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) return;
    if (!isMissingTableError(error)) throw new Error(`Error deleting nutrition log: ${error.message}`);
    const { error: authError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, nutrition_logs: (user.user_metadata?.nutrition_logs || []).filter((log) => log.id !== id) } });
    if (authError) throw new Error(`Error deleting nutrition log: ${authError.message}`);
  },

  // Get nutrition goals
  async getGoals() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (isMissingTableError(error)) return user.user_metadata?.nutrition_goals || { daily_calories: 2500, daily_protein_g: 150, daily_carbs_g: 300, daily_fat_g: 70, is_default: true };
      // Return defaults if not found
      return {
        daily_calories: 2500,
        daily_protein_g: 150,
        daily_carbs_g: 300,
        daily_fat_g: 70,
        is_default: true,
      };
    }
    return data;
  },

  // Update nutrition goals
  async updateGoals(goals) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert({
        id: user.id,
        user_id: user.id,
        ...goals,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (!error) return data;
    if (!isMissingTableError(error)) throw new Error(`Error updating nutrition goals: ${error.message}`);
    const { data: authData, error: authError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, nutrition_goals: goals } });
    if (authError) throw new Error(`Error updating nutrition goals: ${authError.message}`);
    return authData.user?.user_metadata?.nutrition_goals || goals;
  },

  // Calculate daily totals
  async getDailyTotals(date) {
    const logs = await this.getLogsForDate(date);
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein_g || 0),
        carbs: acc.carbs + (log.carbs_g || 0),
        fat: acc.fat + (log.fat_g || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
};

// ==================== WEIGHT TRACKING SERVICES ====================

export const weightService = {
  // Get weight logs for date range
  async getLogsForRange(startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('weight_date', startDate)
      .lte('weight_date', endDate)
      .order('weight_date', { ascending: true });

    if (error) {
      console.error('Error fetching weight logs:', error);
      return [];
    }
    return data || [];
  },

  // Add weight log
  async addLog(weight, date = new Date().toISOString().split('T')[0], notes = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('weight_logs')
      .upsert({
        user_id: user.id,
        weight_kg: weight,
        weight_date: date,
        notes,
        created_at: new Date(),
      }, { onConflict: 'user_id,weight_date' })
      .select();

    if (error) throw new Error(`Error adding weight log: ${error.message}`);
    return data?.[0];
  },

  async updateLog(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('weight_logs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(`Error updating weight log: ${error.message}`);
    return data;
  },

  async deleteLog(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('weight_logs').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(`Error deleting weight log: ${error.message}`);
  },

  async deleteAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('weight_logs').delete().eq('user_id', user.id);
    if (error) throw new Error(`Error clearing weight logs: ${error.message}`);
  },

  // Get latest weight
  async getLatestWeight() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('weight_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching latest weight:', error);
    }
    return data || null;
  },

  // Calculate average weight for date range
  async getAverageWeight(startDate, endDate) {
    const logs = await this.getLogsForRange(startDate, endDate);
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + log.weight_kg, 0);
    return sum / logs.length;
  },

  // Get weight change between two dates
  async getWeightChange(startDate, endDate) {
    const logs = await this.getLogsForRange(startDate, endDate);
    if (logs.length < 2) return 0;
    return logs[logs.length - 1].weight_kg - logs[0].weight_kg;
  },
};

// ==================== BODY COMPOSITION SERVICES ====================

export const bodyCompositionService = {
  // Get body composition logs for date range
  async getLogsForRange(startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('body_composition')
      .select('*, measurement_date:date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching body composition logs:', error);
      return [];
    }

    return data || [];
  },

  // Add body composition log
  async addLog(data) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert the app's field names to the actual Supabase
    // body_composition table column names.
    const record = {
      user_id: user.id,
      bmi: data.bmi ?? null,
      body_fat: data.body_fat ?? null,
      weight: data.weight ?? data.weight_kg ?? null,
      lean_mass: data.lean_mass ?? null,
      fat_mass: data.fat_mass ?? null,
      bmr: data.bmr ?? null,
      maintenance: data.maintenance ?? null,
      date: data.date ?? data.measurement_date ?? new Date().toISOString().split('T')[0],
    };

    const { data: result, error } = await supabase
      .from('body_composition')
      .insert([record])
      .select('*, measurement_date:date');

    if (error) {
      throw new Error(`Error adding body composition log: ${error.message}`);
    }

    return result?.[0];
  },

  // Get latest measurement
  async getLatestMeasurement() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('body_composition')
      .select('*, measurement_date:date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching latest measurement:', error);
    }

    return data || null;
  },

  // Delete body composition log
  async deleteLog(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('body_composition')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Error deleting body composition log: ${error.message}`);
    }
  },
};

// ==================== PERSONAL RECORDS SERVICES ====================

export const prService = {
  // Get all personal records
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date_achieved', { ascending: false });

    if (error) {
      console.error('Error fetching personal records:', error);
      return [];
    }
    return data || [];
  },

  // Get PR for specific exercise
  async getPRForExercise(exerciseName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('exercise_name', exerciseName)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching PR:', error);
    }
    return data || null;
  },

  // Update personal record
  async upsertPR(exerciseName, weight, reps, date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const existingPR = await this.getPRForExercise(exerciseName);

    const { data, error } = await supabase
      .from('personal_records')
      .upsert({
        id: existingPR?.id,
        user_id: user.id,
        exercise_name: exerciseName,
        weight_kg: weight,
        reps,
        date_achieved: date,
      })
      .select()
      .single();

    if (error) throw new Error(`Error saving PR: ${error.message}`);
    return data;
  },
};

// ==================== ACHIEVEMENT SERVICES ====================

export const achievementService = {
  // Get all achievements
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
    return data || [];
  },

  // Unlock achievement
  async unlock(achievementType, achievementName, description, xpEarned) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('achievements')
      .insert([{
        user_id: user.id,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description,
        xp_earned: xpEarned,
        unlocked_at: new Date(),
      }])
      .select();

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw new Error(`Error unlocking achievement: ${error.message}`);
    }
    return data?.[0];
  },
};

// ==================== STREAK SERVICES ====================

export const streakService = {
  // Get streak for type
  async getStreak(streakType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('streak_type', streakType)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching streak:', error);
    }
    return data || null;
  },

  // Update streak
  async updateStreak(streakType, currentCount, bestCount) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const existingStreak = await this.getStreak(streakType);

    const { data, error } = await supabase
      .from('streaks')
      .upsert({
        id: existingStreak?.id,
        user_id: user.id,
        streak_type: streakType,
        current_count: currentCount,
        best_count: bestCount,
        last_activity_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw new Error(`Error updating streak: ${error.message}`);
    return data;
  },
};

// ==================== EXERCISE LIBRARY SERVICES ====================

export const exerciseLibraryService = {
  // Get all exercises
  async getAll() {
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
    return data || [];
  },

  // Get exercises by category
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
    return data || [];
  },

  // Search exercises
  async search(query) {
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
    return data || [];
  },
};
