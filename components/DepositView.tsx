// components/DepositView.tsx
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ClipboardListIcon, CheckCircleIcon, JazzCashIcon, EasyPaisaIcon } from './icons';

type DepositMethod = 'EasyPaisa' | 'JazzCash';

interface DepositViewProps {
  onDeposit: (amount: number, method: DepositMethod, transactionId: string) => Promise<void>;
  transactions: Transaction[];
}

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    if (!status) return null;
    
    const colorClasses = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Completed': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Failed': 'bg-red-100 text-red-800',
    }[status] || 'bg-gray-100 text-gray-800';
    
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {status}
        </span>
    );
}

const DepositView: React.FC<DepositViewProps> = ({ onDeposit, transactions }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [method, setMethod] = useState<DepositMethod>('EasyPaisa');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const depositHistory = useMemo(() => {
    return transactions
        .filter(tx => tx.type === TransactionType.PENDING_DEPOSIT || tx.type === TransactionType.DEPOSIT)
        .sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate().getTime() : 0;
            const dateB = b.date?.toDate ? b.date.toDate().getTime() : 0;
            return dateB - dateA;
        });
  }, [transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        setMessage('Please enter a valid amount.');
        return;
    }
    if (!transactionId.trim()) {
        setMessage('Please enter the transaction ID.');
        return;
    }

    setIsSubmitting(true);
    try {
        await onDeposit(numAmount, method, transactionId);
        
        // Success State
        setMessage(`Deposit request for ${numAmount.toFixed(2)} Rs has been submitted successfully.`);
        setAmount('');
        setTransactionId('');
        setTimeout(() => setMessage(''), 5000);

    } catch (error: any) {
        // Error State
        console.error("[DEPOSIT_VIEW_FAILURE] The deposit operation failed:", error);
        const userMessage = error.message || "An unexpected error occurred. Please check the console and your network connection.";
        setMessage(userMessage);

    } finally {
        // Guarantee that the loading state is turned off
        setIsSubmitting(false);
    }
  };

  const accountDetails = {
      EasyPaisa: { title: 'M-WASEEM', number: '03338739929', icon: <EasyPaisaIcon className="w-6 h-6" /> },
      JazzCash: { title: 'M-WASEEM', number: '03001234567', icon: <JazzCashIcon className="w-6 h-6" /> } // Placeholder for JazzCash
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
      
      {/* Left Column: Form and Instructions */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-subtle-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Instructions</h2>
            <p className="text-sm text-gray-500 mb-4">Min: 100 Rs • Max: 50,000 Rs</p>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Select Method</label>
                <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(accountDetails) as DepositMethod[]).map(methodKey => (
                         <button
                            key={methodKey}
                            onClick={() => setMethod(methodKey)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                                method === methodKey ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 bg-white hover:border-primary-400'
                            }`}
                         >
                             {accountDetails[methodKey].icon}
                             <span className="font-semibold text-sm text-gray-800">{methodKey}</span>
                         </button>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                <p className="text-gray-700 flex justify-between"><strong>Account Title:</strong> <span className="font-mono text-gray-800">{accountDetails[method].title}</span></p>
                <p className="text-gray-700 flex justify-between"><strong>Account Number:</strong> <span className="font-mono text-gray-800">{accountDetails[method].number}</span></p>
                <p className="text-gray-700 flex justify-between"><strong>Service:</strong> <span className="font-mono text-gray-800">{method}</span></p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-subtle-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Submit Your Deposit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount Sent (Rs)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50" placeholder="e.g., 1000" required />
                </div>
                <div>
                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">{method} Transaction ID</label>
                    <input type="text" id="transactionId" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-50" placeholder="e.g., 12345678901" required />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center">
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Submitting...
                        </>
                    ) : 'Submit Request'}
                </button>
                {message && <p className={`text-center text-sm mt-2 ${message.includes('error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            </form>
        </div>
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-3">
        <div className="bg-white p-6 rounded-xl shadow-subtle-md h-full border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                 <ClipboardListIcon className="w-7 h-7 text-primary-600"/>
                 <h2 className="text-2xl font-bold text-gray-900">Deposit History</h2>
            </div>
           
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {depositHistory.length > 0 ? depositHistory.map(tx => (
                    <div key={tx.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-800">{tx.description}</p>
                            <p className="text-xs text-gray-500">
                                {tx.date?.toDate ? tx.date.toDate().toLocaleString() : 'Date pending'}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg text-green-600">+{tx.amount.toFixed(2)} Rs</p>
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