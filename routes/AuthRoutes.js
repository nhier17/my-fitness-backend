const express = require('express');
const router = express.Router();

const { registerUser, login, logout,enable2FA, disable2FA } = require('../controllers/AuthController')

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
//2fa

router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;