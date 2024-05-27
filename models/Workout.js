const mongoose = require('mongoose');

//define workout schema
const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [
        {
       exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
        },
            weight: Number,
            reps: Number,
           sets: Number,
            duration: Number,
            caloriesBurnt: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    startedAt: Date,
    completedAt: Date
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;