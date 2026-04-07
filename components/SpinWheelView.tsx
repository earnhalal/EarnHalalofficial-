import React from 'react';
import { Construction, Timer, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpinComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060D2D] text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Main Content Card */}
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative bg-[#0F172A] border border-blue-500/30 p-6 rounded-3xl shadow-2xl">
            <Construction size={64} className="text-blue-400 mx-auto animate-bounce" />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Lucky <span className="text-blue-500">Spin</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-300 font-medium bg-blue-500/10 py-1 px-4 rounded-full w-fit mx-auto border border-blue-500/20">
            <Sparkles size={16} />
            <span>Under Construction</span>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            Hum is feature ko behtar bana rahe hain taake aapko milay ek premium gaming experience. Boht jald naye prizes ke sath launch hoga!
          </p>
        </div>

        {/* Status Tracker */}
        <div className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Timer className="text-yellow-500" size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Expected</p>
              <p className="font-semibold text-gray-200">Coming Very Soon</p>
            </div>
          </div>
          <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-sm text-gray-600">
          TaskMint Developer Team &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default SpinComingSoon;
