import React, { useState, useEffect, useRef } from 'react';
import { 
    EarnIcon, InviteIcon, CheckCircleIcon, WalletIcon, 
    BankIcon, MenuIcon, CloseIcon, DocumentTextIcon, InfoIcon, RefundIcon, 
    DisclaimerIcon, LockIcon, CreateTaskIcon 
} from './icons';
import { InfoModal, renderModalContent } from './LandingInfoViews';

interface LandingViewProps {
  onGetStarted: (view: 'login' | 'signup') => void;
}

// Custom hook for detecting when an element is on screen
const useOnScreen = (ref: React.RefObject<HTMLElement>, rootMargin = '0px') => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin, threshold: 0.1 }
        );
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, rootMargin]);

    return isVisible;
};

// Custom hook for animating numbers with continuous updates
const useAnimatedCounter = (targetValue: number, isVisible: boolean, duration: number = 2500) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    const prevTargetValue = useRef<number>(0);
    const initialAnimationDone = useRef(false);

    useEffect(() => {
        if (!isVisible && !initialAnimationDone.current) {
            return;
        }

        const startValue = initialAnimationDone.current ? prevTargetValue.current : 0;
        const animationDuration = initialAnimationDone.current ? 1000 : duration;
        let startTimestamp: number | null = null;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / animationDuration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const newCount = Math.floor(startValue + (targetValue - startValue) * easeOutProgress);
            setCount(newCount);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            } else {
                if (!initialAnimationDone.current) initialAnimationDone.current = true;
                prevTargetValue.current = targetValue;
            }
        };

        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [targetValue, isVisible, duration]);

    return count;
};


const AnimatedStatCard: React.FC<{ title: string; value: number; prefix?: string; suffix?: string; icon: React.ReactNode; }> = ({ title, value, prefix = '', suffix = '', icon }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-100px');
    const count = useAnimatedCounter(value, isVisible, 2500);

    return (
      <div ref={ref} className={`relative p-6 rounded-2xl bg-white border border-gray-200 shadow-subtle text-center transition-all duration-500 hover:shadow-subtle-md hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mb-3">{icon}</div>
        <p className="text-4xl lg:text-5xl font-numeric font-extrabold text-primary-600">
          {prefix}{count.toLocaleString()}{suffix}
        </p>
        <p className="text-gray-600 mt-2 text-lg">{title}</p>
      </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-gray-100 p-8 rounded-2xl text-center transition-all duration-300 hover:bg-white hover:shadow-subtle-md hover:-translate-y-2 border border-transparent hover:border-primary-200">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-2xl shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{children}</p>
    </div>
);

const FooterLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
    <li>
        <button onClick={onClick} className="hover:text-white transition-colors duration-200">{children}</button>
    </li>
);

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  
  const [activeUsers, setActiveUsers] = useState(11512);
  const [rewardsDistributed, setRewardsDistributed] = useState(245784);
  const [tasksCompleted, setTasksCompleted] = useState(3773);

  useEffect(() => {
    const usersInterval = setInterval(() => setActiveUsers(prev => prev + Math.floor(Math.random() * 3) + 1), 15000);
    const rewardsInterval = setInterval(() => setRewardsDistributed(prev => prev + Math.floor(Math.random() * 9501) + 500), 8000);
    const tasksInterval = setInterval(() => setTasksCompleted(prev => prev + Math.floor(Math.random() * 12) + 1), 10000);
    return () => { clearInterval(usersInterval); clearInterval(rewardsInterval); clearInterval(tasksInterval); };
  }, []);
  
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
      switch (modalKey) {
          case 'how-it-works': return 'How It Works';
          case 'about': return 'About Us';
          case 'support': return 'Support & Contact';
          case 'privacy': return 'Privacy Policy';
          case 'terms': return 'Terms & Conditions';
          case 'withdrawal': return 'Withdrawal Details';
          case 'deposit': return 'Deposit Information';
          case 'refund': return 'Refund Policy';
          case 'disclaimer': return 'Disclaimer';
          default: return 'Information';
      }
  }

  return (
    <>
      <style>{`
        body { background-color: #F8F9FA; }
        .clip-art { clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%); }
      `}</style>
      
      <div className="relative min-h-screen w-full bg-gray-50 text-gray-800 font-sans isolate overflow-x-hidden">
        
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" className="text-2xl font-heading font-bold text-primary-600 transition-all hover:text-primary-700">Earn Halal</a>
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                        <button key={link.name} onClick={() => link.modal && setActiveInfoModal(link.modal)} className="text-gray-600 hover:text-primary-600 transition-colors font-medium">{link.name}</button>
                    ))}
                    <button onClick={() => handleAuthClick('login')} className="px-5 py-2 bg-primary-100 border border-primary-300 text-primary-700 font-semibold rounded-lg hover:bg-primary-200 transition-all">Login</button>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-700 hover:text-primary-600 z-50">
                    {isMenuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </button>
            </nav>
        </header>
        
        {isMenuOpen && (
            <div className={`fixed top-0 left-0 w-full h-full bg-white z-30 transition-transform duration-300 ease-in-out md:hidden flex flex-col`}>
                 <div className="flex-shrink-0 container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
                    <span className="text-2xl font-heading font-bold text-primary-600">Menu</span>
                </div>
                <div className="flex-grow overflow-y-auto p-6 flex flex-col justify-between">
                    <div className="space-y-2">
                         {navLinks.map(link => (
                            <button key={link.name} onClick={() => handleMenuLinkClick(link.modal)} className="w-full text-left p-4 text-lg text-gray-700 hover:bg-gray-100 rounded-lg">{link.name}</button>
                         ))}
                    </div>
                    <div className="space-y-3">
                         <button onClick={() => handleAuthClick('signup')} className="w-full px-5 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all text-lg">Create Free Account</button>
                         <button onClick={() => handleAuthClick('login')} className="w-full px-5 py-3 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-lg">Login</button>
                    </div>
                </div>
            </div>
        )}

        <main className="relative z-10">
          <section className="relative pt-20 pb-16 md:pt-24 md:pb-20">
             <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
                <div className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#34d399] to-[#fde047] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-art"></div>
            </div>
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-block bg-accent-100 text-accent-800 font-semibold px-4 py-2 rounded-full mb-4 text-sm border border-accent-200">
                    Sign up now and get <span className="font-bold text-accent-700">25 Rs</span> FREE BONUS!
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight text-gray-900">
                    Simple Tasks,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                        Real Rewards
                    </span>
                    </h1>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                    The most trusted platform in Pakistan to earn rewards by completing simple online tasks.
                    </p>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <button
                    onClick={() => handleAuthClick('signup')}
                    className="mt-10 px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 mx-auto"
                    >
                    <span>Create Your Free Account</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                </div>
            </div>
          </section>
          
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <AnimatedStatCard title="Active Users" value={activeUsers} suffix="+" icon={<InviteIcon className="w-10 h-10 text-primary-500 mx-auto" />} />
                  <AnimatedStatCard title="Rewards Distributed" value={rewardsDistributed} prefix="PKR " icon={<WalletIcon className="w-10 h-10 text-primary-500 mx-auto" />} />
                  <AnimatedStatCard title="Tasks Completed Today" value={tasksCompleted} suffix="+" icon={<CheckCircleIcon className="w-10 h-10 text-primary-500 mx-auto" />} />
              </div>
            </div>
          </section>
          
          <section className="py-20 bg-gray-50">
             <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Earn Halal?</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">We are committed to providing a secure and transparent platform for everyone.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard icon={<WalletIcon className="w-8 h-8" />} title="Instant Payouts">Earnings are credited to your wallet instantly after task completion.</FeatureCard>
                    <FeatureCard icon={<EarnIcon className="w-8 h-8" />} title="Multiple Methods">Earn via tasks, referrals, spin-the-wheel, and playing games.</FeatureCard>
                    <FeatureCard icon={<LockIcon className="w-8 h-8" />} title="Secure & Trusted">Your data is safe with us. We prioritize security and transparency.</FeatureCard>
                    <FeatureCard icon={<CreateTaskIcon className="w-8 h-8" />} title="Promote Your Brand">Create your own tasks to increase engagement for your content.</FeatureCard>
                    <FeatureCard icon={<InviteIcon className="w-8 h-8" />} title="Referral Program">Invite friends and earn a bonus for every successful referral.</FeatureCard>
                    <FeatureCard icon={<CheckCircleIcon className="w-8 h-8" />} title="Halal Certified">All earning methods and tasks are vetted to be compliant with Halal principles.</FeatureCard>
                </div>
            </div>
          </section>

        </main>

        <footer className="bg-gray-800 text-gray-400">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-2xl font-heading font-bold text-white">Earn Halal</h3>
                        <p className="mt-4 text-gray-400">The most trusted platform in Pakistan for simple, halal online earnings.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Company</h4>
                        <ul className="mt-4 space-y-2">
                            <FooterLink onClick={() => setActiveInfoModal('about')}>About Us</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('how-it-works')}>How It Works</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('support')}>Contact Support</FooterLink>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Platform</h4>
                        <ul className="mt-4 space-y-2">
                             <FooterLink onClick={() => setActiveInfoModal('deposit')}>Deposit Info</FooterLink>
                             <FooterLink onClick={() => setActiveInfoModal('withdrawal')}>Withdrawal Info</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white tracking-wider uppercase">Legal</h4>
                        <ul className="mt-4 space-y-2">
                            <FooterLink onClick={() => setActiveInfoModal('terms')}>Terms & Conditions</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('privacy')}>Privacy Policy</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('refund')}>Refund Policy</FooterLink>
                            <FooterLink onClick={() => setActiveInfoModal('disclaimer')}>Disclaimer</FooterLink>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500">
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