const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const { Company, Order, Driver } = require('../models/associations');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Helper: serializar company para el frontend
const serializeCompany = (company) => ({
  _id: company.id,
  name: company.name,
  slug: company.slug,
  logoUrl: company.logoUrl,
  branding: {
    primaryColor: company.brandingPrimaryColor,
    secondaryColor: company.brandingSecondaryColor,
  },
  settings: { maxDrivers: company.maxDrivers },
  subscription: {
    plan: company.subscriptionPlan,
    status: company.subscriptionStatus,
    startDate: company.subscriptionStartDate,
    endDate: company.subscriptionEndDate,
    mpSubscriptionId: company.mpSubscriptionId,
    mpCustomerId: company.mpCustomerId,
  },
  active: company.active,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt,
});

// @desc    Get CURRENT company info (Autogestión SaaS)
// @route   GET /api/companies/me
router.get('/me', async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.user.company);
    if (!company) {
      res.status(404);
      throw new Error('No se encontró su organización');
    }
    res.json(serializeCompany(company));
  } catch (err) {
    next(err);
  }
});

// @desc    Update CURRENT company branding
// @route   PUT /api/companies/me
router.put('/me', async (req, res, next) => {
  try {
    const { name, logoUrl, branding } = req.body;
    const company = await Company.findByPk(req.user.company);

    if (!company) {
      res.status(404);
      throw new Error('Organización no encontrada');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (logoUrl) updateData.logoUrl = logoUrl;
    if (branding?.primaryColor) updateData.brandingPrimaryColor = branding.primaryColor;
    if (branding?.secondaryColor) updateData.brandingSecondaryColor = branding.secondaryColor;

    await company.update(updateData);
    res.json(serializeCompany(company));
  } catch (err) {
    next(err);
  }
});

// ─── RUTAS EXCLUSIVAS DE SUPERADMIN ──────────────────────────────────
router.use(authorize('superadmin'));

// @desc    Get all companies with order/driver counts
// @route   GET /api/companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.findAll({});

    const enriched = await Promise.all(
      companies.map(async (company) => {
        const [orderCount, driverCount] = await Promise.all([
          Order.count({ where: { companyId: company.id } }),
          Driver.count({ where: { companyId: company.id } }),
        ]);
        return { ...serializeCompany(company), orderCount, driverCount };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new company
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, logoUrl, primaryColor, plan } = req.body;

    const exists = await Company.findOne({ where: { slug } });
    if (exists) {
      res.status(400);
      throw new Error('Ese slug de empresa ya está registrado');
    }

    const company = await Company.create({
      name,
      slug,
      logoUrl: logoUrl || '',
      brandingPrimaryColor: primaryColor || '#3b82f6',
      subscriptionPlan: plan || 'free',
    });

    res.status(201).json(serializeCompany(company));
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a company
router.delete('/:id', async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Empresa no encontrada');
    }

    await Promise.all([
      Order.destroy({ where: { companyId: req.params.id } }),
      Driver.destroy({ where: { companyId: req.params.id } }),
    ]);
    await company.destroy();

    res.json({ message: 'Empresa y datos eliminados' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
