const express = require('express');
const router = express.Router();
const authenticateUser  = require('../middleware/authentication');

const {
    getAllUsers,
    getSingleUser,
    updateUser,
    updatePassword,
    showCurrentUser,
} = require('../controllers/UserController');


router.route('/').get(getAllUsers);

router.route('/current').get(authenticateUser, showCurrentUser);
router.route('/:id').get(authenticateUser, getSingleUser);
router.route('/update-user').patch(updateUser);
router.route('/update-password').patch(updatePassword);

module.exports = router;