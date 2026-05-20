import { useParams, useNavigate } from 'react-router-dom';
import { mockArticles } from '../data/mock-articles';
import { ArrowLeft, Eye, ThumbsUp, Calendar } from 'lucide-react';
import { formatDate } from '../lib/helpers';

export default function ArticleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const article = mockArticles.find(a => a.id === id);

    if (!article) return <div className="empty-state"><div className="empty-state__title">Makale bulunamadı</div><button className="btn btn-secondary" onClick={() => navigate('/knowledge-base')}>Geri</button></div>;

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 760 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/knowledge-base')} style={{ marginBottom: 'var(--space-4)' }}>
                <ArrowLeft size={14} /> Bilgi Bankası
            </button>

            <div className="hud-card hud-card--static">
                <span className="badge badge--theme" style={{ marginBottom: 'var(--space-3)' }}>{article.category}</span>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>{article.title}</h1>

                <div style={{ display: 'flex', gap: 'var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-4)' }}>
                    <span>Yazar: <strong style={{ color: 'var(--text-secondary)' }}>{article.author}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(article.updatedAt)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {article.views} görüntülenme</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} /> {article.helpful} faydalı</span>
                </div>

                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>').replace(/## (.*)/g, '<h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.75rem;">$1</h2>').replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin:1rem 0 0.5rem;">$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>').replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:2px;font-family:var(--font-mono);font-size:0.8em;">$1</code>') }}
                />

                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {article.tags.map(t => <span key={t} className="badge badge--info">{t}</span>)}
                </div>
            </div>
        </div>
    );
}
