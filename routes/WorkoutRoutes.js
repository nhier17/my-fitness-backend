const express = require('express');
const router = express.Router();

const {
    createWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
    startWorkout
} = require('../controllers/WorkoutController');

router.route('/').post(createWorkout).get(getAllWorkouts);
router.post('/:id/start-workout', startWorkout)
router.route('/workouts/:id')
.get(getWorkoutById)
.patch(updateWorkout)
.delete(deleteWorkout);

module.exports = router;
