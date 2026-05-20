import { useTickets } from '../hooks/useTickets';
import { mockUsers } from '../data/mock-users';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime, getSlaStatus } from '../lib/helpers';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/constants';
import { AlertTriangle, CheckCircle, Clock, Ticket, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { tickets } = useTickets();

    const openTickets = tickets.filter(t => t.status === 'open');
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
    const waitingTickets = tickets.filter(t => t.status === 'waiting');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const slaBreach = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved' && getSlaStatus(t.slaDeadline) === 'breached');

    const agents = mockUsers.filter(u => u.role === 'agent');
    const recentTickets = [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

    const priorityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    tickets.filter(t => t.status !== 'closed').forEach(t => { priorityCounts[t.priority]++; });
    const maxPrio = Math.max(...Object.values(priorityCounts), 1);

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-header__title"><span>Dashboard</span></h1>
                    <p className="page-header__subtitle">Hoş geldin, {currentUser?.name.split(' ')[0]}. İşte güncel operasyon özeti.</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>+ Yeni Bilet</button>
                </div>
            </div>

            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="hud-card hud-card--static">
                    <div className="stat-card"><span className="stat-card__label">Toplam Bilet</span><span className="stat-card__value" style={{ color: 'var(--text-primary)' }}>{tickets.length}</span></div>
                    <Ticket size={18} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }} />
                </div>
                <div className="hud-card hud-card--static">
                    <div className="stat-card"><span className="stat-card__label">Açık</span><span className="stat-card__value" style={{ color: 'var(--info)' }}>{openTickets.length}</span></div>
                    <Clock size={18} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }} />
                </div>
                <div className="hud-card hud-card--static">
                    <div className="stat-card"><span className="stat-card__label">Devam Eden</span><span className="stat-card__value" style={{ color: 'var(--theme-500)' }}>{inProgressTickets.length + waitingTickets.length}</span></div>
                    <TrendingUp size={18} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }} />
                </div>
                <div className="hud-card hud-card--static">
                    <div className="stat-card"><span className="stat-card__label">Çözülen</span><span className="stat-card__value" style={{ color: 'var(--success)' }}>{resolvedTickets.length}</span></div>
                    <CheckCircle size={18} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }} />
                </div>
                <div className="hud-card hud-card--static" style={{ borderColor: slaBreach.length > 0 ? 'rgba(239,68,68,0.3)' : undefined }}>
                    <div className="stat-card"><span className="stat-card__label">SLA İhlali</span><span className="stat-card__value" style={{ color: slaBreach.length > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{slaBreach.length}</span></div>
                    <AlertTriangle size={18} style={{ position: 'absolute', top: 16, right: 16, color: slaBreach.length > 0 ? 'var(--error)' : 'var(--text-tertiary)' }} />
                </div>
                <div className="hud-card hud-card--static">
                    <div className="stat-card"><span className="stat-card__label">Aktif Agent</span><span className="stat-card__value" style={{ color: 'var(--text-primary)' }}>{agents.length}</span></div>
                    <Users size={18} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                <div className="hud-card hud-card--static">
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>Öncelik Dağılımı</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {(Object.entries(PRIORITY_CONFIG) as [string, { label: string; color: string }][]).map(([key, config]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{ width: 60, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{config.label}</span>
                                <div style={{ flex: 1, height: 8, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div className="chart-bar" style={{ height: '100%', width: `${(priorityCounts[key as keyof typeof priorityCounts] / maxPrio) * 100}%`, background: config.color, borderRadius: 2 }} />
                                </div>
                                <span style={{ width: 24, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'right' }}>{priorityCounts[key as keyof typeof priorityCounts]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hud-card hud-card--static">
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>Agent Performansı</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {agents.sort((a, b) => (b.ticketsClosed ?? 0) - (a.ticketsClosed ?? 0)).map((agent, i) => (
                            <div key={agent.id} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: 'var(--space-2) var(--space-3)',
                                background: i === 0 ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
                                borderRadius: 'var(--radius-sm)',
                                border: i === 0 ? '1px solid var(--border-accent)' : '1px solid transparent',
                            }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: i === 0 ? 'var(--theme-500)' : 'var(--text-tertiary)', width: 20 }}>#{i + 1}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{agent.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{agent.title}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{agent.ticketsClosed}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>çözülen</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hud-card hud-card--static" style={{ marginTop: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Son Aktivite</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>Tümünü Gör</button>
                </div>
                <table className="data-table">
                    <thead><tr><th>ID</th><th>Başlık</th><th>Öncelik</th><th>Durum</th><th>Atanan</th><th>Güncelleme</th></tr></thead>
                    <tbody>
                        {recentTickets.map(ticket => (
                            <tr key={ticket.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-500)', fontWeight: 600 }}>{ticket.id}</td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 300 }}><span className="truncate" style={{ display: 'block' }}>{ticket.title}</span></td>
                                <td><span className={`badge ${PRIORITY_CONFIG[ticket.priority].class}`}>{PRIORITY_CONFIG[ticket.priority].label}</span></td>
                                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[ticket.status].color }} />{STATUS_CONFIG[ticket.status].label}</span></td>
                                <td>{ticket.assignedToName ?? <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{formatRelativeTime(ticket.updatedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
