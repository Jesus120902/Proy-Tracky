const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// @desc    Get CURRENT company info (Autogestión SaaS)
// @route   GET /api/companies/me
router.get('/me', async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      res.status(404);
      throw new Error('No se encontró su organización');
    }
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// @desc    Update CURRENT company branding
// @route   PUT /api/companies/me
router.put('/me', async (req, res, next) => {
  try {
    const { name, logoUrl, branding } = req.body;
    const company = await Company.findById(req.user.company);
    
    if (!company) {
      res.status(404);
      throw new Error('Organización no encontrada');
    }

    if (name) company.name = name;
    if (logoUrl) company.logoUrl = logoUrl;
    if (branding) company.branding = { ...company.branding, ...branding };

    const updated = await company.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// --- RUTAS EXCLUSIVAS DE SUPERADMIN ---
router.use(authorize('superadmin'));

// @desc    Get all companies with order/driver counts
// @route   GET /api/companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.find({}).lean();
    const enrichedCompanies = await Promise.all(companies.map(async (company) => {
      const [orderCount, driverCount] = await Promise.all([
        Order.countDocuments({ company: company._id }),
        Driver.countDocuments({ company: company._id })
      ]);
      return { ...company, orderCount, driverCount };
    }));
    res.json(enrichedCompanies);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new company
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, logoUrl, primaryColor, plan } = req.body;
    const companyExists = await Company.findOne({ slug });
    if (companyExists) {
      res.status(400);
      throw new Error('Ese slug de empresa ya está registrado');
    }
    const company = await Company.create({
      name, slug, logoUrl,
      branding: { primaryColor },
      settings: { plan: plan || 'free' }
    });
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a company
router.delete('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Empresa no encontrada');
    }
    await Promise.all([
      Order.deleteMany({ company: req.params.id }),
      Driver.deleteMany({ company: req.params.id }),
      Company.findByIdAndDelete(req.params.id)
    ]);
    res.json({ message: 'Empresa y datos eliminados' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
