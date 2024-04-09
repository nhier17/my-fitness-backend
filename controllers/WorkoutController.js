const Workout = require('../models/Workout')
const { StatusCodes } = require('http-status-codes')
const{ BadRequest } = require('../errors')

//create a new Workout
const createWorkout = async (req, res) => {
    const { user, exercises, totalDuration,totalWeight, totalReps } = req.body;
    try {
        const newWorkout = await Workout({
            user,
            exercises,
            totalDuration,
            totalWeight,
            totalReps
        });
        await newWorkout.save();
        res.status(StatusCodes.CREATED).json(newWorkout);
    } catch (error) {
        console.error('Error creating workout',error);
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

//get all workouts

const getAllWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find();
        res.status(StatusCodes.OK).json(workouts);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

//get a workout by id

const getWorkoutById = async (req, res) => {
    const { id } = req.params;
    try {
        const workout = await Workout.findById(id);
        if (!workout) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Workout not found' });
        };

        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

//update a workout by id

const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { user, exercises, totalDuration,totalWeight, totalReps } = req.body;
    try {
        const workout = await Workout.findByIdAndUpdate(id, {
            user,
            exercises,
            totalDuration,
            totalWeight,
            totalReps
        }, { new: true });
        if (!workout) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Workout not found' });
        };

        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

//delete a workout by id

const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    try {
        const workout = await Workout.findByIdAndDelete(id);
        if (!workout) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Workout not found' });
        };

        res.status(StatusCodes.OK).json({ message: 'Workout deleted successfully'});
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

module.exports = {
    createWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout
};