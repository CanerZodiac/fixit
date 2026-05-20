import pool from '../db.js';

/**
 * USER MODEL
 * Sadece veritabanı işlemleri. Business logic burada YOK.
 */

export const UserModel = {
    /** E-posta adresine göre kullanıcı bul */
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] ?? null;
    },

    /** ID'ye göre kullanıcı bul */
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] ?? null;
    },

    /** ID'ye göre güvenli alanları getir (şifre hariç) */
    async findSafeById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, avatar, department FROM users WHERE id = ?',
            [id]
        );
        return rows[0] ?? null;
    },

    /** Tüm kullanıcıları getir */
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY name');
        return rows;
    },

    /** Role göre kullanıcıları getir */
    async findByRole(role) {
        const [rows] = await pool.query('SELECT * FROM users WHERE role = ?', [role]);
        return rows;
    },

    /** Yeni kullanıcı oluştur */
    async create({ id, name, email, passwordHash, role, verificationCode }) {
        await pool.query(
            'INSERT INTO users (id, name, email, password_hash, role, verification_code) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, email, passwordHash, role, verificationCode]
        );
    },

    /** E-posta doğrulamasını tamamla */
    async verifyEmail(id) {
        await pool.query(
            'UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE id = ?',
            [id]
        );
    },

    /** Şifre sıfırlama kodunu kaydet */
    async setResetCode(email, code, expires) {
        await pool.query(
            'UPDATE users SET reset_code = ?, reset_expires = ? WHERE email = ?',
            [code, expires, email]
        );
    },

    /** Şifre sıfırlama kodunu kontrol et */
    async getResetInfo(id) {
        const [rows] = await pool.query(
            'SELECT reset_code, reset_expires FROM users WHERE id = ?',
            [id]
        );
        return rows[0] ?? null;
    },

    /** Şifreyi güncelle, sıfırlama kodlarını temizle */
    async updatePassword(id, passwordHash) {
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?',
            [passwordHash, id]
        );
    },

    /** Doğrulama kodunu kontrol et */
    async getVerificationCode(id) {
        const [rows] = await pool.query(
            'SELECT verification_code FROM users WHERE id = ?',
            [id]
        );
        return rows[0] ?? null;
    },
};
