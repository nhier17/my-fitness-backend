const User = require('../models/User');
const { StatusCodes } = require('http-status-codes')
const{ BadRequest } = require('../errors')
const { attachCookiesToResponse,createTokenUser } = require('../utils')

//register new user 
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
    //check if email already exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequest('Email already exists')
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
    const { email, password } = req.body;
    if(!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError.UnauthenticatedErro('Invalid credentials');
        }
        //check password
        const isPasswordCorrect = await user.compare(password);
        if (!isPasswordCorrect) {
            throw new  CustomError.UnauthenticatedError('Invalid credentials');
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
//logout user
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  };

module.exports = {
    registerUser,
    login,
    logout
};