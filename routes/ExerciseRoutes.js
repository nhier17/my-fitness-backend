const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb)  {
        cb(null, './uploads');
    },
    filename: function (req,file, cb) {
        cb(null, file.originalname)
          }
});

const upload = multer({ storage: storage });

const {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
} = require('../controllers/ExerciseController');

router.route('/').post(upload.single('image'),createExercise)
.get(getAllExercises);
router.route('/:id')
.get(getExerciseById)
.patch(updateExercise)
.delete(deleteExercise);

module.exports = router;
