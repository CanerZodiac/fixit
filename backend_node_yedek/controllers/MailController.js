import { createTransporter } from '../config/mail.js';

/**
 * MAIL CONTROLLER
 * E-posta gönderme işlemleri.
 */

export const MailController = {
    /** Genel mail gönder */
    async send(req, res) {
        const { to, subject, html, text } = req.body;
        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({ error: 'to, subject ve html/text alanları zorunludur.' });
        }
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            return res.status(503).json({ error: 'Mail sunucusu yapılandırılmamış. .env.local dosyasını kontrol edin.' });
        }
        try {
            const transporter = createTransporter();
            await transporter.verify();
            const info = await transporter.sendMail({
                from: `"FixIT Destek" <${process.env.MAIL_USER}>`,
                to,
                subject,
                html: html ?? `<p>${text}</p>`,
                text: text ?? '',
            });
            res.json({ success: true, messageId: info.messageId });
        } catch (err) {
            console.error('[MAIL ERROR]', err.message);
            res.status(500).json({ error: 'Mail gönderilemedi: ' + err.message });
        }
    },

    /** Bilet bildirimi maili gönder */
    async ticketNotification(req, res) {
        const { recipientEmail, recipientName, ticketId, ticketTitle, action, actionBy } = req.body;
        if (!recipientEmail || !ticketId) {
            return res.status(400).json({ error: 'recipientEmail ve ticketId zorunludur.' });
        }
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            return res.status(503).json({ error: 'Mail sunucusu yapılandırılmamış.' });
        }

        const actionLabels = {
            created:  'oluşturuldu',
            updated:  'güncellendi',
            resolved: 'çözüldü',
            closed:   'kapatıldı',
            assigned: 'size atandı',
        };
        const actionLabel = actionLabels[action] || action;

        const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; border-bottom: 1px solid #334155;">
        <h1 style="margin: 0; font-size: 20px; color: #f59e0b;">🔧 FixIT Destek</h1>
        <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Bilet Bildirim Sistemi</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #94a3b8; margin-bottom: 8px;">Merhaba ${recipientName ?? recipientEmail},</p>
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #f1f5f9;">Biletiniz ${actionLabel}</h2>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Bilet ID</p>
          <p style="margin: 0 0 12px; font-family: monospace; font-size: 16px; color: #f59e0b;">${ticketId}</p>
          <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Başlık</p>
          <p style="margin: 0; font-size: 15px; color: #f1f5f9;">${ticketTitle}</p>
          ${actionBy ? `<p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">İşlemi yapan: ${actionBy}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      </div>
    </div>`;

        try {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: `"FixIT Destek" <${process.env.MAIL_USER}>`,
                to: recipientEmail,
                subject: `[${ticketId}] Biletiniz ${actionLabel} — FixIT Destek`,
                html,
            });
            res.json({ success: true, messageId: info.messageId });
        } catch (err) {
            console.error('[MAIL ERROR]', err.message);
            res.status(500).json({ error: 'Mail gönderilemedi: ' + err.message });
        }
    },

    /** Mail konfigürasyon durumunu getir */
    async getConfig(_req, res) {
        res.json({
            configured: !!(process.env.MAIL_USER && process.env.MAIL_PASS),
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: process.env.MAIL_PORT || '587',
            user: process.env.MAIL_USER
                ? process.env.MAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2')
                : null,
        });
    },
};
