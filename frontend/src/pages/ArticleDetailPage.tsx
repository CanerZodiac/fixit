import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import type { KBArticle } from '../types/common';
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { formatDate } from '../lib/helpers';

// ──────────────────────────────────────────────
// Basit markdown → HTML dönüştürücü
// ──────────────────────────────────────────────
function renderMarkdown(md: string): string {
    return md
        .replace(/\n/g, '<br/>')
        .replace(/## (.*)/g, '<h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.75rem;">$1</h2>')
        .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin:1rem 0 0.5rem;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
        .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:2px;font-family:var(--font-mono);font-size:0.8em;">$1</code>');
}

export default function ArticleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchArticle, markHelpful } = useArticles();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [article, setArticle] = useState<KBArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Oylamayı local state'de tutuyoruz (sayfa yenilenmeden anlık yansısın)
    const [voted, setVoted] = useState<'helpful' | 'not_helpful' | null>(null);
    const [helpfulCount, setHelpfulCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchArticle(id).then(data => {
            if (!data) {
                setNotFound(true);
            } else {
                setArticle(data);
                setHelpfulCount(data.helpful);
            }
            setLoading(false);
        });
    }, [id, fetchArticle]);

    const handleVote = async (type: 'helpful' | 'not_helpful') => {
        if (!id || voted) return;
        setVoted(type);
        await markHelpful(id, type);
        if (type === 'helpful') setHelpfulCount(c => c + 1);
        addToast({
            type: 'success',
            title: 'Geri bildiriminiz alındı',
            message: type === 'helpful' ? 'Bu makaleyi faydalı buldunuz.' : 'Geri bildiriminiz için teşekkürler.',
        });
    };

    // ── Yükleniyor ──
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-tertiary)', padding: 'var(--space-10)' }}>
                <Loader2 size={20} className="spin" /> Makale yükleniyor...
            </div>
        );
    }

    // ── Bulunamadı ──
    if (notFound || !article) {
        return (
            <div className="empty-state">
                <AlertCircle size={32} style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }} />
                <div className="empty-state__title">Makale bulunamadı</div>
                <p className="empty-state__subtitle">Bu makale silinmiş veya mevcut değil.</p>
                <button className="btn btn-secondary" onClick={() => navigate('/knowledge-base')}>
                    <ArrowLeft size={14} /> Bilgi Bankasına Dön
                </button>
            </div>
        );
    }

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 760 }}>
            <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/knowledge-base')}
                style={{ marginBottom: 'var(--space-4)' }}
            >
                <ArrowLeft size={14} /> Bilgi Bankası
            </button>

            <div className="hud-card hud-card--static">
                {/* ── Meta ── */}
                <span className="badge badge--theme" style={{ marginBottom: 'var(--space-3)' }}>
                    {article.category}
                </span>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    {article.title}
                </h1>

                <div style={{
                    display: 'flex', gap: 'var(--space-5)',
                    fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-6)',
                    borderBottom: '1px solid var(--border-primary)',
                    paddingBottom: 'var(--space-4)',
                    flexWrap: 'wrap'
                }}>
                    <span>Yazar: <strong style={{ color: 'var(--text-secondary)' }}>{article.author}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {formatDate(article.updatedAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> {article.views} görüntülenme
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={12} /> {helpfulCount} faydalı
                    </span>
                </div>

                {/* ── İçerik ── */}
                <div
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                />

                {/* ── Etiketler ── */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {article.tags.map(t => (
                        <span key={t} className="badge badge--info">{t}</span>
                    ))}
                </div>

                {/* ── Faydalı mı? ── */}
                <div style={{
                    marginTop: 'var(--space-8)',
                    padding: 'var(--space-5)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontWeight: 500 }}>
                        Bu makale faydalı oldu mu?
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                        <button
                            className={`btn btn-sm ${voted === 'helpful' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleVote('helpful')}
                            disabled={voted !== null}
                            style={{ gap: 'var(--space-2)' }}
                        >
                            <ThumbsUp size={14} />
                            {voted === 'helpful' ? 'Teşekkürler!' : 'Evet, faydalıydı'}
                        </button>
                        <button
                            className={`btn btn-sm ${voted === 'not_helpful' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => handleVote('not_helpful')}
                            disabled={voted !== null}
                            style={{ gap: 'var(--space-2)' }}
                        >
                            <ThumbsDown size={14} />
                            {voted === 'not_helpful' ? 'Geri bildirim alındı' : 'Hayır, faydalı değildi'}
                        </button>
                    </div>
                    {voted && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                            Geri bildiriminiz için teşekkür ederiz.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
