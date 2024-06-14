const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
    createTokenUser,
    attachCookiesToResponse,
    checkPermissions,
  } = require('../utils');


//get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(StatusCodes.OK).json(users);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

//get user by id
const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select('-password');
    if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
    }
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({ user });
  };
  
  const showCurrentUser = async (req, res) => {
    try {
        console.log('Current user: ' , req.user);
        res.status(StatusCodes.OK).json({ user: req.user });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }

  };

 
//update user 
const updateUser = async (req, res) => {
    const { email, name } = req.body;
    try {
        if(!email || !name) {
            throw new CustomError.BadRequestError('Please provide all values');
        }
        const user = await User.findOne({_id: req.params.userId});

        user.email = email;
        user.name = name;
        
        await user.save();

        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({res, user: tokenUser});
        res.status(StatusCodes.OK).json({user: tokenUser});
    } catch (error) {
        console.error('Error updating user',error);
    }
};

//update user password
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
          throw new CustomError.BadRequestError('Please provide both values');
        }
        const user = await User.findOne({ _id: req.user.userId });
      
        const isPasswordCorrect = await user.comparePassword(oldPassword);
        if (!isPasswordCorrect) {
          throw new CustomError.UnauthenticatedError('Invalid Credentials');
        }
        user.password = newPassword;
      
        await user.save();
        res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
    } catch (error) {
        console.error('Error updating password',error)
    }
};

module.exports = {
    getAllUsers,
    getSingleUser,
    updateUser,
    updatePassword,
    showCurrentUser
}