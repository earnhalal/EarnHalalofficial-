
// components/WalletView.tsx
import React, { useState, useEffect } from 'react';
import type { Transaction, WithdrawalDetails } from '../types';
import { TransactionType } from '../types';
import {
  WalletIcon, PencilSquareIcon, BankIcon, NayaPayIcon,
  SadaPayIcon, UPaisaIcon, JazzCashIcon, EasyPaisaIcon, CheckCircleIcon,
  ArrowRight, SparklesIcon, ArrowUpCircleIcon
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
  joinedAt?: any; // Passed from App.tsx
}

type Method = 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'NayaPay' | 'SadaPay' | 'UPaisa';

const paymentMethods: { id: Method; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'JazzCash', name: 'JazzCash', icon: <JazzCashIcon className="w-10 h-10"/>, color: 'bg-red-50 border-red-100 text-red-600 hover:border-red-300' },
    { id: 'EasyPaisa', name: 'EasyPaisa', icon: <EasyPaisaIcon className="w-10 h-10"/>, color: 'bg-green-50 border-green-100 text-green-600 hover:border-green-300' },
    { id: 'NayaPay', name: 'NayaPay', icon: <NayaPayIcon className="w-10 h-10"/>, color: 'bg-orange-50 border-orange-100 text-orange-600 hover:border-orange-300' },
    { id: 'SadaPay', name: 'SadaPay', icon: <SadaPayIcon className="w-10 h-10"/>, color: 'bg-teal-50 border-teal-100 text-teal-600 hover:border-teal-300' },
    { id: 'UPaisa', name: 'UPaisa', icon: <UPaisaIcon className="w-10 h-10"/>, color: 'bg-amber-50 border-amber-100 text-amber-600 hover:border-amber-300' },
    { id: 'Bank Transfer', name: 'Bank Transfer', icon: <BankIcon className="w-10 h-10"/>, color: 'bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-300' },
];

// --- Realistic Card Assets ---

const ContactlessIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.5 10a7.5 7.5 0 0 1 7 0" strokeLinecap="round"/>
        <path d="M7 8.5a9.5 9.5 0 0 1 10 0" strokeLinecap="round"/>
        <path d="M10 11.5a3.5 3.5 0 0 1 4 0" strokeLinecap="round"/>
        <path d="M11 13a1 1 0 0 1 2 0" strokeLinecap="round"/>
    </svg>
);

const CardChip = () => (
    <div className="w-11 h-8 rounded-md relative overflow-hidden shadow-sm bg-gradient-to-br from-[#fcd34d] via-[#d97706] to-[#b45309]">
        {/* Circuit lines */}
        <div className="absolute inset-0 border-[0.5px] border-[#78350f] opacity-60">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#78350f]"></div>
            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-[#78350f]"></div>
            <div className="absolute top-0 right-1/3 w-[1px] h-full bg-[#78350f]"></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-4 border border-[#78350f] rounded-sm -translate-x-1/2 -translate-y-1/2 bg-[#fbbf24]/30"></div>
        </div>
    </div>
);

const WalletView: React.FC<WalletViewProps> = ({ balance, pendingRewards, transactions, username, onWithdraw, savedDetails, hasPin, onSetupPin, joinedAt }) => {
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

  // --- Card Display Logic ---
  const displayMethod = selectedMethod || (savedDetails?.method);
  const methodIcon = paymentMethods.find(m => m.id === displayMethod)?.icon || <SparklesIcon className="w-8 h-8 text-amber-400" />;
  
  const formatJoinedDate = (date: any) => {
      if (!date) return "01/24";
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "01/24";
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };

  // Format card number blocks of 4
  const formattedCardNumber = (accountNumber || savedDetails?.accountNumber || "0000 0000 0000 0000").replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || "0000 0000 0000 0000";

  return (
    <div className="space-y-8 pb-24 font-sans">
      
      {/* PREMIUM CREDIT CARD */}
      <div className="perspective-1000 w-full max-w-md mx-auto relative group">
          {/* Card Container */}
          <div className="relative w-full aspect-[1.586/1] rounded-[20px] p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-amber-500/20 border border-amber-500/20 bg-[#0a0a0a]">
              
              {/* 1. Background - Premium Matte Black with Gold Sheen */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#050505] to-[#000000]"></div>
              
              {/* 2. Gold Noise Texture Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
              
              {/* 3. Abstract Gold Glows */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]"></div>
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-600/10 rounded-full blur-[50px]"></div>

              {/* 4. Layout Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                  
                  {/* Top Row: Logo and Bank/Icon */}
                  <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                          {/* TaskMint Logo Text inside Card */}
                          <span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tighter font-heading italic">
                              TaskMint
                          </span>
                          <span className="text-[8px] text-amber-500/70 tracking-[0.2em] uppercase font-bold">Premium Member</span>
                      </div>
                      <div className="scale-75 origin-top-right opacity-90 filter drop-shadow-lg grayscale-[0.2] brightness-125">
                          {methodIcon}
                      </div>
                  </div>

                  {/* Middle Row: Chip & Number */}
                  <div className="mt-2">
                      <div className="flex items-center gap-4 mb-4">
                          <CardChip />
                          <ContactlessIcon className="w-6 h-6 text-white/40 rotate-90" />
                      </div>
                      <p className="text-xl sm:text-2xl font-mono font-bold tracking-[0.12em] text-gray-100 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {formattedCardNumber}
                      </p>
                  </div>

                  {/* Bottom Row: Holder & Expiry */}
                  <div className="flex justify-between items-end">
                      <div>
                          <p className="text-[7px] text-amber-500/80 uppercase tracking-widest mb-0.5 font-bold">Card Holder</p>
                          <p className="text-sm sm:text-base text-gray-100 font-heading font-semibold tracking-wider uppercase drop-shadow-sm truncate max-w-[180px]">
                              {accountName || savedDetails?.accountName || username || "VALUED MEMBER"}
                          </p>
                      </div>

                      <div className="text-right">
                          <p className="text-[7px] text-amber-500/80 uppercase tracking-widest mb-0.5 font-bold">Valid Thru</p>
                          <p className="text-sm font-mono text-gray-100 font-bold tracking-widest drop-shadow-sm">
                              {formatJoinedDate(joinedAt)}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {!hasPin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm animate-fade-in gap-4">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                      <WalletIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="font-bold text-amber-900 text-sm">Secure Your Wallet</h4>
                      <p className="text-xs text-amber-700">Set a 4-digit PIN for withdrawals.</p>
                  </div>
              </div>
              <button onClick={onSetupPin} className="w-full sm:w-auto bg-white text-amber-700 text-xs font-bold px-4 py-3 rounded-lg shadow-sm border border-amber-100 hover:bg-amber-50 transition-colors">
                  Set PIN
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Section */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  Request Withdrawal
              </h3>

              <div className="bg-white p-6 rounded-3xl shadow-subtle border border-gray-100">
                  {savedDetails && !isEditingDetails ? (
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm text-slate-700">
                                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Sending to Saved Account</p>
                                  <p className="font-bold text-slate-900">{savedDetails.method} • {savedDetails.accountNumber}</p>
                              </div>
                          </div>
                          <button onClick={handleUseDifferentAccount} className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                              <PencilSquareIcon className="w-5 h-5" />
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Select Method</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {paymentMethods.map((method) => (
                                      <button
                                          key={method.id}
                                          onClick={() => handleMethodSelect(method.id)}
                                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                                              selectedMethod === method.id 
                                                  ? `${method.color} shadow-md ring-1 ring-offset-1 ring-transparent` 
                                                  : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-200'
                                          }`}
                                      >
                                          <div className="mb-2 scale-90 sm:scale-100">{method.icon}</div>
                                          <span className="text-[10px] sm:text-xs font-bold text-center">{method.name}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {selectedMethod && (
                              <div className="space-y-4 animate-fade-in">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Account Title</label>
                                          <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-300" placeholder="e.g. Muhammad Ali" />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Account Number</label>
                                          <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-300" placeholder="0300..." />
                                      </div>
                                  </div>
                                  {selectedMethod === 'Bank Transfer' && (
                                      <div>
                                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bank Name</label>
                                          <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-300" placeholder="e.g. HBL, Meezan" />
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Withdrawal Amount</label>
                      <div className="relative">
                          <input
                              type="number"
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              placeholder="Min 1000"
                              className="w-full p-4 pl-12 pr-32 bg-gray-50 rounded-2xl border-none text-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-300"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                          <button 
                              onClick={handleWithdraw}
                              disabled={!amount || parseFloat(amount) < 1000}
                              className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              Withdraw <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                      {message && (
                        <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 ${message.includes('submitted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                           {message.includes('submitted') ? <CheckCircleIcon className="w-5 h-5"/> : null}
                           {message}
                        </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-slate-300 rounded-full"></span>
                  History
              </h3>
              <div className="bg-white rounded-3xl shadow-subtle border border-gray-100 overflow-hidden h-[500px] overflow-y-auto custom-scrollbar">
                  {transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                          <WalletIcon className="w-12 h-12 mb-2 opacity-20" />
                          <p className="text-sm font-medium">No transactions yet.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-gray-50">
                          {transactions.map((tx) => (
                              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2.5 rounded-xl transition-colors ${
                                          tx.type === TransactionType.WITHDRAWAL
                                            ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' // Amber for withdrawals
                                            : tx.amount >= 0 
                                                ? 'bg-green-50 text-green-600 group-hover:bg-green-100' 
                                                : 'bg-red-50 text-red-500 group-hover:bg-red-100'
                                        }`}>
                                          {tx.type === TransactionType.WITHDRAWAL ? <WalletIcon className="w-5 h-5" /> : (tx.amount >= 0 ? <ArrowUpCircleIcon className="w-5 h-5 rotate-180" /> : <ArrowUpCircleIcon className="w-5 h-5" />)}
                                      </div>
                                      <div>
                                          <p className={`font-bold text-sm ${tx.type === TransactionType.WITHDRAWAL ? 'text-amber-700' : 'text-slate-900'}`}>{tx.type}</p>
                                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{tx.description}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className={`font-black text-sm ${tx.amount >= 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(0)}
                                      </p>
                                      {tx.status && (
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                                              tx.status === 'Completed' || tx.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                              tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                              'bg-red-100 text-red-600'
                                          }`}>
                                              {tx.status}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default WalletView;
