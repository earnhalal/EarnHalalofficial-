// App.tsx

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import EarnView from './components/EarnView';
import WalletView from './components/WalletView';
import CreateTaskView from './components/CreateTaskView';
import TaskHistoryView from './components/TaskHistoryView';
import InviteView from './components/InviteView';
import ProfileSettingsView from './components/ProfileSettingsView';
import { HowItWorksView, AboutUsView, ContactUsView, PrivacyPolicyView, TermsAndConditionsView } from './components/InfoViews';
import JobsView from './components/JobsView';
import Footer from './components/Footer';
import AuthView from './components/AuthView';
import PaymentView from './components/PaymentView';
import PendingVerificationView from './components/PendingVerificationView';
import LandingView from './components/LandingView';
import NotificationBanner from './components/NotificationBanner';
import DepositView from './components/DepositView';
import SpinWheelView from './components/SpinWheelView';
import PinLockView from './components/PinLockView';
import AIAgentChatbot from './components/AIAgentChatbot';


import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails } from './types';
import { TransactionType, TaskType } from './types';

// --- HELPERS ---

// Helper for generating more realistic mock task data
const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateMockTask = (id: number): UserCreatedTask => {
  const taskTypes = Object.values(TaskType);
  const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  let title = '';
  let description = '';
  let url = '';
  const reward = parseFloat((Math.random() * 10 + 1).toFixed(2));

  switch (type) {
    case TaskType.VISIT_WEBSITE:
      title = `Read Our Latest Blog Post`;
      description = `Visit our website and stay for at least 30 seconds.`;
      url = `https://tech-insights-blog.com/${generateRandomString(8)}`;
      break;
    case TaskType.YOUTUBE_SUBSCRIBE:
      title = `Subscribe to Our YouTube Channel`;
      description = `Click the link and subscribe to the channel for great content!`;
      url = `https://www.youtube.com/channel/UC${generateRandomString(22)}`;
      break;
    case TaskType.FACEBOOK_LIKE:
      title = `Like Our Facebook Page`;
      description = `Help us grow by liking our official Facebook page.`;
      url = `https://www.facebook.com/${generateRandomString(10)}`;
      break;
    case TaskType.INSTAGRAM_FOLLOW:
      title = `Follow Us on Instagram`;
      description = `Follow our Instagram account for daily updates and stories.`;
      url = `https://www.instagram.com/${generateRandomString(10)}`;
      break;
    case TaskType.TIKTOK_FOLLOW:
      title = `Follow Our TikTok Account`;
      description = `Watch our latest videos and follow us on TikTok.`;
      url = `https://www.tiktok.com/@${generateRandomString(12)}`;
      break;
  }

  return {
    id: `utask_mock_${id}_${Date.now()}`,
    type,
    title,
    description,
    url,
    reward,
    quantity: Math.floor(Math.random() * 200) + 50,
    completions: Math.floor(Math.random() * 40),
    views: Math.floor(Math.random() * 300) + 50,
  };
};

// Web Audio API helper for sound effects
let audioCtx: AudioContext | null = null;
const playBalanceSound = () => {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
        oscillator.type = 'sine';
        
        oscillator.frequency.setValueAtTime(880, now); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
        
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    } catch (e) {
        console.error("Could not play sound", e);
    }
};

const App: React.FC = () => {
    // App state
    const [view, setView] = useState<View>('DASHBOARD');
    const [viewHistory, setViewHistory] = useState<View[]>(['DASHBOARD']);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLanding, setShowLanding] = useState(true);

    // User & Data State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userTasks, setUserTasks] = useState<UserCreatedTask[]>([]);
    const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
    const [referrals, setReferrals] = useState<{ level1: number; level2: number; }>({level1: 0, level2: 0});
    const [savedWithdrawalDetails, setSavedWithdrawalDetails] = useState<WithdrawalDetails | null>(null);

    // Security State
    const [walletPin, setWalletPin] = useState<string | null>(null); // 'null': not set, 'SKIPPED': skipped, '1234': pin is set
    const [isWalletLocked, setIsWalletLocked] = useState(true);
    const [showPinModal, setShowPinModal] = useState<'enter' | 'set' | false>(false);


    // Notification State
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [showNotificationBanner, setShowNotificationBanner] = useState(Notification.permission === 'default');

    // --- MOCK DATA ---
    useEffect(() => {
        const initialUserTasks = localStorage.getItem('globalUserTasks');
        if (!initialUserTasks) {
            const mockTasks = Array.from({ length: 8 }, (_, i) => generateMockTask(i + 1));
            setUserTasks(mockTasks);
            localStorage.setItem('globalUserTasks', JSON.stringify(mockTasks));
        } else {
            setUserTasks(JSON.parse(initialUserTasks));
        }

        setJobs([
            { id: 'job1', title: 'Data Entry Clerk', description: 'Enter data from various sources into our database.', type: 'Part-time', salary: '15,000 Rs/month', isPremium: false },
            { id: 'job2', title: 'Virtual Assistant', description: 'Provide administrative, technical, or creative assistance to clients remotely.', type: 'Full-time', salary: '30,000 Rs/month', isPremium: true },
            { id: 'job3', title: 'Social Media Manager', description: 'Manage and grow our social media presence.', type: 'Contract', salary: '25,000 Rs/month', isPremium: true },
        ]);
    }, []);

    // --- LOCAL STORAGE PERSISTENCE ---
    useEffect(() => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            let profile: UserProfile = JSON.parse(storedProfile);
            
            // Reset daily job application count if it's a new day
            if (profile.jobSubscription) {
                const today = new Date().toISOString().split('T')[0];
                if (profile.jobSubscription.lastApplicationDate !== today) {
                    profile.jobSubscription.applicationsToday = 0;
                    profile.jobSubscription.lastApplicationDate = today;
                    localStorage.setItem('userProfile', JSON.stringify(profile)); // Save the reset back
                }
            }

            setUserProfile(profile);
            setShowLanding(false); // If there's a profile, don't show landing
            // Reload user data based on profile
            setBalance(parseFloat(localStorage.getItem(`balance_${profile.username}`) || '0'));
            setTransactions(JSON.parse(localStorage.getItem(`transactions_${profile.username}`) || '[]'));
            setCompletedTaskIds(JSON.parse(localStorage.getItem(`completedTaskIds_${profile.username}`) || '[]'));
            setReferrals(JSON.parse(localStorage.getItem(`referrals_${profile.username}`) || '{"level1":0, "level2":0}'));
            setWalletPin(localStorage.getItem(`walletPin_${profile.username}`));
            setSavedWithdrawalDetails(JSON.parse(localStorage.getItem(`savedWithdrawalDetails_${profile.username}`) || 'null'));
        }
    }, []);
    
    const saveUserData = (profile: UserProfile, newBalance: number, newTransactions: Transaction[], newCompletedIds: string[], newReferrals: {level1: number, level2: number}, newPin: string | null = walletPin, newDetails: WithdrawalDetails | null = savedWithdrawalDetails) => {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem(`balance_${profile.username}`, newBalance.toString());
        localStorage.setItem(`transactions_${profile.username}`, JSON.stringify(newTransactions));
        localStorage.setItem(`completedTaskIds_${profile.username}`, JSON.stringify(newCompletedIds));
        localStorage.setItem(`referrals_${profile.username}`, JSON.stringify(newReferrals));
        if (newPin) localStorage.setItem(`walletPin_${profile.username}`, newPin);
        if (newDetails) localStorage.setItem(`savedWithdrawalDetails_${profile.username}`, JSON.stringify(newDetails));
    };

    // --- HANDLERS ---
    const handleSetActiveView = (newView: View) => {
        if (newView === 'WALLET' && walletPin && walletPin !== 'SKIPPED' && isWalletLocked) {
            setShowPinModal('enter');
            return;
        }

        if (newView !== view) {
            setView(newView);
            setViewHistory(prev => [...prev, newView]);
        }
        setIsSidebarOpen(false); // Auto-close sidebar on navigation
    };

    const handleBack = () => {
        if (viewHistory.length > 1) {
            const newHistory = [...viewHistory];
            newHistory.pop();
            const previousView = newHistory[newHistory.length - 1];
            setView(previousView);
            setViewHistory(newHistory);
        }
    };
    
    const addTransaction = (profile: UserProfile, type: TransactionType, description: string, amount: number, customReferrals = referrals, withdrawalDetails?: WithdrawalDetails) => {
        const newTransaction: Transaction = { id: `tx_${Date.now()}`, type, description, amount, date: new Date().toISOString(), withdrawalDetails };
        const newBalance = balance + amount;
        const newTransactions = [...transactions, newTransaction];
        
        if (amount > 0) {
            playBalanceSound();
        }

        setBalance(newBalance);
        setTransactions(newTransactions);

        let newSavedDetails = savedWithdrawalDetails;
        if (type === TransactionType.WITHDRAWAL && withdrawalDetails) {
             setSavedWithdrawalDetails(withdrawalDetails);
             newSavedDetails = withdrawalDetails;
        }

        saveUserData(profile, newBalance, newTransactions, completedTaskIds, customReferrals, walletPin, newSavedDetails);
    };

    const handleLogin = (profile: UserProfile) => {
        setUserProfile(profile);
        setShowLanding(false);
        // Load data for this user
        setBalance(parseFloat(localStorage.getItem(`balance_${profile.username}`) || '0'));
        setTransactions(JSON.parse(localStorage.getItem(`transactions_${profile.username}`) || '[]'));
        setCompletedTaskIds(JSON.parse(localStorage.getItem(`completedTaskIds_${profile.username}`) || '[]'));
        setReferrals(JSON.parse(localStorage.getItem(`referrals_${profile.username}`) || '{"level1":0, "level2":0}'));
        setWalletPin(localStorage.getItem(`walletPin_${profile.username}`));
        setSavedWithdrawalDetails(JSON.parse(localStorage.getItem(`savedWithdrawalDetails_${profile.username}`) || 'null'));
        setIsWalletLocked(true); // Always lock wallet on login
        setViewHistory(['DASHBOARD']);
        setView('DASHBOARD');
    };
    
    const handleSignup = (profileData: Omit<UserProfile, 'paymentStatus' | 'jobSubscription'>) => {
        const newUserProfile: UserProfile = { ...profileData, paymentStatus: 'UNPAID', jobSubscription: null };
        setUserProfile(newUserProfile);
        localStorage.setItem('userProfile', JSON.stringify(newUserProfile)); // Save immediately
    };

    const handlePaymentSubmit = () => {
        if (!userProfile) return;
        const updatedProfile = { ...userProfile, paymentStatus: 'PENDING_VERIFICATION' as const };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        // Simulate verification
        setTimeout(() => {
            const currentProfileString = localStorage.getItem('userProfile');
            if (currentProfileString) {
                const currentProfile: UserProfile = JSON.parse(currentProfileString);
                if (currentProfile.username === userProfile.username) {
                    const verifiedProfile = { ...updatedProfile, paymentStatus: 'VERIFIED' as const };
                    setUserProfile(verifiedProfile);
                    
                    // Initialize user's financial state properly upon verification.
                    const feeTransaction: Transaction = {
                        id: `tx_${Date.now()}`,
                        type: TransactionType.JOINING_FEE,
                        description: 'One-time joining fee',
                        amount: -50,
                        date: new Date().toISOString()
                    };
                    // User starts with a zero balance after paying the fee.
                    const initialBalance = 0;
                    const initialTransactions = [feeTransaction];

                    setBalance(initialBalance);
                    setTransactions(initialTransactions);
                    
                    // Persist the initialized state for the new user.
                    saveUserData(verifiedProfile, initialBalance, initialTransactions, [], { level1: 0, level2: 0 });
                }
            }
        }, 5000);
    };

    const handleCreateTask = (taskData: Omit<Task, 'id'>, quantity: number, totalCost: number) => {
        if (!userProfile) return;
        const newUserTask: UserCreatedTask = {
            id: `utask_${Date.now()}`,
            type: taskData.type,
            title: taskData.title,
            description: taskData.description,
            url: taskData.url,
            reward: taskData.reward,
            quantity: quantity,
            completions: 0,
            views: 0
        };
        const newUserTasks = [...userTasks, newUserTask];
        setUserTasks(newUserTasks);
        localStorage.setItem('globalUserTasks', JSON.stringify(newUserTasks));
        addTransaction(userProfile, TransactionType.TASK_CREATION, `Campaign: ${taskData.title}`, -totalCost);
    };

    const handleTaskView = (userCreatedTaskId: string) => {
        const newTasks = userTasks.map(task => {
            if (task.id === userCreatedTaskId) {
                return { ...task, views: task.views + 1 };
            }
            return task;
        });
        setUserTasks(newTasks);
        localStorage.setItem('globalUserTasks', JSON.stringify(newTasks));
    };

    const handleCompleteTask = (userCreatedTaskId: string) => {
        if (!userProfile) return;
    
        const taskToComplete = userTasks.find(t => t.id === userCreatedTaskId);
        if (!taskToComplete || completedTaskIds.includes(userCreatedTaskId)) return;

        // Update the global task list
        const updatedUserTasks = userTasks.map(t =>
            t.id === userCreatedTaskId ? { ...t, completions: t.completions + 1 } : t
        );
        setUserTasks(updatedUserTasks);
        localStorage.setItem('globalUserTasks', JSON.stringify(updatedUserTasks));

        // Update current user's state
        const newCompletedTaskIds = [...completedTaskIds, userCreatedTaskId];
        setCompletedTaskIds(newCompletedTaskIds);

        // Add transaction for the user
        addTransaction(userProfile, TransactionType.EARNING, `Completed: ${taskToComplete.title}`, taskToComplete.reward, referrals);

        // Note: The main saveUserData call is now inside addTransaction, so we just need to update completed IDs separately for persistence.
        const currentBalance = balance + taskToComplete.reward;
        const updatedTransactions = [...transactions, { id: `tx_${Date.now()}`, type: TransactionType.EARNING, description: `Completed: ${taskToComplete.title}`, amount: taskToComplete.reward, date: new Date().toISOString() }];
        saveUserData(userProfile, currentBalance, updatedTransactions, newCompletedTaskIds, referrals);
    };

    const handleWithdraw = (amount: number, details: WithdrawalDetails) => {
        if (!userProfile) return;
        addTransaction(userProfile, TransactionType.WITHDRAWAL, `Withdrawal via ${details.method}`, -amount, referrals, details);
    };

    const handleSubscribeToJob = (plan: JobSubscriptionPlan, cost: number) => {
        if (!userProfile) return;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Simple 30 day expiry
        
        const updatedProfile = { 
            ...userProfile, 
            jobSubscription: { 
                plan, 
                expiryDate: expiryDate.toLocaleDateString(),
                applicationsToday: 0,
                lastApplicationDate: new Date().toISOString().split('T')[0]
            } 
        };
        setUserProfile(updatedProfile);
        addTransaction(updatedProfile, TransactionType.JOB_SUBSCRIPTION, `Subscribed to ${plan} plan`, -cost);
    };

    const handleApplyForJob = (jobId: string) => {
        if (!userProfile || !userProfile.jobSubscription) return;

        let subscription = { ...userProfile.jobSubscription };
        const today = new Date().toISOString().split('T')[0];

        // Reset if it's a new day
        if (subscription.lastApplicationDate !== today) {
            subscription.applicationsToday = 0;
            subscription.lastApplicationDate = today;
        }

        const limits = { Starter: 5, Growth: 15, Business: Infinity, Enterprise: Infinity };
        const limit = limits[subscription.plan] || 0;

        if (subscription.applicationsToday < limit) {
            subscription.applicationsToday += 1;
            const updatedProfile = { ...userProfile, jobSubscription: subscription };
            setUserProfile(updatedProfile);
            setAppliedJobIds(prev => [...prev, jobId]);
            saveUserData(updatedProfile, balance, transactions, completedTaskIds, referrals, walletPin, savedWithdrawalDetails);
            alert('Application submitted successfully!');
        } else {
            alert('You have reached your daily application limit.');
        }
    };
    
    const handleLogout = () => {
        setUserProfile(null);
        setBalance(0);
        setTransactions([]);
        setCompletedTaskIds([]);
        setReferrals({level1: 0, level2: 0});
        setWalletPin(null);
        setSavedWithdrawalDetails(null);
        setIsWalletLocked(true);
        setView('DASHBOARD');
        setViewHistory(['DASHBOARD']);
        localStorage.removeItem('userProfile');
        setShowLanding(true);
    };

    const handleRequestPermission = async () => {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        setShowNotificationBanner(false);
    };
    
    const simulateNewTaskNotification = () => {
        if (notificationPermission === 'granted') {
            new Notification('New Task Available!', {
                body: 'A new high-paying task has just been added. Complete it now!',
                icon: '/favicon.ico'
            });
        } else {
            alert('Please enable notifications to get updates.');
        }
    };
    
    const handleDeposit = (amount: number, transactionId: string) => {
        if (!userProfile) return;
        const newTransaction: Transaction = { 
            id: `tx_${Date.now()}`, 
            type: TransactionType.PENDING_DEPOSIT,
            description: `Deposit via TXID: ${transactionId}`, 
            amount, 
            date: new Date().toISOString() 
        };
        const newTransactions = [...transactions, newTransaction];
        setTransactions(newTransactions);
        
        const updatedProfile = { ...userProfile };
        saveUserData(updatedProfile, balance, newTransactions, completedTaskIds, referrals);
        
        alert(`Your deposit request for ${amount.toFixed(2)} Rs has been submitted and is pending verification.`);
    };

    const handleSpinWin = (amount: number) => {
        if (!userProfile) return;
        addTransaction(userProfile, TransactionType.EARNING, 'Spin Wheel Prize', amount);
    };
    
    const handleBuySpin = (cost: number): boolean => {
        if (!userProfile || balance < cost) {
            return false;
        }
        addTransaction(userProfile, TransactionType.SPIN_PURCHASE, `Spin purchase (${cost} Rs)`, -cost);
        return true;
    };

    const handleSimulateReferral = (level: 1 | 2) => {
        if(!userProfile) return;
        if (level === 1) {
            const newReferrals = { ...referrals, level1: referrals.level1 + 1 };
            setReferrals(newReferrals);
            addTransaction(userProfile, TransactionType.REFERRAL, 'Level 1 Referral Bonus', 20, newReferrals);
        } else {
            const newReferrals = { ...referrals, level2: referrals.level2 + 1 };
            setReferrals(newReferrals);
            addTransaction(userProfile, TransactionType.REFERRAL, 'Level 2 Referral Bonus', 5, newReferrals);
        }
    }
    
    const handlePinSet = (newPin: string) => {
        if (!userProfile) return;
        setWalletPin(newPin);
        localStorage.setItem(`walletPin_${userProfile.username}`, newPin);
        setShowPinModal(false);
    };
    
    const handlePinSkip = () => {
        if (!userProfile) return;
        const pinValue = 'SKIPPED';
        setWalletPin(pinValue);
        localStorage.setItem(`walletPin_${userProfile.username}`, pinValue);
        setShowPinModal(false);
    };

    const referralEarnings = useMemo(() => {
        return transactions
            .filter(tx => tx.type === TransactionType.REFERRAL)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const tasksCompletedCount = useMemo(() => {
        return transactions.filter(t => 
            t.type === TransactionType.EARNING && t.description.startsWith('Completed:')
        ).length;
    }, [transactions]);
    
    const availableTasks = useMemo(() => {
        // Filter out campaigns that are fully completed
        return userTasks.filter(task => task.completions < task.quantity);
    }, [userTasks]);


    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (!userProfile) return null;
        switch (view) {
            case 'DASHBOARD': return <DashboardView balance={balance} tasksCompleted={tasksCompletedCount} referrals={referrals.level1} setActiveView={handleSetActiveView} transactions={transactions} onSimulateNewTask={simulateNewTaskNotification} />;
            case 'EARN': return <EarnView tasks={availableTasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={completedTaskIds} />;
            case 'SPIN_WHEEL': return <SpinWheelView onWin={handleSpinWin} balance={balance} onBuySpin={handleBuySpin} />;
            case 'WALLET': return <WalletView balance={balance} transactions={transactions} onWithdraw={handleWithdraw} username={userProfile.username} savedDetails={savedWithdrawalDetails} hasPin={!!walletPin} onSetupPin={() => setShowPinModal('set')} />;
            case 'DEPOSIT': return <DepositView onDeposit={handleDeposit} />;
            case 'CREATE_TASK': return <CreateTaskView balance={balance} onCreateTask={handleCreateTask} />;
            case 'TASK_HISTORY': return <TaskHistoryView userTasks={userTasks} />;
            case 'INVITE': return <InviteView referrals={referrals} referralEarnings={referralEarnings} onSimulateReferral={handleSimulateReferral} />;
            case 'PROFILE_SETTINGS': return <ProfileSettingsView />;
            case 'HOW_IT_WORKS': return <HowItWorksView />;
            case 'ABOUT_US': return <AboutUsView />;
            case 'CONTACT_US': return <ContactUsView />;
            case 'PRIVACY_POLICY': return <PrivacyPolicyView />;
            case 'TERMS_CONDITIONS': return <TermsAndConditionsView />;
            case 'JOBS': return <JobsView userProfile={userProfile} balance={balance} jobs={jobs} onSubscribe={handleSubscribeToJob} onApply={handleApplyForJob} appliedJobIds={appliedJobIds} />;
            default: return <DashboardView balance={balance} tasksCompleted={0} referrals={0} setActiveView={handleSetActiveView} transactions={[]} onSimulateNewTask={() => {}} />;
        }
    };
    
    if (showLanding) {
        return <LandingView onGetStarted={() => setShowLanding(false)} />
    }

    if (!userProfile) {
        return <AuthView onLogin={handleLogin} onSignup={handleSignup} />;
    }

    if (userProfile.paymentStatus === 'UNPAID') {
        return <PaymentView onSubmit={handlePaymentSubmit} />;
    }

    if (userProfile.paymentStatus === 'PENDING_VERIFICATION') {
        return <PendingVerificationView />;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans flex">
            {showPinModal && (
                <PinLockView 
                    mode={showPinModal}
                    pinToVerify={walletPin || undefined}
                    onClose={() => setShowPinModal(false)}
                    onPinCorrect={() => {
                        setIsWalletLocked(false);
                        setShowPinModal(false);
                        handleSetActiveView('WALLET');
                    }}
                    onPinSet={handlePinSet}
                    onSkip={handlePinSkip}
                />
            )}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <Sidebar activeView={view} setActiveView={handleSetActiveView} onLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
            <div className={`flex-1 flex flex-col transition-all duration-300 lg:ml-64`}>
                {showNotificationBanner && <NotificationBanner onRequestPermission={handleRequestPermission} onDismiss={() => setShowNotificationBanner(false)} />}
                <Header activeView={view} balance={balance} username={userProfile.username} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} canGoBack={viewHistory.length > 1} onBack={handleBack} />
                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
                <Footer setActiveView={handleSetActiveView} />
            </div>
            <AIAgentChatbot />
        </div>
    );
};

export default App;