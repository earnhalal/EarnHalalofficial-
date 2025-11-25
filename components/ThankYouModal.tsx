
import React from 'react';
import { CheckCircleIcon } from './icons';

interface ThankYouModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    subMessage?: string;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose, title = "THANK YOU!", message, subMessage }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center relative overflow-hidden animate-scale-up border border-amber-100 shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 z-0"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full -ml-12 -mb-12 z-0"></div>
                
                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-short border-4 border-white shadow-lg">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 mb-2 font-heading tracking-tight">{title}</h2>
                    <div className="h-1 w-12 bg-amber-500 mx-auto rounded-full mb-4"></div>
                    
                    <p className="text-lg font-bold text-gray-800 mb-2">{message}</p>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed px-2">{subMessage || "Your request has been processed successfully. Welcome to the elite circle."}</p>
                    
                    <button 
                        onClick={onClose} 
                        className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wide"
                    >
                        Continue
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes scale-up {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-short { animation: bounce-short 2s infinite; }
            `}</style>
        </div>
    );
};

export default ThankYouModal;
