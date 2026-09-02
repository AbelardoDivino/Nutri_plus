const rateLimit = new Map();
function limiter({ windowMs = 60000, max = 30, key = (req) => req.ip } = {}) {
  return (req, res, next) => {
    const k = key(req);
    const now = Date.now();
    const entry = rateLimit.get(k) || { count: 0, start: now };
    if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
    entry.count += 1;
    rateLimit.set(k, entry);
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((windowMs - (now - entry.start)) / 1000));
      return res.status(429).json({ msg: 'Muitas requisições, aguarde', retryAfter: Math.ceil((windowMs - (now - entry.start)) / 1000) });
    }
    next();
  };
}
module.exports = { limiter };
