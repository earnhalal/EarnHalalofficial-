import React, { useState, useEffect, useRef } from 'react';
import type { View } from '../types';
import { MenuIcon, CloseIcon, ArrowLeftIcon, UserIcon } from './icons';

interface HeaderProps {
  activeView: View;
  balance: number;
  username: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  canGoBack: boolean;
  onBack: () => void;
  setActiveView: (view: View) => void;
}

const viewTitles: Record<View, string> = {
  DASHBOARD: 'Dashboard',
  EARN: 'Earn Rewards',
  SPIN_WHEEL: 'Spin & Win',
  PLAY_AND_EARN: 'Play & Earn',
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
  AVIATOR_GAME: 'Aviator',
  LUDO_GAME: 'Ludo Star',
  LOTTERY_GAME: 'Daily Lottery',
  COIN_FLIP_GAME: 'Coin Flip',
  MINES_GAME: 'Mines',
};

const Header: React.FC<HeaderProps> = ({ activeView, balance, username, isSidebarOpen, setIsSidebarOpen, canGoBack, onBack, setActiveView }) => {
  const title = viewTitles[activeView] || 'Dashboard';
  const [animateBalance, setAnimateBalance] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (balance > prevBalanceRef.current) {
      setAnimateBalance(true);
      const timer = setTimeout(() => {
        setAnimateBalance(false);
      }, 700);
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = balance;
  }, [balance]);


  return (
    <header className="bg-white/80 backdrop-blur-md p-4 sm:p-5 sticky top-0 z-20 border-b border-gray-200">
      <style>{`
        @keyframes balance-pop-glow {
          0% { transform: scale(1); text-shadow: none; }
          50% { transform: scale(1.15); text-shadow: 0 0 15px rgba(245, 158, 11, 0.4); color: #b45309; }
          100% { transform: scale(1); text-shadow: none; }
        }
        .balance-increase {
          animation: balance-pop-glow 0.7s ease-in-out;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-700">
                {isSidebarOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
            {canGoBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeftIcon className="w-7 h-7" />
              </button>
            )}
            <h1 className="text-3xl font-heading font-semibold text-gray-900">{title}</h1>
        </div>
        <button onClick={() => setActiveView('PROFILE_SETTINGS')} className="flex items-center space-x-4 p-2 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="text-right">
                <p className="font-semibold text-gray-800 group-hover:text-accent-700 transition-colors text-lg">{username}</p>
                <p className={`text-base font-numeric text-accent-600 font-bold ${animateBalance ? 'balance-increase' : ''}`}>{balance.toFixed(2)} Rs</p>
            </div>
             <div className="p-3 bg-gray-200 rounded-full group-hover:bg-accent-100 transition-colors border border-transparent group-hover:border-accent-300">
                <UserIcon className="w-7 h-7 text-gray-600 group-hover:text-accent-700 transition-colors"/>
            </div>
        </button>
      </div>
    </header>
  );
};

export default Header;