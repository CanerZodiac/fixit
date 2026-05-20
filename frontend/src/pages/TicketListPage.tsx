import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_CONFIG } from '../lib/constants';
import { formatRelativeTime, getSlaStatus, getSlaTimeRemaining } from '../lib/helpers';
import type { TicketFilters } from '../types/ticket';
import { Search, Filter } from 'lucide-react';

export default function TicketListPage() {
    const navigate = useNavigate();
    const { tickets } = useTickets();
    const [filters, setFilters] = useState<TicketFilters>({ status: 'all', priority: 'all', category: 'all', search: '' });

    const filtered = useMemo(() => {
        return tickets.filter(t => {
            if (t.status === 'closed' || t.status === 'resolved') return false;
            if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
            if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
            if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
            if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()) && !t.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
            return true;
        });
    }, [tickets, filters]);

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Biletler</h1>
                    <p className="page-header__subtitle">{filtered.length} aktif bilet</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>+ Yeni Bilet</button>
                </div>
            </div>

            <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={14} color="var(--text-tertiary)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 200 }}>
                    <Search size={14} color="var(--text-tertiary)" />
                    <input className="input" placeholder="Ara..." style={{ flex: 1 }} value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                </div>
                <select className="select" style={{ width: 140 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value as TicketFilters['status'] }))}>
                    <option value="all">Tüm Durumlar</option>
                    {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'closed' && k !== 'resolved').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select className="select" style={{ width: 130 }} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value as TicketFilters['priority'] }))}>
                    <option value="all">Tüm Öncelikler</option>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select className="select" style={{ width: 150 }} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value as TicketFilters['category'] }))}>
                    <option value="all">Tüm Kategoriler</option>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            <div className="hud-card hud-card--static" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Öncelik</th>
                            <th>Durum</th>
                            <th>Atanan</th>
                            <th>SLA</th>
                            <th>Güncelleme</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(ticket => {
                            const sla = getSlaStatus(ticket.slaDeadline);
                            return (
                                <tr key={ticket.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-500)', fontWeight: 600 }}>{ticket.id}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 280 }}>
                                        <span className="truncate" style={{ display: 'block' }}>{ticket.title}</span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)' }}>{CATEGORY_CONFIG[ticket.category].label}</td>
                                    <td><span className={`badge ${PRIORITY_CONFIG[ticket.priority].class}`}>{PRIORITY_CONFIG[ticket.priority].label}</span></td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[ticket.status].color }} />
                                            {STATUS_CONFIG[ticket.status].label}
                                        </span>
                                    </td>
                                    <td>{ticket.assignedToName ?? <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                                    <td>
                                        <div className={`sla-indicator sla-indicator--${sla}`}>
                                            <span className="sla-indicator__dot" />
                                            <span>{getSlaTimeRemaining(ticket.slaDeadline)}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{formatRelativeTime(ticket.updatedAt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state__title">Bilet bulunamadı</div>
                        <div className="empty-state__description">Filtrelerinizi değiştirerek tekrar deneyin.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
