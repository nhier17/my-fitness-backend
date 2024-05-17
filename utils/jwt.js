const JWT = require('jsonwebtoken');


const createJWT = ({ payload }) => {
const token = JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
});
return token;
};
//istoken valid
const isTokenValid =({ token }) => JWT.verify(token, process.env.JWT_SECRET)


//attach cookies to response
const attachCookiesToResponse = ({ res, user }) => {
    const token = createJWT({ payload: user });
  
    const oneDay = 1000 * 60 * 60 * 24;
  
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === 'production' ? true : false,
      signed: true,
    });
  };

  module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
  }