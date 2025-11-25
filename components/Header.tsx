
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { SparklesIcon } from './icons';

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
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ username, setActiveView }) => {
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
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 transition-all duration-300">
      {isBannerVisible && (
        <div className="bg-slate-900 text-white text-xs font-medium p-2 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          <span 
            className={`transition-opacity duration-500 relative z-10 inline-block truncate max-w-[90%] ${isNotificationAnimating ? 'opacity-100' : 'opacity-0'}`}
            dangerouslySetInnerHTML={{ __html: notificationMessage }}
          />
          <button onClick={() => setIsBannerVisible(false)} className="absolute top-1/2 right-2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-center px-4 py-4 relative">
        {/* Centered Premium Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('DASHBOARD')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-105">
                <SparklesIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tighter font-heading">
              Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">Mint</span>
            </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
