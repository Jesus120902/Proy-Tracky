const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Driver } = require('../models/associations');
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
    // Buscar usuario CON password (scope withPassword para incluirlo)
    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Email o contraseña incorrectos'));
    }

    if (!user.active) {
      res.status(403);
      return next(new Error('Cuenta desactivada. Contacta al administrador.'));
    }

    // Cargar datos de empresa
    const { Company } = require('../models/associations');
    let companyData = null;
    if (user.companyId) {
      const company = await Company.findByPk(user.companyId);
      if (company) {
        companyData = {
          _id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          branding: {
            primaryColor: company.brandingPrimaryColor,
            secondaryColor: company.brandingSecondaryColor,
          },
          settings: { maxDrivers: company.maxDrivers },
          slug: company.slug,
        };
      }
    }

    // Obtener perfil de conductor si aplica
    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({
        where: { userId: user.id },
        attributes: ['id', 'name', 'status'],
      });
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: companyData,
      driverId: driverProfile?.id || null,
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
// @access  Public
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

    const user = await User.findByPk(decoded.id);

    if (!user || !user.active) {
      res.status(401);
      return next(new Error('Usuario no válido'));
    }

    const newAccessToken = generateToken(user.id);

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
// @desc    Forgot Password
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
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(200).json({
        message: 'Si el correo está registrado, se enviará un enlace de restauración.',
      });
    }

    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '20m' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;

    const logger = require('../utils/logger');
    logger.info(`🔑 Enlace de recuperación generado para ${email}: ${resetLink}`);

    res.status(200).json({
      message: 'Si el correo está registrado, se enviará un enlace de restauración.',
      token: process.env.NODE_ENV === 'production' ? undefined : resetToken,
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// @desc    Reset Password
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

    const user = await User.scope('withPassword').findByPk(decoded.id);
    if (!user || !user.active) {
      res.status(404);
      return next(new Error('Usuario no válido o inactivo'));
    }

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
