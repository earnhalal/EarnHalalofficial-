
import React, { useState } from 'react';
import type { Job } from '../types';
import { BriefcaseIcon, CheckCircleIcon, StarIcon } from './icons';

interface PostJobViewProps {
    balance: number;
    onPostJob: (jobData: Omit<Job, 'id' | 'postedAt'>, cost: number) => void;
}

const PostJobView: React.FC<PostJobViewProps> = ({ balance, onPostJob }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [type, setType] = useState('Full-time');
    const [isPremium, setIsPremium] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const baseCost = 500;
    const premiumCost = 1000;
    const totalCost = isPremium ? baseCost + premiumCost : baseCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (balance < totalCost) {
            alert("Insufficient balance to post this job.");
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        onPostJob({
            title,
            description,
            salary,
            type,
            isPremium
        }, totalCost);

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleCreateAnother = () => {
        setTitle('');
        setDescription('');
        setSalary('');
        setType('Full-time');
        setIsPremium(false);
        setIsSuccess(false);
    };

    if (isSuccess) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto text-center animate-fade-in border border-green-100 mt-10">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Job Posted Successfully!</h2>
                <p className="text-slate-500 mb-8">
                    Your job listing is now live and visible to thousands of qualified candidates.
                </p>
                <button 
                    onClick={handleCreateAnother}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                    Post Another Job
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Post a New Job</h2>
                <p className="text-slate-500 mt-2">Create a listing to hire the best talent from our pool.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-subtle border border-gray-100 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full p-4 bg-slate-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400" 
                                placeholder="e.g. Senior Data Entry Specialist" 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                                <select 
                                    value={type} 
                                    onChange={e => setType(e.target.value)} 
                                    className="w-full p-4 bg-slate-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Freelance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Salary Range</label>
                                <input 
                                    type="text" 
                                    value={salary} 
                                    onChange={e => setSalary(e.target.value)} 
                                    className="w-full p-4 bg-slate-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400" 
                                    placeholder="e.g. 30k - 50k PKR" 
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description & Requirements</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                rows={6} 
                                className="w-full p-4 bg-slate-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400" 
                                placeholder="Describe the role, responsibilities, and required skills..." 
                                required 
                            />
                        </div>

                        <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isPremium ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white hover:border-gray-200'}`} onClick={() => setIsPremium(!isPremium)}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isPremium ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
                                {isPremium && <CheckCircleIcon className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    Premium Listing <StarIcon className="w-4 h-4 text-amber-500" />
                                </h4>
                                <p className="text-xs text-slate-500">Get 3x more applicants and a verified badge.</p>
                            </div>
                            <span className="font-bold text-slate-900">+1000 Rs</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting || balance < totalCost}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Job Now'}
                        </button>
                    </form>
                </div>

                {/* Cost Summary Side Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl sticky top-24">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <BriefcaseIcon className="w-5 h-5 text-blue-400" /> Summary
                        </h3>
                        
                        <div className="space-y-4 mb-6 border-b border-white/10 pb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Standard Post Fee</span>
                                <span className="font-bold">{baseCost} Rs</span>
                            </div>
                            {isPremium && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-400">Premium Upgrade</span>
                                    <span className="font-bold text-amber-400">{premiumCost} Rs</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300 font-bold">Total Cost</span>
                            <span className="text-2xl font-black text-white">{totalCost} Rs</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Wallet Balance</span>
                            <span className={`${balance < totalCost ? 'text-red-400' : 'text-green-400'} font-bold`}>{balance.toFixed(2)} Rs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostJobView;
