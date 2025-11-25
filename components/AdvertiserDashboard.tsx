
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { BriefcaseIcon, MegaphoneIcon, ChartBarIcon, PlusCircleIcon, WalletIcon, TargetIcon, Globe, EyeIcon, UserGroupIcon, DocumentTextIcon } from './icons';

interface AdvertiserDashboardProps {
    balance: number;
    setActiveView: (view: View) => void;
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className={`p-4 rounded-xl ${color} text-white shadow-md`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const OptionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, description, icon, onClick }) => (
    <div onClick={onClick} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {icon}
        </div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
)

// Functional-looking Graph Component
const PerformanceGraph = () => {
    const [timeframe, setTimeframe] = useState('7D');
    const data = timeframe === '7D' ? [35, 55, 40, 60, 75, 50, 90] : [60, 40, 70, 50, 80, 65, 95];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900">Traffic Overview</h3>
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
                                className="w-full bg-blue-500 transition-all duration-500 group-hover:bg-blue-600" 
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = ({ balance, setActiveView }) => {
    const [liveAudience, setLiveAudience] = useState(842);

    useEffect(() => {
        // Randomly fluctuate live audience count
        const interval = setInterval(() => {
            setLiveAudience(prev => {
                const change = Math.floor(Math.random() * 15) - 7; // Random change between -7 and +7
                const newValue = prev + change;
                return newValue > 500 ? newValue : 500; // Keep it realistic minimum
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Console</h1>
                    <p className="text-slate-500 font-medium">Manage ads, budget, and audience.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => alert('Generating Report...')} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">Download Report</button>
                    <button onClick={() => setActiveView('DEPOSIT')} className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all">Add Funds</button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Available Budget" 
                    value={`${balance.toFixed(0)} Rs`} 
                    icon={<WalletIcon className="w-6 h-6" />} 
                    color="bg-blue-600" 
                />
                <StatCard 
                    label="Active Campaigns" 
                    value="3" 
                    icon={<MegaphoneIcon className="w-6 h-6" />} 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    label="Total Impressions" 
                    value="45.2k" 
                    icon={<EyeIcon className="w-6 h-6" />} 
                    color="bg-teal-500" 
                />
                <StatCard 
                    label="Conversions" 
                    value="1,204" 
                    icon={<TargetIcon className="w-6 h-6" />} 
                    color="bg-amber-500" 
                />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <PerformanceGraph />
                </div>

                {/* Quick Audience */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-blue-400"/> Live Audience
                    </h3>
                    <div className="space-y-5 flex-1">
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                            <span className="text-sm font-medium text-slate-300">Active Users</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="font-bold text-white text-lg">{liveAudience}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Mobile Traffic</span>
                                <span>85%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Top City</span>
                                <span>Karachi</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full w-[62%] bg-purple-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/50">
                        Create Segment
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
                        icon={<EyeIcon className="w-6 h-6" />} 
                        onClick={() => alert('Opening Pixel Generator...')}
                    />
                    <OptionCard 
                        title="Geofencing" 
                        description="Restrict ads to specific GPS coordinates." 
                        icon={<Globe className="w-6 h-6" />} 
                    />
                    <OptionCard 
                        title="Conversion Events" 
                        description="Define custom goals (Signups, Purchases)." 
                        icon={<TargetIcon className="w-6 h-6" />} 
                    />
                    <OptionCard 
                        title="Billing & Invoices" 
                        description="Download tax invoices and manage payment methods." 
                        icon={<DocumentTextIcon className="w-6 h-6" />} 
                    />
                </div>
            </div>

            {/* Quick Actions Floating Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-30 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-200">
                <button 
                    onClick={() => setActiveView('CREATE_TASK')}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <MegaphoneIcon className="w-5 h-5" />
                    Create Ad
                </button>
                <button 
                    onClick={() => setActiveView('POST_JOB')}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                >
                    <BriefcaseIcon className="w-5 h-5" />
                    Post Job
                </button>
            </div>
        </div>
    );
};

export default AdvertiserDashboard;
