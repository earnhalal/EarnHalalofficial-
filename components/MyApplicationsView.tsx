// components/MyApplicationsView.tsx
import React from 'react';
import type { Application } from '../types';
import { BriefcaseIcon } from './icons';

interface MyApplicationsViewProps {
    applications: Application[];
}

const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({ applications }) => {
    
    const getStatusColor = (status: Application['status']) => {
        switch (status) {
            case 'Submitted':
                return 'bg-blue-900 text-blue-300';
            case 'Under Review':
                return 'bg-yellow-900 text-yellow-300';
            case 'Rejected':
                return 'bg-red-900 text-red-300';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    if (applications.length === 0) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-md text-center animate-fade-in-up">
                <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-100 mb-2">No Applications Yet</h2>
                <p className="text-gray-300">
                    You haven't applied for any jobs. Visit the 'Jobs' section to find opportunities!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-100">My Job Application History</h2>
            <div className="bg-gray-800 p-2 sm:p-4 rounded-xl shadow-md">
                 <div className="space-y-2">
                    {[...applications].reverse().map((app, index) => (
                        <div 
                            key={app.id || `${app.jobId}-${index}`}
                            className="p-4 rounded-lg transition-colors hover:bg-gray-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div>
                                <p className="font-bold text-lg text-gray-100">{app.jobTitle}</p>
                                <p className="text-sm text-gray-400">
                                    Applied on: {(() => {
                                        const dateRaw = app.date as any;
                                        if (!dateRaw) return 'N/A';
                                        const dateObj = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                                        return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleString();
                                    })()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                {app.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyApplicationsView;