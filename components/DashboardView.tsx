import React from 'react';
import { EarnIcon, WalletIcon, CreateTaskIcon, BriefcaseIcon, InfoIcon } from './icons';
import type { View, Transaction } from '../types';
import { TransactionType } from '../types';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  referrals: number;
  setActiveView: (view: View) => void;
  transactions: Transaction[];
  onSimulateNewTask: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; gradient: string; animationDelay: string }> = ({ title, value, icon, gradient, animationDelay }) => (
  <div className={`relative p-6 rounded-xl shadow-md text-white overflow-hidden ${gradient} animate-fade-in-up`} style={{ animationDelay }}>
    <div className="absolute -right-4 -bottom-4 text-white/20">
      {icon}
    </div>
    <p className="text-white/80">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ActionButton: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-full text-center">
    {icon}
    <span className="mt-2 font-semibold">{title}</span>
  </button>
);


const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, referrals, setActiveView, transactions, onSimulateNewTask }) => {
  const recentEarnings = transactions
    .filter(tx => tx.type === TransactionType.EARNING)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Current Balance" value={`${balance.toFixed(2)} Rs`} icon={<WalletIcon className="w-24 h-24" />} gradient="bg-gradient-to-br from-primary-500 to-primary-600" animationDelay="0ms" />
        <StatCard title="Tasks Completed" value={tasksCompleted} icon={<EarnIcon className="w-24 h-24" />} gradient="bg-gradient-to-br from-amber-500 to-amber-600" animationDelay="100ms" />
        <StatCard title="Total Referrals" value={referrals} icon={<CreateTaskIcon className="w-24 h-24" />} gradient="bg-gradient-to-br from-accent-500 to-red-500" animationDelay="200ms" />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
           <ActionButton title="Start Earning" icon={<EarnIcon className="w-10 h-10" />} onClick={() => setActiveView('EARN')} />
           <ActionButton title="Go to Wallet" icon={<WalletIcon className="w-10 h-10" />} onClick={() => setActiveView('WALLET')} />
           <ActionButton title="Create a Task" icon={<CreateTaskIcon className="w-10 h-10" />} onClick={() => setActiveView('CREATE_TASK')} />
           <ActionButton title="Apply for Jobs" icon={<BriefcaseIcon className="w-10 h-10" />} onClick={() => setActiveView('JOBS')} />
           <ActionButton title="Test Notification" icon={<InfoIcon className="w-10 h-10" />} onClick={onSimulateNewTask} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Welcome to Earn Halal!</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Your trusted platform for earning rewards through simple tasks. Complete tasks, invite friends, or create your own campaigns to boost your online presence. All earnings are processed transparently and in accordance with Halal principles.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Recently Completed Tasks</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {recentEarnings.length > 0 ? (
                    recentEarnings.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{tx.description}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-bold text-green-500 text-sm whitespace-nowrap">
                                +{tx.amount.toFixed(2)} Rs
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No recent task earnings.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;