import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole, UserStatus } from '../types/user';

interface UsersContextType {
    users: User[];
    loading: boolean;
    addUser: (data: { name: string; email: string; password: string; role: UserRole; department: string; phone?: string; title?: string }) => Promise<{ success: boolean; error?: string }>;
    updateUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
    toggleStatus: (id: string, status: UserStatus) => Promise<void>;
    refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error('Failed to fetch users', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    const addUser = useCallback(async (data: {
        name: string; email: string; password: string;
        role: UserRole; department: string; phone?: string; title?: string;
    }) => {
        if (!data.name.trim()) return { success: false, error: 'Ad Soyad gereklidir.' };
        if (!data.email.trim()) return { success: false, error: 'E-posta gereklidir.' };
        if (!data.password || data.password.length < 6) return { success: false, error: 'Şifre en az 6 karakter.' };

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.success) {
                await refreshUsers();
                return { success: true };
            }
            return { success: false, error: result.error || 'Kayıt başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshUsers]);

    const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updates, passwordHash: updates.passwordHash || undefined })
            });
            if (res.ok) {
                await refreshUsers();
                return { success: true };
            }
            const data = await res.json();
            return { success: false, error: data.error || 'Güncelleme başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshUsers]);

    const deleteUser = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshUsers();
                return { success: true };
            }
            const data = await res.json();
            return { success: false, error: data.error || 'Silme başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshUsers]);

    const toggleStatus = useCallback(async (id: string, status: UserStatus) => {
        try {
            const res = await fetch(`/api/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                await refreshUsers();
            }
        } catch (e) {
            console.error('Status update failed', e);
        }
    }, [refreshUsers]);

    return (
        <UsersContext.Provider value={{ users, loading, addUser, updateUser, deleteUser, toggleStatus, refreshUsers }}>
            {children}
        </UsersContext.Provider>
    );
}

export function useUsers(): UsersContextType {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error('useUsers must be used within UsersProvider');
    return ctx;
}
