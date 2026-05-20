import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../lib/helpers';
import {
    LayoutDashboard, Ticket, Plus, Archive, BookOpen, MessageCircle,
    Monitor, BarChart3, Users, Settings, LogOut, ChevronLeft, ChevronRight, Headphones, UserCircle, Shield
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
    roles?: ('admin' | 'agent' | 'employee')[];
}

const navItems: NavItem[] = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/tickets', icon: <Ticket size={18} />, label: 'Biletler' },
    { to: '/tickets/new', icon: <Plus size={18} />, label: 'Yeni Bilet' },
    { to: '/tickets/archive', icon: <Archive size={18} />, label: 'Arşiv' },
    { to: '/knowledge-base', icon: <BookOpen size={18} />, label: 'Bilgi Bankası' },
    { to: '/chat', icon: <MessageCircle size={18} />, label: 'Canlı Destek' },
    { to: '/assets', icon: <Monitor size={18} />, label: 'Envanter', roles: ['admin', 'agent'] },
    { to: '/reports', icon: <BarChart3 size={18} />, label: 'Raporlar', roles: ['admin', 'agent'] },
    { to: '/users', icon: <Users size={18} />, label: 'Kullanıcılar', roles: ['admin'] },
    { to: '/admin', icon: <Shield size={18} />, label: 'Yönetim Paneli', roles: ['admin'] },
    { to: '/profile', icon: <UserCircle size={18} />, label: 'Profilim' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Ayarlar' },
];

export default function Sidebar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (currentUser && item.roles.includes(currentUser.role))
    );

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
            style={{
                width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                minHeight: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width var(--duration-normal) var(--ease-out)',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                overflow: 'hidden',
            }}>

            {/* Logo */}
            <div style={{
                padding: collapsed ? 'var(--space-4) var(--space-3)' : 'var(--space-5)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                minHeight: 'var(--header-height)',
            }}>
                <div style={{
                    width: 32, height: 32,
                    background: 'var(--theme-600)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Headphones size={18} color="var(--bg-primary)" />
                </div>
                {!collapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--theme-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            FixIT
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            Destek Merkezi
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: 'var(--space-3)', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filteredNavItems.map(item => {
                        const isActive = item.to === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.to);
                        return (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: collapsed ? 'var(--space-2) var(--space-3)' : 'var(--space-2) var(--space-3)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: isActive ? 'var(--theme-400)' : 'var(--text-secondary)',
                                        background: isActive ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: isActive ? 600 : 400,
                                        textDecoration: 'none',
                                        transition: 'all var(--duration-fast) var(--ease-out)',
                                        borderLeft: isActive ? '2px solid var(--theme-500)' : '2px solid transparent',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                            e.currentTarget.style.background = 'var(--bg-hover)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {item.icon}
                                    {!collapsed && <span>{item.label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(c => !c)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 'var(--space-2)',
                    margin: 'var(--space-2) var(--space-3)',
                    background: 'transparent',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--theme-600)'; e.currentTarget.style.color = 'var(--theme-500)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* User profile footer */}
            <div style={{
                padding: 'var(--space-3)',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
            }}>
                <div className="avatar" style={{ flexShrink: 0 }}>
                    {currentUser ? getInitials(currentUser.name) : '??'}
                </div>
                {!collapsed && currentUser && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUser.name}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                            {currentUser.role === 'admin' ? 'Yönetici' : currentUser.role === 'agent' ? 'Destek Uzmanı' : 'Çalışan'}
                        </div>
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={logout}
                        className="btn-icon"
                        title="Çıkış Yap"
                        aria-label="Çıkış Yap"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </aside>
    );
}
