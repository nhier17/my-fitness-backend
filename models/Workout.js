const mongoose = require('mongoose');

//define workout schema
const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    ]
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;