import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { DEPARTMENTS } from '../lib/constants';
import { Headphones, User, Mail, Lock, Eye, EyeOff, Building2, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 20, label: 'Çok Zayıf', color: 'var(--error)' };
    if (score === 2) return { score: 40, label: 'Zayıf', color: 'var(--status-high)' };
    if (score === 3) return { score: 60, label: 'Orta', color: 'var(--warning)' };
    if (score === 4) return { score: 80, label: 'Güçlü', color: 'var(--success)' };
    return { score: 100, label: 'Çok Güçlü', color: 'var(--success)' };
}

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'verify' | 'done'>('form');
    
    // Auth vars
    const [userId, setUserId] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const strength = getPasswordStrength(form.password);

    const handleUpdate = (key: string, value: string) => {
        setForm(f => ({ ...f, [key]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);
        const result = await register({
            name: form.name,
            email: form.email,
            password: form.password,
            department: form.department,
        });

        if (result.success && result.userId) {
            setUserId(result.userId);
            setStep('verify');
        } else {
            setError(result.error || 'Kayıt başarısız.');
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

    const handleVerify = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('Lütfen 6 haneli kodu eksiksiz girin.');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            const data = await res.json();
            
            if (res.ok) {
                setStep('done');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || 'Doğrulama başarısız.');
            }
        } catch(err) {
            setError('Sistem hatası.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div className="grid-overlay" />

            <div style={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
                top: '-10%', left: '-5%', pointerEvents: 'none',
            }} />

            <div className="anim-fade-in-up" style={{
                width: '100%', maxWidth: 480, padding: 'var(--space-8)',
                position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'var(--theme-600)',
                        borderRadius: 'var(--radius-md)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 'var(--space-4)',
                        boxShadow: 'var(--shadow-theme-strong)',
                    }} className="anim-theme-glow">
                        <Headphones size={28} color="var(--bg-primary)" />
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)',
                        fontWeight: 700, color: 'var(--theme-500)',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                        Hesap Oluştur
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                        FixIT Destek Merkezi
                    </p>
                </div>

                {/* Adım: Doğrulama simülasyonu */}
                {step === 'verify' && (
                    <div className="hud-card hud-card--static" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '2px solid var(--theme-600)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-5)',
                        }}>
                            <Mail size={28} color="var(--theme-500)" />
                        </div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                            E-posta Doğrulama
                        </h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                            <strong style={{ color: 'var(--theme-500)' }}>{form.email}</strong> adresine 6 haneli doğrulama kodu gönderildi. Lütfen aşağıya girin.
                        </p>

                        {error && (
                            <div style={{
                                padding: 'var(--space-2)', background: 'var(--error-bg)',
                                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)',
                                marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--error)',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{
                            display: 'flex', gap: 'var(--space-2)', justifyContent: 'center',
                            marginBottom: 'var(--space-5)',
                        }}>
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !digit && index > 0) {
                                            inputRefs.current[index - 1]?.focus();
                                        }
                                    }}
                                    style={{
                                        width: 44, height: 52,
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-accent)',
                                        borderRadius: 'var(--radius-sm)',
                                        textAlign: 'center',
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)',
                                        fontWeight: 700, color: 'var(--text-primary)',
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={handleVerify}
                            disabled={loading || verificationCode.join('').length !== 6}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span className="spinner" /> Doğrulanıyor...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Shield size={16} /> Kodu Doğrula
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Adım: Başarılı */}
                {step === 'done' && (
                    <div className="hud-card hud-card--static" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--success-bg)',
                            border: '2px solid var(--success)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-5)',
                        }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--success)', marginBottom: 'var(--space-2)' }}>
                            Hesabınız Doğrulandı!
                        </h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            Giriş sayfasına yönlendiriliyorsunuz...
                        </p>
                    </div>
                )}

                {/* Adım: Form */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit}>
                        <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-4)' }}>
                            {error && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: 'var(--space-3)', background: 'var(--error-bg)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)',
                                    marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--error)',
                                }}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Ad Soyad */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="input-label">Ad Soyad</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <User size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <input className="input" style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                        placeholder="Ad Soyad" value={form.name}
                                        onChange={e => handleUpdate('name', e.target.value)} required />
                                </div>
                            </div>

                            {/* E-posta */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="input-label">E-posta Adresi</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <Mail size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <input className="input" type="email" style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                        placeholder="ornek@fixit.com" value={form.email}
                                        onChange={e => handleUpdate('email', e.target.value)} required />
                                </div>
                            </div>

                            {/* Departman */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="input-label">Departman</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <Building2 size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <select className="select" style={{ border: 'none', background: 'none', width: '100%' }}
                                        value={form.department} onChange={e => handleUpdate('department', e.target.value)} required>
                                        <option value="">Departman seçin...</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Şifre */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-2)' }}>
                                <label className="input-label">Şifre</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <input className="input" type={showPassword ? 'text' : 'password'}
                                        style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                        placeholder="En az 6 karakter" value={form.password}
                                        onChange={e => handleUpdate('password', e.target.value)} required minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                                            padding: 'var(--space-2) var(--space-3)', color: 'var(--text-tertiary)' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Şifre Gücü */}
                            {form.password && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>ŞİFRE GÜÇ</span>
                                        <span style={{ fontSize: '10px', color: strength.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{strength.label}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar__fill" style={{
                                            width: `${strength.score}%`,
                                            background: strength.color,
                                            transition: 'width 0.3s ease, background 0.3s ease',
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* Şifre Tekrarı */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                <label className="input-label">Şifre Tekrar</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    borderColor: form.confirmPassword && form.confirmPassword !== form.password
                                        ? 'rgba(239, 68, 68, 0.5)' : undefined,
                                }}>
                                    <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <input className="input" type={showPassword ? 'text' : 'password'}
                                        style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                        placeholder="Şifreyi tekrar girin" value={form.confirmPassword}
                                        onChange={e => handleUpdate('confirmPassword', e.target.value)} required />
                                </div>
                                {form.confirmPassword && form.confirmPassword !== form.password && (
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', marginTop: 2 }}>
                                        Şifreler eşleşmiyor
                                    </span>
                                )}
                            </div>

                            {/* Gönder */}
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
                                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span className="spinner" /> İşleniyor...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        Hesap Oluştur <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Giriş Bağlantısı */}
                {step === 'form' && (
                    <div style={{
                        textAlign: 'center', padding: 'var(--space-4)',
                        background: 'var(--surface-card)', border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            Zaten hesabınız var mı?{' '}
                            <Link to="/login" style={{ color: 'var(--theme-500)', fontWeight: 600 }}>
                                Oturum Aç
                            </Link>
                        </span>
                    </div>
                )}

                {/* Alt Bilgi */}
                <div style={{
                    textAlign: 'center', marginTop: 'var(--space-8)',
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--text-tertiary)', opacity: 0.5,
                }}>
                    FixIT v2.0 — DESTEK MERKEZİ
                </div>
            </div>
        </div>
    );
}
