import { TicketModel } from '../models/TicketModel.js';
import { UserModel } from '../models/UserModel.js';
import { createTransporter } from '../config/mail.js';

/**
 * TICKET CONTROLLER
 * Destek bileti iş mantığı.
 */

export const TicketController = {
    /** Tüm biletleri getir */
    async getAll(_req, res) {
        try {
            const tickets = await TicketModel.findAll();
            res.json(tickets);
        } catch (err) {
            console.error('[TICKET] getAll error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** ID'ye göre bilet getir */
    async getById(req, res) {
        try {
            const ticket = await TicketModel.findById(req.params.id);
            if (!ticket) return res.status(404).json({ error: 'Bilet bulunamadı' });
            res.json(ticket);
        } catch (err) {
            console.error('[TICKET] getById error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Yeni bilet oluştur */
    async create(req, res) {
        try {
            const { title, description, category, priority, createdBy, createdByName } = req.body;
            const count = await TicketModel.count();
            const num = count + 1;
            const id = `TKT-${String(num).padStart(3, '0')}`;
            const now = new Date();

            const slaHours = { critical: 4, high: 8, medium: 24, low: 48 }[priority] ?? 24;
            const slaDeadline = new Date(now.getTime() + slaHours * 3600000);

            await TicketModel.create({ id, title, description, category, priority, createdBy, createdByName, slaDeadline, now });

            const eventId = `e-${Date.now()}`;
            await TicketModel.addEvent({
                id: eventId,
                ticketId: id,
                type: 'created',
                description: 'Bilet olusturuldu',
                userId: createdBy,
                userName: createdByName,
                timestamp: now,
            });

            const ticket = await TicketModel.findById(id);
            res.status(201).json(ticket);
        } catch (err) {
            console.error('[TICKET] create error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Bilet durumunu güncelle */
    async updateStatus(req, res) {
        try {
            const { status, userId, userName } = req.body;
            const now = new Date();
            const existing = await TicketModel.findById(req.params.id);
            if (!existing) return res.status(404).json({ error: 'Bilet bulunamadı' });

            const resolvedAt = (status === 'resolved' || status === 'closed') ? now : null;
            await TicketModel.updateStatus(req.params.id, status, now, resolvedAt);

            const desc = status === 'resolved' ? 'Bilet cozuldu' : status === 'closed' ? 'Bilet kapatildi' : 'Durum degisti';
            await TicketModel.addEvent({
                id: `e-${Date.now()}`,
                ticketId: req.params.id,
                type: status === 'resolved' ? 'resolved' : 'status_changed',
                description: desc,
                userId,
                userName,
                oldValue: existing.status,
                newValue: status,
                timestamp: now,
            });

            res.json({ success: true });
        } catch (err) {
            console.error('[TICKET] updateStatus error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Bileti ajan ata */
    async assign(req, res) {
        try {
            const { agentId, agentName, userId, userName } = req.body;
            const now = new Date();
            await TicketModel.assign(req.params.id, agentId, agentName, now);
            await TicketModel.addEvent({
                id: `e-${Date.now()}`,
                ticketId: req.params.id,
                type: 'assigned',
                description: `${agentName}'e atandi`,
                userId,
                userName,
                timestamp: now,
            });

            // ATAMA MAİLİ GÖNDERİMİ (Otomatik)
            try {
                if (process.env.MAIL_USER && process.env.MAIL_PASS) {
                    const agent = await UserModel.findById(agentId);
                    const ticket = await TicketModel.findById(req.params.id);
                    
                    if (agent && agent.email) {
                        const transporter = createTransporter();
                        const html = `
                            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                                <h2 style="color: #0f172a; margin-top: 0;">Yeni Bilet Ataması</h2>
                                <p style="color: #334155; font-size: 15px;">Merhaba <strong>${agent.name}</strong>,</p>
                                <p style="color: #334155; font-size: 15px;">Size yeni bir destek bileti atandı. Detaylar aşağıdadır:</p>
                                <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
                                    <p style="margin: 0 0 5px;"><strong>Bilet ID:</strong> ${ticket.id}</p>
                                    <p style="margin: 0 0 5px;"><strong>Başlık:</strong> ${ticket.title}</p>
                                    <p style="margin: 0 0 5px;"><strong>Atamayı Yapan:</strong> ${userName}</p>
                                </div>
                                <p style="color: #64748b; font-size: 13px;">Lütfen FixIT sistemine giriş yaparak biletle ilgilenin.</p>
                            </div>
                        `;
                        await transporter.sendMail({
                            from: \`"FixIT Destek" <\${process.env.MAIL_USER}>\`,
                            to: agent.email,
                            subject: \`[\${ticket.id}] Size Yeni Bilet Atandı — FixIT Destek\`,
                            html,
                        });
                    }
                }
            } catch (mailErr) {
                console.error('[MAIL ERROR IN ASSIGN]', mailErr);
            }

            res.json({ success: true });
        } catch (err) {
            console.error('[TICKET] assign error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },

    /** Bilete mesaj ekle */
    async addMessage(req, res) {
        try {
            const { senderId, senderName, senderRole, content, isInternal } = req.body;
            const now = new Date();
            const msgId = `m-${Date.now()}`;

            await TicketModel.addMessage({
                id: msgId,
                ticketId: req.params.id,
                senderId,
                senderName,
                senderRole,
                content,
                isInternal: isInternal ?? false,
                timestamp: now,
            });
            await TicketModel.touch(req.params.id, now);

            res.status(201).json({
                id: msgId,
                ticket_id: req.params.id,
                sender_id: senderId,
                sender_name: senderName,
                sender_role: senderRole,
                content,
                is_internal: isInternal ?? false,
                timestamp: now,
            });
        } catch (err) {
            console.error('[TICKET] addMessage error:', err);
            res.status(500).json({ error: 'Sunucu hatası.' });
        }
    },
};
