import ExerciseCard from "./ExerciseCard";

export default function ExerciseLibrary() {
  const exercises = [
    { 
      name: "Bench Press", 
      category: "Chest", 
      image: "/Bench Press.jpg",
      instructions: "Lie on bench, grip bar shoulder-width, lower to chest"
    },
    { 
      name: "Squat", 
      category: "Legs",
      image: "/exercises/squat.jpg",
      instructions: "Stand with feet shoulder-width, lower hips back and down"
    },
    { 
      name: "Deadlift", 
      category: "Back",
      image: "/exercises/deadlift.jpg",
      instructions: "Stand with feet shoulder-width, bend at hips and knees to lift bar"
    },
    { 
      name: "Overhead Press", 
      category: "Shoulders",
      image: "/exercises/overhead_press.jpg",
      instructions: "Stand with feet shoulder-width, press bar overhead"
    },
    { 
      name: "Barbell Row", 
      category: "Back",
      image: "/exercises/barbell_row.jpg",
      instructions: "Bend at hips, pull bar to lower chest"
    },    
    { 
      name: "Pull-up", 
      category: "Back",
      image: "/exercises/pull_up.jpg",
      instructions: "Hang from bar, pull body up until chin is above the bar"
    },
    { 
      name: "Dumbbell Curl",
      category: "Arms",
      image: "/exercises/dumbbell_curl.jpg",
      instructions: "Stand with dumbbells at sides, curl weights up to shoulders"
    },
    { 
      name: "Tricep Dip", 
      category: "Arms",
      image: "/exercises/tricep_dip.jpg",
      instructions: "Place hands on edge of bench, lower body by bending elbows"
    },
    { 
      name: "Lunge", 
      category: "Legs",
      image: "/exercises/lunge.jpg",
      instructions: "Stand with feet hip-width apart, step forward with one leg, lowering hips until both knees are bent at 90 degrees"
    },
    { 
      name: "Plank", 
      category: "Core",
      image: "/exercises/plank.jpg",
      instructions: "Get into push-up position, hold body in a straight line from head to heels"
    },
    { 
      name: "Russian Twist", 
      category: "Core",
      image: "/exercises/russian_twist.jpg",
      instructions: "Sit on the floor, lean back slightly, and rotate your torso from side to side"
    },
    { 
      name: "Leg Raise", 
      category: "Core",
      image: "/exercises/leg_raise.jpg",
      instructions: "Lie on your back, lift your legs to a 90-degree angle, and lower them slowly"
    },
    { 
      name: "Mountain Climber", 
      category: "Core",
      image: "/exercises/mountain_climber.jpg",
      instructions: "Get into push-up position, bring one knee towards your chest, then the other"
    },
    { 
      name: "Burpee",
      category: "Full Body",
      image: "/exercises/burpee.jpg",
      instructions: "Start in standing position, lower body to push-up position, perform a push-up, jump feet to hands, and stand up"
    },
    { 
      name: "Jumping Jack", 
      category: "Full Body",
      image: "/exercises/jumping_jack.jpg",
      instructions: "Start in standing position, jump feet apart while raising arms overhead"
    },
    { 
      name: "Kettlebell Swing", 
      category: "Full Body",
      image: "/exercises/kettlebell_swing.jpg",
      instructions: "Stand with feet shoulder-width apart, swing kettlebell between legs, and lift it to shoulder height"
    }

  ];

  return (
    <div className="exercise-library">
      <h2>Exercise Library</h2>
      <div className="exercise-grid">
        {exercises.map(exercise => (
          <ExerciseCard key={exercise.name} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}