
// components/AdvertiserDashboard.tsx
import React from 'react';
import type { View } from '../types';
import { 
    BriefcaseIcon, MegaphoneIcon, WalletIcon, TargetIcon, 
    Globe, EyeIcon, TrendingUpIcon, ActivityIcon, CodeIcon, MapIcon, ReceiptIcon
} from './icons';

interface AdvertiserDashboardProps {
    balance: number;
    setActiveView: (view: View) => void;
    stats: {
        impressions: number;
        clicks: number;
        spend: number;
    };
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300 group">
        <div className={`p-4 rounded-xl ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const OptionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, description, icon, onClick }) => (
    <div onClick={onClick} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group h-full flex flex-col">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {icon}
        </div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed flex-grow">{description}</p>
    </div>
)

// Functional-looking Graph Component
const PerformanceGraph = () => {
    const [timeframe, setTimeframe] = useState('7D');
    const data = timeframe === '7D' ? [35, 55, 40, 60, 75, 50, 90] : [60, 40, 70, 50, 80, 65, 95];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-blue-500" /> Traffic Overview
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['7D', '30D', '90D'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setTimeframe(t)} 
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${timeframe === t ? 'bg-white shadow-sm text-slate-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-48 w-full flex items-end gap-3">
                {data.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="relative w-full bg-blue-50 rounded-t-lg overflow-hidden h-full flex items-end">
                            <div 
                                className="w-full bg-blue-500 transition-all duration-500 group-hover:bg-blue-600 relative" 
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';

const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = ({ balance, setActiveView, stats }) => {
    const [liveAudience, setLiveAudience] = useState(842);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveAudience(prev => {
                const change = Math.floor(Math.random() * 15) - 7; 
                const newValue = prev + change;
                return newValue > 500 ? newValue : 500;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Console</h1>
                    <p className="text-slate-500 font-medium">Real-time campaign analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('MANAGE_CAMPAIGNS')} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100">Manage Ads</button>
                    <button onClick={() => setActiveView('DEPOSIT')} className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                        <WalletIcon className="w-4 h-4"/> Add Funds
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Budget Available" 
                    value={`${balance.toFixed(0)} Rs`} 
                    icon={<WalletIcon className="w-6 h-6" />} 
                    color="bg-blue-600" 
                />
                <StatCard 
                    label="Total Spend" 
                    value={`${stats.spend.toFixed(0)} Rs`} 
                    icon={<TargetIcon className="w-6 h-6" />} 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    label="Total Impressions" 
                    value={stats.impressions.toLocaleString()} 
                    icon={<EyeIcon className="w-6 h-6" />} 
                    color="bg-teal-500" 
                />
                <StatCard 
                    label="Total Clicks" 
                    value={stats.clicks.toLocaleString()} 
                    icon={<TrendingUpIcon className="w-6 h-6" />} 
                    color="bg-amber-500" 
                />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <PerformanceGraph />
                </div>

                {/* Live Audience Globe */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col overflow-hidden relative">
                    {/* Abstract Globe Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                        <Globe className="w-5 h-5 text-blue-400"/> Global Reach
                    </h3>
                    
                    <div className="space-y-5 flex-1 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <span className="text-sm font-medium text-slate-300">Active Users</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="font-bold text-white text-xl font-mono">{liveAudience}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Mobile Traffic</span>
                                <span>85%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                            </div>
                            
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Worldwide</span>
                                <span>Global</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-[100%] bg-purple-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setActiveView('GEOFENCING')} className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/50 relative z-10">
                        Target Specific Region
                    </button>
                </div>
            </div>

            {/* Functional Options Grid */}
            <div className="mb-10">
                <h3 className="font-bold text-lg text-slate-900 mb-6">Management Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <OptionCard 
                        title="Ad Pixel Setup" 
                        description="Generate tracking code for your external website." 
                        icon={<CodeIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('AD_PIXEL')}
                    />
                    <OptionCard 
                        title="Geofencing" 
                        description="Restrict ads to specific GPS coordinates." 
                        icon={<MapIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('GEOFENCING')}
                    />
                    <OptionCard 
                        title="Conversion Events" 
                        description="Define custom goals (Signups, Purchases)." 
                        icon={<TargetIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('CONVERSION_EVENTS')}
                    />
                    <OptionCard 
                        title="Billing & Invoices" 
                        description="Download tax invoices and manage payment methods." 
                        icon={<ReceiptIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('BILLING')}
                    />
                </div>
            </div>

            {/* Connect User Premium Features */}
            <div className="mb-10">
                <h3 className="font-bold text-lg text-slate-900 mb-6">Premium Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div onClick={() => setActiveView('MANAGE_CAMPAIGNS')} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 cursor-pointer group transition-all flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <MegaphoneIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Manage Campaigns</h4>
                                <p className="text-xs text-slate-500">Review performance of your active tasks.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-xl text-slate-900">3</span>
                            <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                        </div>
                    </div>

                    <div onClick={() => setActiveView('POST_JOB')} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 cursor-pointer group transition-all flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <BriefcaseIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Job Board</h4>
                                <p className="text-xs text-slate-500">Post high-ticket offers to qualified users.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-xl text-slate-900">Post</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase">New</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvertiserDashboard;
