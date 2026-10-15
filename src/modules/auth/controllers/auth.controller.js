'use strict';

const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const googleClient = new OAuth2Client();

function assertTokenConfig() {
  if (!process.env.ACCESS_JWT_SECRET || !process.env.ACCESS_EXPIRES_IN) {
    throw new Error('ACCESS_JWT_SECRET and ACCESS_EXPIRES_IN must be configured');
  }
}

function createAccessToken(user) {
  const secret = process.env.ACCESS_JWT_SECRET;
  const expiresIn = process.env.ACCESS_EXPIRES_IN;
  assertTokenConfig();

  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn },
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function signup(req, res, next) {
  try {
    assertTokenConfig();
    const { name, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role: role || 'user',
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token: createAccessToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    return next(error);
  }
}

async function signin(req, res, next) {
  try {
    assertTokenConfig();
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({
      message: 'Authentication successful',
      token: createAccessToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function google(req, res, next) {
  const { credential } = req.body;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return next(new Error('GOOGLE_CLIENT_ID must be configured'));
  }

  try {
    assertTokenConfig();
  } catch (error) {
    return next(error);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    if (error.name === 'GaxiosError') {
      return next(error);
    }
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  if (!payload || !payload.email || !payload.email_verified) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  try {
    let user = await User.findOne({ where: { email: payload.email.toLowerCase() } });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email.toLowerCase(),
        password_hash: null,
      });
    }

    return res.status(200).json({
      message: 'Google authentication successful',
      token: createAccessToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.status(200).json({ user: serializeUser(req.user) });
}

function signout(req, res) {
  return res.status(200).json({ message: 'Successfully signed out' });
}

module.exports = {
  signup,
  signin,
  google,
  me,
  signout,
};