import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { mode, setMode, colorTheme, setColorTheme } = useTheme();

    const colors = ['amber', 'blue', 'green', 'purple'] as const;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else if (result.needsVerification) {
            setError(result.error || 'E-posta doğrulaması gerekiyor. Kayıt ekranına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/register'), 2500);
        } else {
            setError(result.error || 'Giriş başarısız.');
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
            <div className="grid-overlay" style={{ opacity: mode === 'dark' ? 1 : 0.4 }} />

            {/* Tema Kontrolleri (Sağ Üst) */}
            <div style={{
                position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)',
                display: 'flex', gap: 'var(--space-2)', zIndex: 10,
                background: 'var(--surface-card)', padding: 'var(--space-2)',
                borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)',
                backdropFilter: 'blur(12px)',
            }}>
                <button
                    onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: 'var(--space-2)', borderRadius: '50%',
                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div style={{ width: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
                <button
                    onClick={() => {
                        const nextIdx = (colors.indexOf(colorTheme) + 1) % colors.length;
                        setColorTheme(colors[nextIdx]);
                    }}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: 'var(--space-2)', borderRadius: '50%',
                        color: 'var(--theme-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Palette size={18} />
                </button>
            </div>

            {/* Dinamik ve Canlı Neon Arka Plan Efekti */}
            <div style={{
                position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                backgroundColor: 'var(--theme-500)', opacity: mode === 'dark' ? 0.08 : 0.15,
                filter: 'blur(100px)', top: '-20%', right: '-10%', pointerEvents: 'none',
                transition: 'background-color var(--duration-normal)',
            }} />
            <div style={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                backgroundColor: 'var(--theme-600)', opacity: mode === 'dark' ? 0.06 : 0.12,
                filter: 'blur(100px)', bottom: '-15%', left: '-10%', pointerEvents: 'none',
                transition: 'background-color var(--duration-normal)',
            }} />

            <div className="anim-fade-in-up" style={{
                width: '100%',
                maxWidth: 440,
                padding: 'var(--space-8)',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                    <div style={{
                        width: 64, height: 64,
                        background: 'var(--theme-600)',
                        borderRadius: 'var(--radius-md)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 'var(--space-4)',
                        boxShadow: 'var(--shadow-theme-strong)',
                    }} className="anim-theme-glow">
                        <Headphones size={32} color="var(--bg-primary)" />
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 700,
                        color: 'var(--theme-500)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        FixIT
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        marginTop: 'var(--space-2)',
                    }}>
                        Destek Merkezi — Oturum Aç
                    </p>
                </div>

                {/* Giriş Formu */}
                <form onSubmit={handleSubmit}>
                    <div className="hud-card hud-card--static" style={{
                        marginBottom: 'var(--space-4)',
                        backdropFilter: 'blur(20px)',
                        background: 'var(--surface-card)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-accent)',
                    }}>
                        {/* Hata Mesajı */}
                        {error && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-3)',
                                background: 'var(--error-bg)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: 'var(--space-5)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--error)',
                            }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* E-posta Alanı */}
                        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="input-label">E-posta Adresi</label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'border-color var(--duration-fast) var(--ease-out)',
                            }}>
                                <Mail size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                <input
                                    type="email"
                                    className="input"
                                    style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                    placeholder="ornek@fixit.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {/* Şifre Alanı */}
                        <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="input-label">Şifre</label>
                                <Link to="/forgot-password" style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--theme-500)',
                                    textDecoration: 'none',
                                }}>
                                    Şifremi Unuttum
                                </Link>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'border-color var(--duration-fast) var(--ease-out)',
                            }}>
                                <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: 'var(--space-2) var(--space-3)',
                                        color: 'var(--text-tertiary)',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Gönder */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                opacity: loading ? 0.7 : 1,
                                position: 'relative',
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span className="spinner" />
                                    Giriş yapılıyor...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    Oturum Aç <ArrowRight size={16} />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Kayıt Bağlantısı */}
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-4)',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        Hesabınız yok mu?{' '}
                        <Link to="/register" style={{
                            color: 'var(--theme-500)',
                            fontWeight: 600,
                        }}>
                            Hesap Oluştur
                        </Link>
                    </span>
                </div>

                <div style={{
                    marginTop: 'var(--space-5)',
                    padding: 'var(--space-4)',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--theme-500)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: 'var(--space-3)',
                        fontWeight: 700,
                    }}>
                        🔑 Demo Hesaplar
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {[
                            { role: 'Admin',     badge: '#ef4444', email: 'admin@fixit.com', pw: 'admin123' },
                            { role: 'Agent',     badge: '#3b82f6', email: 'agent@fixit.com', pw: 'agent123' },
                            { role: 'Kullanıcı', badge: '#22c55e', email: 'user@fixit.com',  pw: 'user123'  },
                        ].map(d => (
                            <button
                                key={d.email}
                                type="button"
                                onClick={() => {
                                    setEmail(d.email);
                                    setPassword(d.pw);
                                }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.borderColor = d.badge;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'var(--bg-primary)';
                                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                                }}
                            >
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)',
                                }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: d.badge, flexShrink: 0,
                                    }} />
                                    {d.role}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--text-tertiary)',
                                }}>
                                    {d.email} · {d.pw}
                                </span>
                            </button>
                        ))}
                        <p style={{
                            fontSize: '9px',
                            color: 'var(--text-tertiary)',
                            textAlign: 'center',
                            marginTop: 'var(--space-1)',
                            opacity: 0.6,
                        }}>
                            Hesaba tıklayarak otomatik doldur
                        </p>
                    </div>
                </div>

                {/* Alt Bilgi */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-8)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5,
                }}>
                    FixIT v2.0 — DESTEK MERKEZİ
                </div>
            </div>
        </div>
    );
}
