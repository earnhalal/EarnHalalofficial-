

import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { CheckCircleIcon } from './icons';

interface AuthViewProps {
    onSignup: (profileData: Omit<UserProfile, 'paymentStatus' | 'jobSubscription'> & { password: string }) => void;
    onLogin: (username: string, password: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSignup, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!username || !email || !phone || !password) {
            setError('All fields are required for signup.');
            return;
        }
        setError('');
        onSignup({ username, email, phone, password });
    };
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }
        setError('');
        onLogin(username, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 dark:from-primary-900/30 dark:to-accent-900/30 animate-background-pan"></div>

            <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        {isLogin ? 'Login to continue your journey.' : 'Join us to start earning.'}
                    </p>
                </div>

                <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-500/10 p-2 rounded-md">{error}</p>}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 transition" required />
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 transition" required />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 transition" required />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-accent-500 to-primary-500 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => {setIsLogin(!isLogin); setError('')}} className="font-medium text-primary-600 dark:text-primary-400 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthView;