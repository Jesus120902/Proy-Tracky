const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tracky_fallback_dev_only';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Genera un Access Token (corta duración) para autenticación de APIs.
 */
const generateToken = (id) => {
  return jwt.sign({ id, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

/**
 * Genera un Refresh Token (larga duración) para renovar el access token.
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

module.exports = { generateToken, generateRefreshToken };
