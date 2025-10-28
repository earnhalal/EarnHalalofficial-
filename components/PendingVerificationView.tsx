// components/PendingVerificationView.tsx
import React, { useState, useEffect } from 'react';
import { DocumentArrowUpIcon, MagnifyingGlassIcon } from './icons';

type VerificationStage = 'submitting' | 'verifying' | 'success';

const StageIcon: React.FC<{ stage: VerificationStage }> = ({ stage }) => {
    const stageConfig = {
        submitting: <DocumentArrowUpIcon className="w-24 h-24 text-primary-500 animate-float-up" />,
        verifying: <MagnifyingGlassIcon className="w-24 h-24 text-primary-500 animate-pulse-search" />,
        success: (
            <svg className="w-24 h-24 text-green-500 animate-draw-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        )
    };

    return (
        <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            {Object.keys(stageConfig).map(key => (
                <div key={key} className={`absolute transition-all duration-700 ease-in-out ${stage === key ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    {stageConfig[key as VerificationStage]}
                </div>
            ))}
        </div>
    );
};


const Confetti: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none z-20">
        {Array.from({ length: 100 }).map((_, i) => (
            <div
                key={i}
                className="absolute animate-confetti-fall rounded-full"
                style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * -50}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 4}s`,
                    backgroundColor: ['#a78bfa', '#f472b6', '#fbbf24'][i % 3]
                }}
            />
        ))}
    </div>
);


const PendingVerificationView: React.FC = () => {
    const [stage, setStage] = useState<VerificationStage>('submitting');
    
    useEffect(() => {
        const timer1 = setTimeout(() => setStage('verifying'), 4000);
        const timer2 = setTimeout(() => setStage('success'), 8000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const stageConfig = {
        submitting: {
            title: "Submitting Proof",
            message: "Your payment proof is being securely uploaded...",
            progress: 40
        },
        verifying: {
            title: "Verification in Progress",
            message: "Our system is analyzing the transaction details. Almost there!",
            progress: 80
        },
        success: {
            title: "Verification Successful!",
            message: "Welcome aboard! Redirecting you to the dashboard now.",
            progress: 100
        }
    };
    
    const { title, message, progress } = stageConfig[stage];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-slate-900 to-accent-900/30 animate-background-pan z-0"></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-lg max-h-lg bg-primary-500/20 rounded-full blur-3xl transition-all duration-[3000ms] ease-in-out animate-pulse-slow ${stage === 'verifying' ? 'scale-125 bg-accent-500/20' : ''} ${stage === 'success' ? 'scale-150 bg-green-500/20' : ''}`}></div>
            
            <style>{`
                @keyframes float-up { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-float-up { animation: float-up 2s ease-in-out infinite; }
                
                @keyframes pulse-search { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
                .animate-pulse-search { animation: pulse-search 2s ease-in-out infinite; }

                @keyframes draw-check {
                    from { stroke-dashoffset: 48; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-draw-check path {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: draw-check 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.3s;
                }

                @keyframes confetti-fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(150vh) rotate(720deg); opacity: 0; }
                }
                .animate-confetti-fall { animation: confetti-fall linear forwards; }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1.05) rotate(5deg); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
            `}</style>
            
            <div className="relative z-10 p-8 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
                {stage === 'success' && <Confetti />}

                <div className="relative z-10">
                    <StageIcon stage={stage} />
                    
                    <h2 className="text-3xl font-bold text-slate-100 mb-4 transition-all duration-300">
                       {title}
                    </h2>
                    <p className="text-slate-300 min-h-[40px]">
                        {message}
                    </p>

                    <div className="w-full bg-slate-700 rounded-full h-3 mt-8 overflow-hidden relative">
                        <div 
                           className={`bg-gradient-to-r from-accent-500 to-primary-500 h-3 rounded-full transition-all ease-linear ${stage === 'submitting' ? 'duration-[4000ms]' : ''} ${stage === 'verifying' ? 'duration-[4000ms]' : ''} ${stage === 'success' ? 'duration-[2000ms]' : ''}`}
                           style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingVerificationView;