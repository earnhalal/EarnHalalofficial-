
import React, { useState } from 'react';
import type { UserProfile, View } from '../types';
import { 
    LogoutIcon, FingerprintIcon, CheckCircleIcon, ChevronDownIcon, 
    WalletIcon, BriefcaseIcon, UserGroupIcon, DocumentTextIcon, 
    InfoIcon, ShieldCheck, ArrowRight
} from './icons';

interface ProfileSettingsViewProps {
    userProfile: UserProfile | null;
    onUpdateProfile: (updatedData: { name: string; email: string; password?: string }) => Promise<void>;
    onLogout: () => void;
    showChatbot: boolean;
    onToggleChatbot: (isVisible: boolean) => void;
    onSetFingerprintEnabled: () => Promise<void>;
    onNavigate: (view: View) => void;
}

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
    userProfile, onUpdateProfile, onLogout, showChatbot, onToggleChatbot, onSetFingerprintEnabled, onNavigate 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Local state for edit form
    const [name, setName] = useState(userProfile?.username || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
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

    return (
        <div className="max-w-2xl mx-auto pb-24 space-y-6 animate-fade-in">
            
            {/* Header Card */}
            <div className="bg-white p-6 rounded-3xl shadow-subtle border border-gray-100 flex items-center gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-100 p-1">
                        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.username}`} alt="Profile" className="w-full h-full rounded-full bg-gray-100" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{userProfile.username}</h2>
                    <p className="text-slate-500 text-sm mb-2">{userProfile.email}</p>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                        <CheckCircleIcon className="w-3 h-3" /> Verified Member
                    </div>
                </div>
            </div>

            {/* Section 1: Account & Wallet */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow 
                        icon={<BriefcaseIcon className="w-5 h-5" />} 
                        label="Edit Personal Details" 
                        onClick={() => setIsEditing(true)} 
                    />
                    <MenuRow 
                        icon={<WalletIcon className="w-5 h-5" />} 
                        label="Manage Wallet & PIN" 
                        onClick={() => onNavigate('WALLET')} 
                    />
                    <div className="p-4 flex items-center justify-between bg-white border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><FingerprintIcon className="w-5 h-5" /></div>
                            <span className="font-semibold text-sm text-slate-700">Biometric Login</span>
                        </div>
                        <button 
                            onClick={() => !userProfile.isFingerprintEnabled && onSetFingerprintEnabled()}
                            className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.isFingerprintEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${userProfile.isFingerprintEnabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 2: App Features */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Features</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow 
                        icon={<BriefcaseIcon className="w-5 h-5" />} 
                        label="Premium Jobs" 
                        onClick={() => onNavigate('JOBS')} 
                    />
                    <MenuRow 
                        icon={<UserGroupIcon className="w-5 h-5" />} 
                        label="Social Groups" 
                        onClick={() => onNavigate('SOCIAL_GROUPS')} 
                    />
                    <MenuRow 
                        icon={<DocumentTextIcon className="w-5 h-5" />} 
                        label="My Applications" 
                        onClick={() => onNavigate('MY_APPLICATIONS')} 
                    />
                    <div className="p-4 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></div>
                            <span className="font-semibold text-sm text-slate-700">AI Support Assistant</span>
                        </div>
                        <button 
                            onClick={() => onToggleChatbot(!showChatbot)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${showChatbot ? 'bg-amber-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showChatbot ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 3: Support & Legal */}
            <div className="space-y-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <MenuRow 
                        icon={<InfoIcon className="w-5 h-5" />} 
                        label="How It Works" 
                        onClick={() => onNavigate('HOW_IT_WORKS')} 
                    />
                    <MenuRow 
                        icon={<ShieldCheck className="w-5 h-5" />} 
                        label="Privacy Policy" 
                        onClick={() => onNavigate('PRIVACY_POLICY')} 
                    />
                    <MenuRow 
                        icon={<DocumentTextIcon className="w-5 h-5" />} 
                        label="Terms of Service" 
                        onClick={() => onNavigate('TERMS_CONDITIONS')} 
                    />
                    <MenuRow 
                        icon={<LogoutIcon className="w-5 h-5" />} 
                        label="Log Out" 
                        onClick={onLogout}
                        isDestructive
                        rightElement={<ArrowRight className="w-4 h-4 text-red-400" />}
                    />
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 pt-4">TaskMint v1.2.0 • Built for Hustlers</p>
        </div>
    );
};

export default ProfileSettingsView;
