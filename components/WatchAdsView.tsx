
import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, serverTimestamp, increment } from '../firebase';
import { collection, query, onSnapshot, runTransaction, doc, where } from 'firebase/firestore';
import { TransactionType } from '../types';
import { PlayCircleIcon, CloseIcon, CoinIcon } from './icons';

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

const WatchAdsView: React.FC = () => {
    const [ads, setAds] = useState<VideoAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeAd, setActiveAd] = useState<VideoAd | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "video_ads"), where("isActive", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAds: VideoAd[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if ((data.viewsCount || 0) < (data.maxViews || 10000)) {
                    fetchedAds.push({
                        id: docSnap.id,
                        title: data.title || 'Sponsored Task',
                        rewardAmount: Number(data.rewardAmount) || 1,
                        duration: Number(data.duration) || 15,
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

    const handleClose = useCallback(() => {
        setActiveAd(null);
        setIsClaiming(false);
    }, []);

    const handleClaim = useCallback(async () => {
        if (!auth.currentUser || !activeAd || isClaiming) return;
        setIsClaiming(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", auth.currentUser!.uid);
                const adRef = doc(db, "video_ads", activeAd.id);
                const txRef = doc(collection(db, "users", auth.currentUser!.uid, "transactions"));

                transaction.update(adRef, { viewsCount: increment(1) });
                transaction.update(userRef, {
                    balance: increment(activeAd.rewardAmount),
                    tasksCompletedCount: increment(1)
                });
                transaction.set(txRef, {
                    type: TransactionType.AD_WATCH,
                    description: `Watched: ${activeAd.title}`,
                    amount: activeAd.rewardAmount,
                    date: serverTimestamp(),
                    status: 'Approved'
                });
            });
            
            handleClose();
        } catch (error) {
            console.error("Claim failed:", error);
            setIsClaiming(false);
            handleClose(); 
        }
    }, [activeAd, isClaiming, handleClose]);

    // The clean HTML structure requested, with React Web polyfill for message passing
    const getIframeContent = (ad: VideoAd) => {
        // Use rawEmbedCode directly as requested. If missing, show fallback text.
        const embedCode = ad.rawEmbedCode || '<h1 style="color:white; text-align:center; font-family:sans-serif; margin-top:40px;">No Ad Code Found</h1>';
        const timerDuration = (ad.duration * 1000) + 20000;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta charset="utf-8">
  <style>
    body,html{margin:0;padding:0;height:100%;background:#000;overflow:hidden;display:flex;justify-content:center;align-items:center;}
    iframe { border: none; width: 100%; height: 100%; }
  </style>
  <script>
    // Polyfill for React Web App to capture flutter handler calls from scripts
    if (!window.flutter_inappwebview) {
        window.flutter_inappwebview = {
            callHandler: function(handlerName, args) {
                window.parent.postMessage({ type: handlerName, data: args }, '*');
            }
        };
    }
  </script>
</head>
<body>
  ${embedCode}

  <script>
    function sendReward() {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler('adCompleted', 'done');
      }
    }
    // Catch MyAdCash & others
    window.aclibComplete = sendReward;
    window.adFinished = sendReward;

    // Backup timer
    setTimeout(sendReward, ${timerDuration});
  </script>
</body>
</html>
        `;
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'adCompleted') {
                handleClaim();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleClaim]);

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 animate-fade-in min-h-[80vh]">
            <div className="text-center mb-8 pt-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Watch & Earn</h2>
                <p className="text-slate-500 mt-2 text-sm">Watch sponsored clips to earn real money.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 text-sm font-bold">Loading Tasks...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Ads Available</h3>
                    <p className="text-slate-500">Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map((ad) => (
                        <div key={ad.id} onClick={() => setActiveAd(ad)} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer group flex flex-col transform hover:-translate-y-1">
                            <div className="relative aspect-video bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
                                <PlayCircleIcon className="w-16 h-16 text-white/80 group-hover:text-amber-400 group-hover:scale-110 transition-all z-10 duration-300" />
                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md z-20">
                                    {ad.duration}s
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
                    ))}
                </div>
            )}

            {activeAd && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
                    <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-sm">Ad Playing...</span>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 bg-black relative w-full h-full flex items-center justify-center">
                        <iframe
                            srcDoc={getIframeContent(activeAd)}
                            className="w-full h-full border-none"
                            title="Ad Content"
                            allow="autoplay; encrypted-media; fullscreen"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    </div>
                    
                    {isClaiming && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 animate-fade-in">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-white">Claiming Reward...</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WatchAdsView;
