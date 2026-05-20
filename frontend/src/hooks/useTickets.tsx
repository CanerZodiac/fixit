import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Ticket, TicketPriority, TicketCategory, TicketStatus, TicketMessage, TicketEvent } from '../types/ticket';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { mockTickets } from '../data/mock-tickets';

async function triggerMail(ticket: Ticket, action: string, actionBy: string, recipientEmail: string, recipientName: string) {
    try {
        await fetch('http://localhost:3001/api/mail/ticket-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientEmail, recipientName, ticketId: ticket.id, ticketTitle: ticket.title, action, actionBy })
        });
    } catch (e) {
        console.error('Mail gönderim hatası:', e);
    }
}

interface TicketContextType {
    tickets: Ticket[];
    loading: boolean;
    refreshTickets: () => Promise<void>;
    addTicket: (data: { title: string; description: string; category: TicketCategory; priority: TicketPriority }) => Promise<Ticket>;
    updateTicketStatus: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
    assignTicket: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
    addMessage: (ticketId: string, content: string, isInternal?: boolean) => Promise<void>;
    updateTicketPriority: (ticketId: string, newPriority: TicketPriority) => Promise<void>;
    getTicketById: (id: string) => Ticket | undefined;
}

const TicketContext = createContext<TicketContextType | null>(null);

const STORAGE_KEY = 'fixit_tickets';
const DATA_VERSION = 'tickets_v2';

function loadTickets(): Ticket[] {
    const ver = localStorage.getItem('tickets_data_version');
    if (ver !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem('tickets_data_version', DATA_VERSION);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTickets));
    return [...mockTickets];
}

function saveTickets(tickets: Ticket[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function TicketProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const refreshTickets = useCallback(async () => {
        setTickets(loadTickets());
        setLoading(false);
    }, []);

    useEffect(() => { refreshTickets(); }, [refreshTickets]);

    const addTicket = useCallback(async (data: { title: string; description: string; category: TicketCategory; priority: TicketPriority }): Promise<Ticket> => {
        const current = loadTickets();
        const maxNum = current.reduce((max, t) => {
            const n = parseInt(t.id.replace('TKT-', ''), 10);
            return n > max ? n : max;
        }, 1000);
        const id = `TKT-${maxNum + 1}`;
        const now = new Date().toISOString();
        const slaHours: Record<string, number> = { critical: 4, high: 8, medium: 24, low: 48 };
        const slaDeadline = new Date(Date.now() + (slaHours[data.priority] ?? 24) * 3600000).toISOString();

        const ticket: Ticket = {
            id,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: 'open',
            createdBy: currentUser?.id ?? '',
            createdByName: currentUser?.name ?? '',
            assignedTo: null,
            assignedToName: null,
            createdAt: now,
            updatedAt: now,
            resolvedAt: null,
            slaDeadline,
            tags: [],
            messages: [],
            events: [{
                id: `e-${Date.now()}`,
                ticketId: id,
                type: 'created',
                description: 'Bilet oluşturuldu',
                userId: currentUser?.id ?? '',
                userName: currentUser?.name ?? '',
                timestamp: now,
            }],
        };

        const updated = [ticket, ...current];
        saveTickets(updated);
        setTickets(updated);
        
        // Yeni bilet oluşturulunca sisteme (FixIT admin hesabına) mail düşsün
        triggerMail(ticket, 'created', currentUser?.name ?? 'Sistem', 'admin@fixit.com', 'Sistem Yöneticisi');
        
        addToast({ title: 'Bilet oluşturuldu', message: `${ticket.id} başarıyla kaydedildi.`, type: 'success' });
        return ticket;
    }, [currentUser, addToast]);

    const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
        const current = loadTickets();
        const now = new Date().toISOString();
        const updated = current.map(t => {
            if (t.id !== ticketId) return t;
            const oldStatus = t.status;
            const desc = newStatus === 'resolved' ? 'Bilet çözüldü' : newStatus === 'closed' ? 'Bilet kapatıldı' : 'Durum değişti';
            const event: TicketEvent = {
                id: `e-${Date.now()}`,
                ticketId,
                type: newStatus === 'resolved' ? 'resolved' : 'status_changed',
                description: desc,
                userId: currentUser?.id ?? '',
                userName: currentUser?.name ?? '',
                timestamp: now,
                oldValue: oldStatus,
                newValue: newStatus,
            };
            return {
                ...t,
                status: newStatus,
                updatedAt: now,
                resolvedAt: (newStatus === 'resolved' || newStatus === 'closed') ? now : t.resolvedAt,
                events: [...t.events, event],
            };
        });
        saveTickets(updated);
        setTickets(updated);
        
        // Bilet durumu değişince, bileti açan çalışana (createdBy) mail gitsin
        try {
            const usersStr = localStorage.getItem('hud_registered_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                const creator = users.find((u: any) => u.id === current.find(t => t.id === ticketId)?.createdBy);
                if (creator && creator.email) {
                    const ticketRef = updated.find(t => t.id === ticketId);
                    if (ticketRef) triggerMail(ticketRef, newStatus, currentUser?.name ?? 'Sistem', creator.email, creator.name);
                }
            }
        } catch(e) {}
        
        const statusLabels: Record<TicketStatus, string> = { open: 'Açık', in_progress: 'Devam Ediyor', waiting: 'Beklemede', resolved: 'Çözüldü', closed: 'Kapalı' };
        addToast({ title: 'Durum güncellendi', message: `${ticketId} → ${statusLabels[newStatus]}`, type: 'success' });
    }, [currentUser, addToast]);

    const updateTicketPriority = useCallback(async (ticketId: string, newPriority: TicketPriority) => {
        const current = loadTickets();
        const now = new Date().toISOString();
        const updated = current.map(t => {
            if (t.id !== ticketId) return t;
            const event: TicketEvent = {
                id: `e-${Date.now()}`,
                ticketId,
                type: 'priority_changed' as any,
                description: 'Öncelik değiştirildi',
                userId: currentUser?.id ?? '',
                userName: currentUser?.name ?? '',
                timestamp: now,
                oldValue: t.priority,
                newValue: newPriority,
            };
            return {
                ...t,
                priority: newPriority,
                updatedAt: now,
                events: [...t.events, event],
            };
        });
        saveTickets(updated);
        setTickets(updated);
        
        const priorityLabels: Record<TicketPriority, string> = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
        addToast({ title: 'Öncelik güncellendi', message: `${ticketId} → ${priorityLabels[newPriority]}`, type: 'success' });
    }, [currentUser, addToast]);

    const assignTicket = useCallback(async (ticketId: string, agentId: string, agentName: string) => {
        const current = loadTickets();
        const now = new Date().toISOString();
        const updated = current.map(t => {
            if (t.id !== ticketId) return t;
            const event: TicketEvent = {
                id: `e-${Date.now()}`,
                ticketId,
                type: 'assigned',
                description: `${agentName}'e atandı`,
                userId: currentUser?.id ?? '',
                userName: currentUser?.name ?? '',
                timestamp: now,
            };
            return { ...t, assignedTo: agentId, assignedToName: agentName, updatedAt: now, events: [...t.events, event] };
        });
        saveTickets(updated);
        setTickets(updated);
        
        // Bilet bir uzmana atandığında o uzmana (agent) mail gitsin
        try {
            const usersStr = localStorage.getItem('hud_registered_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                const agent = users.find((u: any) => u.id === agentId);
                if (agent && agent.email) {
                    const ticketRef = updated.find(t => t.id === ticketId);
                    if (ticketRef) triggerMail(ticketRef, 'assigned', currentUser?.name ?? 'Sistem', agent.email, agent.name);
                }
            }
        } catch(e) {}
        
        addToast({ title: 'Atama güncellendi', message: `${ticketId} → ${agentName}`, type: 'success' });
    }, [currentUser, addToast]);

    const addMessage = useCallback(async (ticketId: string, content: string, isInternal = false) => {
        const current = loadTickets();
        const now = new Date().toISOString();
        const msg: TicketMessage = {
            id: `m-${Date.now()}`,
            ticketId,
            senderId: currentUser?.id ?? '',
            senderName: currentUser?.name ?? '',
            senderRole: (currentUser?.role ?? 'employee') as TicketMessage['senderRole'],
            content,
            timestamp: now,
            isInternal,
        };
        const updated = current.map(t => {
            if (t.id !== ticketId) return t;
            return { ...t, messages: [...t.messages, msg], updatedAt: now };
        });
        saveTickets(updated);
        setTickets(updated);
    }, [currentUser]);

    const getTicketById = useCallback((id: string) => tickets.find(t => t.id === id), [tickets]);

    return (
        <TicketContext.Provider value={{ tickets, loading, refreshTickets, addTicket, updateTicketStatus, assignTicket, addMessage, updateTicketPriority, getTicketById }}>
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets(): TicketContextType {
    const ctx = useContext(TicketContext);
    if (!ctx) throw new Error('useTickets must be used within TicketProvider');
    return ctx;
}
