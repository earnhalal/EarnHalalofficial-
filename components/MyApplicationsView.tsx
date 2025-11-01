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
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Under Review':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center animate-fade-in-up">
                <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Applications Yet</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    You haven't applied for any jobs. Visit the 'Jobs' section to find opportunities!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Job Application History</h2>
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl shadow-md">
                 <div className="space-y-2">
                    {[...applications].reverse().map((app, index) => (
                        <div 
                            key={app.jobId + app.date} 
                            className="p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{app.jobTitle}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Applied on: {(() => {
                                        const dateRaw = app.date as any;
                                        if (!dateRaw) return 'N/A';
                                        const dateObj = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                                        return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleDateString();
                                    })()}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                    {app.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyApplicationsView;