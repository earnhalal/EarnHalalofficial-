import React, { useState, useEffect, useRef } from 'react';
import type { View } from '../types';
import { MenuIcon, CloseIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
  activeView: View;
  balance: number;
  username: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  canGoBack: boolean;
  onBack: () => void;
}

const viewTitles: Record<View, string> = {
  DASHBOARD: 'Dashboard',
  EARN: 'Earn Rewards',
  SPIN_WHEEL: 'Spin & Win',
  WALLET: 'My Wallet',
  DEPOSIT: 'Deposit Funds',
  CREATE_TASK: 'Create a New Task',
  TASK_HISTORY: 'My Task History',
  INVITE: 'Invite Friends',
  PROFILE_SETTINGS: 'Profile Settings',
  HOW_IT_WORKS: 'How It Works',
  ABOUT_US: 'About Us',
  CONTACT_US: 'Contact Us',
  JOBS: 'Jobs',
  MY_APPLICATIONS: 'My Job Applications',
  PRIVACY_POLICY: 'Privacy Policy',
  TERMS_CONDITIONS: 'Terms & Conditions',
};

const Header: React.FC<HeaderProps> = ({ activeView, balance, username, isSidebarOpen, setIsSidebarOpen, canGoBack, onBack }) => {
  const title = viewTitles[activeView] || 'Dashboard';
  const [animateBalance, setAnimateBalance] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    // Only animate if the balance has increased
    if (balance > prevBalanceRef.current) {
      setAnimateBalance(true);
      const timer = setTimeout(() => {
        setAnimateBalance(false);
      }, 700); // Duration of the animation
      
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = balance;
  }, [balance]);


  return (
    <header className="bg-[#0a192f]/80 backdrop-blur-md p-4 shadow-sm sticky top-0 z-20 border-b border-amber-400/10">
      <style>{`
        @keyframes balance-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); color: #fbbF24; } /* amber-400 */
          100% { transform: scale(1); }
        }
        .balance-increase {
          animation: balance-pop 0.7s ease-in-out;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-slate-300">
                {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            {canGoBack && (
              <button onClick={onBack} className="text-slate-300 hover:text-amber-400">
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="font-semibold text-slate-100">{username}</p>
                <p className={`text-sm text-amber-400 font-bold ${animateBalance ? 'balance-increase' : ''}`}>{balance.toFixed(2)} Rs</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;