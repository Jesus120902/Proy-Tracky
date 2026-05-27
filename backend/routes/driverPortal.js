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

        order.evidence = {
          recipientName: req.body.evidence.recipientName,
          signature: signatureUrl || req.body.evidence.signature,
          photo: photoUrl || req.body.evidence.photo,
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

// @desc    Optimize delivery route sequence (Nearest-Neighbor)
// @route   POST /api/driver/optimize-route
router.post('/optimize-route', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      res.status(404);
      throw new Error('Perfil de conductor no encontrado');
    }

    const orders = await Order.find({
      driver: driver._id,
      status: { $in: ['assigned', 'in-transit'] }
    });

    if (orders.length < 2) {
      return res.json({ message: 'No hay suficientes órdenes activas para optimizar.', orders });
    }

    // Algoritmo de Distancia Haversine (Vecino más cercano)
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

    let currentNode = {
      lat: driver.location.lat || -12.0464,
      lng: driver.location.lng || -77.0428
    };

    const remainingOrders = [...orders];
    const sortedOrders = [];

    // Separar órdenes no localizables
    const unlocatableOrders = remainingOrders.filter(o => 
      !o.customer?.coordinates?.lat || !o.customer?.coordinates?.lng
    );
    const locatableOrders = remainingOrders.filter(o => 
      o.customer?.coordinates?.lat && o.customer?.coordinates?.lng
    );

    // Resolver vecindades más cercanas
    let currentLocatable = [...locatableOrders];
    while (currentLocatable.length > 0) {
      let nearestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < currentLocatable.length; i++) {
        const order = currentLocatable[i];
        const dist = haversineKm(
          currentNode.lat,
          currentNode.lng,
          order.customer.coordinates.lat,
          order.customer.coordinates.lng
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const nextOrder = currentLocatable.splice(nearestIdx, 1)[0];
      sortedOrders.push(nextOrder);
      currentNode = {
        lat: nextOrder.customer.coordinates.lat,
        lng: nextOrder.customer.coordinates.lng
      };
    }

    const finalSequence = [...sortedOrders, ...unlocatableOrders];

    // Reordenar en BD mediante desfase de updatedAt (sort -1)
    const baseTime = Date.now();
    for (let i = 0; i < finalSequence.length; i++) {
      const order = finalSequence[i];
      order.updatedAt = new Date(baseTime - i * 1000);
      await order.save();
    }

    // Logs de auditoría
    const logger = require('../utils/logger');
    logger.info(`🗺️ Ruta optimizada para Driver ${driver.name} (${finalSequence.length} pedidos)`);

    res.json({
      message: 'Ruta optimizada con éxito mediante algoritmo Nearest-Neighbor',
      orders: finalSequence
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
