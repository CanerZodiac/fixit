import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Ticket, TicketPriority, TicketCategory, TicketStatus, TicketMessage, TicketEvent } from '../types/ticket';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { mockTickets } from '../data/mock-tickets';

async function triggerMail(ticket: Ticket, action: string, actionBy: string, recipientEmail: string, recipientName: string) {
    try {
        await fetch('/api/mail/ticket-notification', {
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

export function TicketProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const refreshTickets = useCallback(async () => {
        try {
            const res = await fetch('/api/tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (e) {
            console.error('Biletler yüklenemedi:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshTickets();
    }, [refreshTickets]);

    const addTicket = useCallback(async (data: { title: string; description: string; category: TicketCategory; priority: TicketPriority }): Promise<Ticket> => {
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, createdBy: currentUser?.id, createdByName: currentUser?.name })
            });
            const result = await res.json();
            
            if (res.ok && result.success) {
                await refreshTickets();
                const newTicket = tickets.find(t => t.id === result.id) || { id: result.id, title: data.title } as Ticket;
                triggerMail(newTicket, 'created', currentUser?.name ?? 'Sistem', 'admin@fixit.com', 'Sistem Yöneticisi');
                addToast({ title: 'Bilet oluşturuldu', message: `${result.id} başarıyla kaydedildi.`, type: 'success' });
                return newTicket;
            }
            throw new Error('Oluşturulamadı');
        } catch (e) {
            addToast({ title: 'Hata', message: 'Bilet oluşturulamadı.', type: 'error' });
            throw e;
        }
    }, [currentUser, addToast, refreshTickets, tickets]);

    const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                await refreshTickets();
                const statusLabels: Record<TicketStatus, string> = { open: 'Açık', in_progress: 'Devam Ediyor', waiting: 'Beklemede', resolved: 'Çözüldü', closed: 'Kapalı' };
                addToast({ title: 'Durum güncellendi', message: `${ticketId} → ${statusLabels[newStatus]}`, type: 'success' });
            }
        } catch (e) {
            addToast({ title: 'Hata', message: 'Durum güncellenemedi.', type: 'error' });
        }
    }, [addToast, refreshTickets]);

    const updateTicketPriority = useCallback(async (ticketId: string, newPriority: TicketPriority) => {
        // Backend'de priority update endpoint'i eksikti ama genel update içinde yapılabilir veya status ile aynı mantıkta.
        // Şimdilik sadece frontend update gibi davranalım, backend endpoint ekleyeceğiz.
        try {
            const res = await fetch(`/api/tickets/${ticketId}/priority`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority })
            });
            if (res.ok) {
                await refreshTickets();
                const priorityLabels: Record<TicketPriority, string> = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
                addToast({ title: 'Öncelik güncellendi', message: `${ticketId} → ${priorityLabels[newPriority]}`, type: 'success' });
            }
        } catch (e) {
            console.error(e);
        }
    }, [addToast, refreshTickets]);

    const assignTicket = useCallback(async (ticketId: string, agentId: string, agentName: string) => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, agentName })
            });
            if (res.ok) {
                await refreshTickets();
                addToast({ title: 'Atama güncellendi', message: `${ticketId} → ${agentName}`, type: 'success' });
            }
        } catch (e) {
            addToast({ title: 'Hata', message: 'Atama güncellenemedi.', type: 'error' });
        }
    }, [addToast, refreshTickets]);

    const addMessage = useCallback(async (ticketId: string, content: string, isInternal = false) => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUser?.id,
                    senderName: currentUser?.name,
                    senderRole: currentUser?.role,
                    content,
                    isInternal
                })
            });
            if (res.ok) {
                await refreshTickets();
            }
        } catch (e) {
            console.error('Mesaj eklenemedi:', e);
        }
    }, [currentUser, refreshTickets]);

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
