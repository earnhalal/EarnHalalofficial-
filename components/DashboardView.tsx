import React, { useMemo, useEffect } from 'react';
import { EarnIcon, WalletIcon, CreateTaskIcon, BriefcaseIcon, GiftIcon, InviteIcon, ChartBarIcon } from './icons';
import type { View, Transaction } from '../types';
import { TransactionType } from '../types';

const AdsenseBanner: React.FC = () => {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '600ms' }}>
             <h3 className="text-xs font-semibold text-slate-500 mb-2 text-center uppercase tracking-wider">Advertisement</h3>
             <ins className="adsbygoogle"
                 style={{ display: 'block', minHeight: '100px' }}
                 data-ad-client="ca-pub-9056218549588930"
                 data-ad-slot="1234567890"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  referrals: number;
  setActiveView: (view: View) => void;
  transactions: Transaction[];
  onSimulateNewTask: () => void;
}

const BalanceCard: React.FC<{ balance: number }> = ({ balance }) => (
    <div className="relative p-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-white/10 shadow-lg text-white overflow-hidden animate-fade-in-up lg:col-span-2">
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-tl from-amber-500/10 to-transparent rounded-full opacity-50"></div>
      <p className="font-semibold text-slate-300">Current Balance</p>
      <p className="text-5xl font-extrabold my-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.4))' }}>
        {balance.toFixed(2)} <span className="text-3xl">Rs</span>
      </p>
      <p className="text-sm text-slate-400">Available for withdrawal or creating tasks.</p>
    </div>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className={`relative p-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-white/10 shadow-lg text-white overflow-hidden animate-fade-in-up flex flex-col justify-center`}>
     <div className="absolute -right-4 -bottom-4 text-white/5">{icon}</div>
    <p className="text-slate-300">{title}</p>
    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">{value}</p>
  </div>
);

const ActionButton: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 backdrop-blur-md border border-white/10 text-slate-300 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 hover:border-amber-400/50 hover:text-amber-300 w-full text-center group">
    <div className="mb-2 p-3 bg-white/5 rounded-full group-hover:bg-amber-500/10 transition-colors">
        {icon}
    </div>
    <span className="font-semibold text-sm">{title}</span>
  </button>
);

const WeeklyChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const weeklyData = useMemo(() => {
        const today = new Date();
        const data = Array(7).fill(0);
        const dayLabels = Array(7).fill('');
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dayLabels[6-i] = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);

            const earningsForDay = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return tx.type === TransactionType.EARNING &&
                       txDate.getFullYear() === date.getFullYear() &&
                       txDate.getMonth() === date.getMonth() &&
                       txDate.getDate() === date.getDate();
            }).reduce((sum, tx) => sum + tx.amount, 0);

            data[6-i] = earningsForDay;
        }
        return { data, dayLabels };
    }, [transactions]);
    
    const maxEarning = Math.max(...weeklyData.data, 1); // Avoid division by zero

    return (
      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg h-full">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-amber-400"/>
            Weekly Earnings
        </h2>
        <div className="flex justify-between items-end h-48 gap-2">
            {weeklyData.data.map((earning, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                    <div className="relative w-full h-full flex items-end justify-center">
                        <div className="absolute bottom-0 w-full bg-white/5 rounded-t-md"></div>
                        <div
                            className="w-[80%] bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-md transition-all duration-500 ease-out group-hover:from-amber-300 group-hover:to-amber-400"
                            style={{ height: `${(earning / maxEarning) * 100}%` }}
                        >
                           <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded-md">
                                {earning.toFixed(2)}
                           </div>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 mt-2">{weeklyData.dayLabels[index]}</span>
                </div>
            ))}
        </div>
      </div>
    );
};


const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, referrals, setActiveView, transactions, onSimulateNewTask }) => {
  const recentActivity = transactions
    .filter(tx => tx.type === TransactionType.EARNING || tx.type === TransactionType.REFERRAL)
    .slice(-5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <BalanceCard balance={balance} />
        <StatCard title="Tasks Completed" value={tasksCompleted} icon={<EarnIcon className="w-20 h-20" />} />
        <StatCard title="Direct Referrals" value={referrals} icon={<InviteIcon className="w-20 h-20" />} />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
           <ActionButton title="Start Earning" icon={<EarnIcon className="w-8 h-8" />} onClick={() => setActiveView('EARN')} />
           <ActionButton title="Spin & Win" icon={<GiftIcon className="w-8 h-8" />} onClick={() => setActiveView('SPIN_WHEEL')} />
           <ActionButton title="Invite Friends" icon={<InviteIcon className="w-8 h-8" />} onClick={() => setActiveView('INVITE')} />
           <ActionButton title="Apply for Jobs" icon={<BriefcaseIcon className="w-8 h-8" />} onClick={() => setActiveView('JOBS')} />
           <ActionButton title="Go to Wallet" icon={<WalletIcon className="w-8 h-8" />} onClick={() => setActiveView('WALLET')} />
           <ActionButton title="Create a Task" icon={<CreateTaskIcon className="w-8 h-8" />} onClick={() => setActiveView('CREATE_TASK')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <WeeklyChart transactions={transactions} />
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {recentActivity.length > 0 ? (
                    [...recentActivity].reverse().map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                            <div>
                                <p className="font-semibold text-sm text-slate-200">{tx.description}</p>
                                <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-bold text-green-400 text-sm whitespace-nowrap">
                                +{tx.amount.toFixed(2)} Rs
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-center py-4">No recent earnings yet.</p>
                )}
            </div>
        </div>
      </div>
      <AdsenseBanner />
    </div>
  );
};

export default DashboardView;