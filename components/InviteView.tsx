import React, { useState } from 'react';
import { InviteIcon, TrophyIcon, ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, TwitterIcon, CheckCircleIcon, SparklesIcon } from './icons';
import type { UserProfile, Referral } from '../types';

interface InviteViewProps {
  userProfile: UserProfile | null;
  referrals: Referral[]; // Now receives a list of referral objects for detailed tracking
}

const ReferralProgressCard: React.FC<{
    name: string;
    tasksCompleted: number;
    status: string;
    statusColor: string;
}> = ({ name, tasksCompleted, status, statusColor }) => {
    const progress = Math.min((tasksCompleted / 10) * 100, 100);

    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-gray-800">{name}</p>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusColor}`}>{status}</span>
            </div>
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-primary-700">Task Progress</span>
                    <span className="text-sm font-medium text-gray-600">{tasksCompleted}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const InviteView: React.FC<InviteViewProps> = ({ userProfile, referrals }) => {
  const referralCode = userProfile?.referralCode || userProfile?.username || '';
  const referralLink = `https://earn-halalofficial.vercel.app/signup?ref=${referralCode}`;
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const shareText = `Join me on Earn Halal and start earning rewards! Use my link to sign up:`;
  
  const yourTasksCompleted = userProfile?.tasksCompletedCount || 0;
  const yourProgress = Math.min((yourTasksCompleted / 50) * 100, 100);

  const getStatus = (referral: Referral): { text: string; color: string } => {
        if (referral.status === 'bonus_credited') {
            return { text: 'Bonus Credited', color: 'bg-green-100 text-green-800' };
        }
        if (yourTasksCompleted < 50) {
            return { text: 'Pending Your Tasks', color: 'bg-orange-100 text-orange-800' };
        }
        if (referral.referredUserTasksCompleted < 10) {
             return { text: "Pending Friend's Tasks", color: 'bg-yellow-100 text-yellow-800' };
        }
        return { text: 'Eligible', color: 'bg-blue-100 text-blue-800' };
    };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-subtle-md text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Invite Friends, Earn Rewards</h2>
            <p className="max-w-3xl mx-auto text-gray-600 mb-6">
               Invite friends and earn <span className="font-bold text-accent-600">200 Rs</span>! Your bonus will be credited once <span className="font-bold">you complete 50 tasks</span> AND <span className="font-bold">your friend completes 10 tasks</span>.
            </p>

            <div className="bg-gray-100 p-4 rounded-xl max-w-lg mx-auto mb-6 border border-gray-200">
                <label className="text-sm font-semibold text-gray-500">Your Referral Link</label>
                <div className="mt-2 flex rounded-lg shadow-sm">
                    <input type="text" readOnly value={referralLink} className="flex-1 block w-full rounded-none rounded-l-lg sm:text-sm bg-white border-y border-l border-gray-300 text-gray-800 p-3" />
                    <button onClick={() => copyToClipboard(referralLink)} className="inline-flex items-center justify-center w-16 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-500 bg-gray-200 hover:bg-gray-300">
                        {isCopied ? <CheckCircleIcon className="w-6 h-6 text-green-600" /> : <ClipboardCopyIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
             <div className="flex items-center justify-center space-x-4">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition-transform transform hover:scale-110 shadow-lg">
                    <WhatsAppIcon className="w-6 h-6 text-white"/>
                </a>
                 <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-110 shadow-lg">
                    <FacebookIcon className="w-6 h-6 text-white"/>
                </a>
                 <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 transition-transform transform hover:scale-110 shadow-lg">
                    <TwitterIcon className="w-6 h-6 text-white"/>
                </a>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-subtle border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h3>
            <div>
                 <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-purple-700">Your Task Progress</span>
                    <span className="text-sm font-medium text-gray-600">{yourTasksCompleted}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full text-center text-white text-xs font-bold leading-4" style={{ width: `${yourProgress}%` }}>
                        {yourProgress.toFixed(0)}%
                    </div>
                </div>
                {yourTasksCompleted < 50 && <p className="text-xs text-center mt-2 text-gray-500">Complete {50 - yourTasksCompleted} more tasks to be eligible for referral bonuses.</p>}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-subtle border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Invited Friends ({referrals.length})</h3>
            {referrals.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {referrals.map(referral => {
                       const statusInfo = getStatus(referral);
                       return (
                         <ReferralProgressCard
                            key={referral.id}
                            name={referral.referredUsername}
                            tasksCompleted={referral.referredUserTasksCompleted}
                            status={statusInfo.text}
                            statusColor={statusInfo.color}
                        />
                       )
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-6">You haven't invited anyone yet. Share your link to start earning!</p>
            )}
        </div>
    </div>
  );
};

export default InviteView;