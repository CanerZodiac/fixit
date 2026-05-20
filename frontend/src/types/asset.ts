export type AssetType = 'desktop' | 'laptop' | 'monitor' | 'printer' | 'phone' | 'tablet' | 'server' | 'network' | 'other';
export type AssetStatus = 'active' | 'maintenance' | 'retired' | 'lost';

export interface Asset {
    id: string;
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
