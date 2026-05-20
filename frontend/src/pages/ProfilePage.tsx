import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getInitials, formatDateTime } from '../lib/helpers';
import { DEPARTMENTS } from '../lib/constants';
import {
    User, Mail, Phone, Building2, Shield, Save, Lock,
    Eye, EyeOff, Calendar, Clock, CheckCircle, AlertCircle, Ticket, Camera, MapPin, Globe
} from 'lucide-react';

export default function ProfilePage() {
    const { currentUser, updateProfile, changePassword } = useAuth();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'notifications'>('info');

    // Profile edit state
    const [editForm, setEditForm] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        title: currentUser?.title || '',
        department: currentUser?.department || '',
        bio: currentUser?.bio || '',
        timezone: currentUser?.timezone || 'Europe/Istanbul',
        language: currentUser?.language || 'tr',
        avatar: currentUser?.avatar || '',
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setEditForm(prev => ({ ...prev, avatar: url }));
        }
    };

    // Password change state
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    // Notification prefs
    const [notifications, setNotifications] = useState({
        email: true, browser: true, slaWarning: true, newTicket: true, ticketUpdate: true,
    });

    if (!currentUser) return null;

    const handleSaveProfile = () => {
        updateProfile({
            name: editForm.name,
            phone: editForm.phone || undefined,
            title: editForm.title || undefined,
            department: editForm.department,
            bio: editForm.bio || undefined,
            timezone: editForm.timezone,
            language: editForm.language,
            avatar: editForm.avatar,
        });
        addToast({ title: 'Profil güncellendi', message: 'Kişisel bilgileriniz kaydedildi.', type: 'success' });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess(false);

        if (pwForm.newPw !== pwForm.confirm) {
            setPwError('Yeni şifreler eşleşmiyor.');
            return;
        }

        const result = await changePassword(pwForm.current, pwForm.newPw);
        if (result.success) {
            setPwSuccess(true);
            setPwForm({ current: '', newPw: '', confirm: '' });
            addToast({ title: 'Şifre değiştirildi', message: 'Şifreniz başarıyla güncellendi.', type: 'success' });
        } else {
            setPwError(result.error || 'Şifre değiştirilemedi.');
        }
    };

    const handleSaveNotifications = () => {
        addToast({ title: 'Bildirimler güncellendi', message: 'Bildirim tercihleriniz kaydedildi.', type: 'success' });
    };

    const roleLabel = { admin: 'Yönetici', agent: 'Destek Uzmanı', employee: 'Çalışan' };
    const roleClass = { admin: 'badge--critical', agent: 'badge--theme', employee: 'badge--info' };

    const tabs = [
        { key: 'info', label: 'Kişisel Bilgiler', icon: <User size={14} /> },
        { key: 'security', label: 'Güvenlik', icon: <Lock size={14} /> },
        { key: 'notifications', label: 'Bildirimler', icon: <Mail size={14} /> },
    ] as const;

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 900 }}>
            {/* Profil Başlık Kartı */}
            <div className="hud-card hud-card--static" style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
                marginBottom: 'var(--space-6)', padding: 'var(--space-6)',
            }}>
                <div className="avatar avatar--xl" style={{
                    width: 80, height: 80, fontSize: 'var(--text-xl)',
                    background: 'var(--theme-700)',
                    border: '2px solid var(--theme-500)',
                    boxShadow: 'var(--shadow-theme)',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer'
                }}>
                    {editForm.avatar ? (
                        <img src={editForm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        getInitials(currentUser.name)
                    )}
                    <label style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        <Camera size={24} color="#fff" />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </label>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currentUser.name}
                        </h1>
                        <span className={`badge ${roleClass[currentUser.role]}`}>{roleLabel[currentUser.role]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {currentUser.title && (
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                {currentUser.title}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            <Building2 size={12} /> {currentUser.department}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            <Mail size={12} /> {currentUser.email}
                        </span>
                    </div>
                </div>

                {/* İstatistikler */}
                <div style={{ display: 'flex', gap: 'var(--space-5)', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--theme-500)' }}>
                            {currentUser.ticketsClosed ?? 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                            Çözülen
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currentUser.avgResponseMinutes ?? 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                            Ort. dk
                        </div>
                    </div>
                </div>
            </div>

            {/* Sekmeler */}
            <div className="tabs">
                {tabs.map(tab => (
                    <button key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Sekme: Bilgi */}
            {activeTab === 'info' && (
                <div className="hud-card hud-card--static">
                    <h3 style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)',
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    }}>
                        <User size={14} /> Kişisel Bilgiler
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                        <div className="input-group">
                            <label className="input-label">Ad Soyad</label>
                            <input className="input" value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Unvan</label>
                            <input className="input" value={editForm.title} placeholder="Ör: Kıdemli Uzman"
                                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-posta (salt okunur)</label>
                            <input className="input" value={currentUser.email} disabled
                                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Telefon</label>
                            <input className="input" value={editForm.phone} placeholder="+90 5xx xxx xx xx"
                                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Departman</label>
                            <select className="select" value={editForm.department}
                                onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Rol (salt okunur)</label>
                            <input className="input" value={roleLabel[currentUser.role]} disabled
                                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="input-label">Hakkımda (Biyografi)</label>
                            <textarea className="input" value={editForm.bio} rows={3} placeholder="Kendinizden kısaca bahsedin..."
                                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'vertical' }} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Saat Dilimi</label>
                            <select className="select" value={editForm.timezone}
                                onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))}>
                                <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Dil</label>
                            <select className="select" value={editForm.language}
                                onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))}>
                                <option value="tr">Türkçe</option>
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>

                    {/* Hesap Bilgileri */}
                    <div style={{
                        display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap',
                        padding: 'var(--space-4)', background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-5)',
                        border: '1px solid var(--border-primary)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            <Calendar size={12} /> Oluşturulma: <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{formatDateTime(currentUser.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            <Clock size={12} /> Son Giriş: <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{currentUser.lastLogin ? formatDateTime(currentUser.lastLogin) : '—'}</span>
                        </div>
                        {currentUser.ticketsClosed !== undefined && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                <Ticket size={12} /> Çözülen: <span style={{ color: 'var(--theme-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{currentUser.ticketsClosed}</span>
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                        <Save size={14} /> Değişiklikleri Kaydet
                    </button>
                </div>
            )}

            {/* Sekme: Güvenlik */}
            {activeTab === 'security' && (
                <div className="hud-card hud-card--static">
                    <h3 style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)',
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    }}>
                        <Shield size={14} /> Şifre Değiştir
                    </h3>

                    {pwSuccess && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            padding: 'var(--space-3)', background: 'var(--success-bg)',
                            border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-sm)',
                            marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--success)',
                        }}>
                            <CheckCircle size={16} /> Şifreniz başarıyla değiştirildi.
                        </div>
                    )}

                    {pwError && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            padding: 'var(--space-3)', background: 'var(--error-bg)',
                            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)',
                            marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--error)',
                        }}>
                            <AlertCircle size={16} /> {pwError}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
                            <div className="input-group">
                                <label className="input-label">Mevcut Şifre</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <Lock size={16} style={{ margin: '0 var(--space-3)', color: 'var(--text-tertiary)' }} />
                                    <input className="input" type={showPw ? 'text' : 'password'}
                                        style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                                        value={pwForm.current}
                                        onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwError(''); setPwSuccess(false); }}
                                        required />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                                            padding: 'var(--space-2) var(--space-3)', color: 'var(--text-tertiary)' }}>
                                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Yeni Şifre</label>
                                <input className="input" type={showPw ? 'text' : 'password'}
                                    value={pwForm.newPw} placeholder="En az 6 karakter"
                                    onChange={e => { setPwForm(f => ({ ...f, newPw: e.target.value })); setPwError(''); }}
                                    required minLength={6} />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Yeni Şifre Tekrar</label>
                                <input className="input" type={showPw ? 'text' : 'password'}
                                    value={pwForm.confirm} placeholder="Yeni şifreyi tekrar girin"
                                    onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(''); }}
                                    required />
                                {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--error)' }}>Şifreler eşleşmiyor</span>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                                <Lock size={14} /> Şifreyi Değiştir
                            </button>
                        </div>
                    </form>

                    {/* Aktif Oturumlar */}
                    <div style={{ marginTop: 'var(--space-8)' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)',
                        }}>
                            Aktif Oturumlar
                        </h3>
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Bu cihaz — Web tarayıcısı</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                                        Aktif oturum • Şu an çevrimiçi
                                    </div>
                                </div>
                            </div>
                            <span className="badge badge--low">AKTİF</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sekme: Bildirimler */}
            {activeTab === 'notifications' && (
                <div className="hud-card hud-card--static">
                    <h3 style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)',
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    }}>
                        <Mail size={14} /> Bildirim Tercihleri
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        {[
                            { key: 'email', label: 'E-posta bildirimleri', desc: 'Bilet değişikliklerini e-posta ile al' },
                            { key: 'browser', label: 'Tarayıcı bildirimleri', desc: 'Anlık tarayıcı bildirimleri' },
                            { key: 'slaWarning', label: 'SLA ihlali uyarıları', desc: 'SLA süresi dolmak üzereyken uyarı al' },
                            { key: 'newTicket', label: 'Yeni bilet bildirimi', desc: 'Yeni bilet oluşturulduğunda haber al' },
                            { key: 'ticketUpdate', label: 'Bilet güncelleme', desc: 'Atanan biletlerde güncelleme olduğunda' },
                        ].map(item => (
                            <label key={item.key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer', padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-primary)',
                                transition: 'border-color var(--duration-fast) var(--ease-out)',
                            }}>
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.desc}</div>
                                </div>
                                <div style={{ position: 'relative', width: 44, height: 22, flexShrink: 0 }}>
                                    <input type="checkbox"
                                        checked={notifications[item.key as keyof typeof notifications]}
                                        onChange={e => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                                        style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
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

                    <button className="btn btn-primary" onClick={handleSaveNotifications}>
                        <Save size={14} /> Tercihleri Kaydet
                    </button>
                </div>
            )}
        </div>
    );
}
