
const createTokenUser = (user) => {
    return { name: user.name, userId: user._id, role: user.role, profile: user.profilePicture };
  };
  
  module.exports = createTokenUser;
  