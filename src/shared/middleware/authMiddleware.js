'use strict';

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authorization = req.get('Authorization');
  const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  const secret = process.env.ACCESS_JWT_SECRET;
  if (!secret) {
    return next(new Error('ACCESS_JWT_SECRET must be configured'));
  }

  try {
    req.user = jwt.verify(match[1], secret);
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
    return next(error);
  }
}

module.exports = { verifyToken };
