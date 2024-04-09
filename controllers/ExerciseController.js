const Exercise = require('../models/Exercise');
const { StatusCodes } = require('http-status-codes');
const{ BadRequest } = require('../errors');

//create a new Exercise
const createExercise = async (req, res) => {
    const { name, difficulty, category, image, videoUrl } = req.body;
    try {
       const newExercise = await Exercise.create({
        name,
        difficulty,
        category,
        image,
        videoUrl
       });
       res.status(StatusCodes.CREATED).json(newExercise); 
    } catch (error) {
        console.error('Error creating exercise',error);
    }
};

//get all exercises

const getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(StatusCodes.OK).json(exercises);
    } catch (error) {
        console.error('Error getting all exercises',error);
    }
};

//get exercise by id

const getExerciseById = async (req, res) => {
    const { id } = req.params;
    try {
        const exercise = await Exercise.findById(id);
        if (!exercise) {
            throw new BadRequest('Exercise not found');
        }
        res.status(StatusCodes.OK).json(exercise);
    } catch (error) {
        console.error('Error getting exercise by id',error);
    }
};

//update exercise by id

const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { name, difficulty, category, image, videoUrl } = req.body;
    try {
        const exercise = await Exercise.findByIdAndUpdate(id,{
            name,
            difficulty,
            category,
            image,
            videoUrl
        }, {new: true});
        if (!exercise) {
            throw new BadRequest('Exercise not found');
        }
        res.status(StatusCodes.OK).json(exercise);
    } catch (error) {
        console.error('Error updating exercise by id',error);
    }
};

//delete exercise by id

const deleteExercise = async (req, res) => {
    const { id } = req.params;
    try {
        const exercise = await Exercise.findByIdAndDelete(id);
        if (!exercise) {
            throw new BadRequest('Exercise not found');
        }
        res.status(StatusCodes.OK).json({message: 'Exercise deleted successfully!'});
    } catch (error) {
        console.error('Error deleting exercise by id',error);
    }
};

module.exports = {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
};