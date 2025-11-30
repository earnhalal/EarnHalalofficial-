
import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, serverTimestamp, increment } from '../firebase';
import { collection, query, onSnapshot, runTransaction, doc, where } from 'firebase/firestore';
import { TransactionType } from '../types';
import type { UserProfile } from '../types';
import { PlayCircleIcon, CloseIcon, CoinIcon, FireIcon, CrownIcon, StarIcon, CheckCircleIcon, ShieldCheck, RocketIcon, ClockIcon } from './icons';

interface VideoAd {
    id: string;
    title: string;
    rewardAmount: number;
    duration: number; // in seconds
    rawEmbedCode: string;
    viewsCount: number;
    maxViews: number;
    isActive: boolean;
}

interface AdPlan {
    id: string;
    name: 'Free' | 'Starter' | 'Pro' | 'VIP';
    price: number;
    dailyLimit: number;
    durationDays: number;
    features: string[];
    color: string;
    icon: React.ReactNode;
    isPopular?: boolean;
}

const AD_PLANS: AdPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        dailyLimit: 10,
        durationDays: 0,
        features: ['10 Ads Daily', 'Standard Speed', 'Basic Support'],
        color: 'from-slate-500 to-gray-600',
        icon: <PlayCircleIcon className="w-6 h-6 text-white" />
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 500,
        dailyLimit: 30,
        durationDays: 30,
        features: ['30 Ads Daily', 'Valid for 30 Days', 'Standard Support'],
        color: 'from-blue-500 to-cyan-500',
        icon: <StarIcon className="w-6 h-6 text-white" />
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1000,
        dailyLimit: 60,
        durationDays: 30,
        features: ['60 Ads Daily', 'Valid for 30 Days', 'Priority Access'],
        color: 'from-purple-500 to-pink-500',
        icon: <ShieldCheck className="w-6 h-6 text-white" />,
        isPopular: true
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 2000,
        dailyLimit: 9999, // Unlimited effectively
        durationDays: 365,
        features: ['Unlimited Ads', 'Valid for 1 Year', 'VIP Badge & Support'],
        color: 'from-amber-400 to-yellow-600',
        icon: <CrownIcon className="w-6 h-6 text-white" />
    }
];

const DEFAULT_DAILY_LIMIT = 10; // Free user limit
const COOLDOWN_SECONDS = 90; // 1.5 Minutes cooldown

// --- Confetti Component ---
const ConfettiExplosion = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50 flex justify-center">
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                    left: '50%',
                    top: '50%',
                    backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'][i % 5],
                    animationDelay: `${Math.random() * 0.5}s`,
                    // Custom properties for CSS animation
                    //@ts-ignore
                    '--tx': `${(Math.random() - 0.5) * 600}px`,
                    '--ty': `${(Math.random() - 0.5) * 600}px`,
                    '--r': `${Math.random() * 360}deg`,
                }}
            />
        ))}
        <style>{`
            @keyframes confetti {
                0% { opacity: 1; transform: translate(0, 0) scale(1); }
                100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(0); }
            }
            .animate-confetti { animation: confetti 1.5s ease-out forwards; }
        `}</style>
    </div>
);

const WatchAdsView: React.FC = () => {
    // Ad State
    const [ads, setAds] = useState<VideoAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeAd, setActiveAd] = useState<VideoAd | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [adCompleted, setAdCompleted] = useState(false);
    const [statusText, setStatusText] = useState("Initializing Ad...");

    // User/Sub State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showSubModal, setShowSubModal] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    
    // Cooldown State
    const [cooldownLeft, setCooldownLeft] = useState(0);

    // Constant for the ad duration to calculate progress
    const AD_DURATION = 35;

    // Fetch User Profile for Limits & Cooldown
    useEffect(() => {
        if (!auth.currentUser) return;
        const unsubUser = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data() as UserProfile;
                setUserProfile(data);

                // Calculate Cooldown
                if (data.lastAdWatchTimestamp) {
                    const lastWatch = data.lastAdWatchTimestamp.toDate ? data.lastAdWatchTimestamp.toDate() : new Date(data.lastAdWatchTimestamp);
                    const now = new Date();
                    const diffInSeconds = Math.floor((now.getTime() - lastWatch.getTime()) / 1000);
                    
                    if (diffInSeconds < COOLDOWN_SECONDS) {
                        setCooldownLeft(COOLDOWN_SECONDS - diffInSeconds);
                    } else {
                        setCooldownLeft(0);
                    }
                }
            }
        });
        return () => unsubUser();
    }, []);

    // Cooldown Timer Tick
    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const timer = setInterval(() => {
            setCooldownLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownLeft]);

    // Fetch Ads
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "video_ads"), where("isActive", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAds: VideoAd[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                // Basic view limit check on ad side
                if ((data.viewsCount || 0) < (data.maxViews || 10000)) {
                    fetchedAds.push({
                        id: docSnap.id,
                        title: data.title || 'Sponsored Task',
                        rewardAmount: Number(data.rewardAmount) || 1,
                        duration: Number(data.duration) || 30,
                        rawEmbedCode: data.rawEmbedCode || '',
                        viewsCount: data.viewsCount || 0,
                        maxViews: data.maxViews || 10000,
                        isActive: data.isActive
                    });
                }
            });
            setAds(fetchedAds);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleBuyPlan = async (plan: AdPlan) => {
        if (!auth.currentUser || !userProfile) return;
        
        // Prevent buying current plan again
        if (userProfile?.adSubscription?.planName === plan.name) return;

        setProcessingPlan(plan.id);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));
                
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw "User does not exist";
                const userData = userDoc.data() as UserProfile;
                
                // If paid plan, check balance
                if (plan.price > 0 && userData.balance < plan.price) {
                    throw "Insufficient balance";
                }

                // Calculate expiry
                let expiryDate = null;
                if (plan.durationDays > 0) {
                    const date = new Date();
                    date.setDate(date.getDate() + plan.durationDays);
                    expiryDate = date;
                }

                // Deduct balance if paid
                if (plan.price > 0) {
                    transaction.update(userRef, { balance: increment(-plan.price) });
                    transaction.set(txRef, {
                        type: TransactionType.AD_SUBSCRIPTION,
                        description: `Purchased ${plan.name} Ad Plan`,
                        amount: -plan.price,
                        date: serverTimestamp(),
                        status: 'Completed'
                    });
                }

                // Update Subscription
                transaction.update(userRef, {
                    adSubscription: {
                        planName: plan.name,
                        dailyLimit: plan.dailyLimit,
                        expiryDate: expiryDate
                    }
                });
            });

            alert(`Successfully switched to ${plan.name} Plan!`);
            setShowSubModal(false);
        } catch (error: any) {
            console.error("Subscription failed:", error);
            alert(error === "Insufficient balance" ? "Insufficient balance." : "Purchase failed. Please try again.");
        } finally {
            setProcessingPlan(null);
        }
    };

    const currentLimit = userProfile?.adSubscription?.dailyLimit || DEFAULT_DAILY_LIMIT;
    const currentPlanName = userProfile?.adSubscription?.planName || 'Free';
    
    const adsWatchedToday = (() => {
        const today = new Date().toISOString().split('T')[0];
        if (userProfile?.lastAdWatchDate === today) {
            return userProfile.dailyAdWatchCount || 0;
        }
        return 0;
    })();
    
    // Check expiry
    const isPlanExpired = userProfile?.adSubscription?.expiryDate 
        ? new Date(userProfile.adSubscription.expiryDate.toDate()) < new Date() 
        : false;

    const effectiveLimit = isPlanExpired ? DEFAULT_DAILY_LIMIT : currentLimit;
    const remainingAds = Math.max(0, effectiveLimit - adsWatchedToday);

    const handleStartAd = (ad: VideoAd) => {
        if (remainingAds <= 0) {
            setShowSubModal(true); 
            return;
        }
        if (cooldownLeft > 0) return; // Prevent start if cooldown active

        setActiveAd(ad);
        setTimeLeft(AD_DURATION); 
        setIsPlaying(false);
        setAdCompleted(false);
        setStatusText("Loading Ad...");
    };

    const handleClose = useCallback(() => {
        if (timeLeft > 0 && !adCompleted && activeAd) {
            if (!window.confirm("If you leave now, you will lose your reward. Are you sure?")) return;
        }
        setActiveAd(null);
        setIsClaiming(false);
        setIsPlaying(false);
    }, [timeLeft, adCompleted, activeAd]);

    const handleClaim = useCallback(async () => {
        if (!auth.currentUser || !activeAd || isClaiming) return;
        setIsClaiming(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const adRef = doc(db, "video_ads", activeAd.id);
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));

                transaction.update(adRef, { viewsCount: increment(1) });
                
                const today = new Date().toISOString().split('T')[0];
                
                transaction.update(userRef, {
                    balance: increment(activeAd.rewardAmount),
                    tasksCompletedCount: increment(1),
                    dailyAdWatchCount: increment(1),
                    lastAdWatchDate: today,
                    lastAdWatchTimestamp: serverTimestamp() // Set cooldown trigger
                });
                
                transaction.set(txRef, {
                    type: TransactionType.AD_WATCH,
                    description: `Watched: ${activeAd.title}`,
                    amount: activeAd.rewardAmount,
                    date: serverTimestamp(),
                    status: 'Approved'
                });
            });
            
            // Set local cooldown immediately for UI responsiveness
            setCooldownLeft(COOLDOWN_SECONDS);

            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (error) {
            console.error("Claim failed:", error);
            setIsClaiming(false);
            handleClose(); 
        }
    }, [activeAd, isClaiming, handleClose]);

    // Timer Logic & Status Updates
    useEffect(() => {
        let timerId: ReturnType<typeof setInterval>;
        if (isPlaying && timeLeft > 0) {
            timerId = setInterval(() => {
                setTimeLeft(prev => {
                    const newValue = prev - 1;
                    
                    // Dynamic Status
                    if (newValue > 25) setStatusText("Verifying Connection...");
                    else if (newValue > 15) setStatusText("Analyzing Engagement...");
                    else if (newValue > 5) setStatusText("Finalizing Reward...");
                    else if (newValue > 0) setStatusText("Almost There...");
                    else setStatusText("Complete!");

                    if (newValue <= 0) {
                        setAdCompleted(true);
                        return 0;
                    }
                    return newValue;
                });
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [isPlaying, timeLeft]);

    // Iframe Listener for external completion signals
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'adCompleted') {
                setAdCompleted(true);
                setTimeLeft(0);
                setStatusText("Ad Completed!");
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const getIframeContent = (ad: VideoAd) => {
        const embedCode = ad.rawEmbedCode || '<h2 style="color:white;">Loading Ad...</h2>';
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { width: 100%; height: 100%; background-color: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; }
        #ad-wrapper { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
        iframe, video, object, embed { max-width: 100%; max-height: 100%; border: none; }
    </style>
    <script>
        function sendReward() { window.parent.postMessage({ type: 'adCompleted', data: 'done' }, '*'); }
        setTimeout(sendReward, 35000);
    </script>
</head>
<body><div id="ad-wrapper">${embedCode}</div></body>
</html>`;
    };

    const progressPercent = Math.min(100, ((AD_DURATION - timeLeft) / AD_DURATION) * 100);
    
    // Format cooldown time mm:ss
    const formatCooldown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 animate-fade-in min-h-[80vh]">
            
            {/* Header Stats & Subscription Button */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        {currentPlanName === 'VIP' ? <CrownIcon className="w-8 h-8 text-amber-400" /> : <PlayCircleIcon className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Watch & Earn</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span>Daily Limit:</span>
                            <span className={`font-bold ${remainingAds > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {remainingAds} / {effectiveLimit > 1000 ? '∞' : effectiveLimit}
                            </span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setShowSubModal(true)}
                    className="relative z-10 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <CrownIcon className="w-5 h-5" />
                    Increase Limit
                </button>
            </div>

            {/* Cooldown Banner */}
            {cooldownLeft > 0 && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-blue-800">
                        Next Ad Unlocks in <span className="text-xl font-black">{formatCooldown(cooldownLeft)}</span>
                    </span>
                </div>
            )}

            {/* Ads Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 text-sm font-bold">Loading Videos...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Ads Available</h3>
                    <p className="text-slate-500">Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map((ad) => {
                        const isLocked = remainingAds <= 0 || cooldownLeft > 0;
                        return (
                            <div 
                                key={ad.id} 
                                onClick={() => handleStartAd(ad)} 
                                className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all cursor-pointer group flex flex-col transform hover:-translate-y-1 ${isLocked ? 'opacity-60 grayscale pointer-events-none' : 'hover:shadow-xl hover:border-amber-300'}`}
                            >
                                <div className="relative aspect-video bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
                                    <PlayCircleIcon className="w-16 h-16 text-white/80 group-hover:text-amber-400 group-hover:scale-110 transition-all z-10 duration-300 drop-shadow-lg" />
                                    {isLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {cooldownLeft > 0 ? `Wait ${formatCooldown(cooldownLeft)}` : 'Limit Reached'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md z-20">
                                        35s
                                    </span>
                                </div>
                                <div className="p-4 flex gap-3 flex-1 items-center">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
                                        <CoinIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{ad.title}</h3>
                                        <p className="text-xs text-green-600 font-bold">Reward: {ad.rewardAmount} Rs</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col relative animate-scale-up shadow-2xl overflow-hidden">
                        
                        {/* Static Header */}
                        <div className="p-8 text-center bg-slate-900 text-white relative overflow-hidden flex-shrink-0">
                            <button onClick={() => setShowSubModal(false)} className="absolute top-4 right-4 z-20 bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-2">Upgrade Your Earning Power</h2>
                                <p className="text-slate-400">Choose a plan to increase your daily ad watch limit.</p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-6 sm:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {AD_PLANS.map((plan) => {
                                    const isCurrentPlan = currentPlanName === plan.name;
                                    
                                    return (
                                        <div key={plan.id} className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow relative group ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                                            {plan.isPopular && (
                                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                                    POPULAR
                                                </div>
                                            )}
                                            {isCurrentPlan && (
                                                <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm z-10">
                                                    ACTIVE
                                                </div>
                                            )}
                                            
                                            <div className={`p-6 bg-gradient-to-br ${plan.color} text-white text-center relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-inner">
                                                    {plan.icon}
                                                </div>
                                                <h3 className="text-xl font-black uppercase tracking-wider">{plan.name}</h3>
                                                <div className="mt-2 flex items-baseline justify-center">
                                                    <span className="text-3xl font-extrabold">{plan.price === 0 ? 'FREE' : plan.price}</span>
                                                    {plan.price > 0 && <span className="text-sm font-medium opacity-90 ml-1">Rs</span>}
                                                </div>
                                                <p className="text-xs opacity-80 mt-1">{plan.durationDays === 0 ? 'Lifetime' : `for ${plan.durationDays} days`}</p>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    {plan.features.map((feat, i) => (
                                                        <li key={i} className="flex items-center text-sm text-gray-600">
                                                            <CheckCircleIcon className={`w-4 h-4 mr-2 ${plan.name === 'VIP' ? 'text-amber-500' : 'text-green-500'}`} />
                                                            {feat}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button 
                                                    onClick={() => handleBuyPlan(plan)}
                                                    disabled={isCurrentPlan || processingPlan !== null}
                                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-80 disabled:cursor-default disabled:shadow-none
                                                        ${isCurrentPlan 
                                                            ? 'bg-green-600' 
                                                            : `bg-gradient-to-r ${plan.color} hover:brightness-110`
                                                        }`}
                                                >
                                                    {processingPlan === plan.id ? 'Processing...' : 
                                                        isCurrentPlan ? 'Current Plan' :
                                                        (plan.price === 0 ? 'Switch to Free' : 'Buy Plan')
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pro Ad Player Overlay */}
            {activeAd && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in font-sans">
                    {adCompleted && <ConfettiExplosion />}
                    
                    <button 
                        onClick={handleClose} 
                        className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-sm"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex-1 bg-black relative w-full flex items-center justify-center">
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 backdrop-blur-sm transition-opacity duration-500">
                                <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                                    <div className="relative">
                                        <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircleIcon className="w-6 h-6 text-white opacity-50" />
                                        </div>
                                    </div>
                                    <p className="text-white font-bold text-lg animate-pulse tracking-wide">Establishing Secure Connection...</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            srcDoc={getIframeContent(activeAd)}
                            className="w-full h-full border-none"
                            title="Ad Content"
                            allow="autoplay; encrypted-media; fullscreen"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            onLoad={() => setIsPlaying(true)}
                        />
                    </div>
                    
                    {/* Bottom Control Bar */}
                    <div className="bg-slate-900 border-t border-slate-800 p-6 z-20 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        {!adCompleted ? (
                            <div className="max-w-md mx-auto w-full space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg animate-pulse shadow-amber-500/20">
                                             <FireIcon className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-white font-bold text-lg line-clamp-1">{activeAd.title}</h3>
                                             <p className="text-amber-400 text-xs font-bold uppercase tracking-wider animate-pulse">{statusText}</p>
                                         </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">{timeLeft}</span>
                                        <span className="text-xs text-slate-400 font-bold uppercase ml-1">Sec</span>
                                    </div>
                                </div>
                                
                                {/* Pro Progress Bar */}
                                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative shadow-inner border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-linear relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                        style={{ width: `${progressPercent}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 w-full animate-shimmer-slide"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-slide-up flex flex-col items-center">
                                 <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4 tracking-tight">TASK COMPLETED!</h3>
                                 {isClaiming ? (
                                    <button disabled className="w-full max-w-md py-4 bg-slate-800 rounded-2xl font-bold text-white flex items-center justify-center gap-2 cursor-not-allowed">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Verifying Reward...
                                    </button>
                                ) : (
                                    <button onClick={handleClaim} className="w-full max-w-md py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl shadow-green-500/30 hover:scale-105 transition-transform animate-bounce-short">
                                        <CheckCircleIcon className="w-7 h-7" />
                                        CLAIM {activeAd.rewardAmount} Rs
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes shimmer-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer-slide { animation: shimmer-slide 2s infinite linear; }
            `}</style>
        </div>
    );
};

export default WatchAdsView;
