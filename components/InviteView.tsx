
// components/InviteView.tsx
import React, { useState, useMemo } from 'react';
import { 
    ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, CheckCircleIcon, 
    TrophyIcon, InviteIcon, TelegramIcon, MessengerIcon 
} from './icons';
import type { UserProfile, Referral } from '../types';

interface InviteViewProps {
  userProfile: UserProfile | null;
  referrals: Referral[];
}

// --- Sub-Components for Clean Code ---

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; delay?: number }> = ({ label, value, icon, delay = 0 }) => (
    <div 
        className="bg-neutral-900 border border-amber-500/20 rounded-xl p-4 flex flex-col items-center text-center shadow-lg hover:shadow-amber-900/20 hover:border-amber-500/40 transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="mb-3 p-2.5 bg-neutral-800 rounded-full text-amber-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-amber-500/10">
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 font-heading tracking-tight">{value}</p>
        <p className="text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
);

const ProgressBar: React.FC<{ current: number; target: number; label: string; isGold?: boolean }> = ({ current, target, label, isGold }) => {
    const percentage = Math.min(100, (current / target) * 100);
    
    return (
        <div className="mb-5 group">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide group-hover:text-neutral-300 transition-colors">{label}</span>
                <span className={`text-xs font-bold font-mono ${isGold ? 'text-amber-400' : 'text-neutral-300'}`}>
                    {Math.min(current, target)} / {target}
                </span>
            </div>
            <div className="h-2.5 w-full bg-black rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] border border-white/5">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                        isGold 
                        ? 'bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                        : 'bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
};

const ReferralCard: React.FC<{ referral: Referral; userTasksCompleted: number; index: number }> = ({ referral, userTasksCompleted, index }) => {
    // Visual Thresholds requested in prompt
    const USER_TASK_TARGET = 25;
    const FRIEND_TASK_TARGET = 15;

    const isUserComplete = userTasksCompleted >= USER_TASK_TARGET;
    const isFriendComplete = referral.referredUserTasksCompleted >= FRIEND_TASK_TARGET;
    // Note: The backend controls the actual 'status', but we reflect UI state here
    const isBonusUnlocked = referral.status === 'eligible' || referral.status === 'credited';
    
    return (
        <div 
            className="bg-neutral-900/80 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Ambient Light Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
            
            {/* A) Top Row */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Referral ID</p>
                    </div>
                    <p className="text-lg font-bold text-neutral-200 tracking-wide">@{referral.referredUsername}</p>
                </div>
                
                {isBonusUnlocked ? (
                    <div className="px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>UNLOCKED</span>
                    </div>
                ) : (
                    <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-pulse">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                        200 Rs PENDING
                    </div>
                )}
            </div>

            {/* B) Progress Section */}
            <div className="space-y-1 relative z-10">
                <ProgressBar 
                    current={userTasksCompleted} 
                    target={USER_TASK_TARGET} 
                    label="Your Tasks (Global)" 
                    isGold 
                />
                <ProgressBar 
                    current={referral.referredUserTasksCompleted} 
                    target={FRIEND_TASK_TARGET} 
                    label="Friend Tasks (Individual)" 
                />
            </div>

            {/* C) Status Text */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-400">Status:</p>
                    <span className={`text-sm font-bold ${isBonusUnlocked ? 'text-emerald-400' : 'text-amber-200/80'}`}>
                        {isBonusUnlocked ? 'Completed' : 'In Progress'}
                    </span>
                </div>
                {isBonusUnlocked && (
                     <span className="text-[10px] font-medium text-emerald-500/80 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-500/10">
                        Bonus added to wallet
                    </span>
                )}
            </div>

            {/* D) Footer Note */}
            <p className="mt-4 text-[10px] text-neutral-600 italic text-center border-t border-white/5 pt-2">
                Complete both progress bars to unlock the 200 Rs bonus.
            </p>
        </div>
    );
};

const InviteView: React.FC<InviteViewProps> = ({ userProfile, referrals }) => {
    const [copied, setCopied] = useState(false);
    
    // Hardcoded domain as requested for clean URL
    const baseUrl = "https://earn-halalofficial.vercel.app";
    const referralLink = userProfile?.username 
        ? `${baseUrl}/signup?ref=${userProfile.username}` 
        : 'Generating link...';

    const handleCopy = () => {
        if (!userProfile?.username) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Summary Calculations
    const totalInvites = referrals.length;
    const completedInvites = referrals.filter(r => r.status === 'credited').length;
    // Estimate pending amount (excluding credited ones)
    const pendingBonuses = referrals.filter(r => r.status !== 'credited').length * 200; 
    const totalEarned = userProfile?.totalReferralEarnings || 0;

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans selection:bg-amber-500/30">
            <div className="max-w-5xl mx-auto space-y-10">
                
                {/* 1️⃣ Header Section */}
                <header className="text-center space-y-4 pt-4 animate-fade-in">
                    <div className="inline-block relative">
                        <h1 className="text-4xl md:text-5xl font-extrabold font-heading bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                            Invite Friends & Earn 200 Rs Each
                        </h1>
                        {/* Glow under title */}
                        <div className="absolute -inset-4 bg-amber-500/20 blur-3xl -z-10 rounded-full opacity-50"></div>
                    </div>
                    <p className="text-lg text-amber-100/70 font-medium tracking-wide">
                        Bonus unlocks when task conditions are completed.
                    </p>
                </header>

                {/* 4️⃣ Summary Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Invites" value={totalInvites} icon={<InviteIcon />} delay={100} />
                    <StatCard label="Completed" value={completedInvites} icon={<CheckCircleIcon />} delay={200} />
                    <StatCard label="Pending Bonus" value={`${pendingBonuses} Rs`} icon={<TrophyIcon />} delay={300} />
                    <StatCard label="Total Earned" value={`${totalEarned} Rs`} icon={<TrophyIcon />} delay={400} />
                </div>

                {/* 2️⃣ Invite Link Box */}
                <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in-up delay-200">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-800 via-yellow-500 to-amber-800"></div>
                    <div className="absolute -left-10 top-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-8 relative z-10">
                        <div className="flex-grow w-full relative group">
                            <input 
                                type="text" 
                                readOnly 
                                value={referralLink} 
                                className="w-full bg-black/60 border border-amber-500/20 text-amber-100 text-sm p-4 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-center md:text-left"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block text-xs text-neutral-500">REF LINK</div>
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="w-full md:w-auto bg-gradient-to-br from-amber-400 to-yellow-600 text-neutral-950 font-extrabold px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 active:scale-95"
                        >
                            {copied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                            <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
                        </button>
                    </div>

                    <div className="border-t border-white/5 pt-6 relative z-10">
                        <p className="text-center text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Share Instanty</p>
                        <div className="flex justify-center gap-4 md:gap-6">
                            <a href={`https://wa.me/?text=Join%20Earn%20Halal!%20Register%20here:%20${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="group p-3.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl transition-all border border-green-500/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                <WhatsAppIcon className="w-7 h-7" />
                            </a>
                            <a href={`fb-messenger://share/?link=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="group p-3.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-2xl transition-all border border-blue-500/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                                <MessengerIcon className="w-7 h-7" />
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="group p-3.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-2xl transition-all border border-indigo-500/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                <FacebookIcon className="w-7 h-7" />
                            </a>
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Start%20Earning%20Halal%20Income!`} target="_blank" rel="noopener noreferrer" className="group p-3.5 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white rounded-2xl transition-all border border-sky-500/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                                <TelegramIcon className="w-7 h-7" />
                            </a>
                        </div>
                        <p className="text-center text-[11px] text-neutral-600 mt-6 max-w-lg mx-auto">
                            Share your unique invite link. When friends join using your link, a tracking card will be automatically created below.
                        </p>
                    </div>
                </div>

                {/* 3️⃣ Referral Progress Cards */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                        <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6 text-amber-500" />
                            Referral Progress
                        </h2>
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                    </div>

                    {referrals.length === 0 ? (
                        // 5️⃣ Empty State
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center shadow-inner animate-fade-in">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
                                <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-20"></div>
                                <InviteIcon className="w-10 h-10 text-amber-500/60" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-300 mb-3">No Active Referrals</h3>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                                Invite your first friend to unlock your first <span className="text-amber-400 font-bold">200 Rs</span> bonus card.
                            </p>
                            <button 
                                onClick={handleCopy}
                                className="bg-neutral-800 text-amber-400 border border-amber-500/30 px-8 py-3 rounded-xl font-bold hover:bg-amber-500 hover:text-neutral-900 transition-all shadow-lg"
                            >
                                Share Invite Link
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {referrals.map((referral, index) => (
                                <ReferralCard 
                                    key={referral.id} 
                                    referral={referral} 
                                    userTasksCompleted={userProfile?.tasksCompletedCount || 0} 
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InviteView;
