import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket';

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; class: string }> = {
    critical: { label: 'Kritik', color: '#EF4444', class: 'badge--critical' },
    high: { label: 'Yüksek', color: '#F97316', class: 'badge--high' },
    medium: { label: 'Orta', color: '#FBBF24', class: 'badge--medium' },
    low: { label: 'Düşük', color: '#22C55E', class: 'badge--low' },
};

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
    open: { label: 'Açık', color: '#3B82F6' },
    in_progress: { label: 'Devam Ediyor', color: '#F59E0B' },
    waiting: { label: 'Beklemede', color: '#A855F7' },
    resolved: { label: 'Çözüldü', color: '#22C55E' },
    closed: { label: 'Kapalı', color: '#6B7280' },
};

export const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: string }> = {
    hardware: { label: 'Donanım', icon: 'Monitor' },
    software: { label: 'Yazılım', icon: 'Code' },
    network: { label: 'Ağ / İnternet', icon: 'Wifi' },
    access: { label: 'Erişim / Yetki', icon: 'Key' },
    email: { label: 'E-posta', icon: 'Mail' },
    security: { label: 'Güvenlik', icon: 'Shield' },
    other: { label: 'Diğer', icon: 'HelpCircle' },
};

export const SLA_DEFAULTS = {
    critical: { responseHours: 1, resolutionHours: 4 },
    high: { responseHours: 4, resolutionHours: 8 },
    medium: { responseHours: 8, resolutionHours: 24 },
    low: { responseHours: 24, resolutionHours: 72 },
};

export const DEPARTMENTS = [
    'Bilgi Teknolojileri',
    'İnsan Kaynakları',
    'Finans',
    'Pazarlama',
    'Satış',
    'Operasyon',
    'Hukuk',
    'Yönetim',
];

export const STORAGE_KEYS = {
    AUTH: 'hud_auth',
    TICKETS: 'hud_tickets',
    USERS: 'hud_users',
    ASSETS: 'hud_assets',
    ARTICLES: 'hud_articles',
    SETTINGS: 'hud_settings',
    THEME: 'hud_theme',
};
