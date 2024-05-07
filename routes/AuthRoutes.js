const express = require('express');
const router = express.Router();

const {
     registerUser,
     login, 
     logout,
     enable2FA,
      disable2FA,
      resetPassword,
      forgotPassword
     } = require('../controllers/AuthController')

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
//2fa
router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;