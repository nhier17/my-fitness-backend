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
            exercises,
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
    console.log('Received workout', exercises)
    if (!exercises ||!Array.isArray(exercises)){
        throw new CustomError.BadRequestError('Exercises must be an array');
    }

    const newWorkout = new Workout({
        user: req.user.userId,
        exercises: exercises.map(ex => ({
            exercise: ex.exercise,
            weight: ex.weight,
            sets: ex.sets,
            reps: ex.reps,
            date: Date.now(),
        })),
        startedAt: new Date(),
    });

    await newWorkout.save();
    res.status(StatusCodes.CREATED).json({ workoutId: newWorkout._id});
} catch (error) {
    console.error('Error starting workout',error);
}
};

// Get workout summary
const getWorkoutSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError.BadRequestError('User not found');
        }

        const currentDateFormatted = new Date();
        const startToday = new Date(
            currentDateFormatted.getFullYear(),
            currentDateFormatted.getMonth(),
            currentDateFormatted.getDate()
        );
        const endToday = new Date(
            currentDateFormatted.getFullYear(),
            currentDateFormatted.getMonth(),
            currentDateFormatted.getDate() + 1
        );

        const totalCaloriesBurnt = await Workout.aggregate([
            { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
            {
                $group: {
                    _id: null,
                    totalCaloriesBurnt: { $sum: '$caloriesBurnt' },
                },
            },
        ]);

        const totalWorkouts = await Workout.countDocuments({
            user: userId,
            date: { $gte: startToday, $lt: endToday },
        });

        const averageCalories = totalCaloriesBurnt.length > 0 ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts : 0;

        const categoryCalories = await Workout.aggregate([
            { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
            {
                $lookup: {
                    from: 'exercises',
                    localField: 'exercise',
                    foreignField: '_id',
                    as: 'exerciseDetails',
                },
            },
            { $unwind: '$exerciseDetails' },
            {
                $group: {
                    _id: '$exerciseDetails.category',
                    totalCaloriesBurnt: { $sum: '$caloriesBurnt' },
                },
            },
        ]);

        const pieChartData = categoryCalories.map((category, i) => ({
            id: i,
            value: category.totalCaloriesBurnt,
            label: category._id,
        }));

        const weeks = [];
        const caloriesBurnt = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(
                currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
            );
            weeks.push(`${date.getDate()}th`);

            const startOfDay = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );
            const endOfDay = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 1
            );

            const weekData = await Workout.aggregate([
                { $match: { user: user._id, date: { $gte: startOfDay, $lt: endOfDay } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalCaloriesBurnt: { $sum: '$caloriesBurnt' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            caloriesBurnt.push(weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0);
        }

        res.status(StatusCodes.OK).json({
            totalCaloriesBurnt: totalCaloriesBurnt.length > 0 ? totalCaloriesBurnt[0].totalCaloriesBurnt : 0,
            totalWorkouts,
            averageCalories,
            totalWeeksCaloriesBurnt: {
                weeks,
                caloriesBurnt,
            },
            pieChartData,
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};
//complete workout
const completeWorkout = async (req, res) => {
    const { id } = req.params;
    const { exerciseDetails } = req.body;
    console.log('workout complete', exerciseDetails)
    try {
        const workout = await Workout.findById(id);
        if (!workout) {
            throw new CustomError.NotFoundError(`Workout ${id} not found`);
        }
        //update the workout with exercise details
        workout.exercises.forEach(exercise => {
            if(exerciseDetails[exercise._id]) {
                exercise.weight = exerciseDetails[exercise._id].weight;
                exercise.sets = exerciseDetails[exercise._id].sets;
                exercise.reps = exerciseDetails[exercise._id].reps;  
            }
        });
        workout.completedAt = new Date();
        await workout.save();
        res.status(StatusCodes.OK).json(workout);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
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
