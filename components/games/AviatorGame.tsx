// components/games/AviatorGame.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Game state can be more descriptive
type GameState = 'waiting' | 'flying' | 'crashed';

// Mock data for other players
interface PlayerBet {
    user: string;
    bet: number;
    cashedOutAt: number | null;
}

const generateRandomUser = () => `***${Math.floor(Math.random() * 90) + 10}`;

// Game Component
interface AviatorGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

const AviatorGame: React.FC<AviatorGameProps> = ({ balance, onWin, onLoss }) => {
    // State
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [betAmount, setBetAmount] = useState<number>(10);
    const [multiplier, setMultiplier] = useState(1.00);
    const [hasCashedOut, setHasCashedOut] = useState(false);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);
    const [currentBets, setCurrentBets] = useState<PlayerBet[]>([]);

    // Refs
    const gameLoopRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const flyingSoundRef = useRef<{ osc: OscillatorNode, gain: GainNode } | null>(null);

    // Sound Generation
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            try {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
            }
        }
    }, []);

    const playSound = useCallback((type: 'fly' | 'crash' | 'cashout' | 'tick') => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;

        if (type === 'fly') {
            if (flyingSoundRef.current) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            flyingSoundRef.current = { osc, gain };
        } else if (type === 'crash') {
            if (flyingSoundRef.current) {
                flyingSoundRef.current.gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
                flyingSoundRef.current.osc.stop(now + 0.2);
                flyingSoundRef.current = null;
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'noise';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.5);
        } else if (type === 'cashout') {
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.type = 'sine';
             osc.frequency.setValueAtTime(523.25, now);
             osc.frequency.linearRampToValueAtTime(1046.50, now + 0.1);
             gain.gain.setValueAtTime(0.2, now);
             gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.start();
             osc.stop(now + 0.2);
        } else if (type === 'tick') {
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.05);
        }
    }, [initAudio]);
    
    // Game Cycle Logic
    const startNewRound = useCallback(() => {
        setGameState('waiting');
        setHasPlacedBet(false);
        setHasCashedOut(false);
        setMultiplier(1.00);
        setCountdown(5);
        
        // Generate mock bets for this round
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
                playSound('tick');
                return prev - 1;
            });
        }, 1000);
    }, [playSound]);

    const fly = useCallback(() => {
        setGameState('flying');
        playSound('fly');
        const crashMultiplier = 1.0 + Math.random() * (Math.random() < 0.1 ? 20 : 7);

        gameLoopRef.current = window.setInterval(() => {
            setMultiplier(prevMultiplier => {
                const newMultiplier = prevMultiplier + 0.01 + (prevMultiplier * 0.01);

                if (flyingSoundRef.current) {
                    const newFreq = 100 + Math.log2(newMultiplier) * 50;
                    if(audioCtxRef.current) {
                       flyingSoundRef.current.osc.frequency.linearRampToValueAtTime(newFreq, audioCtxRef.current!.currentTime + 0.1);
                    }
                }
                
                // Simulate other players cashing out
                setCurrentBets(prevBets => prevBets.map(b => {
                    if (!b.cashedOutAt && Math.random() < 0.01) { // small chance to cash out each tick
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
    }, [playSound]);

    const crash = useCallback((finalMultiplier: number) => {
        playSound('crash');
        setGameState('crashed');
        setMultiplier(finalMultiplier);
        setMultiplierHistory(prev => [finalMultiplier, ...prev].slice(0, 10));
        if (hasPlacedBet && !hasCashedOut) {
            // Bet was lost, already deducted when placed
        }
        setTimeout(startNewRound, 4000);
    }, [hasPlacedBet, hasCashedOut, playSound, startNewRound]);


    useEffect(() => {
        startNewRound();
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
             if (flyingSoundRef.current && audioCtxRef.current) {
                const now = audioCtxRef.current.currentTime;
                flyingSoundRef.current.gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
                flyingSoundRef.current.osc.stop(now + 0.2);
                flyingSoundRef.current = null;
            }
        };
    }, [startNewRound]);

    // Handlers
    const handleBetAmountChange = (amount: number) => {
        if (amount <= 0) setBetAmount(1);
        else setBetAmount(amount);
    };

    const handlePlaceBet = () => {
        if (betAmount > balance) {
            alert("Insufficient balance.");
            return;
        }
        onLoss(betAmount, 'Aviator');
        setHasPlacedBet(true);
    };

    const handleCashOut = () => {
        if (gameState !== 'flying' || hasCashedOut) return;
        
        playSound('cashout');
        const currentWinnings = betAmount * multiplier;
        onWin(currentWinnings, 'Aviator');
        setHasCashedOut(true);
        setCurrentBets(prev => [...prev, {user: "You", bet: betAmount, cashedOutAt: multiplier}]);
    };
    
    // UI Render
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
                        <div className="relative text-red-500 w-16 h-16 mb-4">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 absolute animate-spin" style={{animationDuration: '1s'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" /></svg>
                        </div>
                        <h2 className="text-xl font-bold">Waiting for next round...</h2>
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
                return <h2 className="text-7xl font-extrabold text-red-500 drop-shadow-lg animate-pulse">Crashed @ {multiplier.toFixed(2)}x</h2>;
        }
    };
    
    const BetButton = () => {
        if(hasPlacedBet) {
             return (
                 <button onClick={handleCashOut} disabled={gameState !== 'flying' || hasCashedOut} className="w-full p-4 bg-amber-500 text-slate-900 rounded-lg text-xl font-bold hover:bg-amber-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                     {hasCashedOut ? `Cashed Out!` : `Cash Out ${(betAmount * multiplier).toFixed(2)}`}
                </button>
            )
        }
        
        return (
             <button onClick={handlePlaceBet} disabled={gameState !== 'waiting'} className="w-full p-4 bg-green-600 text-white rounded-lg text-xl font-bold hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                Bet
            </button>
        )
    };

    return (
        <div className="bg-[#0f172a] p-2 sm:p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-sky-500/20 text-white flex flex-col gap-4">
            {/* Game Screen */}
            <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-sky-900/50 via-[#0f172a] to-[#0f172a] rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                    {multiplierHistory.map((m, i) => (
                        <span key={i} className={`bg-slate-800/80 text-sm font-bold px-3 py-1 rounded-md ${m < 2 ? 'text-sky-400' : 'text-purple-400'}`}>{m.toFixed(2)}x</span>
                    ))}
                </div>
                {renderGameState()}
            </div>

            {/* Control Panel */}
            <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleBetAmountChange(betAmount - 10)} disabled={hasPlacedBet} className="px-4 py-2 bg-slate-700 rounded-md font-bold text-2xl">-</button>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => handleBetAmountChange(parseInt(e.target.value, 10))}
                            disabled={hasPlacedBet}
                            className="w-full p-3 text-center bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-xl font-bold focus:border-sky-500 focus:ring-sky-500 disabled:bg-slate-800 disabled:cursor-not-allowed"
                        />
                         <button onClick={() => handleBetAmountChange(betAmount + 10)} disabled={hasPlacedBet} className="px-4 py-2 bg-slate-700 rounded-md font-bold text-2xl">+</button>
                    </div>
                     <div className="flex justify-center gap-2 mt-2">
                        {[20, 50, 100, 500].map(val => (
                            <button key={val} onClick={() => handleBetAmountChange(val)} disabled={hasPlacedBet} className="px-3 py-1 bg-slate-600/70 text-sm rounded-md hover:bg-slate-600">{val}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 w-full sm:max-w-xs">
                   <BetButton />
                </div>
            </div>
            
            {/* Current Bets */}
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
