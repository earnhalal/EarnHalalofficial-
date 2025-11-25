
// components/AdsInfoViews.tsx
import React from 'react';
import { CheckCircleIcon, TargetIcon, MegaphoneIcon, ShieldCheck, DocumentTextIcon } from './icons';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-4xl mx-auto animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b border-gray-100">{title}</h2>
        <div className="space-y-6 text-slate-700 leading-relaxed">
            {children}
        </div>
    </div>
);

export const AdsGuideView: React.FC = () => (
    <InfoCard title="How to Run Ads on TaskMint">
        <div className="prose prose-slate max-w-none">
            <p className="text-lg font-medium text-slate-600">
                TaskMint provides a powerful platform to reach thousands of real, active users. Follow these steps to launch your first campaign.
            </p>

            <div className="grid gap-6 mt-8">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Deposit Funds</h4>
                        <p className="text-sm text-slate-600 mt-1">Go to your Business Console wallet and add funds via JazzCash, EasyPaisa, or Bank Transfer. Funds are verified within 1-2 hours.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Create Campaign</h4>
                        <p className="text-sm text-slate-600 mt-1">Click "Create Ad". Select your objective (e.g., Website Visits, YouTube Subscribers). Enter your target URL and set the reward amount per user.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Set Budget & Launch</h4>
                        <p className="text-sm text-slate-600 mt-1">Define how many users you want to reach (e.g., 1000 users). The total cost will be calculated. Submit for review.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">4</div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Approval & Tracking</h4>
                        <p className="text-sm text-slate-600 mt-1">Our team approves valid campaigns within 24 hours. Once live, track real-time conversions in your Dashboard.</p>
                    </div>
                </div>
            </div>
        </div>
    </InfoCard>
);

export const AdsPolicyView: React.FC = () => (
    <InfoCard title="Advertising Privacy Policy">
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                    <h4 className="font-bold text-slate-900">Data Protection</h4>
                    <p className="text-sm text-slate-600">We do not share your personal business details with users. Users only see the public content of your campaign (Title, URL, Description).</p>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <TargetIcon className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                    <h4 className="font-bold text-slate-900">Prohibited Content</h4>
                    <p className="text-sm text-slate-600">Ads promoting gambling, adult content, hate speech, or scams are strictly prohibited. Accounts violating this will be banned without refund.</p>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                    <h4 className="font-bold text-slate-900">Refund Policy</h4>
                    <p className="text-sm text-slate-600">Deposited funds can be refunded to your main wallet if a campaign is rejected. However, funds spent on active campaigns where users have already completed tasks are non-refundable.</p>
                </div>
            </div>
            
            <p className="text-sm text-slate-500 mt-4 italic border-t pt-4">Last Updated: August 2024</p>
        </div>
    </InfoCard>
);
