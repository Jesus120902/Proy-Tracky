const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/authMiddleware');

// Todo el módulo de analítica está protegido y filtrado por empresa (SaaS)
router.use(protect);

// @desc    Get summary statistics
// @route   GET /api/stats/summary
router.get('/summary', async (req, res, next) => {
  try {
    // Si es superadmin ve todo, si no, solo su empresa
    const filter = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    
    const [totalOrders, activeDrivers, deliveredOrders, pendingOrders] = await Promise.all([
      Order.countDocuments(filter),
      Driver.countDocuments({ ...filter, status: 'on-delivery' }),
      Order.countDocuments({ ...filter, status: 'delivered' }),
      Order.countDocuments({ ...filter, status: { $in: ['pending', 'assigned', 'in-transit'] } })
    ]);

    const successRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    res.json({
      totalOrders,
      activeDrivers,
      deliveredOrders,
      pendingOrders,
      successRate
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get order trends for charts (Daily counts)
// @route   GET /api/stats/trends
router.get('/trends', async (req, res, next) => {
  try {
    const filter = { company: req.user.company };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Agregación de MongoDB para agrupar por día
    const matchQuery = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    
    const trends = await Order.aggregate([
      { 
        $match: { 
          ...matchQuery,
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          delivered: { 
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } 
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(trends.map(t => ({
      date: t._id,
      ordenes: t.count,
      entregadas: t.delivered
    })));
  } catch (err) {
    next(err);
  }
});

// @desc    Get status distribution for pie charts
// @route   GET /api/stats/distribution
router.get('/distribution', async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'superadmin' ? {} : { company: req.user.company };
    const distribution = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      'pending': 'Pendiente',
      'assigned': 'Asignado',
      'in-transit': 'En Ruta',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };

    res.json(distribution.map(d => ({
      name: statusMap[d._id] || d._id,
      value: d.value
    })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
