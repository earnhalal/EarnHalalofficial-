
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
    const [canClaim, setCanClaim] = useState(false);
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
                        embedCode: data.embedCode || '<div>No Content</div>',
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
        setCanClaim(false);

        // Start Countdown Timer (Visual Backup)
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    // setCanClaim(true); // Now handled via postMessage or backup timer in iframe
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

            // alert(`You earned ${activeAd.rewardAmount} Coins!`);
            handleClose();
        } catch (error) {
            console.error("Error claiming reward:", error);
            alert("Failed to claim reward. Please try again.");
            setIsClaiming(false);
        }
    }, [activeAd, isClaiming, handleClose]);

    // Prepare content for iframe with Bridge Polyfill
    const getIframeContent = (ad: VideoAd) => {
        // Polyfill for React/Web environment to bridge the communication
        const polyfill = `
            <script>
                // Polyfill for React/Web environment
                window.flutter_inappwebview = {
                    callHandler: function(handlerName, args) {
                        console.log("Bridge Call:", handlerName, args);
                        window.parent.postMessage({ type: handlerName, data: args }, '*');
                    }
                };
            </script>
        `;
        
        // EXACT HTML requested by user for HilltopAds
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
                console.log("Ad completed, claiming reward...");
                handleClaim();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleClaim]);

    return (
        <div className="max-w-md mx-auto pb-24 px-4 animate-fade-in min-h-[80vh]">
            {/* Header */}
            <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 mb-4 shadow-lg shadow-red-500/30">
                    <PlayCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Watch Videos & Earn Coins</h2>
                <p className="text-slate-500 mt-2 text-sm">Watch sponsored clips from our partners.</p>
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
                <div className="space-y-4">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-gold transition-all border border-gray-100 group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    {ad.network}
                                </span>
                                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100">
                                    <ClockIcon className="w-3 h-3" />
                                    <span className="text-xs font-bold">{ad.duration}s</span>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-4 relative z-10">{ad.title}</h3>
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <CoinIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-slate-900 text-lg">{ad.rewardAmount} <span className="text-xs font-medium text-slate-400">Coins</span></span>
                                </div>
                                <button 
                                    onClick={() => handleStartWatch(ad)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-green-600/30 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <PlayCircleIcon className="w-4 h-4" /> Watch Now
                                </button>
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
                    <div className="flex-1 bg-black relative">
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
                                    <div className="loading loading-spinner loading-sm"></div> Verifying & Claiming...
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
                                    <p className="text-gray-500 text-[10px] mt-1">Tap screen if video doesn't start</p>
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
    