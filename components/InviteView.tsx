
// components/InviteView.tsx
import React, { useState } from 'react';
import { 
    ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, CheckCircleIcon, 
    TrophyIcon, InviteIcon, TelegramIcon, MessengerIcon, UserGroupIcon,
    ChevronDownIcon
} from './icons';
import type { UserProfile, Referral } from '../types';

interface InviteViewProps {
  userProfile: UserProfile | null;
  referrals: Referral[];
}

// --- Components Styled for White & Gold Theme ---

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; delay?: number }> = ({ label, value, icon, delay = 0 }) => (
    <div 
        className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center shadow-card hover:shadow-gold transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="mb-3 p-3 bg-primary-50 rounded-full text-primary-600">
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        <p className="text-2xl font-extrabold text-gray-900 font-heading tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
);

const ProgressBar: React.FC<{ current: number; target: number; label: string; isGold?: boolean }> = ({ current, target, label, isGold }) => {
    const percentage = Math.min(100, (current / target) * 100);
    
    return (
        <div className="mb-4 group w-full">
            <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
                <span className={`text-xs font-bold font-mono ${isGold ? 'text-primary-600' : 'text-gray-600'}`}>
                    {Math.min(current, target)} / {target}
                </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isGold ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-gray-800'}`}
                    style={{ width: `${percentage}%` }}
                >
                </div>
            </div>
        </div>
    );
};

const ReferralCard: React.FC<{ referral: Referral; globalUserTasksCompleted: number; index: number }> = ({ referral, globalUserTasksCompleted, index }) => {
    const USER_TASK_TARGET = 25;
    const FRIEND_TASK_TARGET = 15;

    const isNewModel = referral.isNewSystem === true || typeof referral.referrerTasksCompleted === 'number';
    const effectiveUserTasks = isNewModel ? (referral.referrerTasksCompleted ?? 0) : globalUserTasksCompleted;
    const isBonusUnlocked = referral.status === 'eligible' || referral.status === 'credited';
    
    return (
        <div 
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card relative overflow-hidden group hover:border-primary-200 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {referral.referredUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Referral</p>
                        <p className="text-base font-bold text-gray-900">@{referral.referredUsername}</p>
                    </div>
                </div>
                
                {isBonusUnlocked ? (
                    <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" /> UNLOCKED
                    </div>
                ) : (
                    <div className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold border border-primary-100 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
                        PENDING
                    </div>
                )}
            </div>

            {/* Progress Bars */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <ProgressBar current={effectiveUserTasks} target={USER_TASK_TARGET} label="Your Tasks" isGold={true} />
                <ProgressBar current={referral.referredUserTasksCompleted} target={FRIEND_TASK_TARGET} label="Friend's Tasks" isGold={false} />
            </div>

            {/* Footer Status */}
            <div className="mt-4 flex justify-between items-center">
                <p className="text-xs font-medium text-gray-400">Reward:</p>
                <span className={`text-sm font-bold ${isBonusUnlocked ? 'text-green-600' : 'text-gray-900'}`}>
                    200 Rs
                </span>
            </div>
        </div>
    );
};

const InviteView: React.FC<InviteViewProps> = ({ userProfile, referrals }) => {
    const [copied, setCopied] = useState(false);
    const [showReferralHistory, setShowReferralHistory] = useState(false);
    
    // Dynamic base URL to support production domain
    const baseUrl = "https://taskmint-pro.vercel.app"; 
    const referralLink = userProfile?.username ? `${baseUrl}/signup?ref=${userProfile.username}` : 'Generating link...';

    const handleCopy = () => {
        if (!userProfile?.username) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalInvites = referrals.length;
    const completedInvites = referrals.filter(r => r.status === 'credited').length;
    const pendingBonuses = referrals.filter(r => r.status !== 'credited').length * 200; 
    const totalEarned = userProfile?.totalReferralEarnings || 0;

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-24 pt-4 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-heading">
                        Invite & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">Earn Big</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Get <span className="font-bold text-gray-900">200 Rs</span> for every active friend you invite.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total Invites" value={totalInvites} icon={<UserGroupIcon />} delay={100} />
                    <StatCard label="Completed" value={completedInvites} icon={<CheckCircleIcon />} delay={200} />
                    <StatCard label="Pending" value={`${pendingBonuses}`} icon={<TrophyIcon />} delay={300} />
                    <StatCard label="Earned" value={`${totalEarned}`} icon={<TrophyIcon />} delay={400} />
                </div>

                {/* Copy Link Section */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-card text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Unique Referral Link</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="flex-grow bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 font-mono truncate">
                            {referralLink}
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            {copied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
                        {[
                            { icon: <WhatsAppIcon className="w-6 h-6"/>, color: 'bg-green-50 text-green-600', link: `https://wa.me/?text=${encodeURIComponent(referralLink)}` },
                            { icon: <FacebookIcon className="w-6 h-6"/>, color: 'bg-blue-50 text-blue-600', link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                            { icon: <MessengerIcon className="w-6 h-6"/>, color: 'bg-indigo-50 text-indigo-600', link: `fb-messenger://share/?link=${encodeURIComponent(referralLink)}` },
                            { icon: <TelegramIcon className="w-6 h-6"/>, color: 'bg-sky-50 text-sky-500', link: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` }
                        ].map((social, i) => (
                            <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${social.color}`}>
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Referrals List Section */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xl font-bold text-gray-900">Referral Tracking</h2>
                        <button 
                            onClick={() => setShowReferralHistory(!showReferralHistory)}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            {showReferralHistory ? 'Hide List' : 'View List'}
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showReferralHistory ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showReferralHistory && (
                        <div className="animate-fade-in">
                            {referrals.length === 0 ? (
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-subtle">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <InviteIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No Referrals Yet</h3>
                                    <p className="text-sm text-gray-500 mt-1">Share your link to start building your team.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {referrals.map((referral, index) => (
                                        <ReferralCard 
                                            key={referral.id} 
                                            referral={referral} 
                                            globalUserTasksCompleted={userProfile?.tasksCompletedCount || 0} 
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InviteView;
