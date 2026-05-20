import { UserModel } from '../models/UserModel.js';

/**
 * USER CONTROLLER
 * Kullanıcı listeleme ve sorgulama işlemleri.
 */

export const UserController = {
    /** Tüm kullanıcıları listele */
    async getAll(_req, res) {
        try {
            const users = await UserModel.findAll();
            res.json(users);
        } catch (err) {
            console.error('[USER] getAll error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** ID'ye göre kullanıcı getir */
    async getById(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            res.json(user ?? null);
        } catch (err) {
            console.error('[USER] getById error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Role göre kullanıcıları getir */
    async getByRole(req, res) {
        try {
            const users = await UserModel.findByRole(req.params.role);
            res.json(users);
        } catch (err) {
            console.error('[USER] getByRole error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
