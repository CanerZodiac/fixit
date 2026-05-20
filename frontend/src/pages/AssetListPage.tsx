import { useState } from 'react';
import { useAssets } from '../hooks/useAssets';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
    Monitor, Search, Laptop, Printer, Server, Smartphone, Tablet,
    Wifi, HardDrive, HelpCircle, Plus, Pencil, Trash2, X, Save, AlertTriangle
} from 'lucide-react';
import type { AssetType, AssetStatus, Asset } from '../types/asset';

const typeIcons: Record<AssetType, React.ReactNode> = {
    desktop: <Monitor size={16} />, laptop: <Laptop size={16} />, monitor: <Monitor size={16} />,
    printer: <Printer size={16} />, phone: <Smartphone size={16} />, tablet: <Tablet size={16} />,
    server: <Server size={16} />, network: <Wifi size={16} />, other: <HelpCircle size={16} />,
};

const statusConfig: Record<AssetStatus, { label: string; color: string }> = {
    active: { label: 'Aktif', color: 'var(--success)' },
    maintenance: { label: 'Bakımda', color: 'var(--warning)' },
    retired: { label: 'Emekli', color: 'var(--text-tertiary)' },
    lost: { label: 'Kayıp', color: 'var(--error)' },
};

const ASSET_TYPES: { value: AssetType; label: string }[] = [
    { value: 'laptop', label: 'Laptop' }, { value: 'desktop', label: 'Masaüstü' },
    { value: 'monitor', label: 'Monitör' }, { value: 'printer', label: 'Yazıcı' },
    { value: 'server', label: 'Sunucu' }, { value: 'network', label: 'Ağ Cihazı' },
    { value: 'phone', label: 'Telefon' }, { value: 'tablet', label: 'Tablet' },
    { value: 'other', label: 'Diğer' },
];

const ASSET_STATUSES: { value: AssetStatus; label: string }[] = [
    { value: 'active', label: 'Aktif' }, { value: 'maintenance', label: 'Bakımda' },
    { value: 'retired', label: 'Emekli' }, { value: 'lost', label: 'Kayıp' },
];

const EMPTY_FORM = {
    name: '', type: 'laptop' as AssetType, brand: '', model: '', serialNumber: '',
    status: 'active' as AssetStatus, assignedTo: null as string | null,
    assignedToName: null as string | null, department: '', location: '',
    purchaseDate: '', warrantyExpiry: '', notes: '',
};

function AssetModal({
    mode,
    initial,
    onSave,
    onClose,
}: {
    mode: 'add' | 'edit';
    initial?: Asset;
    onSave: (data: typeof EMPTY_FORM) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState(
        initial ? {
            name: initial.name, type: initial.type, brand: initial.brand,
            model: initial.model, serialNumber: initial.serialNumber,
            status: initial.status, assignedTo: initial.assignedTo,
            assignedToName: initial.assignedToName, department: initial.department,
            location: initial.location, purchaseDate: initial.purchaseDate,
            warrantyExpiry: initial.warrantyExpiry, notes: initial.notes ?? '',
        } : { ...EMPTY_FORM }
    );

    const set = (k: keyof typeof EMPTY_FORM, v: string) =>
        setForm(prev => ({ ...prev, [k]: v }));

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)',
        }}>
            <div className="hud-card hud-card--static" style={{
                width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
                background: 'var(--bg-secondary)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <HardDrive size={18} style={{ color: 'var(--theme-500)' }} />
                        {mode === 'add' ? 'Yeni Cihaz Ekle' : 'Cihazı Düzenle'}
                    </h2>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    {/* Cihaz Adı */}
                    <div style={{ gridColumn: '1/3' }}>
                        <label className="label">Cihaz Adı *</label>
                        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dell Latitude 5540" />
                    </div>
                    {/* Tip */}
                    <div>
                        <label className="label">Tip *</label>
                        <select className="select" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value as AssetType)}>
                            {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    {/* Durum */}
                    <div>
                        <label className="label">Durum *</label>
                        <select className="select" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value as AssetStatus)}>
                            {ASSET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    {/* Marka */}
                    <div>
                        <label className="label">Marka *</label>
                        <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Dell" />
                    </div>
                    {/* Model */}
                    <div>
                        <label className="label">Model</label>
                        <input className="input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Latitude 5540" />
                    </div>
                    {/* Seri No */}
                    <div>
                        <label className="label">Seri Numarası *</label>
                        <input className="input" style={{ fontFamily: 'var(--font-mono)' }} value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} placeholder="DL5540-2024-001" />
                    </div>
                    {/* Departman */}
                    <div>
                        <label className="label">Departman</label>
                        <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Bilgi Teknolojileri" />
                    </div>
                    {/* Konum */}
                    <div>
                        <label className="label">Konum</label>
                        <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="2. Kat - Ofis A" />
                    </div>
                    {/* Atanan Kişi */}
                    <div>
                        <label className="label">Atanan Kişi</label>
                        <input className="input" value={form.assignedToName ?? ''} onChange={e => set('assignedToName', e.target.value)} placeholder="Ad Soyad" />
                    </div>
                    {/* Satın Alma */}
                    <div>
                        <label className="label">Satın Alma Tarihi</label>
                        <input className="input" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
                    </div>
                    {/* Garanti */}
                    <div>
                        <label className="label">Garanti Bitiş</label>
                        <input className="input" type="date" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
                    </div>
                    {/* Notlar */}
                    <div style={{ gridColumn: '1/3' }}>
                        <label className="label">Notlar</label>
                        <textarea
                            className="input"
                            style={{ resize: 'vertical', minHeight: 72 }}
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Ek notlar..."
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                    <button className="btn btn-secondary" onClick={onClose}>İptal</button>
                    <button className="btn btn-primary" onClick={() => onSave(form as typeof EMPTY_FORM)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Save size={14} />
                        {mode === 'add' ? 'Ekle' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ asset, onConfirm, onClose }: { asset: Asset; onConfirm: () => void; onClose: () => void }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)',
        }}>
            <div className="hud-card hud-card--static" style={{ width: '100%', maxWidth: 420, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <AlertTriangle size={20} color="var(--error)" />
                    <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--error)' }}>Cihazı Sil</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{asset.name}</strong> cihazını silmek istediğinize emin misiniz?
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-5)' }}>
                    Seri: {asset.serialNumber} — Bu işlem geri alınamaz.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary" onClick={onClose}>İptal</button>
                    <button
                        className="btn"
                        style={{ background: 'var(--error)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        onClick={onConfirm}
                    >
                        <Trash2 size={14} /> Sil
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AssetListPage() {
    const { assets, addAsset, updateAsset, deleteAsset } = useAssets();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

    // Rol kontrolü: sadece admin ve agent düzenleyebilir
    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'agent';

    const filtered = assets.filter(a => {
        if (typeFilter !== 'all' && a.type !== typeFilter) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.serialNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const selectedAsset = selectedId ? assets.find(a => a.id === selectedId) ?? null : null;
    const editTarget = selectedAsset;

    function handleSave(data: typeof EMPTY_FORM) {
        if (modalMode === 'add') {
            const result = addAsset({
                ...data,
                assignedTo: data.assignedToName ? `u-${Date.now()}` : null,
            });
            if (result.success) {
                setModalMode(null);
                addToast({ title: 'Başarılı', message: 'Cihaz başarıyla eklendi.', type: 'success' });
            } else {
                addToast({ title: 'Hata', message: result.error ?? 'Hata oluştu.', type: 'error' });
            }
        } else if (modalMode === 'edit' && selectedId) {
            const result = updateAsset(selectedId, {
                ...data,
                assignedTo: data.assignedToName ? (selectedAsset?.assignedTo ?? `u-${Date.now()}`) : null,
            });
            if (result.success) {
                setModalMode(null);
                addToast({ title: 'Başarılı', message: 'Cihaz güncellendi.', type: 'success' });
            } else {
                addToast({ title: 'Hata', message: result.error ?? 'Hata oluştu.', type: 'error' });
            }
        }
    }

    function handleDelete() {
        if (!deleteTarget) return;
        const result = deleteAsset(deleteTarget.id);
        if (result.success) {
            setDeleteTarget(null);
            if (selectedId === deleteTarget.id) setSelectedId(null);
            addToast({ title: 'Başarılı', message: 'Cihaz silindi.', type: 'success' });
        } else {
            addToast({ title: 'Hata', message: result.error ?? 'Silinemedi.', type: 'error' });
        }
    }

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-header__title"><HardDrive size={20} /> Envanter Yönetimi</h1>
                    <p className="page-header__subtitle">{assets.length} kayıtlı varlık</p>
                </div>
                {canManage && (
                    <button
                        className="btn btn-primary"
                        id="add-asset-btn"
                        onClick={() => setModalMode('add')}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                    >
                        <Plus size={16} /> Cihaz Ekle
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)' }}>
                    <Search size={14} color="var(--text-tertiary)" />
                    <input className="input" style={{ border: 'none', background: 'none' }} placeholder="Cihaz adı veya seri no..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select" style={{ width: 150 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="all">Tüm Tipler</option>
                    {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAsset ? '1fr 380px' : '1fr', gap: 'var(--space-5)' }}>
                <div className="hud-card hud-card--static" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead><tr>
                            <th></th><th>Cihaz</th><th>Marka/Model</th><th>Seri No</th>
                            <th>Durum</th><th>Atanan</th><th>Konum</th>
                            {canManage && <th style={{ textAlign: 'right' }}>İşlem</th>}
                        </tr></thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr
                                    key={a.id}
                                    style={{ cursor: 'pointer', background: selectedId === a.id ? 'var(--bg-hover)' : undefined }}
                                    onClick={() => setSelectedId(a.id)}
                                >
                                    <td style={{ color: 'var(--theme-500)' }}>{typeIcons[a.type]}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</td>
                                    <td style={{ fontSize: 'var(--text-xs)' }}>{a.brand} {a.model}</td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{a.serialNumber}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig[a.status].color }} />
                                            {statusConfig[a.status].label}
                                        </span>
                                    </td>
                                    <td>{a.assignedToName ?? <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{a.location}</td>
                                    {canManage && (
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                                                <button
                                                    id={`edit-asset-${a.id}`}
                                                    className="btn-icon"
                                                    title="Düzenle"
                                                    onClick={e => { e.stopPropagation(); setSelectedId(a.id); setModalMode('edit'); }}
                                                    style={{ color: 'var(--info)' }}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    id={`delete-asset-${a.id}`}
                                                    className="btn-icon"
                                                    title="Sil"
                                                    onClick={e => { e.stopPropagation(); setDeleteTarget(a); }}
                                                    style={{ color: 'var(--error)' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={canManage ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                        Aramanızla eşleşen cihaz bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedAsset && (
                    <div className="hud-card hud-card--static anim-fade-in-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{selectedAsset.name}</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                {canManage && (
                                    <>
                                        <button
                                            className="btn-icon"
                                            title="Düzenle"
                                            onClick={() => setModalMode('edit')}
                                            style={{ color: 'var(--info)' }}
                                        ><Pencil size={13} /></button>
                                        <button
                                            className="btn-icon"
                                            title="Sil"
                                            onClick={() => setDeleteTarget(selectedAsset)}
                                            style={{ color: 'var(--error)' }}
                                        ><Trash2 size={13} /></button>
                                    </>
                                )}
                                <button className="btn-icon" onClick={() => setSelectedId(null)} aria-label="Kapat">✕</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {[
                                { l: 'Tip', v: selectedAsset.type },
                                { l: 'Marka', v: `${selectedAsset.brand} ${selectedAsset.model}` },
                                { l: 'Seri No', v: selectedAsset.serialNumber },
                                { l: 'Durum', v: statusConfig[selectedAsset.status].label },
                                { l: 'Atanan', v: selectedAsset.assignedToName ?? '—' },
                                { l: 'Departman', v: selectedAsset.department },
                                { l: 'Konum', v: selectedAsset.location },
                                { l: 'Satın Alma', v: selectedAsset.purchaseDate },
                                { l: 'Garanti Sonu', v: selectedAsset.warrantyExpiry },
                            ].map(i => (
                                <div key={i.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{i.l}</span>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{i.v}</span>
                                </div>
                            ))}
                            {selectedAsset.notes && (
                                <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Notlar</span>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>{selectedAsset.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalMode && (
                <AssetModal
                    mode={modalMode}
                    initial={modalMode === 'edit' ? editTarget ?? undefined : undefined}
                    onSave={handleSave}
                    onClose={() => setModalMode(null)}
                />
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <DeleteConfirmModal
                    asset={deleteTarget}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
