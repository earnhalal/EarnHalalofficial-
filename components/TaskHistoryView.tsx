
import React from 'react';
import type { UserCreatedTask } from '../types';

interface TaskHistoryViewProps {
    userTasks: UserCreatedTask[];
}

const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({ userTasks }) => {
    if (userTasks.length === 0) {
        return (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Campaigns</h2>
                <p className="text-gray-500 mb-6">You haven't created any tasks yet. Launch a new campaign to start reaching users.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-subtle border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Performance</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{userTasks.length} Total Campaigns</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Campaign</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Budget Used</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Remaining</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {userTasks.map(task => {
                            const completionPercentage = task.quantity > 0 ? (task.completions / task.quantity) * 100 : 0;
                            const totalBudget = task.reward * task.quantity;
                            const spent = task.reward * task.completions;
                            const remaining = totalBudget - spent;

                            return (
                                <tr key={task.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <th scope="row" className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold">{task.title}</span>
                                            <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1 w-fit">{task.type}</span>
                                        </div>
                                    </th>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                                            task.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            task.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            task.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-700">{task.completions} / {task.quantity}</span>
                                                <span className="text-xs font-bold text-blue-600">{completionPercentage.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="font-bold text-slate-700">{spent.toFixed(0)} Rs</span>
                                        <span className="block text-[10px] text-gray-400">of {totalBudget.toFixed(0)}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`font-bold ${remaining < totalBudget * 0.2 ? 'text-red-500' : 'text-green-600'}`}>
                                            {remaining.toFixed(0)} Rs
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskHistoryView;
