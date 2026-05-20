import { useTickets } from '../hooks/useTickets';
import { mockUsers } from '../data/mock-users';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../lib/constants';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
    const { tickets } = useTickets();
    const agents = mockUsers.filter(u => u.role === 'agent');
    const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting');
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

    const categoryStats = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
        key, label: cfg.label,
        count: tickets.filter(t => t.category === key).length,
    })).sort((a, b) => b.count - a.count);
    const maxCat = Math.max(...categoryStats.map(c => c.count), 1);

    const priorityStats = Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => ({
        key, label: cfg.label, color: cfg.color,
        count: tickets.filter(t => t.priority === key).length,
    }));
    const totalPrio = Math.max(priorityStats.reduce((s, p) => s + p.count, 0), 1);

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <h1 className="page-header__title"><BarChart3 size={20} /> Raporlar & Analytics</h1>
            </div>

            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Toplam Bilet', value: tickets.length, color: 'var(--text-primary)' },
                    { label: 'Açık / Devam', value: open.length, color: 'var(--theme-500)' },
                    { label: 'Çözülen', value: resolved.length, color: 'var(--success)' },
                    { label: 'Çözüm Oranı', value: `${Math.round((resolved.length / Math.max(tickets.length, 1)) * 100)}%`, color: 'var(--theme-400)' },
                ].map(s => (
                    <div key={s.label} className="hud-card hud-card--static">
                        <div className="stat-card"><span className="stat-card__label">{s.label}</span><span className="stat-card__value" style={{ color: s.color }}>{s.value}</span></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                <div className="hud-card hud-card--static">
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>Kategori Dağılımı</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {categoryStats.map(c => (
                            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{ width: 80, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{c.label}</span>
                                <div style={{ flex: 1, height: 8, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div className="chart-bar" style={{ height: '100%', width: `${(c.count / maxCat) * 100}%`, background: 'var(--theme-600)', borderRadius: 2 }} />
                                </div>
                                <span style={{ width: 24, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'right' }}>{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hud-card hud-card--static">
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-5)' }}>Öncelik Dağılımı</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', gap: 4, height: 120, alignItems: 'flex-end' }}>
                            {priorityStats.map(p => (
                                <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)', fontWeight: 700 }}>{p.count}</span>
                                    <div className="chart-bar" style={{ width: 32, height: `${Math.max((p.count / totalPrio) * 100, 10)}%`, background: p.color, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-tertiary)' }}>{p.label}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {priorityStats.map(p => (
                                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{Math.round((p.count / totalPrio) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hud-card hud-card--static" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>Agent Performans Tablosu</h3>
                    <table className="data-table">
                        <thead><tr><th>Agent</th><th>Unvan</th><th>Çözülen Bilet</th><th>Ort. Yanıt Süresi</th><th>Performans</th></tr></thead>
                        <tbody>
                            {agents.sort((a, b) => (b.ticketsClosed ?? 0) - (a.ticketsClosed ?? 0)).map(a => {
                                const perf = Math.min((a.ticketsClosed ?? 0) / 6, 100);
                                return (
                                    <tr key={a.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>{a.title}</td>
                                        <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.ticketsClosed}</span></td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{a.avgResponseMinutes} dk</td>
                                        <td style={{ width: 140 }}><div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${perf}%` }} /></div></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
