// components/DashboardView.tsx
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { EarnIcon, WalletIcon, CreateTaskIcon, BriefcaseIcon, GiftIcon, InviteIcon, ChartBarIcon, TrophyIcon } from './icons';
import type { View, Transaction } from '../types';
import { TransactionType } from '../types';

// --- Reusable Components for the New Design ---

const useAnimatedCounter = (targetValue: number, isCurrency: boolean = false, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        let startTimestamp: number | null = null;
        const startValue = 0;
        
        const step = (timestamp: number) => {
            if (!isMounted.current) return;
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 5); // easeOutQuint
            const newCount = startValue + easeOutProgress * (targetValue - startValue);
            
            setCount(isCurrency ? newCount : Math.floor(newCount));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };
        frameRef.current = requestAnimationFrame(step);

        return () => {
            isMounted.current = false;
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [targetValue, duration, isCurrency]);
    
    return count;
};

const BalanceCard: React.FC<{ balance: number }> = ({ balance }) => {
    const animatedBalance = useAnimatedCounter(balance, true, 2500);
    return (
        <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-primary-500/20 shadow-2xl shadow-primary-500/10 text-white lg:col-span-2 overflow-hidden animate-fade-in-up">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-tl from-primary-500/10 to-transparent rounded-full opacity-50"></div>
            <div className="relative z-10">
                <p className="font-semibold text-primary-400 text-lg">Current Balance</p>
                <p className="text-7xl font-numeric my-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-400">
                    {animatedBalance.toFixed(2)} <span className="text-5xl font-sans text-primary-400/80">Rs</span>
                </p>
                <p className="text-sm text-gray-400">Available for withdrawal or creating tasks.</p>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: 'primary' | 'accent' }> = ({ title, value, icon, color }) => {
    const animatedValue = useAnimatedCounter(value, false, 2500);
    const colorClasses = color === 'primary' 
        ? 'border-primary-500/20 text-primary-400 shadow-primary-500/10' 
        : 'border-accent-500/20 text-accent-400 shadow-accent-500/10';

    return (
        <div className={`relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border ${colorClasses} shadow-2xl text-white overflow-hidden animate-fade-in-up flex flex-col justify-center`}>
            <div className="absolute -right-4 -bottom-4 opacity-10">{icon}</div>
            <p className="text-gray-400 text-lg">{title}</p>
            <p className={`text-6xl font-numeric font-bold ${color === 'primary' ? 'text-primary-400' : 'text-accent-400'}`}>{animatedValue}</p>
        </div>
    );
};

const ActionButton: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="group relative flex flex-col items-center justify-center p-4 bg-gray-800 border border-gray-700/80 text-gray-300 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 hover:border-primary-500/50 hover:text-white w-full text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/0 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        <div className="mb-3 p-4 bg-gray-900/50 rounded-full border border-gray-600 group-hover:bg-primary-500/20 group-hover:border-primary-500/50 transition-colors duration-300">
            {icon}
        </div>
        <span className="font-semibold text-sm">{title}</span>
    </button>
);

const RecentActivity: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const recentActivity = useMemo(() => {
        return transactions
            .filter(tx => tx.type === TransactionType.EARNING || tx.type === TransactionType.REFERRAL || tx.type === TransactionType.GAME_WIN)
            .slice(0, 5);
    }, [transactions]);
    
    if (recentActivity.length === 0) return null;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-heading font-semibold text-gray-100 mb-4 flex items-center gap-3">
                <ChartBarIcon className="w-7 h-7 text-primary-400" />
                Recent Activity
            </h2>
            <div className="space-y-1">
                {recentActivity.map((tx, index) => {
                    const iconConfig = {
                        [TransactionType.REFERRAL]: { icon: <InviteIcon className="w-5 h-5"/>, color: 'bg-accent-500/20 text-accent-300' },
                        [TransactionType.GAME_WIN]: { icon: <TrophyIcon className="w-5 h-5"/>, color: 'bg-purple-500/20 text-purple-300' },
                        [TransactionType.EARNING]: { icon: <EarnIcon className="w-5 h-5"/>, color: 'bg-primary-500/20 text-primary-300' },
                    };
                    const { icon, color } = iconConfig[tx.type as keyof typeof iconConfig] || iconConfig[TransactionType.EARNING];
                    
                    return (
                        <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-700/50 ${index < recentActivity.length -1 ? 'border-b border-gray-700/50': ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-full ${color}`}>
                                    {icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-200 text-sm">{tx.description}</p>
                                    <p className="text-xs text-gray-400">{tx.type}</p>
                                </div>
                            </div>
                            <p className="font-bold font-numeric text-accent-400 text-lg">+{tx.amount.toFixed(2)} Rs</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  referrals: number;
  setActiveView: (view: View) => void;
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, referrals, setActiveView, transactions }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <BalanceCard balance={balance} />
        <StatCard title="Tasks Done" value={tasksCompleted} icon={<EarnIcon className="w-24 h-24" />} color="primary" />
        <StatCard title="Referrals" value={referrals} icon={<InviteIcon className="w-24 h-24" />} color="accent" />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-2xl font-heading font-semibold text-gray-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
           <ActionButton title="Start Earning" icon={<EarnIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('EARN')} />
           <ActionButton title="Spin & Win" icon={<GiftIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('SPIN_WHEEL')} />
           <ActionButton title="Invite Friends" icon={<InviteIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('INVITE')} />
           <ActionButton title="Apply for Jobs" icon={<BriefcaseIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('JOBS')} />
           <ActionButton title="Go to Wallet" icon={<WalletIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('WALLET')} />
           <ActionButton title="Create a Task" icon={<CreateTaskIcon className="w-8 h-8 text-primary-400" />} onClick={() => setActiveView('CREATE_TASK')} />
        </div>
      </div>
      
      <RecentActivity transactions={transactions} />
      
    </div>
  );
};

export default DashboardView;
