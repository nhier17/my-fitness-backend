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
        }
    ],
    totalDuration: {
        type: Number,
        default: 0
    },
    totalWeight: {
        type: Number,
        default: 0
    },
    totalReps: {
        type: Number,
        default: 0
    },
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;