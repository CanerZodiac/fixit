import pool from '../db.js';

/**
 * ASSET MODEL
 * IT varlıkları (donanım/yazılım) DB işlemleri.
 */

export const AssetModel = {
    /** Tüm varlıkları getir */
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM assets ORDER BY name');
        return rows;
    },

    /** ID'ye göre varlık getir */
    async findById(id) {
        const [rows] = await pool.query('SELECT id FROM assets WHERE id = ?', [id]);
        return rows[0] ?? null;
    },

    /** ID'ye göre tam varlık getir */
    async findFullById(id) {
        const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        return rows[0] ?? null;
    },

    /** Yeni varlık oluştur */
    async create({ id, name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes, now }) {
        await pool.query(
            `INSERT INTO assets (id, name, type, brand, model, serial_number, status, assigned_to, assigned_to_name, department, location, purchase_date, warranty_expiry, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, type, brand, model ?? '', serialNumber, status ?? 'active', assignedTo ?? null, assignedToName ?? null, department ?? '', location ?? '', purchaseDate ?? null, warrantyExpiry ?? null, notes ?? null, now, now]
        );
    },

    /** Varlığı güncelle */
    async update({ id, name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes, now }) {
        await pool.query(
            `UPDATE assets SET name=?, type=?, brand=?, model=?, serial_number=?, status=?, assigned_to=?, assigned_to_name=?, department=?, location=?, purchase_date=?, warranty_expiry=?, notes=?, updated_at=? WHERE id=?`,
            [name, type, brand, model ?? '', serialNumber, status, assignedTo ?? null, assignedToName ?? null, department ?? '', location ?? '', purchaseDate ?? null, warrantyExpiry ?? null, notes ?? null, now, id]
        );
    },

    /** Varlığı sil */
    async delete(id) {
        await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    },
};
