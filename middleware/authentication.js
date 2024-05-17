const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async(req, res, next) => {
    const token = req.signedCookies.token;
    if(!token) {
        throw new CustomError.UnauthenticatedError('Aunthentication invalid');
    }

    try {
        const {name, userId } = isTokenValid({ token });
        req.user = { name, userId };
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Aunthentication invalid');
    }
};

module.exports = authenticateUser;