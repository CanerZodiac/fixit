export type UserRole = 'admin' | 'agent' | 'employee';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    avatar: string;
    status: UserStatus;
    phone?: string;
    title?: string;
    bio?: string;
    timezone?: string;
    language?: string;
    passwordHash?: string;
    createdAt: string;
    lastLogin?: string;
    ticketsClosed?: number;
    avgResponseMinutes?: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}
