// components/DashboardView.tsx
import React from 'react';
import type { View } from '../types';
import { InviteIcon, CreateTaskIcon } from './icons';

interface DashboardViewProps {
  balance: number;
  tasksCompleted: number;
  referrals: number;
  setActiveView: (view: View) => void;
  username: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ balance, tasksCompleted, referrals, setActiveView, username }) => {
  return (
    <div className="p-4 space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {username}!</h1>
        <p className="text-gray-500">Your halal journey continues</p>
      </div>

      {/* Balance Card */}
      <div className="relative p-6 rounded-2xl text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg overflow-hidden">
        <img src="https://firebasestorage.googleapis.com/v0/b/earnapp-f8d27.appspot.com/o/assets%2Fmeditating-man.png?alt=media&token=a8c54625-7839-4171-a477-f2759e6c0c2e" alt="Illustration" className="absolute right-0 bottom-0 h-40 opacity-20" />
        <div className="relative z-10">
          <p className="font-semibold text-emerald-200">Current Balance</p>
          <p className="text-4xl font-bold my-2">₹{balance.toFixed(2)}</p>
          <div className="mt-4 flex gap-4">
            <button onClick={() => setActiveView('DEPOSIT')} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <span className="text-xl">+</span> Deposit
            </button>
            <button onClick={() => setActiveView('WALLET')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <span className="text-xl">↓</span> Withdraw
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className="bg-white/90 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">100% Halal Certified</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 mx-auto border-4 border-emerald-500 rounded-full"></div>
            <h3 className="font-bold mt-2 text-gray-800">Tasks Done</h3>
            <p className="text-sm text-gray-500">{tasksCompleted}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mt-4 text-gray-800">Referrals</h3>
            <p className="text-sm text-gray-500">{referrals}</p>
        </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-2xl">⚠️</p>
            <h3 className="font-bold text-emerald-600 mt-1">Level 3</h3>
            <p className="text-sm text-gray-500">Pro Earner</p>
        </div>
      </div>

      {/* Instant Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Instant Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setActiveView('CREATE_TASK')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square">
            <img src="https://firebasestorage.googleapis.com/v0/b/earnapp-f8d27.appspot.com/o/assets%2Fmeditating-man.png?alt=media&token=a8c54625-7839-4171-a477-f2759e6c0c2e" alt="Create Task" className="w-16 h-16"/>
            <span className="font-semibold text-sm mt-2 text-gray-700">Create Task</span>
          </button>
          <button onClick={() => setActiveView('EARN')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square">
            <span className="text-2xl font-bold text-emerald-600">Start</span>
             <span className="font-semibold text-sm mt-2 text-gray-700">Earning</span>
          </button>
          <button onClick={() => setActiveView('INVITE')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-square">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="font-semibold text-sm mt-2 text-gray-700">Invite</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;