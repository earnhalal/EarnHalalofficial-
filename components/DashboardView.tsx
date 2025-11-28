
// components/DashboardView.tsx
import React, { useMemo } from 'react';
import type { View, UserProfile } from '../types';
import { 
    InviteIcon, DocumentCheckIcon, SparklesIcon, EarnIcon, 
    ArrowRight, WalletIcon, GiftIcon, PlusCircleIcon, PlayCircleIcon, ExchangeIcon
} from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
  userProfile: UserProfile | null;
  onSwitchMode: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; bgClass: string; iconColor: string; delay: number }> = ({ icon, label, value, bgClass, iconColor, delay }) => (
    <div 
        className={`p-4 rounded-2xl shadow-card border border-gray-100 flex flex-col items-start justify-between min-h-[100px] ${bgClass} transition-all duration-300 hover:shadow-gold/20 hover:-translate-y-1 animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`p-2.5 rounded-xl bg-white shadow-sm ${iconColor} mb-2`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const QuickActionBtn: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    colorClass: string; 
    delay: number;
    isHighlight?: boolean;
}> = ({ icon, label, onClick, colorClass, delay, isHighlight }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-2 group animate-fade-in-up w-full"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${colorClass} ${isHighlight ? 'ring-2 ring-red-100' : 'ring-2 ring-white ring-opacity-50'}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
        </div>
        <span className={`text-[10px] sm:text-xs font-bold transition-colors ${isHighlight ? 'text-red-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</span>
    </button>
);

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username, userProfile, onSwitchMode }) => {
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
  const circumference = 2 * Math.PI * 20; // r=20
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getLevelColor = (lvl: number) => {
      if (lvl >= 10) return "bg-gradient-to-br from-amber-500 to-red-600";
      if (lvl >= 5) return "bg-gradient-to-br from-amber-300 to-amber-500";
      return "bg-gradient-to-br from-emerald-400 to-emerald-600";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{getGreeting()},</p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{username}</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Switch to Creator Button */}
              <button 
                  onClick={onSwitchMode}
                  className="flex-1 md:flex-none bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 border border-slate-700"
              >
                  <ExchangeIcon className="w-4 h-4 text-amber-400"/> 
                  Switch to Creator
              </button>

              {/* Profile Pic */}
              <div className="relative cursor-pointer group flex-shrink-0" onClick={() => setActiveView('PROFILE_SETTINGS')}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-gold hover:shadow-gold-hover transition-all duration-300 transform group-hover:scale-105">
                      <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                        <img 
                            src={userProfile?.photoURL || `https://api.dicebear.com/9.x/micah/svg?seed=${username}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full bg-gray-50" 
                        />
                      </div>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-md border-2 border-white ${getLevelColor(level)} animate-bounce-small`}>
                      {level}
                  </div>
              </div>
          </div>
      </div>

      {/* Compact Premium Balance Card */}
      <div className="relative w-full rounded-[24px] p-5 text-white shadow-xl overflow-hidden group transform transition-transform hover:scale-[1.01]">
        {/* Main Dark Metallic Background */}
        <div className="absolute inset-0 bg-[#0f0f0f]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#222] via-[#111] to-[#000]"></div>
        
        {/* Gold Accents */}
        <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] bg-amber-500/20 rounded-full blur-[60px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-yellow-600/10 rounded-full blur-[50px]"></div>
        
        {/* Texture & Border */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 rounded-[24px] border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]"></div>

        {/* Content - Horizontal Layout */}
        <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-1.5 mb-1 opacity-80">
                    <WalletIcon className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-amber-100">Balance</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-sm">
                        {balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-amber-600/80 font-mono">PKR</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => setActiveView('DEPOSIT')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                    <PlusCircleIcon className="w-3 h-3 text-amber-300" /> Deposit
                </button>
                <button 
                    onClick={() => setActiveView('WALLET')}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 hover:brightness-110"
                >
                    Withdraw <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 px-1">
              <SparklesIcon className="w-4 h-4 text-amber-500" /> 
              Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <QuickActionBtn 
                  icon={<PlayCircleIcon />} 
                  label="Watch Ads" 
                  onClick={() => setActiveView('WATCH_AND_EARN')} 
                  colorClass="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40" 
                  delay={50}
                  isHighlight={true}
              />
              <QuickActionBtn 
                  icon={<EarnIcon />} 
                  label="Tasks" 
                  onClick={() => setActiveView('EARN')} 
                  colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40" 
                  delay={100}
              />
              
              <QuickActionBtn 
                  icon={<GiftIcon />} 
                  label="Spin" 
                  onClick={() => setActiveView('SPIN_WHEEL')} 
                  colorClass="bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/40" 
                  delay={200}
              />
              <QuickActionBtn 
                  icon={<InviteIcon />} 
                  label="Invite" 
                  onClick={() => setActiveView('INVITE')} 
                  colorClass="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40" 
                  delay={300}
              />
          </div>
      </div>

      {/* Daily Goal & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-subtle border border-gray-100 flex items-center justify-between animate-fade-in-up" style={{animationDelay: '500ms'}}>
              <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Daily Streak</h3>
                  <p className="text-[10px] text-gray-500 font-medium mb-2">Complete 10 tasks</p>
                  <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <DocumentCheckIcon className="w-3 h-3 text-amber-400" />
                      {dailyCompleted}/{dailyTarget}
                  </div>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="20" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle 
                          cx="22" cy="22" r="20" fill="none" stroke="#f59e0b" strokeWidth="3" 
                          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} 
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out"
                      />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-900">{Math.round(progressPercent)}%</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard 
                icon={<DocumentCheckIcon className="w-4 h-4 text-white" />} 
                label="Tasks" 
                value={tasksCompleted} 
                bgClass="bg-white" 
                iconColor="bg-slate-800"
                delay={600}
            />
            <StatCard 
                icon={<InviteIcon className="w-4 h-4 text-white" />} 
                label="Team" 
                value={invitedCount} 
                bgClass="bg-white" 
                iconColor="bg-amber-500"
                delay={700}
            />
          </div>
      </div>

      <style>{`
        .animate-pulse-slow { animation: pulse-slow 6s infinite ease-in-out; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
        .animate-bounce-small { animation: bounce-small 2s infinite; }
        @keyframes bounce-small { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </div>
  );
};

export default DashboardView;
