
import React, { useMemo } from 'react';
import type { View, UserProfile } from '../types';
import { 
    InviteIcon, CreateTaskIcon, DocumentCheckIcon, SparklesIcon, EarnIcon, 
    ArrowRight, WalletIcon, GiftIcon, PlusCircleIcon, ChevronDownIcon 
} from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
  userProfile: UserProfile | null;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; bgClass: string; iconColor: string }> = ({ icon, label, value, bgClass, iconColor }) => (
    <div className={`p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start justify-between min-h-[120px] ${bgClass} transition-all hover:shadow-md`}>
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${iconColor} mb-3`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const QuickActionBtn: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    colorClass: string; 
    delay: number 
}> = ({ icon, label, onClick, colorClass, delay }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-3 group animate-fade-in-up w-full"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${colorClass}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
        </div>
        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    </button>
);

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username, userProfile }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const calculateLevel = (tasks: number) => {
      if (tasks <= 10) return { level: 1, min: 0, max: 10 };
      let lvl = Math.ceil((tasks - 10) / 10) + 1;
      if (lvl > 15) lvl = 15;
      return { level: lvl };
  };

  const { level } = useMemo(() => calculateLevel(tasksCompleted), [tasksCompleted]);
  
  // Progress ring calculation
  const dailyTarget = 10;
  const dailyCompleted = tasksCompleted % dailyTarget; 
  const progressPercent = Math.min((dailyCompleted / dailyTarget) * 100, 100);
  const circumference = 2 * Math.PI * 24; // r=24
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getLevelColor = (lvl: number) => {
      if (lvl >= 10) return "bg-gradient-to-br from-amber-500 to-red-600";
      if (lvl >= 5) return "bg-gradient-to-br from-amber-300 to-amber-500";
      return "bg-gradient-to-br from-emerald-400 to-emerald-600";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24 font-sans">
      
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
          <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">{getGreeting()},</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{username}</h1>
          </div>
          <div className="relative cursor-pointer group" onClick={() => setActiveView('PROFILE_SETTINGS')}>
              <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-lg hover:shadow-gold transition-shadow">
                  <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                    <img 
                        src={userProfile?.photoURL || `https://api.dicebear.com/9.x/micah/svg?seed=${username}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full bg-gray-50" 
                    />
                  </div>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm border-2 border-white ${getLevelColor(level)}`}>
                  {level}
              </div>
          </div>
      </div>

      {/* Main Balance Card - Luxury Style */}
      <div className="relative w-full h-auto min-h-[220px] rounded-[36px] p-8 text-white shadow-2xl overflow-hidden group transform transition-transform hover:scale-[1.01]">
        {/* Card Background */}
        <div className="absolute inset-0 bg-[#0F172A]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-black/50"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] -mr-16 -mt-16 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] -ml-10 -mb-10"></div>
        <div className="absolute top-6 right-8 opacity-20 pointer-events-none">
            <SparklesIcon className="w-24 h-24 text-amber-200 rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                        <WalletIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Total Balance</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 drop-shadow-sm">
                        {balance.toFixed(2)}
                    </span>
                    <span className="text-xl font-bold text-amber-500">Rs</span>
                </div>
            </div>

            <div className="flex gap-4 mt-auto">
                <button 
                    onClick={() => setActiveView('DEPOSIT')}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <PlusCircleIcon className="w-4 h-4 text-amber-400" /> Deposit
                </button>
                <button 
                    onClick={() => setActiveView('WALLET')}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                    Withdraw <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
          <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <QuickActionBtn 
                  icon={<EarnIcon />} 
                  label="Earn" 
                  onClick={() => setActiveView('EARN')} 
                  colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" 
                  delay={100}
              />
              <QuickActionBtn 
                  icon={<SparklesIcon />} 
                  label="Spin" 
                  onClick={() => setActiveView('SPIN_WHEEL')} 
                  colorClass="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30" 
                  delay={200}
              />
              <QuickActionBtn 
                  icon={<CreateTaskIcon />} 
                  label="Promote" 
                  onClick={() => setActiveView('CREATE_TASK')} 
                  colorClass="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30" 
                  delay={300}
              />
              <QuickActionBtn 
                  icon={<InviteIcon />} 
                  label="Invite" 
                  onClick={() => setActiveView('INVITE')} 
                  colorClass="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30" 
                  delay={400}
              />
          </div>
      </div>

      {/* Stats & Daily Goal Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Daily Goal Card */}
          <div className="col-span-1 sm:col-span-2 bg-white p-6 rounded-3xl shadow-subtle border border-gray-100 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Daily Goal</h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">Keep your streak alive!</p>
                  <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-100">
                      {dailyCompleted} / {dailyTarget} Tasks
                  </div>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="24" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      <circle 
                          cx="26" cy="26" r="24" fill="none" stroke="#f59e0b" strokeWidth="4" 
                          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} 
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out"
                      />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm font-black text-slate-900">{Math.round(progressPercent)}%</span>
                  </div>
              </div>
          </div>

          <StatCard 
              icon={<DocumentCheckIcon className="w-6 h-6 text-white" />} 
              label="Completed" 
              value={tasksCompleted} 
              bgClass="bg-white" 
              iconColor="bg-slate-900"
          />
          <StatCard 
              icon={<InviteIcon className="w-6 h-6 text-amber-600" />} 
              label="Friends" 
              value={invitedCount} 
              bgClass="bg-white" 
              iconColor="bg-amber-100"
          />
      </div>

      <style>{`
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default DashboardView;
