// components/WhatsNewModal.tsx
import React from 'react';
import { SparklesIcon, TagIcon, ArrowUpCircleIcon } from './icons';

interface WhatsNewModalProps {
    onClose: () => void;
}

const updates = [
    {
        version: '1.2.0',
        date: 'August 2024',
        title: 'Immersive Aviator Game!',
        description: 'The Aviator game has been completely revamped with thrilling sounds, new animations, and a live betting feel. Test your nerves and cash out!',
        type: 'New Feature',
        icon: <TagIcon className="w-5 h-5" />,
        color: 'text-blue-400'
    },
    {
        version: '1.1.5',
        date: 'July 2024',
        title: 'Ludo & Lottery Games Live',
        description: 'Challenge players in Ludo Star or try your luck in the Daily Lottery. More ways to Play & Earn are now available for everyone.',
        type: 'New Feature',
        icon: <TagIcon className="w-5 h-5" />,
        color: 'text-blue-400'
    },
    {
        version: '1.1.0',
        date: 'July 2024',
        title: 'AI Support Chatbot',
        description: `Meet our new AI Support Agent! Get instant answers to your questions about tasks, withdrawals, and more, 24/7. Just click the chat icon!`,
        type: 'Improvement',
        icon: <ArrowUpCircleIcon className="w-5 h-5" />,
        color: 'text-green-400'
    },
];

const UpdateItem: React.FC<(typeof updates)[0]> = ({ title, description, type, icon, color }) => (
    <div className="relative pl-8">
        <div className={`absolute left-0 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 ${color}`}>
            {React.cloneElement(icon, { className: "w-4 h-4 text-white" })}
        </div>
        <p className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 mb-2 ${color}`}>
            {type}
        </p>
        <h4 className="font-bold text-slate-100 mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
    </div>
);


const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="relative w-full max-w-lg bg-slate-800 border border-amber-400/20 rounded-2xl shadow-2xl flex flex-col text-white animate-fade-in-up">
                <header className="flex items-center justify-between p-4 border-b border-amber-400/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-amber-400"/>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">
                            What's New in Earn Halal
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">&times;</button>
                </header>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="relative space-y-8 border-l-2 border-slate-700 ml-3">
                         {updates.map((update, index) => (
                            <UpdateItem key={index} {...update} />
                        ))}
                    </div>
                </div>
                 <footer className="p-4 border-t border-amber-400/10">
                    <button onClick={onClose} className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        Got it, thanks!
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WhatsNewModal;
