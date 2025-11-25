
// components/DashboardView.tsx
import React, { useMemo } from 'react';
import type { View, UserProfile } from '../types';
import { 
    InviteIcon, CreateTaskIcon, DocumentCheckIcon, SparklesIcon, EarnIcon, 
    ArrowRight, WalletIcon, GiftIcon, PlusCircleIcon, ChartBarIcon
} from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
  userProfile: UserProfile | null;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; bgClass: string; iconColor: string; delay: number }> = ({ icon, label, value, bgClass, iconColor, delay }) => (
    <div 
        className={`p-5 rounded-3xl shadow-card border border-gray-100 flex flex-col items-start justify-between min-h-[120px] ${bgClass} transition-all duration-300 hover:shadow-gold/20 hover:-translate-y-1 animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
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
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${colorClass} ring-4 ring-white ring-opacity-50`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 sm:w-7 sm:h-7" })}
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-gold hover:shadow-gold-hover transition-all duration-300 transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                    <img 
                        src={userProfile?.photoURL || `https://api.dicebear.com/9.x/micah/svg?seed=${username}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full bg-gray-50" 
                    />
                  </div>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-md border-2 border-white ${getLevelColor(level)} animate-bounce-small`}>
                  {level}
              </div>
          </div>
      </div>

      {/* Enhanced Balance Card - Premium Glassmorphism */}
      <div className="relative w-full h-auto min-h-[220px] rounded-[36px] p-8 text-white shadow-2xl overflow-hidden group transform transition-transform hover:scale-[1.01]">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-slate-950"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
        
        {/* Animated Abstract Shapes */}
        <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-50%] left-[-20%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]"></div>
        
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 w-fit">
                        <WalletIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300">Total Balance</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-200 drop-shadow-lg">
                            {balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xl font-bold text-amber-500 font-mono">PKR</span>
                    </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-gold text-white">
                    <ChartBarIcon className="w-6 h-6" />
                </div>
            </div>

            <div className="flex gap-3 mt-auto">
                <button 
                    onClick={() => setActiveView('DEPOSIT')}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg group/btn"
                >
                    <div className="p-1 bg-white/20 rounded-full group-hover/btn:bg-white/30 transition-colors"><PlusCircleIcon className="w-3.5 h-3.5 text-amber-300" /></div> 
                    Deposit
                </button>
                <button 
                    onClick={() => setActiveView('WALLET')}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-gold transition-all active:scale-95 group/btn"
                >
                    Withdraw 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
          <div className="flex items-center justify-between mb-5 px-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-amber-500" /> 
                  Start Earning
              </h2>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
              <QuickActionBtn 
                  icon={<EarnIcon />} 
                  label="Tasks" 
                  onClick={() => setActiveView('EARN')} 
                  colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40" 
                  delay={100}
              />
              {/* REPLACED PLAY & EARN WITH CREATE TASK */}
              <QuickActionBtn 
                  icon={<CreateTaskIcon />} 
                  label="Promote" 
                  onClick={() => setActiveView('CREATE_TASK')} 
                  colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-indigo-500/40" 
                  delay={200}
              />
              <QuickActionBtn 
                  icon={<GiftIcon />} 
                  label="Spin" 
                  onClick={() => setActiveView('SPIN_WHEEL')} 
                  colorClass="bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/40" 
                  delay={300}
              />
              <QuickActionBtn 
                  icon={<InviteIcon />} 
                  label="Invite" 
                  onClick={() => setActiveView('INVITE')} 
                  colorClass="bg-gradient-to-br from-orange-400 to-amber-500 shadow-amber-500/40" 
                  delay={400}
              />
          </div>
      </div>

      {/* Stats & Daily Goal Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Daily Goal Card */}
          <div className="col-span-1 sm:col-span-2 bg-white p-6 rounded-[28px] shadow-subtle border border-gray-100 flex items-center justify-between relative overflow-hidden animate-fade-in-up" style={{animationDelay: '500ms'}}>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">Daily Streak</h3>
                      <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200">LVL UP</div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">Complete 10 tasks to boost your rank!</p>
                  <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      <DocumentCheckIcon className="w-3.5 h-3.5 text-amber-400" />
                      {dailyCompleted} / {dailyTarget} Tasks
                  </div>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mr-2">
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
                      <span className="text-sm sm:text-base font-black text-slate-900">{Math.round(progressPercent)}%</span>
                  </div>
              </div>
          </div>

          <StatCard 
              icon={<DocumentCheckIcon className="w-6 h-6 text-white" />} 
              label="Total Tasks" 
              value={tasksCompleted} 
              bgClass="bg-white" 
              iconColor="bg-gradient-to-br from-slate-700 to-slate-900"
              delay={600}
          />
          <StatCard 
              icon={<InviteIcon className="w-6 h-6 text-white" />} 
              label="Team Size" 
              value={invitedCount} 
              bgClass="bg-white" 
              iconColor="bg-gradient-to-br from-amber-400 to-amber-600"
              delay={700}
          />
      </div>

      {/* Recent Activity Snippet */}
      <div className="bg-white p-6 rounded-[28px] shadow-subtle border border-gray-100 animate-fade-in-up" style={{animationDelay: '800ms'}}>
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Live Activity</h3>
              <button onClick={() => setActiveView('WALLET')} className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1 rounded-lg transition-colors">View All</button>
          </div>
          <div className="space-y-5">
              <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-105 transition-transform">
                          <EarnIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">Task Completion</p>
                          <p className="text-xs text-gray-400 font-medium">Website Visit • 2 mins ago</p>
                      </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">+2.50 Rs</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer opacity-80">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-105 transition-transform">
                          <GiftIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Daily Spin</p>
                          <p className="text-xs text-gray-400 font-medium">Free Reward • Today</p>
                      </div>
                  </div>
                  <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">+5.00 Rs</span>
              </div>
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
