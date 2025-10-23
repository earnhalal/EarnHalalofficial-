// components/SpinWheelView.tsx
import React, { useState, useEffect, useRef } from 'react';

// --- Winning Animation Component ---
const WinAnimation: React.FC<{ prize: number; onAnimationEnd: () => void; }> = ({ prize, onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationEnd();
        }, 3000); // Animation duration
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full animate-fall bg-yellow-300"
                        style={{
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 10 + 5}px`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${Math.random() * 3 + 3}s`,
                            opacity: Math.random()
                        }}
                    ></div>
                ))}
            </div>
            <div className="text-center text-white animate-popup z-10">
                <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg">You won {prize.toFixed(2)} Rs 🎉</h2>
                <p className="text-xl mt-4">The amount has been added to your wallet.</p>
            </div>
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation: fall linear infinite; }
                @keyframes popup {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-popup { animation: popup 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};


interface SpinWheelViewProps {
  onWin: (amount: number) => void;
  balance: number;
  onBuySpin: (cost: number) => boolean;
}

// Prize segments for the Free Spin (rewards 1-2 Rs)
const freeSegments = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 1.5, label: '1.5' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 1.2, label: '1.2' },
    { value: 1, label: '1' },
    { value: 1.8, label: '1.8' },
];

// Prize segments for the Buy Spin (rewards 3-10 Rs, mostly higher values)
const buySegments = [
    { value: 5, label: '5' },
    { value: 7, label: '7' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 7, label: '7' },
    { value: 4, label: '4' },
];

const SpinWheelView: React.FC<SpinWheelViewProps> = ({ onWin, balance, onBuySpin }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winningIndex, setWinningIndex] = useState<number | null>(null);
    const [hasUsedDailySpin, setHasUsedDailySpin] = useState(true);
    const [prizeToDisplay, setPrizeToDisplay] = useState<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    
    // Determine which segments to show based on whether the free spin is available
    const wheelSegments = hasUsedDailySpin ? buySegments : freeSegments;

    useEffect(() => {
        const lastSpinDate = localStorage.getItem('lastSpinDate');
        const today = new Date().toDateString();
        setHasUsedDailySpin(lastSpinDate === today);
        
        // Initialize Web Audio API on first user interaction
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio, { once: true });
    }, []);

    const playSound = (type: 'tick' | 'win') => {
        const audioCtx = audioContextRef.current;
        if (!audioCtx || audioCtx.state === 'suspended') audioCtx?.resume();
        if (!audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;

        if (type === 'tick') {
            gainNode.gain.setValueAtTime(0.2, now);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(Math.random() * 200 + 600, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'win') {
             const playNote = (freq: number, startTime: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playNote(523.25, now, 0.15); // C5
            playNote(659.25, now + 0.15, 0.15); // E5
            playNote(783.99, now + 0.3, 0.25); // G5
        }
    };
    
    const handleSpin = (isFreeSpin: boolean) => {
        if (isSpinning) return;

        let currentSegments;
        
        if (isFreeSpin) {
            if(hasUsedDailySpin) return;
            localStorage.setItem('lastSpinDate', new Date().toDateString());
            setHasUsedDailySpin(true);
            currentSegments = freeSegments;
        } else {
            const purchaseSuccess = onBuySpin(5);
            if (!purchaseSuccess) {
                 alert("Insufficient balance to buy a spin.");
                 return;
            }
            currentSegments = buySegments;
        }
        
        setWinningIndex(null);
        setIsSpinning(true);
        const tickInterval = setInterval(() => playSound('tick'), 120);

        // Determine the winner *before* spinning
        const resolvedWinningIndex = Math.floor(Math.random() * currentSegments.length);
        const segmentAngle = 360 / currentSegments.length;
        // Add a small random offset within the segment to make it look more natural
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
        const targetAngle = 360 - (resolvedWinningIndex * segmentAngle) - (segmentAngle / 2) + randomOffset;
        
        const fullSpins = 5; // Exactly 5 full rotations
        const finalRotation = rotation + (360 * fullSpins) + targetAngle;
        setRotation(finalRotation);

        setTimeout(() => {
            clearInterval(tickInterval);
            const winningSegment = currentSegments[resolvedWinningIndex];
            playSound('win');
            
            setWinningIndex(resolvedWinningIndex);

            // Award prize immediately to prevent losing it on navigation
            if (winningSegment.value > 0) {
                onWin(winningSegment.value);
            }

            setPrizeToDisplay(winningSegment.value); // Trigger win animation
            setIsSpinning(false);
        }, 5000); // Animation duration
    };
    
    const segmentColors = ['#dc2626', '#16a34a', '#f59e0b', '#dc2626', '#16a34a', '#f59e0b', '#dc2626', '#16a34a']; // Red, Green, Gold theme

    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        {prizeToDisplay !== null && (
            <WinAnimation 
                prize={prizeToDisplay} 
                onAnimationEnd={() => setPrizeToDisplay(null)} 
            />
        )}
        <style>{`
            .animate-winner > div { 
                animation: winner-highlight 1.5s ease-out forwards; 
                z-index: 10; 
                position: relative;
                filter: brightness(1.15);
            }
            @keyframes winner-highlight {
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `}</style>
        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Spin the Wheel!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          {hasUsedDailySpin ? 'Your free spin is used for today. Buy a spin for bigger prizes!' : 'Try your luck once a day for a guaranteed free prize!'}
        </p>
        
        <div className="relative w-full max-w-sm aspect-square mb-8">
            <div 
                className="absolute w-full h-full rounded-full border-[10px] border-amber-300 dark:border-amber-700 shadow-2xl transition-transform duration-[5000ms] ease-out-circ bg-white dark:bg-gray-700 overflow-hidden"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {wheelSegments.map((segment, index) => {
                    const angle = (360 / wheelSegments.length) * index;
                    const backgroundColor = segmentColors[index % segmentColors.length];
                    return (
                        <div 
                            key={index}
                            className={`absolute w-1/2 h-1/2 origin-bottom-right 
                                ${!isSpinning && winningIndex === index ? 'animate-winner' : ''}`
                            }
                            style={{ 
                                transform: `rotate(${angle}deg)`,
                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)',
                            }}
                        >
                           <div className="w-full h-full flex items-center justify-center" style={{backgroundColor}}>
                                <div 
                                    className="flex flex-col items-center justify-center text-center text-white"
                                    style={{ transform: `translateY(-50%) rotate(${360/wheelSegments.length / 2}deg) ` }}
                                >
                                    <span className="font-extrabold text-2xl md:text-3xl drop-shadow-md">{segment.label}</span>
                                    <span className="text-xs font-semibold drop-shadow-sm">Rs</span>
                                </div>
                           </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4" style={{filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.4))'}}>
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-amber-500"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white dark:bg-gray-800 rounded-full border-8 border-amber-500 z-10 flex items-center justify-center font-bold text-primary-600">
                SPIN
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
                onClick={() => handleSpin(true)}
                disabled={isSpinning || hasUsedDailySpin}
                className="flex-1 px-8 py-4 bg-amber-500 text-white font-bold text-xl rounded-full hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                Free Spin
            </button>
            <button
                onClick={() => handleSpin(false)}
                disabled={isSpinning || balance < 5}
                className="flex-1 px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                Buy Spin (5 Rs)
            </button>
        </div>
      </div>
    );
};

export default SpinWheelView;