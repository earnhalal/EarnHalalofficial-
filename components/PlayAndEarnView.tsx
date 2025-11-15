// components/PlayAndEarnView.tsx
import React from 'react';
import type { View } from '../types';
import { TrophyIcon, CoinIcon, BombIcon } from './icons';

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
        <div className="relative group bg-white border border-gray-200 rounded-2xl p-6 text-center overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-300">
            {isComingSoon && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Coming Soon
                </div>
            )}
            <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl shadow-lg text-white ${gradient}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 h-10">{description}</p>
            <button
                onClick={onClick}
                disabled={isComingSoon}
                className="w-full py-3 font-semibold rounded-lg bg-emerald-500/10 border border-emerald-400 text-emerald-600 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
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
            title: 'Mines',
            description: 'Uncover gems and avoid the mines. The higher the risk, the bigger the reward!',
            icon: <BombIcon className="w-10 h-10" />,
            gradient: 'bg-gradient-to-br from-gray-500 to-gray-700',
            view: 'MINES_GAME' as View,
            isComingSoon: true,
        },
        {
            title: 'Ludo Star',
            description: 'Challenge players and win big in the classic board game.',
            icon: <TrophyIcon className="w-10 h-10" />,
            gradient: 'bg-gradient-to-br from-green-400 to-green-600',
            view: 'LUDO_GAME' as View,
            isComingSoon: true,
        },
        {
            title: 'Coin Flip',
            description: 'A simple 50/50 chance. Choose Heads or Tails to double your bet.',
            icon: <CoinIcon className="w-10 h-10" />,
            gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
            view: 'COIN_FLIP_GAME' as View,
            isComingSoon: true,
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
        <div className="space-y-8 p-4">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">Play & Earn</h2>
                <p className="max-w-2xl mx-auto text-gray-600">
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