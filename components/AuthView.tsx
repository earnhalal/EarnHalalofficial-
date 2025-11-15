import React, { useState, useEffect } from 'react';
import { UserIcon, EmailIcon, PhoneIcon, LockIcon, InviteIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from './icons';

interface AuthViewProps {
    onSignup: (data: {username: string, email: string, phone: string, password: string, referrer?: string}) => void;
    onLogin: (email: string, password: string) => void;
    initialView: 'login' | 'signup';
}

const AuthInput: React.FC<{ icon: React.ReactNode, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, required?: boolean, readOnly?: boolean }> = 
({ icon, type, value, onChange, placeholder, required = true, readOnly = false }) => (
    <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300">
            {icon}
        </span>
        <input 
            type={type} 
            value={value} 
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full py-3 pl-12 pr-4 text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-0 transition-all duration-300 placeholder:text-gray-400 ${readOnly ? 'cursor-not-allowed bg-gray-200 text-gray-500' : ''}`} 
            required={required}
            autoComplete="new-password" // To prevent autofill issues
            readOnly={readOnly}
            disabled={readOnly}
        />
    </div>
);

const PasswordInput: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }> = ({ value, onChange, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300">
                <LockIcon className="w-5 h-5" />
            </span>
            <input 
                type={isVisible ? 'text' : 'password'} 
                value={value} 
                onChange={onChange}
                placeholder={placeholder}
                className="w-full py-3 pl-12 pr-12 text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-0 transition-all duration-300 placeholder:text-gray-400" 
                required
                autoComplete="new-password"
            />
            <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600">
                {isVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};


const AuthView: React.FC<AuthViewProps> = ({ onSignup, onLogin, initialView }) => {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [referrerUsername, setReferrerUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const referrerParam = params.get('referrer');
        if (referrerParam) {
            setIsLogin(false); // Switch to signup if referred
            setReferrerUsername(referrerParam);
        }
    }, []);

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
        // Do not clear fields, user might have just mistyped
    };
    
    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!username || !email || !phone || !password) {
            setError('All fields are required for signup.');
            return;
        }
        setError('');
        onSignup({ username, email, phone, password, referrer: referrerUsername });
    };
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setError('');
        onLogin(email, password);
    };

    const iconProps = { className: "w-5 h-5" };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
             <style>{`
                @keyframes gradient-animation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animated-gradient {
                    background-size: 200% 200%;
                    animation: gradient-animation 15s ease infinite;
                }
            `}</style>
            <div className="relative w-full max-w-4xl flex bg-white rounded-2xl shadow-subtle-lg overflow-hidden min-h-[600px]">
                {/* Left Decorative Panel */}
                <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-primary-600 to-accent-500 text-white p-12 animated-gradient">
                     <div className="my-auto animate-fade-in-up">
                        <h2 className="text-4xl font-heading font-extrabold">Join Our Community</h2>
                        <p className="mt-4 text-lg text-primary-200 opacity-90">
                            Start earning rewards in a trusted and ethical environment.
                        </p>
                        <ul className="mt-8 space-y-5 text-left">
                            <li className="flex items-start space-x-3">
                                <div className="bg-white/20 p-2 rounded-full mt-1"><CheckCircleIcon className="w-5 h-5 text-white" /></div>
                                <div>
                                    <h3 className="font-bold">Instant Rewards</h3>
                                    <p className="text-primary-200 text-sm">Get paid the moment you complete a task.</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="bg-white/20 p-2 rounded-full mt-1"><CheckCircleIcon className="w-5 h-5 text-white" /></div>
                                <div>
                                    <h3 className="font-bold">Secure Payouts</h3>
                                    <p className="text-primary-200 text-sm">Withdraw your earnings via local payment methods.</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="bg-white/20 p-2 rounded-full mt-1"><CheckCircleIcon className="w-5 h-5 text-white" /></div>
                                <div>
                                    <h3 className="font-bold">Ethical & Halal</h3>
                                    <p className="text-primary-200 text-sm">All tasks are vetted to align with Halal principles.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold font-heading text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
                            <p className="text-gray-500 mt-2">{isLogin ? 'Log in to continue your journey.' : 'Sign up to start earning today.'}</p>
                        </div>

                        <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-5">
                            {!isLogin && (
                                <AuthInput icon={<UserIcon {...iconProps} />} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
                            )}
                            <AuthInput icon={<EmailIcon {...iconProps} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
                            {!isLogin && (
                                <AuthInput icon={<PhoneIcon {...iconProps} />} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" />
                            )}
                            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                             {!isLogin && (
                                <AuthInput icon={<InviteIcon {...iconProps} />} type="text" value={referrerUsername} onChange={e => setReferrerUsername(e.target.value)} placeholder="Referrer Code (Optional)" required={false} readOnly={!!referrerUsername} />
                            )}

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            
                            <button type="submit" className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                {isLogin ? 'Log In' : 'Sign Up'}
                            </button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button onClick={toggleForm} className="font-semibold text-primary-600 hover:underline ml-1">
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthView;