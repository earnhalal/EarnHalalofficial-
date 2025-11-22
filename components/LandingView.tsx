// components/LandingView.tsx
import React, { useState, useEffect } from 'react';
import { 
    MenuIcon, CloseIcon, WalletIcon, CheckCircleIcon, BankIcon, 
    FacebookIcon, InstagramIcon, YoutubeIcon, LockIcon,
    SparklesIcon, UserGroupIcon, TrophyIcon, Globe, ShieldCheck, ArrowRight
} from './icons';
import { InfoModal, renderModalContent } from './LandingInfoViews';

interface LandingViewProps {
  onGetStarted: (view: 'login' | 'signup') => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getModalTitle = (key: string) => {
      const titles: Record<string, string> = {
          'how-it-works': 'How It Works',
          'about': 'About TaskMint',
          'support': 'Support Center',
          'privacy': 'Privacy Policy',
          'terms': 'Terms of Service',
          'withdrawal': 'Withdrawal Policy',
          'deposit': 'Deposit Instructions',
          'refund': 'Refund Policy',
          'disclaimer': 'Disclaimer',
          'blog': 'TaskMint Blog'
      };
      return titles[key] || 'Information';
  };

  return (
    <>
      <style>{`
        .btn-gold {
            background: linear-gradient(to right, #F59E0B, #D97706);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
            transition: all 0.3s ease;
        }
        .btn-gold:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(245, 158, 11, 0.4);
            filter: brightness(1.1);
        }
        .btn-outline-gold {
            background: white;
            border: 2px solid #F59E0B;
            color: #D97706;
            transition: all 0.3s ease;
        }
        .btn-outline-gold:hover {
            background: #FFFBEB;
            transform: translateY(-2px);
        }
        .glass-nav {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>

      {activeModal && (
          <InfoModal 
            title={getModalTitle(activeModal)} 
            onClose={() => setActiveModal(null)}
          >
              {renderModalContent(activeModal)}
          </InfoModal>
      )}

      <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
        
        {/* --- Header --- */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-white/0 py-5'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight font-heading text-gray-900">TaskMint</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
              <button onClick={() => setActiveModal('how-it-works')} className="hover:text-amber-600 transition-colors">How it Works</button>
              <button onClick={() => setActiveModal('about')} className="hover:text-amber-600 transition-colors">About</button>
              <button onClick={() => setActiveModal('blog')} className="hover:text-amber-600 transition-colors">Blog</button>
              <button onClick={() => setActiveModal('support')} className="hover:text-amber-600 transition-colors">Support</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => onGetStarted('login')} className="text-gray-900 hover:text-amber-600 font-bold transition-colors">Log In</button>
              <button onClick={() => onGetStarted('signup')} className="btn-gold px-6 py-2.5 rounded-full font-bold text-sm">
                Start Earning
              </button>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-900">
                {mobileMenu ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
          </div>
        </header>

        {/* --- Mobile Menu --- */}
        <div className={`fixed inset-0 bg-white z-40 pt-24 px-6 transition-transform duration-300 ${mobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col space-y-6 text-lg font-bold text-gray-800">
                <button onClick={() => { setActiveModal('how-it-works'); setMobileMenu(false); }} className="text-left border-b border-gray-100 pb-4">How It Works</button>
                <button onClick={() => { setActiveModal('about'); setMobileMenu(false); }} className="text-left border-b border-gray-100 pb-4">About Us</button>
                <button onClick={() => { setActiveModal('blog'); setMobileMenu(false); }} className="text-left border-b border-gray-100 pb-4">Blog</button>
                <button onClick={() => { onGetStarted('login'); setMobileMenu(false); }} className="text-left border-b border-gray-100 pb-4 text-amber-600">Log In</button>
                <button onClick={() => { onGetStarted('signup'); setMobileMenu(false); }} className="btn-gold py-4 rounded-xl text-center mt-4 shadow-lg">Sign Up Free</button>
            </div>
        </div>

        <main>
            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-50 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-semibold mb-8 shadow-sm animate-fade-in-up">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        The #1 Earning App
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                        Turn Your Time Into <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 drop-shadow-sm">Real Money.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        TaskMint is the premium platform for smart earners. Complete simple digital tasks, get instant gold rewards, and withdraw directly to your wallet.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                        <button onClick={() => onGetStarted('signup')} className="btn-gold px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 group">
                            Start Earning Now 
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => setActiveModal('how-it-works')} className="btn-outline-gold px-8 py-4 rounded-full font-bold text-lg">
                            How it Works
                        </button>
                    </div>

                    <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-gray-500 font-medium animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                         <div className="flex items-center gap-2">
                             <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                             <span>Verified Tasks</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                             <span>Instant Payouts</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                             <span>Secure Platform</span>
                         </div>
                    </div>
                </div>
            </section>

            {/* --- Stats Section --- */}
            <section className="py-16 bg-[#F9FAFB] border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-extrabold text-gray-900 mb-1">1.5M+</p>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Tasks Completed</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-gray-900 mb-1">5M+</p>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Paid Out (Rs)</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-gray-900 mb-1">24h</p>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Avg. Withdrawal</p>
                        </div>
                        <div>
                            <p className="text-4xl font-extrabold text-gray-900 mb-1">4.9/5</p>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">User Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Features Grid --- */}
            <section className="py-24 px-6 bg-white relative">
                 <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-3">The TaskMint Advantage</h2>
                        <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900">Designed for <br/> Maximum Earnings.</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow group">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                <WalletIcon className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Fast Withdrawals</h4>
                            <p className="text-gray-500 leading-relaxed">
                                Access your funds quickly. We process payouts via JazzCash, EasyPaisa, and Bank Transfer within 24-48 hours.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow group">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Bank-Grade Security</h4>
                            <p className="text-gray-500 leading-relaxed">
                                Your data and earnings are protected with top-tier encryption. We prioritize user privacy above all else.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow group">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                <UserGroupIcon className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Referral Rewards</h4>
                            <p className="text-gray-500 leading-relaxed">
                                Invite friends and build a passive income stream. Earn a bonus for every task your referrals complete.
                            </p>
                        </div>
                        
                        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden text-white">
                             <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                             <div className="flex-1 relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                                        <SparklesIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-amber-400 font-bold uppercase tracking-wider text-sm">Daily Bonus</span>
                                </div>
                                <h4 className="text-3xl font-bold mb-3">Spin & Win Daily</h4>
                                <p className="text-gray-300 leading-relaxed mb-8">
                                    Log in every day to spin the wheel. Win free cash prizes, multipliers, and exclusive rewards just for being active.
                                </p>
                                <button onClick={() => onGetStarted('signup')} className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-amber-50 transition-colors">
                                    Try Your Luck
                                </button>
                             </div>
                             <div className="w-full md:w-1/3 flex justify-center">
                                <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex items-center justify-center bg-gray-800 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                    <SparklesIcon className="w-16 h-16 text-amber-400 animate-pulse" />
                                </div>
                             </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow group flex flex-col justify-center items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <TrophyIcon className="w-10 h-10 text-amber-600" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Leaderboards</h4>
                            <p className="text-gray-500 text-sm">Compete for weekly prizes.</p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* --- Payment Methods --- */}
            <section className="py-20 bg-[#F9FAFB] border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-widest mb-10 text-xs">Trusted Payment Partners</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
                         <div className="flex items-center gap-2 text-2xl font-bold text-gray-800"><span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">JC</span> JazzCash</div>
                         <div className="flex items-center gap-2 text-2xl font-bold text-gray-800"><span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">EP</span> EasyPaisa</div>
                         <div className="flex items-center gap-2 text-2xl font-bold text-gray-800"><BankIcon className="w-8 h-8 text-gray-700"/> Bank Transfer</div>
                         <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">NayaPay</div>
                         <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">SadaPay</div>
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-24 px-6 text-center bg-gray-50 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Ready to start minting?</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">Join the community today. No credit card required, just your phone and your ambition.</p>
                    <button onClick={() => onGetStarted('signup')} className="btn-gold px-12 py-5 rounded-full font-bold text-xl shadow-xl flex items-center justify-center gap-3 mx-auto">
                        Create Free Account <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>
        </main>

        {/* --- Footer --- */}
        <footer className="bg-[#111827] text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white">
                                <SparklesIcon className="w-5 h-5" />
                             </div>
                             <span className="font-bold text-xl text-white">TaskMint</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The smartest way to earn online in Pakistan. We connect businesses with real users for authentic engagement.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><button onClick={() => setActiveModal('about')} className="hover:text-amber-400 transition-colors">About Us</button></li>
                            <li><button onClick={() => setActiveModal('how-it-works')} className="hover:text-amber-400 transition-colors">How it Works</button></li>
                            <li><button onClick={() => onGetStarted('login')} className="hover:text-amber-400 transition-colors">Login / Sign Up</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><button onClick={() => setActiveModal('privacy')} className="hover:text-amber-400 transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => setActiveModal('terms')} className="hover:text-amber-400 transition-colors">Terms of Service</button></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2025 TaskMint. All rights reserved.</p>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
};

export default LandingView;