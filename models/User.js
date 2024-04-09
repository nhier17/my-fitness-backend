const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const speakeasy = require('speakeasy');

//define user schema
const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
         unique: true,
         validate: {
             validator: validator.isEmail,
             message: props => `${props.value} is not a valid email`
         }
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
        validate: {
            validator: value => passwordStrengthRegex.test(value),
            message: "Password must contain at least one lowercase letter, one uppercase letter or one special character",
        }

    }, 
    role: {
        type: String,
        required: [true, 'Please provide role'],
        enum: ['admin', 'user'],
        default: 'user',
    }, 
    twoFactorSecret: String,
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    }
   
});
//harsh the password

userSchema.pre('save', async function() {
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
});
//compare the password
userSchema.methods.comparePassowrd = async function(userPassword) {
const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};
//compare 2FA setup

userSchema.methods.verifyTwoFactorSetup = async function(verificationCode) {
if(!this.twoFactorEnabled || !this.twoFactorSecret) {
    return false;
}
try {
    const isValid = speakeasy.totp.verify({
        secret: this.twoFactorSecret,
        encoding: 'base32',
        token: verificationCode
    });
    return isValid;
} catch (error) {
    console.error('Error verifying 2FA setup:', error);
    return false;
}
};

const User = mongoose.model('User',userSchema);
module.exports = User;
