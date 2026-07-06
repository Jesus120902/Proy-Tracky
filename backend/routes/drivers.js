const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Driver, Order, LocationHistory } = require('../models/associations');
const { protect } = require('../middleware/authMiddleware');

// Proteger todas las rutas de conductores
router.use(protect);

// Helper: serializar driver al formato que espera el frontend
const serializeDriver = (driver) => ({
  _id: driver.id,
  name: driver.name,
  email: driver.email,
  user: driver.userId,
  company: driver.companyId,
  vehicle: { type: driver.vehicleType, plate: driver.vehiclePlate },
  status: driver.status,
  location: { lat: driver.locationLat, lng: driver.locationLng },
  rating: driver.rating,
  totalDeliveries: driver.totalDeliveries,
  avatar: driver.avatar,
  createdAt: driver.createdAt,
  updatedAt: driver.updatedAt,
});

// GET all drivers (aislado por empresa)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = req.user.role === 'superadmin' ? {} : { companyId: req.user.company };
    if (status) where.status = status;

    const drivers = await Driver.findAll({ where, order: [['name', 'ASC']] });
    res.json(drivers.map(serializeDriver));
  } catch (err) {
    next(err);
  }
});

// GET single driver
router.get('/:id', async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const driver = await Driver.findOne({ where });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }
    res.json(serializeDriver(driver));
  } catch (err) {
    next(err);
  }
});

// POST create driver
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const driverData = {
      companyId: req.user.company,
      name: body.name,
      email: body.email,
      userId: body.userId || null,
      vehicleType: body.vehicle?.type || body.vehicleType || 'Van',
      vehiclePlate: body.vehicle?.plate || body.vehiclePlate || '',
      status: body.status || 'available',
      locationLat: body.location?.lat ?? -12.0464,
      locationLng: body.location?.lng ?? -74.006,
      rating: body.rating || 4.5,
      avatar: body.avatar || '',
    };

    const driver = await Driver.create(driverData);
    res.status(201).json(serializeDriver(driver));
  } catch (err) {
    next(err);
  }
});

// PUT update driver
router.put('/:id', async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const driver = await Driver.findOne({ where });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }

    const body = req.body;
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.vehicle?.type !== undefined) updateData.vehicleType = body.vehicle.type;
    if (body.vehicle?.plate !== undefined) updateData.vehiclePlate = body.vehicle.plate;
    if (body.location?.lat !== undefined) updateData.locationLat = body.location.lat;
    if (body.location?.lng !== undefined) updateData.locationLng = body.location.lng;

    await driver.update(updateData);
    res.json(serializeDriver(driver));
  } catch (err) {
    next(err);
  }
});

// PATCH update driver location
router.patch('/:id/location', async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const driver = await Driver.findOne({ where });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }

    await driver.update({ locationLat: lat, locationLng: lng });

    if (req.io) {
      req.io.to(req.user.company.toString()).emit('driver_location_update', {
        driverId: driver.id,
        location: { lat: driver.locationLat, lng: driver.locationLng },
        name: driver.name,
      });
    }

    res.json(serializeDriver(driver));
  } catch (err) {
    next(err);
  }
});

// DELETE driver
router.delete('/:id', async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const driver = await Driver.findOne({ where });
    if (!driver) {
      res.status(404);
      throw new Error('Conductor no encontrado');
    }

    // Liberar órdenes asociadas que no estén entregadas
    await Order.update(
      { driverId: null, status: 'pending' },
      {
        where: {
          driverId: req.params.id,
          status: { [Op.ne]: 'delivered' },
        },
      }
    );

    await driver.destroy();
    res.json({ message: 'Conductor eliminado y recursos liberados' });
  } catch (err) {
    next(err);
  }
});

// GET driver location history by date
router.get('/:id/history', async (req, res, next) => {
  try {
    const { date } = req.query;
    const queryDate =
      date ||
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date());

    const where = { driverId: req.params.id, date: queryDate };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const history = await LocationHistory.findOne({ where });

    if (!history) {
      return res.json({ driver: req.params.id, date: queryDate, path: [] });
    }

    res.json({
      _id: history.id,
      driver: history.driverId,
      company: history.companyId,
      date: history.date,
      path: history.path,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
