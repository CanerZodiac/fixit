import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { useToast } from '../hooks/useToast';
import { getInitials, formatDateTime } from '../lib/helpers';
import { DEPARTMENTS } from '../lib/constants';
import type { UserRole, UserStatus } from '../types/user';
import {
    Users, Search, Plus, Edit3, Trash2, ShieldCheck, ShieldOff,
    AlertTriangle, X, UserCheck, UserX, UserMinus, Eye, EyeOff
} from 'lucide-react';

const roleLabel: Record<string, string> = { admin: 'Yönetici', agent: 'Destek Uzmanı', employee: 'Çalışan' };
const roleClass: Record<string, string> = { admin: 'badge--critical', agent: 'badge--theme', employee: 'badge--info' };
const statusLabel: Record<string, string> = { active: 'Aktif', inactive: 'Pasif', suspended: 'Askıda' };
const statusColor: Record<string, string> = { active: 'var(--success)', inactive: 'var(--text-tertiary)', suspended: 'var(--error)' };

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function UsersPage() {
    const { currentUser } = useAuth();
    const { users, addUser, updateUser, deleteUser, toggleStatus, refreshUsers } = useUsers();
    const { addToast } = useToast();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [showPw, setShowPw] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'employee' as UserRole,
        department: '', phone: '', title: '',
    });

    useEffect(() => { refreshUsers(); }, [refreshUsers]);

    const filtered = users.filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (statusFilter !== 'all' && u.status !== statusFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            if (!u.name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s) && !(u.department || '').toLowerCase().includes(s)) return false;
        }
        return true;
    });

    const counts = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        suspended: users.filter(u => u.status === 'suspended').length,
    };

    const openAdd = () => {
        setForm({ name: '', email: '', password: '', role: 'employee', department: '', phone: '', title: '' });
        setShowPw(false);
        setModal('add');
    };

    const openEdit = (id: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        setSelectedUserId(id);
        setForm({
            name: user.name, email: user.email, password: '',
            role: user.role, department: user.department,
            phone: user.phone || '', title: user.title || '',
        });
        setModal('edit');
    };

    const openDelete = (id: string) => {
        setSelectedUserId(id);
        setModal('delete');
    };

    const handleAdd = () => {
        const result = addUser({
            name: form.name, email: form.email, password: form.password,
            role: form.role, department: form.department,
            phone: form.phone || undefined, title: form.title || undefined,
        });
        if (result.success) {
            addToast({ title: 'Kullanıcı eklendi', message: `${form.name} başarıyla oluşturuldu.`, type: 'success' });
            setModal(null);
        } else {
            addToast({ title: 'Hata', message: result.error || 'Kullanıcı eklenemedi.', type: 'error' });
        }
    };

    const handleEdit = () => {
        if (!selectedUserId) return;
        const result = updateUser(selectedUserId, {
            name: form.name, email: form.email, role: form.role,
            department: form.department, phone: form.phone || undefined,
            title: form.title || undefined,
            ...(form.password ? { passwordHash: form.password } : {}),
        });
        if (result.success) {
            addToast({ title: 'Kullanıcı güncellendi', message: `${form.name} bilgileri güncellendi.`, type: 'success' });
            setModal(null);
        } else {
            addToast({ title: 'Hata', message: result.error || 'Güncelleme başarısız.', type: 'error' });
        }
    };

    const handleDelete = () => {
        if (!selectedUserId) return;
        const user = users.find(u => u.id === selectedUserId);
        const result = deleteUser(selectedUserId);
        if (result.success) {
            addToast({ title: 'Kullanıcı silindi', message: `${user?.name || ''} kalıcı olarak silindi.`, type: 'success' });
            setModal(null);
        }
    };

    const handleStatusToggle = (id: string, newStatus: UserStatus) => {
        const user = users.find(u => u.id === id);
        toggleStatus(id, newStatus);
        addToast({
            title: 'Durum güncellendi',
            message: `${user?.name}: ${statusLabel[newStatus]}`,
            type: newStatus === 'active' ? 'success' : 'warning',
        });
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="empty-state">
                <ShieldOff size={48} className="empty-state__icon" />
                <div className="empty-state__title">Erişim Engellendi</div>
                <div className="empty-state__description">Bu sayfaya yalnızca yöneticiler erişebilir.</div>
            </div>
        );
    }

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-header__title"><Users size={20} /> Kullanıcı Yönetimi</h1>
                    <p className="page-header__subtitle">{counts.total} kullanıcı kayıtlı</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn-primary" onClick={openAdd}>
                        <Plus size={14} /> Kullanıcı Ekle
                    </button>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                {[
                    { label: 'Toplam', value: counts.total, icon: <Users size={16} />, color: 'var(--text-primary)' },
                    { label: 'Aktif', value: counts.active, icon: <UserCheck size={16} />, color: 'var(--success)' },
                    { label: 'Pasif', value: counts.inactive, icon: <UserX size={16} />, color: 'var(--text-tertiary)' },
                    { label: 'Askıda', value: counts.suspended, icon: <UserMinus size={16} />, color: 'var(--error)' },
                ].map(stat => (
                    <div key={stat.label} className="hud-card hud-card--static" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="stat-card">
                                <span className="stat-card__label">{stat.label}</span>
                                <span className="stat-card__value" style={{ color: stat.color, fontSize: 'var(--text-xl)' }}>{stat.value}</span>
                            </div>
                            <div style={{ color: 'var(--text-tertiary)' }}>{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtreler */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)' }}>
                    <Search size={14} color="var(--text-tertiary)" />
                    <input className="input" style={{ border: 'none', background: 'none' }} placeholder="İsim, e-posta veya departman ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">Tüm Roller</option>
                    <option value="admin">Yönetici</option>
                    <option value="agent">Destek Uzmanı</option>
                    <option value="employee">Çalışan</option>
                </select>
                <select className="select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="suspended">Askıda</option>
                </select>
            </div>

            {/* Kullanıcı Tablosu */}
            <div className="hud-card hud-card--static" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th></th><th>İsim</th><th>E-posta</th><th>Rol</th><th>Departman</th><th>Durum</th><th>Son Giriş</th><th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>Kullanıcı bulunamadı</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id}>
                                <td><div className="avatar avatar--sm">{getInitials(u.name)}</div></td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{u.email}</td>
                                <td><span className={`badge ${roleClass[u.role]}`}>{roleLabel[u.role]}</span></td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>{u.department}</td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[u.status] }} />
                                        {statusLabel[u.status] || u.status}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{u.lastLogin ? formatDateTime(u.lastLogin) : '—'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                        <button className="btn-icon" title="Düzenle" onClick={() => openEdit(u.id)}><Edit3 size={14} /></button>
                                        {u.status === 'active' ? (
                                            <button className="btn-icon" title="Askıya Al" onClick={() => handleStatusToggle(u.id, 'suspended')} style={{ color: 'var(--warning)' }}><ShieldOff size={14} /></button>
                                        ) : (
                                            <button className="btn-icon" title="Aktif Et" onClick={() => handleStatusToggle(u.id, 'active')} style={{ color: 'var(--success)' }}><ShieldCheck size={14} /></button>
                                        )}
                                        <button className="btn-icon" title="Sil" onClick={() => openDelete(u.id)} style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ekleme/Düzenleme Modalı */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
                        <div className="modal__header">
                            <span className="modal__title">{modal === 'add' ? 'Yeni Kullanıcı' : 'Kullanıcı Düzenle'}</span>
                            <button className="btn-icon" onClick={() => setModal(null)}><X size={18} /></button>
                        </div>
                        <div className="modal__body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="input-group">
                                    <label className="input-label">Ad Soyad *</label>
                                    <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">E-posta *</label>
                                    <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{modal === 'add' ? 'Şifre *' : 'Yeni Şifre (boş = değişmez)'}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)' }}>
                                        <input className="input" type={showPw ? 'text' : 'password'} style={{ border: 'none', background: 'none' }}
                                            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                            placeholder={modal === 'edit' ? '(değiştirmek için girin)' : 'En az 6 karakter'}
                                            required={modal === 'add'} />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)', color: 'var(--text-tertiary)' }}>
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Rol *</label>
                                    <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                                        <option value="employee">Çalışan</option>
                                        <option value="agent">Destek Uzmanı</option>
                                        <option value="admin">Yönetici</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Departman *</label>
                                    <select className="select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
                                        <option value="">Seçin...</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Telefon</label>
                                    <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+90 5xx" />
                                </div>
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="input-label">Unvan</label>
                                    <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ör: Kıdemli Uzman" />
                                </div>
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                            <button className="btn btn-primary" onClick={modal === 'add' ? handleAdd : handleEdit}>
                                {modal === 'add' ? <><Plus size={14} /> Ekle</> : <><Edit3 size={14} /> Güncelle</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Silme Onay Modalı */}
            {modal === 'delete' && selectedUserId && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal__header">
                            <span className="modal__title" style={{ color: 'var(--error)' }}>Kullanıcı Silme</span>
                            <button className="btn-icon" onClick={() => setModal(null)}><X size={18} /></button>
                        </div>
                        <div className="modal__body" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'var(--error-bg)', border: '2px solid rgba(239,68,68,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto var(--space-4)',
                            }}>
                                <AlertTriangle size={28} color="var(--error)" />
                            </div>
                            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                                <strong>{users.find(u => u.id === selectedUserId)?.name}</strong> kullanıcısını silmek üzeresiniz.
                            </p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                Bu işlem geri alınamaz. Tüm kullanıcı verileri kalıcı olarak silinecektir.
                            </p>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>Vazgeç</button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                <Trash2 size={14} /> Kalıcı Olarak Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
