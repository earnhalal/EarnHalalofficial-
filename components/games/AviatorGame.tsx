// components/games/AviatorGame.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrophyIcon } from '../icons';

type GameState = 'waiting' | 'flying' | 'crashed';

interface BetState {
    amount: number;
    hasPlacedBet: boolean;
    hasCashedOut: boolean;
    canCancel: boolean;
    cashOutMultiplier?: number;
}

const initialBetState: BetState = {
    amount: 10,
    hasPlacedBet: false,
    hasCashedOut: false,
    canCancel: false,
};

// --- Custom Hook for Audio ---
const useGameAudio = () => {
    const audioCtx = useRef<AudioContext | null>(null);
    const flyingSoundSource = useRef<OscillatorNode | null>(null);
    const flyingSoundGain = useRef<GainNode | null>(null);

    useEffect(() => {
        const initAudioContext = () => {
            if (!audioCtx.current) {
                try {
                    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                } catch (e) {
                    console.error("Web Audio API is not supported in this browser");
                }
            }
        };
        window.addEventListener('click', initAudioContext, { once: true });
        
        return () => {
            window.removeEventListener('click', initAudioContext);
            if (flyingSoundSource.current) flyingSoundSource.current.stop();
            audioCtx.current?.close().catch(e => console.error(e));
        };
    }, []);

    const playSound = useCallback((type: 'tick' | 'cashout' | 'crash' | 'bet') => {
        if (!audioCtx.current) return;
        const ctx = audioCtx.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);

        if (type === 'tick') {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000, now);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'cashout') {
            const osc1 = ctx.createOscillator(); osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1046.50, now); // C6
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            osc1.connect(gainNode);
            osc1.start(now);
            osc1.stop(now + 0.5);
        } else if (type === 'crash') {
            const noise = ctx.createBufferSource();
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.setValueAtTime(800, now);
            lowpass.frequency.linearRampToValueAtTime(100, now + 0.3);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            noise.connect(lowpass);
            lowpass.connect(gainNode);
            noise.start(now);
            noise.stop(now + 0.5);
        } else if (type === 'bet') {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }, []);

    const startFlyingSound = useCallback(() => {
        if (!audioCtx.current) return;
        const ctx = audioCtx.current;
        if (ctx.state === 'suspended') ctx.resume();
        if (flyingSoundSource.current) flyingSoundSource.current.stop();

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        flyingSoundSource.current = oscillator;
        flyingSoundGain.current = gain;
    }, []);

    const updateFlyingSound = useCallback((multiplier: number) => {
        if (flyingSoundSource.current && audioCtx.current) {
            const newFreq = 100 + Math.log2(multiplier) * 40;
            flyingSoundSource.current.frequency.setTargetAtTime(newFreq, audioCtx.current.currentTime, 0.1);
        }
    }, []);

    const stopFlyingSound = useCallback(() => {
        if (flyingSoundGain.current && audioCtx.current) {
            flyingSoundGain.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.2);
            if (flyingSoundSource.current) {
                 flyingSoundSource.current.stop(audioCtx.current.currentTime + 0.3);
                 flyingSoundSource.current = null;
            }
        }
    }, []);

    return { playSound, startFlyingSound, updateFlyingSound, stopFlyingSound };
};


interface AviatorGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
    onCancelBet: (amount: number, gameName: string) => void;
}

const BetPanel: React.FC<{
    balance: number,
    betState: BetState,
    setBetState: React.Dispatch<React.SetStateAction<BetState>>,
    gameState: GameState,
    multiplier: number,
    onPlaceBet: (amount: number) => void,
    onCancelBet: (amount: number) => void,
    onCashOut: (amount: number, multiplier: number) => void
}> = ({ balance, betState, setBetState, gameState, multiplier, onPlaceBet, onCancelBet, onCashOut }) => {
    
    const isBettingPhase = gameState === 'waiting';
    const isFlyingPhase = gameState === 'flying';
    const hasBet = betState.hasPlacedBet;
    const isBettingDisabled = hasBet || !isBettingPhase;

    const handleBetAmountChange = (newAmount: number) => {
        if (isNaN(newAmount)) return;
        let value = newAmount;
        if (value < 1) value = 1;
        if (value > 10000) value = 10000;
        setBetState(prev => ({ ...prev, amount: value }));
    };

    const handleActionButtonClick = () => {
        if (isBettingPhase) {
            if (hasBet && betState.canCancel) onCancelBet(betState.amount);
            else if (!hasBet) onPlaceBet(betState.amount);
        } else if (isFlyingPhase && hasBet && !betState.hasCashedOut) {
            onCashOut(betState.amount, multiplier);
        }
    };
    
    const getButtonState = () => {
        if (isBettingPhase) {
            if (hasBet) return { text: 'Cancel Bet', color: 'bg-yellow-500 hover:bg-yellow-600', disabled: false };
            return { text: 'Place Bet', color: 'bg-primary-500 hover:bg-primary-600', disabled: false };
        }
        if (isFlyingPhase) {
            if (hasBet) {
                if (betState.hasCashedOut) return { text: `Cashed Out @ ${betState.cashOutMultiplier?.toFixed(2)}x`, color: 'bg-gray-600', disabled: true };
                const potentialWinnings = (betState.amount * multiplier).toFixed(2);
                return { text: `Cash Out ${potentialWinnings}`, color: 'bg-accent-500 hover:bg-accent-600', disabled: false };
            }
            return { text: 'Waiting...', color: 'bg-gray-700', disabled: true };
        }
        if (hasBet && !betState.hasCashedOut) return { text: 'You Missed It', color: 'bg-red-600', disabled: true };
        return { text: 'Place Bet', color: 'bg-primary-500 hover:bg-primary-600', disabled: false };
    };
    
    const { text, color, disabled } = getButtonState();

    return (
        <div className={`bg-gray-800 p-5 rounded-xl flex flex-col gap-4 flex-1 border border-transparent transition-all duration-300 ${hasBet ? 'border-primary-500/50' : 'border-gray-700'}`}>
             <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={betState.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBetAmountChange(parseFloat(e.target.value))}
                    disabled={isBettingDisabled}
                    className="w-full p-3 font-mono text-center bg-gray-700/70 border-2 border-gray-600 rounded-xl text-white text-xl font-bold focus:border-primary-500 focus:ring-primary-500 transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
            </div>
             <div className="grid grid-cols-4 gap-3">
                {[20, 50, 100, 500].map(val => (
                    <button key={val} onClick={() => handleBetAmountChange(val)} disabled={isBettingDisabled} className="px-2 py-1.5 bg-gray-700/80 text-sm rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{val}</button>
                ))}
            </div>
            <button onClick={handleActionButtonClick} disabled={disabled} className={`w-full p-4 ${color} text-white rounded-xl text-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}>
                {text}
            </button>
        </div>
    );
};

const AviatorGame: React.FC<AviatorGameProps> = ({ balance, onWin, onLoss, onCancelBet }) => {
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [countdown, setCountdown] = useState(5);
    const [multiplierHistory, setMultiplierHistory] = useState<{ value: number, id: number }[]>([]);
    
    const [betOne, setBetOne] = useState<BetState>(initialBetState);
    const [betTwo, setBetTwo] = useState<BetState>(initialBetState);

    const gameLoopRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);
    const [isRedFlash, setIsRedFlash] = useState(false);
    const multiplierMilestones = useRef(new Set([2, 5, 10, 20, 50, 100]));
    const [lastMilestone, setLastMilestone] = useState(0);

    const { playSound, startFlyingSound, updateFlyingSound, stopFlyingSound } = useGameAudio();

    const startNewRound = useCallback(() => {
        setGameState('waiting');
        setBetOne(prev => ({ ...initialBetState, amount: prev.amount, hasPlacedBet: false, hasCashedOut: false, canCancel: false }));
        setBetTwo(prev => ({ ...initialBetState, amount: prev.amount, hasPlacedBet: false, hasCashedOut: false, canCancel: false }));
        setMultiplier(1.00);
        setLastMilestone(0);
        setCountdown(5);

        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = window.setInterval(() => {
            playSound('tick');
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    fly();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [playSound]);

    const fly = useCallback(() => {
        setGameState('flying');
        startFlyingSound();
        setBetOne(prev => ({...prev, canCancel: false}));
        setBetTwo(prev => ({...prev, canCancel: false}));
        const crashMultiplier = 1.0 + Math.pow(Math.random(), 3.5) * 25;

        gameLoopRef.current = window.setInterval(() => {
            setMultiplier(prevMultiplier => {
                const growthRate = 0.006 * Math.log1p(prevMultiplier);
                const newMultiplier = prevMultiplier + 0.01 + growthRate;
                
                updateFlyingSound(newMultiplier);

                const nextMilestone = Math.min(...Array.from(multiplierMilestones.current).filter(m => m > lastMilestone));
                if (newMultiplier >= nextMilestone) {
                    setLastMilestone(nextMilestone);
                }

                if (newMultiplier >= crashMultiplier) {
                    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                    crash(crashMultiplier);
                }
                return newMultiplier;
            });
        }, 50);
    }, [startFlyingSound, updateFlyingSound, lastMilestone]);

    const crash = useCallback((finalMultiplier: number) => {
        playSound('crash');
        stopFlyingSound();
        setGameState('crashed');
        setIsRedFlash(true);
        setTimeout(() => setIsRedFlash(false), 300);
        setMultiplier(finalMultiplier);
        setMultiplierHistory(prev => [{ value: finalMultiplier, id: Date.now() }, ...prev].slice(0, 12));
        
        [betOne, betTwo].forEach(bet => {
            if (bet.hasPlacedBet && !bet.hasCashedOut) {
                // Loss is recorded on bet placement.
            }
        });

        setTimeout(startNewRound, 4000);
    }, [playSound, stopFlyingSound, startNewRound, betOne, betTwo]);

    useEffect(() => {
        startNewRound();
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            stopFlyingSound();
        };
    }, []);
    
    const handlePlaceBet = (amount: number, betSetter: React.Dispatch<React.SetStateAction<BetState>>) => {
        if (amount > balance) { alert("Insufficient balance."); return; }
        onLoss(amount, 'Aviator');
        playSound('bet');
        betSetter(prev => ({ ...prev, amount, hasPlacedBet: true, canCancel: true }));
    };

    const handleCancelBet = (amount: number, betSetter: React.Dispatch<React.SetStateAction<BetState>>) => {
        onCancelBet(amount, 'Aviator');
        betSetter(prev => ({ ...prev, hasPlacedBet: false, canCancel: false }));
    };
    
    const handleCashOut = (amount: number, cashoutMultiplier: number, betSetter: React.Dispatch<React.SetStateAction<BetState>>) => {
        playSound('cashout');
        const winnings = amount * cashoutMultiplier;
        onWin(winnings, 'Aviator');
        betSetter(prev => ({ ...prev, hasCashedOut: true, cashOutMultiplier: cashoutMultiplier }));
    };

    const planeProgress = gameState === 'flying' ? Math.min(100, Math.log1p(multiplier) * 15) : 0;
    
    return (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-6xl mx-auto border border-white/10 text-white flex flex-col gap-6 font-sans">
            <style>{`
                @keyframes red-flash { 0% { opacity: 0; } 50% { opacity: 0.5; } 100% { opacity: 0; } }
                .animate-red-flash { animation: red-flash 0.3s ease-out; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); } 10% { transform: translateX(-4px); } 20% { transform: translateX(4px); } 30% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 50% { transform: translateX(0); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                @keyframes countdown-bounce { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
                .animate-countdown-bounce { animation: countdown-bounce 0.5s ease-out forwards; }
                @keyframes multiplier-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
                .animate-multiplier-pulse { animation: multiplier-pulse 0.4s ease-out; }
                @keyframes history-slide-in { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-history-slide-in { animation: history-slide-in 0.5s ease-out forwards; }
                .plane-path { offset-path: path("M -10,60 C 20,60 30,20 110,15"); }
                @keyframes fly { 100% { offset-distance: 100%; } }
                .animate-fly { animation: fly linear forwards; animation-timeline: --plane-progress; }
                @property --plane-progress { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
            `}</style>
            
             <div className="flex items-center gap-3 overflow-hidden pb-2">
                {multiplierHistory.map((m) => {
                    const color = m.value < 1.2 ? 'text-blue-400' : m.value < 10 ? 'text-purple-400' : 'text-accent-400';
                    return (
                        <span key={m.id} className={`animate-history-slide-in bg-gray-700/80 text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap ${color}`}>
                            {m.value.toFixed(2)}x
                        </span>
                    );
                })}
            </div>

            <div className={`relative w-full aspect-[16/9] bg-gradient-to-t from-gray-900 to-gray-800 rounded-lg overflow-hidden border transition-colors duration-500 ${gameState === 'crashed' ? 'border-red-500/80' : 'border-gray-700'}`}>
                 {isRedFlash && <div className="absolute inset-0 bg-red-600/50 animate-red-flash z-30"></div>}
                 
                 <div className="absolute inset-0 z-10 flex items-center justify-center">
                    {gameState === 'waiting' && (
                        <div key={countdown} className="text-center animate-countdown-bounce">
                             <p className="text-2xl font-semibold text-gray-300 font-heading">Next round in</p>
                            <p className="text-7xl font-mono font-bold text-white drop-shadow-lg">{countdown}s</p>
                        </div>
                    )}
                     {gameState === 'flying' && (
                        <p key={lastMilestone} className={`font-mono text-8xl font-bold text-white transition-colors duration-300 ${lastMilestone >= 10 ? 'text-accent-300' : 'text-white'}`}>
                            <span className={lastMilestone > 0 ? 'animate-multiplier-pulse' : ''}>{multiplier.toFixed(2)}x</span>
                        </p>
                    )}
                    {gameState === 'crashed' && (
                        <div className="text-center animate-shake">
                            <p className="text-6xl font-heading font-semibold text-red-500 drop-shadow-lg">Flew Away 💥</p>
                            <p className="text-3xl font-mono font-bold text-white mt-2">@ {multiplier.toFixed(2)}x</p>
                        </div>
                    )}
                 </div>

                 <div className="absolute inset-0 w-full h-full plane-path">
                    <div 
                        className="absolute w-20 h-20 text-red-500 transition-all duration-100"
                        style={{
                            '--plane-progress': `${planeProgress}%`,
                            offsetRotate: 'auto',
                            animation: gameState === 'flying' ? `fly ${30 / Math.log1p(multiplier + 1)}s linear forwards` : 'none',
                            opacity: gameState === 'flying' ? 1 : 0,
                        } as React.CSSProperties}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 3.125L18 12m-12 0h12" />
                        </svg>
                    </div>
                </div>

            </div>

            <div className="flex flex-col md:flex-row gap-6">
                 <BetPanel key="panel1" balance={balance} betState={betOne} setBetState={setBetOne} gameState={gameState} multiplier={multiplier} onPlaceBet={(amount) => handlePlaceBet(amount, setBetOne)} onCancelBet={(amount) => handleCancelBet(amount, setBetOne)} onCashOut={(amount, mult) => handleCashOut(amount, mult, setBetOne)} />
                 <BetPanel key="panel2" balance={balance} betState={betTwo} setBetState={setBetTwo} gameState={gameState} multiplier={multiplier} onPlaceBet={(amount) => handlePlaceBet(amount, setBetTwo)} onCancelBet={(amount) => handleCancelBet(amount, setBetTwo)} onCashOut={(amount, mult) => handleCashOut(amount, mult, setBetTwo)} />
            </div>
        </div>
    );
};

export default AviatorGame;
