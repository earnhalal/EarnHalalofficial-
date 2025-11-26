
import React, { useState, useEffect, useRef } from 'react';
import { PlayCircleIcon, CheckCircleIcon, ArrowRight, FireIcon, CloseIcon, ShieldCheck } from './icons';

interface AdsWatchViewProps {
    onWatchAd: (reward: number) => void;
}

const TOTAL_DAILY_TASKS = 10;
const AD_URL = "https://otieu.com/4/10238788";
const TIMER_DURATION = 30; // 30 seconds
const REWARD_PER_AD = 2.50; // Fixed reward per ad

const AdsWatchView: React.FC<AdsWatchViewProps> = ({ onWatchAd }) => {
    const [completedCount, setCompletedCount] = useState(0);
    const [isViewingAd, setIsViewingAd] = useState(false);
    const [timer, setTimer] = useState(TIMER_DURATION);
    const [canClaim, setCanClaim] = useState(false);
    const [currentTaskNum, setCurrentTaskNum] = useState(0);
    
    // Load daily progress from local storage
    useEffect(() => {
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem('ads_date');
        const storedCount = localStorage.getItem('ads_count');

        if (storedDate === today && storedCount) {
            setCompletedCount(parseInt(storedCount, 10));
        } else {
            // Reset if it's a new day
            localStorage.setItem('ads_date', today);
            localStorage.setItem('ads_count', '0');
            setCompletedCount(0);
        }
    }, []);

    // Timer Logic for In-App Player
    useEffect(() => {
        let interval: any;
        if (isViewingAd && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (isViewingAd && timer === 0) {
            setCanClaim(true);
        }
        return () => clearInterval(interval);
    }, [isViewingAd, timer]);

    const handleStartTask = (taskNum: number) => {
        if (completedCount >= TOTAL_DAILY_TASKS) return;
        setCurrentTaskNum(taskNum);
        setIsViewingAd(true);
        setTimer(TIMER_DURATION);
        setCanClaim(false);
    };

    const handleClaim = () => {
        if (!canClaim) return;
        
        // Update progress
        const newCount = completedCount + 1;
        setCompletedCount(newCount);
        localStorage.setItem('ads_count', newCount.toString());
        
        // Give Reward
        onWatchAd(REWARD_PER_AD);
        
        // Close Player
        setIsViewingAd(false);
    };

    const handleClosePlayer = () => {
        if (canClaim) {
            handleClaim();
        } else {
            const confirmClose = window.confirm("If you close now, you will lose the reward. Are you sure?");
            if (confirmClose) {
                setIsViewingAd(false);
            }
        }
    };

    // --- In-App Ad Player Overlay ---
    if (isViewingAd) {
        const progressPercent = ((TIMER_DURATION - timer) / TIMER_DURATION) * 100;
        
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in font-sans">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                            <PlayCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Ad Task #{currentTaskNum}</h3>
                            <p className="text-xs text-slate-400">Watching Sponsored Content</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClosePlayer}
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Ad Area (Simulated Video Screen) */}
                <div className="flex-1 relative bg-black w-full h-full overflow-hidden">
                    {/* Loading Spinner behind iframe */}
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                    
                    <iframe 
                        src={AD_URL}
                        className="absolute inset-0 w-full h-full z-10 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        title="Ad Content"
                        style={{ border: 'none' }}
                    />
                    
                    {/* Timer Overlay (Video Style) */}
                    {!canClaim && (
                        <div className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full font-mono font-bold border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            00:{timer.toString().padStart(2, '0')}
                        </div>
                    )}
                </div>

                {/* Bottom Control Bar */}
                <div className="p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-white z-20 flex flex-col gap-4 safe-area-bottom">
                    {!canClaim ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Verifying View...</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-center text-xs text-slate-500 mt-2">Please keep this screen open to earn your reward.</p>
                        </div>
                    ) : (
                        <div className="animate-slide-up">
                            <div className="flex items-center justify-center gap-2 mb-4 text-green-400">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span className="font-bold text-lg">Ad Verified Successfully</span>
                            </div>
                            <button 
                                onClick={handleClaim}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-black text-lg shadow-lg shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <FireIcon className="w-5 h-5 text-yellow-300" />
                                Claim {REWARD_PER_AD.toFixed(2)} Rs Reward
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Main Task List View ---
    return (
        <div className="max-w-3xl mx-auto pb-24 animate-fade-in px-4">
            {/* Header Stats */}
            <div className="text-center mb-10 pt-6">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Daily Video Ads</h2>
                <p className="text-slate-500 font-medium">Watch short ads to earn instant cash.</p>
                
                <div className="mt-6 inline-flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1 pr-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${completedCount === TOTAL_DAILY_TASKS ? 'bg-green-500' : 'bg-amber-500'}`}>
                        {Math.round((completedCount / TOTAL_DAILY_TASKS) * 100)}%
                    </div>
                    <div className="ml-3 text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today's Progress</p>
                        <p className="text-sm font-bold text-gray-900">{completedCount} / {TOTAL_DAILY_TASKS} Completed</p>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {Array.from({ length: TOTAL_DAILY_TASKS }).map((_, index) => {
                    const taskNum = index + 1;
                    const isCompleted = taskNum <= completedCount;
                    const isLocked = taskNum > completedCount + 1;
                    const isActive = taskNum === completedCount + 1;

                    return (
                        <button
                            key={taskNum}
                            onClick={isActive ? () => handleStartTask(taskNum) : undefined}
                            disabled={isCompleted || isLocked}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                                ${isCompleted 
                                    ? 'bg-green-50 border-green-200 opacity-80' 
                                    : isActive 
                                        ? 'bg-white border-amber-400 shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                                        : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                }
                            `}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>}
                            
                            <div className="flex items-center gap-4 pl-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                                    ${isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : isActive 
                                            ? 'bg-amber-100 text-amber-700' 
                                            : 'bg-gray-200 text-gray-500'}
                                `}>
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6"/> : taskNum}
                                </div>
                                <div className="text-left">
                                    <h4 className={`font-bold ${isCompleted ? 'text-green-800' : isActive ? 'text-slate-900' : 'text-gray-400'}`}>
                                        Ad Video #{taskNum}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {isCompleted ? 'Completed' : isActive ? 'Tap to Watch' : 'Locked'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${isActive ? 'text-amber-600' : 'text-gray-400'}`}>
                                    +{REWARD_PER_AD.toFixed(2)} Rs
                                </span>
                                {isActive && (
                                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-amber-500 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {completedCount === TOTAL_DAILY_TASKS && (
                <div className="mt-8 p-6 bg-green-600 rounded-3xl text-white text-center shadow-xl animate-fade-in-up">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">All Tasks Completed!</h3>
                    <p className="text-green-100 mb-0">Come back tomorrow for 10 new videos.</p>
                </div>
            )}
        </div>
    );
};

export default AdsWatchView;
