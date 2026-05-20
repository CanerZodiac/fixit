import { AssetModel } from '../models/AssetModel.js';

/**
 * ASSET CONTROLLER
 * IT varlık yönetimi iş mantığı.
 */

export const AssetController = {
    /** Tüm varlıkları listele */
    async getAll(_req, res) {
        try {
            const assets = await AssetModel.findAll();
            res.json(assets);
        } catch (err) {
            console.error('[ASSET] getAll error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Yeni varlık oluştur */
    async create(req, res) {
        try {
            const { name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes } = req.body;
            if (!name || !type || !brand || !serialNumber) {
                return res.status(400).json({ error: 'Eksik zorunlu alanlar: name, type, brand, serialNumber' });
            }
            const id = `a-${Date.now()}`;
            const now = new Date();
            await AssetModel.create({ id, name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes, now });
            const asset = await AssetModel.findFullById(id);
            res.status(201).json(asset);
        } catch (err) {
            console.error('[ASSET] create error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Varlığı güncelle */
    async update(req, res) {
        try {
            const { name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes } = req.body;
            const existing = await AssetModel.findById(req.params.id);
            if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });

            const now = new Date();
            await AssetModel.update({ id: req.params.id, name, type, brand, model, serialNumber, status, assignedTo, assignedToName, department, location, purchaseDate, warrantyExpiry, notes, now });
            const asset = await AssetModel.findFullById(req.params.id);
            res.json(asset);
        } catch (err) {
            console.error('[ASSET] update error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Varlığı sil */
    async remove(req, res) {
        try {
            const existing = await AssetModel.findById(req.params.id);
            if (!existing) return res.status(404).json({ error: 'Varlık bulunamadı' });
            await AssetModel.delete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error('[ASSET] remove error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
