import pool from '../db.js';

/**
 * ARTICLE MODEL
 * Bilgi tabanı makaleleri DB işlemleri.
 */

const parseTags = (article) => {
    article.tags = article.tags
        ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags)
        : [];
    return article;
};

export const ArticleModel = {
    /** Tüm makaleleri getir */
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        rows.forEach(parseTags);
        return rows;
    },

    /** ID'ye göre makale getir */
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
        if (!rows[0]) return null;
        return parseTags(rows[0]);
    },
};
