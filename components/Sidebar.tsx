import React, { useState, useEffect } from 'react';
import {
  DashboardIcon, EarnIcon, WalletIcon, CreateTaskIcon, InviteIcon, SettingsIcon,
  InfoIcon, DocumentTextIcon, ClipboardListIcon, GiftIcon, GameControllerIcon,
  PlusCircleIcon, BriefcaseIcon, DocumentCheckIcon, ChevronDownIcon, UserGroupIcon, MailIcon, HomeIcon
} from './icons';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubItem?: boolean;
}> = ({ icon, label, isActive, onClick, isSubItem = false }) => (
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
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, onClose }) => {
  const mainViews: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
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
  
  const moreMenuViews: View[] = ['HOW_IT_WORKS', 'ABOUT_US', 'CONTACT_US', 'PRIVACY_POLICY', 'TERMS_CONDITIONS'];

  const moreMenuItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'HOW_IT_WORKS', label: 'How it Works', icon: <InfoIcon className="w-5 h-5" /> },
    { view: 'ABOUT_US', label: 'About Us', icon: <InfoIcon className="w-5 h-5" /> },
    { view: 'CONTACT_US', label: 'Contact Us', icon: <InfoIcon className="w-5 h-5" /> },
    { view: 'PRIVACY_POLICY', label: 'Privacy Policy', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { view: 'TERMS_CONDITIONS', label: 'Terms', icon: <DocumentTextIcon className="w-5 h-5" /> },
  ];

  const isMoreMenuActive = moreMenuViews.includes(activeView);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(isMoreMenuActive);
  
  const handleItemClick = (view: View) => {
      setActiveView(view);
      onClose();
  }

  useEffect(() => {
    if (isMoreMenuActive) {
      setIsMoreMenuOpen(true);
    }
  }, [activeView, isMoreMenuActive]);

  return (
    <aside
      className={`bg-white border-r border-gray-200 text-gray-800 w-64 fixed top-0 left-0 h-full shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                EH
            </div>
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