// components/EarnView.tsx
import React, { useState } from 'react';
import type { UserCreatedTask } from '../types';
import { CheckCircleIcon } from './icons';

interface EarnViewProps {
  tasks: UserCreatedTask[];
  onCompleteTask: (userCreatedTaskId: string) => void;
  onTaskView: (userCreatedTaskId: string) => void;
  completedTaskIds: string[];
}

const ProofSubmissionModal: React.FC<{
  task: UserCreatedTask;
  onClose: () => void;
  onSubmit: (taskId: string) => void;
}> = ({ task, onClose, onSubmit }) => {
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (proofFile) {
      onSubmit(task.id);
      alert('Proof submitted! Your reward will be processed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Submit Proof of Completion</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">For task: <span className="font-semibold">{task.title}</span></p>
        </div>
        
        <div className="mb-6">
            <label htmlFor="payment-proof" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Screenshot
            </label>
            <input 
                id="payment-proof"
                type="file"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                required
            />
            {proofFile && <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> File selected: {proofFile.name}</p>}
        </div>

        <div className="flex gap-4">
            <button
                onClick={onClose}
                className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={!proofFile}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Submit Proof
            </button>
        </div>
      </div>
      <style>{`
          @keyframes fade-in {
              0% { opacity: 0; transform: translateY(10px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};


const EarnView: React.FC<EarnViewProps> = ({ tasks, onCompleteTask, onTaskView, completedTaskIds }) => {
  const [taskForProof, setTaskForProof] = useState<UserCreatedTask | null>(null);

  const handleCompleteClick = (task: UserCreatedTask) => {
    // Register the view/click
    onTaskView(task.id);
    // Open the task link in a new tab
    window.open(task.url, '_blank', 'noopener,noreferrer');
    // Open the proof submission modal
    setTaskForProof(task);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">No Tasks Available</h2>
        <p className="text-gray-600 dark:text-gray-300">
          All tasks have been completed. Please check back later for new opportunities!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {taskForProof && (
          <ProofSubmissionModal 
              task={taskForProof}
              onClose={() => setTaskForProof(null)}
              onSubmit={(taskId) => {
                  onCompleteTask(taskId);
                  setTaskForProof(null);
              }}
          />
      )}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Available Tasks</h2>
      {tasks.map(task => {
        const isCompletedByUser = completedTaskIds.includes(task.id);

        return (
            <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-primary-500">{task.type}</span>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{task.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-green-500">{task.reward.toFixed(2)} Rs</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end sm:items-center gap-4">
                {isCompletedByUser ? (
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 py-2 px-6 rounded-md font-semibold w-full sm:w-auto justify-center">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Completed</span>
                    </div>
                ) : (
                    <button
                        onClick={() => handleCompleteClick(task)}
                        className="bg-primary-500 text-white py-2 px-6 rounded-md hover:bg-primary-600 transition-colors w-full sm:w-auto"
                    >
                        Complete Task
                    </button>
                )}
              </div>
            </div>
        );
      })}
    </div>
  );
};

export default EarnView;