const express = require('express');
const router = express.Router();
const { User } = require('../models/associations');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proteger todas las rutas de usuarios
router.use(protect);

// Helper: serializar usuario
const serializeUser = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.companyId,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @desc    Get all users
// @route   GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const where = req.user.role === 'superadmin' ? {} : { companyId: req.user.company };
    const users = await User.findAll({ where });
    res.json(users.map(serializeUser));
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new user
// @route   POST /api/users
router.post('/', async (req, res, next) => {
  const { name, email, password, role, companyId } = req.body;

  try {
    const targetCompany =
      req.user.role === 'superadmin' ? companyId : req.user.company;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.status(400);
      throw new Error('El usuario ya existe');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      companyId: targetCompany,
    });

    res.status(201).json(serializeUser(user));
  } catch (err) {
    next(err);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete('/:id', authorize('superadmin', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    if (
      req.user.role === 'admin' &&
      user.companyId !== req.user.company
    ) {
      res.status(403);
      throw new Error('No autorizado para borrar este usuario');
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
