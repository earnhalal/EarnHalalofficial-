
import React, { useState } from 'react';
import type { UserProfile, View } from '../types';
import { 
    LogoutIcon, FingerprintIcon, CheckCircleIcon, ChevronDownIcon, 
    WalletIcon, BriefcaseIcon, UserGroupIcon, DocumentTextIcon, 
    InfoIcon, ShieldCheck, ArrowRight, PencilSquareIcon, CrownIcon, StarIcon, DiamondIcon, MedalIcon, ChartBarIcon
} from './icons';

interface ProfileSettingsViewProps {
    userProfile: UserProfile | null;
    onUpdateProfile: (updatedData: { name: string; email: string; password?: string }) => Promise<void>;
    onUpdatePhoto: (file: File | null, avatarUrl?: string) => Promise<void>;
    onLogout: () => void;
    onSetFingerprintEnabled: () => Promise<void>;
    onNavigate: (view: View) => void;
}

// --- Professional Avatar System Configuration ---
const AVATAR_COLLECTIONS = {
    'Basic': {
        style: 'micah',
        seeds: ['Felix', 'Aneka', 'Hudson', 'Zoe', 'River', 'Aiden', 'Bella', 'Evan', 'Nora', 'Leo', 'Maya', 'Dylan'],
        description: 'Modern & Clean'
    },
    'Ranked': {
        style: 'avataaars',
        seeds: ['Christopher', 'Jack', 'Sophia', 'Ethan', 'Emma', 'William', 'Olivia', 'James', 'Ava', 'Alexander', 'Michael', 'Emily'],
        description: 'Pro Level Status'
    },
    'Premium': {
        style: 'notionists',
        seeds: ['Robert', 'Jade', 'Avery', 'Stark', 'Maria', 'Oliver', 'Sophie', 'Caleb', 'Eden', 'Liam', 'Noah', 'Grace'],
        description: 'Executive Suite'
    }
};

type CollectionKey = keyof typeof AVATAR_COLLECTIONS;

const MenuRow: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    isDestructive?: boolean; 
    rightElement?: React.ReactNode;
}> = ({ icon, label, onClick, isDestructive = false, rightElement }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-50 last:border-none active:bg-gray-50 transition-colors group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600'} transition-colors`}>
                {icon}
            </div>
            <span className={`font-semibold text-sm ${isDestructive ? 'text-red-600' : 'text-slate-700'}`}>{label}</span>
        </div>
        {rightElement || <ChevronDownIcon className="w-4 h-4 text-gray-300 -rotate-90" />}
    </button>
);

const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ 
    userProfile, onUpdateProfile, onUpdatePhoto, onLogout, onSetFingerprintEnabled, onNavigate 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    
    // Local state for edit form
    const [name, setName] = useState(userProfile?.username || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Avatar Selection State
    const [activeCollection, setActiveCollection] = useState<CollectionKey>('Basic');
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(userProfile?.photoURL || '');

    if (!userProfile) return null;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onUpdateProfile({ name, email, password: password || undefined });
            setIsEditing(false);
        } catch (error) {
            alert("Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarSelect = async (url: string) => {
        setSelectedAvatarUrl(url);
        await onUpdatePhoto(null, url);
        setTimeout(() => {
            setIsEditingPhoto(false);
        }, 300);
    };

    const getLevelColor = (lvl: number) => {
        if (lvl >= 10) return "bg-gradient-to-r from-amber-500 to-red-600"; 
        if (lvl >= 5) return "bg-gradient-to-r from-amber-300 to-amber-500"; 
        return "bg-gradient-to-r from-mint-500 to-emerald-600"; 
    };

    const renderAvatarItem = (seed: string, index: number) => {
        const style = AVATAR_COLLECTIONS[activeCollection].style;
        const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
        const isSelected = selectedAvatarUrl === url;

        let containerClass = "";
        let borderClass = "";
        let badge = null;

        if (activeCollection === 'Basic') {
            containerClass = "bg-white rounded-2xl shadow-sm";
            borderClass = isSelected ? "ring-4 ring-gray-200" : "hover:ring-2 hover:ring-gray-100";
        } else if (activeCollection === 'Ranked') {
            containerClass = "rounded-full bg-white shadow-sm";
            if (index < 3) { 
                borderClass = isSelected ? "ring-4 ring-orange-700" : "border-[3px] border-orange-700/20";
                badge = <div className="absolute -bottom-1 -right-1 bg-orange-700 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">III</div>;
            } else if (index < 6) { 
                borderClass = isSelected ? "ring-4 ring-slate-400" : "border-[3px] border-slate-400/30";
                badge = <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">II</div>;
            } else if (index < 9) { 
                borderClass = isSelected ? "ring-4 ring-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "border-[3px] border-yellow-500/40";
                badge = <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">I</div>;
            } else { 
                borderClass = isSelected ? "ring-4 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "border-[3px] border-cyan-500/40";
                badge = <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white p-1 rounded-full shadow-sm"><DiamondIcon className="w-3 h-3" /></div>;
            }
        } else if (activeCollection === 'Premium') {
            containerClass = "bg-slate-900 rounded-xl shadow-lg";
            borderClass = isSelected ? "ring-2 ring-amber-400 shadow-gold" : "border border-amber-500/20 hover:border-amber-500/50";
            badge = <div className="absolute -top-2 -left-2 text-amber-400 drop-shadow-md bg-slate-900 rounded-full p-0.5 border border-amber-500/30"><CrownIcon className="w-4 h-4" /></div>;
        }

        return (
            <button 
                key={seed} 
                onClick={() => handleAvatarSelect(url)} 
                className={`group relative aspect-square flex items-center justify-center transition-all duration-300 ${containerClass} ${borderClass}`}
            >
                <div className={`w-[85%] h-[85%] transition-transform duration-300 group-hover:scale-105 ${activeCollection === 'Premium' ? 'filter drop-shadow-md' : ''}`}>
                    <img src={url} alt={seed} className="w-full h-full object-contain" />
                </div>
                {badge}
                {isSelected && activeCollection !== 'Ranked' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm z-10 border-2 border-white">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                    </div>
                )}
            </button>
        );
    };

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm animate-fade-in">
                <h2 className="text-xl font-bold mb-6">Edit Profile Info</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Optional" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 font-bold text-white bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    if (isEditingPhoto) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-2xl animate-fade-in space-y-6 relative border border-gray-100 h-[85vh] flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select Avatar</h2>
                        <p className="text-xs text-gray-500 font-medium">{AVATAR_COLLECTIONS[activeCollection].description}</p>
                    </div>
                    <button onClick={() => setIsEditingPhoto(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">&times;</button>
                </div>
                <div className="flex p-1.5 bg-gray-100 rounded-xl flex-shrink-0">
                    {(Object.keys(AVATAR_COLLECTIONS) as CollectionKey[]).map(key => (
                        <button key={key} onClick={() => setActiveCollection(key)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeCollection === key ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{key}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 pb-4">
                        {AVATAR_COLLECTIONS[activeCollection].seeds.map((seed, index) => renderAvatarItem(seed, index))}
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400 pt-2 font-medium flex-shrink-0 border-t border-gray-50">Tap any avatar to update instantly</div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto pb-24 space-y-6 animate-fade-in">
            
            {/* Pro Header Card */}
            <div className="bg-white p-6 rounded-3xl shadow-subtle border border-gray-100 flex items-center gap-5 relative overflow-hidden">
                <div className="relative group cursor-pointer" onClick={() => setIsEditingPhoto(true)}>
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-amber-100 to-yellow-50 p-1 overflow-hidden relative">
                        <img 
                            src={userProfile.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${userProfile.username}`} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PencilSquareIcon className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                    {/* Level Badge on Profile */}
                    <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md border-2 border-white ${getLevelColor(userProfile.level || 1)}`}>
                        {userProfile.level || 1}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{userProfile.username}</h2>
                            <p className="text-slate-500 text-sm mb-2 font-medium">{userProfile.email}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
                            Edit Info
                        </button>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm mt-1">
                        <CrownIcon className="w-3.5 h-3.5 text-amber-400" /> 
                        <span>{userProfile.levelName || 'Member'}</span>
                    </div>
                </div>
            </div>

            {/* Section: Rank & Progression */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rank & Progression</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow 
                        icon={<StarIcon className="w-5 h-5" />} 
                        label="My Level & Benefits" 
                        onClick={() => onNavigate('LEVELS_INFO')} 
                    />
                    <MenuRow 
                        icon={<ChartBarIcon className="w-5 h-5" />} 
                        label="Top Earners Leaderboard" 
                        onClick={() => onNavigate('LEADERBOARD')} 
                    />
                </div>
            </div>

            {/* Section: Account */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow icon={<BriefcaseIcon className="w-5 h-5" />} label="Change Avatar" onClick={() => setIsEditingPhoto(true)} />
                    <MenuRow icon={<WalletIcon className="w-5 h-5" />} label="Manage Wallet & PIN" onClick={() => onNavigate('WALLET')} />
                    <div className="p-4 flex items-center justify-between bg-white border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><FingerprintIcon className="w-5 h-5" /></div>
                            <span className="font-semibold text-sm text-slate-700">Biometric Login</span>
                        </div>
                        <button onClick={() => !userProfile.isFingerprintEnabled && onSetFingerprintEnabled()} className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.isFingerprintEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${userProfile.isFingerprintEnabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section: Features */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Features</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow icon={<BriefcaseIcon className="w-5 h-5" />} label="Premium Jobs" onClick={() => onNavigate('JOBS')} />
                    <MenuRow icon={<UserGroupIcon className="w-5 h-5" />} label="Social Groups" onClick={() => onNavigate('SOCIAL_GROUPS')} />
                    <MenuRow icon={<DocumentTextIcon className="w-5 h-5" />} label="My Applications" onClick={() => onNavigate('MY_APPLICATIONS')} />
                </div>
            </div>

            {/* Section: Support & Legal */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow icon={<InfoIcon className="w-5 h-5" />} label="How It Works" onClick={() => onNavigate('HOW_IT_WORKS')} />
                    <MenuRow icon={<ShieldCheck className="w-5 h-5" />} label="Privacy Policy" onClick={() => onNavigate('PRIVACY_POLICY')} />
                    <MenuRow icon={<DocumentTextIcon className="w-5 h-5" />} label="Terms of Service" onClick={() => onNavigate('TERMS_CONDITIONS')} />
                    <MenuRow icon={<LogoutIcon className="w-5 h-5" />} label="Log Out" onClick={onLogout} isDestructive rightElement={<ArrowRight className="w-4 h-4 text-red-400" />} />
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 pt-4">TaskMint v1.4.0 • Built for Hustlers</p>
        </div>
    );
};

export default ProfileSettingsView;
