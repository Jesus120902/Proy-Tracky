const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, Driver, LocationHistory } = require('../models/associations');
const { protect } = require('../middleware/authMiddleware');

// Proteger todas las rutas del portal del conductor
router.use(protect);

// Helper: serializar orden al formato frontend
const serializeOrder = (order) => ({
  _id: order.id,
  orderNumber: order.orderNumber,
  company: order.companyId,
  driver: order.driverId,
  customer: {
    name: order.customerName,
    address: order.customerAddress,
    phone: order.customerPhone,
    coordinates: { lat: order.customerLat, lng: order.customerLng },
  },
  status: order.status,
  priority: order.priority,
  items: order.items,
  notes: order.notes,
  estimatedDelivery: order.estimatedDelivery,
  assignedAt: order.assignedAt,
  transitStartedAt: order.transitStartedAt,
  deliveredAt: order.deliveredAt,
  evidence: {
    signature: order.evidenceSignature,
    photo: order.evidencePhoto,
    recipientName: order.evidenceRecipientName,
    deliveredLocation: {
      lat: order.evidenceDeliveredLat,
      lng: order.evidenceDeliveredLng,
    },
  },
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

// @desc    Get orders assigned to the logged-in driver
// @route   GET /api/driver/my-orders
router.get('/my-orders', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ where: { userId: req.user.id } });
    if (!driver) {
      res.status(404);
      throw new Error('No se encontró perfil de conductor para este usuario');
    }

    const orders = await Order.findAll({
      where: {
        driverId: driver.id,
        status: { [Op.in]: ['assigned', 'in-transit', 'delivered'] },
      },
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      driver: {
        _id: driver.id,
        name: driver.name,
        email: driver.email,
        status: driver.status,
        vehicle: { type: driver.vehicleType, plate: driver.vehiclePlate },
        location: { lat: driver.locationLat, lng: driver.locationLng },
        rating: driver.rating,
        avatar: driver.avatar,
      },
      orders: orders.map(serializeOrder),
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
    const driver = await Driver.findOne({ where: { userId: req.user.id } });

    if (!driver) {
      res.status(404);
      throw new Error('Perfil de conductor no encontrado');
    }

    const order = await Order.findOne({ where: { id: req.params.id, driverId: driver.id } });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada o no asignada a usted');
    }

    const orderUpdate = { status };
    const driverUpdate = {};

    if (status === 'in-transit') {
      orderUpdate.transitStartedAt = new Date();
      driverUpdate.status = 'on-delivery';
    }

    if (status === 'delivered') {
      orderUpdate.deliveredAt = new Date();
      driverUpdate.status = 'available';

      if (req.body.evidence) {
        const { uploadBase64Image } = require('../utils/storageAdapter');
        let signatureUrl = '';
        let photoUrl = '';

        try {
          if (req.body.evidence.signature) {
            signatureUrl = await uploadBase64Image(req.body.evidence.signature, 'sig');
          }
          if (req.body.evidence.photo) {
            photoUrl = await uploadBase64Image(req.body.evidence.photo, 'photo');
          }
        } catch (uploadErr) {
          console.error('Error al procesar subida de evidencia:', uploadErr.message);
        }

        orderUpdate.evidenceRecipientName = req.body.evidence.recipientName || null;
        orderUpdate.evidenceSignature = signatureUrl || req.body.evidence.signature || null;
        orderUpdate.evidencePhoto = photoUrl || req.body.evidence.photo || null;
        orderUpdate.evidenceDeliveredLat = location?.lat || driver.locationLat;
        orderUpdate.evidenceDeliveredLng = location?.lng || driver.locationLng;
      }
    }

    if (location?.lat && location?.lng) {
      driverUpdate.locationLat = location.lat;
      driverUpdate.locationLng = location.lng;
    }

    await Promise.all([
      order.update(orderUpdate),
      Object.keys(driverUpdate).length > 0 ? driver.update(driverUpdate) : Promise.resolve(),
    ]);

    // Emitir via Socket.io
    if (req.io) {
      const companyRoom = order.companyId.toString();
      req.io.to(companyRoom).emit('order_status_update', {
        orderId: order.id,
        status: order.status,
      });

      if (location) {
        req.io.to(companyRoom).emit('driver_location_update', {
          driverId: driver.id,
          location: { lat: driverUpdate.locationLat || driver.locationLat, lng: driverUpdate.locationLng || driver.locationLng },
        });
      }
    }

    res.json({ message: `Estado actualizado a ${status}`, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

// @desc    Optimize delivery route sequence (Nearest-Neighbor)
// @route   POST /api/driver/optimize-route
router.post('/optimize-route', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ where: { userId: req.user.id } });
    if (!driver) {
      res.status(404);
      throw new Error('Perfil de conductor no encontrado');
    }

    const orders = await Order.findAll({
      where: {
        driverId: driver.id,
        status: { [Op.in]: ['assigned', 'in-transit'] },
      },
    });

    if (orders.length < 2) {
      return res.json({ message: 'No hay suficientes órdenes activas para optimizar.', orders: orders.map(serializeOrder) });
    }

    // Algoritmo Nearest-Neighbor (Haversine)
    const haversineKm = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    let currentNode = { lat: driver.locationLat || -12.0464, lng: driver.locationLng || -77.0428 };

    const unlocatable = orders.filter((o) => !o.customerLat || !o.customerLng);
    const locatable = orders.filter((o) => o.customerLat && o.customerLng);

    const sortedOrders = [];
    let remaining = [...locatable];

    while (remaining.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const dist = haversineKm(currentNode.lat, currentNode.lng, remaining[i].customerLat, remaining[i].customerLng);
        if (dist < minDist) { minDist = dist; nearestIdx = i; }
      }
      const next = remaining.splice(nearestIdx, 1)[0];
      sortedOrders.push(next);
      currentNode = { lat: next.customerLat, lng: next.customerLng };
    }

    const finalSequence = [...sortedOrders, ...unlocatable];

    // Reordenar via updatedAt (truco de orden visual)
    const baseTime = Date.now();
    for (let i = 0; i < finalSequence.length; i++) {
      await finalSequence[i].update({ updatedAt: new Date(baseTime - i * 1000) });
    }

    const logger = require('../utils/logger');
    logger.info(`🗺️ Ruta optimizada para Driver ${driver.name} (${finalSequence.length} pedidos)`);

    res.json({
      message: 'Ruta optimizada con éxito mediante algoritmo Nearest-Neighbor',
      orders: finalSequence.map(serializeOrder),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
