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
          <span>🔔 Ahmed just earned <strong>₹750</strong> from Spin & Win! <button onClick={() => setActiveView('SPIN_WHEEL')} className="font-bold underline hover:text-emerald-200">Play Now</button></span>
          <button onClick={() => setIsBannerVisible(false)} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">EH</div>
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