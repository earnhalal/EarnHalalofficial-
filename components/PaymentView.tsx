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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="relative p-8 bg-white rounded-xl shadow-subtle-lg w-full max-w-lg text-center animate-fade-in-up border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">One-Time Joining Fee</h2>
                <p className="text-gray-600 mb-6">
                    To ensure a community of serious users, we require a one-time joining fee of <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-primary-600">50 Rs</span>.
                </p>

                <div className="bg-gray-100 p-6 rounded-lg mb-6 text-left border border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Payment Details</h3>
                    <p className="text-gray-700">Account Title: <span className="font-mono float-right text-gray-800">M-WASEEM</span></p>
                    <p className="text-gray-700">Account Number: <span className="font-mono float-right text-gray-800">03338739929</span></p>
                    <p className="text-gray-700">Bank: <span className="font-mono float-right text-gray-800">EasyPaisa</span></p>
                </div>

                <div className="mb-6">
                    <p className="font-semibold text-gray-800">Time Remaining:</p>
                    <p className={`text-4xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary-600'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                </div>
                
                <div className="mb-6">
                    <label 
                        htmlFor="payment-proof" 
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="font-semibold text-primary-600">Upload Payment Proof</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                    </label>
                    <input 
                        id="payment-proof"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                     {file && <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5" /> File selected: {file.name}</p>}
                </div>

                <button
                    onClick={onSubmit}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed group"
                >
                    <span className="group-hover:scale-105 transition-transform">I Have Paid</span>
                    <CheckCircleIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PaymentView;