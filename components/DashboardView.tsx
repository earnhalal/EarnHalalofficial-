// components/DashboardView.tsx
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
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username }) => {
  const userLevel = 3;
  const levelProgress = 65; 

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {username}!</h1>
            <p className="text-gray-500 text-sm">Keep hustling, keep minting.</p>
        </div>
      </div>

      {/* Luxury Balance Card (Black & Gold) */}
      <div className="relative p-8 rounded-[32px] text-white bg-slate-900 shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-800">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="font-medium text-slate-400 text-sm uppercase tracking-widest mb-2">Total Balance</p>
          <div className="flex items-baseline gap-1">
             <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm">
                {balance.toFixed(2)}
             </span>
             <span className="text-xl font-bold text-amber-500">Rs</span>
          </div>
          
          <div className="mt-8 flex gap-4 w-full max-w-md">
            <button onClick={() => setActiveView('DEPOSIT')} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10">
              <span className="text-lg font-light text-amber-400">+</span> Deposit
            </button>
            <button onClick={() => setActiveView('WALLET')} className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<DocumentCheckIcon className="w-6 h-6 text-slate-900"/>} label="Tasks Done" value={tasksCompleted} color="bg-amber-100" />
          <StatCard icon={<InviteIcon className="w-6 h-6 text-white"/>} label="Friends Invited" value={invitedCount} color="bg-slate-900" />
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8"></path>
                    <path className="text-amber-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" strokeDasharray={`${levelProgress}, 100`}></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-slate-900 font-bold text-sm">{userLevel}</div>
            </div>
             <div>
                <p className="text-sm text-gray-500 font-medium">Current Level</p>
                <p className="text-lg font-bold text-gray-900">Pro Earner</p>
            </div>
          </div>
      </div>

      {/* Instant Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Instant Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActiveView('CREATE_TASK')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-slate-100">
                <CreateTaskIcon className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors"/>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-gray-700">Create Task</span>
          </button>
          <button onClick={() => setActiveView('EARN')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100">
                <EarnIcon className="w-6 h-6 text-amber-600 group-hover:text-amber-700 transition-colors"/>
            </div>
             <span className="font-semibold text-xs sm:text-sm text-gray-700">Start Earning</span>
          </button>
          <button onClick={() => setActiveView('SPIN_WHEEL')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-100">
                <SparklesIcon className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
            <span className="font-semibold text-xs sm:text-sm text-gray-700">Spin & Win</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DashboardView;