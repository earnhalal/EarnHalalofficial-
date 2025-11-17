// components/NotificationToast.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, CloseIcon, InfoIcon } from './icons';

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface NotificationToastProps {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InfoIcon className="w-6 h-6 text-blue-500" />,
};

const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
};

const NotificationToast: React.FC<NotificationToastProps> = ({ title, message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation to finish
    };
    
    useEffect(() => {
        const timer = setTimeout(handleClose, 7000); // Auto-dismiss after 7 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            className={`w-full max-w-sm p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all duration-300 ease-in-out ${bgColors[type]} ${isExiting ? 'animate-fade-out-right' : 'animate-fade-in-right'}`}
            role="alert"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <CloseIcon className="w-5 h-5" />
            </button>
            <style>{`
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
                
                @keyframes fade-out-right {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
                .animate-fade-out-right { animation: fade-out-right 0.3s ease-in forwards; }
            `}</style>
        </div>
    );
};

export default NotificationToast;
