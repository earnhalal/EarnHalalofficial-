// components/EarnView.tsx
import React, { useState } from 'react';
import type { UserCreatedTask } from '../types';
import { CheckCircleIcon } from './icons';

interface ProofSubmissionModalProps {
  task: UserCreatedTask;
  onClose: () => void;
  onSubmit: (taskId: string) => void;
}

const ProofSubmissionModal: React.FC<ProofSubmissionModalProps> = ({ task, onClose, onSubmit }) => {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = () => {
    if (proofFile) {
        setSubmissionState('submitting');
        // Simulate network delay
        setTimeout(() => {
            onSubmit(task.id);
            setSubmissionState('success');
        }, 1500);
    }
  };
  
  const SuccessView = () => (
     <div className="text-center">
        <style>{`
            .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
            .checkmark { stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
            @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        `}</style>
        <svg className="w-24 h-24 mx-auto mb-4" viewBox="0 0 52 52">
            <circle className="checkmark-circle text-primary-100" cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
            <path className="checkmark text-primary-500" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proof Submitted!</h2>
        <p className="text-gray-600 mb-6">Your reward of <span className="font-bold text-accent-600">{task.reward.toFixed(2)} Rs</span> will be processed shortly.</p>
        <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
            Done
        </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {submissionState === 'success' ? <SuccessView /> : (
            <>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Proof of Completion</h2>
                    <p className="text-gray-600 mb-6">For task: <span className="font-semibold">{task.title}</span></p>
                </div>
                
                <div className="mb-6">
                    <label 
                        htmlFor="payment-proof" 
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="font-semibold text-primary-600">Upload Screenshot</span>
                        <span className="text-xs text-gray-500">Click or drag file here</span>
                    </label>
                    <input 
                        id="payment-proof"
                        type="file"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                        required
                    />
                    {proofFile && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircleIcon className="w-4 h-4" /> File selected: {proofFile.name}</p>}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={submissionState === 'submitting'}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!proofFile || submissionState === 'submitting'}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {submissionState === 'submitting' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : 'Submit Proof'}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

interface EarnViewProps {
  tasks: UserCreatedTask[];
  onCompleteTask: (taskId: string) => void;
  onTaskView: (taskId: string) => void;
  completedTaskIds: string[];
}

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
      <div className="bg-white p-8 rounded-xl shadow-subtle text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tasks Available</h2>
        <p className="text-gray-600">
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
                  // The modal now handles its own closing after success animation
              }}
          />
      )}
      <h2 className="text-3xl font-bold text-gray-900">Available Tasks</h2>
      {tasks.map((task, index) => {
        const isCompletedByUser = completedTaskIds.includes(task.id);

        return (
            <div 
                key={task.id} 
                className="bg-white p-4 sm:p-6 rounded-xl shadow-subtle transition-all duration-300 hover:shadow-subtle-md hover:-translate-y-1 animate-fade-in-up border border-gray-200"
                style={{ animationDelay: `${index * 75}ms`}}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-primary-600">{task.type}</span>
                  <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold font-numeric text-accent-600">{task.reward.toFixed(2)} Rs</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end sm:items-center gap-4">
                {isCompletedByUser ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 py-2 px-6 rounded-md font-semibold w-full sm:w-auto justify-center">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Completed</span>
                    </div>
                ) : (
                    <button
                        onClick={() => handleCompleteClick(task)}
                        className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto shadow-sm hover:shadow-md"
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