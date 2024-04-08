const express = require('express');
const router = express.Router();

const {registerUser, login, logout } = require('../controllers/AuthController')

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;