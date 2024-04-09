const mongoose = require('mongoose');

//define excercise schema
const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    difficulty: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    }
}); 

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;