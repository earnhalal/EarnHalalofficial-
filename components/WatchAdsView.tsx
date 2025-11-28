
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth, serverTimestamp, increment } from '../firebase';
import { collection, query, onSnapshot, runTransaction, doc, where } from 'firebase/firestore';
import { TransactionType } from '../types';
import { PlayCircleIcon, CloseIcon, CheckCircleIcon, FireIcon, CoinIcon, ClockIcon } from './icons';

interface VideoAd {
    id: string;
    title: string;
    rewardAmount: number;
    duration: number; // in seconds
    network: string; // e.g., 'HilltopAds'
    embedCode: string; // HTML content
    viewsCount: number;
    maxViews: number;
    expiryDate?: any;
    isActive: boolean;
}

const WatchAdsView: React.FC = () => {
    const [ads, setAds] = useState<VideoAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeAd, setActiveAd] = useState<VideoAd | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);

    // Timer reference
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 1. Fetch Video Ads
    useEffect(() => {
        setLoading(true);
        // Query active ads. We filter maxViews and expiry client-side to handle firestore index limitations cleanly.
        const q = query(collection(db, "video_ads"), where("isActive", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const fetchedAds: VideoAd[] = [];
            
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const expiry = data.expiryDate?.toDate ? data.expiryDate.toDate() : (data.expiryDate ? new Date(data.expiryDate) : null);
                
                // Client-side filtering logic as requested
                if (
                    (data.viewsCount || 0) < (data.maxViews || 10000) &&
                    (!expiry || expiry > now)
                ) {
                    fetchedAds.push({
                        id: docSnap.id,
                        title: data.title || 'Sponsored Video',
                        rewardAmount: Number(data.rewardAmount) || 1,
                        duration: Number(data.duration) || 15,
                        network: data.network || 'Partner',
                        embedCode: data.embedCode || '',
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

    // 2. Handle Watch Click
    const handleStartWatch = (ad: VideoAd) => {
        setActiveAd(ad);
        setTimeLeft(ad.duration);

        // Start Countdown Timer (Visual Backup)
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleClose = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setActiveAd(null);
        setIsClaiming(false);
    }, []);

    // 3. Handle Claim Reward
    const handleClaim = useCallback(async () => {
        if (!auth.currentUser || !activeAd || isClaiming) return;
        setIsClaiming(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const adRef = doc(db, "video_ads", activeAd.id);
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));

                // Increment ad view count
                transaction.update(adRef, { viewsCount: increment(1) });

                // Credit User
                transaction.update(userRef, {
                    balance: increment(activeAd.rewardAmount),
                    tasksCompletedCount: increment(1)
                });

                // Create Transaction
                transaction.set(txRef, {
                    type: TransactionType.AD_WATCH,
                    description: `Watched: ${activeAd.title}`,
                    amount: activeAd.rewardAmount,
                    date: serverTimestamp(),
                    status: 'Approved'
                });
            });

            // Auto close after success
            handleClose();
        } catch (error) {
            console.error("Error claiming reward:", error);
            alert("Failed to claim reward. Please try again.");
            setIsClaiming(false);
        }
    }, [activeAd, isClaiming, handleClose]);

    // Prepare content for iframe with Bridge Polyfill
    const getIframeContent = (ad: VideoAd) => {
        // Polyfill to allow flutter_inappwebview calls to work in the browser via postMessage
        const polyfill = `
            <script>
                if (!window.flutter_inappwebview) {
                    window.flutter_inappwebview = {
                        callHandler: function(handlerName, args) {
                            console.log("Bridge Call:", handlerName, args);
                            window.parent.postMessage({ type: handlerName, data: args }, '*');
                        }
                    };
                }
            </script>
        `;
        
        // Exact HTML requested for HilltopAds
        return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    body, html { margin:0; padding:0; height:100%; background:#000; overflow:hidden; }
  </style>
  ${polyfill}
</head>
<body>
  <!-- HilltopAds Video Slider Code -->
  <script>
  (function(gem){
    var d = document,
        s = d.createElement('script'),
        l = d.scripts[d.scripts.length - 1];
    s.settings = gem || {};
    s.src = "//dead-hour.com/b-X.VWsFd/Gtls0_YbWEcf/CeLme9/uyZbU/l/kHPfTnYa3HMDTfUb3VMTzjUAtYN/jpcwxPNGTYc/zmNigh";
    s.async = true;
    s.referrerPolicy = 'no-referrer-when-downgrade';
    l.parentNode.insertBefore(s, l);
  })({})
  </script>

  <!-- Auto click to start video (important for mobile) -->
  <script>
    document.documentElement.addEventListener('click', function init() {
      document.documentElement.click();
      document.documentElement.removeEventListener('click', init);
    }, {once: true});
  </script>

  <!-- Backup reward after duration (in case callback missing) -->
  <script>
    setTimeout(function() {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler('adCompleted', 'backup');
        console.log("Backup reward triggered");
      }
    }, ${ad.duration * 1000 + 10000}); // +10 sec extra
  </script>
</body>
</html>
        `;
    };

    // Listen for iframe messages (Auto-Claim logic)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'adCompleted') {
                console.log("Ad completed signal received, claiming reward...");
                handleClaim();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleClaim]);

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 animate-fade-in min-h-[80vh]">
            {/* Header */}
            <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 mb-4 shadow-lg shadow-red-500/30">
                    <PlayCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Watch Videos & Earn Coins</h2>
                <p className="text-slate-500 mt-2 text-sm">Watch sponsored clips from our partners to earn real money.</p>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="loading loading-spinner loading-md text-amber-500"></div>
                </div>
            ) : ads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No video ads available right now</h3>
                    <p className="text-slate-500">Check back later for new offers!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map((ad, index) => (
                        <div 
                            key={ad.id} 
                            onClick={() => handleStartWatch(ad)}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                        >
                            {/* Thumbnail Section (YouTube Style) */}
                            <div className="relative aspect-video bg-slate-900 flex items-center justify-center group overflow-hidden">
                                {/* Placeholder Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
                                
                                {/* Decorate Background */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <PlayCircleIcon className="w-32 h-32 text-white" />
                                </div>

                                {/* Play Button Overlay */}
                                <div className="relative z-10 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/80 group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>

                                {/* Duration Badge */}
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md">
                                    0:{ad.duration.toString().padStart(2, '0')}
                                </span>
                            </div>

                            {/* Info Section */}
                            <div className="p-4 flex gap-3 flex-1">
                                {/* Avatar / Network Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 border border-amber-200 shadow-sm">
                                        <CoinIcon className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-1">
                                        {ad.title}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-x-1 text-xs text-gray-500">
                                        <span className="font-medium text-slate-700">{ad.network}</span>
                                        <span>•</span>
                                        <span>{ad.viewsCount > 1000 ? (ad.viewsCount/1000).toFixed(1) + 'K' : ad.viewsCount} views</span>
                                    </div>
                                    
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-green-200">
                                            Reward
                                        </span>
                                        <span className="text-sm font-black text-slate-900">
                                            {ad.rewardAmount} Rs
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Screen Player Modal */}
            {activeAd && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-sm">Ad Playing</span>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Iframe Content */}
                    <div className="flex-1 bg-black relative w-full h-full">
                        <iframe
                            srcDoc={getIframeContent(activeAd)}
                            className="w-full h-full border-none"
                            title="Ad Content"
                            allow="autoplay; encrypted-media; fullscreen"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-6 bg-slate-900 border-t border-slate-800 safe-area-bottom">
                        <div className="flex flex-col items-center justify-center gap-2">
                            {isClaiming ? (
                                <div className="text-green-500 font-bold flex items-center gap-2">
                                    <div className="loading loading-spinner loading-sm"></div> Claiming Reward...
                                </div>
                            ) : (
                                <>
                                    <div className="text-3xl font-mono font-bold text-white">{timeLeft}s</div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Watching...</p>
                                    <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                                        <div 
                                            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                                            style={{ width: `${((activeAd.duration - timeLeft) / activeAd.duration) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-gray-500 text-[10px] mt-1">Please wait for the ad to complete</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchAdsView;
