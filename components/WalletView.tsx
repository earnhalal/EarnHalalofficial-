// components/WalletView.tsx
import React, { useState, useEffect } from 'react';
import type { Transaction, WithdrawalDetails } from '../types';
import { TransactionType } from '../types';
import {
  WalletIcon, CheckCircleIcon, PencilSquareIcon, BankIcon, NayaPayIcon,
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
          // Clear form if user wants to enter new details
          setAccountName('');
          setAccountNumber('');
          setBankName('');
      }
  }, [savedDetails, isEditingDetails]);
  
  const handleUseDifferentAccount = () => {
    setIsEditingDetails(true);
    setSelectedMethod(null); // Force user to re-select method
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
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }
    if (numAmount < 100) {
      setMessage('Minimum withdrawal amount is 100 Rs.');
      return;
    }
    if (numAmount > balance) {
      setMessage('Insufficient balance.');
      return;
    }
    if (!selectedMethod) {
      setMessage('Please select a withdrawal method.');
      return;
    }
    if (!accountName || !accountNumber) {
        setMessage('Account name and number are required.');
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
    setMessage(`Withdrawal request for ${numAmount.toFixed(2)} Rs has been submitted and is now pending.`);
    setAmount('');
    setIsEditingDetails(false); // After withdrawal, lock in the details as "saved"
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-subtle-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Withdrawal</h2>
            
            {savedDetails && !isEditingDetails ? (
                 <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2">Using Saved Account:</h3>
                    <p className="text-sm text-gray-600"><strong>Method:</strong> {savedDetails.method}</p>
                    <p className="text-sm text-gray-600"><strong>Name:</strong> {savedDetails.accountName}</p>
                    <p className="text-sm text-gray-600"><strong>Number:</strong> {savedDetails.accountNumber}</p>
                    {savedDetails.bankName && <p className="text-sm text-gray-600"><strong>Bank:</strong> {savedDetails.bankName}</p>}
                    <button onClick={handleUseDifferentAccount} className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
                        <PencilSquareIcon className="w-4 h-4" /> Use Different Account
                    </button>
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
                                    selectedMethod === id ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200 bg-white hover:border-primary-400'
                                }`}
                                >
                                <div className={`${selectedMethod === id ? 'text-primary-600' : 'text-gray-500'}`}>{icon}</div>
                                <span className={`mt-2 font-semibold text-sm ${selectedMethod === id ? 'text-primary-700' : 'text-gray-800'}`}>{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {selectedMethod && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-sm font-medium text-gray-700">2. Enter Account Details for <span className="font-bold text-primary-600">{selectedMethod}</span></h3>
                            <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Account Holder Name" className="w-full p-3 border rounded-md bg-gray-50 border-gray-300" required />
                            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full p-3 border rounded-md bg-gray-50 border-gray-300" required />
                            {selectedMethod === 'Bank Transfer' && (
                                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="w-full p-3 border rounded-md bg-gray-50 border-gray-300" required />
                            )}
                        </div>
                    )}
                </>
            )}

            <form onSubmit={handleWithdraw} className="mt-6 border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">3. Enter Amount (Rs)</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder={`Min 100.00`}
                        className="flex-grow w-full p-3 border rounded-md bg-gray-50 border-gray-300 text-lg"
                        required
                    />
                    <button type="submit" className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400">
                        Withdraw
                    </button>
                </div>
                 {message && <p className={`mt-4 text-center text-sm ${message.includes('successfully') || message.includes('pending') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </form>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <div className="relative p-6 rounded-2xl shadow-subtle-md text-gray-800 bg-gradient-to-br from-white to-gray-50 overflow-hidden border border-gray-200">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent-500/10 rounded-full"></div>
             <p className="text-gray-600">Total Balance</p>
             <p className="text-5xl font-numeric my-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-700">
                {balance.toFixed(2)}
             </p>
             <p className="font-semibold">Rs</p>
             <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-500">Pending Rewards</span>
                <span className="font-bold text-accent-600">{pendingRewards.toFixed(2)} Rs</span>
             </div>
        </div>
        
        {!hasPin && (
             <div className="bg-primary-50 p-4 rounded-xl shadow-subtle text-center border border-primary-200">
                <h4 className="font-bold text-primary-800">Enhance Your Security</h4>
                <p className="text-sm text-primary-700 my-2">Protect your wallet with a 4-digit PIN for withdrawals.</p>
                <button onClick={onSetupPin} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary-700">
                    Set Up PIN
                </button>
            </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-subtle-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center">
                <div>
                   <p className="font-semibold text-sm text-gray-800 flex items-center gap-2 flex-wrap">
                        <span>{tx.description}</span>
                        {(tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.PENDING_DEPOSIT) && tx.status && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' 
                                : tx.status === 'Failed' || tx.status === 'Rejected' ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                                {tx.status}
                            </span>
                        )}
                    </p>
                  <p className="text-xs text-gray-500">{
                      (() => {
                          const dateRaw = tx.date as any;
                          if (!dateRaw) return 'N/A';
                          const dateObj = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                          return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleString();
                      })()
                  }</p>
                </div>
                <p className={`font-bold text-sm whitespace-nowrap ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} Rs
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-500 py-4">No transactions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletView;