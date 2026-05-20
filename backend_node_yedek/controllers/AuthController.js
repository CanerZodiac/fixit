import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js';
import { createTransporter } from '../config/mail.js';
import { JWT_SECRET } from '../middleware/auth.js';

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * AUTH CONTROLLER
 * Kimlik doğrulama iş mantığı.
 */

export const AuthController = {
    /** Yeni kullanıcı kaydı */
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const existing = await UserModel.findByEmail(email);
            if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });

            const hash = await bcrypt.hash(password, 10);
            const code = generateCode();
            const id = `u-${Date.now()}`;

            await UserModel.create({ id, name, email, passwordHash: hash, role: 'employee', verificationCode: code });

            try {
                const transporter = createTransporter();
                await transporter.sendMail({
                    from: `"FixIT Destek" <${process.env.MAIL_USER}>`,
                    to: email,
                    subject: 'Doğrulama Kodunuz - FixIT',
                    html: `<p>Merhaba ${name},</p><p>Kayıt işlemini tamamlamak için doğrulama kodunuz:</p><h2 style="color:#f59e0b;letter-spacing:4px;">${code}</h2>`
                });
            } catch (e) {
                console.error('Dogrulama maili gonderilemedi', e);
            }

            res.status(201).json({ success: true, message: 'Doğrulama kodu e-postanıza gönderildi.', userId: id });
        } catch (err) {
            console.error('[AUTH] register error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** E-posta doğrulama kodu kontrolü */
    async verifyEmail(req, res) {
        try {
            const { userId, code } = req.body;
            const row = await UserModel.getVerificationCode(userId);
            if (!row || row.verification_code !== code) {
                return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
            }
            await UserModel.verifyEmail(userId);
            res.json({ success: true, message: 'Hesabınız başarıyla doğrulandı. Giriş yapabilirsiniz.' });
        } catch (err) {
            console.error('[AUTH] verifyEmail error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Şifre sıfırlama kodu gönder */
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await UserModel.findByEmail(email);
            if (!user) return res.json({ success: true }); // Güvenlik: e-posta varlığını açıklama

            const code = generateCode();
            const expires = new Date(Date.now() + 15 * 60 * 1000);
            await UserModel.setResetCode(email, code, expires);

            try {
                const transporter = createTransporter();
                await transporter.sendMail({
                    from: `"FixIT Destek" <${process.env.MAIL_USER}>`,
                    to: email,
                    subject: 'Şifre Sıfırlama Kodu - FixIT',
                    html: `<p>Merhaba ${user.name},</p><p>Şifre sıfırlama kodunuz (15 dakika geçerlidir):</p><h2 style="color:#ef4444;letter-spacing:4px;">${code}</h2>`
                });
            } catch (e) {
                console.error('MAIL GONDERIMI BASARISIZ (Sifre Sifirlama):', e.message);
            }

            res.json({ success: true, userId: user.id });
        } catch (err) {
            console.error('[AUTH] forgotPassword error:', err);
            res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
        }
    },

    /** Şifre sıfırlama kodunu doğrula */
    async verifyReset(req, res) {
        try {
            const { userId, code } = req.body;
            const row = await UserModel.getResetInfo(userId);
            if (!row || row.reset_code !== code) return res.status(400).json({ error: 'Geçersiz kod.' });
            if (new Date() > new Date(row.reset_expires)) return res.status(400).json({ error: 'Süresi dolmuş kod.' });
            res.json({ success: true });
        } catch (err) {
            console.error('[AUTH] verifyReset error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Şifreyi sıfırla */
    async resetPassword(req, res) {
        try {
            const { userId, code, newPassword } = req.body;
            const row = await UserModel.getResetInfo(userId);
            if (!row || row.reset_code !== code || new Date() > new Date(row.reset_expires)) {
                return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş işlem.' });
            }
            const hash = await bcrypt.hash(newPassword, 10);
            await UserModel.updatePassword(userId, hash);
            res.json({ success: true, message: 'Şifreniz başarıyla değiştirildi.' });
        } catch (err) {
            console.error('[AUTH] resetPassword error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Giriş yap */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findByEmail(email);
            if (!user) return res.status(401).json({ error: 'Hatalı e-posta veya şifre.' });

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return res.status(401).json({ error: 'Hatalı e-posta veya şifre.' });

            if (!user.email_verified && user.id !== 'u-admin') {
                return res.status(403).json({ error: 'E-posta henüz doğrulanmamış.', needsVerification: true, userId: user.id });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
            const { password_hash, reset_code, verification_code, ...safeUser } = user;
            res.json({ success: true, token, user: safeUser });
        } catch (err) {
            console.error('[AUTH] login error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Mevcut kullanıcıyı token ile getir */
    async me(req, res) {
        try {
            const user = await UserModel.findSafeById(req.user.id);
            if (!user) return res.sendStatus(404);
            res.json(user);
        } catch (err) {
            console.error('[AUTH] me error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
