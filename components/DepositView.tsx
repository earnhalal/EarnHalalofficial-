// components/DepositView.tsx
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ClipboardListIcon, CheckCircleIcon, DocumentArrowUpIcon } from './icons';

interface DepositViewProps {
  onDeposit: (amount: number, transactionId: string) => void;
  transactions: Transaction[];
}

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    if (!status) return null;
    
    const colorClasses = {
        'Pending': 'bg-yellow-500/20 text-yellow-300',
        'Approved': 'bg-green-500/20 text-green-300',
        'Completed': 'bg-green-500/20 text-green-300',
        'Rejected': 'bg-red-500/20 text-red-400',
        'Failed': 'bg-red-500/20 text-red-400',
    }[status] || 'bg-gray-500/20 text-gray-300';
    
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {status}
        </span>
    );
}

const DepositView: React.FC<DepositViewProps> = ({ onDeposit, transactions }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  
  const depositHistory = useMemo(() => {
    return transactions
        .filter(tx => tx.type === TransactionType.PENDING_DEPOSIT)
        .sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate().getTime() : 0;
            const dateB = b.date?.toDate ? b.date.toDate().getTime() : 0;
            return dateB - dateA;
        });
  }, [transactions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !transactionId || !file) {
        setMessage('Please fill all fields and upload a proof of payment.');
        return;
    }
    onDeposit(numAmount, transactionId);
    setMessage(`Deposit request for ${numAmount.toFixed(2)} Rs has been submitted successfully.`);
    setAmount('');
    setTransactionId('');
    setFile(null);
    const fileInput = document.getElementById('payment-proof') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
      
      {/* Left Column: Form and Instructions */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Deposit Instructions</h2>
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
              <p className="text-gray-300 flex justify-between"><strong>Account Title:</strong> <span className="font-mono">M-WASEEM</span></p>
              <p className="text-gray-300 flex justify-between"><strong>Account Number:</strong> <span className="font-mono">03338739929</span></p>
              <p className="text-gray-300 flex justify-between"><strong>Bank / Service:</strong> <span className="font-mono">EasyPaisa</span></p>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Submit Your Deposit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount (Rs)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white" placeholder="e.g., 1000" required />
                </div>
                <div>
                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300">Easypaisa Transaction ID</label>
                    <input type="text" id="transactionId" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white" placeholder="e.g., 12345678901" required />
                </div>
                 <div>
                    <label 
                        htmlFor="payment-proof" 
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                         <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="font-semibold text-primary-400">Upload Screenshot</span>
                        <span className="text-xs text-gray-500">Click or drag file here</span>
                    </label>
                    <input 
                        id="payment-proof"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                    />
                    {file && <p className="text-xs text-green-400 mt-2 flex items-center justify-center gap-1"><CheckCircleIcon className="w-4 h-4" /> File selected: {file.name}</p>}
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400">
                    Submit Request
                </button>
                {message && <p className="text-center text-sm text-green-400 mt-2">{message}</p>}
            </form>
        </div>
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-3">
        <div className="bg-gray-800 p-6 rounded-xl shadow-md h-full">
            <div className="flex items-center gap-3 mb-4">
                 <ClipboardListIcon className="w-7 h-7 text-primary-400"/>
                 <h2 className="text-2xl font-bold text-gray-100">Deposit History</h2>
            </div>
           
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {depositHistory.length > 0 ? depositHistory.map(tx => (
                    <div key={tx.id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-100">{tx.description}</p>
                            <p className="text-xs text-gray-400">
                                {tx.date?.toDate ? tx.date.toDate().toLocaleString() : 'Date pending'}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg text-accent-400">+{tx.amount.toFixed(2)} Rs</p>
                             <StatusBadge status={tx.status} />
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 text-gray-500">
                        <p>Your pending deposits will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DepositView;