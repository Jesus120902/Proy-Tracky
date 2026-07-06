const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { Company } = require('../models/associations');
const { protect } = require('../middleware/authMiddleware');

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN ||
  'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000';
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

// ─── PLAN PRICES MAP ─────────────────────────────────────────────────
const PLANS = {
  pro: { price: 79, title: 'Plan Pro - Tracky', durationDays: 30 },
  business: { price: 149, title: 'Plan Business - Tracky', durationDays: 30 },
};

// @desc    Create a payment preference for a plan
// @route   POST /api/billing/create-preference
// @access  Private
router.post('/create-preference', protect, async (req, res, next) => {
  const { plan } = req.body;
  const user = req.user;

  if (!user.company) {
    res.status(400);
    return next(new Error('El usuario no pertenece a una empresa'));
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    res.status(400);
    return next(new Error('Plan inválido. Los planes disponibles son: pro, business'));
  }

  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: planConfig.title,
            quantity: 1,
            unit_price: planConfig.price,
            currency_id: 'PEN',
          },
        ],
        payer: { email: user.email },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=success`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=failure`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal?status=pending`,
        },
        ...(process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost')
          ? { auto_return: 'approved' }
          : {}),
        // Guardamos companyId:plan en external_reference para el webhook
        external_reference: `${user.company}|${plan}`,
      },
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    next(new Error('Error al conectar con la pasarela de pagos'));
  }
});

// @desc    MercadoPago Webhook — actualiza suscripción tras pago aprobado
// @route   POST /api/billing/webhook
// @access  Public (llamado por MP)
router.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  try {
    if (type === 'payment' && data?.id) {
      // Verificar el pago directamente con la API de Mercado Pago
      const paymentApi = new Payment(client);
      const payment = await paymentApi.get({ id: data.id });

      console.log(`📩 Webhook MP: payment ${data.id} | status: ${payment.status}`);

      if (payment.status === 'approved' && payment.external_reference) {
        // external_reference = "companyId|plan"
        const [companyId, plan] = payment.external_reference.split('|');

        if (!companyId || !plan || !PLANS[plan]) {
          console.warn('⚠️ Webhook: external_reference inválido:', payment.external_reference);
          return res.status(200).send('OK');
        }

        const company = await Company.findByPk(companyId);
        if (!company) {
          console.warn('⚠️ Webhook: empresa no encontrada:', companyId);
          return res.status(200).send('OK');
        }

        const planConfig = PLANS[plan];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planConfig.durationDays);

        await company.update({
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: endDate,
          mpSubscriptionId: payment.id.toString(),
          mpCustomerId: payment.payer?.id?.toString() || null,
        });

        console.log(`✅ Plan '${plan}' activado para empresa ${companyId} hasta ${endDate.toISOString()}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    // Siempre devolver 200 a MP para que no reintente indefinidamente
    res.status(200).send('OK');
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

    const company = await Company.findByPk(user.company);
    if (!company) {
      res.status(404);
      return next(new Error('Empresa no encontrada'));
    }

    res.json({
      plan: company.subscriptionPlan,
      status: company.subscriptionStatus,
      startDate: company.subscriptionStartDate,
      endDate: company.subscriptionEndDate,
      mpSubscriptionId: company.mpSubscriptionId,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
