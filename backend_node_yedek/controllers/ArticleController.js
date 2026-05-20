import { ArticleModel } from '../models/ArticleModel.js';

/**
 * ARTICLE CONTROLLER
 * Bilgi tabanı makale iş mantığı.
 */

export const ArticleController = {
    /** Tüm makaleleri listele */
    async getAll(_req, res) {
        try {
            const articles = await ArticleModel.findAll();
            res.json(articles);
        } catch (err) {
            console.error('[ARTICLE] getAll error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** ID'ye göre makale getir */
    async getById(req, res) {
        try {
            const article = await ArticleModel.findById(req.params.id);
            if (!article) return res.status(404).json({ error: 'Makale bulunamadı' });
            res.json(article);
        } catch (err) {
            console.error('[ARTICLE] getById error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
