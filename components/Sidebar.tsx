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
    className={`w-full flex items-center space-x-4 px-4 rounded-lg transition-all duration-200 group relative ${
      isSubItem ? 'py-2' : 'py-3'
    } ${
      isActive
        ? 'bg-primary-100 text-primary-600'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
    }`}
  >
    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-primary-500 rounded-r-full"></div>}
    <div className={`${isActive ? 'text-primary-500' : ''}`}>{icon}</div>
    <span className="font-semibold text-base">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen }) => {
  const mainViews: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'UPDATES_INBOX', label: 'Inbox', icon: <MailIcon className="w-6 h-6" /> },
    { view: 'EARN', label: 'Earn', icon: <EarnIcon className="w-6 h-6" /> },
    { view: 'SPIN_WHEEL', label: 'Spin & Win', icon: <GiftIcon className="w-6 h-6" /> },
    // { view: 'PLAY_AND_EARN', label: 'Play & Earn', icon: <GameControllerIcon className="w-6 h-6" /> },
    { view: 'WALLET', label: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
    { view: 'DEPOSIT', label: 'Deposit', icon: <PlusCircleIcon className="w-6 h-6" /> },
    { view: 'INVITE', label: 'Invite Friends', icon: <InviteIcon className="w-6 h-6" /> },
    { view: 'CREATE_TASK', label: 'Create Task', icon: <CreateTaskIcon className="w-6 h-6" /> },
    { view: 'TASK_HISTORY', label: 'Task History', icon: <ClipboardListIcon className="w-6 h-6" /> },
    { view: 'JOBS', label: 'Jobs', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { view: 'SOCIAL_GROUPS', label: 'Social Groups', icon: <UserGroupIcon className="w-6 h-6" /> },
    { view: 'MY_APPLICATIONS', label: 'My Applications', icon: <DocumentCheckIcon className="w-6 h-6" /> },
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

  useEffect(() => {
    if (isMoreMenuActive) {
      setIsMoreMenuOpen(true);
    }
  }, [activeView, isMoreMenuActive]);

  return (
    <aside
      className={`bg-white border-r border-gray-200 text-gray-800 w-72 fixed top-0 left-0 h-full shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:w-72`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-10 px-2">
           <svg className="w-12 h-12 text-primary-500" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10b981'}} />
                  <stop offset="100%" style={{stopColor: '#059669'}} />
                </linearGradient>
              </defs>
              <g fill="url(#logo-gradient-light)">
                <path d="M40,20 Q50,10 60,20 L80,40 Q90,50 80,60 L60,80 Q50,90 40,80 L20,60 Q10,50 20,40 Z" transform="rotate(-15, 50, 50)"/>
                <path d="M30,35 L70,35 L70,65 L30,65 Z" opacity="0.7" transform="rotate(15, 50, 50)"/>
              </g>
            </svg>
          <span className="text-3xl font-heading font-semibold text-gray-900 tracking-wider">Earn Halal</span>
        </div>
        <nav className="flex-1 space-y-2">
          {mainViews.map(({ view, label, icon }) => (
            <NavItem
              key={view}
              icon={icon}
              label={label}
              isActive={activeView === view}
              onClick={() => setActiveView(view)}
            />
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <NavItem
            key="PROFILE_SETTINGS"
            icon={<SettingsIcon className="w-6 h-6" />}
            label="Settings"
            isActive={activeView === 'PROFILE_SETTINGS'}
            onClick={() => setActiveView('PROFILE_SETTINGS')}
          />
          <div>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:text-primary-600 hover:bg-gray-100 ${isMoreMenuActive ? 'bg-gray-100 text-primary-600' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <InfoIcon className="w-6 h-6" />
                <span className="font-semibold text-base">More</span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isMoreMenuOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="pt-2 space-y-1.5 pl-6">
                {moreMenuItems.map(({ view, label, icon }) => (
                     <NavItem
                        key={view}
                        icon={icon}
                        label={label}
                        isActive={activeView === view}
                        onClick={() => setActiveView(view)}
                        isSubItem={true}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;