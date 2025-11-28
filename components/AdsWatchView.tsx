
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircleIcon, CheckCircleIcon, FireIcon, CloseIcon, ShieldCheck, EyeIcon, ArrowRight, StarIcon, CodeIcon, CoinIcon } from './icons';
import { db, auth, serverTimestamp, increment } from '../firebase';
import { doc, getDoc, collection, addDoc, runTransaction, query, where, onSnapshot } from 'firebase/firestore';
import type { UserProfile, AdCampaign } from '../types';
import { TransactionType } from '../types';

interface AdsWatchViewProps {
    onWatchAd: (reward: number) => void;
}

// Default configuration if ad doesn't specify duration
const DEFAULT_DURATION = 25;
const COOLDOWN_SECONDS = 120; // 2 minutes between ads

const PLAN_CONFIG: Record<string, { dailyLimit: number }> = {
    'Free': { dailyLimit: 12 },
    'Starter': { dailyLimit: 12 },
    'Growth': { dailyLimit: 20 },
    'Business': { dailyLimit: 9999 },
    'Enterprise': { dailyLimit: 9999 }
};

// --- VAST Parsing Utility ---
const parseVastXml = async (url: string): Promise<string | null> => {
    try {
        console.log("Fetching VAST XML:", url);
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Attempt to find a MediaFile node (preferred: mp4)
        const mediaFiles = xmlDoc.getElementsByTagName("MediaFile");
        
        if (mediaFiles.length === 0) {
            console.warn("No MediaFiles found in VAST");
            return null;
        }

        let selectedUrl = null;
        for (let i = 0; i < mediaFiles.length; i++) {
            const type = mediaFiles[i].getAttribute("type");
            const content = mediaFiles[i].textContent?.trim();
            if (type && (type.includes("mp4") || type.includes("webm"))) {
                selectedUrl = content;
                break; 
            }
        }

        // Fallback
        if (!selectedUrl && mediaFiles.length > 0) {
            selectedUrl = mediaFiles[0].textContent?.trim();
        }

        return selectedUrl || null;
    } catch (error) {
        console.error("Error parsing VAST:", error);
        return null;
    }
};

const AdsWatchView: React.FC<AdsWatchViewProps> = ({ onWatchAd }) => {
    // User State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [dailyCount, setDailyCount] = useState(0);
    const [cooldownLeft, setCooldownLeft] = useState(0);
    
    // Ads Data State
    const [ads, setAds] = useState<AdCampaign[]>([]);
    const [loadingAds, setLoadingAds] = useState(true);
    const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);

    // Player State
    const [isViewing, setIsViewing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [targetDuration, setTargetDuration] = useState(DEFAULT_DURATION);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Video Player State
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Refs
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scriptContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Fetch Ads
    useEffect(() => {
        setLoadingAds(true);
        const q = query(collection(db, "ads"), where("status", "==", "active"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const fetchedAds: AdCampaign[] = [];

            snapshot.forEach((doc) => {
                try {
                    const data = doc.data();
                    
                    let startDate = new Date(0);
                    if (data.startDate) startDate = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                    else if (data.start_date) startDate = data.start_date.toDate ? data.start_date.toDate() : new Date(data.start_date);

                    let endDate = new Date(8640000000000000);
                    if (data.endDate) endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
                    else if (data.end_date) endDate = data.end_date.toDate ? data.end_date.toDate() : new Date(data.end_date);

                    const isActiveDate = now >= startDate && now <= endDate;

                    if (isActiveDate) {
                        fetchedAds.push({
                            id: doc.id,
                            title: data.title || 'Video Ad',
                            source: data.source || 'direct_link',
                            videoUrl: data.videoUrl || data.video_url || '',
                            vastUrl: data.vastUrl || '', // Support VAST
                            scriptUrl: data.scriptUrl || data.script_url || '',
                            zone_id: data.zone_id || data.zoneId || '',
                            rewardPoints: Number(data.rewardPoints) || Number(data.reward_points) || 0,
                            duration: Number(data.duration) || DEFAULT_DURATION,
                            taskType: data.taskType || data.task_type || 'watch',
                            status: data.status,
                            startDate: startDate,
                            endDate: endDate,
                            targetAudience: data.targetAudience || 'all',
                            createdAt: data.createdAt
                        });
                    }
                } catch (e) {
                    console.error(`[AdsWatchView] Error parsing ad ${doc.id}:`, e);
                }
            });
            
            setAds(fetchedAds);
            setLoadingAds(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Fetch User Data & Cooldown
    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            const userRef = doc(db, "users", auth.currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data() as UserProfile;
                setProfile(data);
                
                const today = new Date().toDateString();
                if (data.lastAdWatchDate !== today) {
                    setDailyCount(0);
                } else {
                    setDailyCount(data.dailyAdWatchCount || 0);
                }

                if (data.lastAdWatchTimestamp) {
                    const lastTime = data.lastAdWatchTimestamp.toDate ? data.lastAdWatchTimestamp.toDate().getTime() : new Date(data.lastAdWatchTimestamp).getTime();
                    const now = Date.now();
                    const diff = Math.floor((now - lastTime) / 1000);
                    if (diff < COOLDOWN_SECONDS) {
                        setCooldownLeft(COOLDOWN_SECONDS - diff);
                    }
                }
            }
        };
        fetchUserData();
    }, [claimStatus]);

    // 3. Cooldown Timer
    useEffect(() => {
        if (cooldownLeft > 0) {
            const timer = setInterval(() => setCooldownLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldownLeft]);

    const config = PLAN_CONFIG[profile?.jobSubscription?.plan || 'Free'] || PLAN_CONFIG['Free'];

    // 4. Anti-Cheat Visibility
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            setIsPaused(true);
            if (videoRef.current) videoRef.current.pause();
        }
    }, []);

    useEffect(() => {
        if (isViewing) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isViewing, handleVisibilityChange]);

    // 5. Start Watch Logic
    const handleStartWatch = async (ad: AdCampaign) => {
        if (cooldownLeft > 0) return;
        if (dailyCount >= config.dailyLimit) return;
        if (!auth.currentUser) return;

        try {
            setActiveAd(ad);
            setIsViewing(true);
            setIsPaused(false);
            setClaimStatus('idle');
            setErrorMessage('');
            setVideoSrc(null);
            
            const duration = ad.duration || DEFAULT_DURATION;
            setTargetDuration(duration);
            setTimer(duration);

            // Backend Session Start
            const sessionRef = await addDoc(collection(db, "ad_sessions"), {
                userId: auth.currentUser.uid,
                adId: ad.id,
                source: ad.source,
                startTime: serverTimestamp(),
                status: 'active',
                targetDuration: duration,
                expectedReward: ad.rewardPoints
            });
            setSessionId(sessionRef.id);

            // Handle Source Specifics
            if (ad.source === 'vast' || ad.source === 'video') {
                setIsVideoLoading(true);
                let src = ad.videoUrl;
                if (ad.source === 'vast' && ad.vastUrl) {
                    const parsedUrl = await parseVastXml(ad.vastUrl);
                    if (parsedUrl) src = parsedUrl;
                }
                setVideoSrc(src || null);
                setIsVideoLoading(false);
            } else {
                // For iframe/script ads, start timer
                intervalRef.current = setInterval(() => {
                    setTimer(prev => {
                        if (prev <= 1) {
                            if (intervalRef.current) clearInterval(intervalRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            // Inject Script for 'propeller' source
            if (ad.source === 'propeller' && ad.scriptUrl) {
                setTimeout(() => {
                    if (scriptContainerRef.current) {
                        scriptContainerRef.current.innerHTML = '';
                        const script = document.createElement('script');
                        script.src = ad.scriptUrl!;
                        script.async = true;
                        if (ad.zone_id) script.dataset.zone = ad.zone_id;
                        scriptContainerRef.current.appendChild(script);
                    }
                }, 500);
            }

        } catch (e) {
            console.error("Error starting ad session:", e);
            setIsViewing(false);
            alert("Could not start ad session.");
        }
    };

    // 6. Resume/Pause Logic
    const handleResume = () => {
        setIsPaused(false);
        if (videoRef.current) videoRef.current.play();
        
        // Resume timer for non-video ads
        if (activeAd && activeAd.source !== 'video' && activeAd.source !== 'vast' && timer > 0) {
             intervalRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    // 7. Video Ended Handler
    const handleVideoEnded = () => {
        setTimer(0); // Force timer completion
        // Optional: Auto claim? Better to let user click claim.
    };

    // 8. Claim Reward
    const handleClaimReward = async () => {
        if (!auth.currentUser || !sessionId || !activeAd) return;
        
        setIsClaiming(true);

        try {
            await runTransaction(db, async (transaction) => {
                const sessionRef = doc(db, "ad_sessions", sessionId);
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));

                const sessionSnap = await transaction.get(sessionRef);
                if (!sessionSnap.exists()) throw "Invalid Session";
                if (sessionSnap.data().status !== 'active') throw "Already claimed.";

                const today = new Date().toDateString();
                
                transaction.update(sessionRef, { status: 'claimed', claimTime: serverTimestamp() });
                transaction.update(userRef, {
                    balance: increment(activeAd.rewardPoints),
                    dailyAdWatchCount: increment(1),
                    lastAdWatchDate: today,
                    lastAdWatchTimestamp: serverTimestamp()
                });
                transaction.set(txRef, {
                    type: TransactionType.AD_WATCH,
                    description: `Watched Ad: ${activeAd.title}`,
                    amount: activeAd.rewardPoints,
                    date: serverTimestamp(),
                    status: 'Approved'
                });
            });

            setClaimStatus('success');
            setDailyCount(prev => prev + 1);
            setCooldownLeft(COOLDOWN_SECONDS);
            onWatchAd(activeAd.rewardPoints);

        } catch (error: any) {
            console.error("Claim failed:", error);
            setClaimStatus('error');
            setErrorMessage("Verification failed. Please try again.");
        } finally {
            setIsClaiming(false);
        }
    };

    const handleClose = () => {
        if (isViewing && timer > 0 && activeAd) {
            if (!window.confirm("You will lose your reward if you close now.")) return;
        }
        setIsViewing(false);
        setIsPaused(false);
        setTimer(0);
        setActiveAd(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // --- Player Render ---
    if (isViewing && activeAd) {
        // Calculate progress based on timer for non-video, or video events for video
        // For simplicity, we use the countdown 'timer' state which decrements
        const progressPercent = ((targetDuration - timer) / targetDuration) * 100;
        const isTimerDone = timer === 0;

        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in font-sans">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 text-white z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                            <FireIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-100">{activeAd.title}</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Do not close window</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-black w-full h-full overflow-hidden flex items-center justify-center">
                    
                    {/* VIDEO PLAYER (HTML5) */}
                    {(activeAd.source === 'video' || activeAd.source === 'vast') && (
                        <div className="w-full h-full flex items-center justify-center">
                            {isVideoLoading ? (
                                <div className="text-white flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-2"></div>
                                    <p>Loading Video...</p>
                                </div>
                            ) : videoSrc ? (
                                <video
                                    ref={videoRef}
                                    src={videoSrc}
                                    autoPlay
                                    playsInline
                                    controls={false} // Disable controls
                                    className="max-h-full max-w-full aspect-video"
                                    onEnded={handleVideoEnded}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onTimeUpdate={(e) => {
                                        const el = e.currentTarget;
                                        const remaining = Math.max(0, Math.ceil(el.duration - el.currentTime));
                                        setTimer(remaining);
                                    }}
                                />
                            ) : (
                                <div className="text-red-500">Failed to load video source.</div>
                            )}
                        </div>
                    )}

                    {/* DIRECT IFRAME */}
                    {activeAd.source === 'direct_link' && activeAd.videoUrl && (
                        <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isPaused ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                            <iframe 
                                src={activeAd.videoUrl}
                                className="w-full h-full border-none bg-black"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                title="Ad Content"
                            />
                        </div>
                    )}

                    {/* PROPELLER SCRIPT */}
                    {activeAd.source === 'propeller' && (
                        <div 
                            ref={scriptContainerRef}
                            className={`w-full h-full flex items-center justify-center bg-white transition-opacity duration-500 ${isPaused ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                        >
                            <div className="text-center">
                                <p className="text-slate-400 text-sm animate-pulse">Loading Partner Ad...</p>
                            </div>
                        </div>
                    )}

                    {/* Paused Overlay */}
                    {isPaused && !isTimerDone && (
                        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <EyeIcon className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">AD PAUSED</h2>
                            <p className="text-slate-400 mb-6">Please keep the window active to earn your reward.</p>
                            <button onClick={handleResume} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors">
                                Resume Watching
                            </button>
                        </div>
                    )}

                    {/* Timer HUD (Only if video controls not overriding) */}
                    {!isTimerDone && !isPaused && (
                        <div className="absolute top-6 right-6 z-30 bg-black/50 backdrop-blur-md rounded-full p-2 flex items-center gap-2 border border-white/10">
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="4" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${progressPercent}, 100`} className="transition-all duration-1000 ease-linear" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-white font-mono w-8 text-center">{timer}s</span>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 text-white z-30">
                    {!isTimerDone ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Verifying View...</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-slide-up">
                            {claimStatus === 'idle' && (
                                <button onClick={handleClaimReward} disabled={isClaiming} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1">
                                    {isClaiming ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-6 h-6 text-white" />
                                            Claim {activeAd.rewardPoints} Rs Reward
                                        </>
                                    )}
                                </button>
                            )}
                            {claimStatus === 'success' && (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-green-400 mb-2 flex items-center justify-center gap-2">
                                        <CheckCircleIcon className="w-6 h-6"/> Reward Claimed!
                                    </h3>
                                    <button onClick={handleClose} className="w-full py-3 bg-slate-800 rounded-xl font-bold text-white hover:bg-slate-700 mt-2">Close Player</button>
                                </div>
                            )}
                            {claimStatus === 'error' && (
                                <div className="text-center">
                                    <p className="text-red-400 font-bold mb-4">{errorMessage}</p>
                                    <button onClick={handleClose} className="w-full py-3 bg-slate-800 rounded-xl text-white">Close</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Main List View ---
    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fade-in px-3 sm:px-4">
            
            {/* Stats Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl mb-8 border border-slate-700/50">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <StarIcon className="w-3 h-3" />
                            {profile?.jobSubscription?.plan || 'Free'} Plan
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Watch & Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Rewards</span>
                        </h2>
                        <p className="text-slate-400 font-medium max-w-md">
                            Watch sponsored videos to earn instantly. Rewards are credited immediately.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[100px]">
                            <p className="text-xs text-slate-400 font-bold uppercase">Daily Limit</p>
                            <p className="text-2xl font-black text-white mt-1">
                                {dailyCount} <span className="text-sm font-medium text-slate-500">/ {config.dailyLimit > 1000 ? '∞' : config.dailyLimit}</span>
                            </p>
                        </div>
                        {cooldownLeft > 0 && (
                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 p-4 rounded-2xl min-w-[120px] flex flex-col items-center justify-center">
                                <p className="text-xs text-red-400 font-bold uppercase mb-1">Cooldown</p>
                                <p className="text-xl font-black text-white font-mono">
                                    {Math.floor(cooldownLeft / 60)}:{(cooldownLeft % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ad Grid */}
            {loadingAds ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading campaigns...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Active Ads</h3>
                    <p className="text-slate-500 font-medium mt-1">Please check back later for new opportunities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map((ad) => {
                        const isLimitReached = dailyCount >= config.dailyLimit;
                        const isCooldown = cooldownLeft > 0;
                        const isDisabled = isLimitReached || isCooldown;

                        return (
                            <div 
                                key={ad.id}
                                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 group bg-white border-gray-100
                                    ${isDisabled ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:border-amber-400 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-xl'}
                                `}
                                onClick={() => !isDisabled && handleStartWatch(ad)}
                            >
                                {/* Thumbnail Area */}
                                <div className="aspect-video bg-slate-100 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                                    
                                    {(ad.source === 'video' || ad.source === 'vast' || (ad.source === 'direct_link' && ad.videoUrl)) ? (
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isDisabled ? 'bg-slate-300' : 'bg-red-600 text-white shadow-lg group-hover:scale-110'}`}>
                                            <PlayCircleIcon className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isDisabled ? 'bg-slate-300' : 'bg-blue-600 text-white shadow-lg group-hover:scale-110'}`}>
                                            <CodeIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white z-20 border border-white/10">
                                        {ad.duration || DEFAULT_DURATION}s
                                    </div>
                                    
                                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase z-20 shadow-sm">
                                        {ad.taskType}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-slate-900 line-clamp-1 text-base">{ad.title}</h4>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                                            <CoinIcon className="w-4 h-4" />
                                            <span className="text-sm font-black">{ad.rewardPoints}</span>
                                        </div>
                                        
                                        {!isDisabled && (
                                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:bg-amber-500 transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isDisabled && (
                                        <div className="mt-3 text-xs font-bold text-center text-slate-400 uppercase tracking-wide bg-slate-50 py-1 rounded-md">
                                            {isLimitReached ? 'Daily Limit Reached' : 'Cooldown Active'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdsWatchView;
