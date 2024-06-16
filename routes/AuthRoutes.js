const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticateUser  = require('../middleware/authentication');

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
      updateUserProfile,
      googleLogin
     } = require('../controllers/AuthController')

router.post('/register', registerUser);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/logout', logout);
router.post('/profile', upload.single('profilePicture'),updateUserProfile)
//2fa
router.post('/2fa/enable',authenticateUser, enable2FA);
router.post('/2fa/disable',authenticateUser, disable2FA);

module.exports = router;