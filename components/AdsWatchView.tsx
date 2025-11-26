
// components/AdsWatchView.tsx
import React, { useState, useEffect } from 'react';
import { PlayCircleIcon, CheckCircleIcon, CloseIcon, FireIcon } from './icons';

interface AdsWatchViewProps {
    onWatchAd: (reward: number) => void;
}

const ADS_LIST = [
    { id: 1, title: 'Watch: New Strategy Game Trailer', duration: 15, reward: 2.5, type: 'Gaming' },
    { id: 2, title: 'Review: Best Crypto Exchange App', duration: 30, reward: 5.0, type: 'Finance' },
    { id: 3, title: 'Sneak Peek: Upcoming Movie Teaser', duration: 10, reward: 1.5, type: 'Entertainment' },
    { id: 4, title: 'Tutorial: Learn Python in 10 Mins', duration: 45, reward: 8.0, type: 'Education' },
    { id: 5, title: 'Product Demo: Smart Watch Series 9', duration: 20, reward: 3.0, type: 'Tech' },
    { id: 6, title: 'Top 10 Travel Destinations 2025', duration: 25, reward: 4.0, type: 'Travel' },
];

const AdsWatchView: React.FC<AdsWatchViewProps> = ({ onWatchAd }) => {
    const [selectedAd, setSelectedAd] = useState<typeof ADS_LIST[0] | null>(null);
    const [timer, setTimer] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [claimedAds, setClaimedAds] = useState<number[]>([]);

    useEffect(() => {
        let interval: any;
        if (selectedAd && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (selectedAd && timer === 0) {
            setCanClaim(true);
        }
        return () => clearInterval(interval);
    }, [selectedAd, timer]);

    const handleAdClick = (ad: typeof ADS_LIST[0]) => {
        if (claimedAds.includes(ad.id)) return;
        setSelectedAd(ad);
        setTimer(ad.duration);
        setCanClaim(false);
    };

    const handleClaim = () => {
        if (!selectedAd) return;
        onWatchAd(selectedAd.reward);
        setClaimedAds(prev => [...prev, selectedAd.id]);
        setSelectedAd(null);
    };

    const closeAd = () => {
        setSelectedAd(null);
        setTimer(0);
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-2">
            {selectedAd && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                    {/* Simulated Video Player UI */}
                    <div className="w-full max-w-4xl aspect-video bg-gray-900 relative flex items-center justify-center shadow-2xl border-y border-gray-800">
                        <div className="absolute top-4 right-4 z-20">
                            <div className="bg-black/50 text-white px-4 py-2 rounded-full font-mono font-bold backdrop-blur-md border border-white/10">
                                {timer > 0 ? `Ad ends in ${timer}s` : 'Reward Unlocked!'}
                            </div>
                        </div>
                        
                        {/* Content */}
                        {timer > 0 ? (
                            <div className="text-center animate-pulse">
                                <PlayCircleIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                                <p className="text-white/50 text-xl font-bold">Playing Advertisement...</p>
                                <p className="text-white/30 text-sm mt-2">Do not close this window</p>
                            </div>
                        ) : (
                            <div className="text-center animate-scale-up">
                                <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Task Completed!</h2>
                                <p className="text-gray-300 mb-8">You have earned {selectedAd.reward.toFixed(2)} Rs</p>
                                <button 
                                    onClick={handleClaim}
                                    className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-green-500/50 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Claim Reward
                                </button>
                            </div>
                        )}

                        {/* Close Button (Only if user wants to give up, or after claim logic handles closing) */}
                        {timer > 0 && (
                            <button onClick={closeAd} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="text-center mb-10 pt-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-4 border border-red-200">
                    <PlayCircleIcon className="w-4 h-4" /> Video Wall
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Watch & Earn</h2>
                <p className="text-slate-500 max-w-lg mx-auto font-medium">
                    Watch short sponsored videos to earn instant cash rewards. New ads are added hourly.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ADS_LIST.map((ad) => {
                    const isClaimed = claimedAds.includes(ad.id);
                    return (
                        <button
                            key={ad.id}
                            onClick={() => handleAdClick(ad)}
                            disabled={isClaimed}
                            className={`relative bg-white rounded-2xl p-4 shadow-subtle border border-gray-100 transition-all duration-300 text-left group overflow-hidden
                                ${isClaimed ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-lg hover:-translate-y-1 hover:border-red-200'}
                            `}
                        >
                            <div className="aspect-video bg-slate-100 rounded-xl mb-4 relative overflow-hidden">
                                {/* Thumbnail Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-200 group-hover:bg-slate-800 transition-colors duration-500">
                                    <PlayCircleIcon className="w-12 h-12 text-slate-400 group-hover:text-red-500 transition-colors duration-300" />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                                    {ad.duration}s
                                </div>
                                {isClaimed && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-10">
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-green-200">
                                            <CheckCircleIcon className="w-3 h-3" /> Watched
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${isClaimed ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                                    {ad.type}
                                </span>
                                <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                                    <span>+{ad.reward.toFixed(1)}</span>
                                    <span className="text-[10px] text-amber-600/70">Rs</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 leading-tight text-sm line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                                {ad.title}
                            </h3>
                            <p className="text-xs text-slate-400">Sponsored Ad</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AdsWatchView;
