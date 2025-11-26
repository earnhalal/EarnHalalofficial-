
// components/EarnView.tsx
import React, { useState, useMemo } from 'react';
import type { UserCreatedTask, TaskType as TaskTypeEnum } from '../types';
import { TaskType } from '../types';
import { 
    CheckCircleIcon, YoutubeIcon, FacebookIcon, InstagramIcon, 
    TikTokIcon, TwitterIcon, LinkedInIcon, DiscordIcon, 
    TelegramIcon, SnapchatIcon, Globe, PlayCircleIcon, ArrowRight
} from './icons';

interface ProofSubmissionModalProps {
  task: UserCreatedTask;
  onClose: () => void;
  onSubmit: (taskId: string) => void;
}

const ProofSubmissionModal: React.FC<ProofSubmissionModalProps> = ({ task, onClose, onSubmit }) => {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = () => {
    if (proofFile) {
        setSubmissionState('submitting');
        // Simulate network delay
        setTimeout(() => {
            onSubmit(task.id);
            setSubmissionState('success');
        }, 1500);
    }
  };
  
  const SuccessView = () => (
     <div className="text-center">
        <style>{`
            .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
            .checkmark { stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
            @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        `}</style>
        <svg className="w-24 h-24 mx-auto mb-4" viewBox="0 0 52 52">
            <circle className="checkmark-circle text-primary-100" cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
            <path className="checkmark text-primary-500" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proof Submitted!</h2>
        <p className="text-gray-600 mb-6">Your reward of <span className="font-bold text-accent-600">{task.reward.toFixed(2)} Rs</span> will be processed shortly.</p>
        <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
            Done
        </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {submissionState === 'success' ? <SuccessView /> : (
            <>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Proof of Completion</h2>
                    <p className="text-gray-600 mb-6">For task: <span className="font-semibold">{task.title}</span></p>
                </div>
                
                <div className="mb-6">
                    <label 
                        htmlFor="payment-proof" 
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="font-semibold text-primary-600">Upload Screenshot</span>
                        <span className="text-xs text-gray-500">Click or drag file here</span>
                    </label>
                    <input 
                        id="payment-proof"
                        type="file"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                        required
                    />
                    {proofFile && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircleIcon className="w-4 h-4" /> File selected: {proofFile.name}</p>}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={submissionState === 'submitting'}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!proofFile || submissionState === 'submitting'}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {submissionState === 'submitting' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : 'Submit Proof'}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

interface EarnViewProps {
  tasks: UserCreatedTask[];
  onCompleteTask: (taskId: string) => void;
  onTaskView: (taskId: string) => void;
  completedTaskIds: string[];
}

const getTaskIcon = (type: TaskTypeEnum) => {
    switch (type) {
        case TaskType.YOUTUBE_SUBSCRIBE: return { icon: <YoutubeIcon className="w-6 h-6 text-red-600" />, bg: 'bg-red-50' };
        case TaskType.FACEBOOK_LIKE: return { icon: <FacebookIcon className="w-6 h-6 text-blue-700" />, bg: 'bg-blue-50' };
        case TaskType.INSTAGRAM_FOLLOW: return { icon: <InstagramIcon className="w-6 h-6 text-pink-600" />, bg: 'bg-pink-50' };
        case TaskType.TIKTOK_FOLLOW: return { icon: <TikTokIcon className="w-6 h-6 text-black" />, bg: 'bg-gray-100' };
        case TaskType.TWITTER_FOLLOW: return { icon: <TwitterIcon className="w-6 h-6 text-sky-500" />, bg: 'bg-sky-50' };
        case TaskType.LINKEDIN_FOLLOW: return { icon: <LinkedInIcon className="w-6 h-6 text-blue-800" />, bg: 'bg-blue-50' };
        case TaskType.DISCORD_JOIN: return { icon: <DiscordIcon className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' };
        case TaskType.TELEGRAM_JOIN: return { icon: <TelegramIcon className="w-6 h-6 text-sky-500" />, bg: 'bg-sky-50' };
        case TaskType.SNAPCHAT_FOLLOW: return { icon: <SnapchatIcon className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50' };
        default: return { icon: <Globe className="w-6 h-6 text-primary-600" />, bg: 'bg-primary-50' };
    }
};

const EarnView: React.FC<EarnViewProps> = ({ tasks, onCompleteTask, onTaskView, completedTaskIds }) => {
  const [taskForProof, setTaskForProof] = useState<UserCreatedTask | null>(null);

  const approvedTasks = useMemo(() => tasks.filter(task => task.status === 'approved'), [tasks]);

  const handleCompleteClick = (task: UserCreatedTask) => {
    // Register the view/click
    onTaskView(task.id);
    // Open the task link in a new tab
    window.open(task.url, '_blank', 'noopener,noreferrer');
    // Open the proof submission modal
    setTaskForProof(task);
  };

  const handleWatchAdsClick = () => {
      // Dispatch a custom event to switch view, since we don't have setActiveView prop here
      // This relies on App.tsx handling popstate or we could pass setActiveView.
      // Ideally, EarnView should receive setActiveView. For now, let's dispatch an event or use window history state hack.
      window.history.pushState({ view: 'ADS_WATCH' }, '', '');
      window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'ADS_WATCH' } }));
  };

  return (
    <div className="space-y-6">
      {taskForProof && (
          <ProofSubmissionModal 
              task={taskForProof}
              onClose={() => setTaskForProof(null)}
              onSubmit={(taskId) => {
                  onCompleteTask(taskId);
                  // The modal now handles its own closing after success animation
              }}
          />
      )}
      
      {/* Promotional Banner for Video Ads */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <PlayCircleIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                  <h3 className="text-lg font-bold">Watch & Earn</h3>
                  <p className="text-red-100 text-sm">Watch short videos and earn instant cash rewards.</p>
              </div>
          </div>
          <button 
            onClick={handleWatchAdsClick}
            className="bg-white text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
          >
              View Video Ads <ArrowRight className="w-4 h-4" />
          </button>
      </div>

      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Available Tasks</h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              {approvedTasks.length} Tasks
          </span>
      </div>

      {approvedTasks.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-subtle text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tasks Available</h2>
            <p className="text-gray-600">
            All standard tasks have been completed. Try the <strong>Watch & Earn</strong> section above!
            </p>
        </div>
      ) : (
        approvedTasks.map((task, index) => {
            const isCompletedByUser = completedTaskIds.includes(task.id);
            const { icon, bg } = getTaskIcon(task.type);

            return (
                <div 
                    key={task.id} 
                    className="bg-white p-4 sm:p-6 rounded-xl shadow-subtle transition-all duration-300 hover:shadow-subtle-md hover:-translate-y-1 animate-fade-in-up border border-gray-200"
                    style={{ animationDelay: `${index * 75}ms`}}
                >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${bg} flex-shrink-0 mt-1`}>
                        {icon}
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase text-gray-400">{task.type}</span>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h3>
                        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{task.description}</p>
                    </div>
                    </div>
                    <div className="text-right flex-shrink-0 self-end sm:self-center">
                    <p className="text-2xl font-bold font-numeric text-accent-600">{task.reward.toFixed(2)} Rs</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end sm:items-center gap-4">
                    {isCompletedByUser ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 py-2 px-6 rounded-md font-semibold w-full sm:w-auto justify-center">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Completed</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleCompleteClick(task)}
                            className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto shadow-sm hover:shadow-md"
                        >
                            Complete Task
                        </button>
                    )}
                </div>
                </div>
            );
        })
      )}
    </div>
  );
};

export default EarnView;
