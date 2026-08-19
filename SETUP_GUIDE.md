# FitTrack Setup Guide: From Prototype to Production

## Quick Start (30 minutes)

### Step 1: Set Up Supabase Database Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (moiybjysoshxhgilakca)
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `supabase/schema.sql`
6. Click **Run**

This creates:
- ✅ All database tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ User data isolation

### Step 2: Verify RLS is Working

In SQL Editor, run:
```sql
SELECT * FROM fitness_goals WHERE user_id = auth.uid();
```

You should only see YOUR goals (or empty if none exist).

### Step 3: Test the Services

In your React component:
```javascript
import { goalsService, workoutService } from '../services/supabaseService';

// Test getting data
const goal = await goalsService.getGoal();
console.log(goal); // Should work!

const workouts = await workoutService.getWorkouts();
console.log(workouts); // Should work!
```

---

## Phase-by-Phase Implementation

### Phase 1: Database Setup (Already Done ✅)

**What was created:**
- [x] Comprehensive database schema
- [x] User profile & settings tables
- [x] Workout, nutrition, weight, body composition tables
- [x] Goal, achievement, streak tables
- [x] Row Level Security for all tables
- [x] Service layer (supabaseService.js)
- [x] Analytics engine (analyticsService.js)

**Files created:**
- `supabase/schema.sql` - Database schema with RLS
- `src/services/supabaseService.js` - Database operations
- `src/services/analyticsService.js` - Analytics & insights
- `PRODUCTION_ROADMAP.md` - Implementation guide

---

### Phase 2: Component Migration (Next 2 weeks)

#### Task: Migrate WorkoutTracker.jsx to Supabase

**Current state:** Uses Supabase for workouts (good!)
**Needed:** Ensure all operations use supabaseService

**Steps:**

1. **Update WorkoutTracker.jsx**
```javascript
// OLD - Direct Supabase calls
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id);

// NEW - Use service layer
import { workoutService } from '../services/supabaseService';
const workouts = await workoutService.getWorkouts();
```

2. **Test each operation:**
- [ ] Load workouts - should show existing data
- [ ] Add workout - should add to database
- [ ] Edit workout - should update database
- [ ] Delete workout - should remove from database
- [ ] Complete set - should stay on page (not reload)
- [ ] Reset progress - should work instantly

---

#### Task: Migrate NutritionTracker.jsx

**Current state:** Uses localStorage
**Target:** Migrate to Supabase

**Steps:**

1. **Replace localStorage calls:**
```javascript
// OLD
const meals = JSON.parse(localStorage.getItem('nutritionLog') || '[]');

// NEW
import { nutritionService } from '../services/supabaseService';
const meals = await nutritionService.getLogsForDate(todayDate);
```

2. **Update functions:**
```javascript
// OLD
const addFood = (food) => {
  const nutrition = JSON.parse(localStorage.getItem('nutritionLog') || '[]');
  nutrition.unshift(newMeal);
  localStorage.setItem('nutritionLog', JSON.stringify(nutrition));
  setMeals(nutrition);
};

// NEW
const addFood = async (food) => {
  const meal = await nutritionService.addLog({
    meal_date: todayDate,
    meal_type: selectedMealType,
    food_name: food.name,
    calories: food.calories,
    protein_g: food.protein,
    carbs_g: food.carbs,
    fat_g: food.fat,
  });
  setMeals([meal, ...meals]);
};
```

---

#### Task: Migrate WeightTracker.jsx

**Current state:** Uses localStorage
**Target:** Migrate to Supabase

**Implementation:**
```javascript
import { weightService } from '../services/supabaseService';

// Get weight history
const weights = await weightService.getLogsForRange(startDate, endDate);

// Add weight entry
const newEntry = await weightService.addLog(weight, date);
setWeights([newEntry, ...weights]);

// Get latest weight
const latest = await weightService.getLatestWeight();
```

---

#### Task: Migrate Other Components

Similar approach for:
- [ ] BodyComposition.jsx → bodyCompositionService
- [ ] PersonalRecords.jsx → prService
- [ ] UserProfile.jsx → userService
- [ ] Dashboard.jsx → Multiple services

---

### Phase 3: Smart Features (Week 3-4)

#### Task: Create Analytics Dashboard

**File:** `src/components/AnalyticsDashboard.jsx`

**Features to display:**
- Weight trend with chart
- Body fat change
- Strength progression
- Training volume over time
- Nutrition compliance
- Workout completion rate
- Weekly/monthly comparisons

**Implementation:**
```javascript
import { analyticsService } from '../services/analyticsService';

const summary = await analyticsService.getPerformanceSummary(
  '2026-08-01',
  '2026-08-31'
);

// summary includes:
// - weight.change
// - bodyFat.change
// - strength.improvements
// - training.completionRate
// - nutrition.avgProtein
// - insights (array of recommendations)
```

---

#### Task: Create My Plan Dashboard

**File:** `src/components/MyPlan.jsx` (Already created!)

**Status:** Ready to integrate!

**How to add to app:**
1. Import in App.jsx
2. Add "My Plan" button to navigation
3. Route to MyPlan component
4. Test creating/editing goals

---

#### Task: Implement Insights System

**Use analyticsService.generateInsights()**

```javascript
const summary = await analyticsService.getPerformanceSummary(start, end);
const insights = summary.insights;

// Insights look like:
// [
//   {
//     type: 'achievement',
//     title: 'Great Progress!',
//     message: 'You\'ve lost 2.4kg this period.',
//     priority: 'high'
//   },
//   {
//     type: 'attention',
//     title: 'Protein Intake Low',
//     message: 'Your average protein is 140g/day. Aim for 150g+.',
//     priority: 'high'
//   }
// ]

// Display in dashboard:
{insights.map(insight => (
  <InsightCard key={insight.title} insight={insight} />
))}
```

---

### Phase 4: Onboarding (Week 4-5)

**File:** `src/components/Onboarding/`

**Create these components:**
1. `Step1About.jsx` - Age, height, weight, gender
2. `Step2Goal.jsx` - Weight loss, muscle gain, strength, maintenance
3. `Step3Training.jsx` - Experience, days/week, equipment
4. `Step4Nutrition.jsx` - Calories, protein, diet preference
5. `OnboardingFlow.jsx` - Orchestrates all steps

**Implementation:**
```javascript
// Onboarding.jsx
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({});

const handleComplete = async () => {
  // Save user profile
  await userService.upsertProfile({
    age: formData.age,
    height_cm: formData.height,
    weight_kg: formData.weight,
  });

  // Create fitness goal
  await goalsService.upsertGoal({
    goal_type: formData.goal,
    target_weight_kg: formData.targetWeight,
    training_days_per_week: formData.trainingDays,
  });

  // Set nutrition goals
  await nutritionService.updateGoals({
    daily_calories: formData.calories,
    daily_protein_g: formData.protein,
  });

  // Redirect to dashboard
  navigate('/dashboard');
};
```

---

### Phase 5: PWA Setup (Week 5-6)

**Files to create:**

1. **public/manifest.json**
```json
{
  "name": "FitTrack - Fitness Companion",
  "short_name": "FitTrack",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **public/sw.js** - Service Worker for offline support
3. **Update vite.config.js** - Add PWA plugin
4. **Create app icons** - 192x192 and 512x512 PNG files

---

### Phase 6: Security Hardening (Week 6-7)

**Checklist:**
- [ ] All sensitive data in Supabase (no localStorage except theme)
- [ ] RLS policies tested and working
- [ ] Input validation on all forms
- [ ] Error boundaries around components
- [ ] Session expiration handling
- [ ] Password reset flow
- [ ] Email verification
- [ ] Account deletion workflow

**Example: Input Validation**
```javascript
const validateWorkout = (data) => {
  if (!data.name?.trim()) return 'Exercise name required';
  if (data.sets < 1 || data.sets > 100) return 'Sets must be 1-100';
  if (data.reps < 1 || data.reps > 100) return 'Reps must be 1-100';
  if (data.weight < 0 || data.weight > 500) return 'Invalid weight';
  return null;
};
```

---

### Phase 7: Testing (Week 7-8)

**Create test files:**
```
src/services/__tests__/
├── supabaseService.test.js
├── analyticsService.test.js
└── authService.test.js

src/components/__tests__/
├── MyPlan.test.jsx
├── WorkoutTracker.test.jsx
└── Dashboard.test.jsx
```

**Example test:**
```javascript
import { workoutService } from '../services/supabaseService';

describe('workoutService', () => {
  it('should add a workout', async () => {
    const workout = await workoutService.addWorkout({
      name: 'Bench Press',
      sets: 4,
      reps: 8,
      weight: 100,
    });
    expect(workout.id).toBeDefined();
    expect(workout.name).toBe('Bench Press');
  });
});
```

---

## Common Migration Patterns

### Pattern 1: Load Data
```javascript
// Before (localStorage)
const data = JSON.parse(localStorage.getItem('key') || '[]');

// After (Supabase)
const data = await service.get();
```

### Pattern 2: Add Data
```javascript
// Before (localStorage)
const data = JSON.parse(localStorage.getItem('key') || '[]');
data.unshift(newItem);
localStorage.setItem('key', JSON.stringify(data));

// After (Supabase)
const newItem = await service.add(item);
setData([newItem, ...data]);
```

### Pattern 3: Update Data
```javascript
// Before (localStorage)
const items = JSON.parse(localStorage.getItem('key') || '[]');
const updated = items.map(item => 
  item.id === targetId ? { ...item, ...changes } : item
);
localStorage.setItem('key', JSON.stringify(updated));

// After (Supabase)
const updated = await service.update(targetId, changes);
setData(data.map(item => item.id === updated.id ? updated : item));
```

### Pattern 4: Delete Data
```javascript
// Before (localStorage)
const items = JSON.parse(localStorage.getItem('key') || '[]');
const filtered = items.filter(item => item.id !== targetId);
localStorage.setItem('key', JSON.stringify(filtered));

// After (Supabase)
await service.delete(targetId);
setData(data.filter(item => item.id !== targetId));
```

---

## Debugging & Troubleshooting

### RLS Issues

**Problem:** "Row level security violation"

**Solution:**
1. Check user is logged in: `supabase.auth.getUser()`
2. Verify RLS policy allows operation
3. Check user_id matches auth.uid()

```sql
-- Test RLS
SELECT * FROM workouts WHERE user_id = auth.uid() LIMIT 1;
-- Should show your workouts or empty (not error)
```

### Data Not Appearing

**Problem:** Data added to Supabase but not showing in app

**Solution:**
1. Verify data is actually in database (Supabase dashboard)
2. Check user_id matches current user
3. Verify RLS policy is correct
4. Add console.log to debug

```javascript
const workouts = await workoutService.getWorkouts();
console.log('Current user:', (await supabase.auth.getUser()).data.user.id);
console.log('Workouts:', workouts);
```

### Cross-User Access (Security Issue!)

**Problem:** Users can see other users' data

**Solution:**
1. Check all queries filter by user_id
2. Verify RLS policies are enabled
3. Test with different accounts

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
-- Should show "true" for all tables
```

---

## Performance Optimization

### Index the Right Columns

```sql
-- These are already created, but here's the pattern:
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);
```

### Batch Queries When Possible

```javascript
// Instead of 5 separate queries:
const weight = await weightService.getLatestWeight();
const nutrition = await nutritionService.getGoals();
const workout = await workoutService.getWorkouts();
// ...

// Do this:
const [weight, nutrition, workout] = await Promise.all([
  weightService.getLatestWeight(),
  nutritionService.getGoals(),
  workoutService.getWorkouts(),
]);
```

### Use Real-Time Subscriptions (Advanced)

```javascript
// Subscribe to workout changes
const subscription = supabase
  .from('workouts')
  .on('*', payload => {
    console.log('Change received!', payload);
    // Update local state
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All services working with Supabase
- [ ] RLS policies tested
- [ ] No console errors
- [ ] Performance acceptable
- [ ] All forms have validation
- [ ] Error handling in place
- [ ] Environment variables configured
- [ ] Database backups working
- [ ] Analytics tracking set up
- [ ] Error logging configured
- [ ] Tested on mobile devices
- [ ] Tested offline (PWA)
- [ ] Security audit completed

---

## Next Steps

1. **This week:**
   - [ ] Execute schema.sql in Supabase
   - [ ] Test services with current user
   - [ ] Verify RLS is working
   - [ ] Start migrating WorkoutTracker

2. **Next week:**
   - [ ] Complete component migrations
   - [ ] Build Analytics Dashboard
   - [ ] Add My Plan to navigation
   - [ ] Test all features

3. **Week 3:**
   - [ ] Create Onboarding flow
   - [ ] Implement insights
   - [ ] Add PWA support

4. **Week 4:**
   - [ ] Security hardening
   - [ ] Comprehensive testing
   - [ ] Performance optimization
   - [ ] Deploy to production

---

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [React Hooks](https://react.dev/reference/react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

## Questions & Troubleshooting

If something isn't working:

1. **Check the browser console** for error messages
2. **Check Supabase logs** - Dashboard → Logs
3. **Verify your user is logged in** - `supabase.auth.getUser()`
4. **Test RLS policies** in SQL Editor
5. **Check data exists** in Supabase dashboard
6. **Verify service functions** are using correct table names

Good luck! 🚀
