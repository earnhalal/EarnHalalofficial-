// components/WalletView.tsx
import React, { useState, useEffect } from 'react';
import type { Transaction, WithdrawalDetails } from '../types';
import { TransactionType } from '../types';
import {
  WalletIcon, PencilSquareIcon, BankIcon, NayaPayIcon,
  SadaPayIcon, UPaisaIcon, JazzCashIcon, EasyPaisaIcon
} from './icons';

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

type Method = 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'NayaPay' | 'SadaPay' | 'UPaisa';

const paymentMethods: { id: Method; name: string; icon: React.ReactNode }[] = [
    { id: 'JazzCash', name: 'JazzCash', icon: <JazzCashIcon className="w-8 h-8"/> },
    { id: 'EasyPaisa', name: 'EasyPaisa', icon: <EasyPaisaIcon className="w-8 h-8"/> },
    { id: 'NayaPay', name: 'NayaPay', icon: <NayaPayIcon className="w-8 h-8"/> },
    { id: 'SadaPay', name: 'SadaPay', icon: <SadaPayIcon className="w-8 h-8"/> },
    { id: 'UPaisa', name: 'UPaisa', icon: <UPaisaIcon className="w-8 h-8"/> },
    { id: 'Bank Transfer', name: 'Bank Transfer', icon: <BankIcon className="w-8 h-8"/> },
];

const WalletView: React.FC<WalletViewProps> = ({ balance, pendingRewards, transactions, username, onWithdraw, savedDetails, hasPin, onSetupPin }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(savedDetails?.method || null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [message, setMessage] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(!savedDetails);

  useEffect(() => {
      if (savedDetails && !isEditingDetails) {
          setSelectedMethod(savedDetails.method);
          setAccountName(savedDetails.accountName);
          setAccountNumber(savedDetails.accountNumber);
          setBankName(savedDetails.bankName || '');
      } else if (isEditingDetails) {
          setAccountName('');
          setAccountNumber('');
          setBankName('');
      }
  }, [savedDetails, isEditingDetails]);
  
  const handleUseDifferentAccount = () => {
    setIsEditingDetails(true);
    setSelectedMethod(null);
    setMessage('');
  };

  const handleMethodSelect = (method: Method) => {
    setSelectedMethod(method);
    setMessage('');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setMessage('Please enter a valid amount.'); return; }
    if (numAmount < 1000) { setMessage('Minimum withdrawal amount is 1000 Rs.'); return; }
    if (numAmount > balance) { setMessage('Insufficient balance.'); return; }
    if (!selectedMethod) { setMessage('Please select a withdrawal method.'); return; }
    if (!accountName || !accountNumber) { setMessage('Account name and number are required.'); return; }
    if (selectedMethod === 'Bank Transfer' && !bankName) { setMessage('Bank name is required for bank transfers.'); return; }

    const details: WithdrawalDetails = {
      method: selectedMethod,
      accountName,
      accountNumber,
      ...(selectedMethod === 'Bank Transfer' && { bankName }),
    };

    onWithdraw(numAmount, details);
    setMessage(`Withdrawal request for ${numAmount.toFixed(2)} Rs has been submitted and is now pending.`);
    setAmount('');
    setIsEditingDetails(false); 
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Withdrawal</h2>
            
            {savedDetails && !isEditingDetails ? (
                 <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Using Saved Account:</h3>
                            <p className="text-sm text-slate-600"><strong>Method:</strong> {savedDetails.method}</p>
                            <p className="text-sm text-slate-600"><strong>Name:</strong> {savedDetails.accountName}</p>
                            <p className="text-sm text-slate-600"><strong>Number:</strong> {savedDetails.accountNumber}</p>
                            {savedDetails.bankName && <p className="text-sm text-slate-600"><strong>Bank:</strong> {savedDetails.bankName}</p>}
                        </div>
                        <button onClick={handleUseDifferentAccount} className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <PencilSquareIcon className="w-3 h-3" /> Edit
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">1. Select Withdrawal Method</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {paymentMethods.map(({ id, name, icon }) => (
                                <button
                                key={id}
                                onClick={() => handleMethodSelect(id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                    selectedMethod === id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-gray-50'
                                }`}
                                >
                                <div className={`${selectedMethod === id ? 'text-amber-600' : 'text-gray-400'}`}>{icon}</div>
                                <span className={`mt-2 font-semibold text-sm ${selectedMethod === id ? 'text-amber-700' : 'text-gray-600'}`}>{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {selectedMethod && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-sm font-medium text-gray-700">2. Enter Account Details</h3>
                            <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Account Holder Name" className="w-full p-3 border rounded-xl bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500" required />
                            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full p-3 border rounded-xl bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500" required />
                            {selectedMethod === 'Bank Transfer' && (
                                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="w-full p-3 border rounded-xl bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500" required />
                            )}
                        </div>
                    )}
                </>
            )}

            <form onSubmit={handleWithdraw} className="mt-6 border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">3. Enter Amount (Rs)</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder={`Min 1000.00`}
                        className="flex-grow w-full p-3 border rounded-xl bg-gray-50 border-gray-200 text-lg focus:border-amber-500 focus:ring-amber-500"
                        required
                    />
                    <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Withdraw
                    </button>
                </div>
                 <div className="text-xs text-center text-gray-500 mt-2">
                    Min withdrawal: 1,000 Rs • Max withdrawal: 50,000 Rs
                </div>
                 {message && <p className={`mt-4 text-center text-sm font-medium ${message.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </form>
        </div>
      </div>
      
      <div className="lg:col-span-1 space-y-6">
        <div className="relative p-6 rounded-2xl shadow-xl text-white bg-slate-900 overflow-hidden border border-slate-800">
             <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
             <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Total Balance</p>
             <div className="my-3">
                 <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{balance.toFixed(2)}</span>
                 <span className="text-amber-500 font-bold ml-1">Rs</span>
             </div>
             <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-slate-400">Pending Rewards</span>
                <span className="font-bold text-white">{pendingRewards.toFixed(2)} Rs</span>
             </div>
        </div>
        
        {!hasPin && (
             <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 text-center">
                <h4 className="font-bold text-amber-900 mb-1">Secure Your Wallet</h4>
                <p className="text-sm text-amber-700 mb-3">Set a 4-digit PIN for withdrawals.</p>
                <button onClick={onSetupPin} className="bg-white text-amber-700 border border-amber-300 font-bold py-2 px-4 rounded-lg text-sm hover:bg-amber-100 transition-colors">
                    Set Up PIN
                </button>
            </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-amber-200 transition-colors">
                <div>
                   <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{tx.description}</span>
                        {(tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.PENDING_DEPOSIT || tx.type === TransactionType.DEPOSIT) && tx.status && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                                tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' 
                                : tx.status === 'Failed' || tx.status === 'Rejected' ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                                {tx.status}
                            </span>
                        )}
                    </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{
                      (() => {
                          const dateRaw = tx.date as any;
                          if (!dateRaw) return 'N/A';
                          const dateObj = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                          return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleString();
                      })()
                  }</p>
                </div>
                <p className={`font-bold text-sm whitespace-nowrap ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No transactions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletView;