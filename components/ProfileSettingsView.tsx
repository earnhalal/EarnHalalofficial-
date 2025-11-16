import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { LogoutIcon, FingerprintIcon, CheckCircleIcon } from './icons';

interface ProfileSettingsViewProps {
    userProfile: UserProfile | null;
    onUpdateProfile: (updatedData: { name: string; email: string; password?: string }) => Promise<void>;
    onLogout: () => void;
    showChatbot: boolean;
    onToggleChatbot: (isVisible: boolean) => void;
    onSetFingerprintEnabled: () => Promise<void>;
}

const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ userProfile, onUpdateProfile, onLogout, showChatbot, onToggleChatbot, onSetFingerprintEnabled }) => {
    const [name, setName] = useState(userProfile?.username || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [isSettingFingerprint, setIsSettingFingerprint] = useState(false);

    if (!userProfile) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);
        try {
            const updatedData: { name: string; email: string; password?: string } = { name, email };
            if (password) {
                updatedData.password = password;
            }
            await onUpdateProfile(updatedData);
            setMessageType('success');
            setMessage('Profile updated successfully!');
            setPassword('');
        } catch (error: any) {
            setMessageType('error');
            setMessage(error.message || 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const handleSetupFingerprint = async () => {
        setIsSettingFingerprint(true);
        try {
            // Simulate scanning process
            await new Promise(resolve => setTimeout(resolve, 1500));
            await onSetFingerprintEnabled();
        } catch (error) {
            console.error("Failed to set up fingerprint:", error);
            // Optionally set an error message for the user
        } finally {
            setIsSettingFingerprint(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-subtle-md max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-3 border rounded-md bg-gray-100 border-gray-300 focus:ring-primary-500 focus:border-primary-500" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-3 border rounded-md bg-gray-100 border-gray-300 focus:ring-primary-500 focus:border-primary-500" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 block w-full p-3 border rounded-md bg-gray-100 border-gray-300 focus:ring-primary-500 focus:border-primary-500" disabled={isSubmitting} />
                </div>
                {message && <p className={`text-sm text-center ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                <button 
                    type="submit" 
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center disabled:bg-primary-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </button>
            </form>
            <div className="mt-8 border-t pt-6 border-gray-200 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 -mb-2">Security & Preferences</h3>
                 {userProfile.isFingerprintEnabled ? (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-3">
                            <FingerprintIcon className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-green-800">Fingerprint Login is Enabled</span>
                        </div>
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                ) : (
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <FingerprintIcon className="w-6 h-6 text-gray-500" />
                            <span className="font-medium text-gray-700">Enable Fingerprint Login</span>
                        </div>
                        <button
                            onClick={handleSetupFingerprint}
                            disabled={isSettingFingerprint}
                            className="font-semibold text-sm bg-primary-600 text-white py-1.5 px-4 rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center justify-center w-24"
                        >
                            {isSettingFingerprint ? (
                               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : 'Set Up'}
                        </button>
                    </div>
                )}

                 <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
                    <label htmlFor="chatbot-toggle" className="font-medium text-gray-700 cursor-pointer select-none">Show AI Support Chatbot</label>
                    <button
                        id="chatbot-toggle"
                        role="switch"
                        aria-checked={showChatbot}
                        onClick={() => onToggleChatbot(!showChatbot)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            showChatbot ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showChatbot ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full bg-red-100 text-red-700 font-semibold py-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                    <LogoutIcon className="w-5 h-5" />
                    Logout of Your Account
                </button>
            </div>
        </div>
    );
};

export default ProfileSettingsView;