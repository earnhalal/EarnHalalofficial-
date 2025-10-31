


import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { LogoutIcon } from './icons';

interface ProfileSettingsViewProps {
    userProfile: UserProfile | null;
    onUpdateProfile: (updatedData: { name: string; email: string; password?: string }) => void;
    onLogout: () => void;
}

const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ userProfile, onUpdateProfile, onLogout }) => {
    const [name, setName] = useState(userProfile?.username || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    if (!userProfile) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: { name: string; email: string; password?: string } = { name, email };
        if (password) {
            updatedData.password = password;
        }
        onUpdateProfile(updatedData);
        setMessage('Profile updated successfully!');
        setPassword('');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Profile Settings</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 block w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700">
                    Save Changes
                </button>
            </form>
            <div className="mt-8 border-t pt-6 dark:border-gray-700">
                <button
                    onClick={onLogout}
                    className="w-full bg-red-500/10 text-red-400 font-semibold py-3 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                    <LogoutIcon className="w-5 h-5" />
                    Logout of Your Account
                </button>
            </div>
        </div>
    );
};

export default ProfileSettingsView;