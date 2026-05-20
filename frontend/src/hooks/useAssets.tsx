import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Asset, AssetType, AssetStatus } from '../types/asset';
import { mockAssets } from '../data/mock-assets';
import { generateId } from '../lib/helpers';

const ASSETS_STORAGE_KEY = 'hud_assets';
const ASSETS_DATA_VERSION = '1';
const ASSETS_VERSION_KEY = 'hud_assets_version';

function loadAssets(): Asset[] {
    try {
        const version = localStorage.getItem(ASSETS_VERSION_KEY);
        const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
        if (stored && version === ASSETS_DATA_VERSION) {
            return JSON.parse(stored);
        }
    } catch { /* ignore */ }
    // ilk yükleme: mock data
    const initial = [...mockAssets];
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(initial));
    localStorage.setItem(ASSETS_VERSION_KEY, ASSETS_DATA_VERSION);
    return initial;
}

function persistAssets(assets: Asset[]) {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
}

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
    addAsset: (data: AssetFormData) => { success: boolean; error?: string };
    updateAsset: (id: string, data: Partial<AssetFormData>) => { success: boolean; error?: string };
    deleteAsset: (id: string) => { success: boolean; error?: string };
    refreshAssets: () => void;
}

const AssetsContext = createContext<AssetsContextType | null>(null);

export function AssetsProvider({ children }: { children: ReactNode }) {
    const [assets, setAssets] = useState<Asset[]>(loadAssets);

    const refreshAssets = useCallback(() => {
        setAssets(loadAssets());
    }, []);

    const addAsset = useCallback((data: AssetFormData): { success: boolean; error?: string } => {
        if (!data.name.trim()) return { success: false, error: 'Cihaz adı zorunludur.' };
        if (!data.brand.trim()) return { success: false, error: 'Marka zorunludur.' };
        if (!data.serialNumber.trim()) return { success: false, error: 'Seri numarası zorunludur.' };

        const current = loadAssets();
        const duplicate = current.find(a => a.serialNumber.toLowerCase() === data.serialNumber.trim().toLowerCase());
        if (duplicate) return { success: false, error: 'Bu seri numarası zaten kayıtlı.' };

        const newAsset: Asset = {
            id: `a${generateId()}`,
            name: data.name.trim(),
            type: data.type,
            brand: data.brand.trim(),
            model: data.model.trim(),
            serialNumber: data.serialNumber.trim(),
            status: data.status,
            assignedTo: data.assignedTo,
            assignedToName: data.assignedToName,
            department: data.department,
            location: data.location,
            purchaseDate: data.purchaseDate,
            warrantyExpiry: data.warrantyExpiry,
            notes: data.notes,
        };

        const updated = [...current, newAsset];
        persistAssets(updated);
        setAssets(updated);
        return { success: true };
    }, []);

    const updateAsset = useCallback((id: string, data: Partial<AssetFormData>): { success: boolean; error?: string } => {
        const current = loadAssets();
        const idx = current.findIndex(a => a.id === id);
        if (idx === -1) return { success: false, error: 'Varlık bulunamadı.' };

        if (data.serialNumber) {
            const duplicate = current.find(a => a.id !== id && a.serialNumber.toLowerCase() === data.serialNumber!.toLowerCase());
            if (duplicate) return { success: false, error: 'Bu seri numarası başka bir cihaza ait.' };
        }

        current[idx] = { ...current[idx], ...data };
        persistAssets(current);
        setAssets([...current]);
        return { success: true };
    }, []);

    const deleteAsset = useCallback((id: string): { success: boolean; error?: string } => {
        const current = loadAssets();
        const filtered = current.filter(a => a.id !== id);
        if (filtered.length === current.length) return { success: false, error: 'Varlık bulunamadı.' };
        persistAssets(filtered);
        setAssets(filtered);
        return { success: true };
    }, []);

    return (
        <AssetsContext.Provider value={{ assets, addAsset, updateAsset, deleteAsset, refreshAssets }}>
            {children}
        </AssetsContext.Provider>
    );
}

export function useAssets(): AssetsContextType {
    const ctx = useContext(AssetsContext);
    if (!ctx) throw new Error('useAssets must be used within AssetsProvider');
    return ctx;
}
