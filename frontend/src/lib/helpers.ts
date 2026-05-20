export function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return formatDate(dateStr);
}

export function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getSlaStatus(deadline: string): 'ok' | 'warning' | 'breached' {
    const now = new Date();
    const sla = new Date(deadline);
    const diffMs = sla.getTime() - now.getTime();
    const diffHours = diffMs / 3600000;

    if (diffHours < 0) return 'breached';
    if (diffHours < 2) return 'warning';
    return 'ok';
}

export function getSlaTimeRemaining(deadline: string): string {
    const now = new Date();
    const sla = new Date(deadline);
    const diffMs = sla.getTime() - now.getTime();

    if (diffMs < 0) {
        const overMs = Math.abs(diffMs);
        const hours = Math.floor(overMs / 3600000);
        const mins = Math.floor((overMs % 3600000) / 60000);
        return `-${hours}s ${mins}dk (İhlal)`;
    }

    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)} gün ${hours % 24}s`;
    return `${hours}s ${mins}dk kaldı`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function truncateText(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: unknown[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    }) as T;
}
