// components/SocialGroupsView.tsx
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { SocialGroup } from '../types';
import { PlusCircleIcon, CloseIcon, WhatsAppIcon, FacebookIcon, UserGroupIcon } from './icons';

interface SocialGroupsViewProps {
    allGroups: SocialGroup[];
    myGroups: SocialGroup[];
    onSubmitGroup: (groupData: { url: string; title: string; description: string; category: SocialGroup['category'] }) => void;
}

const categories: SocialGroup['category'][] = ['Study', 'Dating', 'Gaming', 'Movies', 'News', 'Funny', 'Videos', 'Sad Statuses', 'Tech', 'Prompts', 'Other'];

// --- Submission Modal ---
const SubmissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (groupData: { url: string; title: string; description: string; category: SocialGroup['category'] }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<SocialGroup['category']>('Other');
    const [error, setError] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const resetForm = () => {
        setUrl(''); setTitle(''); setDescription(''); setCategory('Other'); setError(''); setIsFetching(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleUrlBlur = async () => {
        if (!url.trim()) return;

        // 1. Basic URL validation
        const supportedPatterns = /^(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|facebook\.com\/(groups|pages)|t\.me|telegram\.me|tiktok\.com)\/.+$/;
        if (!supportedPatterns.test(url)) {
            setError("Invalid link. Please use a valid WhatsApp, Facebook, Telegram, or TikTok group link.");
            return;
        }
        setError('');
        setIsFetching(true);

        // 2. Use Gemini to suggest a title
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Based on this social group URL, suggest a short, clean, and appropriate title for it. Example: for '.../ForexTradingPK', respond 'Forex Trading PK'. For '.../FunnyVideos', respond 'Funny Videos'. URL is: ${url}. Respond with ONLY the title text, nothing else.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setTitle(response.text.trim());
        } catch (e) {
            console.error("AI title suggestion failed:", e);
            setError("Could not auto-fetch title. Please enter one manually.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = () => {
        if (!url.trim() || !title.trim()) {
            setError('Group Link and Title are required.');
            return;
        }
        if (error.includes("Invalid link")) return;
        
        setError('');
        onSubmit({ url, title, description, category });
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Share a Group</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">Group Link</label>
                        <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} onBlur={handleUrlBlur} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900" placeholder="https://chat.whatsapp.com/..." />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <div className="relative">
                           <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900" placeholder="e.g., Best Study Group" />
                           {isFetching && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-t-emerald-600 border-gray-300"></div>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900" placeholder="A short description of the group's purpose."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as SocialGroup['category'])} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                    <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700">Submit for Review</button>
                </div>
            </div>
        </div>
    );
};


const GroupCard: React.FC<{ group: SocialGroup }> = ({ group }) => {
    const getIcon = useMemo(() => {
        if (group.url.includes('whatsapp.com') || group.url.includes('wa.me')) return <WhatsAppIcon className="w-6 h-6" />;
        if (group.url.includes('facebook.com')) return <FacebookIcon className="w-6 h-6" />;
        return <UserGroupIcon className="w-6 h-6" />; // Default/Telegram/etc.
    }, [group.url]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-gray-100 rounded-full text-emerald-600 flex-shrink-0">{getIcon}</div>
                <div className="overflow-hidden">
                    <p className="font-bold text-gray-800 truncate" title={group.title}>{group.title}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">{group.category}</span>
                </div>
            </div>
            <a href={group.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-emerald-700 whitespace-nowrap">Join</a>
        </div>
    );
};

const MySubmissionCard: React.FC<{ group: SocialGroup }> = ({ group }) => {
    const statusConfig = {
        pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
        rejected: { text: 'Rejected', color: 'bg-red-100 text-red-700' },
    };
    const { text, color } = statusConfig[group.status];
    const date = group.submittedAt?.toDate ? group.submittedAt.toDate() : null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
                <div className="overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate" title={group.title}>{group.title}</p>
                    <p className="text-xs text-gray-500">{date ? date.toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${color} whitespace-nowrap`}>{text}</span>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-6 py-2 rounded-full font-semibold transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
        {label}
    </button>
);


const SocialGroupsView: React.FC<SocialGroupsViewProps> = ({ allGroups, myGroups, onSubmitGroup }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
    
    return (
        <div className="max-w-4xl mx-auto p-4">
            <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={onSubmitGroup} />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Social Groups</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors">
                    <PlusCircleIcon className="w-6 h-6" />
                    <span>Share a Group</span>
                </button>
            </div>
            <p className="text-gray-500 mb-6 text-center sm:text-left">Browse groups shared by the community or submit your own. All submissions are reviewed by our team.</p>

            <div className="flex justify-center sm:justify-start gap-2 p-1.5 bg-gray-100 rounded-full mb-6 w-full sm:w-auto">
                <TabButton label="All Groups" isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                <TabButton label="My Submissions" isActive={activeTab === 'mine'} onClick={() => setActiveTab('mine')} />
            </div>

            <div className="space-y-4">
                {activeTab === 'all' && (
                    allGroups.length > 0
                        ? allGroups.map(group => <GroupCard key={group.id} group={group} />)
                        : <div className="text-center text-gray-500 py-10"><p>No groups have been approved yet. Check back soon!</p></div>
                )}
                {activeTab === 'mine' && (
                    myGroups.length > 0
                        ? myGroups.map(group => <MySubmissionCard key={group.id} group={group} />)
                        : <div className="text-center text-gray-500 py-10"><p>You haven't submitted any groups yet.</p></div>
                )}
            </div>
        </div>
    );
};

export default SocialGroupsView;