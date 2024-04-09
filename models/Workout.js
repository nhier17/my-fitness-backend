const mongoose = require('mongoose');

//define workout schema
const workoutSchema = new mongoose.Schema({
    day: {
        type: Date,
        default: Date.now
    },
    exercises: [
        {
            type: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            weight: Number,
            reps: Number
           sets: Number,
           distance: Number,
         
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