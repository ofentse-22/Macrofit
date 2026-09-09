
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  experience_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER SETTINGS ====================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark', -- 'dark', 'light'
  notifications_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  units TEXT DEFAULT 'metric', -- 'metric' or 'imperial'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== FITNESS GOALS ====================
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'strength', 'maintenance'
  target_weight_kg DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  target_body_fat DECIMAL(4,2),
  target_strength_kg DECIMAL(6,2),
  training_days_per_week INTEGER,
  daily_calorie_target INTEGER,
  daily_protein_target DECIMAL(6,2),
  daily_carbs_target DECIMAL(6,2),
  daily_fat_target DECIMAL(6,2),
  start_date DATE,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One active goal per user
);

-- ==================== WORKOUTS ====================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'
  exercise_library_id UUID,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg DECIMAL(6,2),
  rest_time_seconds INTEGER DEFAULT 60,
  completed_sets INTEGER DEFAULT 0,
  image_url TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_completed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);

-- Safe migration for projects created before updated_at was added.
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMP WITH TIME ZONE;

-- ==================== WORKOUT TEMPLATES ====================
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB, -- Array of exercises with sets/reps
  days_per_week INTEGER,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== WORKOUT HISTORY ====================
CREATE TABLE IF NOT EXISTS workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  template_id UUID REFERENCES workout_templates(id),
  total_exercises INTEGER,
  total_sets INTEGER,
  completed_sets INTEGER,
  completion_rate DECIMAL(3,2),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX idx_workout_history_date ON workout_history(workout_date);

-- ==================== PERSONAL RECORDS ====================
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(6,2),
  reps INTEGER,
  date_achieved DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_name) -- One PR per exercise per user
);

-- ==================== NUTRITION ====================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snacks'
  food_name TEXT NOT NULL,
  quantity DECIMAL(6,2),
  quantity_unit TEXT, -- 'g', 'oz', 'cup', 'serving'
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(meal_date);

-- ==================== NUTRITION GOALS ====================
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calories INTEGER DEFAULT 2500,
  daily_protein_g DECIMAL(6,2) DEFAULT 150,
  daily_carbs_g DECIMAL(6,2) DEFAULT 300,
  daily_fat_g DECIMAL(6,2) DEFAULT 70,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== WEIGHT TRACKING ====================
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  weight_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, weight_date)
);

CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(weight_date);

-- ==================== BODY COMPOSITION ====================
CREATE TABLE IF NOT EXISTS body_composition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  water_percentage DECIMAL(4,2),
  bone_mass_kg DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_body_composition_user_id ON body_composition_logs(user_id);
CREATE INDEX idx_body_composition_date ON body_composition_logs(measurement_date);

-- ==================== EXERCISE LIBRARY ====================
-- Shared across all users
CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  image_url TEXT,
  equipment TEXT, -- 'barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell'
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  muscle_groups TEXT[], -- Array of primary/secondary muscles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workouts_exercise_library_id_fkey'
  ) THEN
    ALTER TABLE workouts
      ADD CONSTRAINT workouts_exercise_library_id_fkey
      FOREIGN KEY (exercise_library_id) REFERENCES exercise_library(id);
  END IF;
END $$;

-- ==================== ACHIEVEMENTS ====================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  xp_earned INTEGER,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type, achievement_name)
);

-- ==================== STREAKS ====================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL, -- 'workout', 'nutrition_logging'
  current_count INTEGER DEFAULT 1,
  best_count INTEGER DEFAULT 1,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- ==================== REMINDERS ====================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reminder_type TEXT, -- 'workout', 'nutrition', 'measurement'
  reminder_time INTEGER, -- minutes before activity
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_composition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only view/edit their own
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings: Users can only view/edit their own
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fitness goals: Users can only view/edit their own
CREATE POLICY "Users can view their own goals" ON fitness_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON fitness_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON fitness_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Workouts: Users can only view/edit their own
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout templates: Users can only view/edit their own (or public ones)
CREATE POLICY "Users can view their own templates" ON workout_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own templates" ON workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Workout history: Users can only view/edit their own
CREATE POLICY "Users can view their own workout history" ON workout_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history" ON workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history" ON workout_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Personal records: Users can only view/edit their own
CREATE POLICY "Users can view their own records" ON personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" ON personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON personal_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Nutrition logs: Users can only view/edit their own
CREATE POLICY "Users can view their own nutrition" ON nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition" ON nutrition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition" ON nutrition_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition" ON nutrition_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Nutrition goals: Users can only view/edit their own
CREATE POLICY "Users can view their own nutrition goals" ON nutrition_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition goals" ON nutrition_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition goals" ON nutrition_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Weight logs: Users can only view/edit their own
CREATE POLICY "Users can view their own weight logs" ON weight_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight logs" ON weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight logs" ON weight_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight logs" ON weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Body composition: Users can only view/edit their own
CREATE POLICY "Users can view their own body composition" ON body_composition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body composition" ON body_composition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body composition" ON body_composition_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Exercise library: Everyone can read
CREATE POLICY "Everyone can view exercises" ON exercise_library
  FOR SELECT USING (true);

-- Achievements: Users can only view/edit their own
CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks: Users can only view/edit their own
CREATE POLICY "Users can view their own streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Reminders: Users can only view/edit their own
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);
