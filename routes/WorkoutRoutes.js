const express = require('express');
const router = express.Router();

const {
    createWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout
} = require('../controllers/WorkoutController');

router.route('/').post(createWorkout).get(getAllWorkouts);
router.route('/workouts/:id')
.get(getWorkoutById)
.patch(updateWorkout)
.delete(deleteWorkout);

module.exports = router;
