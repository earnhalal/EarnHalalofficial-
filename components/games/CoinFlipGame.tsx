// components/games/CoinFlipGame.tsx
import React, { useState, useRef } from 'react';

interface CoinFlipGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

type Choice = 'Heads' | 'Tails';
type GameResult = 'Win' | 'Loss' | null;

const CoinFlipGame: React.FC<CoinFlipGameProps> = ({ balance, onWin, onLoss }) => {
    const [betAmount, setBetAmount] = useState<number>(10);
    const [choice, setChoice] = useState<Choice | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<GameResult>(null);
    const [finalSide, setFinalSide] = useState<Choice>('Heads');
    
    const coinRef = useRef<HTMLDivElement>(null);

    const handleFlip = () => {
        if (!choice) {
            alert("Please choose Heads or Tails.");
            return;
        }
        if (betAmount > balance) {
            alert("Insufficient balance.");
            return;
        }

        setIsFlipping(true);
        setResult(null);
        onLoss(betAmount, "Coin Flip");

        const outcome: Choice = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setFinalSide(outcome);

        // Reset animation
        if (coinRef.current) {
            coinRef.current.style.transition = 'none';
            coinRef.current.style.transform = `rotateY(0deg)`;
            // Force reflow
            void coinRef.current.offsetWidth;
            coinRef.current.style.transition = 'transform 3s cubic-bezier(.2,1,.4,1)';
            
            const randomSpins = Math.floor(Math.random() * 4) + 5;
            const finalRotation = randomSpins * 180 + (outcome === 'Tails' ? 180 : 0);
            coinRef.current.style.transform = `rotateY(${finalRotation}deg)`;
        }

        setTimeout(() => {
            if (choice === outcome) {
                const winAmount = betAmount * 1.95; // 95% payout
                onWin(winAmount, "Coin Flip");
                setResult('Win');
            } else {
                setResult('Loss');
            }
            setIsFlipping(false);
        }, 3000);
    };
    
    return (
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-md mx-auto border border-yellow-500/20 text-white flex flex-col gap-6">
            <style>{`
                .scene { perspective: 800px; }
                .coin { transform-style: preserve-3d; }
                .coin-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .coin-back { transform: rotateY(180deg); }
            `}</style>
            <div className="text-center">
                <h2 className="text-3xl font-bold">Coin Flip</h2>
                <p className="text-slate-400">Heads or Tails? Double your bet!</p>
            </div>

            <div className="scene w-48 h-48 mx-auto">
                <div ref={coinRef} className="coin w-full h-full relative transition-transform duration-[3000ms]" style={{ transformStyle: 'preserve-3d'}}>
                    <div className="coin-face absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center border-4 border-yellow-600 shadow-lg">
                        <span className="text-5xl font-bold text-yellow-800">H</span>
                    </div>
                    <div className="coin-face coin-back absolute w-full h-full rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-4 border-slate-600 shadow-lg">
                        <span className="text-5xl font-bold text-slate-800">T</span>
                    </div>
                </div>
            </div>

            <div className="text-center h-12 flex items-center justify-center">
                {result && !isFlipping && (
                    <div className={`text-3xl font-bold animate-fade-in ${result === 'Win' ? 'text-green-400' : 'text-red-500'}`}>
                        {result === 'Win' ? `You Won ${(betAmount * 1.95).toFixed(2)} Rs!` : "You Lost!"}
                    </div>
                )}
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Bet Amount (Rs)</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={isFlipping}
                        className="w-full p-3 text-center bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-xl font-bold focus:border-yellow-500 focus:ring-yellow-500 disabled:opacity-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Choose your side</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setChoice('Heads')} disabled={isFlipping} className={`p-3 rounded-lg font-bold text-lg transition-all ${choice === 'Heads' ? 'bg-yellow-500 text-white ring-2 ring-white' : 'bg-slate-700 text-slate-300'}`}>Heads</button>
                        <button onClick={() => setChoice('Tails')} disabled={isFlipping} className={`p-3 rounded-lg font-bold text-lg transition-all ${choice === 'Tails' ? 'bg-yellow-500 text-white ring-2 ring-white' : 'bg-slate-700 text-slate-300'}`}>Tails</button>
                    </div>
                </div>
                <button 
                    onClick={handleFlip} 
                    disabled={isFlipping || !choice}
                    className="w-full p-4 bg-yellow-600 text-white rounded-lg text-xl font-bold hover:bg-yellow-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </button>
            </div>
        </div>
    );
};

export default CoinFlipGame;