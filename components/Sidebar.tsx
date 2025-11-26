
import React from 'react';
import {
  DashboardIcon, WalletIcon, CreateTaskIcon, SettingsIcon,
  ClipboardListIcon, PlusCircleIcon, BriefcaseIcon, ExchangeIcon, BuildingIcon, MegaphoneIcon, ChartBarIcon, UserGroupIcon, EyeIcon, TargetIcon, InfoIcon, ShieldCheck, PlayCircleIcon, GiftIcon
} from './icons';
import type { View, UserMode } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  onClose: () => void;
  unreadUpdatesCount: number;
  userMode: UserMode;
  onSwitchMode: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
  isNew?: boolean;
}> = ({ icon, label, isActive, onClick, badgeCount, isNew }) => {
    const activeClass = 'bg-blue-50 text-blue-700 font-bold shadow-sm border-r-4 border-blue-600';
    
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 transition-all duration-200 group relative py-3 px-4 ${
          isActive
            ? activeClass
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</div>
        <span className="text-sm flex-1 text-left flex items-center gap-2">
            {label}
            {isNew && <span className="text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-pulse">New</span>}
        </span>
        {badgeCount && badgeCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{badgeCount}</span>
        )}
      </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, onClose, unreadUpdatesCount, userMode, onSwitchMode }) => {
  
  const isAdvertiser = userMode === 'ADVERTISER';

  // Advertiser Menu (Business Suite)
  const advertiserViews = [
      { view: 'ADVERTISER_DASHBOARD', label: 'Overview', icon: <DashboardIcon className="w-5 h-5" /> },
      { view: 'CREATE_TASK', label: 'New Campaign', icon: <MegaphoneIcon className="w-5 h-5" /> },
      { view: 'POST_JOB', label: 'Post Job', icon: <BriefcaseIcon className="w-5 h-5" /> },
      { view: 'MANAGE_CAMPAIGNS', label: 'All Campaigns', icon: <ClipboardListIcon className="w-5 h-5" /> },
      { view: 'WALLET', label: 'Funds & Wallet', icon: <WalletIcon className="w-5 h-5" /> },
      { view: 'DEPOSIT', label: 'Add Budget', icon: <PlusCircleIcon className="w-5 h-5" /> },
      { view: 'ADS_GUIDE', label: 'How to Run Ads', icon: <InfoIcon className="w-5 h-5" /> },
      { view: 'ADS_POLICY', label: 'Ads Policy', icon: <ShieldCheck className="w-5 h-5" /> },
      { view: 'PROFILE_SETTINGS', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  // Earner Menu (User App)
  const earnerViews = [
      { view: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
      { view: 'EARN', label: 'Task Wall', icon: <ClipboardListIcon className="w-5 h-5" /> },
      { view: 'ADS_WATCH', label: 'Watch Ads', icon: <PlayCircleIcon className="w-5 h-5" />, isNew: true },
      { view: 'SPIN_WHEEL', label: 'Spin & Win', icon: <GiftIcon className="w-5 h-5" /> },
      { view: 'PREMIUM_HUB', label: 'Premium Hub', icon: <BriefcaseIcon className="w-5 h-5" /> },
      { view: 'WALLET', label: 'My Wallet', icon: <WalletIcon className="w-5 h-5" /> },
      { view: 'INVITE', label: 'Invite Friends', icon: <UserGroupIcon className="w-5 h-5" /> },
      { view: 'LEADERBOARD', label: 'Leaderboard', icon: <ChartBarIcon className="w-5 h-5" /> },
      { view: 'PROFILE_SETTINGS', label: 'Profile', icon: <SettingsIcon className="w-5 h-5" /> },
  ];
  
  const currentMenu = isAdvertiser ? advertiserViews : earnerViews;

  const handleItemClick = (view: View) => {
      setActiveView(view);
      if (window.innerWidth < 768) {
          onClose();
      }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 w-64 fixed top-0 left-0 bottom-0 h-full shadow-2xl z-50 transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${isAdvertiser ? 'bg-blue-600 shadow-blue-500/30' : 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/30'}`}>
                  {isAdvertiser ? <BuildingIcon className="w-6 h-6" /> : <ClipboardListIcon className="w-6 h-6" />}
              </div>
              <div>
                  <span className="font-black text-xl text-slate-900 tracking-tight font-heading block leading-none">
                    TaskMint
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${isAdvertiser ? 'text-blue-600' : 'text-amber-600'}`}>
                      {isAdvertiser ? 'Business Console' : 'Earning App'}
                  </span>
              </div>
        </div>
          
        <div className="py-4 overflow-y-auto flex-1 custom-scrollbar">
            <p className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isAdvertiser ? 'Advertising' : 'Main Menu'}
            </p>
            <nav className="space-y-1">
                {currentMenu.map((item: any, index) => (
                <NavItem
                    key={`${item.view}-${index}`}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeView === item.view}
                    onClick={() => handleItemClick(item.view)}
                    badgeCount={item.view === 'UPDATES_INBOX' ? unreadUpdatesCount : 0}
                    isNew={item.isNew}
                />
                ))}
            </nav>
        </div>
          
        {/* Switch Account Footer */}
        <div className="mt-auto p-4 border-t border-gray-100 bg-slate-50">
            <button 
                onClick={() => { onSwitchMode(); onClose(); }}
                className="w-full bg-white hover:bg-blue-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3 transition-all group shadow-sm"
            >
                <div className="p-2 rounded-lg text-white bg-slate-800 group-hover:bg-blue-600 transition-colors">
                    <ExchangeIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Switch Mode</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {isAdvertiser ? 'Go to Earning' : 'Go to Business'}
                    </p>
                </div>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
