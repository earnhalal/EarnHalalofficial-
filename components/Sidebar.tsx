import React, { useState, useEffect } from 'react';
import {
  DashboardIcon, EarnIcon, WalletIcon, CreateTaskIcon, InviteIcon, SettingsIcon,
  InfoIcon, DocumentTextIcon, ClipboardListIcon, GiftIcon, GameControllerIcon,
  PlusCircleIcon, BriefcaseIcon, DocumentCheckIcon, ChevronDownIcon, UserGroupIcon, MailIcon
} from './icons';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  onClose: () => void;
  unreadUpdatesCount: number;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubItem?: boolean;
  badgeCount?: number;
}> = ({ icon, label, isActive, onClick, isSubItem = false, badgeCount }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 rounded-md transition-all duration-200 group relative ${
      isSubItem ? 'py-2 pl-10 pr-4' : 'py-2.5 px-4'
    } ${
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
    }`}
  >
    {isActive && !isSubItem && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-emerald-500 rounded-r-full"></div>}
    <div className={`${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`}>{icon}</div>
    <span className="font-semibold text-sm flex-1 text-left">{label}</span>
    {badgeCount && badgeCount > 0 && (
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badgeCount}</span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, onClose, unreadUpdatesCount }) => {
  const mainViews: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { view: 'EARN', label: 'Earn', icon: <EarnIcon className="w-5 h-5" /> },
    { view: 'SPIN_WHEEL', label: 'Spin & Win', icon: <GiftIcon className="w-5 h-5" /> },
    { view: 'PLAY_AND_EARN', label: 'Play & Earn', icon: <GameControllerIcon className="w-5 h-5" /> },
    { view: 'WALLET', label: 'Wallet', icon: <WalletIcon className="w-5 h-5" /> },
    { view: 'DEPOSIT', label: 'Deposit', icon: <PlusCircleIcon className="w-5 h-5" /> },
    { view: 'INVITE', label: 'Invite Friends', icon: <InviteIcon className="w-5 h-5" /> },
    { view: 'CREATE_TASK', label: 'Create Task', icon: <CreateTaskIcon className="w-5 h-5" /> },
    { view: 'TASK_HISTORY', label: 'Task History', icon: <ClipboardListIcon className="w-5 h-5" /> },
    { view: 'JOBS', label: 'Jobs', icon: <BriefcaseIcon className="w-5 h-5" /> },
    { view: 'SOCIAL_GROUPS', label: 'Social Groups', icon: <UserGroupIcon className="w-5 h-5" /> },
    { view: 'MY_APPLICATIONS', label: 'My Applications', icon: <DocumentCheckIcon className="w-5 h-5" /> },
    { view: 'UPDATES_INBOX', label: 'Inbox', icon: <MailIcon className="w-5 h-5" /> },
  ];
  
  const handleItemClick = (view: View) => {
      setActiveView(view);
      onClose();
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 text-gray-800 w-64 fixed top-0 left-0 h-full shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#paint0_linear_sidebar)"/>
                <path d="M12 10H20C22.2091 10 24 11.7909 24 14V16C24 18.2091 22.2091 20 20 20H12V10Z" fill="white" fillOpacity="0.5"/>
                <path d="M12 22H28V30H12V22Z" fill="white"/>
                <defs>
                    <linearGradient id="paint0_linear_sidebar" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10b981"/>
                        <stop offset="1" stopColor="#059669"/>
                    </linearGradient>
                </defs>
            </svg>
          <span className="text-xl font-bold text-gray-800">Earn Halal</span>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2">
          {mainViews.map(({ view, label, icon }) => (
            <NavItem
              key={view}
              icon={icon}
              label={label}
              isActive={activeView === view}
              onClick={() => handleItemClick(view)}
              badgeCount={view === 'UPDATES_INBOX' ? unreadUpdatesCount : 0}
            />
          ))}
        </nav>
        <div className="mt-auto pt-2 border-t border-gray-200 space-y-1.5">
          <NavItem
            key="PROFILE_SETTINGS"
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Settings"
            isActive={activeView === 'PROFILE_SETTINGS'}
            onClick={() => handleItemClick('PROFILE_SETTINGS')}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;