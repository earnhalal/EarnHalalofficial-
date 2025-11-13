// components/PlayAndEarnView.tsx
import React from 'react';
import type { View } from '../types';
import { TrophyIcon } from './icons';

interface GameCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isComingSoon?: boolean;
    gradient: string;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, isComingSoon = false, gradient, onClick }) => {
    return (
        <div className="relative group bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-amber-400/30">
            {isComingSoon && (
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Coming Soon
                </div>
            )}
            <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl shadow-lg text-white ${gradient}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-6 h-10">{description}</p>
            <button
                onClick={onClick}
                disabled={isComingSoon}
                className="w-full py-3 font-semibold rounded-lg bg-amber-500/10 border border-amber-400 text-amber-400 transition-all duration-300 group-hover:bg-amber-400 group-hover:text-slate-900 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed"
            >
                {isComingSoon ? 'Unavailable' : 'Play Now'}
            </button>
        </div>
    );
};

interface PlayAndEarnViewProps {
    setActiveView: (view: View) => void;
}


const PlayAndEarnView: React.FC<PlayAndEarnViewProps> = ({ setActiveView }) => {
    const games = [
        {
            title: 'Ludo Star',
            description: 'Challenge players and win big in the classic board game.',
            icon: <TrophyIcon className="w-10 h-10" />,
            gradient: 'bg-gradient-to-br from-green-400 to-green-600',
            view: 'LUDO_GAME' as View,
            isComingSoon: true,
        },
        {
            title: 'Aviator',
            description: 'Cash out before the plane flies away. How long can you wait?',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 3.125L18 12m-12 0h12" /></svg>,
            gradient: 'bg-gradient-to-br from-sky-400 to-sky-600',
            isComingSoon: false,
            view: 'AVIATOR_GAME' as View,
        },
        {
            title: 'Daily Lottery',
            description: 'Pick your lucky numbers and get a chance to win the jackpot.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h5.25m-5.25 0h3m-3 0h-3M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>,
            gradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
            view: 'LOTTERY_GAME' as View,
            isComingSoon: true,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-3">Play & Earn</h2>
                <p className="max-w-2xl mx-auto text-slate-300">
                    Test your skills and luck in our collection of games. Place bets and win big rewards!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map((game, index) => (
                    <GameCard
                        key={index}
                        title={game.title}
                        description={game.description}
                        icon={game.icon}
                        gradient={game.gradient}
                        isComingSoon={game.isComingSoon}
                        onClick={() => setActiveView(game.view)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlayAndEarnView;