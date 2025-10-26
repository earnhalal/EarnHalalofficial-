import React, { useState } from 'react';
import { InviteIcon, TrophyIcon, ClipboardCopyIcon, WhatsAppIcon, FacebookIcon, TwitterIcon, CheckCircleIcon } from './icons';

interface InviteViewProps {
  referrals: {
    level1: number;
    level2: number;
  };
  referralEarnings: number;
  onSimulateReferral: (level: 1 | 2) => void;
  username: string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg flex items-center space-x-4">
     <div className="p-3 bg-white/10 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-gray-300">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const InviteView: React.FC<InviteViewProps> = ({ referrals, referralEarnings, onSimulateReferral, username }) => {
  const referralLink = `https://earn-halalofficial.vercel.app/ref/${username}`;
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };
  
  const shareText = `Join me on Earn Halal and start earning rewards! Use my link to sign up:`;

  return (
    <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-accent-500 p-8 rounded-2xl shadow-2xl text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -left-12 w-52 h-52 bg-white/10 rounded-full"></div>
            <InviteIcon className="w-20 h-20 mx-auto text-white/80 mb-4" />
            <h2 className="text-4xl font-extrabold mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>Build Your Team, Boost Your Earnings!</h2>
            <p className="max-w-2xl mx-auto text-white/90 mb-8">
                Share your unique link with friends. You'll earn from every friend who joins and from the friends they invite!
            </p>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl max-w-lg mx-auto mb-6">
                <label className="text-sm font-semibold text-white/80">Your Unique Referral Link</label>
                <div className="mt-2 flex rounded-lg shadow-sm">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 block w-full rounded-none rounded-l-lg sm:text-sm bg-white/20 border-0 text-white p-3 placeholder-white/50 focus:ring-0"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center justify-center w-16 px-4 py-2 border border-l-0 border-transparent rounded-r-lg text-white bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        {isCopied ? <CheckCircleIcon className="w-6 h-6 text-green-300" /> : <ClipboardCopyIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition-transform transform hover:scale-110">
                    <WhatsAppIcon className="w-6 h-6 text-white"/>
                </a>
                 <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-110">
                    <FacebookIcon className="w-6 h-6 text-white"/>
                </a>
                 <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 transition-transform transform hover:scale-110">
                    <TwitterIcon className="w-6 h-6 text-white"/>
                </a>
            </div>
        </div>
      
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Direct Referrals (Lvl 1)" value={referrals.level1} icon={<InviteIcon className="w-8 h-8 text-white/80" />} />
            <StatCard title="Indirect Referrals (Lvl 2)" value={referrals.level2} icon={<InviteIcon className="w-8 h-8 text-white/80" />} />
            <StatCard title="Total Referral Earnings" value={`${referralEarnings.toFixed(2)} Rs`} icon={<TrophyIcon className="w-8 h-8 text-white/80" />} />
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">How The Referral System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4 p-4">
                    <div className="bg-primary-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">1</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Level 1 Bonus: 20 Rs</h4>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">When someone signs up using your link and pays their fee, you instantly get a <strong>20 Rs</strong> bonus.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4">
                    <div className="bg-amber-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">2</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Level 2 Bonus: 5 Rs</h4>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">When your friend's referral joins, you get a <strong>5 Rs</strong> bonus. Your network earns for you!</p>
                    </div>
                </div>
            </div>
        </div>
      
        {/* Simulation Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border-t-4 border-dashed border-gray-300 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Demonstration Area</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click these buttons to simulate new referrals joining and paying their fee.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onSimulateReferral(1)} className="flex-1 bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">
                    Simulate Level 1 Signup (20 Rs)
                </button>
                <button onClick={() => onSimulateReferral(2)} className="flex-1 bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                    Simulate Level 2 Signup (5 Rs)
                </button>
            </div>
        </div>
    </div>
  );
};

export default InviteView;