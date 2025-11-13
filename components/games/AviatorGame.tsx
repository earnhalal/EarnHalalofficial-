// components/games/AviatorGame.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

type GameState = 'waiting' | 'flying' | 'crashed';

interface PlayerBet {
    user: string;
    bet: number;
    cashedOutAt: number | null;
}

interface BetState {
    amount: number;
    hasPlacedBet: boolean;
    hasCashedOut: boolean;
    canCancel: boolean;
}

const initialBetState: BetState = {
    amount: 10,
    hasPlacedBet: false,
    hasCashedOut: false,
    canCancel: false,
};

const generateRandomUser = () => `***${Math.floor(Math.random() * 90) + 10}`;

interface AviatorGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
    onCancelBet: (amount: number, gameName: string) => void;
}

const BetPanel: React.FC<{
    betState: BetState,
    setBetState: React.Dispatch<React.SetStateAction<BetState>>,
    gameState: GameState,
    multiplier: number,
    balance: number,
    onPlaceBet: (amount: number) => void,
    onCancelBet: (amount: number) => void,
    onCashOut: (amount: number, multiplier: number) => void
}> = ({ betState, setBetState, gameState, multiplier, balance, onPlaceBet, onCancelBet, onCashOut }) => {
    
    const handleBetAmountChange = (newAmount: number) => {
        if (newAmount < 1) newAmount = 1;
        setBetState(prev => ({ ...prev, amount: newAmount }));
    };

    const handleActionButtonClick = () => {
        if (!betState.hasPlacedBet && gameState === 'waiting') { // Place Bet
            if (betState.amount > balance) {
                alert("Insufficient balance.");
                return;
            }
            onPlaceBet(betState.amount);
            setBetState(prev => ({ ...prev, hasPlacedBet: true, canCancel: true }));
        } else if (betState.hasPlacedBet && betState.canCancel && gameState === 'waiting') { // Cancel Bet
            onCancelBet(betState.amount);
            setBetState(prev => ({ ...prev, hasPlacedBet: false, canCancel: false }));
        } else if (betState.hasPlacedBet && !betState.hasCashedOut && gameState === 'flying') { // Cash Out
            onCashOut(betState.amount, multiplier);
            setBetState(prev => ({ ...prev, hasCashedOut: true }));
        }
    };
    
    const getButtonContent = () => {
        if (gameState === 'waiting') {
            if (betState.hasPlacedBet) {
                return { text: 'Cancel', color: 'bg-yellow-500 hover:bg-yellow-600', disabled: false };
            }
            return { text: 'Bet', color: 'bg-green-600 hover:bg-green-700', disabled: false };
        }
        if (gameState === 'flying') {
            if (betState.hasPlacedBet) {
                if (betState.hasCashedOut) {
                    return { text: 'Cashed Out', color: 'bg-slate-600', disabled: true };
                }
                const potentialWinnings = (betState.amount * multiplier).toFixed(2);
                return { text: `Cash Out ${potentialWinnings}`, color: 'bg-amber-500 hover:bg-amber-600', disabled: false };
            }
            return { text: 'Waiting for Next Round', color: 'bg-slate-600', disabled: true };
        }
         if (gameState === 'crashed') {
            if (betState.hasPlacedBet && !betState.hasCashedOut) {
                return { text: 'Crashed', color: 'bg-red-600', disabled: true };
            }
            return { text: 'Round Over', color: 'bg-slate-600', disabled: true };
        }
        return { text: 'Bet', color: 'bg-slate-600', disabled: true };
    };
    
    const { text, color, disabled } = getButtonContent();

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col gap-2 flex-1">
             <div className="flex items-center gap-2">
                <button onClick={() => handleBetAmountChange(betState.amount - 10)} disabled={betState.hasPlacedBet} className="px-3 py-1 bg-slate-700 rounded-md font-bold text-lg">-</button>
                <input
                    type="number"
                    value={betState.amount}
                    onChange={(e) => handleBetAmountChange(parseInt(e.target.value, 10))}
                    disabled={betState.hasPlacedBet}
                    className="w-full p-2 text-center bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-lg font-bold focus:border-sky-500 focus:ring-sky-500 disabled:bg-slate-800 disabled:cursor-not-allowed"
                />
                 <button onClick={() => handleBetAmountChange(betState.amount + 10)} disabled={betState.hasPlacedBet} className="px-3 py-1 bg-slate-700 rounded-md font-bold text-lg">+</button>
            </div>
             <div className="flex justify-center gap-2">
                {[20, 50, 100, 500].map(val => (
                    <button key={val} onClick={() => handleBetAmountChange(val)} disabled={betState.hasPlacedBet} className="px-3 py-1 bg-slate-600/70 text-xs rounded-md hover:bg-slate-600 disabled:opacity-50">{val}</button>
                ))}
            </div>
            <button onClick={handleActionButtonClick} disabled={disabled} className={`w-full p-4 ${color} text-white rounded-lg text-xl font-bold transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed`}>
                {text}
            </button>
        </div>
    );
};


const AviatorGame: React.FC<AviatorGameProps> = ({ balance, onWin, onLoss, onCancelBet }) => {
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [countdown, setCountdown] = useState(5);
    const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);
    const [currentBets, setCurrentBets] = useState<PlayerBet[]>([]);

    const [betOne, setBetOne] = useState<BetState>(initialBetState);
    const [betTwo, setBetTwo] = useState<BetState>(initialBetState);

    const gameLoopRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);

    const startNewRound = useCallback(() => {
        setGameState('waiting');
        setBetOne(prev => ({ ...prev, hasPlacedBet: false, hasCashedOut: false, canCancel: false }));
        setBetTwo(prev => ({ ...prev, hasPlacedBet: false, hasCashedOut: false, canCancel: false }));
        setMultiplier(1.00);
        setCountdown(5);
        
        const newBets: PlayerBet[] = Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map(() => ({
            user: generateRandomUser(),
            bet: Math.floor(Math.random() * 500) + 20,
            cashedOutAt: null
        }));
        setCurrentBets(newBets);

        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    fly();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const fly = useCallback(() => {
        setGameState('flying');
        setBetOne(prev => ({...prev, canCancel: false}));
        setBetTwo(prev => ({...prev, canCancel: false}));
        const crashMultiplier = 1.0 + Math.random() * (Math.random() < 0.1 ? 20 : 7);

        gameLoopRef.current = window.setInterval(() => {
            setMultiplier(prevMultiplier => {
                const newMultiplier = prevMultiplier + 0.01 + (prevMultiplier * 0.01);
                
                setCurrentBets(prevBets => prevBets.map(b => {
                    if (!b.cashedOutAt && Math.random() < 0.01) {
                        return { ...b, cashedOutAt: newMultiplier };
                    }
                    return b;
                }));

                if (newMultiplier >= crashMultiplier) {
                    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                    crash(crashMultiplier);
                }
                return newMultiplier;
            });
        }, 100);
    }, []);

    const crash = useCallback((finalMultiplier: number) => {
        setGameState('crashed');
        setMultiplier(finalMultiplier);
        setMultiplierHistory(prev => [finalMultiplier, ...prev].slice(0, 10));
        setTimeout(startNewRound, 4000);
    }, [startNewRound]);

    useEffect(() => {
        startNewRound();
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [startNewRound]);

    const handleCashOut = (amount: number, cashoutMultiplier: number) => {
        const winnings = amount * cashoutMultiplier;
        onWin(winnings, 'Aviator');
    };

    const renderGameState = () => {
        const planeProgress = gameState === 'flying' ? Math.min(100, Math.log(multiplier) * 20) : 0;
        const planeStyle = {
            bottom: `${planeProgress * 0.8}%`,
            left: `${planeProgress}%`,
            transform: `rotate(-15deg) scale(${1 + planeProgress / 200})`
        };

        switch (gameState) {
            case 'waiting':
                return (
                    <div className="flex flex-col items-center justify-center text-center">
                        <h2 className="text-xl font-bold">Starting in...</h2>
                        <p className="text-4xl font-extrabold">{countdown}s</p>
                    </div>
                );
            case 'flying':
                return (
                    <>
                        <h2 className="text-7xl font-extrabold text-white drop-shadow-lg transition-colors duration-300">{multiplier.toFixed(2)}x</h2>
                        <div className="absolute transition-all duration-100 ease-linear" style={planeStyle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-red-500 drop-shadow-lg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 3.125L18 12m-12 0h12" />
                            </svg>
                        </div>
                    </>
                );
            case 'crashed':
                return <h2 className="text-7xl font-extrabold text-red-500 drop-shadow-lg animate-pulse">Flew Away @ {multiplier.toFixed(2)}x</h2>;
        }
    };
    
    return (
        <div className="bg-[#0f172a] p-2 sm:p-4 rounded-2xl shadow-2xl max-w-5xl mx-auto border border-red-500/20 text-white flex flex-col gap-4">
            <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-red-900/30 via-[#0f172a] to-[#0f172a] rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                <div className="absolute top-2 left-2 flex flex-wrap gap-2 z-10">
                    {multiplierHistory.map((m, i) => (
                        <span key={i} className={`bg-slate-800/80 text-sm font-bold px-3 py-1 rounded-md ${m < 2 ? 'text-sky-400' : 'text-purple-400'}`}>{m.toFixed(2)}x</span>
                    ))}
                </div>
                {renderGameState()}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <BetPanel betState={betOne} setBetState={setBetOne} gameState={gameState} multiplier={multiplier} balance={balance} onPlaceBet={(amount) => onLoss(amount, 'Aviator')} onCancelBet={(amount) => onCancelBet(amount, 'Aviator')} onCashOut={handleCashOut} />
                <BetPanel betState={betTwo} setBetState={setBetTwo} gameState={gameState} multiplier={multiplier} balance={balance} onPlaceBet={(amount) => onLoss(amount, 'Aviator')} onCancelBet={(amount) => onCancelBet(amount, 'Aviator')} onCashOut={handleCashOut} />
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">All Bets ({currentBets.length})</h3>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                    {currentBets.sort((a,b) => b.bet - a.bet).map((bet, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 text-sm p-2 bg-slate-700/50 rounded-md">
                            <span className="truncate">{bet.user}</span>
                            <span className="font-bold text-slate-300 text-right">{bet.bet.toFixed(2)} Rs</span>
                            {bet.cashedOutAt ? (
                                <span className="font-bold text-green-400 text-right">{bet.cashedOutAt.toFixed(2)}x</span>
                            ): (
                                <span className="text-slate-400 text-right">In-game</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AviatorGame;