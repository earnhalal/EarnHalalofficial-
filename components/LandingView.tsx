import React, { useState, useEffect, useRef } from 'react';
import { EarnIcon, InviteIcon, GiftIcon, SparklesIcon, CheckCircleIcon, WalletIcon, BankIcon } from './icons';

interface LandingViewProps {
  onGetStarted: () => void;
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
            { rootMargin }
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

// Custom hook for animating numbers
const useCountUp = (endValue: number, duration: number, isVisible: boolean) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    const startTimestampRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isVisible) return;

        const step = (timestamp: number) => {
            if (!startTimestampRef.current) {
                startTimestampRef.current = timestamp;
            }
            const progress = Math.min((timestamp - startTimestampRef.current) / duration, 1);
            const currentCount = Math.floor(progress * endValue);
            setCount(currentCount);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [endValue, duration, isVisible]);

    return count;
};

const AnimatedStatCard: React.FC<{ title: string; value: number; prefix?: string; suffix?: string; icon: React.ReactNode; animationDelay: string; }> = ({ title, value, prefix = '', suffix = '', icon, animationDelay }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);
    const count = useCountUp(value, 2500, isVisible);

    return (
      <div ref={ref} className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-green-400/20 shadow-lg text-center transition-all duration-300 hover:border-green-400/50 hover:shadow-green-500/10 animate-fade-in-up" style={{ animationDelay }}>
        <div className="mb-3">{icon}</div>
        <p className="text-4xl lg:text-5xl font-extrabold text-green-400" style={{ textShadow: '0 0 20px rgba(74, 222, 128, 0.6)' }}>
          {prefix}{count.toLocaleString()}{suffix}
        </p>
        <p className="text-slate-300 mt-2 text-lg">{title}</p>
      </div>
    );
};

const EarningCard: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="group relative bg-slate-800/50 p-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 text-center overflow-hidden border border-transparent hover:border-amber-400/30">
    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/0 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/20">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
  </div>
);

// --- New Partner Logo Icons ---
const PayEaseLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3"/>
        <path d="M18 18L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M18 30L30 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);
const TaskBlitzLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3"/>
        <path d="M16 24L22 30L32 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const EarnNovaLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <path d="M24 4L29.2731 16.5H42.5459L32.6364 24.5L37.9095 37L24 29L10.0905 37L15.3636 24.5L5.4541 16.5H18.7269L24 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    </svg>
);
const TapZoneLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="3"/>
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="3"/>
        <path d="M24 4V8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24 40V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M44 24H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M8 24H4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);
const WinSparkLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <path d="M12 20V38H36V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20H42" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24 38V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24 4L28 12L24 20L20 12L24 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    </svg>
);
const PromoGenLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <path d="M4 14L24 4L44 14V34L24 44L4 34V14Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M18 24L30 24" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    </svg>
);
const BoostlyMediaLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <path d="M10 38L24 10L38 38H10Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M17 28H31" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);
const RefLinkLogo: React.FC = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12">
        <rect x="10" y="20" width="12" height="8" rx="4" stroke="currentColor" strokeWidth="3"/>
        <rect x="26" y="20" width="12" height="8" rx="4" stroke="currentColor" strokeWidth="3"/>
        <path d="M22 24H26" stroke="currentColor" strokeWidth="3"/>
    </svg>
);

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const partners = [
    { name: 'PayEase Wallet', logo: <PayEaseLogo /> },
    { name: 'TaskBlitz Global', logo: <TaskBlitzLogo /> },
    { name: 'EarnNova Affiliates', logo: <EarnNovaLogo /> },
    { name: 'TapZone Rewards', logo: <TapZoneLogo /> },
    { name: 'WinSpark Digital', logo: <WinSparkLogo /> },
    { name: 'PromoGen Studio', logo: <PromoGenLogo /> },
    { name: 'Boostly Media', logo: <BoostlyMediaLogo /> },
    { name: 'RefLink Network', logo: <RefLinkLogo /> },
  ];

  return (
    <>
      <style>{`
        body { background-color: #0a192f; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        
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
        .scroller {
          animation: scroll 60s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      
      {/* Certification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-800 border border-amber-400/20 rounded-2xl shadow-2xl p-8 text-white animate-fade-in-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl">&times;</button>
            <h3 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">Earn Halal Official Certificate</h3>
            <p className="text-center text-slate-400 mb-6">Certification Details (Verified)</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-slate-400">Certificate ID</span>
                <span className="font-mono font-bold">EH-2025-0917</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-slate-400">Issued By</span>
                <span className="font-bold">Earn Halal Verification Authority</span>
              </div>
               <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-slate-400">Issue Date</span>
                <span className="font-bold">10 June 2024</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-slate-400">Status</span>
                <span className="font-bold flex items-center gap-2 text-green-400">✅ Verified & Active</span>
              </div>
              <div className="pt-4 text-center">
                <span className="text-slate-400 text-sm">Digital Signature</span>
                <p className="font-serif italic text-3xl text-amber-300 mt-2" style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.7))'}}>
                    ✒️ Earn Halal Authority Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-screen w-full bg-[#0a192f] text-white font-sans isolate overflow-hidden">
        {/* Animated Particles Background */}
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
        
        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container mx-auto px-6 py-24 md:py-32 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{ textShadow: '0 3px 15px rgba(0,0,0,0.2)' }}>
                  Welcome to{' '}
                  <span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400" 
                    style={{ filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))' }}
                  >
                    Earn Halal
                  </span>
                </h1>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                  The most trusted platform to earn rewards by completing simple online tasks.
                </p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={onGetStarted}
                  className="mt-10 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-full shadow-lg text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Live Stats Section */}
          <div className="py-20 bg-slate-900/20">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <AnimatedStatCard 
                      title="Active Users" 
                      value={11512} 
                      suffix="+"
                      icon={<InviteIcon className="w-10 h-10 text-green-400/80 mx-auto" />} 
                      animationDelay="0.6s"
                  />
                  <AnimatedStatCard 
                      title="Total Rewards Distributed" 
                      value={2870000}
                      prefix="PKR "
                      suffix="+"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400/80 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.75A.75.75 0 0 1 3 4.5h.75m0 0h.75A.75.75 0 0 1 5.25 6v.75m0 0h-.75A.75.75 0 0 1 3.75 6v-.75m0 0V4.5m-1.5 1.5v.75A.75.75 0 0 0 3 6.75h.75m0 0v.75A.75.75 0 0 0 4.5 8.25h.75M6 12h12M6 12v6h12v-6" /></svg>}
                      animationDelay="0.7s"
                  />
                  <AnimatedStatCard 
                      title="Tasks Completed" 
                      value={95000}
                      suffix="+"
                      icon={<CheckCircleIcon className="w-10 h-10 text-green-400/80 mx-auto" />} 
                      animationDelay="0.8s"
                  />
              </div>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="py-20 bg-[#0a192f]">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 text-center border border-transparent hover:border-amber-400/30 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 rounded-2xl shadow-lg">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">1. Complete Verified Tasks</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Browse a wide range of simple, verified tasks. Choose what you want to complete and follow the instructions.
                  </p>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 text-center border border-transparent hover:border-amber-400/30 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 rounded-2xl shadow-lg">
                    <WalletIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">2. Instant Balance Credit</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Once your task is approved, the reward is instantly credited to your Earn Halal wallet. No delays.
                  </p>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 text-center border border-transparent hover:border-amber-400/30 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 rounded-2xl shadow-lg">
                    <BankIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">3. Withdraw Anytime</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Easily withdraw earnings via JazzCash, Easypaisa, or direct bank transfer whenever you want.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Earning Opportunities Section */}
          <div className="py-20 bg-slate-900/40">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">Earning Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <EarningCard title="Watch & Earn" icon={<EarnIcon className="w-8 h-8" />} />
                <EarningCard title="Referral Bonus" icon={<InviteIcon className="w-8 h-8" />} />
                <EarningCard title="Spin & Win" icon={<GiftIcon className="w-8 h-8" />} />
                <EarningCard title="Premium Users Boost" icon={<SparklesIcon className="w-8 h-8" />} />
              </div>
            </div>
          </div>

          {/* Certification Section */}
          <div className="py-20">
            <div className="container mx-auto px-6">
              <div 
                onClick={() => setIsModalOpen(true)}
                className="group relative max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-400/30 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/80 hover:shadow-amber-500/20 hover:-translate-y-2"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">Halal Earnings Certificate</h2>
                  <p className="text-slate-400">Officially verified by the Digital Ethics & Transparency Board</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Partners Section */}
            <div className="py-24 text-center overflow-hidden bg-gradient-to-t from-slate-900/50 to-transparent">
              <h2 className="text-3xl font-bold mb-12">🤝 Our Verified Partners</h2>
              <div className="relative w-full flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                  <div className="flex-shrink-0 flex items-center justify-around min-w-full scroller">
                      {partners.map((partner, index) => (
                          <div key={index} className="group flex flex-col items-center justify-center p-6 mx-8 transition-all duration-300">
                              <div className="transition-all duration-300" style={{ filter: 'grayscale(100%) brightness(0.7)' }}>{partner.logo}</div>
                              <span className="mt-4 font-semibold text-slate-500 transition-colors duration-300">{partner.name}</span>
                          </div>
                      ))}
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-around min-w-full scroller" aria-hidden="true">
                      {partners.map((partner, index) => (
                           <div key={index + partners.length} className="group flex flex-col items-center justify-center p-6 mx-8 transition-all duration-300">
                              <div className="transition-all duration-300" style={{ filter: 'grayscale(100%) brightness(0.7)' }}>{partner.logo}</div>
                              <span className="mt-4 font-semibold text-slate-500 transition-colors duration-300">{partner.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
            </div>


          {/* Footer */}
          <footer className="text-center py-8 border-t border-amber-400/10">
            <p className="text-amber-400/80">&copy; 2025 Earn Halal | Built with 💛 the Halal Way</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingView;