const Joi = require('joi');
const mongoose = require('mongoose');
require('mongoose-type-email');

const nameRegex = /^[a-zA-Zء-ي ]*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,64})/;

const registerValidation = Joi.object({
    username: Joi.string().min(4).max(64).required(),
    email: Joi.string().max(64).email().required(),
    password: Joi.string().pattern(passwordRegex).required()
});

const loginValidation = Joi.object({
    email: Joi.string().max(64).email().required(),
    password: Joi.string().required().pattern(passwordRegex)
});

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, minLength: 4, maxLength: 64 },
    email: { type: mongoose.SchemaTypes.Email, maxLength: 64, required: true, unique: true },
    password: {
        type: String, required: true, minLength: 8, maxLength: 64, validate: {
            validator: function (v) {
                return passwordRegex.test(v);
            },
            message: props => `${props.value} is not a valid password!`
        }
    }
}));

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.User = User;