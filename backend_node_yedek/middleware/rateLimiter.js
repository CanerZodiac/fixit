import rateLimit from 'express-rate-limit';

/**
 * Auth endpoint'leri için rate limiter (login, register, forgot-password).
 * 15 dakikada maksimum 10 istek.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Çok fazla deneme yaptınız, lütfen 15 dakika sonra tekrar deneyin.' }
});

/**
 * AI Chat endpoint'i için rate limiter.
 * 1 dakikada maksimum 30 istek.
 */
export const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
});
