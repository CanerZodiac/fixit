import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../lib/helpers';
import { Send, Bot, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    isBot: boolean;
    senderName: string;
    timestamp: string;
}


export default function LiveChatPage() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: '0', content: `Merhaba ${currentUser?.name.split(' ')[0] ?? ''}! 👋 FixIT Destek Asistanıyım.\n\nSize nasıl yardımcı olabilirim? VPN, şifre, yazıcı, e-posta veya diğer IT konularında sorularınızı sorabilirsiniz.`, isBot: true, senderName: 'Destek Asistanı', timestamp: new Date().toISOString() },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = useCallback(async () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), content: input, isBot: false, senderName: currentUser?.name ?? 'Kullanıcı', timestamp: new Date().toISOString() };
        
        const historyToPass = [...messages];

        setMessages(prev => [...prev, userMsg]);
        const userInput = input;
        setInput('');
        setTyping(true);

        try {
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userInput, 
                    history: historyToPass.map(m => ({ isBot: m.isBot, content: m.content })) 
                })
            });

            const data = await res.json();
            
            if (data.error) {
                setMessages(prev => [...prev, { id: Date.now().toString(), content: 'HATA: ' + data.error, isBot: true, senderName: 'Sistem Hatası', timestamp: new Date().toISOString() }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), content: data.response, isBot: true, senderName: 'Destek Asistanı', timestamp: new Date().toISOString() }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now().toString(), content: 'Bağlantı hatası: Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.', isBot: true, senderName: 'Sistem', timestamp: new Date().toISOString() }]);
        } finally {
            setTyping(false);
        }
    }, [input, currentUser?.name, messages]);

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 800, margin: '0 auto', height: 'calc(100vh - var(--header-height) - 48px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-3)' }}>
                <div>
                    <h1 className="page-header__title"><MessageCircle size={20} /> Canlı Destek</h1>
                    <p className="page-header__subtitle">AI Destek Asistanı — 7/24 aktif</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Sparkles size={14} color="var(--theme-500)" />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-500)', fontFamily: 'var(--font-mono)' }}>YAPAY ZEKA DESTEĞİ</span>
                </div>
            </div>

            {/* Sohbet alanı */}
            <div className="hud-card hud-card--static" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Mesajlar */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            alignItems: 'flex-start',
                            flexDirection: msg.isBot ? 'row' : 'row-reverse',
                        }}>
                            <div className="avatar avatar--sm" style={{
                                background: msg.isBot ? 'var(--theme-700)' : 'var(--bg-hover)',
                                color: msg.isBot ? 'var(--bg-primary)' : 'var(--text-primary)',
                                border: msg.isBot ? '1px solid var(--theme-600)' : '1px solid var(--border-secondary)',
                                flexShrink: 0,
                            }}>
                                {msg.isBot ? <Bot size={14} /> : getInitials(msg.senderName)}
                            </div>
                            <div style={{
                                maxWidth: '75%',
                                padding: 'var(--space-3) var(--space-4)',
                                background: msg.isBot ? 'var(--bg-tertiary)' : 'rgba(245, 158, 11, 0.08)',
                                border: `1px solid ${msg.isBot ? 'var(--border-primary)' : 'var(--border-accent)'}`,
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-primary)',
                                lineHeight: 1.7,
                            }}>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: msg.isBot ? 'var(--theme-500)' : 'var(--text-secondary)', marginBottom: 4 }}>
                                    {msg.senderName}
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {/* Yazıyor göstergesi */}
                    {typing && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <div className="avatar avatar--sm" style={{ background: 'var(--theme-700)', color: 'var(--bg-primary)', border: '1px solid var(--theme-600)', flexShrink: 0 }}>
                                <Bot size={14} />
                            </div>
                            <div style={{
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--theme-500)', animation: 'pulse 1s ease infinite' }} />
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--theme-500)', animation: 'pulse 1s ease infinite 0.2s' }} />
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--theme-500)', animation: 'pulse 1s ease infinite 0.4s' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={endRef} />
                </div>

                {/* Hızlı yanıtlar */}
                {messages.length <= 1 && (
                    <div style={{ padding: '0 var(--space-5) var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {['VPN bağlanamıyorum', 'Şifre sıfırlama', 'Yazıcı çalışmıyor', 'Outlook sorunum var', 'Bilgisayarım yavaş'].map(q => (
                            <button key={q} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)' }}
                                onClick={() => { setInput(q); }}>{q}</button>
                        ))}
                    </div>
                )}

                {/* Giriş */}
                <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 'var(--space-2)' }}>
                    <input className="input" placeholder="Mesajınızı yazın..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
                    <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim() || typing}>
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
