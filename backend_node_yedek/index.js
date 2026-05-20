import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import hpp        from 'hpp';
import apiRouter  from './routes/index.js';

// ─── EXPRESS BOOTSTRAP ────────────────────────────────
const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(hpp());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Tüm /api/* route'ları MVC katmanından gelir
app.use('/api', apiRouter);

// ─── SERVER START ─────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ FixIT API sunucusu http://localhost:${PORT} adresinde calisiyor`);
    console.log(`📧 Mail : ${process.env.MAIL_USER ? `${process.env.MAIL_USER} (yapılandırıldı)` : 'Yapılandırılmamış'}`);
    console.log(`🤖 AI   : ${process.env.GEMINI_API_KEY ? 'Gemini Aktif' : 'Yapılandırılmamış'}`);
});
