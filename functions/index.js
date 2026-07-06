/**
 * Cloud Functions — Tracky
 *
 * Funciones que requieren lógica de servidor y no pueden correr en Data Connect:
 * 1. webhookMercadoPago  — Recibe notificaciones de pago y actualiza suscripción
 * 2. createMPPreference  — Crea una preferencia de pago en MercadoPago
 * 3. getStatsTrends      — Estadísticas de tendencia (GROUP BY fecha)
 * 4. getStatsDistribution — Distribución de estados de órdenes
 * 5. optimizeRoute       — Algoritmo Nearest-Neighbor para conductores
 * 6. onUserDeleted       — Limpia datos al eliminar un usuario de Firebase Auth
 */
const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
const https = require('https');

admin.initializeApp();
const db = admin.database();

// ── MercadoPago Client ───────────────────────────────────────────────────────
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || functions.params.defineSecret('MP_ACCESS_TOKEN').value();
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tracky-app.web.app';

const PLANS = {
  pro: { price: 79, title: 'Plan Pro - Tracky', durationDays: 30 },
  business: { price: 149, title: 'Plan Business - Tracky', durationDays: 30 },
};

// ── 1. Webhook MercadoPago ────────────────────────────────────────────────────
exports.webhookMercadoPago = functions.https.onRequest(
  { cors: false, region: 'us-central1' },
  async (req, res) => {
    const { type, data } = req.body;

    try {
      if (type === 'payment' && data?.id) {
        const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
        const paymentApi = new Payment(client);
        const payment = await paymentApi.get({ id: data.id });

        console.log(`📩 Webhook MP: payment ${data.id} | status: ${payment.status}`);

        if (payment.status === 'approved' && payment.external_reference) {
          const [companyId, plan] = payment.external_reference.split('|');
          const planConfig = PLANS[plan];

          if (!companyId || !planConfig) {
            console.warn('⚠️ external_reference inválido:', payment.external_reference);
            return res.status(200).send('OK');
          }

          const endDate = new Date();
          endDate.setDate(endDate.getDate() + planConfig.durationDays);

          // Actualizar suscripción via Data Connect Admin SDK
          // (Firebase Data Connect Admin SDK se usa con el servicio de Firebase)
          // Usamos Firestore o Realtime DB como alternativa para marcar la suscripción
          // hasta que el SDK admin de Data Connect esté disponible

          // Opción: actualizar via Realtime DB para que el cliente lo detecte
          await db.ref(`subscriptionUpdates/${companyId}`).set({
            plan,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: endDate.toISOString(),
            mpPaymentId: payment.id.toString(),
            mpCustomerId: payment.payer?.id?.toString() || null,
            updatedAt: admin.database.ServerValue.TIMESTAMP,
          });

          console.log(`✅ Suscripción '${plan}' activa para empresa ${companyId}`);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(200).send('OK'); // Siempre 200 para MP
    }
  }
);

// ── 2. Crear preferencia de pago MercadoPago ──────────────────────────────────
exports.createMPPreference = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Requiere autenticación');
    }

    const { plan, companyId } = request.data;
    const planConfig = PLANS[plan];

    if (!planConfig) {
      throw new functions.https.HttpsError('invalid-argument', 'Plan inválido');
    }

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [{ id: plan, title: planConfig.title, quantity: 1, unit_price: planConfig.price, currency_id: 'PEN' }],
        payer: { email: request.auth.token.email },
        back_urls: {
          success: `${FRONTEND_URL}/portal?status=success`,
          failure: `${FRONTEND_URL}/portal?status=failure`,
          pending: `${FRONTEND_URL}/portal?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `${companyId}|${plan}`,
      },
    });

    return { id: result.id, init_point: result.init_point };
  }
);

// ── 3. Estadísticas: tendencias diarias (últimos 7 días) ─────────────────────
// Nota: Data Connect no tiene GROUP BY directamente en queries.
// Esta función recibe los datos del cliente y los agrupa.
exports.getStatsTrends = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Requiere autenticación');
    }
    // Los datos reales vendrán de Data Connect (cliente ya puede hacer queries)
    // Esta función puede generar tendencias ficticias o procesar datos del cliente
    const { orders = [] } = request.data;

    const trendMap = {};
    const now = Date.now();

    // Últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = { date: key, ordenes: 0, entregadas: 0 };
    }

    orders.forEach((order) => {
      const key = order.createdAt?.split('T')[0];
      if (trendMap[key]) {
        trendMap[key].ordenes++;
        if (order.status === 'delivered') trendMap[key].entregadas++;
      }
    });

    return Object.values(trendMap);
  }
);

// ── 4. Distribución de estados ────────────────────────────────────────────────
exports.getStatsDistribution = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Requiere autenticación');
    }

    const { orders = [] } = request.data;
    const statusMap = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      'in-transit': 'En Ruta',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, value]) => ({
      name: statusMap[status] || status,
      value,
    }));
  }
);

// ── 5. Optimizar ruta (Nearest-Neighbor) ─────────────────────────────────────
exports.optimizeRoute = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Requiere autenticación');
    }

    const { orders = [], driverLocation = { lat: -12.0464, lng: -77.0428 } } = request.data;

    if (orders.length < 2) {
      return { message: 'No hay suficientes órdenes para optimizar.', orders };
    }

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

    const locatable = orders.filter((o) => o.customerLat && o.customerLng);
    const unlocatable = orders.filter((o) => !o.customerLat || !o.customerLng);

    let current = driverLocation;
    const sorted = [];
    let remaining = [...locatable];

    while (remaining.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;
      remaining.forEach((o, i) => {
        const dist = haversineKm(current.lat, current.lng, o.customerLat, o.customerLng);
        if (dist < minDist) { minDist = dist; nearestIdx = i; }
      });
      const next = remaining.splice(nearestIdx, 1)[0];
      sorted.push(next);
      current = { lat: next.customerLat, lng: next.customerLng };
    }

    return {
      message: 'Ruta optimizada con éxito',
      orders: [...sorted, ...unlocatable],
    };
  }
);

// ── 6. Cleanup al eliminar usuario de Firebase Auth ───────────────────────────
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  console.log(`🗑 Usuario eliminado de Auth: ${user.uid}`);
  // La limpieza del perfil en Data Connect se hace manualmente desde el panel
  // o via Admin SDK cuando esté disponible en Data Connect
});
