// components/SpinWheelView.tsx
import React, { useState, useEffect, useRef } from 'react';
import WinAnimation from './WinAnimation';
import { SparklesIcon, CoinIcon, PointIcon, CrownIcon, LightningIcon, RefreshIcon } from './icons';

interface SpinWheelViewProps {
  onWin: (amount: number, type: 'cash' | 'points' | 'boost' | 'none') => void;
  balance: number;
  onBuySpin: (cost: number) => Promise<boolean>;
}

// Data directly matched with image design, converted to Rs
const wheelData = [
    { value: 1, type: 'cash', label: '1 Rs Cash', icon: 'coin' },
    { value: 2, type: 'cash', label: '2 Rs Cash', icon: 'coin' },
    { value: 50, type: 'points', label: '50 Task Points', icon: 'point' },
    { value: 0, type: 'boost', label: 'Free Task Boost', icon: 'lightning' },
    { value: 0, type: 'none', label: 'Try Again', icon: 'refresh' },
    { value: 100, type: 'points', label: '100 Task Points', icon: 'point' },
    { value: 5, type: 'cash', label: '5 Rs Cash', icon: 'coin' },
    { value: 100, type: 'cash', label: 'Jackpot: 100 Rs!', icon: 'crown' } // Jackpot
];

// SEGMENT COLORS based on image (Gold and Dark Blue)
const segmentColors = ['#FBDF5D', '#0C1C4B', '#FBDF5D', '#0C1C4B', '#FBDF5D', '#0C1C4B', '#FBDF5D', '#0C1C4B'];

// Helper to render icons based on type
const getSegmentIcon = (iconName: string, className: string) => {
    switch (iconName) {
        case 'coin': return <CoinIcon className={className} />;
        case 'point': return <PointIcon className={`${className} text-orange-400`} />;
        case 'crown': return <CrownIcon className={`${className} w-10 h-10`} />;
        case 'lightning': return <LightningIcon className={className} />;
        case 'refresh': return <RefreshIcon className={className} />;
        default: return null;
    }
};

const SpinWheelView: React.FC<SpinWheelViewProps> = ({ onWin, balance, onBuySpin }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winningIndex, setWinningIndex] = useState<number | null>(null);
    const [hasUsedDailySpin, setHasUsedDailySpin] = useState(true);
    const [prizeToDisplay, setPrizeToDisplay] = useState<{label: string, value: number, type: 'cash'|'points'|'boost'|'none'} | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const lastSpinDate = localStorage.getItem('lastSpinDateTaskMint');
        const today = new Date().toDateString();
        setHasUsedDailySpin(lastSpinDate === today);
        
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio, { once: true });
    }, []);

    // ** Weighted Probability Logic **
    // Index:   0, 1, 2, 3, 4, 5, 6, 7
    // Total Weights = 100 (Approximate chances in %)
    const getWeightedPrize = () => {
        const weights = [
            25, // 1 Rs (Easy)
            20, // 2 Rs (Easy)
            15, // 50 Points (Medium)
            10, // Free Boost (Medium)
            14, // Try Again (Common)
            10, // 100 Points (Hard)
            5,  // 5 Rs Cash (Hard)
            1   // Jackpot (100 Rs - Very Rare - 1%)
        ]; 
        let random = Math.random() * 100;
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (random <= sum) return i;
        }
        return 4; // Default to 'Try Again' as a safety net
    };

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
            oscillator.frequency.setValueAtTime(Math.random() * 200 + 700, now);
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
                gain.gain.setValueAtTime(0.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playNote(659.25, now, 0.2); // E5
            playNote(830.61, now + 0.2, 0.2); // G#5
            playNote(987.77, now + 0.4, 0.4); // B5
        }
    };
    
    const handleSpin = async () => {
        if (isSpinning) return;
        
        const isFreeSpin = !hasUsedDailySpin;
        
        if (isFreeSpin) {
            // Check again for safety (if 24 hours logic is separate)
            localStorage.setItem('lastSpinDateTaskMint', new Date().toDateString());
            setHasUsedDailySpin(true);
        } else {
            const purchaseSuccess = await onBuySpin(5); // Buy spin for 5 Rs
            if (!purchaseSuccess) {
                 alert("Insufficient balance! Cannot buy a spin.");
                 return;
            }
        }
        
        setWinningIndex(null);
        setIsSpinning(true);
        // Quicker tick sound for drama
        const tickInterval = setInterval(() => playSound('tick'), 90);

        // Weighted Winner
        const resolvedWinningIndex = getWeightedPrize();
        const segmentAngle = 360 / wheelData.length;
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
        const targetAngle = 360 - (resolvedWinningIndex * segmentAngle) - (segmentAngle / 2) + randomOffset;
        
        const fullSpins = 7; // More dramatic spins
        const finalRotation = rotation + (360 * fullSpins) + targetAngle;
        setRotation(finalRotation);

        setTimeout(() => {
            clearInterval(tickInterval);
            const winningSegment = wheelData[resolvedWinningIndex];
            playSound('win');
            
            setWinningIndex(resolvedWinningIndex);
            
            // Haptic Feedback for Mobile
            if ("vibrate" in navigator) {
                window.navigator.vibrate([100, 50, 200]);
            }

            // Award prize immediately
            onWin(winningSegment.value, winningSegment.type);
            setPrizeToDisplay(winningSegment);
            setIsSpinning(false);
        }, 5000); // 5-second animation
    };
    
    return (
      <div className="min-h-screen bg-[#060D2D] p-6 text-center font-sans">
        {prizeToDisplay !== null && (
            <WinAnimation 
                prizeText={prizeToDisplay.label} 
                onAnimationEnd={() => setPrizeToDisplay(null)} 
            />
        )}
        
        <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-2">
                TaskMint <span className="text-yellow-400">Spin & Win!</span>
            </h1>
            <button className="p-3 bg-gray-800 rounded-2xl hover:bg-gray-700 transition">
                <span className="text-white text-3xl">×</span>
            </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center max-w-7xl mx-auto">
            {/* Recent Winners (Left Panel) - Static for now */}
            <div className="bg-[#0C1C4B] p-7 rounded-3xl shadow-2xl text-left border border-gray-700">
                <h3 className="text-2xl font-bold text-gray-300 mb-8 border-b border-gray-700 pb-4">Recent Winners</h3>
                <div className="space-y-5">
                    {[
                        {name: 'Alex M.', prize: '1 Rs'},
                        {name: 'Sarah K.', prize: '50 Points', type: 'point'},
                        {name: 'David L.', prize: 'Boost', type: 'boost'},
                        {name: 'Emily R.', prize: '2 Rs Cash'},
                        {name: 'Chris B.', prize: '100 Points', type: 'point'}
                    ].map((winner, idx) => {
                         const prizeColor = winner.type === 'point' ? 'text-orange-400' : (winner.type === 'boost' ? 'text-lightning' : 'text-yellow-400');
                         return (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${idx === 1 ? 'bg-gray-900/40 border border-yellow-600/50' : ''}`}>
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-400 text-lg">{winner.name.split(' ').map(n=>n[0]).join('')}</div>
                                <div><p className="text-white text-base">{winner.name} won</p><p className={`${prizeColor} font-semibold`}>{winner.prize}</p></div>
                            </div>
                         );
                    })}
                </div>
            </div>

            {/* The Wheel (Center) */}
            <div className="relative flex flex-col items-center justify-center scale-95 lg:scale-100">
                <div className="relative w-full max-w-[480px] aspect-square rounded-full border-[10px] border-[#FBDF5D] shadow-[0_0_80px_rgba(251,223,93,0.3)] bg-gray-800 overflow-hidden"
                     style={{
                         transform: `rotate(${rotation}deg)`,
                         transition: `transform 5000ms cubic-bezier(0.2, 0.8, 0.2, 1)`, // Smoother ease-out
                    }}
                >
                    {wheelData.map((segment, index) => {
                        const angle = (360 / wheelData.length) * index;
                        const bgColor = segmentColors[index % segmentColors.length];
                        const textColor = segment.type === 'none' ? 'text-gray-400' : 'text-gray-900';
                        const iconColor = bgColor === '#FBDF5D' ? 'text-yellow-900' : 'text-yellow-300';
                        
                        return (
                            <div key={index}
                                className={`absolute w-1/2 h-1/2 origin-bottom-right 
                                    ${!isSpinning && winningIndex === index ? 'animate-winner' : ''}`
                                }
                                style={{ transform: `rotate(${angle}deg)`, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)'}}
                            >
                               <div className="w-full h-full flex items-center justify-center" style={{backgroundColor: bgColor}}>
                                    <div 
                                        className="flex flex-col items-center justify-center text-center p-3"
                                        style={{ transform: `translateY(-40%) rotate(${360/wheelData.length / 2}deg)` }}
                                    >
                                        {getSegmentIcon(segment.icon, iconColor)}
                                        <span className={`font-extrabold text-2xl drop-shadow ${textColor}`}>{segment.label}</span>
                                    </div>
                               </div>
                            </div>
                        );
                    })}
                </div>
                 {/* Center Gold Point - SPIN Button now integrated */}
                <div onClick={handleSpin} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#CB9D1C] to-[#FBDF5D] rounded-full border-4 border-[#CB9D1C] z-30 flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all">
                    <SparklesIcon className="w-10 h-10 text-[#0C1C4B]" />
                </div>
                 {/* Pointer (From Image) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-40">
                    <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-yellow-500 shadow-lg"></div>
                </div>
            </div>

            {/* Rules & Info (Right Panel) */}
            <div className="bg-[#0C1C4B] p-7 rounded-3xl shadow-2xl text-left border border-gray-700">
                <h3 className="text-2xl font-bold text-gray-300 mb-8 border-b border-gray-700 pb-4">Rules & Info</h3>
                <ul className="space-y-5 text-white list-disc list-inside text-base">
                    <li>One free spin every 24 hours (today's is used).</li>
                    <li>Prizes are credited immediately.</li>
                    <li>Weighted spins. Try Again chances: 14%.</li>
                    <li>Check Rewards page for details.</li>
                    <li>Only valid for users above 18.</li>
                    <li>Good luck, TaskMint users!</li>
                </ul>
            </div>
        </div>
        
        {/* White SPIN NOW Button (From Image) */}
        <div className="mt-20 flex flex-col items-center justify-center">
            <button
                onClick={handleSpin}
                disabled={isSpinning || (hasUsedDailySpin && balance < 5)}
                className="px-20 py-6 bg-white text-gray-900 font-extrabold text-3xl rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_5px_40px_rgba(255,255,255,0.25)] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 relative"
            >
                {hasUsedDailySpin ? 'SPIN NOW (5 Rs)' : 'SPIN NOW (FREE!)'}
            </button>
            <div className="mt-6 text-gray-300 text-lg bg-gray-900/50 p-3 rounded-full px-6 border border-gray-700">Balance: {balance.toFixed(2)} Rs</div>
        </div>
        
        <style>{`
            .animate-winner > div { 
                animation: winner-highlight 2s ease-out forwards; 
                z-index: 10; 
                position: relative;
                filter: brightness(1.3) contrast(1.1);
            }
            @keyframes winner-highlight {
                0% { transform: scale(1); filter: brightness(1.3); }
                50% { transform: scale(1.08) translateY(-3px); filter: brightness(1.5); }
                100% { transform: scale(1); filter: brightness(1.3); }
            }
        `}</style>

      </div>
    );
};

export default SpinWheelView;
                         
