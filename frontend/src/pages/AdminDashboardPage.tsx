import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { useUsers } from '../hooks/useUsers';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    Shield, Users, Ticket, BarChart3, AlertTriangle, CheckCircle,
    Clock, TrendingUp, Activity, Server, HardDrive, Cpu, ArrowRight,
    UserPlus, TicketPlus
} from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../lib/constants';

export default function AdminDashboardPage() {
    const { currentUser } = useAuth();
    const { tickets } = useTickets();
    const { users } = useUsers();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'users' | 'system'>('overview');

    if (!currentUser || currentUser.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedToday = tickets.filter(t => t.status === 'resolved').length;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');
    const employees = users.filter(u => u.role === 'employee');
    const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed');

    const tabs = [
        { id: 'overview' as const, label: 'Genel Bakış', icon: <BarChart3 size={14} /> },
        { id: 'tickets' as const, label: 'Bilet Yönetimi', icon: <Ticket size={14} /> },
        { id: 'users' as const, label: 'Kullanıcı Yönetimi', icon: <Users size={14} /> },
        { id: 'system' as const, label: 'Sistem Durumu', icon: <Server size={14} /> },
    ];

    return (
        <div className="anim-fade-in-up">
            <div className="page-header" style={{ marginBottom: 'var(--space-5)' }}>
                <div>
                    <h1 className="page-header__title"><Shield size={20} /> Yönetim Paneli</h1>
                    <p className="page-header__subtitle">Sistem yönetimi ve operasyon merkezi</p>
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-5)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                        {[
                            { label: 'Açık Biletler', value: openTickets, color: 'var(--info)', icon: <Ticket size={18} />, sub: 'Yeni + Açık' },
                            { label: 'Devam Eden', value: inProgressTickets, color: 'var(--theme-500)', icon: <Clock size={18} />, sub: 'İşleniyor' },
                            { label: 'Bugün Çözülen', value: resolvedToday, color: 'var(--success)', icon: <CheckCircle size={18} />, sub: 'Başarılı çözüm' },
                            { label: 'Kritik Biletler', value: criticalTickets.length, color: 'var(--status-critical)', icon: <AlertTriangle size={18} />, sub: 'Acil müdahale' },
                        ].map(card => (
                            <div key={card.label} className="hud-card hud-card--static" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>{card.label}</div>
                                        <div style={{ fontSize: '28px', fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)' }}>{card.value}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>{card.sub}</div>
                                    </div>
                                    <div style={{ color: card.color, opacity: 0.3 }}>{card.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                        {/* Critical alerts */}
                        <div className="hud-card hud-card--static">
                            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--status-critical)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <AlertTriangle size={14} /> Kritik Uyarılar
                            </h3>
                            {criticalTickets.length === 0 ? (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-4)' }}>
                                    <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--success)' }} />
                                    Kritik bilet bulunmuyor
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {criticalTickets.slice(0, 5).map(t => (
                                        <div key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: 'var(--space-2) var(--space-3)',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.15)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                        }}>
                                            <div>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--status-critical)' }}>{t.id}</span>
                                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginLeft: 'var(--space-2)' }}>{t.title}</span>
                                            </div>
                                            <ArrowRight size={14} color="var(--text-tertiary)" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick actions */}
                        <div className="hud-card hud-card--static">
                            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Activity size={14} /> Hızlı Aksiyonlar
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                {[
                                    { label: 'Kullanıcı Ekle', icon: <UserPlus size={16} />, onClick: () => navigate('/users') },
                                    { label: 'Yeni Bilet', icon: <TicketPlus size={16} />, onClick: () => navigate('/tickets/new') },
                                    { label: 'Raporlar', icon: <BarChart3 size={16} />, onClick: () => navigate('/reports') },
                                    { label: 'Ayarlar', icon: <Server size={16} />, onClick: () => navigate('/settings') },
                                ].map(action => (
                                    <button key={action.label} className="btn btn-secondary" onClick={action.onClick} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                                        padding: 'var(--space-4)', height: 'auto',
                                    }}>
                                        {action.icon}
                                        <span style={{ fontSize: 'var(--text-xs)' }}>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
                <div>
                    {/* Status distribution */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const count = tickets.filter(t => t.status === key).length;
                            return (
                                <div key={key} className="hud-card hud-card--static" style={{ textAlign: 'center' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, margin: '0 auto var(--space-2)' }} />
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>{cfg.label}</div>
                                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: cfg.color, fontFamily: 'var(--font-mono)' }}>{count}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Priority distribution */}
                    <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>Öncelik Dağılımı</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                                const count = tickets.filter(t => t.priority === key).length;
                                const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                                return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <span style={{ width: 60, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{cfg.label}</span>
                                        <div style={{ flex: 1, height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.5s var(--ease-spring)' }} />
                                        </div>
                                        <span style={{ width: 30, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent tickets table */}
                    <div className="hud-card hud-card--static">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Son Biletler</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>Tümünü Gör <ArrowRight size={12} /></button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Başlık', 'Öncelik', 'Durum', 'Atanan'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-primary)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.slice(0, 8).map(t => (
                                    <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{ cursor: 'pointer' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--theme-500)', borderBottom: '1px solid var(--border-primary)' }}>{t.id}</td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-primary)' }}><span className={`badge ${PRIORITY_CONFIG[t.priority].class}`}>{PRIORITY_CONFIG[t.priority].label}</span></td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-primary)' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: STATUS_CONFIG[t.status].color }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[t.status].color }} />
                                                {STATUS_CONFIG[t.status].label}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-primary)' }}>{t.assignedToName ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                        {[
                            { label: 'Toplam Kullanıcı', value: totalUsers, color: 'var(--text-primary)' },
                            { label: 'Aktif', value: activeUsers, color: 'var(--success)' },
                            { label: 'Destek Ekibi', value: agents.length, color: 'var(--theme-500)' },
                            { label: 'Çalışanlar', value: employees.length, color: 'var(--info)' },
                        ].map(card => (
                            <div key={card.label} className="hud-card hud-card--static" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>{card.label}</div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)' }}>{card.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Agent performance */}
                    <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <TrendingUp size={14} /> Destek Ekibi Performansı
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>Kullanıcıları Yönet <ArrowRight size={12} /></button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['İsim', 'Rol', 'Çözülen', 'Ort. Yanıt', 'Durum'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-primary)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map(agent => (
                                    <tr key={agent.id}>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>{agent.name}</td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-primary)' }}>
                                            <span className="badge badge--theme">{agent.role === 'admin' ? 'Yönetici' : 'Destek Uzmanı'}</span>
                                        </td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--theme-500)', fontWeight: 700, borderBottom: '1px solid var(--border-primary)' }}>{agent.ticketsClosed ?? 0}</td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-primary)' }}>{agent.avgResponseMinutes ? `${agent.avgResponseMinutes} dk` : '—'}</td>
                                        <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-primary)' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: agent.status === 'active' ? 'var(--success)' : 'var(--error)' }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: agent.status === 'active' ? 'var(--success)' : 'var(--error)' }} />
                                                {agent.status === 'active' ? 'Aktif' : 'Askıda'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                        {[
                            { label: 'Sunucu Durumu', value: 'Çalışıyor', color: 'var(--success)', icon: <Server size={20} />, detail: 'Uptime: 99.97%' },
                            { label: 'Veritabanı', value: 'Bağlı', color: 'var(--success)', icon: <HardDrive size={20} />, detail: 'MySQL 8.0 — 1.2GB' },
                            { label: 'CPU Kullanımı', value: '23%', color: 'var(--success)', icon: <Cpu size={20} />, detail: '4 vCPU / 8GB RAM' },
                        ].map(card => (
                            <div key={card.label} className="hud-card hud-card--static">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                    <div style={{ color: card.color }}>{card.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{card.label}</div>
                                        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: card.color }}>{card.value}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{card.detail}</div>
                            </div>
                        ))}
                    </div>

                    {/* System logs */}
                    <div className="hud-card hud-card--static">
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>Son Sistem Logları</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {[
                                { time: '05:48', level: 'INFO', msg: 'Scheduled backup completed successfully', color: 'var(--success)' },
                                { time: '05:30', level: 'INFO', msg: 'SSL certificate renewal — 45 days remaining', color: 'var(--info)' },
                                { time: '05:15', level: 'WARN', msg: 'High memory usage detected on worker-3 (87%)', color: 'var(--theme-500)' },
                                { time: '04:00', level: 'INFO', msg: 'Database optimization completed — 128 queries optimized', color: 'var(--success)' },
                                { time: '02:30', level: 'INFO', msg: 'System health check passed — all services operational', color: 'var(--success)' },
                                { time: '02:00', level: 'INFO', msg: 'Maintenance window started — applying security patches', color: 'var(--info)' },
                            ].map((log, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-2) var(--space-3)',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                }}>
                                    <span style={{ color: 'var(--text-tertiary)', minWidth: 36 }}>{log.time}</span>
                                    <span style={{
                                        padding: '1px 6px',
                                        borderRadius: 3,
                                        background: `${log.color}15`,
                                        color: log.color,
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        minWidth: 36,
                                        textAlign: 'center',
                                    }}>{log.level}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
