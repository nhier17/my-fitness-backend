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
     registerUser,
     login, 
     logout,
     enable2FA,
      disable2FA,
      resetPassword,
      forgotPassword,
      updateUserProfile
     } = require('../controllers/AuthController')

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/ update-profile', upload.single('profilePicture'),updateUserProfile)
//2fa
router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;