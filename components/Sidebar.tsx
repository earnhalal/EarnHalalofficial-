import React, { useState, useEffect } from 'react';
import {
  DashboardIcon, EarnIcon, WalletIcon, CreateTaskIcon, InviteIcon, SettingsIcon,
  InfoIcon, DocumentTextIcon, ClipboardListIcon, GiftIcon,
  PlusCircleIcon, BriefcaseIcon, DocumentCheckIcon, ChevronDownIcon
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
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
      isActive
        ? 'bg-amber-500/10 text-amber-300'
        : `text-slate-400 hover:text-amber-400 hover:bg-white/5 ${isSubItem ? 'py-2' : ''}`
    }`}
  >
    {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-amber-400 rounded-r-full"></div>}
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen }) => {
  const mainViews: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'EARN', label: 'Earn', icon: <EarnIcon className="w-6 h-6" /> },
    { view: 'SPIN_WHEEL', label: 'Spin & Win', icon: <GiftIcon className="w-6 h-6" /> },
    { view: 'WALLET', label: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
    { view: 'DEPOSIT', label: 'Deposit', icon: <PlusCircleIcon className="w-6 h-6" /> },
    { view: 'INVITE', label: 'Invite Friends', icon: <InviteIcon className="w-6 h-6" /> },
    { view: 'CREATE_TASK', label: 'Create Task', icon: <CreateTaskIcon className="w-6 h-6" /> },
    { view: 'TASK_HISTORY', label: 'Task History', icon: <ClipboardListIcon className="w-6 h-6" /> },
    { view: 'JOBS', label: 'Jobs', icon: <BriefcaseIcon className="w-6 h-6" /> },
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
      className={`bg-slate-900/60 backdrop-blur-xl border-r border-amber-400/10 text-white w-64 fixed top-0 left-0 h-full shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:w-64`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-10 px-2">
           <svg className="w-10 h-10" viewBox="0 0 24 24" fill="url(#logo-gradient-sidebar)">
            <defs>
               <linearGradient id="logo-gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: 'rgb(251 191 36)'}} />
                  <stop offset="100%" style={{stopColor: 'rgb(245 158 11)'}} />
                </linearGradient>
            </defs>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span className="text-2xl font-bold text-white">Earn Halal</span>
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
              className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group text-slate-400 hover:text-amber-400 hover:bg-white/5 ${isMoreMenuActive ? 'bg-white/5 text-amber-300' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <InfoIcon className="w-6 h-6" />
                <span className="font-semibold">More</span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isMoreMenuOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="pt-2 space-y-1 pl-4">
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