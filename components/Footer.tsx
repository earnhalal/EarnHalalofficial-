import React from 'react';
import type { View } from '../types';
import { HomeIcon, EarnIcon, WalletIcon, SettingsIcon } from './icons';

interface BottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
    
    const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'DASHBOARD', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
        { view: 'EARN', label: 'Tasks', icon: <EarnIcon className="w-6 h-6" /> },
        { view: 'WALLET', label: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
        { view: 'PROFILE_SETTINGS', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];
    
    // A simple way to determine active state for grouped views
    const isViewActive = (view: View) => {
        if (view === 'DASHBOARD') return activeView === 'DASHBOARD';
        if (view === 'EARN') return ['EARN', 'TASK_HISTORY', 'CREATE_TASK', 'PLAY_AND_EARN'].includes(activeView);
        if (view === 'WALLET') return ['WALLET', 'DEPOSIT'].includes(activeView);
        if (view === 'PROFILE_SETTINGS') return ['PROFILE_SETTINGS', 'INVITE'].includes(activeView);
        return false;
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30 md:hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={isViewActive(item.view)}
                        onClick={() => setActiveView(item.view)}
                    />
                ))}
            </div>
        </footer>
    );
};

export default BottomNav;