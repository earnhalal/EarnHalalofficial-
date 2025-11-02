import React, { useState, useEffect } from 'react';
import { UserIcon, EmailIcon, PhoneIcon, LockIcon, InviteIcon } from './icons';

interface AuthViewProps {
    onSignup: (data: {username: string, email: string, phone: string, password: string}) => void;
    onLogin: (email: string, password: string) => void;
}

const AuthInput: React.FC<{ icon: React.ReactNode, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, required?: boolean }> = 
({ icon, type, value, onChange, placeholder, required = true }) => (
    <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-amber-400 transition-colors duration-300">
            {icon}
        </span>
        <input 
            type={type} 
            value={value} 
            onChange={onChange}
            placeholder={placeholder}
            className="w-full py-3 pl-12 pr-4 text-slate-200 bg-slate-800/50 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 placeholder:text-slate-500" 
            required={required}
            autoComplete="off"
        />
    </div>
);


const AuthView: React.FC<AuthViewProps> = ({ onSignup, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formKey, setFormKey] = useState(1);
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');

        if (viewParam === 'signup') {
            setIsLogin(false);
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
        onSignup({ username, email, phone, password });
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
        <div className="flex items-center justify-center min-h-screen bg-[#0a192f] text-white p-4 relative overflow-hidden">
             <div className="absolute inset-0 -z-10 opacity-50">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="particle" style={{
                        width: `${Math.random() * 5 + 2}px`,
                        height: `${Math.random() * 5 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 40 + 20}s`,
                        animationDelay: `${Math.random() * -60}s`,
                    }}></div>
                ))}
            </div>
            <style>{`
                @keyframes form-fade-in {
                    from { opacity: 0; transform: translateY(15px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .form-animate {
                    animation: form-fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                .auth-glow {
                    box-shadow: 0 0 60px rgba(251, 191, 36, 0.1), 0 0 30px rgba(251, 191, 36, 0.2);
                }
                 @keyframes particle-float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    25% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                    75% { opacity: 0.3; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                .particle {
                    position: absolute;
                    bottom: -200px;
                    background-color: #fbbF24; /* amber-400 */
                    border-radius: 50%;
                    filter: blur(2px);
                    animation: particle-float linear infinite;
                }
            `}</style>

            <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-fade-in-up auth-glow border border-amber-400/20">
                <div className="text-center mb-8">
                     <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="url(#logo-gradient-auth-amber)">
                        <defs>
                          <linearGradient id="logo-gradient-auth-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'rgb(251 191 36)'}} />
                            <stop offset="100%" style={{stopColor: 'rgb(245 158 11)'}} />
                          </linearGradient>
                        </defs>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-slate-300">
                        {isLogin ? 'Login to continue your journey.' : 'Join us to start earning.'}
                    </p>
                </div>

                <form key={formKey} onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-4 form-animate">
                    {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                    
                    {!isLogin && (
                        <>
                            <AuthInput icon={<UserIcon {...iconProps} />} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                            <AuthInput icon={<EmailIcon {...iconProps} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                            <AuthInput icon={<PhoneIcon {...iconProps} />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                        </>
                    )}
                    
                    {isLogin && (
                        <AuthInput icon={<EmailIcon {...iconProps} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                    )}
                    
                    <AuthInput icon={<LockIcon {...iconProps} />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold py-3 rounded-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all transform hover:scale-105 ease-out-circ">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={toggleForm} className="font-medium text-amber-400 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthView;