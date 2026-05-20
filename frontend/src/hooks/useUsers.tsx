import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole, UserStatus } from '../types/user';
import { generateId } from '../lib/helpers';

const USERS_STORAGE_KEY = 'hud_registered_users';

interface UsersContextType {
    users: User[];
    addUser: (data: { name: string; email: string; password: string; role: UserRole; department: string; phone?: string; title?: string }) => { success: boolean; error?: string };
    updateUser: (id: string, updates: Partial<User>) => { success: boolean; error?: string };
    deleteUser: (id: string) => { success: boolean; error?: string };
    toggleStatus: (id: string, status: UserStatus) => void;
    refreshUsers: () => void;
}

function loadUsers(): User[] {
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
}

function persistUsers(users: User[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(loadUsers);

    const refreshUsers = useCallback(() => {
        setUsers(loadUsers());
    }, []);

    const addUser = useCallback((data: {
        name: string; email: string; password: string;
        role: UserRole; department: string; phone?: string; title?: string;
    }) => {
        const currentUsers = loadUsers();

        if (!data.name.trim()) return { success: false, error: 'Ad Soyad gereklidir.' };
        if (!data.email.trim()) return { success: false, error: 'E-posta gereklidir.' };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) return { success: false, error: 'Geçerli bir e-posta girin.' };
        if (currentUsers.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
            return { success: false, error: 'Bu e-posta zaten kayıtlı.' };
        }
        if (!data.password || data.password.length < 6) return { success: false, error: 'Şifre en az 6 karakter.' };

        const newUser: User = {
            id: `u${generateId()}`,
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            role: data.role,
            department: data.department,
            avatar: '',
            status: 'active',
            phone: data.phone || undefined,
            title: data.title || undefined,
            passwordHash: data.password,
            createdAt: new Date().toISOString(),
        };

        const updated = [...currentUsers, newUser];
        persistUsers(updated);
        setUsers(updated);
        return { success: true };
    }, []);

    const updateUser = useCallback((id: string, updates: Partial<User>) => {
        const currentUsers = loadUsers();
        const idx = currentUsers.findIndex(u => u.id === id);
        if (idx === -1) return { success: false, error: 'Kullanıcı bulunamadı.' };

        if (updates.email) {
            const emailExists = currentUsers.find(u => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase());
            if (emailExists) return { success: false, error: 'Bu e-posta başka bir kullanıcıya ait.' };
        }

        currentUsers[idx] = { ...currentUsers[idx], ...updates };
        persistUsers(currentUsers);
        setUsers([...currentUsers]);
        return { success: true };
    }, []);

    const deleteUser = useCallback((id: string) => {
        const currentUsers = loadUsers();
        const filtered = currentUsers.filter(u => u.id !== id);
        if (filtered.length === currentUsers.length) return { success: false, error: 'Kullanıcı bulunamadı.' };
        persistUsers(filtered);
        setUsers(filtered);
        return { success: true };
    }, []);

    const toggleStatus = useCallback((id: string, status: UserStatus) => {
        const currentUsers = loadUsers();
        const idx = currentUsers.findIndex(u => u.id === id);
        if (idx === -1) return;
        currentUsers[idx] = { ...currentUsers[idx], status };
        persistUsers(currentUsers);
        setUsers([...currentUsers]);
    }, []);

    return (
        <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, toggleStatus, refreshUsers }}>
            {children}
        </UsersContext.Provider>
    );
}

export function useUsers(): UsersContextType {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error('useUsers must be used within UsersProvider');
    return ctx;
}
