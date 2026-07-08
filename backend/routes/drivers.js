const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const LocationHistory = require('../models/LocationHistory');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proteger todas las rutas de conductores
router.use(protect);

// GET all drivers (aislado por empresa)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    // Si es superadmin ve todo, si no, solo su empresa
    const filter = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    if (status) filter.status = status;

    const drivers = await Driver.find(filter).sort({ name: 1 });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
});

// GET single driver
router.get('/:id', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.user.company });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }
    res.json(driver);
  } catch (err) {
    next(err);
  }
});

// POST create driver
router.post('/', async (req, res, next) => {
  try {
    const Company = require('../models/Company');
    const company = await Company.findById(req.user.company);
    if (!company) {
      res.status(404);
      return next(new Error('Empresa no encontrada'));
    }

    const currentDriverCount = await Driver.countDocuments({ company: req.user.company });
    const plan = company.subscription?.plan || 'free';
    
    let limit = 3; // free/trial default limit
    if (plan === 'pro') {
      limit = 15;
    } else if (plan === 'business') {
      limit = 100;
    }

    if (currentDriverCount >= limit) {
      res.status(400);
      return next(new Error(`Límite superado: Tu plan (${plan.toUpperCase()}) solo permite un máximo de ${limit} conductores. Mejora tu suscripción en el Portal del Cliente.`));
    }

    const driverData = { ...req.body, company: req.user.company };
    const driver = new Driver(driverData);
    const saved = await driver.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// PUT update driver
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await Driver.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH update driver location
router.patch('/:id/location', async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const updated = await Driver.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { location: { lat, lng } },
      { new: true }
    );
    if (!updated) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }

    // Retransmitir ubicación en vivo a la organización
    if (req.io) {
      req.io.to(req.user.company.toString()).emit('driver_location_update', {
        driverId: updated._id,
        location: updated.location,
        name: updated.name
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE driver
router.delete('/:id', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.user.company });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }

    // Liberar órdenes asociadas que no estén entregadas
    await Order.updateMany(
      { driver: req.params.id, status: { $ne: 'delivered' } },
      { $set: { driver: null, status: 'pending' } }
    );

    await Driver.deleteOne({ _id: req.params.id });
    res.json({ message: 'Conductor eliminado y recursos liberados' });
  } catch (err) {
    next(err);
  }
});

// @desc    Get driver location history by date
// @route   GET /api/drivers/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const { date } = req.query; // format YYYY-MM-DD
    const queryDate = date || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    
    const history = await LocationHistory.findOne({
      driver: req.params.id,
      date: queryDate,
      company: req.user.company
    });

    if (!history) {
      return res.json({ driver: req.params.id, date: queryDate, path: [] });
    }

    res.json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
