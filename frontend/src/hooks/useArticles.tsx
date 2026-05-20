import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { KBArticle } from '../types/common';

// ──────────────────────────────────────────────
// Makale formu için veri tipi
// ──────────────────────────────────────────────
interface ArticleFormData {
    title: string;
    category: string;
    content: string;
    author: string;
    authorId?: string;
    tags: string[];
}

interface ArticlesContextType {
    articles: KBArticle[];
    loading: boolean;
    categories: string[];
    addArticle: (data: ArticleFormData) => Promise<{ success: boolean; error?: string }>;
    updateArticle: (id: string, data: Partial<ArticleFormData>) => Promise<{ success: boolean; error?: string }>;
    deleteArticle: (id: string) => Promise<{ success: boolean; error?: string }>;
    fetchArticle: (id: string) => Promise<KBArticle | null>;
    markHelpful: (id: string, type: 'helpful' | 'not_helpful') => Promise<void>;
    refreshArticles: () => Promise<void>;
}

const ArticlesContext = createContext<ArticlesContextType | null>(null);

// ──────────────────────────────────────────────
// Veritabanı yanıtını frontend tipine çevirir
// (API artık camelCase döndürüyor; tags ise zaten array)
// ──────────────────────────────────────────────
function mapArticle(raw: Record<string, unknown>): KBArticle {
    return {
        id: raw.id as string,
        title: raw.title as string,
        category: raw.category as string,
        content: raw.content as string,
        author: raw.author as string,
        createdAt: (raw.createdAt ?? raw.created_at ?? '') as string,
        updatedAt: (raw.updatedAt ?? raw.updated_at ?? '') as string,
        views: Number(raw.views ?? 0),
        helpful: Number(raw.helpful ?? 0),
        tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    };
}

export function ArticlesProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<KBArticle[]>([]);
    const [loading, setLoading] = useState(true);

    // Kategorileri dinamik olarak üret
    const categories = ['all', ...Array.from(new Set(articles.map(a => a.category))).sort()];

    const refreshArticles = useCallback(async () => {
        try {
            const res = await fetch('/api/articles');
            if (res.ok) {
                const data = await res.json() as Record<string, unknown>[];
                setArticles(data.map(mapArticle));
            }
        } catch (e) {
            console.error('Makaleler yüklenemedi', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshArticles();
    }, [refreshArticles]);

    // ──────────────────────────────────────────────
    // Tek makale getir (ArticleDetailPage için)
    // ──────────────────────────────────────────────
    const fetchArticle = useCallback(async (id: string): Promise<KBArticle | null> => {
        try {
            const res = await fetch(`/api/articles/${id}`);
            if (!res.ok) return null;
            const data = await res.json() as Record<string, unknown>;
            return mapArticle(data);
        } catch {
            return null;
        }
    }, []);

    // ──────────────────────────────────────────────
    // Makale ekle
    // ──────────────────────────────────────────────
    const addArticle = useCallback(async (data: ArticleFormData): Promise<{ success: boolean; error?: string }> => {
        if (!data.title.trim()) return { success: false, error: 'Başlık zorunludur.' };
        if (!data.category.trim()) return { success: false, error: 'Kategori zorunludur.' };
        if (!data.content.trim()) return { success: false, error: 'İçerik zorunludur.' };

        try {
            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                await refreshArticles();
                return { success: true };
            }
            return { success: false, error: result.error || 'Ekleme başarısız.' };
        } catch {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshArticles]);

    // ──────────────────────────────────────────────
    // Makale güncelle
    // ──────────────────────────────────────────────
    const updateArticle = useCallback(async (id: string, data: Partial<ArticleFormData>): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await refreshArticles();
                return { success: true };
            }
            const result = await res.json();
            return { success: false, error: result.error || 'Güncelleme başarısız.' };
        } catch {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshArticles]);

    // ──────────────────────────────────────────────
    // Makale sil
    // ──────────────────────────────────────────────
    const deleteArticle = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshArticles();
                return { success: true };
            }
            const result = await res.json();
            return { success: false, error: result.error || 'Silme başarısız.' };
        } catch {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshArticles]);

    // ──────────────────────────────────────────────
    // Faydalı oyla
    // ──────────────────────────────────────────────
    const markHelpful = useCallback(async (id: string, type: 'helpful' | 'not_helpful'): Promise<void> => {
        try {
            await fetch(`/api/articles/${id}/helpful`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });
        } catch {
            // sessizce başarısız
        }
    }, []);

    return (
        <ArticlesContext.Provider value={{
            articles, loading, categories,
            addArticle, updateArticle, deleteArticle,
            fetchArticle, markHelpful, refreshArticles,
        }}>
            {children}
        </ArticlesContext.Provider>
    );
}

export function useArticles(): ArticlesContextType {
    const ctx = useContext(ArticlesContext);
    if (!ctx) throw new Error('useArticles must be used within ArticlesProvider');
    return ctx;
}
