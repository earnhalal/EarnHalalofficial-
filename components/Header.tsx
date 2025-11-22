// components/Header.tsx
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { MenuIcon, GiftIcon, SparklesIcon } from './icons';

// --- Data for Dynamic Notifications ---
const names = [
    'Ahmed', 'Fatima', 'Ali', 'Ayesha', 'Zainab', 'Bilal', 'Hassan', 'Sana', 'Usman', 'Maryam', 'Abdullah', 'Khadija'
];
const amounts = [100, 250, 500, 750, 1000, 1250, 2000];
const eventTemplates = [
  { action: 'earned', source: 'from Spin & Win!' },
  { action: 'earned', source: 'by completing a Task!' },
  { action: 'earned', source: 'from a Referral Bonus!' }
];

interface HeaderProps {
  username: string;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ username, setIsSidebarOpen, setActiveView }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('🔔 Welcome to TaskMint! See what others are earning.');
  const [isNotificationAnimating, setIsNotificationAnimating] = useState(true);

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      setIsNotificationAnimating(false);
      setTimeout(() => {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const randomEvent = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
        setNotificationMessage(`🔔 ${randomName} just ${randomEvent.action} <strong>Rs ${randomAmount}</strong> ${randomEvent.source}`);
        setIsNotificationAnimating(true); 
      }, 500);
    }, 5000);
    return () => clearInterval(notificationInterval);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm border-b border-gray-100">
      {isBannerVisible && (
        <div className="bg-slate-900 text-white text-sm font-medium p-2 text-center relative overflow-hidden">
          {/* Subtle gold shine animation */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          <span 
            className={`transition-opacity duration-500 relative z-10 ${isNotificationAnimating ? 'opacity-100' : 'opacity-0'}`}
            dangerouslySetInnerHTML={{ __html: notificationMessage }}
          />
          <button onClick={() => setIsBannerVisible(false)} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white transition-colors">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg text-gray-900 tracking-tight">TaskMint</span>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setActiveView('SPIN_WHEEL')} 
                className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors border border-amber-200/50 shadow-sm"
            >
                <GiftIcon className="w-5 h-5" />
                <span className="text-xs font-bold hidden sm:inline">Daily Spin</span>
            </button>
            <button onClick={() => setActiveView('PROFILE_SETTINGS')} className="relative group">
                <div className="w-9 h-9 rounded-full border-2 border-amber-400/30 p-0.5 group-hover:border-amber-400 transition-colors">
                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${username}`} alt="User Profile" className="w-full h-full rounded-full" />
                </div>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;