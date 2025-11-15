// components/DashboardView.tsx
import React from 'react';
import type { View, Transaction } from '../types';
import { TransactionType } from '../types';
import {
    WalletIcon, CreateTaskIcon, BriefcaseIcon, GiftIcon,
    InviteIcon, ChartBarIcon, TrophyIcon, EarnIcon
} from './icons';

// Reusable components for the new design
const HeroBalanceCard: React.FC<{ balance: number; setActiveView: (view: View) => void; }> = ({ balance, setActiveView }) => (
    <div
        className="relative col-span-1 md:col-span-2 p-6 sm:p-6 rounded-3xl text-white overflow-hidden bg-slate-800/50 border border-slate-700 shadow-2xl shadow-cyan-500/10 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
    >
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute top-4 left-4 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full opacity-50 blur-2xl"></div>
        
        <div className="relative z-10">
            <p className="font-semibold text-cyan-300 text-lg">Current Balance</p>
            <p className="text-5xl sm:text-7xl font-numeric my-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                {balance.toFixed(2)}
                <span className="text-4xl sm:text-5xl font-sans text-slate-400/80 ml-2">Rs</span>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => setActiveView('DEPOSIT')}
                    className="flex-1 px-6 py-3 bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-bold rounded-xl hover:bg-cyan-500/20 transition-all transform hover:scale-105"
                >
                    Deposit
                </button>
                <button 
                    onClick={() => setActiveView('WALLET')}
                    className="flex-1 px-6 py-3 bg-pink-500/10 border border-pink-400 text-pink-300 font-bold rounded-xl hover:bg-pink-500/20 transition-all transform hover:scale-105"
                >
                    Withdraw
                </button>
            </div>
        </div>
    </div>
);

const SmallStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="p-4 sm:p-6 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="p-3 bg-slate-700 rounded-full text-cyan-300">
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold font-numeric text-white">{value}</p>
        </div>
    </div>
);

const GlassActionButton: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700 text-slate-300 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-cyan-400/50 hover:text-white w-full text-center aspect-square"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="mb-2 p-3 sm:p-4 bg-slate-900/50 rounded-full border border-slate-600 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-colors duration-300 transform group-hover:scale-110">
            {icon}
        </div>
        <span className="font-semibold text-xs sm:text-sm">{title}</span>
    </button>
);

const ActivityItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const iconConfig = {
        [TransactionType.REFERRAL]: { icon: <InviteIcon className="w-5 h-5"/>, color: 'bg-pink-500/20 text-pink-300' },
        [TransactionType.GAME_WIN]: { icon: <TrophyIcon className="w-5 h-5"/>, color: 'bg-purple-500/20 text-purple-300' },
        [TransactionType.EARNING]: { icon: <EarnIcon className="w-5 h-5"/>, color: 'bg-cyan-500/20 text-cyan-300' },
    };
    const { icon, color } = iconConfig[tx.type as keyof typeof iconConfig] || iconConfig[TransactionType.EARNING];

    return (
        <div className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-slate-700/50">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-slate-200 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-400">{tx.type}</p>
                </div>
            </div>
            <p className="font-bold font-numeric text-green-400 text-base sm:text-lg">
                +{tx.amount.toFixed(2)} Rs
            </p>
        </div>
    );
};

// Main Component
interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  referrals: number;
  setActiveView: (view: View) => void;
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, referrals, setActiveView, transactions }) => {
    const recentActivity = transactions
        .filter(tx => tx.type === TransactionType.EARNING || tx.type === TransactionType.REFERRAL || tx.type === TransactionType.GAME_WIN)
        .slice(0, 5);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <HeroBalanceCard balance={balance} setActiveView={setActiveView} />
                <div className="space-y-6 sm:space-y-8">
                    <SmallStatCard title="Tasks Done" value={tasksCompleted} icon={<EarnIcon className="w-6 h-6"/>} />
                    <SmallStatCard title="Referrals" value={referrals} icon={<InviteIcon className="w-6 h-6"/>} />
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 rounded-3xl shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h2 className="text-xl sm:text-2xl font-heading font-semibold text-slate-100 mb-4 px-2">Quick Actions</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                   <GlassActionButton title="Start Earning" icon={<EarnIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('EARN')} />
                   <GlassActionButton title="Spin & Win" icon={<GiftIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('SPIN_WHEEL')} />
                   <GlassActionButton title="Invite Friends" icon={<InviteIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('INVITE')} />
                   <GlassActionButton title="Apply for Jobs" icon={<BriefcaseIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('JOBS')} />
                   <GlassActionButton title="Wallet" icon={<WalletIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('WALLET')} />
                   <GlassActionButton title="Create Task" icon={<CreateTaskIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />} onClick={() => setActiveView('CREATE_TASK')} />
                </div>
            </div>
            
            {recentActivity.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 rounded-3xl shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h2 className="text-xl sm:text-2xl font-heading font-semibold text-slate-100 mb-2 flex items-center gap-3 px-2">
                        <ChartBarIcon className="w-6 h-6 text-cyan-300" />
                        Recent Activity
                    </h2>
                    <div className="space-y-1">
                        {recentActivity.map((tx) => <ActivityItem key={tx.id} tx={tx} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;