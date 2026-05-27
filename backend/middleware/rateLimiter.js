const rateLimitStore = {};

/**
 * Custom lightweight in-memory rate limiter middleware.
 * @param {object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Max requests per windowMs (default: 100)
 * @param {string} options.message - Error message response
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.';

  // Limpieza periódica para evitar fugas de memoria
  setInterval(() => {
    const now = Date.now();
    for (const ip in rateLimitStore) {
      if (rateLimitStore[ip].resetTime < now) {
        delete rateLimitStore[ip];
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      if (rateLimitStore[ip].resetTime < now) {
        // Reiniciar ventana
        rateLimitStore[ip].count = 1;
        rateLimitStore[ip].resetTime = now + windowMs;
      } else {
        rateLimitStore[ip].count += 1;
      }
    }

    // Cabeceras estándar de Rate-Limiting
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - rateLimitStore[ip].count));
    res.setHeader('X-RateLimit-Reset', Math.round(rateLimitStore[ip].resetTime / 1000));

    if (rateLimitStore[ip].count > max) {
      res.status(429);
      return next(new Error(message));
    }

    next();
  };
};

module.exports = { createRateLimiter };
