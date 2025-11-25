
// components/JobsView.tsx
import React, { useState } from 'react';
import type { UserProfile, Job, JobSubscriptionPlan, Application } from '../types';
import { CheckCircleIcon, BriefcaseIcon, StarIcon, RocketIcon, FireIcon } from './icons';
import ThankYouModal from './ThankYouModal';

interface JobsViewProps {
    userProfile: UserProfile | null;
    balance: number;
    jobs: Job[];
    onSubscribe: (plan: JobSubscriptionPlan, cost: number) => void;
    onApply: (jobId: string) => void;
    applications: Application[];
}

const plans = [
    { 
        name: 'Starter' as JobSubscriptionPlan, 
        price: 500, 
        duration: 30, 
        features: ['Access to basic jobs', '5 applications per day', 'Standard Support'], 
        color: 'gray', 
        limit: 5,
        icon: <BriefcaseIcon className="w-6 h-6" />,
        badge: null
    },
    { 
        name: 'Growth' as JobSubscriptionPlan, 
        price: 1000, 
        duration: 30, 
        features: ['Access to ALL jobs', '15 applications per day', 'Priority Review', 'Email support'], 
        color: 'primary', 
        limit: 15,
        icon: <RocketIcon className="w-6 h-6" />,
        isPopular: true,
        badge: "Recommended"
    },
    { 
        name: 'Business' as JobSubscriptionPlan, 
        price: 2500, 
        duration: 60, 
        features: ['Unlimited Jobs', 'Unlimited Applications', 'VIP Support Channel', 'Verified Badge'], 
        color: 'accent', 
        limit: Infinity,
        icon: <StarIcon className="w-6 h-6" />,
        badge: "Hot Offer",
        badgeColor: "bg-red-500"
    },
];

const JobsView: React.FC<JobsViewProps> = ({ userProfile, balance, jobs, onSubscribe, onApply, applications }) => {
    const [showThankYou, setShowThankYou] = useState(false);
    const [purchasedPlan, setPurchasedPlan] = useState<string>('');

    const handleSubscribe = (plan: JobSubscriptionPlan, cost: number) => {
        onSubscribe(plan, cost);
        setPurchasedPlan(plan);
        setShowThankYou(true);
    };
    
    if (!userProfile?.jobSubscription) {
        return (
            <div className="pb-24 px-2">
                <ThankYouModal 
                    isOpen={showThankYou} 
                    onClose={() => setShowThankYou(false)} 
                    message={`Welcome to the ${purchasedPlan} Plan!`}
                    subMessage="Your subscription is now active. You can start applying for premium jobs immediately."
                />
                
                <div className="text-center animate-fade-in mb-10 pt-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 font-heading">Perfect Plan Packages</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Unlock your full earning potential. Choose a package to access high-paying, verified premium jobs.
                    </p>
                    <p className="mt-4 inline-block bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-bold">
                        Current Balance: <span className="text-primary-600">{balance.toFixed(2)} Rs</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
                    {plans.map((plan, index) => {
                        const isPopular = plan.isPopular;
                        const isHot = plan.badge === "Hot Offer";
                        
                        return (
                            <div 
                                key={plan.name} 
                                className={`relative bg-white rounded-[24px] overflow-hidden transition-all duration-300 animate-fade-in-up flex flex-col h-full
                                    ${isPopular 
                                        ? 'border-2 border-primary-500 shadow-gold scale-105 z-10' 
                                        : 'border border-gray-200 shadow-card hover:shadow-lg'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms`}}
                            >
                                {plan.badge && (
                                    <div className={`absolute top-0 right-0 ${plan.badgeColor || 'bg-primary-500'} text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl shadow-sm z-20 flex items-center gap-1`}>
                                        {isHot && <FireIcon className="w-3 h-3" />}
                                        {plan.badge}
                                    </div>
                                )}
                                
                                <div className="p-8 flex flex-col h-full">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isPopular ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-600'}`}>
                                        {plan.icon}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                        <span className="text-lg font-bold text-gray-500 ml-1">Rs</span>
                                        <span className="text-xs text-gray-400 ml-2">/ {plan.duration} days</span>
                                    </div>

                                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-start">
                                                <CheckCircleIcon className={`w-5 h-5 mt-0.5 shrink-0 ${isPopular ? 'text-primary-500' : 'text-gray-400'}`} />
                                                <span className="ml-3 text-sm text-gray-600 font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        onClick={() => handleSubscribe(plan.name, plan.price)}
                                        disabled={balance < plan.price}
                                        className={`w-full py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                                            ${isPopular 
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700' 
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {balance < plan.price ? 'Insufficient Balance' : 'Activate Plan'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
    
    const { plan, expiryDate, applicationsToday } = userProfile.jobSubscription;
    const currentPlanDetails = plans.find(p => p.name === plan);
    const applicationLimit = currentPlanDetails?.limit ?? 0;
    const limitReached = applicationLimit !== Infinity && applicationsToday >= applicationLimit;

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-[24px] shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md">Active</div>
                        <h2 className="text-2xl font-bold">{plan} Plan Member</h2>
                    </div>
                    <p className="text-slate-300 text-sm">Valid until: <span className="text-white font-bold">{expiryDate}</span></p>
                </div>
                <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 min-w-[150px]">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Daily Limit</p>
                    <p className="text-2xl font-black text-primary-400">
                        {applicationsToday} <span className="text-white text-sm font-normal">/ {applicationLimit === Infinity ? '∞' : applicationLimit}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 pl-2">Latest Premium Jobs</h3>
                {jobs.filter(job => !job.isPremium || (job.isPremium && plan !== 'Starter')).map((job, idx) => {
                    const hasApplied = applications.some(app => app.jobId === job.id);

                    return (
                        <div key={job.id} className="bg-white p-6 rounded-2xl shadow-subtle border border-gray-100 transition-all duration-300 hover:shadow-subtle-md hover:border-primary-100 group animate-fade-in-up" style={{animationDelay: `${idx * 50}ms`}}>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                        {job.isPremium && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">VIP</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><BriefcaseIcon className="w-3.5 h-3.5"/> {job.type}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-green-600 font-bold">{job.salary}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onApply(job.id)}
                                    disabled={hasApplied || limitReached}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm
                                        ${hasApplied 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : 'bg-slate-900 text-white hover:bg-primary-600 hover:shadow-md'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {hasApplied ? 'Applied' : 'Apply Now'}
                                </button>
                            </div>
                            <p className="text-gray-600 mt-4 text-sm leading-relaxed">{job.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobsView;
