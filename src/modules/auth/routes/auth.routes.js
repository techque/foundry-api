'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const {
  signupSchema,
  signinSchema,
  googleSchema,
  validate,
} = require('../validations/auth.validation');
const { verifyToken } = require('../../../shared/middleware/authMiddleware');

const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/signin', validate(signinSchema), authController.signin);
router.post('/google', validate(googleSchema), authController.google);
router.get('/me', verifyToken, authController.me);
router.post('/signout', verifyToken, authController.signout);

module.exports = router;