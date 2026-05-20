const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET Public Tracking info (ACCESO LIBRE - SIN JWT)
// Route: GET /api/orders/track/:orderNumber
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('company', 'name logoUrl branding')
      .populate('driver', 'name location status');

    if (!order) {
      res.status(404);
      return next(new Error('No se encontró ningún pedido con ese número'));
    }

    // Retornar solo lo necesario para el cliente final
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customer.name,
      address: order.customer.address,
      items: order.items,
      company: order.company,
      driver: order.driver ? {
        name: order.driver.name,
        location: order.driver.location,
        status: order.driver.status
      } : null,
      updatedAt: order.updatedAt
    });
  } catch (err) {
    next(err);
  }
});

// Aplicar el middleware de protección a TODAS las rutas administrativas siguientes
router.use(protect);

// GET all orders (filtrado por empresa, paginado y con búsqueda)
router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    // Filtro base: si es superadmin ve todo, si no, solo su empresa
    const filter = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('driver', 'name status vehicle phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({ orders, total, page: Number(page), totalPages, limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// GET single order
router.get('/:id', async (req, res, next) => {
  try {
    // Buscar por ID y por empresa para asegurar aislamiento
    const order = await Order.findOne({ _id: req.params.id, company: req.user.company }).populate('driver');
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada en su organización');
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST create order
router.post('/', async (req, res, next) => {
  try {
    // Forzar que la orden pertenezca a la empresa del usuario
    const orderData = { ...req.body, company: req.user.company };
    const order = new Order(orderData);
    const saved = await order.save();
    const populated = await saved.populate('driver', 'name status vehicle phone');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// PUT update order
router.put('/:id', async (req, res, next) => {
  try {
    const { driverId, ...rest } = req.body;

    // Verificar que la orden pertenezca a la empresa
    let order = await Order.findOne({ _id: req.params.id, company: req.user.company });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada');
    }

    // Gestionar asignación de conductor (dentro de la misma empresa)
    if (driverId) {
      const driver = await Driver.findOne({ _id: driverId, company: req.user.company });
      if (!driver) {
        res.status(404);
        throw new Error('Conductor no encontrado o no pertenece a su flota');
      }
      if (driver.status !== 'available' && driverId !== order.driver?.toString()) {
        res.status(400);
        throw new Error('El conductor seleccionado no está disponible');
      }

      driver.status = 'on-delivery';
      await driver.save();
      rest.driver = driverId;
      if (!rest.status || rest.status === 'pending') rest.status = 'assigned';
    }

    if (rest.status === 'delivered') rest.deliveredAt = new Date();

    if (rest.status === 'cancelled' && order.driver) {
      await Driver.findByIdAndUpdate(order.driver, { status: 'available' });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      rest,
      { new: true, runValidators: true }
    ).populate('driver', 'name status vehicle phone');

    // Emitir actualización de estado a la empresa y canales de rastreo
    if (req.io) {
      req.io.to(req.user.company.toString()).emit('order_status_update', {
        orderId: updated._id,
        orderNumber: updated.orderNumber,
        status: updated.status
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE order
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, company: req.user.company });
    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada');
    }

    if (order.driver) {
      await Driver.findByIdAndUpdate(order.driver, { status: 'available' });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Orden eliminada satisfactoriamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
