const Workout = require('../models/Workout');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const User = require('../models/User');

// Create a new Workout
const createWorkout = async (req, res) => {
    try {
        const { exercises } = req.body;
        if (!exercises || !Array.isArray(exercises)){
            throw new CustomError.BadRequestError('Exercises must be an array');
        }
        const newWorkout = new Workout({
            user: req.user.userId,
            exercises
        });
        
        await newWorkout.save();
        res.status(StatusCodes.CREATED).json(newWorkout);
    } catch (error) {
        console.error('Error creating workout', error);
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Get all workouts
const getAllWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({user: req.user.userId});
        res.status(StatusCodes.OK).json(workouts);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

// Get a workout by ID
const getWorkoutById = async (req, res) => {
    const { id } = req.params;
    try {
        const workout = await Workout.findById(id);
        if (!workout) {
            throw new CustomError.NotFoundError('Workout not found');
        }

        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

// Update a workout by ID
const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { user, exercises } = req.body;
    try {
        const workout = await Workout.findByIdAndUpdate(id, {
            user,
            exercises
        }, { new: true });
        if (!workout) {
            throw new CustomError.NotFoundError('Workout not found');
        }

        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

// Delete a workout by ID
const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    try {
        const workout = await Workout.findByIdAndDelete(id);
        if (!workout) {
            throw new CustomError.NotFoundError(`Workout ${id} not found`);
        }

        res.status(StatusCodes.OK).json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

// Start workout
const startWorkout = async (req, res) => {
try {
    const { exercises } = req.body;
    if (!exercises ||!Array.isArray(exercises)){
        throw new CustomError.BadRequestError('Exercises must be an array');
    }

    const newWorkout = new Workout({
        user: req.user.userId,
        exercises: exercises.map(ex => ({
            exercise: ex.exercise,
            name: ex.name,
            weight: ex.weight,
            sets: ex.sets,
            reps: ex.reps,
            date: Date.now(),
            caloriesBurnt: ex.caloriesBurnt
        })),
        startedAt: new Date(),
    });

    await newWorkout.save();
    res.status(StatusCodes.CREATED).json({ workoutId: newWorkout._id});
} catch (error) {
    console.error('Error starting workout',error);
}
};

//complete workout
const completeWorkout = async (req, res) => {
    const {workoutId, exerciseDetails } = req.body;
    try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
            throw new CustomError.NotFoundError(`Workout ${id} not found`);
        }
        //update the workout with exercise details
        workout.exercises.forEach(exercise => {
            if(exerciseDetails[exercise._id]) {
                exercise.name = exerciseDetails[exercise._id].name;
                exercise.weight = exerciseDetails[exercise._id].weight;
                exercise.sets = exerciseDetails[exercise._id].sets;
                exercise.reps = exerciseDetails[exercise._id].reps; 
                exercise.caloriesBurnt = exerciseDetails[exercise._id].caloriesBurnt; 
            }
        });
        workout.completedAt = new Date();
        await workout.save();
        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

// Get workout summary
const getWorkoutSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const workouts = await Workout.find({ user: userId });

        if (!userId) {
            throw new CustomError.NotFoundError(`User ${userId} not found`);
        }

        const totalWorkouts = workouts.length;

        const totalCaloriesBurnt = workouts.reduce((total, workout) => {
            return total + workout.exercises.reduce((calories, exercise) => {
                return calories + (exercise.caloriesBurnt || 0);
            }, 0);
        }, 0);

        const totalDuration = workouts.reduce((total, workout) => {
            const startTime = new Date(workout.startedAt).getTime();
            const endTime = workout.completedAt ? new Date(workout.completedAt).getTime() : startTime;
            const duration = (endTime - startTime) / 1000 / 60; 
            return total + duration;
        }, 0);

        const avgDuration = totalWorkouts > 0 ? (totalDuration / totalWorkouts).toFixed(2) : 0;

        const recentWorkouts = workouts.slice(-5).reverse();

        const responseData = {
            summary: {
                totalWorkouts,
                totalCaloriesBurnt,
                avgDuration,
            },
            recentWorkouts,
            progress: {
                dates: workouts.map(workout => workout.startedAt),
                weights: workouts.map(workout => workout.exercises.reduce((total, ex) => total + ex.weight, 0)),
                reps: workouts.map(workout => workout.exercises.reduce((total, ex) => total + ex.reps, 0)),
            },
        };

        res.status(StatusCodes.OK).json(responseData);
    } catch (error) {
        console.error('Error fetching user workout data', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error fetching user workout data' });
    }
};

    


module.exports = {
    createWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
    startWorkout,
    getWorkoutSummary,
    completeWorkout
};
