const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
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
    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      res.status(400);
      return next(new Error('El correo ya está registrado'));
    }

    // Generate a slug for the company
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    const companyExists = await Company.findOne({ slug });
    if (companyExists) {
      res.status(400);
      return next(new Error('Ya existe una empresa con un nombre similar, por favor elige otro.'));
    }

    // Calculate 30 days from now for trial
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create the Company with Free trial
    const company = await Company.create({
      name: companyName,
      slug,
      subscription: {
        plan: 'free',
        status: 'trialing',
        startDate,
        endDate
      }
    });

    // Create the User (Admin)
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password, // Pre-save hook will hash this
      role: 'admin',
      company: company._id,
      // Phone could be stored if we add it to the schema, but not in current schema.
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: {
        _id: company._id,
        name: company.name,
        slug: company.slug,
        subscription: company.subscription
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
