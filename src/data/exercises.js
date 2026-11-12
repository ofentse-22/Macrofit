const exercises = [
    { 
      name: "Dumbbell Curl",
      category: "Arms",
      image: "/FitPic/Dumbbell Curl.jpg",
      instructions: "Stand with dumbbells at sides, curl weights up to shoulders"
    },
    { 
      name: "Tricep Dip", 
      category: "Arms",
      image: "/FitPic/Tricep Dip.jpg",
      instructions: "Place hands on edge of bench, lower body by bending elbows"
    },
    { 
      name: "Lunge", 
      category: "Legs",
      image: "/FitPic/lunge.jpg",
      instructions: "Stand with feet hip-width apart, step forward with one leg, lowering hips until both knees are bent at 90 degrees"
    },
    { 
      name: "Plank", 
      category: "Core",
      image: "/FitPic/plank.jpg",
      instructions: "Get into push-up position, hold body in a straight line from head to heels"
    },
    { 
      name: "Russian Twist", 
      category: "Core",
      image: "/FitPic/russian_twist.jpg",
      instructions: "Sit on the floor, lean back slightly, and rotate your torso from side to side"
    },
    { 
      name: "Leg Raise", 
      category: "Core",
      image: "/FitPic/leg_raise.jpg",
      instructions: "Lie on your back, lift your legs to a 90-degree angle, and lower them slowly"
    },

    { 
      name: "Jumping Jack", 
      category: "Full Body",
      image: "/FitPic/jumping_jack.jpg",
      instructions: "Start in standing position, jump feet apart while raising arms overhead"
    },
    { 
      name: "Kettlebell Swing", 
      category: "Full Body",
      image: "/FitPic/kettlebell_swing.jpg",
      instructions: "Stand with feet shoulder-width apart, swing kettlebell between legs, and lift it to shoulder height"
    },
    {
      name: "Calf Raise",
      category: "Legs",
      image: "/FitPic/calf_raise.jpg",
      instructions: "Stand on the edge of a step with your heels hanging off, raise your toes, and lower them back down"
    },
    {
      name: "Side Plank",
      category: "Core",
      image: "/FitPic/side_plank.jpg",
      instructions: "Lie on your side, lift your hips off the ground, and hold your body in a straight line"
    },
    {
      name: "Bicycle Crunch",
      category: "Core",
      image: "/FitPic/bicycle_crunch.jpg",
      instructions: "Lie on your back, bring your knees towards your chest, and twist your torso to bring opposite elbow towards the knee"
    },
    {
      name: "Hammer Curl",
      category: "Arms",
      image: "/FitPic/hammer_curl.jpg",
      instructions: "Stand with dumbbells at sides, curl weights up to shoulders with palms facing each other"
    },
    { name: "Chest Fly",
      category: "Chest",
      image: "/FitPic/chest_fly.jpg",
      instructions: "Lie on a flat bench with a dumbbell in each hand, arms extended above your chest"
    },
    {
      name: "Arnold Press",
      category: "Shoulders",
      image: "/FitPic/arnold_press.jpg",
      instructions: "Stand with dumbbells at shoulders, rotate weights forward and up in a circular motion"
    },
    {
      name: "Front Raise",
      category: "Shoulders",
      image: "/FitPic/front_raise.jpg",
      instructions: "Stand with dumbbells in front of thighs, lift weights straight up to shoulder height"
    },
    { name: "Lateral Raise",
      category: "Shoulders",
      image: "/FitPic/lateral_raise.jpg",
      instructions: "Stand with dumbbells at sides, lift weights out to the sides until they are at shoulder height"
    },
    { 
      name: "Reverse Fly",
      category: "Back",
      image: "/FitPic/reverse_fly.jpg",
      instructions: "Bend at hips, lift dumbbells out to the sides until they are at shoulder height"
    },
    { name: "Leg Press",
      category: "Legs",
      image: "/FitPic/leg_press.jpg",
      instructions: " Sit on leg press machine, place feet on platform, and push the weight away from your body"
    },
    { name: "Cross-Body Hammer Curl",
      category: "Arms",
      image: "/FitPic/cross_body_hammer_curl.jpg",
      instructions: "Stand with dumbbells at sides, curl weights up to shoulders with palms facing each other"
    },
    {
      name: "Overhead Tricep Extension",
      category: "Arms",
      image: "/FitPic/overhead_tricep_extension.jpg",
      instructions: "Stand with a barbell or dumbbells overhead, extend your arms fully, and lower the weight behind your head"
    },
    {
      name: "Incline Barbell Bench Press",
      category: "Chest",
      image: "/FitPic/incline_barbell_bench_press.jpg",
      instructions: "Lie on an incline bench, grip barbell and press the weight upward"
    },
    {
      name: "Decline Barbell Bench Press",
      category: "Chest",
      image: "/FitPic/decline_barbell_bench_press.jpg",
      instructions: "Lie on a decline bench, grip barbell and press the weight upward"
    },
    {
      name: "Incline Dumbbell Bench Press",
      category: "Chest",
      image: "/FitPic/incline_dumbbell_bench_press.jpg",
      instructions: "Lie on an incline bench, hold dumbbells at chest level, and press them upward"
    },
    {
      name: "Decline Dumbbell Bench Press",
      category: "Chest",
      image: "/FitPic/decline_dumbbell_bench_press.jpg",
      instructions: "Lie on a decline bench, hold dumbbells at chest level, and press them upward"
    },
    {
      name: "Goblet Squat",
      category: "Legs",
      image: "/FitPic/goblet_squat.jpg",
      instructions: "Hold a dumbbell or kettlebell at chest level, squat down while keeping your chest up"
    },
    {
      name: "Bulgarian Split Squat",
      category: "Legs",
      image: "/FitPic/bulgarian_split_squat.jpg",
      instructions: "Place one foot on a bench behind you, lower your body into a lunge position"
    },
    {
      name: "Dumbbell Romanian Deadlift",
      category: "Legs",
      image: "/FitPic/Dumbell_romanian_deadlift.jpg",
      instructions: "Stand with feet hip-width apart, hold a barbell with both hands, and hinge at the hips to lower the weight"
    },
    {
      name: "Barbell Romanian Deadlift",
      category: "Legs",
      image: "/FitPic/barbell_romanian_deadlift.jpg",
      instructions: "Stand with feet hip-width apart, hold a barbell with both hands, and hinge at the hips to lower the weight"
    },
    {
      name: "Dumbbell Step-Up",
      category: "Legs",
      image: "/FitPic/dumbbell_step_up.jpg",
      instructions: "Hold dumbbells at your sides, step onto a bench or platform with one foot, and push through your heel to lift your body up"
    },
    {
      name: "Barbell Step-Up",
      category: "Legs",
      image: "/FitPic/barbell_step_up.jpg",
      instructions: "Hold a barbell across your upper back, step onto a bench or platform with one foot, and push through your heel to lift your body up"
    },
    {
      name: "Barbell Upright Row",
      category: "Back",
      image: "/FitPic/Barbell Upright_Row.jpg",
      instructions: "Bend at hips, hold a barbell with both hands, and pull the weight towards your torso"
    },
    {
      name: "Dumbbell Upright Row",
      category: "Back",
      image: "/FitPic/Dumbbell_Upright_Row.jpg",
      instructions: "Bend at hips, hold dumbbells with both hands, and pull the weights towards your torso"
    }, 
    {
      name: "Barbell Shrug",
      category: "Back",
      image: "/FitPic/Barbell_Shrug.jpg",
      instructions: "Stand with feet hip-width apart, hold a barbell with both hands, and shrug your shoulders upward"
    },
    { 
      name: "Dumbbell Shrug",
      category: "Back",
      image: "/FitPic/Dumbell_Shrug.jpg",
      instructions: "Hold dumbbells at your sides, shrug your shoulders upward, and lower them back down"
    },
    {
      name: "Alternate Bicep Curls",
      category: "Arms",
      image: "/FitPic/alternate_bicep_curls.jpg",
      instructions: "Hold dumbbells at your sides, curl one dumbbell upward while keeping the other arm stationary"
    },
    {
      name: "DB Concentration Curl",
      category: "Arms",
      image: "/FitPic/DB_concentration_curl.jpg",
      instructions: "Sit on a bench or chair, hold a dumbbell with one hand, and curl it towards your shoulder"

    },
    {
      name: "Seated Double Concentration Curl",
      category: "Arms",
      image: "/FitPic/DB_Seated_Double_Concentration_Curl.jpg",
      instructions: "Sit on a bench or chair, hold a dumbbell in each hand, and curl them towards your shoulders simultaneously"
    },
    {
      name: "Seated EZ Bar Curls",
      category: "Arms",
      image: "/FitPic/Seated_EZ_Bar_Curls.jpg",
      instructions: "Sit on a bench or chair, hold an EZ bar in both hands, and curl it towards your shoulders simultaneously"
    },
    {
      name: "EZ Bar Curls",
      category: "Arms",
      image: "/FitPic/EZ_Bar_Curl.jpg",
      instructions: "Stand holding the EZ bar with both hands, and curl them towards your shoulders"
    },
    { 
      name: "Dumbbell Wrist Curl",
      category: "Arms",
      image: "/FitPic/Dumbell_Wrist_Curl.jpg",
      instructions: "Sit on a bench or chair, hold a dumbbell in each hand, and curl your wrists upward"
    }
  ];

export default exercises;