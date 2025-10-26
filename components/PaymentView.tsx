import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons';

interface PaymentViewProps {
    onSubmit: () => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({ onSubmit }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 dark:from-primary-900/30 dark:to-accent-900/30 animate-background-pan"></div>

            <div className="relative p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg text-center animate-fade-in-up">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">One-Time Joining Fee</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    To ensure a community of serious users, we require a one-time joining fee of <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-primary-500">50 Rs</span>.
                </p>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2">Payment Details</h3>
                    <p className="text-slate-600 dark:text-slate-300">Account Title: <span className="font-mono float-right">Earn Halal Inc.</span></p>
                    <p className="text-slate-600 dark:text-slate-300">Account Number: <span className="font-mono float-right">0123-45678901</span></p>
                    <p className="text-slate-600 dark:text-slate-300">Bank: <span className="font-mono float-right">JazzCash / EasyPaisa</span></p>
                </div>

                <div className="mb-6">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Time Remaining:</p>
                    <p className={`text-4xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-primary-500'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                </div>
                
                <div className="mb-6">
                    <label 
                        htmlFor="payment-proof" 
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="font-semibold text-primary-500">Upload Payment Proof</span>
                        <span className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</span>
                    </label>
                    <input 
                        id="payment-proof"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                     {file && <p className="text-sm text-green-500 mt-2 flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5" /> File selected: {file.name}</p>}
                </div>

                <button
                    onClick={onSubmit}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed group"
                >
                    <span className="group-hover:scale-105 transition-transform">I Have Paid</span>
                    <CheckCircleIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PaymentView;