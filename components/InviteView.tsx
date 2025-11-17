// components/InviteView.tsx
import React, { useState, useMemo } from 'react';
import { InviteIcon, TrophyIcon, ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, CheckCircleIcon, SparklesIcon } from './icons';
import type { UserProfile, Referral, ReferralStatus } from '../types';

// Helper function to determine the status text
const getBonusStatusText = (referral: Referral, referrerTasks: number): string => {
    switch (referral.status) {
        case 'credited':
            return 'Bonus Credited';
        case 'eligible':
            return 'Eligible for Bonus';
        case 'pending_referred_tasks':
            return "Pending (Friend's 10 tasks)";
        case 'pending_referrer_tasks':
            if (referrerTasks >= 50) {
                 return "Pending (Friend's 10 tasks)";
            }
            return 'Pending (Your 50 tasks)';
        default:
            return 'Pending';
    }
};

// --- Reusable Components for the new design ---

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
        <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ProgressBar: React.FC<{ progress: number; max: number; text: string; }> = ({ progress, max, text }) => {
    const percentage = max > 0 ? (progress / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{text}</span>
                <span className="text-sm font-medium text-emerald-600">{progress}/{max}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const InvitedFriendCard: React.FC<{ referral: Referral; referrerTasks: number }> = ({ referral, referrerTasks }) => {
    const statusText = getBonusStatusText(referral, referrerTasks);

    const statusColorClass = useMemo(() => {
        switch (referral.status) {
            case 'credited': return 'bg-green-100 text-green-800';
            case 'eligible': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    }, [referral.status]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
                <p className="font-bold text-gray-800">{referral.referredUsername}</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColorClass}`}>{statusText}</span>
            </div>
            <ProgressBar progress={referral.referredUserTasksCompleted} max={10} text="Friend's Task Progress" />
        </div>
    );
};

interface InviteViewProps {
  userProfile: UserProfile | null;
  referrals: Referral[];
}

const InviteView: React.FC<InviteViewProps> = ({ userProfile, referrals }) => {
    // FIX: Add a loading state check at the very top of the component.
    // This prevents any hooks or rendering logic from executing with an undefined `userProfile`.
    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading Referral Dashboard...</p>
            </div>
        );
    }

    const [copied, setCopied] = useState(false);

    // This is now safe because of the loading check above.
    const referralLink = `https://earn-halaloffi.vercel.app/signup?ref=${userProfile.referralCode || ''}`;
    
    const pendingBonus = useMemo(() => {
        return referrals
            .filter(r => r.status !== 'credited')
            .reduce((sum, r) => sum + r.bonusAmount, 0);
    }, [referrals]);
    
    const handleCopy = () => {
        if (!userProfile.referralCode) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 font-sans">
            <header className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 font-heading">
                    Unlock Your Rewards, <span className="text-emerald-600">Invite Your Network!</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Every friend you bring gets you closer to <span className="font-bold text-gold-500">Rs. 200!</span> Your bonus is credited once you complete 50 tasks AND your friend completes 10.
                </p>
            </header>

            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Unique Referral Link</label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" readOnly value={referralLink} className="flex-grow w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm text-gray-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400" />
                    <button onClick={handleCopy} className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-0 font-semibold w-full sm:w-auto h-auto min-h-[48px] px-6 text-base">
                        {copied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <p className="text-sm font-medium text-gray-500">Share via:</p>
                    <a href={`https://wa.me/?text=Join%20Earn%20Halal%20and%20start%20earning!%20Use%20my%20link:%20${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="btn btn-circle bg-green-500 hover:bg-green-600 text-white border-0"><WhatsAppIcon className="w-6 h-6" /></a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="btn btn-circle bg-blue-600 hover:bg-blue-700 text-white border-0"><FacebookIcon className="w-6 h-6" /></a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=Join%20Earn%20Halal%20and%20start%20earning!`} target="_blank" rel="noopener noreferrer" className="btn btn-circle bg-black hover:bg-gray-800 text-white border-0"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg></a>
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-bold text-gray-800 font-heading mb-4">Your Progress at a Glance</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <StatCard icon={<InviteIcon className="w-6 h-6"/>} label="Friends Invited" value={userProfile.invitedCount || 0} />
                    <StatCard icon={<TrophyIcon className="w-6 h-6"/>} label="Total Earned" value={`Rs. ${(userProfile.totalReferralEarnings || 0).toFixed(2)}`} />
                    <div className="sm:col-span-2 lg:col-span-1">
                        <StatCard icon={<SparklesIcon className="w-6 h-6"/>} label="Pending Bonus" value={`Rs. ${pendingBonus.toFixed(2)}`} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                         <ProgressBar progress={userProfile.tasksCompletedCount || 0} max={50} text="Your Task Progress" />
                    </div>
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-bold text-gray-800 font-heading mb-4">Your Invited Friends</h2>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    {(userProfile.invitedCount || 0) > 0 && referrals.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                           {referrals.map(referral => (
                                <InvitedFriendCard key={referral.id} referral={referral} referrerTasks={userProfile.tasksCompletedCount || 0} />
                           ))}
                        </div>
                    ) : (
                         <div className="text-center text-gray-500 py-8">
                            <InviteIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">No friends invited yet!</h3>
                            <p className="mt-2">Share your link to start earning referral bonuses!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default InviteView;