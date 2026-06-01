import type { Exercise, WorkoutDay } from './types';

export const workoutPlan: WorkoutDay[] = [
  {
    day: 'monday',
    title: 'Monday Workout',
    exercises: ['Push-up', 'Squat', 'Plank', 'Glute Bridge']
  },
  {
    day: 'wednesday',
    title: 'Wednesday Workout',
    exercises: ['Jumping Jack', 'Burpee', 'Mountain Climber', 'Walking']
  },
  {
    day: 'friday',
    title: 'Friday Workout',
    exercises: ['Push-up', 'Reverse Lunge', 'Squat', 'Side Plank']
  },
  {
    day: 'sunday',
    title: 'Sunday Workout',
    exercises: ['Brisk Walk', 'Jog/Walk']
  }
];

export const exerciseLibrary: Record<string, Exercise> = {
  'Push-up': {
    name: 'Push-up',
    description: 'A bodyweight upper-body exercise that strengthens chest, shoulders, and triceps.',
    easierVariation: 'Knee push-up or incline push-up on a bench.',
    commonMistakes: 'Letting hips sag, flaring elbows, or not lowering far enough.',
    safetyTips: 'Keep a straight spine and breathe steadily through each repetition.',
    media: [{ type: 'youtube', videoId: 'vt-IbHbN7S8', title: 'How to Do a Push-Up Correctly' }]
  },
  Squat: {
    name: 'Squat',
    description: 'A lower-body movement focused on quads, glutes, and hamstrings.',
    easierVariation: 'Sit-to-stand or half squat to reduce intensity.',
    commonMistakes: 'Rounding the back, knees caving in, or heels lifting.',
    safetyTips: 'Maintain an upright chest and push through the heels.',
    media: [{ type: 'youtube', videoId: 'nEQQle9-0NA', title: 'How to Squat Properly' }]
  },
  Plank: {
    name: 'Plank',
    description: 'A core stability hold that strengthens the midsection.',
    easierVariation: 'Knee plank with the hips supported on the floor.',
    commonMistakes: 'Raising hips too high or letting the lower back sag.',
    safetyTips: 'Keep a neutral spine and engage the abs for the full hold.',
    media: [{ type: 'youtube', videoId: 'mwlp75MS6Rg', title: 'How to do a Plank | NASM' }]
  },
  'Side Plank': {
    name: 'Side Plank',
    description: 'A lateral core exercise for obliques and shoulder stability.',
    easierVariation: 'Knee-supported side plank.',
    commonMistakes: 'Dropping the hips or collapsing the shoulder.',
    safetyTips: 'Stack the shoulders and keep the body in a straight line.'
  },
  'Glute Bridge': {
    name: 'Glute Bridge',
    description: 'A posterior chain exercise for glutes, hamstrings, and lower back.',
    easierVariation: 'Perform with a smaller hip lift and focus on form.',
    commonMistakes: 'Overarching the lower back or pushing through the toes.',
    safetyTips: 'Drive through the heels and squeeze the glutes at the top.'
  },
  'Reverse Lunge': {
    name: 'Reverse Lunge',
    description: 'A unilateral leg exercise that targets quads and glutes.',
    easierVariation: 'Static split squat with less range of motion.',
    commonMistakes: 'Leaning forward or letting the front knee travel too far past toes.',
    safetyTips: 'Keep the chest upright and step back with control.'
  },
  'Jumping Jack': {
    name: 'Jumping Jack',
    description: 'A cardio move that raises heart rate and improves coordination.',
    easierVariation: 'Step out one foot at a time instead of jumping.',
    commonMistakes: 'Landing hard on the knees or rounding the back.',
    safetyTips: 'Land softly and keep shoulders relaxed.',
    media: [{ type: 'youtube', videoId: 'uLVt6u15L98', title: 'How to do a Jumping Jack | NASM' }]
  },
  Burpee: {
    name: 'Burpee',
    description: 'A full-body conditioning exercise combining a squat, plank, and jump.',
    easierVariation: 'Step back into plank instead of jumping back.',
    commonMistakes: 'Rushing the movement or losing spine alignment.',
    safetyTips: 'Move with control and breathe through each phase.',
    media: [{ type: 'youtube', videoId: 'wGvBfVeCNko', title: 'Burpees for Beginners' }]
  },
  'Mountain Climber': {
    name: 'Mountain Climber',
    description: 'A dynamic core and cardio exercise performed from a plank.',
    easierVariation: 'Slow the pace and bring knees forward one at a time.',
    commonMistakes: 'Hips bouncing or shoulders collapsing.',
    safetyTips: 'Keep the body stable and maintain a solid plank position.',
    media: [{ type: 'youtube', videoId: 'gW-q50V6Z_0', title: 'Mountain Climbers: How To' }]
  },
  Walking: {
    name: 'Walking',
    description: 'A steady-paced walk to build aerobic base and aid active recovery.',
    easierVariation: 'Shorter walks at a slower comfortable pace.',
    commonMistakes: 'Slouching the shoulders or looking down at the ground.',
    safetyTips: 'Keep the chest tall, engage the core, and maintain a natural arm swing.'
  },
  'Brisk Walk': {
    name: 'Brisk Walk',
    description: 'A low-impact cardio activity to improve endurance and recovery.',
    easierVariation: 'Shorter duration walks at a comfortable pace.',
    commonMistakes: 'Walking with poor posture or overstriding.',
    safetyTips: 'Keep the torso tall and swing arms naturally.'
  },
  'Jog/Walk': {
    name: 'Jog/Walk',
    description: 'A mixed running and walking session for aerobic conditioning.',
    easierVariation: 'Extend the walk periods and reduce jogging time.',
    commonMistakes: 'Starting too fast or skipping warm-up steps.',
    safetyTips: 'Stay hydrated and maintain an easy pace for recovery.'
  }
};
