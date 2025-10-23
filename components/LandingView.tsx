import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons';

interface LandingViewProps {
  onGetStarted: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const [displayCount, setDisplayCount] = useState(11400);
  const [targetCount, setTargetCount] = useState(11500);
  const [liveFeed, setLiveFeed] = useState<{ name: string; amount: number } | null>(null);
  const [isFeedVisible, setIsFeedVisible] = useState(false);

  const sampleNames = ['Aisha', 'Fatima', 'Hassan', 'Ali', 'Zainab', 'Omar', 'Sana', 'Bilal', 'Hina', 'Imran', 'Saad', 'Maria'];
  
  const maskName = (name: string) => {
    if (name.length <= 3) return `${name}***`;
    return `${name.substring(0, 3)}***`;
  };

  // Effect to slowly increase the target count over time
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetCount(prevCount => prevCount + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Effect for the smooth counting animation
  useEffect(() => {
    const diff = targetCount - displayCount;
    if (diff <= 0) return;

    let start: number | null = null;
    const duration = 1500; // Animate over 1.5 seconds

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayCount(Math.floor(displayCount + diff * progress));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [targetCount]);


  // Effect for the live withdrawal feed
  useEffect(() => {
    const showNewFeed = () => {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomAmount = Math.floor(Math.random() * (10000 - 500 + 1) + 500);
      const roundedAmount = Math.round(randomAmount / 50) * 50;

      setLiveFeed({ name: maskName(randomName), amount: roundedAmount });
      setIsFeedVisible(true);

      setTimeout(() => {
        setIsFeedVisible(false);
      }, 4000);
    };

    const initialTimeout = setTimeout(showNewFeed, 2500);
    const feedInterval = setInterval(showNewFeed, 7000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(feedInterval);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      <div
        className={`fixed bottom-4 left-4 z-50 flex items-center gap-4 bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg transition-transform duration-500 ease-in-out ${
          isFeedVisible ? 'translate-x-0' : '-translate-x-[150%]'
        }`}
      >
        <CheckCircleIcon className="w-8 h-8 text-green-400 shrink-0" />
        <div>
          <p className="font-bold">{liveFeed?.name}</p>
          <p className="text-sm text-gray-300">
            has successfully withdrawn{' '}
            <span className="font-bold text-green-400">{liveFeed?.amount} Rs</span>
          </p>
        </div>
      </div>


      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white leading-tight">
            Welcome to <span className="text-primary-500">Earn Halal</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
            The most trusted platform to earn rewards by completing simple online tasks. Join our growing community and start earning today, the Halal way.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-8 px-8 py-4 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-transform transform hover:scale-105 shadow-lg text-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-primary-500" style={{ textShadow: '0px 2px 4px rgba(99, 102, 241, 0.2)' }}>
                {displayCount.toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Happy Users Joined</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-primary-500" style={{ textShadow: '0px 2px 4px rgba(99, 102, 241, 0.2)' }}>100%</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Verified Tasks</p>
            </div>
             <div className="text-center">
              <p className="text-5xl font-extrabold text-primary-500" style={{ textShadow: '0px 2px 4px rgba(99, 102, 241, 0.2)' }}>24/7</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Our Trusted Partners</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <span className="text-gray-400 dark:text-gray-500 text-2xl font-semibold">PARTNER A</span>
            <span className="text-gray-400 dark:text-gray-500 text-2xl font-semibold">PARTNER B</span>
            <span className="text-gray-400 dark:text-gray-500 text-2xl font-semibold">PARTNER C</span>
            <span className="text-gray-400 dark:text-gray-500 text-2xl font-semibold">PARTNER D</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;