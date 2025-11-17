// components/DashboardView.tsx
import React from 'react';
import type { View } from '../types';
import { InviteIcon, CreateTaskIcon, DocumentCheckIcon, TrophyIcon, SparklesIcon, EarnIcon } from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  invitedCount: number;
  setActiveView: (view: View) => void;
  username: string;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, invitedCount, setActiveView, username }) => {
  const userLevel = 3;
  const levelProgress = 65; // Example percentage

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {username}!</h1>
        <p className="text-gray-500">Your halal journey continues</p>
      </div>

      {/* Balance Card */}
      <div className="relative p-6 rounded-2xl text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <p className="font-semibold text-emerald-200">Current Balance</p>
          <p className="text-4xl font-bold my-2">Rs {balance.toFixed(2)}</p>
          <div className="mt-4 flex gap-4">
            <button onClick={() => setActiveView('DEPOSIT')} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
              <span className="text-xl">+</span> Deposit
            </button>
            <button onClick={() => setActiveView('WALLET')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               Withdraw
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className="bg-white/90 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">100% Halal Certified</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<DocumentCheckIcon className="w-6 h-6 text-white"/>} label="Tasks Done" value={tasksCompleted} color="bg-blue-500" />
          <StatCard icon={<InviteIcon className="w-6 h-6 text-white"/>} label="Friends Invited" value={invitedCount} color="bg-purple-500" />
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8"></path>
                    <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" strokeDasharray={`${levelProgress}, 100`}></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-600 font-bold">{userLevel}</div>
            </div>
             <div>
                <p className="text-sm text-gray-500">Current Level</p>
                <p className="text-lg font-bold text-gray-800">Pro Earner</p>
            </div>
          </div>
      </div>


      {/* Instant Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Instant Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActiveView('CREATE_TASK')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1">
            <CreateTaskIcon className="w-10 h-10 text-purple-500"/>
            <span className="font-semibold text-sm mt-2 text-gray-700">Create Task</span>
          </button>
          <button onClick={() => setActiveView('EARN')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1">
            <EarnIcon className="w-10 h-10 text-emerald-500"/>
             <span className="font-semibold text-sm mt-2 text-gray-700">Start Earning</span>
          </button>
          <button onClick={() => setActiveView('SPIN_WHEEL')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md hover:-translate-y-1">
            <SparklesIcon className="w-10 h-10 text-amber-500" />
            <span className="font-semibold text-sm mt-2 text-gray-700">Spin & Win</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;