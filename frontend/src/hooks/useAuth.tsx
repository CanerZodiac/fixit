import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole, AuthState } from '../types/user';
import { generateId } from '../lib/helpers';

interface LoginResult { success: boolean; error?: string; needsVerification?: boolean; userId?: string }
interface RegisterResult { success: boolean; error?: string; userId?: string }

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (data: { name: string; email: string; password: string; department: string }) => Promise<RegisterResult>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    currentUser: User | null;
}

const STORAGE_KEY = 'hud_auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // JWT Token check would go here ideally to pre-fetch `/api/auth/me`
                return { user: parsed.user, isAuthenticated: true };
            }
        } catch { /* ignore */ }
        return { user: null, isAuthenticated: false };
    });

    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (data.needsVerification) {
                return { success: false, error: 'E-posta doğrulaması gerekiyor.', needsVerification: true, userId: data.userId };
            }
            if (!res.ok) {
                return { success: false, error: data.error || 'Giriş başarısız.' };
            }

            // Save token
            localStorage.setItem('hud_token', data.token);
            const user: User = data.user;
            
            const state = { user, isAuthenticated: true };
            setAuthState(state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Sunucuya bağlanılamadı.' };
        }
    }, []);

    const register = useCallback(async (data: { name: string; email: string; password: string; department: string }): Promise<RegisterResult> => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (!res.ok) {
                return { success: false, error: result.error || 'Kayıt başarısız.' };
            }
            
            return { success: true, userId: result.userId };
        } catch (e) {
            return { success: false, error: 'Sunucuya bağlanılamadı.' };
        }
    }, []);

    const logout = useCallback(() => {
        setAuthState({ user: null, isAuthenticated: false });
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('hud_token');
    }, []);

    const updateProfile = useCallback((updates: Partial<User>) => {
        // Mock profile update for now
        setAuthState(prev => {
            if (!prev.user) return prev;
            const updatedUser = { ...prev.user, ...updates };
            const state = { user: updatedUser, isAuthenticated: true };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return state;
        });
    }, []);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        // Needs a new endpoint to change password securely with active JWT
        return { success: false, error: 'Bu aşama devsecops tarafından henüz sisteme eklenmedi.' };
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            currentUser: authState.user,
            login,
            register,
            logout,
            updateProfile,
            changePassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
