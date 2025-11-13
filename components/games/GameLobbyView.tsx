// components/games/GameLobbyView.tsx
import React from 'react';

interface GameLobbyViewProps {
    title: string;
    icon: React.ReactNode;
}

const GameLobbyView: React.FC<GameLobbyViewProps> = ({ title, icon }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-amber-400/10 p-8 rounded-2xl shadow-2xl text-center max-w-lg mx-auto animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl shadow-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                {icon}
            </div>
            <h2 className="text-4xl font-extrabold text-slate-100 mb-4">{title}</h2>
            <p className="text-slate-300 text-lg mb-8">
                Get ready for action! This game is launching soon.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300 text-2xl animate-pulse">Coming Soon!</p>
            </div>
        </div>
    );
};

export default GameLobbyView;