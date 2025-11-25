
// components/PremiumView.tsx
import React from 'react';
import type { View } from '../types';
import { BriefcaseIcon, UserGroupIcon, CheckCircleIcon, ArrowRight, StarIcon, RocketIcon, MegaphoneIcon, ShoppingCartIcon, FireIcon, DiamondIcon } from './icons';

interface PremiumViewProps {
    setActiveView: (view: View) => void;
}

const PremiumCard: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
    colorClass: string;
    delay: number;
    badge?: string;
    badgeColor?: string;
}> = ({ title, subtitle, icon, onClick, colorClass, delay, badge, badgeColor }) => (
    <button 
        onClick={onClick}
        className="relative w-full bg-white rounded-3xl p-6 shadow-card hover:shadow-gold border border-gray-100 transition-all duration-300 hover:-translate-y-1 text-left group overflow-hidden animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 ${colorClass} -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
        
        <div className="relative z-10 flex items-start justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${colorClass} mb-4`}>
                {icon}
            </div>
            {badge && (
                <span className={`${badgeColor || 'bg-slate-900'} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1`}>
                    {badge === 'Hot' && <FireIcon className="w-3 h-3" />}
                    {badge}
                </span>
            )}
        </div>
        
        <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
        <p className="relative z-10 text-sm text-gray-500 font-medium mb-4 leading-relaxed">{subtitle}</p>
        
        <div className="relative z-10 flex items-center text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
            Access Now <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
    </button>
);

const PremiumView: React.FC<PremiumViewProps> = ({ setActiveView }) => {
    return (
        <div className="pb-24 px-2 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 mb-10 text-center relative overflow-hidden shadow-2xl animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
                
                <div className="relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4 border border-amber-500/30">
                        Exclusive Access
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight font-heading">
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Hub</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        Unlock high-ticket earning opportunities, professional tools, and VIP status.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <PremiumCard 
                    title="Premium Jobs"
                    subtitle="Apply for high-paying data entry, content writing, and admin jobs. Subscription required."
                    icon={<BriefcaseIcon className="w-7 h-7" />}
                    onClick={() => setActiveView('JOBS')}
                    colorClass="bg-gradient-to-br from-gray-800 to-black"
                    delay={100}
                    badge="Popular"
                    badgeColor="bg-amber-500"
                />

                <PremiumCard 
                    title="Social Groups"
                    subtitle="Join elite WhatsApp & Facebook earning pods. Network with top earners."
                    icon={<UserGroupIcon className="w-7 h-7" />}
                    onClick={() => setActiveView('SOCIAL_GROUPS')}
                    colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                    delay={200}
                />
                
                <PremiumCard 
                    title="Influencer Program"
                    subtitle="Get paid to promote brands on your social media. High CPM rates for creators."
                    icon={<MegaphoneIcon className="w-7 h-7" />}
                    onClick={() => alert("Influencer Program: Registration opening soon for Level 5+ users!")}
                    colorClass="bg-gradient-to-br from-purple-500 to-indigo-600"
                    delay={300}
                    badge="New"
                />

                 <PremiumCard 
                    title="Reseller Marketplace"
                    subtitle="Buy digital products at wholesale and resell them for 100% profit."
                    icon={<ShoppingCartIcon className="w-7 h-7" />}
                    onClick={() => alert("Reseller Marketplace: Coming in v1.4 update.")}
                    colorClass="bg-gradient-to-br from-orange-500 to-red-600"
                    delay={400}
                    badge="Coming Soon"
                />
                
                <PremiumCard 
                    title="Crypto Cloud Mining"
                    subtitle="Rent hash power and earn daily crypto rewards without hardware."
                    icon={<DiamondIcon className="w-7 h-7" />}
                    onClick={() => alert("Crypto Mining: Coming soon!")}
                    colorClass="bg-gradient-to-br from-blue-500 to-cyan-600"
                    delay={500}
                    badge="Hot"
                    badgeColor="bg-red-500"
                />
                
                <PremiumCard 
                    title="Affiliate Academy"
                    subtitle="Learn professional affiliate marketing strategies. Earn from global brands."
                    icon={<RocketIcon className="w-7 h-7" />}
                    onClick={() => alert("Academy: Coming soon!")}
                    colorClass="bg-gradient-to-br from-pink-500 to-rose-600"
                    delay={600}
                    badge="Future"
                />
            </div>

            {/* Bottom Banner */}
            <div className="mt-10 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up" style={{animationDelay: '700ms'}}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-amber-500 shrink-0">
                    <StarIcon className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Upgrade to TaskMint Pro</h3>
                    <p className="text-amber-800/80 text-sm">Get verified, remove ads, and access priority withdrawal processing.</p>
                </div>
                <button className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-colors">
                    Learn More
                </button>
            </div>
        </div>
    );
};

export default PremiumView;
