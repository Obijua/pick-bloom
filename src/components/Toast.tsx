import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, ToastType } from '../context/ToastContext';

const ToastItem: React.FC<{ 
    id: string; 
    message: string; 
    type: ToastType; 
    duration?: number;
    onClose: (id: string) => void;
}> = ({ id, message, type, duration = 3000, onClose }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch(type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch(type) {
            case 'success': return 'border-l-4 border-green-500';
            case 'error': return 'border-l-4 border-red-500';
            case 'warning': return 'border-l-4 border-yellow-500';
            default: return 'border-l-4 border-blue-500';
        }
    };

    return (
        <div className={`bg-white shadow-lg rounded-lg p-4 mb-3 flex items-start gap-3 w-80 transform transition-all animate-slide-in-right ${getStyles()}`}>
            <div className="flex-shrink-0 pt-0.5">
                {getIcon()}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{message}</p>
            </div>
            <button 
                onClick={() => onClose(id)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                {toasts.map(toast => (
                    <ToastItem 
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>
    );
};