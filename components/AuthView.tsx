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
            className={`w-full py-3 pl-12 pr-4 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder:text-gray-400 ${readOnly ? 'cursor-not-allowed bg-gray-200 text-gray-500' : ''}`} 
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
                className="w-full py-3 pl-12 pr-12 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder:text-gray-400" 
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
    const [formKey, setFormKey] = useState(1);
    
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
        setUsername('');
        setEmail('');
        setPhone('');
        setPassword('');
        setFormKey(prev => prev + 1);
        // Clean URL when user manually toggles
        const newUrl = window.location.pathname; // Keep path, remove query params
        window.history.pushState({ path: newUrl }, '', newUrl);
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
        <div className="min-h-screen lg:flex font-sans">
             <style>{`
                @keyframes form-fade-in {
                    from { opacity: 0; transform: translateY(15px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .form-animate {
                    animation: form-fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
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
            {/* Left Decorative Panel */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-600 to-accent-500 text-white p-12 animated-gradient">
                 <div className="text-center animate-fade-in-up">
                    <svg className="w-20 h-20 mx-auto mb-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g fill="white">
                            <path d="M40,20 Q50,10 60,20 L80,40 Q90,50 80,60 L60,80 Q50,90 40,80 L20,60 Q10,50 20,40 Z" transform="rotate(-15, 50, 50)"/>
                            <path d="M30,35 L70,35 L70,65 L30,65 Z" opacity="0.7" transform="rotate(15, 50, 50)"/>
                        </g>
                    </svg>
                    <h1 className="text-4xl font-heading font-bold mb-4">Earn Halal</h1>
                    <p className="text-lg text-primary-100 mb-8">Your journey to ethical online earnings starts here.</p>
                    <div className="space-y-4 text-left max-w-sm mx-auto">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-accent-300 mt-1 shrink-0" />
                            <p className="text-primary-100">Complete simple tasks and get paid instantly.</p>
                        </div>
                         <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-accent-300 mt-1 shrink-0" />
                            <p className="text-primary-100">Withdraw your earnings through multiple local payment methods.</p>
                        </div>
                         <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-accent-300 mt-1 shrink-0" />
                            <p className="text-primary-100">A trusted and secure platform compliant with Halal principles.</p>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:w-1/2 w-full flex flex-col min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 lg:justify-center">
                {/* This will grow and push the footer down on mobile */}
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8 py-12">
                        <div className="bg-white rounded-2xl shadow-subtle-lg p-8 border border-gray-200">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                                </h2>
                                <p className="text-gray-600">
                                    {isLogin ? 'Login to continue your journey.' : 'Join us to start earning.'}
                                </p>
                            </div>

                            <form key={formKey} onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-4 form-animate">
                                {error && <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                                
                                {isLogin ? (
                                    <>
                                        <AuthInput icon={<EmailIcon {...iconProps} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                                        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                                    </>
                                ) : (
                                    <>
                                        <AuthInput icon={<UserIcon {...iconProps} />} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                                        <AuthInput icon={<EmailIcon {...iconProps} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                                        <AuthInput icon={<PhoneIcon {...iconProps} />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                                        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                                        <AuthInput 
                                            icon={<InviteIcon {...iconProps} />} 
                                            type="text" 
                                            value={referrerUsername} 
                                            onChange={()=>{}} 
                                            placeholder="Referred by" 
                                            readOnly={!!referrerUsername} 
                                            required={false}
                                        />
                                    </>
                                )}

                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 ease-out-circ shadow-md hover:shadow-lg">
                                        {isLogin ? 'Login' : 'Sign Up'}
                                    </button>
                                </div>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button onClick={toggleForm} className="font-medium text-primary-600 hover:underline ml-1">
                                    {isLogin ? 'Sign Up' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="lg:hidden flex-shrink-0 text-center text-gray-500 text-sm pb-8">
                    &copy; {new Date().getFullYear()} Earn Halal. All Rights Reserved.
                </div>
            </div>
        </div>
    );
};

export default AuthView;
