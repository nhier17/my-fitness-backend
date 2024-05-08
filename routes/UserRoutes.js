const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getSingleUser,
    updateUser,
    updatePassword,
} = require('../controllers/USerController');


router.route('/').get(getAllUsers);
router.route('/:id').get(getSingleUser);
router.route('/update-user').patch(updateUser);
router.route('/update-password').patch(updatePassword);

module.exports = router;