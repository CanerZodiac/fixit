import pool from '../db.js';

/**
 * STATS CONTROLLER
 * Dashboard istatistikleri.
 */

export const StatsController = {
    async getStats(_req, res) {
        try {
            const [total]      = await pool.query("SELECT COUNT(*) as c FROM tickets");
            const [open]       = await pool.query("SELECT COUNT(*) as c FROM tickets WHERE status='open'");
            const [inProgress] = await pool.query("SELECT COUNT(*) as c FROM tickets WHERE status IN ('in_progress','waiting')");
            const [resolved]   = await pool.query("SELECT COUNT(*) as c FROM tickets WHERE status IN ('resolved','closed')");

            res.json({
                total:      total[0].c,
                open:       open[0].c,
                inProgress: inProgress[0].c,
                resolved:   resolved[0].c,
            });
        } catch (err) {
            console.error('[STATS] getStats error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
