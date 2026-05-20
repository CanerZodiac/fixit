import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../lib/constants';
import type { TicketPriority, TicketCategory } from '../types/ticket';
import { ArrowLeft, Send, Ticket, AlertCircle, Paperclip, Tag, X, FileText, Image, File } from 'lucide-react';
import { useToast } from '../hooks/useToast';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
    if (type.startsWith('image/')) return <Image size={14} />;
    if (type.includes('pdf') || type.includes('text') || type.includes('document')) return <FileText size={14} />;
    return <File size={14} />;
}

export default function CreateTicketPage() {
    const navigate = useNavigate();
    const { addTicket } = useTickets();
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const [form, setForm] = useState({ title: '', description: '', category: 'software' as TicketCategory, priority: 'medium' as TicketPriority });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const maxSize = 10 * 1024 * 1024; // 10 MB
        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > maxSize) {
                addToast({ title: 'Dosya çok büyük', message: `${file.name} 10 MB sınırını aşıyor.`, type: 'error' });
                continue;
            }
            if (attachments.length + newFiles.length >= 5) {
                addToast({ title: 'Dosya limiti', message: 'En fazla 5 dosya ekleyebilirsiniz.', type: 'error' });
                break;
            }
            newFiles.push(file);
        }
        if (newFiles.length > 0) {
            setAttachments(prev => [...prev, ...newFiles]);
            addToast({ title: 'Dosya eklendi', message: `${newFiles.length} dosya başarıyla eklendi.`, type: 'success' });
        }
    };

    const removeFile = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            addToast({ title: 'Hata', message: 'Başlık ve açıklama zorunludur.', type: 'error' });
            return;
        }
        const newTicket = await addTicket(form);
        if (attachments.length > 0) {
            addToast({ title: 'Dosyalar kaydedildi', message: `${attachments.length} dosya bilete eklendi.`, type: 'success' });
        }
        navigate(`/tickets/${newTicket.id}`);
    };

    return (
        <div className="anim-fade-in-up" style={{ maxWidth: 960, margin: '0 auto' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: 'var(--space-4)' }}>
                <ArrowLeft size={14} /> Geri
            </button>

            <div className="page-header">
                <div>
                    <h1 className="page-header__title"><Ticket size={20} /> Yeni Destek Bileti</h1>
                    <p className="page-header__subtitle">Sorununuzu detaylı açıklayarak hızlı çözüm alın</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)' }}>
                    {/* Ana Form */}
                    <div className="hud-card hud-card--static" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="title">Bilet Başlığı *</label>
                            <input id="title" className="input" placeholder="Sorunu kısa ve net açıklayın" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div className="input-group">
                                <label className="input-label" htmlFor="category">Kategori</label>
                                <select id="category" className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TicketCategory }))}>
                                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label" htmlFor="priority">Öncelik</label>
                                <select id="priority" className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}>
                                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="desc">Açıklama *</label>
                            <textarea id="desc" className="textarea" placeholder="Sorunu detaylı açıklayın. Hata mesajlarını, adımları ve beklenen davranışı belirtin." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 220 }} />
                        </div>

                        {/* Dosya Ekleme Alanı */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip,.rar"
                                style={{ display: 'none' }}
                                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: dragOver ? 'rgba(245, 158, 11, 0.06)' : 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: dragOver ? '2px dashed var(--theme-500)' : '1px dashed var(--border-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Paperclip size={18} color={dragOver ? 'var(--theme-500)' : 'var(--text-tertiary)'} />
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: dragOver ? 'var(--theme-500)' : 'var(--text-secondary)', fontWeight: 500 }}>
                                        {dragOver ? 'Dosyaları buraya bırakın' : 'Dosya eklemek için tıklayın veya sürükleyin'}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                        Maks. 5 dosya, her biri 10 MB. Resim, PDF, Office, Log dosyaları desteklenir.
                                    </div>
                                </div>
                            </div>

                            {/* Eklenen Dosya Listesi */}
                            {attachments.length > 0 && (
                                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {attachments.map((file, i) => (
                                        <div key={`${file.name}-${i}`} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                            padding: 'var(--space-2) var(--space-3)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-primary)',
                                        }}>
                                            <span style={{ color: 'var(--theme-500)', flexShrink: 0 }}>{getFileIcon(file.type)}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatFileSize(file.size)}</div>
                                            </div>
                                            <button type="button" onClick={() => removeFile(i)} style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-tertiary)', padding: 4, borderRadius: 'var(--radius-sm)',
                                                display: 'flex', alignItems: 'center',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/tickets')}>İptal</button>
                            <button type="submit" className="btn btn-primary btn-lg"><Send size={14} /> Bileti Oluştur</button>
                        </div>
                    </div>

                    {/* Yan Panel Bilgisi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {/* Gönderen */}
                        <div className="hud-card hud-card--static">
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>Gönderen</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div className="avatar avatar--sm">{currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}</div>
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{currentUser?.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{currentUser?.department}</div>
                                </div>
                            </div>
                        </div>

                        {/* Öncelik Bilgisi */}
                        <div className="hud-card hud-card--static">
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
                                <Tag size={12} style={{ marginRight: 4 }} /> Öncelik Rehberi
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                                    <div key={k} style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                        padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                                        background: form.priority === k ? 'var(--bg-hover)' : 'transparent',
                                        border: form.priority === k ? '1px solid var(--border-accent)' : '1px solid transparent',
                                        transition: 'all var(--duration-fast) var(--ease-out)',
                                    }}>
                                        <span className={`badge ${v.class}`} style={{ minWidth: 60, textAlign: 'center' }}>{v.label}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                            {k === 'critical' ? 'Sistem çökmesi' : k === 'high' ? 'İş durması' : k === 'medium' ? 'Normal sorun' : 'Bilgilendirme'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* İpuçları */}
                        <div className="hud-card hud-card--static">
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <AlertCircle size={12} /> İpuçları
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                                <div>• Hata mesajını aynen kopyalayın</div>
                                <div>• Sorunu yeniden üretme adımlarını belirtin</div>
                                <div>• Ekran görüntüsü ekleyin</div>
                                <div>• Beklenen ve gerçekleşen sonucu açıklayın</div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
