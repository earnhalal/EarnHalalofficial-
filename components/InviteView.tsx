import React, { useState } from 'react';
import { InviteIcon, TrophyIcon, ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, TwitterIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface InviteViewProps {
  username: string;
  totalReferrals: number;
  pendingBonuses: number;
  referralEarnings: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle flex items-center space-x-4">
     <div className="p-3 bg-accent-100 rounded-full text-accent-600">
      {icon}
    </div>
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const InviteView: React.FC<InviteViewProps> = ({ username, totalReferrals, pendingBonuses, referralEarnings }) => {
  const referralLink = `https://earn-halalofficial.vercel.app/ref/${username}`;
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const shareText = `Join me on Earn Halal and start earning rewards! Use my link to sign up:`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-subtle-md text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Invite Friends, Earn Rewards</h2>
            <p className="max-w-2xl mx-auto text-gray-600 mb-6">
               Share your unique link. You'll earn a <span className="font-bold text-accent-600">Rs 50 bonus</span> for every friend who joins and pays the one-time joining fee!
            </p>

            <div className="bg-gray-100 p-4 rounded-xl max-w-lg mx-auto mb-6 border border-gray-200">
                <label className="text-sm font-semibold text-gray-500">Your Unique Referral Link</label>
                <div className="mt-2 flex rounded-lg shadow-sm">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 block w-full rounded-none rounded-l-lg sm:text-sm bg-white border-y border-l border-gray-300 text-gray-800 p-3 placeholder-gray-400 focus:ring-0"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center justify-center w-16 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-500 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
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
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Referrals" value={totalReferrals} icon={<InviteIcon className="w-8 h-8" />} />
            <StatCard title="Pending Bonuses" value={pendingBonuses} icon={<SparklesIcon className="w-8 h-8" />} />
            <StatCard title="Total Earnings" value={`${referralEarnings.toFixed(2)} Rs`} icon={<TrophyIcon className="w-8 h-8" />} />
        </div>
    </div>
  );
};

export default InviteView;