
// components/ModeSwitchLoader.tsx
import React, { useEffect, useState } from 'react';
import { BriefcaseIcon, SparklesIcon } from './icons';

interface ModeSwitchLoaderProps {
    targetMode: 'EARNER' | 'ADVERTISER';
}

const ModeSwitchLoader: React.FC<ModeSwitchLoaderProps> = ({ targetMode }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Random increments to simulate real loading
                return prev + Math.random() * 5; 
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    const isAdvertiser = targetMode === 'ADVERTISER';
    
    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-500 ${isAdvertiser ? 'bg-[#0F172A]' : 'bg-white'}`}>
            <div className="relative mb-12">
                {/* Icon Container */}
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-1000 ${isAdvertiser ? 'bg-blue-600 rotate-0' : 'bg-gradient-to-br from-amber-400 to-yellow-600 rotate-180'}`}>
                    {isAdvertiser ? (
                        <BriefcaseIcon className="w-12 h-12 text-white animate-pulse" />
                    ) : (
                        <SparklesIcon className="w-12 h-12 text-white animate-pulse" />
                    )}
                </div>
                
                {/* Orbiting Ring */}
                <div className="absolute inset-[-20px] border-2 border-dashed rounded-full animate-spin-slow opacity-30" 
                     style={{ borderColor: isAdvertiser ? '#3B82F6' : '#D4AF37' }}>
                </div>
            </div>

            <h2 className={`text-2xl md:text-3xl font-black tracking-tight mb-2 animate-fade-in-up ${isAdvertiser ? 'text-white' : 'text-slate-900'}`}>
                {isAdvertiser ? 'Initializing Business Console' : 'Switching to User App'}
            </h2>
            
            <p className={`text-sm font-medium mb-8 opacity-70 ${isAdvertiser ? 'text-blue-200' : 'text-amber-700'}`}>
                {isAdvertiser ? 'Loading Campaign Data...' : 'Preparing Task Wall...'}
            </p>

            {/* Progress Bar */}
            <div className="w-64 h-1.5 bg-gray-700/20 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-300 ease-out rounded-full ${isAdvertiser ? 'bg-blue-500 shadow-[0_0_10px_#3B82F6]' : 'bg-amber-500 shadow-[0_0_10px_#D4AF37]'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            
            <p className="mt-4 text-xs font-mono opacity-50">
                {Math.round(Math.min(progress, 100))}%
            </p>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

export default ModeSwitchLoader;
