// components/LandingView.tsx
import React, { useState, useEffect } from 'react';
import { 
    MenuIcon, CloseIcon, WalletIcon, CheckCircleIcon, HomeIcon, BankIcon, 
    FacebookIcon, InstagramIcon, YoutubeIcon, LockIcon, MailIcon, PhoneIcon,
    DocumentTextIcon, DocumentArrowUpIcon, InfoIcon, SparklesIcon
} from './icons';
import { InfoModal, renderModalContent } from './LandingInfoViews';

interface LandingViewProps {
  onGetStarted: (view: 'login' | 'signup') => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 40 },
          color: { value: '#4EF2C3' }, // Mint Green
          shape: { type: 'circle' },
          opacity: { value: 0.3 },
          size: { value: 4 },
          move: { enable: true, speed: 1 }
        },
        interactivity: { events: { onhover: { enable: true, mode: 'repulse' } } }
      });
    }
  }, []);

  const getModalTitle = (key: string) => {
      const titles: Record<string, string> = {
          'how-it-works': 'How It Works',
          'about': 'About Us',
          'support': 'Contact Support',
          'privacy': 'Privacy Policy',
          'terms': 'Terms & Conditions',
          'withdrawal': 'Withdrawal Policy',
          'deposit': 'Deposit Info',
          'refund': 'Refund Policy',
          'disclaimer': 'Disclaimer'
      };
      return titles[key] || 'Information';
  };

  return (
    <>
      <style>{`
        #particles-js { position: fixed; width: 100%; height: 100%; top: 0; left: 0; z-index: -1; opacity: 0.3; }
        .glass { backdrop-filter: blur(12px); background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); }
        .cta-btn {
          background: linear-gradient(135deg, #4EF2C3, #2EECAE);
          color: #0F4C47;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(78, 242, 195, 0.4);
        }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(78, 242, 195, 0.6); }
        .stat-card { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .nav-link { transition: color 0.3s; }
        .nav-link:hover { color: #0F4C47; }
        .mobile-menu { transition: transform 0.3s ease; }
        .mobile-menu.open { transform: translateX(0); }
        .link-card { transition: all 0.3s ease; backdrop-filter: blur(10px); }
        .link-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(15, 76, 71, 0.2); }
        .social-float { animation: float 4s ease-in-out infinite; }
        .gradient-text { background: linear-gradient(135deg, #0F4C47, #24615E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {activeModal && (
          <InfoModal 
            title={getModalTitle(activeModal)} 
            onClose={() => setActiveModal(null)}
          >
              {renderModalContent(activeModal)}
          </InfoModal>
      )}

      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 text-gray-800 overflow-x-hidden">
        <div id="particles-js"></div>

        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">TM</div>
              <span className="font-bold text-lg text-secondary-800">TaskMint</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button onClick={() => setActiveModal('about')} className="nav-link text-gray-700">About</button>
              <button onClick={() => setActiveModal('how-it-works')} className="nav-link text-gray-700">How It Works</button>
              <a href="#payouts" className="nav-link text-gray-700">Payouts</a>
              <a href="#reviews" className="nav-link text-gray-700">Reviews</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => onGetStarted('login')} className="px-5 py-2 text-secondary-700 font-medium border border-secondary-700 rounded-full hover:bg-secondary-50 transition">Login</button>
              <button onClick={() => onGetStarted('signup')} className="px-5 py-2 bg-primary-500 text-secondary-900 font-bold rounded-full cta-btn border border-transparent">Sign Up Free</button>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
                {mobileMenu ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </header>
        
        {mobileMenu && (
             <div className="md:hidden fixed inset-0 bg-white z-40 pt-16 px-6" style={{ transform: mobileMenu ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out'}}>
              <nav className="space-y-6 text-lg font-medium">
                <button onClick={() => { setActiveModal('about'); setMobileMenu(false); }} className="block w-full text-left">About Us</button>
                <button onClick={() => { setActiveModal('how-it-works'); setMobileMenu(false); }} className="block w-full text-left">How It Works</button>
                <a href="#payouts" onClick={() => setMobileMenu(false)} className="block">Payouts</a>
                <a href="#reviews" onClick={() => setMobileMenu(false)} className="block">Reviews</a>
                <div className="pt-6 space-y-3">
                  <button onClick={() => { onGetStarted('login'); setMobileMenu(false); }} className="block w-full text-center py-3 border border-secondary-700 text-secondary-700 rounded-full">Login</button>
                  <button onClick={() => { onGetStarted('signup'); setMobileMenu(false); }} className="block w-full text-center py-3 bg-primary-500 text-secondary-900 font-bold rounded-full">Sign Up Free</button>
                </div>
              </nav>
            </div>
        )}

        <main>
            <section className="pt-24 pb-12 px-6 text-center">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight text-secondary-900">
                  Earn Smart.<br/>
                  <span className="text-primary-500">TaskMint.</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Join thousands of Pakistanis earning daily rewards by completing simple online tasks. Secure, transparent, and 100% verified.
                </p>
                <button onClick={() => onGetStarted('signup')} className="inline-block cta-btn text-secondary-900 font-bold py-4 px-8 rounded-full text-lg">
                  Get Started Now – Free!
                </button>
                <p className="text-sm text-gray-500 mt-3">No credit card required. Start in 1 minute.</p>
              </div>
            </section>

            <section className="px-6 py-10">
                <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
                    <div className="stat-card glass p-5 rounded-2xl"><p className="text-3xl font-bold text-secondary-700">$1.5M+</p><p className="text-sm text-gray-600">Total Paid</p></div>
                    <div className="stat-card glass p-5 rounded-2xl"><p className="text-3xl font-bold text-secondary-700">75K+</p><p className="text-sm text-gray-600">Active Users</p></div>
                    <div className="stat-card glass p-5 rounded-2xl"><p className="text-3xl font-bold text-secondary-700">4.9</p><p className="text-sm text-gray-600">Rating</p></div>
                </div>
            </section>

            <section id="features" className="px-6 py-12">
                <h2 className="text-3xl font-bold text-center mb-10 text-secondary-900">Why Choose TaskMint?</h2>
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
                    <div className="glass p-6 rounded-2xl text-center"><WalletIcon className="w-10 h-10 text-primary-500 mb-3 mx-auto" /><h3 className="font-bold mb-2">Instant Rewards</h3><p className="text-sm text-gray-600">Balance updates instantly after task.</p></div>
                    <div className="glass p-6 rounded-2xl text-center"><CheckCircleIcon className="w-10 h-10 text-primary-500 mb-3 mx-auto" /><h3 className="font-bold mb-2">Secure Payouts</h3><p className="text-sm text-gray-600">JazzCash, EasyPaisa, Bank.</p></div>
                    <div className="glass p-6 rounded-2xl text-center"><CheckCircleIcon className="w-10 h-10 text-primary-500 mb-3 mx-auto" /><h3 className="font-bold mb-2">Earn Smart</h3><p className="text-sm text-gray-600">Tasks verified for quality.</p></div>
                    <div className="glass p-6 rounded-2xl text-center"><HomeIcon className="w-10 h-10 text-primary-500 mb-3 mx-auto" /><h3 className="font-bold mb-2">Diverse Tasks</h3><p className="text-sm text-gray-600">Surveys, videos, referrals.</p></div>
                </div>
            </section>
            
            <section id="how" className="px-6 py-12 bg-secondary-50">
                <h2 className="text-3xl font-bold text-center mb-10 text-secondary-900">How It Works</h2>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-6"><div className="w-12 h-12 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">1</div><div><h3 className="font-bold text-lg">Sign Up Free</h3><p className="text-gray-600">Create account in 1 minute. No card needed.</p></div></div>
                    <div className="flex items-center gap-6"><div className="w-12 h-12 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">2</div><div><h3 className="font-bold text-lg">Complete Tasks</h3><p className="text-gray-600">Watch videos, answer surveys, grow balance.</p></div></div>
                    <div className="flex items-center gap-6"><div className="w-12 h-12 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">3</div><div><h3 className="font-bold text-lg">Get Paid</h3><p className="text-gray-600">Withdraw to JazzCash instantly.</p></div></div>
                </div>
            </section>

            <section id="payouts" className="px-6 py-12">
                <h2 className="text-3xl font-bold text-center mb-10 text-secondary-900">Trusted Payouts</h2>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    <div className="text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/5/55/JazzCash_Logo.png" alt="JazzCash" className="h-12 mx-auto mb-2" /><p className="text-sm font-medium">Instant via JazzCash</p></div>
                    <div className="text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/EasyPaisa_Logo.png" alt="EasyPaisa" className="h-12 mx-auto mb-2" /><p className="text-sm font-medium">EasyPaisa Supported</p></div>
                    <div className="text-center"><BankIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" /><p className="text-sm font-medium">Bank Transfer</p></div>
                </div>
            </section>
            
            <section id="reviews" className="px-6 py-12 bg-white">
              <h2 className="text-3xl font-bold text-center mb-10 text-secondary-900">User Reviews</h2>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="glass p-6 rounded-2xl bg-secondary-50 border border-secondary-100"><p className="italic mb-3 text-gray-700">"Best earning app in Pakistan! Withdrew Rs.5000 in 2 days."</p><p className="text-secondary-700 font-medium">— Ahmed, Lahore</p></div>
                <div className="glass p-6 rounded-2xl bg-secondary-50 border border-secondary-100"><p className="italic mb-3 text-gray-700">"Easy tasks and instant payouts. 100% trusted!"</p><p className="text-secondary-700 font-medium">— Fatima, Karachi</p></div>
              </div>
            </section>
            
            <section id="signup" className="px-6 py-16 text-center bg-secondary-900 text-white">
                <h2 className="text-4xl font-bold mb-4">Start Earning Today!</h2>
                <p className="text-lg mb-8 max-w-xl mx-auto text-secondary-200">Join 75,000+ users earning daily. No risk, no fees.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <button onClick={() => onGetStarted('login')} className="py-3 px-6 border-2 border-primary-500 text-primary-400 rounded-full font-medium hover:bg-primary-500 hover:text-secondary-900 transition">Login</button>
                    <button onClick={() => onGetStarted('signup')} className="py-3 px-6 bg-primary-500 text-secondary-900 rounded-full font-bold hover:bg-primary-400 transition">Sign Up Free</button>
                </div>
            </section>
        </main>
        
        <footer className="bg-gradient-to-t from-secondary-900 to-secondary-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E') repeat"}}></div>
            <div className="relative max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center md:text-left">
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-primary-400 border-b border-secondary-600 inline-block pb-2">Company</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li><button onClick={() => setActiveModal('about')} className="hover:text-primary-300 transition-colors">About Us</button></li>
                            <li><button onClick={() => setActiveModal('how-it-works')} className="hover:text-primary-300 transition-colors">How It Works</button></li>
                            <li><button onClick={() => setActiveModal('reviews')} className="hover:text-primary-300 transition-colors">Success Stories</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-primary-400 border-b border-secondary-600 inline-block pb-2">Support</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li><button onClick={() => setActiveModal('support')} className="hover:text-primary-300 transition-colors">Contact Us</button></li>
                            <li><button onClick={() => setActiveModal('withdrawal')} className="hover:text-primary-300 transition-colors">Withdrawal Policy</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-primary-400 border-b border-secondary-600 inline-block pb-2">Legal</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li><button onClick={() => setActiveModal('privacy')} className="hover:text-primary-300 transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => setActiveModal('terms')} className="hover:text-primary-300 transition-colors">Terms & Conditions</button></li>
                            <li><button onClick={() => setActiveModal('disclaimer')} className="hover:text-primary-300 transition-colors">Disclaimer</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-primary-400 border-b border-secondary-600 inline-block pb-2">Payments</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li><button onClick={() => setActiveModal('deposit')} className="hover:text-primary-300 transition-colors">Deposit Info</button></li>
                            <li><button onClick={() => setActiveModal('refund')} className="hover:text-primary-300 transition-colors">Refund Policy</button></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-70">
                    <p>© 2025 <span className="text-primary-400 font-bold">TaskMint</span>. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0">
                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-primary-500" /> Earn Smart</span>
                        <span className="flex items-center gap-1"><LockIcon className="w-4 h-4 text-primary-500" /> SSL Secured</span>
                        <span className="flex items-center gap-1"><InfoIcon className="w-4 h-4 text-primary-500" /> 24/7 Support</span>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
};

export default LandingView;