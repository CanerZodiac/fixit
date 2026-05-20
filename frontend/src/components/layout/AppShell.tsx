import Sidebar from './Sidebar';
import Header from './Header';
import ToastRenderer from '../ui/ToastRenderer';
import type { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <div className="grid-overlay" />
            <Sidebar />
            <div style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left var(--duration-normal) var(--ease-out)',
                position: 'relative',
                zIndex: 1,
            }}>
                <Header />
                <main style={{
                    flex: 1,
                    padding: 'var(--space-6)',
                    overflowY: 'auto',
                }}>
                    {children}
                </main>
            </div>
            <ToastRenderer />
        </div>
    );
}
