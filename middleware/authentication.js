const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { userId } = isTokenValid({ token });
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    req.user = {
      name: user.name,
      userId: user._id,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    };
    next();
  } catch (error) {
    console.error('Error validating token',error);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

module.exports = authenticateUser;