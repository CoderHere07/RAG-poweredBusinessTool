import rateLimit from 'express-rate-limit';

// Chat hits the LLM provider — the expensive/rate-limited resource.
// Keep this tighter than the general API limit.
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'rate_limited', message: 'Too many questions — please wait a moment before asking again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit — generous, mainly a backstop against runaway clients.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'rate_limited', message: 'Too many requests — please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});