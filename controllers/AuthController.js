const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse,createTokenUser } = require('../utils');
const {OAuth2Client} = require('google-auth-library');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//register new user 
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
    //check if email already exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email already exists')
    }  
    //first registered user is admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    
    //create user
    const user = await User.create({ name, email, password, role });
    //create token
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.CREATED).json({
        user: tokenUser
    });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
};
//login user
const login = async (req, res) => {
    const { email, password,verificationCode } = req.body;
    if(!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError.UnauthenticatedError('Invalid credentials');
        }
        //check if 2FA is enabled for the user
        if(user.twoFactorEnabled) {
            const is2FAVerified = await user.verifyTwoFactorSetup(verificationCode);
            if(!is2FAVerified) {
                throw new CustomError.UnauthenticatedError('Invalid credentials');
            }
        } else {
  //check password if 2FA is not enabled
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
      throw new  CustomError.UnauthenticatedError('Invalid credentials');
  }
      }
      
        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({ res, user: tokenUser });
        res.status(StatusCodes.OK).json({
            user: tokenUser
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
};

//google login
  const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
        //verify google id token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;
        //create google user
        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User ({
                googleId: sub,
                name,
                email,
                profilePicture: picture,
            });
            await user.save();
        }

        //create token
        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({ res, user: tokenUser });
        res.status(StatusCodes.OK).json({
            user: tokenUser
        });
    } catch (error) {
        console.error('Error verifying Google ID token',error);
        res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Google login failed',
        });
    }
  };

//logout user
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  };
  
  //enable 2FA
  const enable2FA = async (req, res) => {
    const userdId = req.user._id;
    const { verificationCode } = req.body;
    try {
        const user = await User.findById(userdId);
        if (!user) {
            throw new NotFound('USer not found');
        }
        user.twoFactorEnabled = true;
        await user.save();
        res.status(StatusCodes.OK).json({ msg: '2FA enabled successfuly!' });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
  };
  //disable 2FA
  const disable2FA = async (req, res) => {
    const userdId = req.user._id;
    try {
        const user = await User.findById(userdId);
        if (!user) {
            throw new NotFound('USer not found');
        }
        user.twoFactorEnabled = false;
        await user.save();
        res.status(StatusCodes.OK).json({ msg: '2FA disabled successfuly!' });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
  };

  //forgot password
  const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if(!email) {
            throw new CustomError.BadRequestError('Please provide email');
        }

        const user = await User.findOne({ email });
        if(user) {
            const verificationCode = await user.generateVerificationCode();
            await user.save();
            res.status(StatusCodes.OK).json({ msg: 'Verification code sent to your email!' });
        }
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
  };

  //reset password 
  const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;
    try {
        if(!token || !email || !password) {
            throw new CustomError.BadRequestError('Please provide all values');
        }

        const user = await User.findOne({ email });
        if(!user) {
            throw new CustomError.NotFoundError('User not found');
        }
        //verify token and expiration
        if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            throw new CustomError.BadRequestError('Invalid or expired token');
        }
        //reset password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(StatusCodes.OK).json({ msg: 'Password reset successfuly!' });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
  };

  //update user profile pic
  const updateUserProfile = async (req, res) => {
    const { userId } = req.body;
    const profilePicture = req.file;

    try {
        if(!userId) {
            throw new CustomError.BadRequestError('Please provide user id');
        }
        let user = await User.findById(userId);
        if (!user) {
            throw new CustomError.NotFoundError('User not found');
        }

        if(!profilePicture) {
            throw new CustomError.BadRequestError('Please provide a profile picture');
        } 
        const profilePath = '/uploads/' + profilePicture.filename;
        user.profilePicture = profilePath;
         await user.save();         
            
        res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message
        });
    }
  }
   

module.exports = {
    registerUser,
    login,
    logout,
    enable2FA,
    disable2FA,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    googleLogin,
};