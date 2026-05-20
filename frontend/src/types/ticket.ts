export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketCategory = 'hardware' | 'software' | 'network' | 'access' | 'email' | 'security' | 'other';

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'agent' | 'employee';
    content: string;
    timestamp: string;
    isInternal: boolean;
}

export interface TicketEvent {
    id: string;
    ticketId: string;
    type: 'created' | 'assigned' | 'status_changed' | 'priority_changed' | 'message' | 'resolved' | 'reopened';
    description: string;
    userId: string;
    userName: string;
    timestamp: string;
    oldValue?: string;
    newValue?: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdBy: string;
    createdByName: string;
    assignedTo: string | null;
    assignedToName: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    slaDeadline: string;
    tags: string[];
    messages: TicketMessage[];
    events: TicketEvent[];
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
    closed: number;
    slaBreached: number;
    avgResolutionHours: number;
}

export interface TicketFilters {
    status?: TicketStatus | 'all';
    priority?: TicketPriority | 'all';
    category?: TicketCategory | 'all';
    assignedTo?: string | 'all';
    search?: string;
}
