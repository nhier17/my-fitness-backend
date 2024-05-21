const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
    console.log('Received token: ', token);
  if (!token) {
    console.log('No token found in request: ')
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    console.log('User identified:', name, userId, role)
    req.user = { name, userId, role };
    next();
  } catch (error) {
    console.error('Error validating token',error);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

module.exports = authenticateUser;