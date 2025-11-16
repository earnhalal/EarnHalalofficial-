import React, { useState } from 'react';
import type { View } from '../types';
import { MenuIcon, GiftIcon } from './icons';

interface HeaderProps {
  username: string;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ username, setIsSidebarOpen, setActiveView }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      {isBannerVisible && (
        <div className="bg-emerald-500 text-white text-sm font-medium p-2 text-center relative">
          <span>🔔 Ahmed just earned <strong>Rs 750</strong> from Spin & Win! <button onClick={() => setActiveView('SPIN_WHEEL')} className="font-bold underline hover:text-emerald-200">Play Now</button></span>
          <button onClick={() => setIsBannerVisible(false)} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                <MenuIcon className="w-6 h-6" />
            </button>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#paint0_linear_header)"/>
                <path d="M12 10H20C22.2091 10 24 11.7909 24 14V16C24 18.2091 22.2091 20 20 20H12V10Z" fill="white" fillOpacity="0.5"/>
                <path d="M12 22H28V30H12V22Z" fill="white"/>
                <defs>
                    <linearGradient id="paint0_linear_header" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10b981"/>
                        <stop offset="1" stopColor="#059669"/>
                    </linearGradient>
                </defs>
            </svg>
            <span className="font-bold text-lg text-emerald-700">Earn Halal</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setActiveView('SPIN_WHEEL')} className="text-gray-600 p-2 rounded-full hover:bg-gray-200">
                <GiftIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveView('PROFILE_SETTINGS')}>
                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${username}`} alt="User Profile" className="w-9 h-9 rounded-full border-2 border-emerald-500" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;