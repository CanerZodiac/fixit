import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../lib/helpers';
import { Search, Bell, User, Settings, LogOut, ChevronDown, Ticket, AlertTriangle, CheckCircle, Clock, X, Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    icon: React.ReactNode;
    read: boolean;
    type: 'ticket' | 'warning' | 'success' | 'info';
}

const initialNotifications: Notification[] = [
    { id: 'n1', title: 'Yeni Bilet Atandı', message: 'TKT-1042 numaralı bilet size atandı', time: '5 dk önce', icon: <Ticket size={14} />, read: false, type: 'ticket' },
    { id: 'n2', title: 'SLA Uyarısı', message: 'TKT-1038 — SLA süresi 2 saat içinde dolacak', time: '12 dk önce', icon: <AlertTriangle size={14} />, read: false, type: 'warning' },
    { id: 'n3', title: 'Bilet Çözüldü', message: 'TKT-1035 başarıyla çözüldü olarak işaretlendi', time: '1 saat önce', icon: <CheckCircle size={14} />, read: false, type: 'success' },
    { id: 'n4', title: 'Yeni Yorum', message: 'TKT-1032 biletine yeni yorum eklendi', time: '2 saat önce', icon: <Ticket size={14} />, read: true, type: 'info' },
    { id: 'n5', title: 'Sistem Bakımı', message: 'Yarın 02:00-04:00 arası planlı bakım yapılacak', time: '3 saat önce', icon: <Clock size={14} />, read: true, type: 'info' },
];

const typeColors: Record<string, string> = {
    ticket: 'var(--theme-500)',
    warning: 'var(--status-critical)',
    success: 'var(--success)',
    info: 'var(--info)',
};

export default function Header() {
    const { currentUser, logout } = useAuth();
    const { mode, setMode, colorTheme, setColorTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const roleLabel: Record<string, string> = { admin: 'Yönetici', agent: 'Destek Uzmanı', employee: 'Çalışan' };
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <header style={{
            height: 'var(--header-height)',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        }}>
            {/* Arama */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 var(--space-3)',
                width: '100%',
                maxWidth: 400,
            }}>
                <Search size={14} color="var(--text-tertiary)" />
                <input
                    type="text"
                    placeholder="Bilet, kullanıcı veya asset ara..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                        padding: 'var(--space-2) 0',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)',
                    }}
                />
                <kbd style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '2px',
                    padding: '1px 4px',
                    lineHeight: 1,
                }}>⌘K</kbd>
            </div>

            {/* Sağ taraf */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {/* Durum göstergesi */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                    ÇEVRİMİÇİ
                </div>

                {/* Tema / Renk Ayarları */}
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button
                        className="btn-icon"
                        aria-label="Tema Değiştir"
                        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    >
                        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                        className="btn-icon"
                        aria-label="Renk Değiştir"
                        onClick={() => {
                            const colors = ['amber', 'blue', 'green', 'purple'] as const;
                            const currentIndex = colors.indexOf(colorTheme);
                            const nextIndex = (currentIndex + 1) % colors.length;
                            setColorTheme(colors[nextIndex]);
                        }}
                    >
                        <Palette size={18} />
                    </button>
                </div>

                {/* Bildirimler */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                        className="btn-icon"
                        style={{ position: 'relative' }}
                        aria-label="Bildirimler"
                        onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 0, right: 0,
                                minWidth: 16, height: 16, borderRadius: 8,
                                background: 'var(--status-critical)',
                                border: '2px solid var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: 700, color: '#fff',
                                fontFamily: 'var(--font-mono)',
                            }}>{unreadCount}</span>
                        )}
                    </button>

                    {/* Bildirim Paneli */}
                    {notifOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            width: 380,
                            maxHeight: 480,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-secondary)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            overflow: 'hidden',
                            zIndex: 100,
                            animation: 'scaleIn var(--duration-fast) var(--ease-spring)',
                        }}>
                            {/* Başlık */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--border-primary)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Bell size={14} color="var(--theme-500)" />
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Bildirimler</span>
                                    {unreadCount > 0 && <span className="badge badge--theme" style={{ fontSize: '9px' }}>{unreadCount}</span>}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{
                                        background: 'none', border: 'none', color: 'var(--theme-500)',
                                        fontSize: 'var(--text-xs)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                    }}>Tümünü okundu işaretle</button>
                                )}
                            </div>

                            {/* Bildirim Listesi */}
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                        Bildirim yok
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                                            padding: 'var(--space-3) var(--space-4)',
                                            borderBottom: '1px solid var(--border-primary)',
                                            background: notif.read ? 'transparent' : 'rgba(245, 158, 11, 0.03)',
                                            cursor: 'pointer',
                                            transition: 'background var(--duration-fast) var(--ease-out)',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(245, 158, 11, 0.03)'; }}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                                background: `${typeColors[notif.type]}15`,
                                                border: `1px solid ${typeColors[notif.type]}33`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: typeColors[notif.type],
                                                flexShrink: 0, marginTop: 2,
                                            }}>
                                                {notif.icon}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: notif.read ? 400 : 600, color: 'var(--text-primary)' }}>{notif.title}</span>
                                                    {!notif.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--theme-500)', flexShrink: 0 }} />}
                                                </div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{notif.time}</div>
                                            </div>
                                            <button onClick={e => { e.stopPropagation(); removeNotif(notif.id); }} style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-tertiary)', padding: 2, flexShrink: 0,
                                            }}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kullanıcı Menüsü */}
                {currentUser && (
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                background: dropdownOpen ? 'var(--bg-hover)' : 'transparent',
                                border: '1px solid transparent',
                                borderColor: dropdownOpen ? 'var(--border-secondary)' : 'transparent',
                                borderRadius: 'var(--radius-sm)',
                                padding: 'var(--space-1) var(--space-2)',
                                cursor: 'pointer',
                                transition: 'all var(--duration-fast) var(--ease-out)',
                            }}
                            onMouseEnter={e => {
                                if (!dropdownOpen) {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!dropdownOpen) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div className="avatar avatar--sm" style={{ width: 28, height: 28, fontSize: '9px' }}>
                                {getInitials(currentUser.name)}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    {currentUser.name}
                                </div>
                                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    {roleLabel[currentUser.role]}
                                </div>
                            </div>
                            <ChevronDown size={14} color="var(--text-tertiary)" style={{
                                transition: 'transform var(--duration-fast) var(--ease-out)',
                                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                            }} />
                        </button>

                        {/* Açılır Menü */}
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                right: 0,
                                width: 220,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                                zIndex: 100,
                                animation: 'scaleIn var(--duration-fast) var(--ease-spring)',
                            }}>
                                {/* Kullanıcı Bilgisi */}
                                <div style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderBottom: '1px solid var(--border-primary)',
                                }}>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{currentUser.email}</div>
                                </div>

                                {/* Menü Öğeleri */}
                                <div style={{ padding: 'var(--space-1)' }}>
                                    {[
                                        { icon: <User size={14} />, label: 'Profilim', onClick: () => { navigate('/profile'); setDropdownOpen(false); } },
                                        { icon: <Settings size={14} />, label: 'Ayarlar', onClick: () => { navigate('/settings'); setDropdownOpen(false); } },
                                    ].map(item => (
                                        <button key={item.label} onClick={item.onClick} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                            width: '100%', padding: 'var(--space-2) var(--space-3)',
                                            background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                                            color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
                                            cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                                            transition: 'all var(--duration-fast) var(--ease-out)',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            {item.icon} {item.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Çıkış */}
                                <div style={{ padding: 'var(--space-1)', borderTop: '1px solid var(--border-primary)' }}>
                                    <button onClick={() => { logout(); setDropdownOpen(false); }} style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                        width: '100%', padding: 'var(--space-2) var(--space-3)',
                                        background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                                        color: 'var(--error)', fontSize: 'var(--text-sm)',
                                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                                        transition: 'all var(--duration-fast) var(--ease-out)',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-bg)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <LogOut size={14} /> Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
