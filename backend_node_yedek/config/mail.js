import nodemailer from 'nodemailer';

/**
 * Nodemailer transporter oluşturur.
 * Konfigürasyon .env.local dosyasından okunur.
 * @returns {import('nodemailer').Transporter}
 */
export function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USER || '',
            pass: process.env.MAIL_PASS || '',
        },
    });
}
