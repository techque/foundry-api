'use strict';

const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user').optional(),
});

const signinSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

const googleSchema = Joi.object({
  credential: Joi.string().required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    req.body = value;
    return next();
  };
}

module.exports = {
  signupSchema,
  signinSchema,
  googleSchema,
  validate,
};