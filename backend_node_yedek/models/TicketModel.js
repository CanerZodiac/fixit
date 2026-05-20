import pool from '../db.js';

/**
 * TICKET MODEL
 * Bilet ve ilişkili mesaj/event DB işlemleri.
 */

/** Tags alanını JSON parse eder */
const parseTags = (ticket) => {
    ticket.tags = ticket.tags
        ? (typeof ticket.tags === 'string' ? JSON.parse(ticket.tags) : ticket.tags)
        : [];
    return ticket;
};

export const TicketModel = {
    /** Tüm biletleri mesajlar ve eventlerle birlikte getir */
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM tickets ORDER BY updated_at DESC');
        for (const ticket of rows) {
            const [msgs] = await pool.query(
                'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp',
                [ticket.id]
            );
            const [evts] = await pool.query(
                'SELECT * FROM ticket_events WHERE ticket_id = ? ORDER BY timestamp',
                [ticket.id]
            );
            ticket.messages = msgs;
            ticket.events = evts;
            parseTags(ticket);
        }
        return rows;
    },

    /** ID'ye göre bilet getir */
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
        if (!rows[0]) return null;
        const ticket = rows[0];
        const [msgs] = await pool.query(
            'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp',
            [ticket.id]
        );
        const [evts] = await pool.query(
            'SELECT * FROM ticket_events WHERE ticket_id = ? ORDER BY timestamp',
            [ticket.id]
        );
        ticket.messages = msgs;
        ticket.events = evts;
        parseTags(ticket);
        return ticket;
    },

    /** Kaç bilet olduğunu getir (ID üretimi için) */
    async count() {
        const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM tickets');
        return rows[0].cnt;
    },

    /** Yeni bilet oluştur */
    async create({ id, title, description, category, priority, createdBy, createdByName, slaDeadline, now }) {
        await pool.query(
            `INSERT INTO tickets (id, title, description, category, priority, status, created_by, created_by_name, sla_deadline, tags, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, '[]', ?, ?)`,
            [id, title, description, category, priority, createdBy, createdByName, slaDeadline, now, now]
        );
    },

    /** Durum güncelle */
    async updateStatus(id, status, now, resolvedAt) {
        await pool.query(
            'UPDATE tickets SET status = ?, updated_at = ?, resolved_at = COALESCE(?, resolved_at) WHERE id = ?',
            [status, now, resolvedAt, id]
        );
    },

    /** Ajan ata */
    async assign(id, agentId, agentName, now) {
        await pool.query(
            'UPDATE tickets SET assigned_to = ?, assigned_to_name = ?, updated_at = ? WHERE id = ?',
            [agentId, agentName, now, id]
        );
    },

    /** updated_at güncelle */
    async touch(id, now) {
        await pool.query('UPDATE tickets SET updated_at = ? WHERE id = ?', [now, id]);
    },

    /** Event ekle */
    async addEvent({ id, ticketId, type, description, userId, userName, oldValue, newValue, timestamp }) {
        await pool.query(
            `INSERT INTO ticket_events (id, ticket_id, type, description, user_id, user_name, old_value, new_value, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ticketId, type, description, userId, userName, oldValue ?? null, newValue ?? null, timestamp]
        );
    },

    /** Mesaj ekle */
    async addMessage({ id, ticketId, senderId, senderName, senderRole, content, isInternal, timestamp }) {
        await pool.query(
            `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, content, is_internal, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ticketId, senderId, senderName, senderRole, content, isInternal, timestamp]
        );
    },
};
