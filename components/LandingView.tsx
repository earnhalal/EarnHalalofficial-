// components/LandingView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    EarnIcon, InviteIcon, CheckCircleIcon, WalletIcon, 
    MenuIcon, CloseIcon, LockIcon, CreateTaskIcon,
    JazzCashIcon, EasyPaisaIcon, NayaPayIcon, SadaPayIcon
} from './icons';
import { InfoModal, renderModalContent } from './LandingInfoViews';

interface LandingViewProps {
  onGetStarted: (view: 'login' | 'signup') => void;
}

// --- HOOKS ---
const useOnScreen = (ref: React.RefObject<HTMLElement>, rootMargin = '0px') => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { rootMargin, threshold: 0.1 });
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [ref, rootMargin]);
    return isVisible;
};

const useAnimatedCounter = (targetValue: number, isVisible: boolean, duration: number = 2500) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            setCount(Math.floor(targetValue * easeOutProgress));
            if (progress < 1) frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [targetValue, isVisible, duration]);
    return count;
};


// --- SUB-COMPONENTS ---
const PartnerLogo: React.FC<{ name: string; icon: React.ReactNode; }> = ({ name, icon }) => (
    <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        {icon}
        <span className="text-xl font-semibold text-gray-300">{name}</span>
    </div>
);

const AnimatedStatCard: React.FC<{ title: string; value: number; prefix?: string; suffix?: string; }> = ({ title, value, prefix = '', suffix = '' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-100px');
    const count = useAnimatedCounter(value, isVisible);
    return (
      <div ref={ref} className={`p-6 text-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-5xl lg:text-6xl font-numeric font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
          {prefix}{count.toLocaleString()}{suffix}
        </p>
        <p className="text-gray-400 mt-2 text-lg">{title}</p>
      </div>
    );
};

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ number, title, children, icon }) => (
    <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-primary-500/10 shadow-lg">
        <div className="absolute -top-6 -left-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-xl shadow-lg text-3xl font-bold">
            {number}
        </div>
        <div className="mb-4 text-primary-400">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);


const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-transparent text-primary-400 rounded-lg border border-primary-500/20">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{children}</p>
        </div>
    </div>
);

const FooterLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
    <li>
        <button onClick={onClick} className="hover:text-primary-400 transition-colors duration-200">{children}</button>
    </li>
);


const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  
  const navLinks = [
    { name: 'How It Works', modal: 'how-it-works' },
    { name: 'Withdrawals', modal: 'withdrawal' },
    { name: 'Support', modal: 'support' },
  ];

  const handleMenuLinkClick = (modalKey: string) => {
    setActiveInfoModal(modalKey);
    setIsMenuOpen(false);
  };
  
  const handleAuthClick = (view: 'login' | 'signup') => {
      onGetStarted(view);
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

  return (
    <>
      <style>{`
        body { background-color: #111827; } /* gray-900 */
        .clip-art { clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%); }
      `}</style>
      
      <div className="relative min-h-screen w-full bg-gray-900 text-gray-200 font-sans isolate overflow-x-hidden">
        
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" className="text-2xl font-heading font-bold text-primary-400 transition-all hover:text-primary-300">Earn Halal</a>
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                        <button key={link.name} onClick={() => link.modal && setActiveInfoModal(link.modal)} className="text-gray-300 hover:text-primary-400 transition-colors font-medium">{link.name}</button>
                    ))}
                    <button onClick={() => handleAuthClick('login')} className="px-5 py-2 bg-gray-800 border border-gray-600 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all">Login</button>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-primary-400 z-50">
                    {isMenuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </button>
            </nav>
        </header>
        
        {isMenuOpen && (
            <div className={`fixed top-0 left-0 w-full h-full bg-gray-900 z-30 flex flex-col`}>
                 <div className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-700">
                    <span className="text-2xl font-heading font-bold text-primary-400">Menu</span>
                </div>
                <div className="flex-grow overflow-y-auto p-6 flex flex-col justify-between">
                    <div className="space-y-2">
                         {navLinks.map(link => (
                            <button key={link.name} onClick={() => handleMenuLinkClick(link.modal)} className="w-full text-left p-4 text-lg text-gray-300 hover:bg-gray-800 rounded-lg">{link.name}</button>
                         ))}
                    </div>
                    <div className="space-y-3">
                         <button onClick={() => handleAuthClick('signup')} className="w-full px-5 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all text-lg">Create Free Account</button>
                         <button onClick={() => handleAuthClick('login')} className="w-full px-5 py-3 bg-gray-800 border border-gray-600 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition-all text-lg">Login</button>
                    </div>
                </div>
            </div>
        )}

        <main className="relative z-10">
          <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
             <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
                <div className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-500 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-art"></div>
            </div>
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block bg-accent-500/10 text-accent-300 font-semibold px-4 py-2 rounded-full mb-5 text-sm border border-accent-500/20">
                        Sign up now & get a <span className="font-bold text-accent-200">25 Rs</span> FREE BONUS!
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight text-white animate-fade-in-up">
                        Unlock Your Earning Potential,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                            The Halal Way
                        </span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Join thousands of Pakistanis earning daily rewards by completing simple online tasks. Secure, transparent, and trusted.
                    </p>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={() => handleAuthClick('signup')}
                            className="mt-10 px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 mx-auto"
                        >
                            <span>Create Your Free Account</span>
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <section className="py-16">
              <div className="container mx-auto px-6">
                 <h2 className="text-center text-lg font-semibold text-gray-500 mb-8">Trusted & Integrated With</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <PartnerLogo name="JazzCash" icon={<JazzCashIcon className="w-8 h-8 text-red-500" />} />
                    <PartnerLogo name="EasyPaisa" icon={<EasyPaisaIcon className="w-8 h-8 text-green-500" />} />
                    <PartnerLogo name="NayaPay" icon={<NayaPayIcon className="w-8 h-8 text-purple-500" />} />
                    <PartnerLogo name="SadaPay" icon={<SadaPayIcon className="w-8 h-8 text-pink-500" />} />
                 </div>
              </div>
          </section>
          
          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <AnimatedStatCard title="Active Users" value={11512} suffix="+" />
                  <AnimatedStatCard title="Rewards Distributed" value={245784} prefix="PKR " />
                  <AnimatedStatCard title="Tasks Completed Daily" value={3773} suffix="+" />
              </div>
            </div>
          </section>
          
          <section className="py-20 bg-gray-900/50">
             <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Earning in 3 Simple Steps</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16">Getting started is quick and easy. Follow these steps to begin your journey.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <StepCard number="01" title="Create Account" icon={<InviteIcon className="w-10 h-10" />}>Sign up for a free account in minutes and complete the one-time verification.</StepCard>
                    <StepCard number="02" title="Complete Tasks" icon={<CheckCircleIcon className="w-10 h-10" />}>Browse available tasks, follow the instructions, and submit your proof of completion.</StepCard>
                    <StepCard number="03" title="Withdraw Earnings" icon={<WalletIcon className="w-10 h-10" />}>Once your balance reaches the minimum threshold, withdraw your earnings securely.</StepCard>
                </div>
            </div>
          </section>
          
          <section className="py-20">
             <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <FeatureCard icon={<WalletIcon className="w-7 h-7" />} title="Instant Payouts">Earnings are credited to your wallet instantly after task completion.</FeatureCard>
                        <FeatureCard icon={<EarnIcon className="w-7 h-7" />} title="Multiple Earning Methods">Earn via tasks, referrals, spin-the-wheel, and playing games.</FeatureCard>
                        <FeatureCard icon={<LockIcon className="w-7 h-7" />} title="Secure & Trusted">Your data is safe. We prioritize security and transparency in all our operations.</FeatureCard>
                        <FeatureCard icon={<CreateTaskIcon className="w-7 h-7" />} title="Promote Your Brand">Create your own tasks to increase engagement for your content and services.</FeatureCard>
                    </div>
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Earn Halal is Your Best Choice</h2>
                        <p className="text-lg text-gray-400 mb-8">We are committed to providing a secure, transparent, and ethical platform for everyone. All our earning methods are vetted to be compliant with Halal principles.</p>
                         <button
                            onClick={() => handleAuthClick('signup')}
                            className="px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/30"
                        >
                            Join Our Community
                        </button>
                    </div>
                </div>
            </div>
          </section>

        </main>

        <footer className="bg-gray-900/50 border-t border-gray-700/50">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-8">
                     <h3 className="text-3xl font-heading font-bold text-white mb-4">Ready to Start Earning?</h3>
                     <p className="text-gray-400 max-w-md mx-auto mb-6">Join Earn Halal today and take the first step towards your online earning journey.</p>
                     <button
                        onClick={() => handleAuthClick('signup')}
                        className="px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/30"
                     >
                        Create Your Free Account
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left mb-8">
                    <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Company</h4>
                        <ul className="mt-4 space-y-2 text-gray-400">
                            <FooterLink onClick={() => setActiveInfoModal('about')}>About Us</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('how-it-works')}>How It Works</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('support')}>Contact</FooterLink>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Platform</h4>
                        <ul className="mt-4 space-y-2 text-gray-400">
                             <FooterLink onClick={() => setActiveInfoModal('deposit')}>Deposit</FooterLink>
                             <FooterLink onClick={() => setActiveInfoModal('withdrawal')}>Withdrawal</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Legal</h4>
                        <ul className="mt-4 space-y-2 text-gray-400">
                            <FooterLink onClick={() => setActiveInfoModal('terms')}>Terms</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('privacy')}>Privacy</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('refund')}>Refund Policy</FooterLink>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Connect</h4>
                         <p className="mt-4 text-gray-400">Join our community for updates and support.</p>
                    </div>
                </div>
                <div className="border-t border-gray-700/50 pt-6 text-center text-gray-500">
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
