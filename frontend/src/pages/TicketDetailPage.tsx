import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_CONFIG } from '../lib/constants';
import { formatDateTime, getSlaStatus, getSlaTimeRemaining, getInitials } from '../lib/helpers';
import { mockUsers } from '../data/mock-users';
import { ArrowLeft, Clock, User, Tag, MessageCircle, Send, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useState } from 'react';

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getTicketById, updateTicketStatus, assignTicket, addMessage, updateTicketPriority, loading } = useTickets();
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [showAssignMenu, setShowAssignMenu] = useState(false);

    const ticket = getTicketById(id ?? '');

    if (loading) {
        return (
            <div className="empty-state">
                <Loader size={24} className="anim-spin" style={{ color: 'var(--theme-500)' }} />
                <div className="empty-state__title">Bilet yükleniyor...</div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="empty-state">
                <div className="empty-state__title">Bilet bulunamadı</div>
                <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>Geri Dön</button>
            </div>
        );
    }

    const slaStatus = getSlaStatus(ticket.slaDeadline);
    const agents = mockUsers.filter(u => u.role === 'agent' || u.role === 'admin');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        addMessage(ticket.id, newMessage.trim());
        setNewMessage('');
    };

    const handleResolve = () => updateTicketStatus(ticket.id, 'resolved');
    const handleClose = () => updateTicketStatus(ticket.id, 'closed');
    const handleReopen = () => updateTicketStatus(ticket.id, 'open');

    return (
        <div className="anim-fade-in-up">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: 'var(--space-4)' }}>
                <ArrowLeft size={14} /> Biletlere Dön
            </button>

            <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-500)', fontWeight: 700, fontSize: 'var(--text-md)' }}>{ticket.id}</span>
                        <span className={`badge ${PRIORITY_CONFIG[ticket.priority].class}`}>{PRIORITY_CONFIG[ticket.priority].label}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: STATUS_CONFIG[ticket.status].color }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[ticket.status].color }} />
                            {STATUS_CONFIG[ticket.status].label}
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{ticket.title}</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)' }}>
                <div>
                    {/* Açıklama */}
                    <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>Açıklama</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{ticket.description}</p>
                    </div>

                    {/* Zaman Çizelgesi */}
                    <div className="hud-card hud-card--static" style={{ marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>Zaman Çizelgesi</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {ticket.events.map(event => (
                                <div key={event.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--theme-600)', marginTop: 6, flexShrink: 0, border: '2px solid var(--bg-tertiary)' }} />
                                    <div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                            <strong>{event.userName}</strong> — {event.description}
                                        </div>
                                        {event.oldValue && event.newValue && (
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                                {STATUS_CONFIG[event.oldValue as keyof typeof STATUS_CONFIG]?.label ?? event.oldValue} → {STATUS_CONFIG[event.newValue as keyof typeof STATUS_CONFIG]?.label ?? event.newValue}
                                            </div>
                                        )}
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                                            <Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                            {formatDateTime(event.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mesajlar */}
                    <div className="hud-card hud-card--static">
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <MessageCircle size={12} /> Mesajlar ({ticket.messages.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            {ticket.messages.map(msg => (
                                <div key={msg.id} style={{
                                    display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
                                    padding: 'var(--space-3)',
                                    background: msg.isInternal ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                                    borderRadius: 'var(--radius-sm)',
                                    border: msg.isInternal ? '1px dashed var(--border-accent)' : 'none',
                                }}>
                                    <div className="avatar avatar--sm">{getInitials(msg.senderName)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{msg.senderName}</span>
                                            {msg.isInternal && <span className="badge badge--theme">Dahili Not</span>}
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatDateTime(msg.timestamp)}</span>
                                        </div>
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', lineHeight: 1.6 }}>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {ticket.messages.length === 0 && (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-4)' }}>Henüz mesaj yok.</p>
                            )}
                        </div>

                        {/* Mesaj girişi */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <input className="input" placeholder="Yanıt yaz..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1 }} />
                            <button className="btn btn-primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kenar Paneli */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* SLA */}
                    <div className="hud-card hud-card--static" style={{
                        borderColor: slaStatus === 'breached' ? 'rgba(239,68,68,0.3)' : slaStatus === 'warning' ? 'rgba(251,191,36,0.3)' : undefined,
                    }}>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>SLA Durumu</h4>
                        <div className={`sla-indicator sla-indicator--${slaStatus}`} style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>
                            <span className="sla-indicator__dot" style={{ width: 8, height: 8 }} />
                            <span>{getSlaTimeRemaining(ticket.slaDeadline)}</span>
                        </div>
                    </div>

                    {/* Detaylar */}
                    <div className="hud-card hud-card--static">
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)' }}>Detaylar</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {[
                                { label: 'Kategori', value: CATEGORY_CONFIG[ticket.category].label },
                                { label: 'Oluşturan', value: ticket.createdByName },
                                { label: 'Atanan', value: ticket.assignedToName ?? 'Atanmamış' },
                                { label: 'Oluşturulma', value: formatDateTime(ticket.createdAt) },
                                { label: 'Güncelleme', value: formatDateTime(ticket.updatedAt) },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.label}</span>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Etiketler */}
                    {ticket.tags.length > 0 && (
                        <div className="hud-card hud-card--static">
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Tag size={12} /> Etiketler
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {ticket.tags.map(tag => (
                                    <span key={tag} className="badge badge--info">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* İşlemler */}
                    <div className="hud-card hud-card--static">
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>Aksiyonlar</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', position: 'relative' }}>
                            {/* Durum Seçici */}
                            <div>
                                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 'var(--space-1)', display: 'block' }}>Durum Değiştir</label>
                                <select
                                    className="select"
                                    value={ticket.status}
                                    onChange={e => updateTicketStatus(ticket.id, e.target.value as 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed')}
                                    style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Öncelik Seçici (Sadece Admin veya Agent) */}
                            {(currentUser?.role === 'admin' || currentUser?.role === 'agent') && (
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 'var(--space-1)', display: 'block' }}>Öncelik Değiştir</label>
                                    <select
                                        className="select"
                                        value={ticket.priority}
                                        onChange={e => updateTicketPriority(ticket.id, e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                                        style={{ width: '100%', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}
                                    >
                                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>{cfg.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Atama */}
                            <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'flex-start' }} onClick={() => setShowAssignMenu(v => !v)}>
                                <User size={14} /> Atama Değiştir
                            </button>
                            {showAssignMenu && (
                                <div style={{
                                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-sm)',
                                    padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)',
                                }}>
                                    {agents.map(a => (
                                        <button key={a.id} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', fontSize: 'var(--text-xs)' }}
                                            onClick={() => { assignTicket(ticket.id, a.id, a.name); setShowAssignMenu(false); }}>
                                            {a.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Hızlı Durum İşlemleri */}
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'flex-start', color: 'var(--success)' }} onClick={handleResolve}>
                                    <CheckCircle size={14} /> Çözüldü Olarak İşaretle
                                </button>
                            )}
                            {ticket.status !== 'closed' && (
                                <button className="btn btn-danger btn-sm w-full" style={{ justifyContent: 'flex-start' }} onClick={handleClose}>
                                    <XCircle size={14} /> Bileti Kapat
                                </button>
                            )}
                            {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                                <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'flex-start', color: 'var(--info)' }} onClick={handleReopen}>
                                    Yeniden Aç
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
