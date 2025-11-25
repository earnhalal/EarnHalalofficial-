
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Task, TaskType as TaskTypeEnum } from '../types';
import { TaskType } from '../types';
import { 
    CheckCircleIcon, InfoIcon, YoutubeIcon, FacebookIcon, 
    InstagramIcon, TikTokIcon, TwitterIcon, LinkedInIcon, 
    DiscordIcon, TelegramIcon, SnapchatIcon, Globe, ChevronDownIcon
} from './icons';


interface CreateTaskViewProps {
  balance: number;
  onCreateTask: (task: Omit<Task, 'id'>, quantity: number, totalCost: number) => void;
}

type FormState = {
    taskType: TaskTypeEnum;
    title: string;
    url: string;
    description: string;
    reward: string;
    quantity: string;
}

const initialFormState: FormState = {
    taskType: TaskType.VISIT_WEBSITE,
    title: '',
    url: '',
    description: '',
    reward: '',
    quantity: ''
};

// Map TaskType to Icon and Label for the visual selector
const TASK_CATEGORIES = [
    { id: TaskType.VISIT_WEBSITE, label: 'Website Visit', icon: <Globe className="w-5 h-5"/>, color: 'text-blue-500' },
    { id: TaskType.YOUTUBE_SUBSCRIBE, label: 'YouTube Subscribe', icon: <YoutubeIcon className="w-5 h-5"/>, color: 'text-red-600' },
    { id: TaskType.FACEBOOK_LIKE, label: 'Facebook Like', icon: <FacebookIcon className="w-5 h-5"/>, color: 'text-blue-700' },
    { id: TaskType.INSTAGRAM_FOLLOW, label: 'Instagram Follow', icon: <InstagramIcon className="w-5 h-5"/>, color: 'text-pink-600' },
    { id: TaskType.TIKTOK_FOLLOW, label: 'TikTok Follow', icon: <TikTokIcon className="w-5 h-5"/>, color: 'text-black' },
    { id: TaskType.TWITTER_FOLLOW, label: 'Twitter Follow', icon: <TwitterIcon className="w-5 h-5"/>, color: 'text-sky-500' },
    { id: TaskType.LINKEDIN_FOLLOW, label: 'LinkedIn Follow', icon: <LinkedInIcon className="w-5 h-5"/>, color: 'text-blue-800' },
    { id: TaskType.DISCORD_JOIN, label: 'Discord Join', icon: <DiscordIcon className="w-5 h-5"/>, color: 'text-indigo-600' },
    { id: TaskType.TELEGRAM_JOIN, label: 'Telegram Join', icon: <TelegramIcon className="w-5 h-5"/>, color: 'text-sky-500' },
    { id: TaskType.SNAPCHAT_FOLLOW, label: 'Snapchat Follow', icon: <SnapchatIcon className="w-5 h-5"/>, color: 'text-yellow-500' },
];

// Catchy Templates for Auto-fill
const TEMPLATES: Record<string, { titles: string[], descriptions: string[] }> = {
    [TaskType.YOUTUBE_SUBSCRIBE]: {
        titles: ["🔥 100% Permanent Sub", "Watch 2 Mins & Subscribe 🚀", "Fast Subscribe & Bell 🔔", "Need Organic Subs"],
        descriptions: ["Please watch the video for at least 2 minutes before subscribing so it counts.", "Permanent subscribers only. Unsubscribers will be reported.", "Like, Comment and Subscribe for quick approval."]
    },
    [TaskType.TIKTOK_FOLLOW]: {
        titles: ["Follow for Best Content ✨", "Viral Video Support 🚀", "Fast Follow Back", "Grow Together 📈"],
        descriptions: ["Follow my account and like 3 videos.", "Real active followers only.", "Watch full video and follow."]
    },
    [TaskType.FACEBOOK_LIKE]: {
        titles: ["Like Page & Follow 👍", "React Love on Post ❤️", "Join Our Community"],
        descriptions: ["Like the page and follow. Do not unlike later.", "React Love to the pinned post.", "Join the group and invite 2 friends."]
    },
    [TaskType.INSTAGRAM_FOLLOW]: {
        titles: ["Follow Me on Insta 📸", "Like Recent Post ❤️", "Story View & Follow"],
        descriptions: ["Follow account and like the latest reel.", "Genuine followers for lifestyle content.", "View story and follow."]
    },
    [TaskType.VISIT_WEBSITE]: {
        titles: ["Visit & Stay 30s ⏱️", "Click on Banner Ad 💸", "Read Full Article"],
        descriptions: ["Visit the link, scroll to the bottom, and stay for 30 seconds.", "Click 1 ad on the page to support.", "Read the full article and share."]
    },
    // Default fallback
    'default': {
        titles: ["Check this out! 🌟", "Support my channel", "Follow for updates"],
        descriptions: ["Complete the task honestly for instant approval.", "No fake accounts allowed.", "Simple task, quick payment."]
    }
};

const CreateTaskView: React.FC<CreateTaskViewProps> = ({ balance, onCreateTask }) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedTask, setSubmittedTask] = useState<Omit<Task, 'id'> & { quantity: number; totalCost: number; } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCost = useMemo(() => {
    const rewardNum = parseFloat(form.reward);
    const quantityNum = parseInt(form.quantity, 10);
    if (!isNaN(rewardNum) && !isNaN(quantityNum) && rewardNum > 0 && quantityNum > 0) {
      return rewardNum * quantityNum;
    }
    return 0;
  }, [form.reward, form.quantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCategorySelect = (type: TaskTypeEnum) => {
      setForm(prev => ({ ...prev, taskType: type }));
      setIsDropdownOpen(false);
  };

  const handleTemplateClick = (field: 'title' | 'description', value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (totalCost <= 0) {
      setError('Please enter a valid reward and quantity.');
      return;
    }
    if (totalCost > balance) {
      setError('Insufficient balance to create this task campaign.');
      return;
    }

    setIsSubmitting(true);
    const taskData: Omit<Task, 'id'> = {
        type: form.taskType,
        title: form.title,
        description: form.description,
        url: form.url,
        reward: parseFloat(form.reward)
    };
    const quantityNum = parseInt(form.quantity, 10);
    
    setSubmittedTask({ ...taskData, quantity: quantityNum, totalCost });
    
    // Simulate API call
    setTimeout(() => {
        onCreateTask(taskData, quantityNum, totalCost);
        setIsSubmitting(false);
        setIsSuccess(true);
    }, 1500);
  };
  
  const handleCreateAnother = () => {
    setForm(initialFormState);
    setIsSuccess(false);
    setSubmittedTask(null);
    setError('');
  };

  const selectedCategory = TASK_CATEGORIES.find(c => c.id === form.taskType) || TASK_CATEGORIES[0];
  const currentTemplates = TEMPLATES[form.taskType] || TEMPLATES['default'];

  if (isSuccess && submittedTask) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-subtle-md max-w-3xl mx-auto text-center animate-fade-in">
            <CheckCircleIcon className="w-20 h-20 text-primary-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Task Submitted for Review!</h2>
            <p className="text-gray-600 mt-2 mb-6">
                Your task "{submittedTask.title}" is now pending Admin approval. You will be notified once it's live.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg text-left space-y-2 mb-8 border border-gray-200">
                <p><strong>Type:</strong> {submittedTask.type}</p>
                <p><strong>URL:</strong> <a href={submittedTask.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">{submittedTask.url}</a></p>
                <p><strong>Quantity:</strong> {submittedTask.quantity} tasks</p>
                <p><strong>Reward per Task:</strong> {submittedTask.reward.toFixed(2)} Rs</p>
                <p><strong>Total Cost:</strong> <span className="font-bold text-red-600">{submittedTask.totalCost.toFixed(2)} Rs</span> (deducted)</p>
            </div>
            <button 
                onClick={handleCreateAnother}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg"
            >
                Create Another Campaign
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-subtle-md max-w-3xl mx-auto pb-24">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create a New Task Campaign</h2>
        <p className="text-gray-600 mt-2">
          Promote your content by creating tasks for our community to complete.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isSubmitting}>
            <div className="p-6 border rounded-lg border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Select Platform</h3>
                
                {/* Custom Dropdown */}
                <div className="relative mb-6" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-primary-500 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${selectedCategory.color} p-2 bg-gray-50 rounded-lg`}>
                                {selectedCategory.icon}
                            </div>
                            <span className="font-bold text-gray-800">{selectedCategory.label}</span>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                            {TASK_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                                >
                                    <div className={`${cat.color} w-8 flex justify-center`}>{cat.icon}</div>
                                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                    {form.taskType === cat.id && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                      <input type="text" id="title" value={form.title} onChange={handleChange} className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" placeholder="e.g., Visit my new blog post" required />
                      
                      {/* Title Suggestions */}
                      <div className="mt-2 flex flex-wrap gap-2">
                          {currentTemplates.titles.map((t, i) => (
                              <button 
                                key={i} 
                                type="button" 
                                onClick={() => handleTemplateClick('title', t)}
                                className="text-[10px] sm:text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                              >
                                {t}
                              </button>
                          ))}
                      </div>
                    </div>

                     <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Task URL</label>
                      <input type="url" id="url" value={form.url} onChange={handleChange} className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" placeholder="https://..." required />
                    </div>

                     <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description & Instructions</label>
                      <input type="text" id="description" value={form.description} onChange={handleChange} className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" placeholder="Tell users what to do..." required />
                      
                      {/* Description Suggestions */}
                      <div className="mt-2 flex flex-wrap gap-2">
                          {currentTemplates.descriptions.map((d, i) => (
                              <button 
                                key={i} 
                                type="button" 
                                onClick={() => handleTemplateClick('description', d)}
                                className="text-[10px] sm:text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors text-left"
                              >
                                {d}
                              </button>
                          ))}
                      </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border rounded-lg border-gray-200 mt-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Budget</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Reward per Task (Rs)</label>
                    <input type="number" id="reward" value={form.reward} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" placeholder="e.g., 5" step="0.01" min="1" max="10" required />
                    <p className="text-xs text-gray-500 mt-1">Reward must be between 1 and 10 Rs.</p>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Number of Tasks</label>
                    <input type="number" id="quantity" value={form.quantity} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" placeholder="e.g., 100" min="1" required />
                  </div>
                </div>
            </div>
        </fieldset>

        <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
                 <p className="font-medium text-lg text-gray-700">Total Campaign Cost</p>
                 <div className="group relative">
                    <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 shadow-lg z-10">
                        This amount will be immediately deducted from your wallet balance.
                    </div>
                 </div>
            </div>
            <p className="text-4xl font-bold font-numeric text-primary-600 my-2">{totalCost.toFixed(2)} Rs</p>
            <div className="flex flex-col gap-1">
                 <p className="text-sm text-gray-500">Your current balance: {balance.toFixed(2)} Rs</p>
                 <p className="text-xs text-amber-600 font-bold">(Deducted from Main Balance)</p>
            </div>
        </div>

        {error && (
          <div className="p-4 rounded-md text-center text-sm font-semibold bg-red-100 text-red-800">
              {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || totalCost <= 0 || totalCost > balance}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Launching...
            </>
          ) : 'Launch Campaign'}
        </button>
      </form>
       <style>{`
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default CreateTaskView;
