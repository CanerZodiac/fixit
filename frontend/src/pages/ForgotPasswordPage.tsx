import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'done'>('email');
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.success) {
                setUserId(data.userId); // Ensure backend returns userId even on forgot password
                setStep('verify');
            } else {
                setError(data.error || 'İşlem başarısız.');
            }
        } catch(err) {
            setError('Sunucu hatası.');
        }
        setLoading(false);
    };

    const handleCodeChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) return setError('Lütfen 6 haneli kodu eksiksiz girin.');

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/verify-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            const data = await res.json();
            if (res.ok) {
                setStep('reset');
            } else {
                setError(data.error || 'Geçersiz kod.');
            }
        } catch(err) { setError('Sunucu hatası.'); }
        setLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError('Şifreler eşleşmiyor.');
        if (newPassword.length < 6) return setError('Şifre en az 6 karakter olmalıdır.');

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: verificationCode.join(''), newPassword })
            });
            if (res.ok) {
                setStep('done');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'İşlem başarısız.');
            }
        } catch(err) { setError('Sunucu hatası.'); }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-overlay" />
            <div className="anim-fade-in-up" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-8)', position: 'relative', zIndex: 1 }}>
                
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{ width: 64, height: 64, background: 'var(--theme-600)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-theme-strong)' }} className="anim-theme-glow">
                        <Lock size={32} color="var(--bg-primary)" />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--theme-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Şİfremi Unuttum
                    </h1>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleSendCode}>
                        <div className="hud-card hud-card--static">
                            {error && <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-2)', background: 'var(--error-bg)', color: 'var(--error)', fontSize: 'var(--text-sm)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>Hesabınıza bağlı e-posta adresini girin. Size bir sıfırlama kodu göndereceğiz.</p>
                            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)' }}>
                                    <Mail size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)' }} />
                                    <input type="email" className="input" style={{ border: 'none', background: 'none', paddingLeft: 0 }} placeholder="ornek@fixit.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                {loading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'verify' && (
                    <div className="hud-card hud-card--static" style={{ textAlign: 'center' }}>
                        {error && <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-2)', background: 'var(--error-bg)', color: 'var(--error)', fontSize: 'var(--text-sm)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Kodu Girin</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>{email} adresine 6 haneli kod gönderildi.</p>
                        
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index} ref={el => { inputRefs.current[index] = el; }}
                                    type="text" maxLength={1} value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) inputRefs.current[index - 1]?.focus(); }}
                                    style={{ width: 44, height: 52, background: 'var(--bg-primary)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}
                                />
                            ))}
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerifyCode} disabled={loading || verificationCode.join('').length !== 6}>
                            {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
                        </button>
                    </div>
                )}

                {step === 'reset' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="hud-card hud-card--static">
                            {error && <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-2)', background: 'var(--error-bg)', color: 'var(--error)', fontSize: 'var(--text-sm)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
                            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-5)' }}>Yeni Şifre Belirle</h2>
                            
                            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="input-label">Yeni Şifre</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)' }}>
                                    <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)' }} />
                                    <input type={showPassword ? 'text' : 'password'} className="input" style={{ border: 'none', background: 'none', paddingLeft: 0 }} placeholder="En az 6 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 var(--space-3)', color: 'var(--text-tertiary)' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                <label className="input-label">Şifre Tekrar</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)' }}>
                                    <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)' }} />
                                    <input type={showPassword ? 'text' : 'password'} className="input" style={{ border: 'none', background: 'none', paddingLeft: 0 }} placeholder="Şifreyi tekrar girin" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'done' && (
                    <div className="hud-card hud-card--static" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--success)', marginBottom: 'var(--space-2)' }}>Şifre Değiştirildi!</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Giriş sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                )}

                {step === 'email' && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                        <Link to="/login" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Giriş ekranına dön</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
