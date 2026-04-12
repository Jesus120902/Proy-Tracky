const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proteger todas las rutas de usuarios
router.use(protect);

// @desc    Get all users (Superadmin sees all, Admin sees their company only)
// @route   GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    const users = await User.find(filter).populate('company', 'name');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new user (Admin or Superadmin)
// @route   POST /api/users
router.post('/', async (req, res, next) => {
  const { name, email, password, role, companyId } = req.body;

  try {
    // Si no es superadmin, forzar que el usuario pertenezca a su propia empresa
    const targetCompany = req.user.role === 'superadmin' ? companyId : req.user.company;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('El usuario ya existe');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      company: targetCompany
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete('/:id', authorize('superadmin', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    // Seguridad: Admin solo borra usuarios de su empresa
    if (req.user.role === 'admin' && user.company.toString() !== req.user.company.toString()) {
      res.status(403);
      throw new Error('No autorizado para borrar este usuario');
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
