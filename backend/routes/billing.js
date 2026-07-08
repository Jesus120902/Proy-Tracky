const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Company = require('../models/Company');
const { protect } = require('../middleware/authMiddleware');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000';
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

// @desc    Create a payment preference for a plan
// @route   POST /api/billing/create-preference
// @access  Private
router.post('/create-preference', protect, async (req, res, next) => {
  const { plan } = req.body;
  const user = req.user; // from protect middleware
  
  if (!user.company) {
    res.status(400);
    return next(new Error('El usuario no pertenece a una empresa'));
  }

  let price = 0;
  let title = '';

  if (plan === 'pro') {
    price = 79;
    title = 'Plan Pro - Tracky';
  } else if (plan === 'business') {
    price = 149;
    title = 'Plan Business - Tracky';
  } else {
    res.status(400);
    return next(new Error('Plan inválido'));
  }

  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: 'PEN'
          }
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=success`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=failure`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=pending`
        },
        ...(process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') ? { auto_return: 'approved' } : {}),
        external_reference: user.company.toString(), // To identify the company in the webhook
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    next(new Error('Error al conectar con la pasarela de pagos'));
  }
});

// @desc    MercadoPago Webhook to update subscription
// @route   POST /api/billing/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  try {
    // If it's a payment, we should verify it and update the company
    if (type === 'payment' && data && data.id) {
      // Typically we should fetch the payment from MP API to verify, but for simplicity here:
      // const payment = await fetch(MP payment API...)
      // const companyId = payment.external_reference;
      // We'll return 200 OK to MP
      console.log('Pago recibido:', data.id);
      
      // We need real MP API implementation to get external_reference and update company.
      // E.g., if approved, set plan = 'pro' or 'business' based on payment details, and status = 'active'.
      
      res.status(200).send('OK');
    } else {
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook Error');
  }
});

// @desc    Get current plan for the company
// @route   GET /api/billing/plan
// @access  Private
router.get('/plan', protect, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.company) {
      res.status(400);
      return next(new Error('El usuario no pertenece a una empresa'));
    }

    const company = await Company.findById(user.company);
    if (!company) {
      res.status(404);
      return next(new Error('Empresa no encontrada'));
    }

    res.json(company.subscription || { plan: 'free', status: 'trialing' });
  } catch (error) {
    next(error);
  }
});

// @desc    Simulate successful payment for local development
// @route   POST /api/billing/simulate-success
// @access  Private
router.post('/simulate-success', protect, async (req, res, next) => {
  const { plan } = req.body;
  const user = req.user;

  if (!user.company) {
    res.status(400);
    return next(new Error('El usuario no pertenece a una empresa'));
  }

  if (!['free', 'pro', 'business'].includes(plan)) {
    res.status(400);
    return next(new Error('Plan inválido'));
  }

  try {
    const company = await Company.findById(user.company);
    if (!company) {
      res.status(404);
      return next(new Error('Empresa no encontrada'));
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    company.subscription = {
      plan: plan,
      status: plan === 'free' ? 'trialing' : 'active',
      startDate: new Date(),
      endDate: thirtyDaysFromNow,
      mpSubscriptionId: 'simulated_sub_' + Math.random().toString(36).substring(7),
      mpCustomerId: 'simulated_cust_' + Math.random().toString(36).substring(7)
    };

    await company.save();

    res.json({
      message: `Simulación exitosa. Plan ${plan.toUpperCase()} activado por 30 días.`,
      subscription: company.subscription
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
