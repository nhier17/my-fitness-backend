const express = require('express');
const router = express.Router();

const {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
} = require('../controllers/ExerciseController');

router.route('/').post(createExercise).get(getAllExercises);
router.route('/exercise/:id')
.get(getExerciseById)
.patch(updateExercise)
.delete(deleteExercise);

module.exports = router;
