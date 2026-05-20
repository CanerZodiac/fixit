import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `Sen "FixIT Destek Sistemi"nin profesyonel canlı destek yapay zeka asistanısın. Görevin çalışanlara (kullanıcılara) IT, ağ, yazıcı, erişim, VPN ve sistem sorunlarında yardımcı olmak. Kurumsal, net ve çözüm odaklı bir dil kullan. Gerektiğinde çözüm adımlarını madde madde yaz. Şifre sorunlarında şifre sıfırlama sayfasına ("/forgot-password") yönlendir veya ilgili adımları ver. Çözülemeyen durumlar (fiziksel arıza, karmaşık erişim sorunları vb.) için kullanıcıyı "sol menüden yeni bir destek bileti" açmaya yönlendir.`;

/**
 * CHAT CONTROLLER
 * Gemini AI entegrasyonu ile AI chat.
 */

export const ChatController = {
    async sendMessage(req, res) {
        try {
            const { message, history } = req.body;
            if (!message) return res.status(400).json({ error: 'Mesaj boş olamaz.' });

            if (!process.env.GEMINI_API_KEY) {
                // FALLBACK: Kural tabanlı sahte (mock) AI
                const msg = message.toLowerCase();
                let responseText = "Anladım. Sorununuzu tam olarak çözebilmemiz için detay verebilir misiniz veya sol menüden yeni bir destek bileti açabilirsiniz.";
                
                if (msg.includes('vpn') || msg.includes('bağlanamıyorum')) {
                    responseText = "VPN bağlantı sorunları için öncelikle 'Cisco AnyConnect' uygulamanızı yönetici olarak çalıştırın. Düzelmezse IT ağ ekibine bir bilet açmanız gerekmektedir.";
                } else if (msg.includes('şifre') || msg.includes('parola')) {
                    responseText = "Şifrenizi unuttuysanız, giriş ekranındaki 'Şifremi Unuttum' seçeneğinden sıfırlayabilirsiniz. Windows şifreniz kilitlendiyse 1234 dahili numarasından IT'yi arayabilirsiniz.";
                } else if (msg.includes('yazıcı') || msg.includes('çıktı')) {
                    responseText = "Yazıcı sorunlarında donanımsal bir hata olabilir. Ekranda kağıt sıkışması (paper jam) veya toner uyarısı var mı kontrol edin.";
                } else if (msg.includes('merhaba') || msg.includes('selam')) {
                    responseText = "Merhaba! Ben FixIT Asistanı. Şifre, VPN, donanım veya erişim konularında size yardımcı olabilirim.";
                } else if (msg.includes('teşekkür')) {
                    responseText = "Rica ederim, başka yardımcı olabileceğim bir konu var mı?";
                } else if (msg.includes('yavaş')) {
                    responseText = "Bilgisayarınız veya bir uygulama yavaş çalışıyorsa, öncelikle cihazı yeniden başlatmayı deneyin. Sorun sürüyorsa Görev Yöneticisi'nden CPU kullanımını kontrol edin.";
                }

                // Sahte bir gecikme ekleyerek AI hissi ver
                return setTimeout(() => {
                    res.json({ success: true, response: responseText });
                }, 1000);
            }


            const formattedHistory = (history || []).map(msg => ({
                role: msg.isBot ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: SYSTEM_INSTRUCTION,
            });

            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: { maxOutputTokens: 800 },
            });

            const result = await chat.sendMessage([{ text: message }]);
            const responseText = result.response.text();

            res.json({ success: true, response: responseText });
        } catch (err) {
            console.error('[AI CHAT ERROR]', err);
            res.status(500).json({ error: 'Yapay zeka asistanı şu an yanıt veremedi. (' + err.message + ')' });
        }
    },
};
