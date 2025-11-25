
import React from 'react';
import {
  DashboardIcon, EarnIcon, WalletIcon, CreateTaskIcon, InviteIcon, SettingsIcon,
  ClipboardListIcon, GiftIcon, GameControllerIcon,
  PlusCircleIcon, BriefcaseIcon, DocumentCheckIcon, UserGroupIcon, MailIcon, SparklesIcon, ChartBarIcon
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
    className={`w-full flex items-center space-x-3 rounded-xl transition-all duration-200 group relative ${
      isSubItem ? 'py-2 pl-10 pr-4' : 'py-3 px-4'
    } ${
      isActive
        ? 'bg-amber-50 text-amber-700 font-bold shadow-sm'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {isActive && !isSubItem && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-amber-500 rounded-r-full"></div>}
    <div className={`${isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{icon}</div>
    <span className="text-sm flex-1 text-left">{label}</span>
    {badgeCount && badgeCount > 0 && (
        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{badgeCount}</span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, onClose, unreadUpdatesCount }) => {
  const mainViews: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { view: 'LEADERBOARD', label: 'Leaderboard', icon: <ChartBarIcon className="w-5 h-5" /> },
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
      className={`bg-white border-r border-gray-200 w-64 fixed top-0 left-0 h-full shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <SparklesIcon className="w-6 h-6" />
            </div>
          <span className="font-black text-xl text-slate-900 tracking-tighter font-heading">Task<span className="text-amber-600">Mint</span></span>
        </div>
        
        <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
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
        
        <div className="mt-auto pt-4 border-t border-gray-100">
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
