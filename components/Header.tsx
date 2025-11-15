import React, { useState, useEffect, useRef } from 'react';
import type { View } from '../types';
import { MenuIcon, CloseIcon, ArrowLeftIcon, UserIcon, MailIcon } from './icons';

interface HeaderProps {
  activeView: View;
  balance: number;
  username: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  canGoBack: boolean;
  onBack: () => void;
  setActiveView: (view: View) => void;
  unreadUpdatesCount: number;
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
  LUDO_GAME: 'Ludo Star',
  LOTTERY_GAME: 'Daily Lottery',
  COIN_FLIP_GAME: 'Coin Flip',
  MINES_GAME: 'Mines',
  SOCIAL_GROUPS: 'Social Groups',
  UPDATES_INBOX: 'Inbox',
};

const Header: React.FC<HeaderProps> = ({ activeView, balance, username, isSidebarOpen, setIsSidebarOpen, canGoBack, onBack, setActiveView, unreadUpdatesCount }) => {
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
    <header className="bg-white/80 backdrop-blur-md p-3 sm:p-4 sticky top-0 z-20 border-b border-gray-200">
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
        <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-700">
                {isSidebarOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
            {canGoBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeftIcon className="w-7 h-7" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 truncate">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
             <button
                onClick={() => setActiveView('UPDATES_INBOX')}
                className="relative text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="View updates"
            >
                <MailIcon className="w-7 h-7" />
                {unreadUpdatesCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                        {unreadUpdatesCount}
                    </span>
                )}
            </button>
            <div onClick={() => setActiveView('PROFILE_SETTINGS')} className="flex items-center space-x-3 cursor-pointer group p-1 rounded-full hover:bg-gray-100/80 transition-colors duration-300">
                <div className="relative">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-primary-400 transition-all duration-300 ring-2 ring-offset-1 ring-transparent group-hover:ring-primary-200">
                        <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600"/>
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                </div>
                <div className="text-left hidden sm:block">
                    <p className="font-bold text-gray-800 text-base truncate group-hover:text-primary-600 transition-colors">{username}</p>
                    <p className={`font-numeric text-accent-600 font-bold text-sm ${animateBalance ? 'balance-increase' : ''}`}>{balance.toFixed(2)} <span className="text-xs font-sans text-gray-500">Rs</span></p>
                </div>
            </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;