import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Asset, AssetType, AssetStatus } from '../types/asset';

interface AssetFormData {
    name: string;
    type: AssetType;
    brand: string;
    model: string;
    serialNumber: string;
    status: AssetStatus;
    assignedTo: string | null;
    assignedToName: string | null;
    department: string;
    location: string;
    purchaseDate: string;
    warrantyExpiry: string;
    notes?: string;
}

interface AssetsContextType {
    assets: Asset[];
    loading: boolean;
    addAsset: (data: AssetFormData) => Promise<{ success: boolean; error?: string }>;
    updateAsset: (id: string, data: Partial<AssetFormData>) => Promise<{ success: boolean; error?: string }>;
    deleteAsset: (id: string) => Promise<{ success: boolean; error?: string }>;
    refreshAssets: () => Promise<void>;
}

const AssetsContext = createContext<AssetsContextType | null>(null);

export function AssetsProvider({ children }: { children: ReactNode }) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshAssets = useCallback(async () => {
        try {
            const res = await fetch('/api/assets');
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (e) {
            console.error('Failed to fetch assets', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAssets();
    }, [refreshAssets]);

    const addAsset = useCallback(async (data: AssetFormData): Promise<{ success: boolean; error?: string }> => {
        if (!data.name.trim()) return { success: false, error: 'Cihaz adı zorunludur.' };
        if (!data.brand.trim()) return { success: false, error: 'Marka zorunludur.' };
        if (!data.serialNumber.trim()) return { success: false, error: 'Seri numarası zorunludur.' };

        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.success) {
                await refreshAssets();
                return { success: true };
            }
            return { success: false, error: result.error || 'Ekleme başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshAssets]);

    const updateAsset = useCallback(async (id: string, data: Partial<AssetFormData>): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                await refreshAssets();
                return { success: true };
            }
            const result = await res.json();
            return { success: false, error: result.error || 'Güncelleme başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshAssets]);

    const deleteAsset = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshAssets();
                return { success: true };
            }
            const result = await res.json();
            return { success: false, error: result.error || 'Silme başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucu hatası.' };
        }
    }, [refreshAssets]);

    return (
        <AssetsContext.Provider value={{ assets, loading, addAsset, updateAsset, deleteAsset, refreshAssets }}>
            {children}
        </AssetsContext.Provider>
    );
}

export function useAssets(): AssetsContextType {
    const ctx = useContext(AssetsContext);
    if (!ctx) throw new Error('useAssets must be used within AssetsProvider');
    return ctx;
}
