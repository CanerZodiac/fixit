import { useTickets } from '../hooks/useTickets';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/constants';
import { formatDateTime } from '../lib/helpers';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';

export default function TicketArchivePage() {
    const navigate = useNavigate();
    const { tickets } = useTickets();
    const archived = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <h1 className="page-header__title"><Archive size={20} /> Bilet Arşivi</h1>
                <p className="page-header__subtitle">{archived.length} kapatılmış bilet</p>
            </div>

            <div className="hud-card hud-card--static" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead><tr><th>ID</th><th>Başlık</th><th>Öncelik</th><th>Durum</th><th>Çözüm Tarihi</th></tr></thead>
                    <tbody>
                        {archived.map(t => (
                            <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${t.id}`)}>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-500)', fontWeight: 600 }}>{t.id}</td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.title}</td>
                                <td><span className={`badge ${PRIORITY_CONFIG[t.priority].class}`}>{PRIORITY_CONFIG[t.priority].label}</span></td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[t.status].color }} />
                                        {STATUS_CONFIG[t.status].label}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{t.resolvedAt ? formatDateTime(t.resolvedAt) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {archived.length === 0 && <div className="empty-state"><div className="empty-state__title">Arşivde bilet yok</div></div>}
            </div>
        </div>
    );
}
