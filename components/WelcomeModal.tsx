import React from 'react';

interface WelcomeModalProps {
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden transform transition-all animate-fade-in-up">
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/10 rounded-full"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-48 h-48 bg-accent-500/10 rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Earn Halal!</h2>
                    <p className="text-gray-600 mb-8">You're all set up. Start completing tasks to earn rewards and build your income.</p>
                    <button onClick={onClose} className="w-full bg-gradient-to-r from-accent-500 to-primary-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                        Let's Go!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;