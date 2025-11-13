// components/games/LudoGame.tsx
import React, { useState } from 'react';
import { TrophyIcon } from '../icons';

interface LudoGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

const LudoGame: React.FC<LudoGameProps> = ({ balance, onWin, onLoss }) => {
    const [betAmount, setBetAmount] = useState<number>(25);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [result, setResult] = useState<{ type: 'win' | 'loss'; amount: number } | null>(null);

    const betOptions = [25, 50, 100, 200];

    const handleStartMatch = () => {
        if (balance < betAmount) {
            alert("Insufficient balance.");
            return;
        }
        onLoss(betAmount, 'Ludo Star');
        setGameState('playing');
        setResult(null);

        // Simulate game
        setTimeout(() => {
            const didWin = Math.random() > 0.55; // Slightly harder to win
            if (didWin) {
                const winAmount = betAmount * 1.8; // Standard Ludo win is not quite double
                onWin(winAmount, 'Ludo Star');
                setResult({ type: 'win', amount: winAmount });
            } else {
                setResult({ type: 'loss', amount: betAmount });
            }
            setGameState('result');
        }, 4000);
    };

    const handlePlayAgain = () => {
        setGameState('betting');
        setResult(null);
    };
    
    const GameScreen = () => {
        if (gameState === 'playing') {
             return (
                 <div className="flex flex-col items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400 mb-4"></div>
                     <h3 className="text-2xl font-bold text-white">Match in Progress...</h3>
                     <p className="text-slate-300">Rolling the dice!</p>
                 </div>
             )
        }
         if (gameState === 'result' && result) {
             return (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                     {result.type === 'win' ? (
                         <>
                             <TrophyIcon className="w-20 h-20 text-amber-400 mb-4"/>
                             <h3 className="text-4xl font-extrabold text-amber-400">You Won!</h3>
                             <p className="text-xl font-semibold text-white mt-2">
                                 +{result.amount.toFixed(2)} Rs added to your wallet.
                             </p>
                         </>
                     ) : (
                          <>
                             <div className="w-20 h-20 text-red-500 mb-4">...</div>
                             <h3 className="text-4xl font-extrabold text-red-500">You Lost</h3>
                             <p className="text-xl font-semibold text-white mt-2">
                                 Better luck next time!
                             </p>
                         </>
                     )}
                     <button onClick={handlePlayAgain} className="mt-8 px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-full hover:bg-amber-600 transition-colors">
                        Play Again
                     </button>
                 </div>
             )
        }
        return <div className="flex items-center justify-center h-full"><TrophyIcon className="w-32 h-32 text-green-500/10" /></div>
    }

    return (
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-green-500/20 text-white flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Ludo Star Challenge</h2>
                <p className="text-slate-400">Select your bet and challenge an opponent!</p>
            </div>
            
            <div className="relative w-full aspect-video bg-gradient-to-br from-green-900 via-slate-800 to-green-800 rounded-lg border border-slate-700">
                <GameScreen />
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Select Bet Amount (Rs)</label>
                    <div className="grid grid-cols-4 gap-2">
                        {betOptions.map(option => (
                            <button 
                                key={option}
                                onClick={() => setBetAmount(option)}
                                disabled={gameState !== 'betting'}
                                className={`p-3 rounded-lg font-bold text-lg transition-all ${
                                    betAmount === option 
                                    ? 'bg-green-500 text-white ring-2 ring-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                 <button 
                    onClick={handleStartMatch} 
                    disabled={gameState !== 'betting'}
                    className="w-full p-4 bg-green-600 text-white rounded-lg text-xl font-bold hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Start Match
                </button>
            </div>
        </div>
    );
};

export default LudoGame;
