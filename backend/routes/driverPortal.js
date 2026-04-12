const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/authMiddleware');

// Proteger todas las rutas del portal del conductor
router.use(protect);

// @desc    Get orders assigned to the logged-in driver
// @route   GET /api/driver/my-orders
router.get('/my-orders', async (req, res, next) => {
  try {
    // Buscar el perfil de conductor vinculado al usuario
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      res.status(404);
      throw new Error('No se encontró perfil de conductor para este usuario');
    }

    const orders = await Order.find({ 
      driver: driver._id,
      status: { $in: ['assigned', 'in-transit', 'delivered'] }
    }).sort({ updatedAt: -1 });

    res.json({
      driver,
      orders
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update order status (Driver actions)
// @route   PATCH /api/driver/orders/:id/status
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, location } = req.body;
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      res.status(404);
      throw new Error('Perfil de conductor no encontrado');
    }

    const order = await Order.findOne({ _id: req.params.id, driver: driver._id });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada o no asignada a usted');
    }

    // Actualizar estado de la orden
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      if (req.body.evidence) {
        order.evidence = {
          ...req.body.evidence,
          deliveredLocation: location || driver.location
        };
      }
      // Liberar conductor
      driver.status = 'available';
    } else if (status === 'in-transit') {
      driver.status = 'on-delivery';
    }
    
    // Actualizar ubicación del conductor si se proporciona
    if (location && location.lat && location.lng) {
      driver.location = location;
    }

    await Promise.all([order.save(), driver.save()]);

    // Emitir via Socket.io para que el Admin y el Cliente vean el cambio real
    if (req.io) {
      const companyRoom = order.company.toString();
      req.io.to(companyRoom).emit('order_status_update', {
        orderId: order._id,
        status: order.status
      });
      
      if (location) {
        req.io.to(companyRoom).emit('driver_location_update', {
          driverId: driver._id,
          location: driver.location
        });
      }
    }

    res.json({ message: `Estado actualizado a ${status}`, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
