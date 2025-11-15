// components/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white animate-fade-in-slow">
            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.8s ease-out forwards;
                }

                @keyframes logo-pulse-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
                        transform: scale(1);
                    }
                    50% {
                        filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.7));
                        transform: scale(1.03);
                    }
                }
                .animate-logo-pulse-glow {
                    animation: logo-pulse-glow 2.5s infinite ease-in-out;
                }
                
                @keyframes bounce-dot {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                .animate-bounce-dot {
                    animation: bounce-dot 1.4s infinite ease-in-out both;
                }
            `}</style>
            <div className="animate-logo-pulse-glow">
                 <svg className="w-24 h-24" viewBox="0 0 24 24" fill="url(#logo-gradient-loader)">
                    <defs>
                      <linearGradient id="logo-gradient-loader" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: 'rgb(251 191 36)'}} />
                        <stop offset="100%" style={{stopColor: 'rgb(245 158 11)'}} />
                      </linearGradient>
                    </defs>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
            </div>
            
            <div className="mt-8 text-center w-full max-w-sm px-4">
                <p className="text-lg font-semibold text-slate-200 h-6">
                    Getting everything ready...
                </p>
                <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce-dot" style={{ animationDelay: '-0.32s' }}></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce-dot" style={{ animationDelay: '-0.16s' }}></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
