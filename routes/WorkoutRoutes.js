const express = require('express');
const router = express.Router();
const authenticateUser  = require('../middleware/authentication');

const {
    createWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
    startWorkout,
    getWorkoutSummary,
    completeWorkout
} = require('../controllers/WorkoutController');

router.route('/').post(authenticateUser,createWorkout).get(authenticateUser, getAllWorkouts);
router.route('/:id/start-workout').post(authenticateUser, startWorkout)
router.route('/:id/complete-workout').post(authenticateUser, completeWorkout)
router.route('/dashboard').get(authenticateUser, getWorkoutSummary)
router.route('/workouts/:id')
.get(getWorkoutById)
.patch(updateWorkout)
.delete(deleteWorkout);

module.exports = router;
