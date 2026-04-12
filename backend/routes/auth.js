const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password').populate('company');

    if (user && (await user.matchPassword(password))) {
      let driverProfile = null;
      if (user.role === 'driver') {
        const Driver = require('../models/Driver');
        driverProfile = await Driver.findOne({ user: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        driverId: driverProfile?._id,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Email o contraseña inválidos');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
