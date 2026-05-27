const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tracky_fallback_dev_only';

// ─────────────────────────────────────────────
// @desc    Login – devuelve access + refresh token
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Email y contraseña son requeridos'));
  }

  try {
    // Buscar usuario e incluir password (select: false por defecto)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('company', 'name logoUrl branding settings slug');

    // Verificar credenciales (bcrypt compare)
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Email o contraseña incorrectos'));
    }

    if (!user.active) {
      res.status(403);
      return next(new Error('Cuenta desactivada. Contacta al administrador.'));
    }

    // Obtener perfil del conductor si aplica
    let driverProfile = null;
    if (user.role === 'driver') {
      const Driver = require('../models/Driver');
      driverProfile = await Driver.findOne({ user: user._id }).select('_id name status');
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      driverId: driverProfile?._id || null,
      token: accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// @desc    Renovar access token con el refresh token
// @route   POST /api/auth/refresh
// @access  Public (pero requiere refresh token válido)
// ─────────────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    return next(new Error('Refresh token no proporcionado'));
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      res.status(401);
      return next(new Error('Token no es del tipo refresh'));
    }

    const user = await User.findById(decoded.id).select('-password').populate('company', 'name logoUrl branding settings slug');

    if (!user || !user.active) {
      res.status(401);
      return next(new Error('Usuario no válido'));
    }

    const newAccessToken = generateToken(user._id);

    res.json({
      token: newAccessToken,
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Refresh token expirado. Inicia sesión nuevamente.'));
    }
    return next(new Error('Refresh token inválido.'));
  }
});

// ─────────────────────────────────────────────
// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// ─────────────────────────────────────────────
// @desc    Forgot Password - envia enlace de recuperacion (consola / smtp)
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    return next(new Error('El correo electrónico es requerido'));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Seguridad: Responder éxito ficticio para evitar enumeración de usuarios
    if (!user) {
      return res.status(200).json({ 
        message: 'Si el correo está registrado, se enviará un enlace de restauración.' 
      });
    }

    // Generar un token temporal de 20 minutos tipo 'reset'
    const resetToken = jwt.sign(
      { id: user._id, type: 'reset' }, 
      JWT_SECRET, 
      { expiresIn: '20m' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;

    // Logs de Auditoría
    const logger = require('../utils/logger');
    logger.info(`🔑 Enlace de recuperación generado para ${email}: ${resetLink}`);

    // Nota: Aquí se llamaría a Nodemailer / SendGrid en producción
    res.status(200).json({
      message: 'Si el correo está registrado, se enviará un enlace de restauración.',
      token: process.env.NODE_ENV === 'production' ? undefined : resetToken // Solo devuelto en dev/test
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// @desc    Reset Password - reestablece la contraseña
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    return next(new Error('Token y nueva contraseña son requeridos'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== 'reset') {
      res.status(400);
      return next(new Error('Token inválido para esta acción'));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      res.status(404);
      return next(new Error('Usuario no válido o inactivo'));
    }

    // Asignar y guardar (gatilla el pre-save hook de bcrypt)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    res.status(400);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('El enlace de restauración ha expirado (límite 20 mins).'));
    }
    return next(new Error('Token de restauración inválido o alterado.'));
  }
});

module.exports = router;
