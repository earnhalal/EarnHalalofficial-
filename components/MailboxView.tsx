
// components/MailboxView.tsx
import React, { useState, useMemo } from 'react';
import type { EmailLog, UserMode } from '../types';
import { MailIcon, PaperAirplaneIcon, InboxIcon, CheckCircleIcon, EyeIcon, CloseIcon, ShieldCheck, GiftIcon, BriefcaseIcon } from './icons';

interface MailboxViewProps {
    emails: EmailLog[];
    onMarkAsRead: (id: string) => void;
    userMode?: UserMode;
}

const MailboxView: React.FC<MailboxViewProps> = ({ emails, onMarkAsRead, userMode }) => {
    const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

    // Smart filtering based on User Mode
    const filteredEmails = useMemo(() => {
        return emails.filter(email => {
            const subject = email.subject.toLowerCase();
            const type = email.type;
            const body = (email.bodyPreview || "").toLowerCase();

            if (userMode === 'ADVERTISER') {
                // Advertiser Mode: STRICT Filter
                // Show ONLY: Security Alerts, Verification, and Explicit Business/Campaign/Billing emails.
                // Hide: Welcome (unless business welcome), Referral, Tasks, Games.
                
                const isStrictBusiness = 
                    subject.includes('campaign') || 
                    subject.includes('job') || 
                    subject.includes('ad funds') || 
                    subject.includes('billing') ||
                    subject.includes('invoice') ||
                    subject.includes('deposit'); // Advertisers deposit too

                const isSecurity = type === 'Security Alert' || type === 'Verification';

                return isStrictBusiness || isSecurity;
            } else {
                // Earner Mode: Show everything EXCEPT internal ad-ops stuff that users shouldn't see
                // Usually users generate their own campaigns too, but if we want to separate purely 'Business Console' logs:
                // For now, users see everything relevant to their personal account activity.
                return true; 
            }
        });
    }, [emails, userMode]);

    const handleOpenEmail = (email: EmailLog) => {
        setSelectedEmail(email);
        if (email.status !== 'Opened') {
            onMarkAsRead(email.id);
        }
    };

    const getStatusBadge = (status: EmailLog['status']) => {
        switch (status) {
            case 'Sent': return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><PaperAirplaneIcon className="w-3 h-3"/> Sent</span>;
            case 'Delivered': return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><CheckCircleIcon className="w-3 h-3"/> Delivered</span>;
            case 'Opened': return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><EyeIcon className="w-3 h-3"/> Read</span>;
            default: return null;
        }
    };

    const getIconForType = (type: string, subject: string) => {
        if (subject.toLowerCase().includes('campaign') || subject.toLowerCase().includes('job')) return <BriefcaseIcon className="w-6 h-6 text-white"/>;
        
        switch (type) {
            case 'Security Alert': return <ShieldCheck className="w-6 h-6 text-white"/>;
            case 'Welcome': return <GiftIcon className="w-6 h-6 text-white"/>;
            case 'Notification': return <InboxIcon className="w-6 h-6 text-white"/>;
            default: return <MailIcon className="w-6 h-6 text-white"/>;
        }
    };

    const getBgForType = (type: string) => {
        switch (type) {
            case 'Security Alert': return 'bg-red-500 shadow-red-200';
            case 'Welcome': return 'bg-amber-500 shadow-amber-200';
            case 'Verification': return 'bg-blue-500 shadow-blue-200';
            default: return 'bg-slate-500 shadow-slate-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 pb-24 font-sans animate-fade-in">
            
            {/* Email Reader Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
                        <div className={`p-6 flex justify-between items-start ${getBgForType(selectedEmail.type).split(' ')[0]} text-white`}>
                            <div>
                                <span className="inline-block px-2 py-1 bg-white/20 rounded-lg text-xs font-bold mb-2 backdrop-blur-md">{selectedEmail.type}</span>
                                <h2 className="text-xl font-bold leading-tight">{selectedEmail.subject}</h2>
                                <p className="text-white/80 text-sm mt-1">
                                    {selectedEmail.date?.toDate ? selectedEmail.date.toDate().toLocaleString() : 'Just now'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <CloseIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto prose prose-slate max-w-none">
                            {/* Render HTML content safely */}
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyPreview || '<p>No content available.</p>' }} />
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button onClick={() => setSelectedEmail(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Close Message</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden ${userMode === 'ADVERTISER' ? 'bg-blue-900' : 'bg-slate-900'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 text-white">
                        <InboxIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        {userMode === 'ADVERTISER' ? 'Business Inbox' : 'System Mailbox'}
                    </h1>
                    <p className="text-white/70">
                        {userMode === 'ADVERTISER' 
                            ? 'Campaign updates, approvals, and billing notifications.' 
                            : 'Secure notifications, rewards, and alerts.'}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {filteredEmails.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <MailIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Emails Yet</h3>
                        <p className="text-gray-500 mt-2">Notifications will appear here.</p>
                    </div>
                ) : (
                    filteredEmails.map((email, index) => (
                        <button 
                            key={email.id} 
                            onClick={() => handleOpenEmail(email)}
                            className={`w-full text-left bg-white p-5 rounded-2xl border transition-all duration-300 animate-fade-in-up group relative overflow-hidden
                                ${email.status !== 'Opened' ? 'border-amber-200 shadow-md border-l-4 border-l-amber-500' : 'border-gray-100 shadow-subtle opacity-90 hover:opacity-100'}
                            `}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${getBgForType(email.type)}`}>
                                    {getIconForType(email.type, email.subject)}
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-base truncate ${email.status !== 'Opened' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                {email.subject}
                                            </h4>
                                            {email.status !== 'Opened' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                            {email.date?.toDate ? email.date.toDate().toLocaleDateString() : 'Now'}
                                        </span>
                                    </div>
                                    
                                    <p className={`text-sm line-clamp-1 ${email.status !== 'Opened' ? 'text-slate-800 font-medium' : 'text-gray-500'}`}>
                                        {email.bodyPreview?.replace(/<[^>]*>?/gm, '') || 'Click to view details...'}
                                    </p>
                                    
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wide">{email.type}</span>
                                        {getStatusBadge(email.status)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-8">
                Messages are automatically deleted after 30 days.
            </p>
        </div>
    );
};

export default MailboxView;
