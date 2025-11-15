// components/JobsView.tsx
import React from 'react';
import type { UserProfile, Job, JobSubscriptionPlan, Application } from '../types';
import { CheckCircleIcon } from './icons';

interface JobsViewProps {
    userProfile: UserProfile | null;
    balance: number;
    jobs: Job[];
    onSubscribe: (plan: JobSubscriptionPlan, cost: number) => void;
    onApply: (jobId: string) => void;
    applications: Application[];
}

const plans = [
    { name: 'Starter' as JobSubscriptionPlan, price: 500, duration: 30, features: ['Access to basic jobs', '5 applications per day'], color: 'gray', limit: 5 },
    { name: 'Growth' as JobSubscriptionPlan, price: 1000, duration: 30, features: ['Access to all jobs', '15 applications per day', 'Email support'], color: 'primary', limit: 15 },
    { name: 'Business' as JobSubscriptionPlan, price: 2500, duration: 60, features: ['Access to all jobs', 'Unlimited applications', 'Priority support'], color: 'accent', limit: Infinity },
];

const planColorClasses = {
    gray: { border: 'border-gray-300', text: 'text-gray-800', bg: 'bg-gray-700', hoverBg: 'hover:bg-gray-800' },
    primary: { border: 'border-primary-500', text: 'text-primary-600', bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700' },
    accent: { border: 'border-accent-500', text: 'text-accent-600', bg: 'bg-accent-500', hoverBg: 'hover:bg-accent-600' },
};


const JobsView: React.FC<JobsViewProps> = ({ userProfile, balance, jobs, onSubscribe, onApply, applications }) => {
    
    if (!userProfile?.jobSubscription) {
        return (
            <div className="text-center animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Unlock Your Earning Potential</h2>
                <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
                    Subscribe to a plan to access high-paying, exclusive jobs. Your current balance is <span className="font-bold text-primary-600">{balance.toFixed(2)} Rs</span>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => {
                        const colors = planColorClasses[plan.color as keyof typeof planColorClasses] || planColorClasses.gray;
                        const isRecommended = plan.name === 'Growth';
                        
                        return (
                            <div 
                                key={plan.name} 
                                className={`relative bg-white border-2 ${colors.border} rounded-xl shadow-subtle p-6 flex flex-col transition-all duration-300 hover:shadow-subtle-lg hover:-translate-y-2 animate-fade-in-up ${isRecommended ? 'lg:scale-110 shadow-primary-500/20' : ''}`}
                                style={{ animationDelay: `${index * 100}ms`}}
                            >
                                {isRecommended && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold uppercase rounded-full shadow-md z-10">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className={`text-2xl font-bold ${colors.text}`}>{plan.name}</h3>
                                <p className="text-4xl font-extrabold my-4 text-gray-900">{plan.price} <span className="text-lg font-medium">Rs</span></p>
                                <p className="text-sm text-gray-500 mb-6">For {plan.duration} days</p>
                                <ul className="space-y-3 text-left text-gray-600 flex-grow">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => onSubscribe(plan.name, plan.price)}
                                    disabled={balance < plan.price}
                                    className={`mt-8 w-full ${colors.bg} text-white py-3 rounded-lg font-semibold ${colors.hoverBg} transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                >
                                    {balance < plan.price ? 'Insufficient Balance' : 'Choose Plan'}
                                </button>
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
        <div>
            <div className="bg-white p-6 rounded-xl shadow-subtle mb-8 flex flex-wrap justify-between items-center gap-4 border border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
                    <p className="text-gray-600">Your subscription is active. Apply for jobs below.</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-primary-600 text-lg">{plan} Plan</p>
                    <p className="text-sm text-gray-500">Expires on: {expiryDate}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                        Applications Today: {applicationsToday} / {applicationLimit === Infinity ? 'Unlimited' : applicationLimit}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {jobs.filter(job => !job.isPremium || (job.isPremium && plan !== 'Starter')).map(job => {
                    const hasApplied = applications.some(app => app.jobId === job.id);

                    return (
                        <div key={job.id} className="bg-white p-6 rounded-xl shadow-subtle transition-all duration-300 hover:shadow-subtle-md hover:-translate-y-1 border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span>{job.type}</span>
                                        {job.isPremium && <span className="text-yellow-600 font-semibold">Premium</span>}
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-green-600">{job.salary}</div>
                            </div>
                            <p className="text-gray-700 my-4">{job.description}</p>
                            <button
                                onClick={() => onApply(job.id)}
                                disabled={hasApplied || limitReached}
                                className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {hasApplied ? 'Applied' : 'Apply Now'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobsView;