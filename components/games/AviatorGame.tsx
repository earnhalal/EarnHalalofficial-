// components/games/AviatorGame.tsx
import React, { useState, useEffect, useRef } from 'react';

type GameState = 'waiting' | 'betting' | 'flying' | 'crashed';

interface AviatorGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

const AviatorGame: React.FC<AviatorGameProps> = ({ balance, onWin, onLoss }) => {
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [betAmount, setBetAmount] = useState('10');
    const [multiplier, setMultiplier] = useState(1.00);
    const [hasCashedOut, setHasCashedOut] = useState(false);
    const [canBet, setCanBet] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Place your bet for the next round.');
    const [winnings, setWinnings] = useState(0);

    const multiplierRef = useRef(1.00);
    // FIX: Changed NodeJS.Timeout to number, as setInterval in the browser returns a number.
    const gameLoopRef = useRef<number | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, []);

    const startGameCycle = () => {
        setGameState('betting');
        setStatusMessage('Next round starting soon...');
        setWinnings(0);

        // Betting phase (5 seconds)
        setTimeout(() => {
            setGameState('flying');
            setStatusMessage('Flying...');
            multiplierRef.current = 1.00;
            
            const crashMultiplier = 1.0 + Math.random() * (Math.random() < 0.1 ? 20 : 5); // Random crash point, with a small chance of a big win

            // Flying phase
            gameLoopRef.current = setInterval(() => {
                multiplierRef.current += 0.01 + (multiplierRef.current * 0.01);
                setMultiplier(multiplierRef.current);

                if (multiplierRef.current >= crashMultiplier) {
                    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                    setGameState('crashed');
                    setStatusMessage(`Crashed @ ${crashMultiplier.toFixed(2)}x`);
                    setCanBet(true);
                    setTimeout(startGameCycle, 5000); // Wait 5s before next round
                }
            }, 100);
        }, 5000);
    };
    
    // Start the first game cycle
    useEffect(() => {
        startGameCycle();
    }, []);

    const handleBet = () => {
        const bet = parseFloat(betAmount);
        if (isNaN(bet) || bet <= 0) {
            alert('Please enter a valid bet amount.');
            return;
        }
        if (bet > balance) {
            alert('Insufficient balance.');
            return;
        }

        onLoss(bet, 'Aviator');
        setCanBet(false);
        setHasCashedOut(false);
        setStatusMessage('Bet placed! Waiting for next round...');
    };

    const handleCashOut = () => {
        if (gameState !== 'flying' || hasCashedOut) return;
        
        const currentWinnings = parseFloat(betAmount) * multiplier;
        onWin(currentWinnings, 'Aviator');
        setHasCashedOut(true);
        setWinnings(currentWinnings);
        setStatusMessage(`You cashed out at ${multiplier.toFixed(2)}x!`);
    };

    return (
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-sky-500/20 text-white flex flex-col gap-6">
            <style>{`
                @keyframes takeoff {
                    0% { transform: translate(-100%, 50%) scale(0.5) rotate(-5deg); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(50%, -50%) scale(1) rotate(0deg); opacity: 1; }
                }
                .plane-takeoff { animation: takeoff 1s ease-out forwards; }
                @keyframes fly-away {
                    0% { transform: translate(50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(150%, -100%) scale(1.2); opacity: 0; }
                }
                .plane-crashed { animation: fly-away 0.5s ease-in forwards; }
            `}</style>
            
            {/* Game Screen */}
            <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-sky-900 to-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/10 to-transparent"></div>
                
                {gameState === 'crashed' ? (
                     <h2 className="text-6xl font-extrabold text-red-500 animate-pulse drop-shadow-lg">{multiplier.toFixed(2)}x</h2>
                ) : (
                     <h2 className="text-7xl font-extrabold text-white drop-shadow-lg transition-colors duration-300">{multiplier.toFixed(2)}x</h2>
                )}

                {gameState === 'flying' && (
                    <div className="absolute w-full h-full plane-takeoff">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 3.125L18 12m-12 0h12" />
                        </svg>
                    </div>
                )}
                 {gameState === 'crashed' && (
                    <div className="absolute w-full h-full plane-crashed">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">✈️ flew away!</span>
                    </div>
                )}
            </div>

            {/* Status & Control Panel */}
            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                 <p className="font-semibold text-lg min-h-[28px]">{statusMessage}</p>
                 {winnings > 0 && <p className="text-green-400 font-bold">You won {winnings.toFixed(2)} Rs!</p>}
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                     <label htmlFor="betAmount" className="text-sm font-semibold text-slate-400">Bet Amount (Rs)</label>
                    <input
                        id="betAmount"
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        disabled={!canBet}
                        className="w-full p-3 mt-1 bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-xl font-bold focus:border-sky-500 focus:ring-sky-500 disabled:bg-slate-800 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="flex-1 w-full sm:self-end">
                    {canBet ? (
                        <button onClick={handleBet} className="w-full p-4 bg-green-600 text-white rounded-lg text-xl font-bold hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed">
                            Place Bet
                        </button>
                    ) : (
                         <button onClick={handleCashOut} disabled={gameState !== 'flying' || hasCashedOut} className="w-full p-4 bg-amber-500 text-slate-900 rounded-lg text-xl font-bold hover:bg-amber-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                             {hasCashedOut ? `Cashed Out!` : `Cash Out @ ${multiplier.toFixed(2)}x`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AviatorGame;