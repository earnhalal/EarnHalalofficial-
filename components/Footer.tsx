
// components/Footer.tsx
import React from 'react';
import type { View, UserMode } from '../types';
import { HomeIcon, ClipboardListIcon, BriefcaseIcon, UserIcon, WalletIcon, PlusCircleIcon, MenuIcon, PlayCircleIcon } from './icons';

interface BottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
    userMode?: UserMode;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isBusiness?: boolean;
}> = ({ icon, label, isActive, onClick, isBusiness }) => (
    <button 
        onClick={onClick} 
        className={`relative flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 active:scale-95 group`}
    >
        {isActive && (
            <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full shadow-sm ${isBusiness ? 'bg-blue-600 shadow-blue-500/50' : 'bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_2px_8px_rgba(212,175,55,0.5)]'}`}></div>
        )}
        <div className={`transition-transform duration-300 ${isActive ? (isBusiness ? '-translate-y-1 text-blue-600' : '-translate-y-1 text-primary-600') : 'text-gray-400 group-hover:text-gray-600'}`}>
            {icon}
        </div>
        <span className={`text-[9px] font-bold tracking-wide uppercase transition-colors duration-300 ${isActive ? (isBusiness ? 'text-blue-700' : 'text-primary-700') : 'text-gray-400'}`}>
            {label}
        </span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, userMode = 'EARNER' }) => {
    
    const isAdvertiser = userMode === 'ADVERTISER';

    const navItems: { view: string; label: string; icon: React.ReactNode }[] = isAdvertiser ? [
        { view: 'ADVERTISER_DASHBOARD', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
        { view: 'MANAGE_CAMPAIGNS', label: 'Campaigns', icon: <ClipboardListIcon className="w-6 h-6" /> },
        { view: 'POST_JOB', label: 'Post Job', icon: <PlusCircleIcon className="w-6 h-6" /> },
        { view: 'WALLET', label: 'Funds', icon: <WalletIcon className="w-6 h-6" /> },
        { view: 'PROFILE_SETTINGS', label: 'Menu', icon: <MenuIcon className="w-6 h-6" /> },
    ] : [
        { view: 'DASHBOARD', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
        { view: 'WATCH_AND_EARN', label: 'Watch', icon: <PlayCircleIcon className="w-6 h-6" /> },
        { view: 'EARN', label: 'Task Wall', icon: <ClipboardListIcon className="w-6 h-6" /> },
        { view: 'PREMIUM_HUB', label: 'Premium', icon: <BriefcaseIcon className="w-6 h-6" /> },
        { view: 'PROFILE_SETTINGS', label: 'Profile', icon: <UserIcon className="w-6 h-6" /> },
    ];
    
    const isViewActive = (navView: string) => {
        if (navView === 'DASHBOARD') return activeView === 'DASHBOARD';
        if (navView === 'ADVERTISER_DASHBOARD') return activeView === 'ADVERTISER_DASHBOARD';
        
        if (navView === 'EARN') return ['EARN', 'TASK_HISTORY', 'CREATE_TASK', 'PLAY_AND_EARN', 'SPIN_WHEEL'].includes(activeView);
        if (navView === 'WATCH_AND_EARN') return activeView === 'WATCH_AND_EARN';
        if (navView === 'PREMIUM_HUB') return ['PREMIUM_HUB', 'JOBS', 'SOCIAL_GROUPS', 'MY_APPLICATIONS'].includes(activeView);
        if (navView === 'INVITE') return activeView === 'INVITE';
        if (navView === 'PROFILE_SETTINGS') return ['PROFILE_SETTINGS', 'PRIVACY_POLICY', 'TERMS_CONDITIONS', 'ABOUT_US', 'CONTACT_US', 'HOW_IT_WORKS', 'ADS_GUIDE', 'ADS_POLICY', 'AD_PIXEL', 'GEOFENCING', 'CONVERSION_EVENTS', 'BILLING'].includes(activeView);
        
        // Advertiser Logic
        if (navView === 'MANAGE_CAMPAIGNS') return ['MANAGE_CAMPAIGNS', 'CREATE_TASK'].includes(activeView);
        if (navView === 'POST_JOB') return activeView === 'POST_JOB';
        if (navView === 'WALLET') return ['WALLET', 'DEPOSIT'].includes(activeView);

        return false;
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 pb-safe h-[80px]">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4 pb-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={isViewActive(item.view)}
                        onClick={() => setActiveView(item.view as View)}
                        isBusiness={isAdvertiser}
                    />
                ))}
            </div>
        </footer>
    );
};

export default BottomNav;
