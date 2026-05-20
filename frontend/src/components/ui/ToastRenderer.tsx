import { useToast } from '../../hooks/useToast';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const iconMap = {
    success: <CheckCircle size={16} color="var(--success)" />,
    error: <XCircle size={16} color="var(--error)" />,
    warning: <AlertTriangle size={16} color="var(--warning)" />,
    info: <Info size={16} color="var(--info)" />,
};

export default function ToastRenderer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast--${toast.type}`}>
                    {iconMap[toast.type]}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{toast.title}</div>
                        {toast.message && (
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                                {toast.message}
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-icon"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Kapat"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
