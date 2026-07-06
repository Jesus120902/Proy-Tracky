const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');
const { Order, Driver } = require('../models/associations');
const { protect } = require('../middleware/authMiddleware');

// Todo el módulo de analítica está protegido y filtrado por empresa (SaaS)
router.use(protect);

// @desc    Get summary statistics
// @route   GET /api/stats/summary
router.get('/summary', async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const companyFilter = isSuperAdmin ? {} : { companyId: req.user.company };
    const driverFilter = isSuperAdmin ? {} : { companyId: req.user.company };

    const [totalOrders, activeDrivers, deliveredOrders, pendingOrders] = await Promise.all([
      Order.count({ where: companyFilter }),
      Driver.count({ where: { ...driverFilter, status: 'on-delivery' } }),
      Order.count({ where: { ...companyFilter, status: 'delivered' } }),
      Order.count({
        where: {
          ...companyFilter,
          status: ['pending', 'assigned', 'in-transit'],
        },
      }),
    ]);

    const successRate =
      totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    res.json({ totalOrders, activeDrivers, deliveredOrders, pendingOrders, successRate });
  } catch (err) {
    next(err);
  }
});

// @desc    Get order trends for charts (Daily counts, last 7 days)
// @route   GET /api/stats/trends
router.get('/trends', async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const companyParam = isSuperAdmin ? null : req.user.company;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Raw SQL para GROUP BY fecha (Sequelize no tiene aggregation pipeline como Mongo)
    const query = `
      SELECT
        TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS date,
        COUNT(*) AS ordenes,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS entregadas
      FROM orders
      WHERE created_at >= :sevenDaysAgo
        ${companyParam ? 'AND company_id = :companyId' : ''}
      GROUP BY date
      ORDER BY date ASC
    `;

    const trends = await sequelize.query(query, {
      replacements: { sevenDaysAgo, companyId: companyParam },
      type: QueryTypes.SELECT,
    });

    res.json(
      trends.map((t) => ({
        date: t.date,
        ordenes: parseInt(t.ordenes, 10),
        entregadas: parseInt(t.entregadas, 10),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// @desc    Get status distribution for pie charts
// @route   GET /api/stats/distribution
router.get('/distribution', async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const companyParam = isSuperAdmin ? null : req.user.company;

    const query = `
      SELECT
        status AS _id,
        COUNT(*) AS value
      FROM orders
      ${companyParam ? 'WHERE company_id = :companyId' : ''}
      GROUP BY status
    `;

    const distribution = await sequelize.query(query, {
      replacements: { companyId: companyParam },
      type: QueryTypes.SELECT,
    });

    const statusMap = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      'in-transit': 'En Ruta',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    res.json(
      distribution.map((d) => ({
        name: statusMap[d._id] || d._id,
        value: parseInt(d.value, 10),
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
