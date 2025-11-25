
import React, { useMemo } from 'react';
import type { View, UserProfile } from '../types';
import { 
    InviteIcon, CreateTaskIcon, DocumentCheckIcon, SparklesIcon, EarnIcon, 
    ArrowRight, WalletIcon, GiftIcon, PlusCircleIcon, ChevronDownIcon, ChartBarIcon
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
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${colorClass}`}>
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-lg hover:shadow-gold transition-shadow">
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

      {/* Enhanced Balance Card - Glassmorphism */}
      <div className="relative w-full h-auto min-h-[200px] rounded-[32px] p-6 sm:p-8 text-white shadow-2xl overflow-hidden group transform transition-transform hover:scale-[1.01]">
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <WalletIcon className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold tracking-widest uppercase">Current Balance</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 drop-shadow-sm">
                            {balance.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-amber-500">PKR</span>
                    </div>
                </div>
                <div className="hidden sm:block bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <ChartBarIcon className="w-6 h-6 text-amber-300" />
                </div>
            </div>

            <div className="flex gap-3 mt-auto">
                <button 
                    onClick={() => setActiveView('DEPOSIT')}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                >
                    <PlusCircleIcon className="w-4 h-4 text-amber-400" /> Deposit
                </button>
                <button 
                    onClick={() => setActiveView('WALLET')}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                    Withdraw <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
          <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
              <QuickActionBtn 
                  icon={<EarnIcon />} 
                  label="Tasks" 
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
          <div className="col-span-1 sm:col-span-2 bg-white p-5 rounded-3xl shadow-subtle border border-gray-100 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Daily Streak</h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">Complete 10 tasks to level up!</p>
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100">
                      <DocumentCheckIcon className="w-3 h-3" />
                      {dailyCompleted} / {dailyTarget} Tasks
                  </div>
              </div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
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
                      <span className="text-xs sm:text-sm font-black text-slate-900">{Math.round(progressPercent)}%</span>
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

      {/* Recent Activity Snippet (Mock for visual) */}
      <div className="bg-white p-6 rounded-3xl shadow-subtle border border-gray-100">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <button onClick={() => setActiveView('WALLET')} className="text-xs font-bold text-amber-600 hover:text-amber-700">View All</button>
          </div>
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          <EarnIcon className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-900">Task Completion</p>
                          <p className="text-xs text-gray-400">Just now</p>
                      </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">+2.50 Rs</span>
              </div>
              <div className="flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                          <GiftIcon className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-900">Daily Spin</p>
                          <p className="text-xs text-gray-400">Today</p>
                      </div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">+5.00 Rs</span>
              </div>
          </div>
      </div>

      <style>{`
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default DashboardView;
