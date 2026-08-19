import { 
  workoutService, 
  nutritionService, 
  weightService, 
  bodyCompositionService,
  prService 
} from './supabaseService';

// ==================== ANALYTICS & INSIGHTS ENGINE ====================

export const analyticsService = {
  // Get comprehensive performance summary for date range
  async getPerformanceSummary(startDate, endDate) {
    const [weights, compositions, workouts, nutrition] = await Promise.all([
      weightService.getLogsForRange(startDate, endDate),
      bodyCompositionService.getLogsForRange(startDate, endDate),
      this.getWorkoutStats(startDate, endDate),
      this.getNutritionStats(startDate, endDate),
    ]);

    return {
      period: { startDate, endDate },
      weight: this.analyzeWeightChange(weights),
      bodyFat: this.analyzeBodyFatChange(compositions),
      strength: await this.analyzeStrengthProgression(startDate, endDate),
      training: workouts,
      nutrition,
      insights: await this.generateInsights(weights, compositions, workouts, nutrition),
    };
  },

  // Analyze weight changes
  analyzeWeightChange(weightLogs) {
    if (weightLogs.length < 2) return null;

    const first = weightLogs[0];
    const last = weightLogs[weightLogs.length - 1];
    const change = last.weight_kg - first.weight_kg;
    const percentChange = ((change / first.weight_kg) * 100).toFixed(2);
    
    // Calculate trend (linear regression)
    const trend = this.calculateTrend(weightLogs.map(w => ({
      date: w.weight_date,
      value: w.weight_kg
    })));

    return {
      startWeight: first.weight_kg,
      currentWeight: last.weight_kg,
      change,
      percentChange,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      slope: trend,
      logs: weightLogs,
    };
  },

  // Analyze body fat changes
  analyzeBodyFatChange(compositions) {
    if (compositions.length < 2) return null;

    const first = compositions[0];
    const last = compositions[compositions.length - 1];
    const change = last.body_fat_percentage - first.body_fat_percentage;
    const percentChange = ((change / first.body_fat_percentage) * 100).toFixed(2);

    return {
      startBodyFat: first.body_fat_percentage,
      currentBodyFat: last.body_fat_percentage,
      change,
      percentChange,
      trend: change < 0 ? 'decreasing' : change > 0 ? 'increasing' : 'stable',
      logs: compositions,
    };
  },

  // Analyze strength progression
  async analyzeStrengthProgression(startDate, endDate) {
    const prs = await prService.getAll();
    
    if (prs.length === 0) {
      return {
        totalPRs: 0,
        improvements: [],
        avgImprovement: 0,
      };
    }

    // Filter PRs in date range
    const periodPRs = prs.filter(pr => 
      pr.date_achieved >= startDate && pr.date_achieved <= endDate
    );

    // Calculate improvements
    const improvements = periodPRs.map(pr => ({
      exercise: pr.exercise_name,
      weight: pr.weight_kg,
      reps: pr.reps,
      date: pr.date_achieved,
    }));

    return {
      totalPRs: improvements.length,
      improvements,
      avgImprovement: improvements.length > 0 ? improvements.length : 0,
    };
  },

  // Get workout statistics
  async getWorkoutStats(startDate, endDate) {
    const workouts = await workoutService.getWorkouts();
    
    const periodWorkouts = workouts.filter(w => 
      w.created_at.split('T')[0] >= startDate && 
      w.created_at.split('T')[0] <= endDate
    );

    const totalWorkouts = periodWorkouts.length;
    const totalSets = periodWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0);
    const completedSets = periodWorkouts.reduce((sum, w) => sum + (w.completed_sets || 0), 0);
    const completionRate = totalSets > 0 ? ((completedSets / totalSets) * 100).toFixed(1) : 0;

    // Workouts per day
    const dayMap = {};
    periodWorkouts.forEach(w => {
      const date = w.created_at.split('T')[0];
      dayMap[date] = (dayMap[date] || 0) + 1;
    });

    const daysWorked = Object.keys(dayMap).length;
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const frequency = daysWorked > 0 ? (daysWorked / totalDays * 100).toFixed(1) : 0;

    // Most trained muscle groups
    const muscleMap = {};
    periodWorkouts.forEach(w => {
      muscleMap[w.category] = (muscleMap[w.category] || 0) + 1;
    });

    const topMuscles = Object.entries(muscleMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle, count]) => ({ muscle, count }));

    return {
      totalWorkouts,
      daysWorked,
      totalDays,
      frequency: parseFloat(frequency),
      totalSets,
      completedSets,
      completionRate: parseFloat(completionRate),
      topMuscles,
      dayMap,
    };
  },

  // Get nutrition statistics
  async getNutritionStats(startDate, endDate) {
    const logs = await nutritionService.getLogsByDateRange(startDate, endDate);
    
    if (logs.length === 0) {
      return {
        daysLogged: 0,
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
      };
    }

    // Group by date
    const dateMap = {};
    logs.forEach(log => {
      if (!dateMap[log.meal_date]) {
        dateMap[log.meal_date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
      dateMap[log.meal_date].calories += log.calories || 0;
      dateMap[log.meal_date].protein += log.protein_g || 0;
      dateMap[log.meal_date].carbs += log.carbs_g || 0;
      dateMap[log.meal_date].fat += log.fat_g || 0;
    });

    const daysLogged = Object.keys(dateMap).length;
    const totals = Object.values(dateMap).reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      daysLogged,
      avgCalories: (totals.calories / daysLogged).toFixed(0),
      avgProtein: (totals.protein / daysLogged).toFixed(1),
      avgCarbs: (totals.carbs / daysLogged).toFixed(1),
      avgFat: (totals.fat / daysLogged).toFixed(1),
      dailyByDate: dateMap,
    };
  },

  // Generate actionable insights
  async generateInsights(weights, compositions, workouts, nutrition) {
    const insights = [];

    // Weight insights
    if (weights && weights.length >= 2) {
      const weightAnalysis = this.analyzeWeightChange(weights);
      if (weightAnalysis.change < -2) {
        insights.push({
          type: 'achievement',
          title: 'Great Progress!',
          message: `You've lost ${Math.abs(weightAnalysis.change).toFixed(1)}kg this period.`,
          priority: 'high',
        });
      } else if (weightAnalysis.change > 2) {
        insights.push({
          type: 'attention',
          title: 'Weight Trending Up',
          message: `Your weight increased by ${weightAnalysis.change.toFixed(1)}kg. Review your nutrition.`,
          priority: 'medium',
        });
      }
    }

    // Body fat insights
    if (compositions && compositions.length >= 2) {
      const bfAnalysis = this.analyzeBodyFatChange(compositions);
      if (bfAnalysis.change < -0.5) {
        insights.push({
          type: 'achievement',
          title: 'Body Composition Improving',
          message: `Your body fat decreased by ${Math.abs(bfAnalysis.change).toFixed(1)}%.`,
          priority: 'high',
        });
      }
    }

    // Training consistency
    if (workouts.completionRate >= 90) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Consistency!',
        message: `Your completion rate is ${workouts.completionRate}%. Keep it up!`,
        priority: 'high',
      });
    } else if (workouts.completionRate < 60) {
      insights.push({
        type: 'attention',
        title: 'Improve Consistency',
        message: `You're completing ${workouts.completionRate}% of planned sets. Try to push for 80%+.`,
        priority: 'medium',
      });
    }

    // Training frequency
    if (workouts.frequency > 70) {
      insights.push({
        type: 'achievement',
        title: 'Great Training Frequency',
        message: `You're training ${workouts.frequency}% of days. Excellent dedication!`,
        priority: 'high',
      });
    } else if (workouts.frequency < 40) {
      insights.push({
        type: 'attention',
        title: 'Increase Training Frequency',
        message: `You're training ${workouts.frequency}% of days. Try to schedule more sessions.`,
        priority: 'low',
      });
    }

    // Nutrition tracking
    if (nutrition.daysLogged < 3) {
      insights.push({
        type: 'suggestion',
        title: 'Start Logging Nutrition',
        message: 'You\'re only logging nutrition on ' + nutrition.daysLogged + ' days. This data is crucial for progress.',
        priority: 'medium',
      });
    }

    // Protein insights
    if (nutrition.avgProtein < 1.2) {
      insights.push({
        type: 'attention',
        title: 'Protein Intake Low',
        message: `Your average protein is ${nutrition.avgProtein}g/day. Aim for 1.2-1.6g per kg bodyweight.`,
        priority: 'high',
      });
    }

    // Muscle group insights
    if (workouts.topMuscles.length > 0) {
      const leastTrained = this.findLeastTrainedMuscles(workouts.topMuscles);
      if (leastTrained) {
        insights.push({
          type: 'suggestion',
          title: 'Balanced Training',
          message: `Consider training ${leastTrained} more. You're focusing heavily on ${workouts.topMuscles[0]?.muscle}.`,
          priority: 'low',
        });
      }
    }

    return insights;
  },

  // Calculate linear trend
  calculateTrend(dataPoints) {
    if (dataPoints.length < 2) return 0;

    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    dataPoints.forEach((point, index) => {
      sumX += index;
      sumY += point.value;
      sumXY += index * point.value;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  },

  // Find least trained muscle groups
  findLeastTrainedMuscles(topMuscles) {
    const allMuscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const trained = topMuscles.map(m => m.muscle);
    const untrained = allMuscles.filter(m => !trained.includes(m));
    
    return untrained.length > 0 ? untrained[0] : null;
  },

  // Get comparison between two periods
  async comparePeriods(period1Start, period1End, period2Start, period2End) {
    const [stats1, stats2] = await Promise.all([
      this.getPerformanceSummary(period1Start, period1End),
      this.getPerformanceSummary(period2Start, period2End),
    ]);

    return {
      period1: stats1,
      period2: stats2,
      improvements: {
        weight: stats1.weight && stats2.weight 
          ? stats2.weight.change - stats1.weight.change 
          : null,
        completion: stats2.training.completionRate - stats1.training.completionRate,
        frequency: stats2.training.frequency - stats1.training.frequency,
      },
    };
  },

  // Calculate wellness score (0-100)
  calculateWellnessScore(summary) {
    let score = 50; // Base score

    if (summary.training.completionRate >= 80) score += 20;
    else if (summary.training.completionRate >= 60) score += 10;

    if (summary.training.frequency >= 70) score += 15;
    else if (summary.training.frequency >= 50) score += 7;

    if (summary.weight?.trend === 'stable') score += 15;
    else if (summary.weight?.change < -2) score += 20;

    if (summary.nutrition.daysLogged >= 20) score += 10;

    return Math.min(100, Math.max(0, score));
  },
};

// ==================== REAL-TIME NOTIFICATIONS ====================

export const notificationService = {
  // Check if achievement should be unlocked
  async checkAchievements(summary) {
    const achievements = [];

    // Workout milestones
    if (summary.training.totalWorkouts === 1) {
      achievements.push({
        type: 'milestone',
        title: 'First Workout',
        description: 'Completed your first workout!',
        xp: 50,
      });
    } else if (summary.training.totalWorkouts === 10) {
      achievements.push({
        type: 'milestone',
        title: 'Dedicated',
        description: 'Completed 10 workouts!',
        xp: 100,
      });
    } else if (summary.training.totalWorkouts === 50) {
      achievements.push({
        type: 'milestone',
        title: 'Iron Warrior',
        description: 'Completed 50 workouts!',
        xp: 500,
      });
    }

    // Consistency achievements
    if (summary.training.completionRate >= 90) {
      achievements.push({
        type: 'consistency',
        title: 'Unstoppable',
        description: 'Maintained 90%+ completion rate!',
        xp: 200,
      });
    }

    // Weight loss achievements
    if (summary.weight?.change < -5) {
      achievements.push({
        type: 'progress',
        title: 'Significant Progress',
        description: 'Lost 5kg!',
        xp: 150,
      });
    }

    return achievements;
  },
};
