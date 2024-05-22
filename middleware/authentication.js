const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role, profile } = isTokenValid({ token });
    req.user = { name, userId, role, profile };
    next();
  } catch (error) {
    console.error('Error validating token',error);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

module.exports = authenticateUser;