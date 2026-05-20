import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockArticles } from '../data/mock-articles';
import { BookOpen, Search, Eye, ThumbsUp } from 'lucide-react';

export default function KnowledgeBasePage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const categories = ['all', ...new Set(mockArticles.map(a => a.category))];
    const filtered = mockArticles.filter(a => {
        if (category !== 'all' && a.category !== category) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(t => t.includes(search.toLowerCase()))) return false;
        return true;
    });

    return (
        <div className="anim-fade-in-up">
            <div className="page-header">
                <h1 className="page-header__title"><BookOpen size={20} /> Bilgi Bankası</h1>
                <p className="page-header__subtitle">{mockArticles.length} makale</p>
            </div>

            {/* Filtreler */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)' }}>
                    <Search size={14} color="var(--text-tertiary)" />
                    <input className="input" style={{ border: 'none', background: 'none' }} placeholder="Makale veya etiket ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    {categories.map(c => (
                        <button key={c} className={`tab ${category === c ? 'tab--active' : ''}`} onClick={() => setCategory(c)}>
                            {c === 'all' ? 'Tümü' : c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Makale Kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                {filtered.map(article => (
                    <div key={article.id} className="hud-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/knowledge-base/${article.id}`)}>
                        <span className="badge badge--theme" style={{ marginBottom: 'var(--space-3)' }}>{article.category}</span>
                        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{article.title}</h3>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>Yazar: {article.author}</p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {article.views}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} /> {article.helpful}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                            {article.tags.slice(0, 3).map(t => <span key={t} className="badge badge--info">{t}</span>)}
                        </div>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && <div className="empty-state"><div className="empty-state__title">Makale bulunamadı</div></div>}
        </div>
    );
}
