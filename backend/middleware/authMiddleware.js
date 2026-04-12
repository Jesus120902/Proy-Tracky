const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tracky_secret_key_2026');

      // Obtener el usuario del token y adjuntarlo a la petición
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
      }

      next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      res.status(401);
      return next(new Error('No autorizado, token fallido'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('No autorizado, no hay token'));
  }
};

// Middleware para restringir por roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`El rol ${req.user.role} no tiene permiso para acceder a esta ruta`);
    }
    next();
  };
};

module.exports = { protect, authorize };
