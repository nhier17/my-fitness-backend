const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
   
});
//harsh the password

userSchema.pre('save', async function() {
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
});
//compare the password

const User = mongoose.model('User',userSchema);
module.exports = User;
