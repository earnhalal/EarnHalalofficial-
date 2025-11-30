
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth, serverTimestamp, increment } from '../firebase';
import { collection, query, onSnapshot, runTransaction, doc, where, getDoc, setDoc } from 'firebase/firestore';
import { TransactionType } from '../types';
import type { UserProfile, AdCampaign, AdSubscription } from '../types';
import { PlayCircleIcon, CloseIcon, CoinIcon, FireIcon, CrownIcon, StarIcon, CheckCircleIcon, ShieldCheck, RocketIcon, ClockIcon, ExchangeIcon, BriefcaseIcon } from './icons';

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
        features: ['30 Ads Daily', 'No Waiting', 'Standard Support'],
        color: 'from-blue-500 to-cyan-500',
        icon: <StarIcon className="w-6 h-6 text-white" />
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1000,
        dailyLimit: 60,
        durationDays: 30,
        features: ['60 Ads Daily', 'Skip Waiting', 'Priority Access'],
        color: 'from-purple-500 to-pink-500',
        icon: <ShieldCheck className="w-6 h-6 text-white" />,
        isPopular: true
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 2000,
        dailyLimit: 9999, // Unlimited
        durationDays: 365,
        features: ['Unlimited Ads', 'Valid for 1 Year', 'VIP Badge & Support'],
        color: 'from-amber-400 to-yellow-600',
        icon: <CrownIcon className="w-6 h-6 text-white" />
    }
];

const DEFAULT_USD_REWARD = 0.015; // Approx 4 PKR
const DEFAULT_EXCHANGE_RATE = 280; // 1 USD = 280 PKR
const COOLDOWN_SECONDS = 5; // Soft cooldown for everyone between slots

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
    const [adsPool, setAdsPool] = useState<AdCampaign[]>([]);
    const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [adCompleted, setAdCompleted] = useState(false);
    const [statusText, setStatusText] = useState("Initializing Slot...");

    // System State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showSubModal, setShowSubModal] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
    const [conversionRate, setConversionRate] = useState(DEFAULT_EXCHANGE_RATE);
    
    // Slot Logic State
    const [slotsUsed, setSlotsUsed] = useState(0);
    const [nextDayReset, setNextDayReset] = useState<number>(0); // Timestamp
    
    // Constant for the ad duration
    const AD_DURATION = 15; 

    // 1. Fetch User & Sub & Progress
    useEffect(() => {
        if (!auth.currentUser) return;
        const unsubUser = onSnapshot(doc(db, "users", auth.currentUser.uid), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setUserProfile(data);

                // Fetch Daily Progress
                const today = new Date().toISOString().split('T')[0];
                const progressRef = doc(db, `users/${auth.currentUser?.uid}/adProgress/${today}`);
                const progressSnap = await getDoc(progressRef);
                
                if (progressSnap.exists()) {
                    setSlotsUsed(progressSnap.data().usedToday || 0);
                } else {
                    setSlotsUsed(0);
                }
            }
        });
        
        // Calculate reset time (Midnight PKT)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setNextDayReset(tomorrow.getTime());

        return () => unsubUser();
    }, []);

    // 2. Fetch Ads Pool
    useEffect(() => {
        const q = query(collection(db, "ads"), where("status", "==", "active"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: AdCampaign[] = [];
            snapshot.forEach(d => {
                fetched.push({ id: d.id, ...d.data() } as AdCampaign);
            });
            setAdsPool(fetched);
        });
        return () => unsubscribe();
    }, []);

    // 3. Subscription Helper
    const currentPlanName = userProfile?.adSubscription?.planName || 'Free';
    const planConfig = AD_PLANS.find(p => p.name === currentPlanName) || AD_PLANS[0];
    
    // Check if plan expired
    const isExpired = userProfile?.adSubscription?.expiryDate 
        ? new Date(userProfile.adSubscription.expiryDate.toDate()) < new Date() 
        : false;
        
    const dailyLimit = isExpired ? AD_PLANS[0].dailyLimit : planConfig.dailyLimit;
    const isVIP = currentPlanName === 'VIP' && !isExpired;

    // 4. Slot Logic
    const handleSlotClick = (slotIndex: number) => {
        if (slotIndex !== slotsUsed + 1) {
            if (slotIndex <= slotsUsed) return; // Already done
            alert("Please unlock the previous slot first.");
            return;
        }
        
        if (slotsUsed >= dailyLimit) {
            setShowSubModal(true);
            return;
        }

        // Pick random ad
        const randomAd = adsPool.length > 0 
            ? adsPool[Math.floor(Math.random() * adsPool.length)]
            : {
                id: 'backup',
                title: 'Sponsored Content',
                rewardPoints: 2,
                rewardUSD: DEFAULT_USD_REWARD,
                source: 'direct_link',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 15
            } as AdCampaign;

        setActiveAd(randomAd);
        setTimeLeft(AD_DURATION);
        setIsPlaying(true);
        setAdCompleted(false);
        setStatusText("Loading Slot...");
    };

    // 5. Claim Logic (Cloud Function Simulation)
    const handleClaim = async () => {
        if (!auth.currentUser || !activeAd || isClaiming) return;
        setIsClaiming(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const today = new Date().toISOString().split('T')[0];
                const progressRef = doc(db, `users/${auth.currentUser!.uid}/adProgress/${today}`);
                
                const userDoc = await transaction.get(userRef);
                const progressDoc = await transaction.get(progressRef);
                
                // Read fresh data
                const currentUsed = progressDoc.exists() ? progressDoc.data().usedToday : 0;
                
                if (currentUsed >= dailyLimit) {
                    throw "Daily Limit Reached";
                }

                // Calculate Rewards
                // Use ad specific USD if available, else default
                const usdReward = activeAd.rewardUSD || DEFAULT_USD_REWARD;
                const pkrCredit = Math.ceil(usdReward * conversionRate);

                // Update Wallet
                transaction.update(userRef, {
                    balance: increment(pkrCredit),
                    tasksCompletedCount: increment(1)
                });

                // Update Progress
                if (!progressDoc.exists()) {
                    transaction.set(progressRef, { date: today, usedToday: 1, slots: [{ slotId: 1, status: 'completed' }] });
                } else {
                    transaction.update(progressRef, { 
                        usedToday: increment(1),
                        // In a real array update we'd append, but for simplicity just increment counter is enough for logic
                    });
                }

                // Log Transaction
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));
                transaction.set(txRef, {
                    type: TransactionType.AD_WATCH,
                    description: `Slot ${currentUsed + 1} Completed`,
                    amount: pkrCredit,
                    date: serverTimestamp(),
                    status: 'Approved',
                    usdValue: usdReward
                });
            });

            // Local State Update
            setSlotsUsed(prev => prev + 1);
            setAdCompleted(true);
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error("Claim failed:", error);
            alert(error === "Daily Limit Reached" ? "Daily limit reached." : "Transaction failed.");
            handleClose();
        } finally {
            setIsClaiming(false);
        }
    };

    const handleClose = () => {
        setActiveAd(null);
        setIsClaiming(false);
        setIsPlaying(false);
        setTimeLeft(0);
    };

    // Timer Tick
    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (isPlaying && timeLeft === 0 && !adCompleted) {
            setAdCompleted(true);
        }
    }, [isPlaying, timeLeft, adCompleted]);

    // Format Countdown
    const [timeToReset, setTimeToReset] = useState("");
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = nextDayReset - Date.now();
            if (diff <= 0) {
                setTimeToReset("00:00:00");
                return;
            }
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeToReset(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [nextDayReset]);

    const handleBuyPlan = async (plan: AdPlan) => {
        // ... (Same logic as previous implementation, simplified here for brevity)
        if (!auth.currentUser || !userProfile) return;
        setProcessingPlan(plan.id);
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data() as UserProfile;
                if (plan.price > 0 && userData.balance < plan.price) throw "Insufficient balance";
                
                let expiryDate = null;
                if (plan.durationDays > 0) {
                    const d = new Date(); d.setDate(d.getDate() + plan.durationDays); expiryDate = d;
                }

                if (plan.price > 0) {
                    transaction.update(userRef, { balance: increment(-plan.price) });
                }
                
                // Fix: Correctly update adSubscription using nested object syntax or whole object
                // Using whole object to ensure type safety
                const newSub: AdSubscription = {
                    planName: plan.name,
                    dailyLimit: plan.dailyLimit,
                    expiryDate: expiryDate
                };
                
                transaction.update(userRef, { adSubscription: newSub });
            });
            setShowSubModal(false);
            alert("Plan upgraded!");
        } catch(e) { alert("Failed: " + e); }
        finally { setProcessingPlan(null); }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 animate-fade-in font-sans">
            
            {/* Header / Dashboard */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                            <StarIcon className="w-3 h-3 text-amber-400" /> {currentPlanName} Plan
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Daily Ad Journey</h2>
                        <p className="text-slate-400 text-sm">Complete slots to unlock instant cash rewards.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
                        <button 
                            onClick={() => setCurrency('USD')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currency === 'USD' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            USD
                        </button>
                        <button 
                            onClick={() => setCurrency('PKR')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currency === 'PKR' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            PKR
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{slotsUsed} / {dailyLimit > 1000 ? '∞' : dailyLimit} Slots</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 relative"
                            style={{ width: `${Math.min(100, (slotsUsed / (dailyLimit > 1000 ? 100 : dailyLimit)) * 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slots Grid */}
            <div className="mb-8">
                {slotsUsed >= dailyLimit && !isVIP ? (
                    <div className="bg-slate-100 border-2 border-slate-200 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <ClockIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-700">Daily Quota Reached</h3>
                        <p className="text-slate-500 font-medium mb-4">Your slots will reset at midnight.</p>
                        <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-xl font-mono text-xl font-bold">
                            {timeToReset}
                        </div>
                        <div className="mt-6">
                            <button onClick={() => setShowSubModal(true)} className="text-blue-600 font-bold hover:underline text-sm">
                                Upgrade Plan to Unlock More Slots
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: isVIP ? 1 : Math.min(dailyLimit, slotsUsed + 5) }).map((_, i) => {
                            const slotNum = isVIP ? slotsUsed + 1 : i + 1;
                            const isCompleted = slotNum <= slotsUsed;
                            const isNext = slotNum === slotsUsed + 1;
                            const isLocked = slotNum > slotsUsed + 1;

                            return (
                                <div 
                                    key={slotNum}
                                    onClick={() => handleSlotClick(slotNum)}
                                    className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300
                                        ${isCompleted 
                                            ? 'bg-green-50 border-green-200 opacity-80' 
                                            : isNext 
                                                ? 'bg-white border-amber-400 shadow-gold cursor-pointer transform hover:-translate-y-1 hover:shadow-xl' 
                                                : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    {isCompleted && (
                                        <div className="absolute top-2 right-2 text-green-500">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                    {isLocked && (
                                        <div className="absolute top-2 right-2 text-slate-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    )}
                                    
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm ${isNext ? 'bg-amber-100 text-amber-600 animate-bounce-short' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {isNext ? <PlayCircleIcon className="w-6 h-6" /> : isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    
                                    <h4 className={`font-black text-lg ${isNext ? 'text-slate-900' : 'text-slate-500'}`}>Slot {isVIP ? '∞' : slotNum}</h4>
                                    
                                    <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/5 font-mono text-xs font-bold text-slate-600">
                                        {currency === 'USD' ? `$${DEFAULT_USD_REWARD}` : `${Math.ceil(DEFAULT_USD_REWARD * conversionRate)} PKR`}
                                    </div>
                                    
                                    {isNext && (
                                        <div className="absolute -bottom-3 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                                            START
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Ad Player Overlay */}
            {activeAd && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in font-sans">
                    {adCompleted && !isClaiming && <ConfettiExplosion />}
                    
                    <button onClick={handleClose} className="absolute top-4 right-4 z-50 p-2 bg-black/40 rounded-full text-white/80 hover:text-white backdrop-blur-sm">
                        <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex-1 flex items-center justify-center relative bg-black">
                        {/* Mock Video Player for Demo */}
                        <div className="w-full h-full max-w-4xl max-h-[80vh] bg-slate-900 relative flex items-center justify-center">
                            <video 
                                src={activeAd.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} 
                                autoPlay 
                                className="w-full h-full object-contain"
                                loop
                                playsInline
                            />
                            {/* Overlay Timer */}
                            {!adCompleted && (
                                <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-xl font-mono text-xl font-bold backdrop-blur-md border border-white/10">
                                    {timeLeft}s
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-slate-800 text-center">
                        {!adCompleted ? (
                            <div>
                                <p className="text-slate-400 text-sm mb-2 font-bold uppercase tracking-wider animate-pulse">{statusText}</p>
                                <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 transition-all duration-1000 ease-linear" style={{ width: `${((AD_DURATION - timeLeft) / AD_DURATION) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-slide-up">
                                <h3 className="text-2xl font-black text-green-400 mb-4">Slot Completed!</h3>
                                {isClaiming ? (
                                    <button disabled className="w-full max-w-md mx-auto py-4 bg-slate-800 rounded-2xl font-bold text-white opacity-50 cursor-not-allowed">
                                        Adding to Wallet...
                                    </button>
                                ) : (
                                    <button onClick={handleClaim} className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-white text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                        <CheckCircleIcon className="w-6 h-6" />
                                        Collect Reward
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sub Modal */}
            {showSubModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-5xl max-h-[90vh] flex flex-col relative animate-scale-up overflow-hidden">
                        <button onClick={() => setShowSubModal(false)} className="absolute top-4 right-4 z-20 bg-black/10 p-2 rounded-full hover:bg-black/20 text-slate-900 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="p-8 bg-slate-50 border-b border-gray-200 text-center">
                            <h2 className="text-2xl font-black text-slate-900">Unlock More Slots</h2>
                            <p className="text-slate-500">Choose a plan to increase your daily earning limit.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {AD_PLANS.map(plan => (
                                    <div key={plan.id} className="border rounded-2xl p-6 hover:shadow-xl transition-all text-center group hover:border-amber-400 relative overflow-hidden">
                                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                                            {plan.icon}
                                        </div>
                                        <h3 className="font-bold text-lg">{plan.name}</h3>
                                        <p className="text-2xl font-black mt-2 mb-4">{plan.price} <span className="text-xs font-normal text-gray-500">PKR</span></p>
                                        <ul className="text-sm text-left space-y-2 mb-6 text-gray-600">
                                            {plan.features.map(f => <li key={f} className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> {f}</li>)}
                                        </ul>
                                        <button 
                                            onClick={() => handleBuyPlan(plan)}
                                            disabled={processingPlan !== null || currentPlanName === plan.name}
                                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${currentPlanName === plan.name ? 'bg-green-600 cursor-default' : `bg-gradient-to-r ${plan.color} hover:brightness-110`}`}
                                        >
                                            {currentPlanName === plan.name ? 'Active' : 'Choose Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-short { animation: bounce-short 2s infinite; }
            `}</style>
        </div>
    );
};

export default WatchAdsView;

/*
// =================================================================================
// HYPOTHETICAL FIREBASE CLOUD FUNCTION (node.js) - DELIVERABLE REFERENCE
// =================================================================================
// This code is simulated via client-side transaction in the component above
// for this specific architecture, but this is how the backend function would look.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.collectAdReward = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const uid = context.auth.uid;
    const { adId, slotIndex } = data;
    const today = new Date().toISOString().split('T')[0];
    
    const userRef = db.doc(`users/${uid}`);
    const progressRef = db.doc(`users/${uid}/adProgress/${today}`);
    const adRef = db.doc(`ads/${adId}`); // If verifying against specific ad params

    return db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        const progressDoc = await t.get(progressRef);
        const userData = userDoc.data();
        
        // 1. Determine Quota based on Subscription
        const plan = userData.adSubscription ? userData.adSubscription.planName : 'Free';
        let dailyLimit = 10;
        if (plan === 'Starter') dailyLimit = 30;
        if (plan === 'Pro') dailyLimit = 60;
        if (plan === 'VIP') dailyLimit = 9999;

        // 2. Check Progress
        let usedToday = 0;
        if (progressDoc.exists) {
            usedToday = progressDoc.data().usedToday || 0;
        }

        if (usedToday >= dailyLimit) {
            throw new functions.https.HttpsError('resource-exhausted', 'Daily limit reached.');
        }

        // 3. Validation
        // Verify slot sequence if strictly enforcing sequential server-side
        // if (slotIndex !== usedToday + 1) throw ...

        // 4. Calculate Rewards
        const configSnap = await t.get(db.doc('config/rewardsConversion'));
        const conversionRate = configSnap.exists ? configSnap.data().rate : 278;
        const rewardUSD = 0.015; // Could fetch from adRef
        const creditPKR = Math.ceil(rewardUSD * conversionRate);

        // 5. Commit Updates
        t.update(userRef, {
            balance: admin.firestore.FieldValue.increment(creditPKR),
            tasksCompletedCount: admin.firestore.FieldValue.increment(1)
        });

        if (!progressDoc.exists) {
            t.set(progressRef, { date: today, usedToday: 1, slots: [{slot: 1, status: 'completed'}] });
        } else {
            t.update(progressRef, { usedToday: admin.firestore.FieldValue.increment(1) });
        }

        // 6. Audit Log
        t.set(userRef.collection('transactions').doc(), {
            type: 'Ad Watch Reward',
            amount: creditPKR,
            usdValue: rewardUSD,
            date: admin.firestore.FieldValue.serverTimestamp(),
            description: `Slot ${usedToday + 1} Reward`
        });

        return { success: true, credited: creditPKR, newBalance: userData.balance + creditPKR };
    });
});
*/
