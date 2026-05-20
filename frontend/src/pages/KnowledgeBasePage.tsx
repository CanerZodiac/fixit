import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
    BookOpen, Search, Eye, ThumbsUp, Plus, X,
    Loader2, Tag, FileText, Trash2, Pencil
} from 'lucide-react';

// ──────────────────────────────────────────────
// Yeni makale ekleme modalı (admin/agent)
// ──────────────────────────────────────────────
interface AddArticleModalProps {
    onClose: () => void;
    onSaved: () => void;
}

function AddArticleModal({ onClose, onSaved }: AddArticleModalProps) {
    const { addArticle } = useArticles();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [form, setForm] = useState({
        title: '',
        category: '',
        content: '',
        tagsRaw: '',   // virgülle ayrılmış etiketler
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const tags = form.tagsRaw
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        const result = await addArticle({
            title: form.title,
            category: form.category,
            content: form.content,
            author: currentUser?.name ?? 'Anonim',
            authorId: currentUser?.id,
            tags,
        });

        setSaving(false);
        if (result.success) {
            addToast({ type: 'success', title: 'Makale eklendi', message: 'Bilgi bankasına başarıyla eklendi.' });
            onSaved();
            onClose();
        } else {
            addToast({ type: 'error', title: 'Hata', message: result.error ?? 'Makale eklenemedi.' });
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)'
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="hud-card hud-card--static" style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                        <FileText size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Yeni Makale Ekle
                    </h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="form-label">Başlık *</label>
                        <input
                            className="input"
                            placeholder="Örn: VPN Bağlantı Sorunları"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Kategori *</label>
                        <input
                            className="input"
                            placeholder="Örn: Ağ, Donanım, Yazılım"
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">
                            <Tag size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            Etiketler (virgülle ayırın)
                        </label>
                        <input
                            className="input"
                            placeholder="Örn: vpn, ağ, cisco"
                            value={form.tagsRaw}
                            onChange={e => setForm(f => ({ ...f, tagsRaw: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="form-label">İçerik * (Markdown desteklenir)</label>
                        <textarea
                            className="input"
                            rows={12}
                            placeholder={'## Başlık\n\n### Alt Başlık\n\n**Kalın** ve `kod` formatlaması desteklenir.'}
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            required
                            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                            Makaleyi Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Ana sayfa
// ──────────────────────────────────────────────
export default function KnowledgeBasePage() {
    const navigate = useNavigate();
    const { articles, loading, categories, deleteArticle, refreshArticles } = useArticles();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'agent';

    // ── İstemci tarafı filtreleme (anlık arama)
    const filtered = useMemo(() => {
        return articles.filter(a => {
            if (category !== 'all' && a.category !== category) return false;
            if (search) {
                const q = search.toLowerCase();
                const inTitle = a.title.toLowerCase().includes(q);
                const inTags = a.tags.some(t => t.toLowerCase().includes(q));
                if (!inTitle && !inTags) return false;
            }
            return true;
        });
    }, [articles, search, category]);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`"${title}" makalesini silmek istediğinizden emin misiniz?`)) return;
        const result = await deleteArticle(id);
        if (result.success) {
            addToast({ type: 'success', title: 'Silindi', message: 'Makale başarıyla kaldırıldı.' });
        } else {
            addToast({ type: 'error', title: 'Hata', message: result.error ?? 'Silinemedi.' });
        }
    };

    return (
        <div className="anim-fade-in-up">
            {/* ── Başlık ── */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h1 className="page-header__title"><BookOpen size={20} /> Bilgi Bankası</h1>
                    <p className="page-header__subtitle">
                        {loading ? 'Yükleniyor...' : `${articles.length} makale`}
                    </p>
                </div>
                {canManage && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                        <Plus size={14} /> Makale Ekle
                    </button>
                )}
            </div>

            {/* ── Filtreler ── */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    flex: 1, minWidth: 200,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)'
                }}>
                    <Search size={14} color="var(--text-tertiary)" />
                    <input
                        className="input"
                        style={{ border: 'none', background: 'none' }}
                        placeholder="Makale veya etiket ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="btn btn-ghost btn-xs" onClick={() => setSearch('')} style={{ padding: 2 }}>
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    {categories.map(c => (
                        <button
                            key={c}
                            className={`tab ${category === c ? 'tab--active' : ''}`}
                            onClick={() => setCategory(c)}
                        >
                            {c === 'all' ? 'Tümü' : c}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Yükleniyor ── */}
            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-tertiary)', padding: 'var(--space-8)' }}>
                    <Loader2 size={18} className="spin" /> Makaleler yükleniyor...
                </div>
            )}

            {/* ── Makale Kartları ── */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    {filtered.map(article => (
                        <div
                            key={article.id}
                            className="hud-card"
                            style={{ cursor: 'pointer', position: 'relative' }}
                            onClick={() => navigate(`/knowledge-base/${article.id}`)}
                        >
                            {/* Admin / Agent silme butonu */}
                            {canManage && (
                                <div
                                    style={{
                                        position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)',
                                        display: 'flex', gap: 'var(--space-1)', zIndex: 10
                                    }}
                                >
                                    <button
                                        className="btn-icon"
                                        style={{ color: 'var(--info)' }}
                                        onClick={e => { e.stopPropagation(); addToast({type: 'info', title: 'Bilgi', message: 'Makale düzenleme yakında eklenecek.'}); }}
                                        title="Makaleyi Düzenle"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        style={{ color: 'var(--error)' }}
                                        onClick={e => { e.stopPropagation(); handleDelete(article.id, article.title); }}
                                        title="Makaleyi Sil"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}

                            <span className="badge badge--theme" style={{ marginBottom: 'var(--space-3)' }}>
                                {article.category}
                            </span>
                            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', paddingRight: canManage ? 24 : 0 }}>
                                {article.title}
                            </h3>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                                Yazar: {article.author}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Eye size={12} /> {article.views}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ThumbsUp size={12} /> {article.helpful}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                                {article.tags.slice(0, 3).map(t => (
                                    <span key={t} className="badge badge--info">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state__title">Makale bulunamadı</div>
                    <p className="empty-state__subtitle">
                        {search ? `"${search}" için sonuç yok.` : 'Bu kategoride henüz makale eklenmemiş.'}
                    </p>
                </div>
            )}

            {/* ── Yeni Makale Modalı ── */}
            {showAddModal && (
                <AddArticleModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={refreshArticles}
                />
            )}
        </div>
    );
}
