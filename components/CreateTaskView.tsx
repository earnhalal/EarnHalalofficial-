
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Task, TaskType as TaskTypeEnum } from '../types';
import { TaskType } from '../types';
import { 
    CheckCircleIcon, InfoIcon, YoutubeIcon, FacebookIcon, 
    InstagramIcon, TikTokIcon, TwitterIcon, LinkedInIcon, 
    DiscordIcon, TelegramIcon, SnapchatIcon, Globe, ChevronDownIcon,
    EyeIcon, RocketIcon, SparklesIcon
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
    reward: '2',
    quantity: '100'
};

// Map TaskType to Icon and Label for the visual selector
const TASK_CATEGORIES = [
    { id: TaskType.VISIT_WEBSITE, label: 'Website', icon: <Globe className="w-6 h-6 text-blue-500"/>, color: 'bg-blue-50 border-blue-100 text-blue-600' },
    { id: TaskType.YOUTUBE_SUBSCRIBE, label: 'YouTube', icon: <YoutubeIcon className="w-6 h-6 text-red-600"/>, color: 'bg-red-50 border-red-100 text-red-600' },
    { id: TaskType.FACEBOOK_LIKE, label: 'Facebook', icon: <FacebookIcon className="w-6 h-6 text-blue-700"/>, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: TaskType.INSTAGRAM_FOLLOW, label: 'Instagram', icon: <InstagramIcon className="w-6 h-6 text-pink-600"/>, color: 'bg-pink-50 border-pink-100 text-pink-600' },
    { id: TaskType.TIKTOK_FOLLOW, label: 'TikTok', icon: <TikTokIcon className="w-6 h-6 text-black"/>, color: 'bg-gray-100 border-gray-200 text-gray-900' },
    { id: TaskType.TWITTER_FOLLOW, label: 'Twitter', icon: <TwitterIcon className="w-6 h-6 text-sky-500"/>, color: 'bg-sky-50 border-sky-100 text-sky-500' },
    { id: TaskType.LINKEDIN_FOLLOW, label: 'LinkedIn', icon: <LinkedInIcon className="w-6 h-6 text-blue-800"/>, color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { id: TaskType.DISCORD_JOIN, label: 'Discord', icon: <DiscordIcon className="w-6 h-6 text-indigo-600"/>, color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
    { id: TaskType.TELEGRAM_JOIN, label: 'Telegram', icon: <TelegramIcon className="w-6 h-6 text-sky-500"/>, color: 'bg-sky-50 border-sky-100 text-sky-500' },
    { id: TaskType.SNAPCHAT_FOLLOW, label: 'Snapchat', icon: <SnapchatIcon className="w-6 h-6 text-yellow-500"/>, color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
];

const CreateTaskView: React.FC<CreateTaskViewProps> = ({ balance, onCreateTask }) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedTask, setSubmittedTask] = useState<Omit<Task, 'id'> & { quantity: number; totalCost: number; } | null>(null);

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

  if (isSuccess && submittedTask) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto text-center animate-fade-in border border-green-100">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Campaign Launched!</h2>
            <p className="text-slate-500 mb-8">
                Your task is now pending Admin approval. Once approved, it will be live for all users.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-3 mb-8 border border-slate-100">
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Campaign</span>
                    <span className="text-sm font-bold text-slate-900">{submittedTask.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Total Spend</span>
                    <span className="text-sm font-bold text-slate-900">{submittedTask.totalCost.toFixed(2)} Rs</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PENDING</span>
                </div>
            </div>

            <button 
                onClick={handleCreateAnother}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
            >
                Create Another Campaign
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 font-sans animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter font-heading">Pro Campaign Manager</h2>
        <p className="text-slate-500 mt-2 font-medium">Launch high-converting tasks to thousands of real users.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Platform */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-subtle border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">1</span>
                        Select Platform
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {TASK_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                                    form.taskType === cat.id 
                                    ? `${cat.color} shadow-md scale-105` 
                                    : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:bg-white hover:border-gray-200'
                                }`}
                            >
                                {cat.icon}
                                <span className="text-[10px] font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Details */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-subtle border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">2</span>
                        Campaign Details
                    </h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Task Title</label>
                            <input type="text" id="title" value={form.title} onChange={handleChange} className="block w-full p-4 bg-slate-50 border-none rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-slate-300" placeholder="e.g. Subscribe to my Channel" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Target URL</label>
                            <input type="url" id="url" value={form.url} onChange={handleChange} className="block w-full p-4 bg-slate-50 border-none rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-slate-300" placeholder="https://..." required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Instructions</label>
                            <textarea id="description" value={form.description} onChange={handleChange} rows={3} className="block w-full p-4 bg-slate-50 border-none rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-slate-300" placeholder="What should the user do?" required />
                        </div>
                    </div>
                </div>

                {/* Step 3: Budget */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-subtle border border-gray-100 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">3</span>
                        Budget & Reach
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Reward per User</label>
                            <div className="relative">
                                <input type="number" id="reward" value={form.reward} onChange={handleChange} className="block w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all" step="0.1" min="1" required />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">PKR</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Total Users (Qty)</label>
                            <input type="number" id="quantity" value={form.quantity} onChange={handleChange} className="block w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all" min="10" required />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold text-center mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting || totalCost <= 0 || totalCost > balance}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg tracking-wide hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-md"></span>
                    ) : (
                        <>
                            <RocketIcon className="w-6 h-6 text-amber-400" />
                            Launch Campaign
                        </>
                    )}
                </button>
              </form>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
              <div className="sticky top-24">
                  <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <EyeIcon className="w-4 h-4" /> Live Preview
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden group mb-6">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${selectedCategory.color} flex-shrink-0`}>
                              {selectedCategory.icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{selectedCategory.label}</p>
                                      <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">{form.title || "Your Task Title"}</h3>
                                  </div>
                                  <span className="bg-amber-50 text-amber-700 text-xs font-black px-2 py-1 rounded-lg border border-amber-100">
                                      {parseFloat(form.reward || '0').toFixed(1)} Rs
                                  </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{form.description || "User instructions will appear here..."}</p>
                          </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                          <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg opacity-50 cursor-default">
                              Complete Task
                          </button>
                      </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Campaign Cost</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black text-white">{totalCost.toFixed(2)}</span>
                              <span className="text-amber-500 font-bold">Rs</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                              <span className="text-xs font-medium text-slate-400">Wallet Balance</span>
                              <span className={`text-sm font-bold ${balance < totalCost ? 'text-red-400' : 'text-green-400'}`}>
                                  {balance.toFixed(2)} Rs
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CreateTaskView;
