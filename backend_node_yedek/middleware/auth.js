import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-fort-knox-secret-key-fixit';

/**
 * JWT token doğrulama middleware'i.
 * Authorization: Bearer <token> header'ını kontrol eder.
 */
export const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Oturum bulunamadı' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Geçersiz oturum' });
        req.user = decoded;
        next();
    });
};

export { JWT_SECRET };
