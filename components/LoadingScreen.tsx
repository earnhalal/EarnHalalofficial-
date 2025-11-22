// components/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-amber-100">
            <div className="relative w-full max-w-md h-64 flex items-center justify-center mb-8">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 text-slate-800 animate-wallet-pulse z-20">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0022 15V9a2 2 0 00-1-1.72zM20 15v-6h-9v6h9zm-9 4v-2h9v2H11z"/>
                    </svg>
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 relative top-[-40px]">
                        TaskM<span className="invisible">i</span>nt
                    </h1>
                    <div className="absolute top-[-14px] left-[calc(50%+24px)] md:left-[calc(50%+28px)] w-[6px] md:w-[8px] h-[24px] md:h-[30px] bg-slate-900 rounded-sm"></div>
                </div>
                <div className="absolute top-[-40px] left-[calc(50%+27px)] md:left-[calc(50%+32px)] w-5 h-5 md:w-6 md:h-6 z-30 animate-coin-factory">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-lg border border-yellow-200 flex items-center justify-center animate-coin-spin">
                        <span className="text-[10px] font-bold text-yellow-900">$</span>
                    </div>
                </div>
            </div>
            <div className="text-center px-6 z-10">
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600 mb-3 animate-pulse">
                    TaskMint is Securing Your Connection...
                </h2>
                <p className="text-slate-800 font-medium text-sm md:text-base max-w-md mx-auto opacity-80">
                    Optimizing your Task Wall and calculating today's free spin rewards.
                </p>
            </div>
            <style>{`
                @keyframes coin-factory {
                    0% { transform: translate(-50%, -200px); opacity: 0; }
                    15% { transform: translate(-50%, 0); opacity: 1; }
                    45% { transform: translate(-50%, 0); }
                    55% { transform: translate(-50%, 120px) scale(0.8); opacity: 1; }
                    60% { transform: translate(-50%, 130px) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, 130px); opacity: 0; }
                }
                .animate-coin-factory { animation: coin-factory 2.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite; }
                @keyframes coin-spin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(720deg); } }
                .animate-coin-spin { animation: coin-spin 2.5s linear infinite; }
                @keyframes wallet-pulse {
                    0%, 50% { transform: translateX(-50%) scale(1); }
                    55% { transform: translateX(-50%) scale(1.2); color: #d97706; }
                    65% { transform: translateX(-50%) scale(1); color: #1e293b; }
                    100% { transform: translateX(-50%) scale(1); }
                }
                .animate-wallet-pulse { animation: wallet-pulse 2.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default LoadingScreen;