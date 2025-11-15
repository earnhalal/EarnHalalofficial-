// components/LandingView.tsx
import React, { useState } from 'react';
import { 
    UserIcon, CheckCircleIcon, WalletIcon, MenuIcon, CloseIcon, 
    JazzCashIcon, EasyPaisaIcon, NayaPayIcon, SadaPayIcon,
    WhatsAppIcon, FacebookIcon, TwitterIcon, SparklesIcon,
    LockIcon, ClipboardListIcon
} from './icons';
import { InfoModal, renderModalContent } from './LandingInfoViews';

interface LandingViewProps {
  onGetStarted: (view: 'login' | 'signup') => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center backdrop-blur-sm shadow-lg hover:bg-white/10 transition-all transform hover:-translate-y-1">
        <div className="inline-block bg-primary-500/20 text-primary-300 p-4 rounded-full mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-2">{children}</p>
    </div>
);

const FooterLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
    <li>
        <button onClick={onClick} className="text-gray-400 hover:text-primary-300 transition-colors duration-200">{children}</button>
    </li>
);

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  const handleAuthClick = (view: 'login' | 'signup') => {
      onGetStarted(view);
      setIsMenuOpen(false);
  };
  
  const handleModalClick = (modalKey: string) => {
    setActiveInfoModal(modalKey);
    setIsMenuOpen(false);
  };

  const getModalTitle = (modalKey: string): string => {
      const titles: Record<string, string> = {
          'how-it-works': 'How It Works', 'about': 'About Us', 'support': 'Support & Contact',
          'privacy': 'Privacy Policy', 'terms': 'Terms & Conditions', 'withdrawal': 'Withdrawal Details',
          'deposit': 'Deposit Information', 'refund': 'Refund Policy', 'disclaimer': 'Disclaimer',
      };
      return titles[modalKey] || 'Information';
  }

  const Highlight: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="text-accent-400 font-semibold">{children}</span>;

  const partnerNames = ["TaskMedia", "AdGem", "ClickFlow", "Tap2Earn", "ViewPoint", "Rewardify"];

  return (
    <>
      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-scroll-x {
          animation: scroll-x 40s linear infinite;
        }
        @keyframes pulse-button {
          0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          70% {
              transform: scale(1.05);
              box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
          }
        }
        .animate-pulse-button {
            animation: pulse-button 2.5s infinite;
        }
      `}</style>
      <div className="relative min-h-screen w-full bg-gray-900 text-gray-200 font-sans isolate overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.1)_0%,_transparent_30%)]"></div>
        
        <header className="absolute top-0 z-40 w-full">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" className="text-2xl font-heading font-bold text-white transition-all hover:text-primary-300">Earn Halal</a>
                <div className="hidden md:flex items-center space-x-2">
                    <button onClick={() => handleAuthClick('login')} className="px-5 py-2 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transition-all">Login</button>
                    <button onClick={() => handleAuthClick('signup')} className="px-5 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all shadow-md shadow-primary-500/20">Sign Up</button>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-200 hover:text-primary-300 z-50">
                    {isMenuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </button>
            </nav>
        </header>
        
        {isMenuOpen && (
             <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-40 flex flex-col">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-700">
                    <span className="text-2xl font-heading font-bold text-white">Menu</span>
                     <button onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-primary-300 z-50">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>
                <div className="flex-grow p-6 flex flex-col justify-center items-center">
                     <div className="space-y-4 w-full max-w-xs">
                         <button onClick={() => handleAuthClick('signup')} className="w-full px-5 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all text-lg">Create Free Account</button>
                         <button onClick={() => handleAuthClick('login')} className="w-full px-5 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all text-lg">Login</button>
                    </div>
                </div>
            </div>
        )}

        <main className="relative z-10">
          <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight text-white animate-fade-in-up">
                        Earning Made Simple,
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 block md:inline"> The Halal Way</span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Join thousands of Pakistanis earning daily rewards by completing simple online tasks. <Highlight>Secure, transparent, and trusted.</Highlight>
                    </p>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={() => handleAuthClick('signup')}
                            className="mt-10 px-8 py-4 bg-primary-500 text-white font-bold rounded-full text-lg transition-all transform hover:scale-105 animate-pulse-button"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <section className="py-20 bg-gray-900/50">
              <div className="container mx-auto px-6">
                 <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose Earn Halal?</h2>
                    <p className="mt-4 text-lg text-gray-400">A platform built on trust, transparency, and ethical principles.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    <FeatureCard icon={<SparklesIcon className="w-8 h-8"/>} title="Instant Rewards">Your balance is updated the <Highlight>moment you complete a task</Highlight>.</FeatureCard>
                    <FeatureCard icon={<LockIcon className="w-8 h-8"/>} title="Secure Payouts">Withdraw safely using <Highlight>trusted local payment methods</Highlight>.</FeatureCard>
                    <FeatureCard icon={<CheckCircleIcon className="w-8 h-8"/>} title="Halal & Ethical">All tasks are vetted to ensure they <Highlight>align with ethical principles</Highlight>.</FeatureCard>
                    <FeatureCard icon={<ClipboardListIcon className="w-8 h-8"/>} title="Diverse Tasks">From social media to website visits, there's <Highlight>always a task for you</Highlight>.</FeatureCard>
                </div>
              </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
                    <p className="mt-4 text-lg text-gray-400">Start earning in just 3 simple steps. It's fast, easy, and secure.</p>
                </div>
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-gray-800 hidden md:block" />
                    <div className="space-y-12 md:space-y-0">
                         {[{icon:<UserIcon className="w-8 h-8"/>, title:"1. Sign Up for Free", desc:<>Create your account in under a minute. After a <Highlight>quick verification</Highlight>, you're ready to start earning.</>},
                         {icon:<CheckCircleIcon className="w-8 h-8"/>, title:"2. Complete Simple Tasks", desc:<>Browse tasks like watching videos or liking pages. Complete them and see your balance grow <Highlight>instantly</Highlight>.</>},
                         {icon:<WalletIcon className="w-8 h-8"/>, title:"3. Get Paid Quickly", desc:<>Withdraw your earnings directly to your <Highlight>local bank or mobile wallet</Highlight>. Fast, secure, and hassle-free.</>}].map((item, index) => (
                             <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${index === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="md:w-1/2 text-center md:text-left">
                                    <div className={`inline-block bg-primary-500/20 text-primary-300 p-4 rounded-full mb-4 ring-8 ring-gray-900`}>{item.icon}</div>
                                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                                    <p className="text-gray-400 mt-2">{item.desc}</p>
                                </div>
                                <div className="hidden md:block w-8 h-8 rounded-full bg-primary-500 ring-8 ring-gray-900 z-10"/>
                                <div className="md:w-1/2" />
                            </div>
                         ))}
                    </div>
                </div>
            </div>
          </section>

           <section className="py-20 bg-gray-900/50">
              <div className="container mx-auto px-6">
                 <h2 className="text-center text-3xl font-bold text-white mb-4">Our Trusted Partners</h2>
                 <p className="text-center text-lg text-gray-400 mb-12">We collaborate with leading platforms to bring you a variety of earning opportunities.</p>
                 <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
                    <div className="flex w-max animate-scroll-x">
                        {[...partnerNames, ...partnerNames].map((name, index) => (
                            <span key={index} className="text-2xl font-semibold text-gray-400 transition-colors hover:text-white font-heading mx-6 sm:mx-8 flex-shrink-0">{name}</span>
                        ))}
                    </div>
                     <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-900/50 to-transparent"></div>
                     <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-900/50 to-transparent"></div>
                 </div>
              </div>
          </section>

        </main>

        <footer className="bg-gray-900/70 border-t border-gray-800">
            <div className="container mx-auto px-6 py-12 text-center">
                 <h3 className="text-3xl font-heading font-bold text-white mb-4">Ready to Start Earning?</h3>
                 <p className="text-gray-400 max-w-md mx-auto mb-6">Join Earn Halal today and take the first step towards your online earning journey.</p>
                 <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-8 py-4 bg-primary-500 text-white font-bold rounded-full shadow-lg shadow-primary-500/20 text-lg transition-all transform hover:scale-105"
                 >
                    Create Your Free Account
                </button>
            </div>
            <div className="border-t border-gray-800 py-10">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                     <div>
                        <h4 className="font-bold text-white text-lg mb-4">Earn Halal</h4>
                        <p className="text-gray-400">A trusted platform for ethical online earnings in Pakistan.</p>
                         <div className="flex space-x-4 mt-4">
                            <a href="#" className="text-gray-400 hover:text-green-500"><WhatsAppIcon className="w-6 h-6"/></a>
                            <a href="#" className="text-gray-400 hover:text-blue-500"><FacebookIcon className="w-6 h-6"/></a>
                            <a href="#" className="text-gray-400 hover:text-sky-400"><TwitterIcon className="w-6 h-6"/></a>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-200 mb-4">Company</h5>
                        <ul className="space-y-2">
                            <FooterLink onClick={() => handleModalClick('about')}>About Us</FooterLink>
                            <FooterLink onClick={() => handleModalClick('support')}>Contact Support</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-200 mb-4">Legal</h5>
                        <ul className="space-y-2">
                            <FooterLink onClick={() => handleModalClick('terms')}>Terms & Conditions</FooterLink>
                            <FooterLink onClick={() => handleModalClick('privacy')}>Privacy Policy</FooterLink>
                            <FooterLink onClick={() => handleModalClick('refund')}>Refund Policy</FooterLink>
                             <FooterLink onClick={() => handleModalClick('disclaimer')}>Disclaimer</FooterLink>
                        </ul>
                    </div>
                     <div>
                        <h5 className="font-semibold text-gray-200 mb-4">Information</h5>
                        <ul className="space-y-2">
                            <FooterLink onClick={() => handleModalClick('how-it-works')}>How It Works</FooterLink>
                            <FooterLink onClick={() => handleModalClick('withdrawal')}>Withdrawal Info</FooterLink>
                            <FooterLink onClick={() => handleModalClick('deposit')}>Deposit Info</FooterLink>
                        </ul>
                    </div>
                </div>
                 <div className="container mx-auto px-6 pt-8 mt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Earn Halal. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
      </div>
      {activeInfoModal && (
          <InfoModal title={getModalTitle(activeInfoModal)} onClose={() => setActiveInfoModal(null)}>
              {renderModalContent(activeInfoModal)}
          </InfoModal>
      )}
    </>
  );
};

export default LandingView;