
import React from 'react';
import {
  DashboardIcon, WalletIcon, CreateTaskIcon, SettingsIcon,
  ClipboardListIcon, PlusCircleIcon, BriefcaseIcon, ExchangeIcon, BuildingIcon, MegaphoneIcon, ChartBarIcon, UserGroupIcon, EyeIcon, TargetIcon
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
}> = ({ icon, label, isActive, onClick, badgeCount }) => {
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
        <span className="text-sm flex-1 text-left">{label}</span>
        {badgeCount && badgeCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{badgeCount}</span>
        )}
      </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, onClose, unreadUpdatesCount, userMode, onSwitchMode }) => {
  
  // Advertiser Menu (Business Suite) - Removed Demo Labels
  const advertiserViews: { view: View; label: string; icon: React.ReactNode }[] = [
      { view: 'ADVERTISER_DASHBOARD', label: 'Overview', icon: <DashboardIcon className="w-5 h-5" /> },
      { view: 'CREATE_TASK', label: 'New Campaign', icon: <MegaphoneIcon className="w-5 h-5" /> },
      { view: 'POST_JOB', label: 'Post Job', icon: <BriefcaseIcon className="w-5 h-5" /> },
      { view: 'MANAGE_CAMPAIGNS', label: 'All Campaigns', icon: <ClipboardListIcon className="w-5 h-5" /> },
      { view: 'WALLET', label: 'Funds & Wallet', icon: <WalletIcon className="w-5 h-5" /> },
      { view: 'DEPOSIT', label: 'Add Budget', icon: <PlusCircleIcon className="w-5 h-5" /> },
      // Expanded Functional Options
      { view: 'ADVERTISER_DASHBOARD', label: 'Targeting Rules', icon: <TargetIcon className="w-5 h-5" /> },
      { view: 'ADVERTISER_DASHBOARD', label: 'Ad Pixel', icon: <EyeIcon className="w-5 h-5" /> },
      { view: 'ADVERTISER_DASHBOARD', label: 'Audience Segments', icon: <UserGroupIcon className="w-5 h-5" /> },
      { view: 'PROFILE_SETTINGS', label: 'Business Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];
  
  const currentMenu = advertiserViews;

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
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-500/30 shadow-lg">
                  <BuildingIcon className="w-6 h-6" />
              </div>
              <div>
                  <span className="font-black text-xl text-slate-900 tracking-tight font-heading block leading-none">
                    TaskMint
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600">
                      Business Console
                  </span>
              </div>
        </div>
          
        <div className="py-4 overflow-y-auto flex-1 custom-scrollbar">
            <p className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Advertising</p>
            <nav className="space-y-1">
                {currentMenu.slice(0, 6).map((item, index) => (
                <NavItem
                    key={`${item.view}-${index}`}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeView === item.view}
                    onClick={() => handleItemClick(item.view)}
                    badgeCount={item.view === 'UPDATES_INBOX' ? unreadUpdatesCount : 0}
                />
                ))}
            </nav>

            <p className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2">Tools & Data</p>
            <nav className="space-y-1">
                {currentMenu.slice(6).map((item, index) => (
                <NavItem
                    key={`tools-${index}`}
                    icon={item.icon}
                    label={item.label}
                    isActive={false} // These are just for show currently in the dashboard view context
                    onClick={() => handleItemClick(item.view)}
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
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Switch View</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        Go to User App
                    </p>
                </div>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
