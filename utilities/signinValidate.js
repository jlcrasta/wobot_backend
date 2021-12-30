const Joi = require('joi')

module.exports = Joi.object({
    fname: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    lname: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
})