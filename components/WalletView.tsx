// components/WalletView.tsx
import React, { useState, useEffect } from 'react';
import type { Transaction, WithdrawalDetails } from '../types';
import { TransactionType } from '../types';
import { WalletIcon, CheckCircleIcon } from './icons';

interface WalletViewProps {
  balance: number;
  pendingRewards: number;
  transactions: Transaction[];
  username: string;
  onWithdraw: (amount: number, details: WithdrawalDetails) => void;
  savedDetails: WithdrawalDetails | null;
  hasPin: boolean;
  onSetupPin: () => void;
}

type Method = 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';

const WalletView: React.FC<WalletViewProps> = ({ balance, pendingRewards, transactions, username, onWithdraw, savedDetails, hasPin, onSetupPin }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
      if (savedDetails) {
          setAccountName(savedDetails.accountName);
          setAccountNumber(savedDetails.accountNumber);
          setBankName(savedDetails.bankName || '');
      }
  }, [savedDetails]);

  const handleMethodSelect = (method: Method) => {
    setSelectedMethod(method);
    setMessage('');
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }
    if (numAmount > balance) {
      setMessage('Insufficient balance.');
      return;
    }
    if (!accountName || !accountNumber || !selectedMethod) {
        setMessage('Account details are required.');
        return;
    }
     if (selectedMethod === 'Bank Transfer' && !bankName) {
        setMessage('Bank name is required for bank transfers.');
        return;
    }

    const details: WithdrawalDetails = {
      method: selectedMethod,
      accountName,
      accountNumber,
      ...(selectedMethod === 'Bank Transfer' && { bankName }),
    };

    onWithdraw(numAmount, details);
    setMessage(`Withdrawal request for ${numAmount.toFixed(2)} Rs submitted.`);
    setAmount('');
    // Optionally clear form or keep details
  };
  
  const getTransactionColor = (type: TransactionType) => {
    // ... (same as before)
  }
  
  // ... (handleDownloadReceipt logic is unchanged)
  const handleDownloadReceipt = (tx: Transaction) => {
    // This function can remain as it is.
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        
        {/* Balance Card */}
        <div className="relative p-6 rounded-2xl shadow-lg text-white bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full"></div>
             <p className="text-slate-300">Total Balance</p>
             <p className="text-5xl font-extrabold my-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500" style={{filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.5))'}}>
                {balance.toFixed(2)}
             </p>
             <p className="font-semibold">Rs</p>
             <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                <span className="text-slate-400">Pending Rewards</span>
                <span className="font-bold text-amber-400">{pendingRewards.toFixed(2)} Rs</span>
             </div>
        </div>
        
        {/* Security PIN Setup */}
        {!hasPin && (
             <div className="bg-primary-50 dark:bg-slate-700/50 p-4 rounded-xl shadow-md text-center">
                <h4 className="font-bold text-primary-800 dark:text-primary-200">Enhance Your Security</h4>
                <p className="text-sm text-primary-700 dark:text-primary-300 my-2">Protect your wallet with a 4-digit PIN for withdrawals.</p>
                <button onClick={onSetupPin} className="bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary-600">
                    Set Up PIN
                </button>
            </div>
        )}

        {/* Withdrawal Options */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Request Withdrawal</h3>
            <div className="space-y-3">
              <button onClick={() => handleMethodSelect('JazzCash')} className={`w-full p-4 rounded-lg border-2 transition-all ${selectedMethod === 'JazzCash' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'}`}>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Withdraw via JazzCash</span>
              </button>
              <button onClick={() => handleMethodSelect('EasyPaisa')} className={`w-full p-4 rounded-lg border-2 transition-all ${selectedMethod === 'EasyPaisa' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'}`}>
                 <span className="font-semibold text-slate-700 dark:text-slate-200">Withdraw via EasyPaisa</span>
              </button>
              <button onClick={() => handleMethodSelect('Bank Transfer')} className={`w-full p-4 rounded-lg border-2 transition-all ${selectedMethod === 'Bank Transfer' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'}`}>
                 <span className="font-semibold text-slate-700 dark:text-slate-200">Withdraw via Bank</span>
              </button>
            </div>
        </div>

        {/* Withdrawal Form */}
        {selectedMethod && (
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Enter Details for {selectedMethod}</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (Rs)</label>
                      <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="e.g., 500" required />
                  </div>
                  <div>
                      <label htmlFor="accountName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account Holder Name</label>
                      <input type="text" id="accountName" value={accountName} onChange={e => setAccountName(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="e.g., John Doe" required />
                  </div>
                  <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account Number</label>
                      <input type="text" id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="e.g., 03001234567" required />
                  </div>
                  {selectedMethod === 'Bank Transfer' && (
                      <div>
                          <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bank Name</label>
                          <input type="text" id="bankName" value={bankName} onChange={e => setBankName(e.target.value)} className="mt-1 block w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="e.g., HBL" required />
                      </div>
                  )}
                  <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700">
                      Submit Request
                  </button>
                  {message && <p className={`text-sm text-center mt-2 ${message.includes('submitted') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
              </form>
            </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transaction History</h3>
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
            {transactions.length > 0 ? (
                [...transactions].reverse().map(tx => (
                    <div key={tx.id} className="p-3 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{tx.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleString()}</p>
                        </div>
                        <p className={`font-bold whitespace-nowrap ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} Rs
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No transactions yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
