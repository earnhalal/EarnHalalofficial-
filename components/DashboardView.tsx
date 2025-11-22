
import React from 'react';
import type { View } from '../types';
import { InviteIcon, CreateTaskIcon, DocumentCheckIcon, SparklesIcon, EarnIcon } from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-extrabold text-slate-900">{value}</p>
        </div>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username }) => {
  const userLevel = 3;
  const levelProgress = 65; 

  return (
    <div className="p-4 space-y-8 animate-fade-in pb-24">
      {/* Welcome Message */}
      <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hi, {username} 👋</h1>
          <p className="text-slate-500 font-medium">Let's make some money today.</p>
      </div>

      {/* Luxury Balance Card */}
      <div className="relative p-8 rounded-[32px] text-white bg-slate-900 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.5)] overflow-hidden border border-slate-800 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="font-bold text-slate-400 text-xs uppercase tracking-[0.2em] mb-3">Total Balance</p>
          <div className="flex items-baseline gap-1 mb-8">
             <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-sm tracking-tight">
                {balance.toFixed(2)}
             </span>
             <span className="text-2xl font-bold text-amber-500">Rs</span>
          </div>
          
          <div className="flex gap-4 w-full max-w-sm">
            <button onClick={() => setActiveView('DEPOSIT')} className="flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-95">
              <span className="text-xl font-light text-amber-400">+</span> Deposit
            </button>
            <button onClick={() => setActiveView('WALLET')} className="flex-1 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95">
               Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Instant Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
            Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActiveView('CREATE_TASK')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
                <CreateTaskIcon className="w-7 h-7 text-slate-600 group-hover:text-slate-900 transition-colors"/>
            </div>
            <span className="font-bold text-xs text-slate-700">Create Task</span>
          </button>
          <button onClick={() => setActiveView('EARN')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <EarnIcon className="w-7 h-7 text-amber-600 group-hover:text-amber-700 transition-colors"/>
            </div>
             <span className="font-bold text-xs text-slate-700">Start Earning</span>
          </button>
          <button onClick={() => setActiveView('SPIN_WHEEL')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <SparklesIcon className="w-7 h-7 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
            <span className="font-bold text-xs text-slate-700">Daily Spin</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
          <StatCard icon={<DocumentCheckIcon className="w-6 h-6 text-slate-900"/>} label="Tasks Done" value={tasksCompleted} color="bg-amber-100" />
          <StatCard icon={<InviteIcon className="w-6 h-6 text-white"/>} label="Invited Friends" value={invitedCount} color="bg-slate-900" />
      </div>
      
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DashboardView;
