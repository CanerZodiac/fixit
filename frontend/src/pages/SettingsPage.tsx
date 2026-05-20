import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { SLA_DEFAULTS, CATEGORY_CONFIG } from '../lib/constants';
import { Settings, Save, Bell, Palette, Clock, Sun, Droplets, Zap, Leaf, Flame, Monitor } from 'lucide-react';

interface ThemePreset {
    name: string;
    label: string;
    icon: React.ReactNode;
    accent: string;
    accentHover: string;
    accentGlow: string;
    badgeClass: string;
}

const themePresets: ThemePreset[] = [
    { name: 'theme', label: 'Theme (Varsayılan)', icon: <Sun size={16} />, accent: '#f59e0b', accentHover: '#d97706', accentGlow: 'rgba(245,158,11,0.15)', badgeClass: 'badge--theme' },
    { name: 'cyan', label: 'Cyan', icon: <Droplets size={16} />, accent: '#06b6d4', accentHover: '#0891b2', accentGlow: 'rgba(6,182,212,0.15)', badgeClass: 'badge--info' },
    { name: 'green', label: 'Yeşil', icon: <Leaf size={16} />, accent: '#22c55e', accentHover: '#16a34a', accentGlow: 'rgba(34,197,94,0.15)', badgeClass: 'badge--low' },
    { name: 'red', label: 'Kırmızı', icon: <Flame size={16} />, accent: '#ef4444', accentHover: '#dc2626', accentGlow: 'rgba(239,68,68,0.15)', badgeClass: 'badge--critical' },
    { name: 'electric', label: 'Elektrik Mavisi', icon: <Zap size={16} />, accent: '#3b82f6', accentHover: '#2563eb', accentGlow: 'rgba(59,130,246,0.15)', badgeClass: 'badge--info' },
    { name: 'default', label: 'Sistem (Koyu)', icon: <Monitor size={16} />, accent: '#f59e0b', accentHover: '#d97706', accentGlow: 'rgba(245,158,11,0.15)', badgeClass: 'badge--theme' },
];

function applyTheme(preset: ThemePreset) {
    const root = document.documentElement;
    root.style.setProperty('--theme-500', preset.accent);
    root.style.setProperty('--theme-600', preset.accentHover);
    root.style.setProperty('--theme-700', preset.accentHover);
    root.style.setProperty('--border-accent', `${preset.accent}33`);
    root.style.setProperty('--shadow-theme', `0 0 12px ${preset.accentGlow}`);
    root.style.setProperty('--shadow-theme-strong', `0 0 20px ${preset.accentGlow}, 0 0 40px ${preset.accentGlow}`);
}

export default function SettingsPage() {
    const { addToast } = useToast();
    const [sla, setSla] = useState(() => {
        try {
            const stored = localStorage.getItem('hud_sla_settings');
            if (stored) return JSON.parse(stored);
        } catch { /* yoksay */ }
        return SLA_DEFAULTS;
    });
    const [notifications, setNotifications] = useState(() => {
        try {
            const stored = localStorage.getItem('hud_notification_settings');
            if (stored) return JSON.parse(stored);
        } catch { /* yoksay */ }
        return { email: true, browser: true, slaWarning: true, newTicket: true };
    });
    const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('hud_theme') || 'theme');

    useEffect(() => {
        const preset = themePresets.find(t => t.name === activeTheme) ?? themePresets[0];
        applyTheme(preset);
    }, [activeTheme]);

    const handleThemeChange = (theme: ThemePreset) => {
        setActiveTheme(theme.name);
        localStorage.setItem('hud_theme', theme.name);
        applyTheme(theme);
        addToast({ title: 'Tema değiştirildi', message: `${theme.label} teması uygulandı.`, type: 'success' });
    };

    const handleSave = () => {
        localStorage.setItem('hud_sla_settings', JSON.stringify(sla));
        localStorage.setItem('hud_notification_settings', JSON.stringify(notifications));
        addToast({ title: 'Ayarlar kaydedildi', message: 'Değişiklikleriniz başarıyla uygulandı.', type: 'success' });
    };

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-header__title"><Settings size={20} /> Ayarlar</h1>
            </div>

            {/* Tema Ayarları */}
            <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>
                    <Palette size={14} /> Tema ve Renkler
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {themePresets.map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeChange(theme)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                background: activeTheme === theme.name ? 'var(--bg-hover)' : 'var(--bg-primary)',
                                border: activeTheme === theme.name ? `2px solid ${theme.accent}` : '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all var(--duration-fast) var(--ease-out)',
                                fontFamily: 'var(--font-sans)',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{
                                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                                background: theme.accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#000', flexShrink: 0,
                                boxShadow: activeTheme === theme.name ? `0 0 12px ${theme.accentGlow}` : 'none',
                            }}>
                                {theme.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{theme.label}</div>
                                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{theme.accent}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Önizleme çubuğu */}
                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>ÖNİZLEME:</span>
                    <button className="btn btn-primary btn-sm">Birincil Buton</button>
                    <span className="badge badge--theme">Badge</span>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--theme-500)', boxShadow: 'var(--shadow-theme)' }} />
                </div>
            </div>

            {/* SLA Ayarları */}
            <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>
                    <Clock size={14} /> SLA Kuralları
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Öncelik</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>İlk Yanıt (saat)</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Çözüm (saat)</span>
                </div>
                {(Object.entries(sla) as [keyof typeof SLA_DEFAULTS, { responseHours: number; resolutionHours: number }][]).map(([key, val]) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
                        <input className="input" type="number" value={val.responseHours} onChange={e => setSla((s: typeof SLA_DEFAULTS) => ({ ...s, [key]: { ...val, responseHours: parseInt(e.target.value) || 0 } }))} />
                        <input className="input" type="number" value={val.resolutionHours} onChange={e => setSla((s: typeof SLA_DEFAULTS) => ({ ...s, [key]: { ...val, resolutionHours: parseInt(e.target.value) || 0 } }))} />
                    </div>
                ))}
            </div>

            {/* Bildirim Ayarları */}
            <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>
                    <Bell size={14} /> Bildirim Tercihleri
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {[
                        { key: 'email', label: 'E-posta bildirimleri', desc: 'Bilet değişikliklerini e-posta ile al' },
                        { key: 'browser', label: 'Tarayıcı bildirimleri', desc: 'Anlık tarayıcı bildirimleri' },
                        { key: 'slaWarning', label: 'SLA ihlali uyarıları', desc: 'SLA süresi dolmak üzereyken uyarı al' },
                        { key: 'newTicket', label: 'Yeni bilet bildirimi', desc: 'Yeni bilet oluşturulduğunda haber al' },
                    ].map(item => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
                            <div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.desc}</div>
                            </div>
                            <div style={{ position: 'relative', width: 44, height: 22, flexShrink: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={notifications[item.key as keyof typeof notifications]}
                                    onChange={e => setNotifications((n: typeof notifications) => ({ ...n, [item.key]: e.target.checked }))}
                                    style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }}
                                />
                                <div style={{
                                    width: 44, height: 22, borderRadius: 11,
                                    background: notifications[item.key as keyof typeof notifications] ? 'var(--theme-600)' : 'var(--bg-tertiary)',
                                    transition: 'background var(--duration-fast) var(--ease-out)',
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        width: 18, height: 18, borderRadius: 9,
                                        background: 'var(--text-primary)',
                                        position: 'absolute', top: 2,
                                        left: notifications[item.key as keyof typeof notifications] ? 24 : 2,
                                        transition: 'left var(--duration-fast) var(--ease-spring)',
                                    }} />
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Kategoriler */}
            <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>
                    Bilet Kategorileri
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {Object.values(CATEGORY_CONFIG).map(c => (
                        <span key={c.label} className="badge badge--theme">{c.label}</span>
                    ))}
                </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleSave}>
                <Save size={16} /> Ayarları Kaydet
            </button>
        </div>
    );
}
