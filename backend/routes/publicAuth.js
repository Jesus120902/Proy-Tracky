const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Company } = require('../models/associations');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register a new company and admin user from the Landing Page
// @route   POST /api/publicAuth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  const { companyName, name, email, phone, password } = req.body;

  if (!companyName || !name || !email || !password) {
    res.status(400);
    return next(new Error('Faltan campos requeridos (companyName, name, email, password)'));
  }

  try {
    // Verificar si el email ya existe
    const userExists = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (userExists) {
      res.status(400);
      return next(new Error('El correo ya está registrado'));
    }

    // Generar slug para la empresa
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const companyExists = await Company.findOne({ where: { slug } });
    if (companyExists) {
      res.status(400);
      return next(new Error('Ya existe una empresa con un nombre similar, por favor elige otro.'));
    }

    // Calcular 30 días de trial
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Crear la empresa con trial gratuito
    const company = await Company.create({
      name: companyName,
      slug,
      subscriptionPlan: 'free',
      subscriptionStatus: 'trialing',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
    });

    // Crear usuario Admin (el hook beforeCreate hashea el password)
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      companyId: company.id,
    });

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: {
        _id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        branding: {
          primaryColor: company.brandingPrimaryColor,
          secondaryColor: company.brandingSecondaryColor,
        },
        settings: { maxDrivers: company.maxDrivers },
        subscription: {
          plan: company.subscriptionPlan,
          status: company.subscriptionStatus,
          startDate: company.subscriptionStartDate,
          endDate: company.subscriptionEndDate,
        },
      },
      token: accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
