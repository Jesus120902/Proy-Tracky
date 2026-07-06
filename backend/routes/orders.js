const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, Driver } = require('../models/associations');
const { protect } = require('../middleware/authMiddleware');

// ─── Helper: serializar lista de órdenes ──────────────────────────────
const serializeOrder = (order) => {
  const d = order.Driver;
  return {
    _id: order.id,
    orderNumber: order.orderNumber,
    company: order.companyId,
    driver: d
      ? {
          _id: d.id,
          name: d.name,
          status: d.status,
          vehicle: { type: d.vehicleType, plate: d.vehiclePlate },
          phone: d.phone || '',
        }
      : null,
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
  };
};

// GET Public Tracking info (ACCESO LIBRE - SIN JWT)
// Route: GET /api/orders/track/:orderNumber
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderNumber: req.params.orderNumber },
      include: [{ model: Driver, as: 'Driver' }],
    });

    if (!order) {
      res.status(404);
      return next(new Error('No se encontró ningún pedido con ese número'));
    }

    // Historial de ubicación de hoy
    let pathHistory = [];
    if (order.driverId) {
      try {
        const { LocationHistory } = require('../models/associations');
        const today = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Lima',
          year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(new Date());

        const history = await LocationHistory.findOne({
          where: { driverId: order.driverId, date: today },
        });

        if (history && history.path) {
          let points = history.path;
          if (order.transitStartedAt) {
            const startTime = new Date(order.transitStartedAt).getTime();
            points = points.filter((p) => new Date(p.timestamp).getTime() >= startTime);
          } else if (order.status === 'in-transit') {
            const startTime = new Date(order.updatedAt).getTime() - 2000;
            points = points.filter((p) => new Date(p.timestamp).getTime() >= startTime);
          } else {
            points = [];
          }
          pathHistory = points.map((p) => [p.lat, p.lng]);
        }
      } catch (historyErr) {
        console.error('Error al recuperar historial para tracking público:', historyErr);
      }
    }

    const d = order.Driver;
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      customer: {
        name: order.customerName,
        address: order.customerAddress,
        phone: order.customerPhone,
        coordinates: { lat: order.customerLat, lng: order.customerLng },
      },
      items: order.items,
      company: order.companyId,
      driver: d
        ? {
            _id: d.id,
            name: d.name,
            location: { lat: d.locationLat, lng: d.locationLng },
            status: d.status,
          }
        : null,
      pathHistory,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// Aplicar middleware de protección a rutas administrativas
router.use(protect);

// GET all orders (filtrado por empresa, paginado y con búsqueda)
router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = req.user.role === 'superadmin' ? {} : { companyId: req.user.company };

    if (status && status !== 'all') where.status = status;

    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{ model: Driver, as: 'Driver' }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: Number(limit),
    });

    res.json({
      orders: orders.map(serializeOrder),
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET single order
router.get('/:id', async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const order = await Order.findOne({
      where,
      include: [{ model: Driver, as: 'Driver' }],
    });

    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada en su organización');
    }

    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});

// POST create order
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const orderData = {
      companyId: req.user.company,
      customerName: body.customer?.name || body.customerName,
      customerAddress: body.customer?.address || body.customerAddress,
      customerPhone: body.customer?.phone || body.customerPhone || '',
      customerLat: body.customer?.coordinates?.lat ?? body.customerLat ?? null,
      customerLng: body.customer?.coordinates?.lng ?? body.customerLng ?? null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      items: body.items || '',
      notes: body.notes || '',
      estimatedDelivery: body.estimatedDelivery || null,
    };

    const order = await Order.create(orderData);
    const populated = await Order.findByPk(order.id, {
      include: [{ model: Driver, as: 'Driver' }],
    });

    res.status(201).json(serializeOrder(populated));
  } catch (err) {
    next(err);
  }
});

// PUT update order
router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body;
    const { driverId } = body;

    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    let order = await Order.findOne({ where });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada');
    }

    const updateData = {};

    // Mapear campos anidados del body al formato plano
    if (body.customer) {
      if (body.customer.name !== undefined) updateData.customerName = body.customer.name;
      if (body.customer.address !== undefined) updateData.customerAddress = body.customer.address;
      if (body.customer.phone !== undefined) updateData.customerPhone = body.customer.phone;
      if (body.customer.coordinates?.lat !== undefined) updateData.customerLat = body.customer.coordinates.lat;
      if (body.customer.coordinates?.lng !== undefined) updateData.customerLng = body.customer.coordinates.lng;
    }

    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.items !== undefined) updateData.items = body.items;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.estimatedDelivery !== undefined) updateData.estimatedDelivery = body.estimatedDelivery;

    // Asignación de conductor
    if (driverId) {
      const driverWhere = { id: driverId };
      if (req.user.role !== 'superadmin') driverWhere.companyId = req.user.company;

      const driver = await Driver.findOne({ where: driverWhere });
      if (!driver) {
        res.status(404);
        throw new Error('Conductor no encontrado o no pertenece a su flota');
      }
      if (driver.status !== 'available' && driverId !== order.driverId) {
        res.status(400);
        throw new Error('El conductor seleccionado no está disponible');
      }
      await driver.update({ status: 'on-delivery' });
      updateData.driverId = driverId;
      if (!updateData.status || updateData.status === 'pending') updateData.status = 'assigned';
    }

    if (updateData.status === 'delivered') updateData.deliveredAt = new Date();
    if (updateData.status === 'in-transit') updateData.transitStartedAt = updateData.transitStartedAt || new Date();

    if (updateData.status === 'cancelled' && order.driverId) {
      await Driver.update({ status: 'available' }, { where: { id: order.driverId } });
    }

    await order.update(updateData);

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Driver, as: 'Driver' }],
    });

    // Emitir actualización via Socket.io
    if (req.io) {
      req.io.to(req.user.company.toString()).emit('order_status_update', {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
      });
    }

    res.json(serializeOrder(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE order
router.delete('/:id', async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'superadmin') where.companyId = req.user.company;

    const order = await Order.findOne({ where });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada');
    }

    if (order.driverId) {
      await Driver.update({ status: 'available' }, { where: { id: order.driverId } });
    }

    await order.destroy();
    res.json({ message: 'Orden eliminada satisfactoriamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
