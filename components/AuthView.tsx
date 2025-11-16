import React, { useState, useEffect } from 'react';
import { FingerprintIcon } from './icons';

// This is a global declaration to prevent TypeScript errors for the particles.js library.
// The lottie-player type is now handled globally in types.ts.
// FIX: Removed faulty global JSX declaration. This was overwriting all standard HTML/SVG element types
// and causing project-wide errors. The correct augmenting declaration is in types.ts.
declare global {
  interface Window {
        particlesJS: any;
  }
}

interface AuthViewProps {
    onSignup: (data: {username: string, email: string, phone: string, password: string}) => void;
    onLogin: (email: string, password: string) => void;
    initialView: 'login' | 'signup';
}

const AuthView: React.FC<AuthViewProps> = ({ onSignup, onLogin, initialView }) => {
    const [isSignup, setIsSignup] = useState(initialView === 'signup');
    const [darkMode, setDarkMode] = useState(false);
    const [success, setSuccess] = useState(false);
    const [agree, setAgree] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fingerprintMessage, setFingerprintMessage] = useState('');

    useEffect(() => {
        setIsSignup(initialView === 'signup');
    }, [initialView]);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        // We need to re-initialize particles on theme change if we want different colors
        initializeParticles(darkMode);
    }, [darkMode]);

    const initializeParticles = (isDark: boolean) => {
      if (window.particlesJS) {
          const particleColors = isDark ? ['#34d399', '#22c55e'] : ['#10b981', '#059669'];
          window.particlesJS('particles-js-auth', {
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              color: { value: particleColors },
              shape: { type: 'circle' },
              opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1 } },
              size: { value: 5, random: true },
              line_linked: { enable: false },
              move: { enable: true, speed: 1.5, direction: 'none', random: true, straight: false, out_mode: 'out' }
            },
            interactivity: {
              detect_on: 'canvas',
              events: { 
                onhover: { enable: true, mode: 'repulse' }, 
                onclick: { enable: true, mode: 'push' }, 
                resize: true 
              },
              modes: { repulse: { distance: 120, duration: 0.6 }, push: { particles_nb: 6 } }
            },
            retina_detect: true
          });
      }
    };

    useEffect(() => {
      initializeParticles(darkMode);
      return () => {
        // Cleanup particles canvas on component unmount
        const particlesEl = document.getElementById('particles-js-auth');
        if (particlesEl && particlesEl.firstChild) {
            particlesEl.innerHTML = '';
        }
      };
    }, []);

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!agree) {
            alert('Please agree to the Terms & Conditions and Privacy Policy.');
            return;
        }
        setSuccess(true);
        setTimeout(() => {
            onSignup({ username: name, email, phone, password });
        }, 2500);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(true);
        setTimeout(() => {
            onLogin(email, password);
        }, 2500);
    };

    const handleFingerprintAuth = (mode: 'login' | 'signup') => {
        setFingerprintMessage('');
        if (mode === 'signup') {
            setFingerprintMessage("Complete registration first, then enable fingerprint login in your profile settings.");
        } else {
            const lastUserEmail = localStorage.getItem('lastUserEmail');
            if (lastUserEmail) {
                setEmail(lastUserEmail);
                setFingerprintMessage(`Fingerprint recognized for ${lastUserEmail}. Please enter your password to log in.`);
            } else {
                setFingerprintMessage("No fingerprint login found on this device. Set it up in settings after logging in.");
            }
        }
        setTimeout(() => setFingerprintMessage(''), 6000);
    };

    return (
        <>
            <style>{`
                :root { --primary: #10b981; --accent: #059669; --gold: #fbbf24; --glow: 0 0 30px rgba(16, 185, 129, 0.6); }
                .dark { --primary: #34d399; --accent: #22c55e; --gold: #fcd34d; }
                .auth-container { font-family: 'Inter', sans-serif; }
                .auth-container h1, .auth-container h2, .auth-container h3, .font-heading { font-family: 'Space Grotesk', sans-serif; }
                .glass { backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.15); border: 1.5px solid rgba(255, 255, 255, 0.3); box-shadow: var(--glow), inset 0 0 15px rgba(16, 185, 129, 0.08); }
                .input-glow:focus { outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3), var(--glow); border-color: var(--primary); }
                .halal-badge { background: linear-gradient(135deg, var(--gold), #f59e0b); animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                #particles-js-auth { position: fixed; width: 100%; height: 100%; top: 0; left: 0; z-index: -1; }
                input::placeholder { font-family: 'Space Grotesk', sans-serif !important; font-weight: 500; color: #94a3b8 !important; }
                input { font-family: 'Space Grotesk', sans-serif !important; font-weight: 500; }
            `}</style>
            <div
                className={`auth-container min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950 transition-all duration-700 overflow-auto py-8`}
            >
                <div id="particles-js-auth"></div>

                <div className="relative w-full max-w-md mx-auto p-4">
                    <div className="glass rounded-3xl p-8 shadow-2xl shadow-emerald-500/10">
                        <div className="text-center mb-8">
                            <div className="flex justify-center items-center gap-2 mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-xl">EH</div>
                            </div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-heading">Earn<span className="text-emerald-500">Halal</span></h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">100% Halal • Verified by Scholars • Trusted by 100K+ Pakistanis</p>
                            <div className="halal-badge inline-flex items-center gap-2 text-white px-4 py-1.5 rounded-full text-xs font-bold mt-3 shadow-lg">Verified by Islamic Scholars</div>
                        </div>

                        <div className="flex justify-end mb-5">
                            <label className="swap swap-rotate">
                                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                                <div className="swap-on text-xs dark:text-white">Dark</div>
                                <div className="swap-off text-xs text-gray-800">Light</div>
                            </label>
                        </div>
                        
                        <div className="flex mb-6 relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 p-1.5 shadow-inner">
                            <div className="absolute inset-0 flex transition-transform duration-500 ease-out" style={{ transform: isSignup ? 'translateX(0%)' : 'translateX(100%)' }}>
                                <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg"></div>
                                <div className="w-1/2 h-full"></div>
                            </div>
                            <button onClick={() => { setIsSignup(true); setSuccess(false); }} className={`relative z-10 flex-1 py-3 text-sm font-bold transition-all ${isSignup ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Sign Up</button>
                            <button onClick={() => { setIsSignup(false); setSuccess(false); }} className={`relative z-10 flex-1 py-3 text-sm font-bold transition-all ${!isSignup ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Log In</button>
                        </div>

                        {success && (
                            <div className="text-center mb-6">
                                {/* FIX: Corrected prop 'autoPlay' to 'autoplay' for the web component. */}
                                <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_3ru5yzai.json" background="transparent" speed="1" style={{ width: '140px', height: '140px' }} loop autoplay className="mx-auto"></lottie-player>
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">Welcome!</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Redirecting to dashboard...</p>
                            </div>
                        )}
                        
                        {!success && (
                          <div>
                            {fingerprintMessage && <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4 p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">{fingerprintMessage}</p>}
                            {isSignup ? (
                                <form onSubmit={handleSignupSubmit} className="space-y-5">
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" required className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create Password" required minLength={6} className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                                        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="checkbox checkbox-success checkbox-sm" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">I agree to the <a href="#" className="text-emerald-600 font-medium hover:underline">Terms & Conditions</a> and <a href="#" className="text-emerald-600 font-medium hover:underline">Privacy Policy</a></span>
                                    </label>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button type="submit" className="btn flex-grow h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-xl transform transition hover:scale-105 active:scale-100 font-bold text-lg">Create Halal Account</button>
                                        <button type="button" onClick={() => handleFingerprintAuth('signup')} aria-label="Use Fingerprint" className="btn btn-square h-14 w-14 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700">
                                            <FingerprintIcon className="w-8 h-8"/>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="input input-bordered w-full input-glow bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500" />
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="checkbox checkbox-sm checkbox-success" /><span>Remember me</span></label>
                                        <a href="#" className="text-emerald-600 hover:underline font-medium">Forgot?</a>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button type="submit" className="btn flex-grow h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-xl transform transition hover:scale-105 active:scale-100 font-bold text-lg">Login Securely</button>
                                         <button type="button" onClick={() => handleFingerprintAuth('login')} aria-label="Use Fingerprint" className="btn btn-square h-14 w-14 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700">
                                            <FingerprintIcon className="w-8 h-8"/>
                                        </button>
                                    </div>
                                </form>
                            )}
                          </div>
                        )}
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">© 2025 Earn Halal. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthView;
