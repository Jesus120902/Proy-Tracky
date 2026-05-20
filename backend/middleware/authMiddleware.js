const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tracky_fallback_dev_only';

/**
 * Middleware protect: verifica JWT y adjunta req.user.
 * Soporta tokens en header Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('No autorizado: falta el token de acceso'));
  }

  try {
    // 1. Verificar firma y expiración del JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // 2. Rechazar refresh tokens usados como access tokens
    if (decoded.type === 'refresh') {
      res.status(401);
      return next(new Error('Token de acceso inválido'));
    }

    // 3. Buscar usuario activo en BD (confirma que no fue desactivado)
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('company', 'name logoUrl branding settings slug');

    if (!user) {
      res.status(401);
      return next(new Error('Usuario del token no encontrado'));
    }

    if (!user.active) {
      res.status(401);
      return next(new Error('Cuenta desactivada. Contacta al administrador.'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Sesión expirada. Por favor inicia sesión nuevamente.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Token inválido o manipulado.'));
    }
    return next(new Error('No autorizado.'));
  }
};

/**
 * Middleware authorize: restringe acceso por roles.
 * Uso: authorize('admin', 'superadmin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Acceso denegado: el rol '${req.user?.role || 'desconocido'}' no tiene permiso para esta acción.`
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
