export interface KBArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    helpful: number;
    tags: string[];
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isBot: boolean;
}

export interface ChatSession {
    id: string;
    userId: string;
    userName: string;
    status: 'active' | 'closed';
    startedAt: string;
    endedAt?: string;
    messages: ChatMessage[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    timestamp: string;
    link?: string;
}

export interface SLARule {
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    responseTimeHours: number;
    resolutionTimeHours: number;
}

export interface ActivityItem {
    id: string;
    type: 'ticket_created' | 'ticket_resolved' | 'ticket_assigned' | 'message_sent' | 'article_published' | 'user_created';
    description: string;
    userId: string;
    userName: string;
    timestamp: string;
    relatedId?: string;
}
