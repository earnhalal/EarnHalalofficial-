
import React, { useMemo } from 'react';
import type { View, UserProfile } from '../types';
import { InviteIcon, CreateTaskIcon, DocumentCheckIcon, SparklesIcon, EarnIcon, ArrowRight, StarIcon, MedalIcon, CrownIcon, DiamondIcon } from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
  userProfile: UserProfile | null; // Added userProfile prop for photo access
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

const DailyProgress: React.FC<{ completed: number }> = ({ completed }) => {
    const dailyTarget = 10;
    const percentage = Math.min((completed / dailyTarget) * 100, 100);
    
    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-gray-900 text-lg">Daily Goal</h3>
                <p className="text-sm text-gray-500">{completed} / {dailyTarget} tasks completed</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-amber-500 transition-all duration-1000 ease-out" strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-amber-600">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username, userProfile }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Level Calculation Logic (Mini Version)
  const calculateLevel = (tasks: number) => {
      if (tasks <= 10) return { level: 1, min: 0, max: 10 };
      let lvl = Math.ceil((tasks - 10) / 10) + 1;
      if (lvl > 15) lvl = 15;
      const min = 10 + ((lvl - 2) * 10); 
      const max = min + 10;
      return { level: lvl, min, max };
  };

  const { level, min, max } = useMemo(() => calculateLevel(tasksCompleted), [tasksCompleted]);
  
  let progressPercent = 0;
  if (level === 1) {
      progressPercent = (tasksCompleted / 10) * 100;
  } else if (level === 15) {
      progressPercent = 100;
  } else {
      progressPercent = ((tasksCompleted - min) / 10) * 100;
  }
  progressPercent = Math.min(Math.max(progressPercent, 0), 100);

  const getLevelColor = (lvl: number) => {
      if (lvl >= 10) return "bg-gradient-to-r from-amber-500 to-red-600"; // Elite/God
      if (lvl >= 5) return "bg-gradient-to-r from-amber-300 to-amber-500"; // Gold/Platinum
      return "bg-gradient-to-r from-mint-500 to-emerald-600"; // Starter/Bronze
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Compact Pro Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex-1 cursor-pointer" onClick={() => setActiveView('LEVELS_INFO')}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{getGreeting()}</p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{username}</h1>
              
              {/* Mini Progress Bar */}
              <div className="flex items-center gap-2 max-w-[140px]">
                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getLevelColor(level)}`} 
                          style={{ width: `${progressPercent}%` }}
                      ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{Math.round(progressPercent)}%</span>
              </div>
          </div>

          {/* Pro Avatar with Level Badge */}
          <div className="relative group cursor-pointer" onClick={() => setActiveView('PROFILE_SETTINGS')}>
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-100">
                  <img 
                    src={userProfile?.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${username}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
              </div>
              {/* Level Badge Attached */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-md border-2 border-white ${getLevelColor(level)}`}>
                  {level}
              </div>
          </div>
      </div>

      {/* Enhanced Glassmorphism Balance Card */}
      <div className="relative p-6 sm:p-8 rounded-[32px] text-white bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] rounded-[32px]"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="font-bold text-slate-400 text-xs uppercase tracking-[0.2em] mb-1">Total Balance</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-sm tracking-tight">
                            {balance.toFixed(2)}
                        </span>
                        <span className="text-2xl font-bold text-amber-500">Rs</span>
                    </div>
                </div>
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                   <SparklesIcon className="w-6 h-6 text-amber-400" />
                </div>
            </div>
            
            <div className="flex gap-3">
                <button onClick={() => setActiveView('DEPOSIT')} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5">
                    <span className="text-lg font-light text-amber-400">+</span> Deposit
                </button>
                <button onClick={() => setActiveView('WALLET')} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                    Withdraw <ArrowRight className="w-4 h-4 opacity-70"/>
                </button>
            </div>
        </div>
      </div>

      {/* Daily Goal & Stats */}
      <DailyProgress completed={tasksCompleted % 10} />

      {/* Enhanced Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                Quick Actions
            </h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActiveView('CREATE_TASK')} className="bg-white p-4 rounded-2xl shadow-subtle border border-gray-50 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <CreateTaskIcon className="w-6 h-6 text-blue-600 transition-colors"/>
            </div>
            <span className="font-bold text-xs text-slate-700">Create Task</span>
          </button>
          <button onClick={() => setActiveView('EARN')} className="bg-white p-4 rounded-2xl shadow-subtle border border-gray-50 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">HOT</div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <EarnIcon className="w-6 h-6 text-amber-600 transition-colors"/>
            </div>
             <span className="font-bold text-xs text-slate-700">Earn Now</span>
          </button>
          <button onClick={() => setActiveView('SPIN_WHEEL')} className="bg-white p-4 rounded-2xl shadow-subtle border border-gray-50 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-lg hover:-translate-y-1 group active:scale-95">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <SparklesIcon className="w-6 h-6 text-purple-600 transition-colors" />
            </div>
            <span className="font-bold text-xs text-slate-700">Daily Spin</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<DocumentCheckIcon className="w-6 h-6 text-slate-900"/>} label="Total Tasks" value={tasksCompleted} color="bg-gray-100" />
          <StatCard icon={<InviteIcon className="w-6 h-6 text-white"/>} label="Friends" value={invitedCount} color="bg-slate-900" />
      </div>
      
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DashboardView;
