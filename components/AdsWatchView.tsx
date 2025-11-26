
import React, { useState, useEffect, useRef } from 'react';
import { PlayCircleIcon, CheckCircleIcon, ArrowRight, FireIcon, CloseIcon, ShieldCheck, EyeIcon } from './icons';

interface AdsWatchViewProps {
    onWatchAd: (reward: number) => void;
}

const TOTAL_DAILY_TASKS = 10;
const AD_URL = "https://otieu.com/4/10238788";
const TIMER_DURATION = 60; // 1 Minute
const REWARD_PER_AD = 0.00088; // $0.00088

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                        <div className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg font-mono font-bold border border-white/10 flex items-center gap-2 shadow-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            {formatTime(timer)}
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
                                Claim ${REWARD_PER_AD.toFixed(5)} Reward
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Main Task List View (Video Gallery Style) ---
    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fade-in px-2 sm:px-4">
            {/* Header Stats */}
            <div className="mb-8 pt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <PlayCircleIcon className="w-4 h-4" />
                            <span>Watch & Earn</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Daily Video Tasks</h2>
                        <p className="text-slate-400 text-sm">Watch sponsored videos to earn dollar rewards.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="text-right">
                            <p className="text-xs text-slate-300 uppercase tracking-wide font-bold">Your Progress</p>
                            <p className="text-xl font-black text-white">{completedCount} <span className="text-slate-400 text-sm">/ {TOTAL_DAILY_TASKS}</span></p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                            <span className="text-xs font-bold">{Math.round((completedCount / TOTAL_DAILY_TASKS) * 100)}%</span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="3"
                                    strokeDasharray={`${(completedCount / TOTAL_DAILY_TASKS) * 100}, 100`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            className={`group relative flex flex-col w-full text-left rounded-2xl overflow-hidden transition-all duration-300 border-2
                                ${isActive 
                                    ? 'bg-white border-amber-400 shadow-lg hover:shadow-xl hover:-translate-y-1 scale-[1.02] z-10' 
                                    : isCompleted 
                                        ? 'bg-slate-50 border-slate-200 opacity-70 grayscale'
                                        : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                                }
                            `}
                        >
                            {/* Thumbnail Area */}
                            <div className={`relative w-full aspect-video bg-slate-800 flex items-center justify-center overflow-hidden
                                ${isActive ? 'group-hover:brightness-110 transition-all' : ''}
                            `}>
                                {/* Abstract Gradient Background as Thumbnail */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${isActive ? 'from-slate-700 to-slate-900' : 'from-slate-800 to-slate-900'}`}></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                
                                {/* Play Button Overlay */}
                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300
                                    ${isActive 
                                        ? 'bg-red-600 text-white shadow-lg group-hover:scale-110' 
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-600 text-slate-400'
                                    }
                                `}>
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <PlayCircleIcon className="w-6 h-6" />}
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    01:00
                                </div>
                                
                                {/* Status Badge (Top Left) */}
                                {isActive && (
                                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-pulse">
                                        NOW PLAYING
                                    </div>
                                )}
                                {isLocked && (
                                    <div className="absolute top-2 left-2 bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Locked
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-4 flex flex-col gap-1">
                                <h4 className={`font-bold text-sm line-clamp-1 ${isCompleted ? 'text-slate-500' : 'text-slate-900'}`}>
                                    Sponsored Ad #{taskNum}
                                </h4>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-slate-500 font-medium">
                                        {isCompleted ? 'Reward Claimed' : isActive ? 'Click to Watch' : 'Complete previous task'}
                                    </p>
                                    <span className={`text-xs font-black px-2 py-1 rounded-md ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        ${REWARD_PER_AD}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Progress Bar (Visual only) */}
                            {isActive && (
                                <div className="h-1 w-full bg-slate-100">
                                    <div className="h-full bg-red-500 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {completedCount === TOTAL_DAILY_TASKS && (
                <div className="mt-12 p-8 bg-green-600 rounded-3xl text-white text-center shadow-xl animate-fade-in-up relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm">
                            <CheckCircleIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-black mb-2">All Tasks Completed!</h3>
                        <p className="text-green-100 mb-0 text-lg">You've earned your daily rewards. Come back tomorrow for more.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsWatchView;
