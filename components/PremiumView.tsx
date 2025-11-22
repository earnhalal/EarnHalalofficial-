// components/PremiumView.tsx
import React from 'react';
import type { View } from '../types';
import { BriefcaseIcon, UserGroupIcon, CheckCircleIcon, ArrowRight } from './icons';

interface PremiumViewProps {
    setActiveView: (view: View) => void;
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    buttonText: string;
    onClick: () => void;
    gradient: string;
}> = ({ title, description, icon, buttonText, onClick, gradient }) => (
    <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden hover:shadow-gold transition-shadow duration-300 group">
        <div className={`h-32 ${gradient} relative flex items-center justify-center`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner">
                {icon}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                Premium
            </div>
        </div>
        <div className="p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
            
            <button 
                onClick={onClick}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 group-hover:bg-primary-500 transition-colors duration-300"
            >
                {buttonText} <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const PremiumView: React.FC<PremiumViewProps> = ({ setActiveView }) => {
    return (
        <div className="pb-24 px-4 animate-fade-in">
            <div className="text-center mb-10 pt-4">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-heading">Premium Features</h2>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Unlock higher earning potential with our specialized premium tools.</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
                <FeatureCard 
                    title="Premium Jobs"
                    description="Access high-paying data entry, writing, and marketing jobs. Subscribe to a plan to start applying."
                    icon={<BriefcaseIcon className="w-8 h-8" />}
                    buttonText="Browse Jobs"
                    onClick={() => setActiveView('JOBS')}
                    gradient="bg-gradient-to-br from-gray-800 to-black"
                />

                <FeatureCard 
                    title="Social Groups"
                    description="Join exclusive WhatsApp & Facebook earning communities. Share your own groups to grow your network."
                    icon={<UserGroupIcon className="w-8 h-8" />}
                    buttonText="Explore Groups"
                    onClick={() => setActiveView('SOCIAL_GROUPS')}
                    gradient="bg-gradient-to-br from-primary-400 to-primary-600"
                />
                
                <div className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-6 flex items-start gap-4">
                    <CheckCircleIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Why Go Premium?</h4>
                        <p className="text-gray-600 text-xs mt-1">Premium users earn up to 3x more than standard users by accessing verified high-ticket tasks and exclusive networking groups.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumView;