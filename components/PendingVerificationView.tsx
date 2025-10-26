import React from 'react';

const PendingVerificationView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 dark:from-primary-900/30 dark:to-accent-900/30 animate-background-pan"></div>
            
            <div className="relative p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <div className="mx-auto mb-6 w-24 h-24">
                   <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <style>{`
                            .circle-bg {
                                fill: none;
                                stroke: #e2e8f0; /* slate-200 */
                            }
                            .circle-progress {
                                fill: none;
                                stroke: #8b5cf6; /* primary-500 */
                                stroke-linecap: round;
                                stroke-linejoin: round;
                                transform-origin: 50% 50%;
                                animation: spin 1.5s linear infinite;
                            }
                            .checkmark {
                                stroke: #8b5cf6; /* primary-500 */
                                stroke-dasharray: 100;
                                stroke-dashoffset: 100;
                                animation: draw-check 1.5s 0.5s ease-out forwards;
                            }
                            @keyframes spin {
                                100% { transform: rotate(360deg); }
                            }
                            @keyframes draw-check {
                                to { stroke-dashoffset: 0; }
                            }
                            @media (prefers-color-scheme: dark) {
                                .circle-bg { stroke: #334155; /* slate-700 */ }
                                .circle-progress, .checkmark { stroke: #a78bfa; /* primary-400 */ }
                            }
                        `}</style>
                        <circle className="circle-bg" cx="50" cy="50" r="45" strokeWidth="10" />
                        <circle className="circle-progress" cx="50" cy="50" r="45" strokeWidth="10" strokeDasharray="283" strokeDashoffset="75" />
                        <path className="checkmark" d="M30,55 l15,15 l30,-30" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Verification in Progress</h2>
                <p className="text-slate-600 dark:text-slate-300">
                    Thank you for your payment. Your account is currently being verified by our team. This usually takes just a few moments.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                    You will be redirected automatically once verification is complete.
                </p>
            </div>
        </div>
    );
};

export default PendingVerificationView;