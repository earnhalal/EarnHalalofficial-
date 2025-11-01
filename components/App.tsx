// App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from './DashboardView';
import EarnView from './EarnView';
import WalletView from './WalletView';
import CreateTaskView from './CreateTaskView';
import TaskHistoryView from './TaskHistoryView';
import InviteView from './InviteView';
import ProfileSettingsView from './ProfileSettingsView';
import { HowItWorksView, AboutUsView, ContactUsView, PrivacyPolicyView, TermsAndConditionsView } from './InfoViews';
import JobsView from './JobsView';
import Footer from './Footer';
import AuthView from './AuthView';
import PaymentView from './PaymentView';
import PendingVerificationView from './PendingVerificationView';
import LandingView from './LandingView';
import NotificationBanner from './NotificationBanner';
import DepositView from './DepositView';
import SpinWheelView from './SpinWheelView';
import PinLockView from './PinLockView';
import AIAgentChatbot from './AIAgentChatbot';
import WelcomeModal from './WelcomeModal';
import MyApplicationsView from './MyApplicationsView';

import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application } from '../types';
import { TransactionType, TaskType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction } from 'firebase/firestore';


// --- HELPERS ---
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
  let title = '', description = '', url = '';
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
    type, title, description, url, reward,
    quantity: Math.floor(Math.random() * 200) + 50,
    completions: Math.floor(Math.random() * 40),
    views: Math.floor(Math.random() * 300) + 50,
  };
};

let audioCtx: AudioContext | null = null;
const playBalanceSound = () => {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
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
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // User & Data State
    const [authUser, setAuthUser] = useState<any | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [balance, setBalance] = useState(0);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userTasks, setUserTasks] = useState<UserCreatedTask[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const unsubscribeCallbacks = useRef<(() => void)[]>([]);

    // Security State
    const [isWalletLocked, setIsWalletLocked] = useState(true);
    const [showPinModal, setShowPinModal] = useState<'enter' | 'set' | false>(false);

    // Notification State
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [showNotificationBanner, setShowNotificationBanner] = useState(Notification.permission === 'default');

    // --- MOCK DATA & GLOBAL TASKS ---
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
            { id: 'job2', title: 'Virtual Assistant', description: 'Provide administrative assistance remotely.', type: 'Full-time', salary: '30,000 Rs/month', isPremium: true },
            { id: 'job3', title: 'Social Media Manager', description: 'Manage and grow our social media presence.', type: 'Contract', salary: '25,000 Rs/month', isPremium: true },
        ]);
    }, []);

    // --- FIREBASE AUTH & DATA SYNC ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            // Clear previous user's listeners
            unsubscribeCallbacks.current.forEach(cb => cb());
            unsubscribeCallbacks.current = [];

            if (user) {
                setAuthUser(user);
                setShowLanding(false);

                // Listen to user profile
                const userRef = doc(db, 'users', user.uid);
                const unsubProfile = onSnapshot(userRef, docSnap => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as Omit<UserProfile, 'uid'>;
                        setUserProfile({ ...data, uid: docSnap.id });
                        setBalance(data.balance || 0);
                    } else {
                        console.log("User document not found, waiting for creation...");
                    }
                    setIsAuthLoading(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    alert("Could not load your profile. Please check your internet connection and refresh.");
                    setIsAuthLoading(false);
                });
                unsubscribeCallbacks.current.push(unsubProfile);

                // Listen to transactions subcollection
                const transactionsQuery = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
                const unsubTransactions = onSnapshot(transactionsQuery, snapshot => {
                    const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                    setTransactions(txs);
                }, (error) => {
                     console.error("Error fetching transactions:", error);
                });
                unsubscribeCallbacks.current.push(unsubTransactions);

                // Listen to applications subcollection
                const applicationsQuery = query(collection(db, 'users', user.uid, 'applications'), orderBy('date', 'desc'));
                const unsubApplications = onSnapshot(applicationsQuery, snapshot => {
                    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
                    setApplications(apps);
                }, (error) => {
                    console.error("Error fetching applications:", error);
                });
                unsubscribeCallbacks.current.push(unsubApplications);

            } else {
                setAuthUser(null);
                setUserProfile(null);
                setBalance(0);
                setTransactions([]);
                setApplications([]);
                setIsWalletLocked(true);
                setIsAuthLoading(false);
                setShowLanding(true);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // --- HELPER FUNCTIONS ---
    const updateBalance = async (userId: string, amount: number) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { balance: increment(amount) });
            if (amount > 0) playBalanceSound();
        } catch (error) {
            console.error("Error updating balance:", error);
            throw error; // Re-throw to be caught by caller
        }
    };

    const addReferral = async (referrerId: string) => {
        try {
            const userRef = doc(db, 'users', referrerId);
            await updateDoc(userRef, { referralCount: increment(1) });
        } catch (error) {
            console.error("Error adding referral:", error);
            throw error;
        }
    };

    const addTransaction = async (userId: string, type: TransactionType, description: string, amount: number) => {
       try {
            const transactionsColRef = collection(db, 'users', userId, 'transactions');
            await addDoc(transactionsColRef, {
                type, description, amount, date: serverTimestamp(), status: 'Completed'
            });
        } catch (error) {
            console.error("Error adding transaction:", error);
            throw error;
        }
    };
    
    // --- HANDLERS ---
    const handleSetActiveView = (newView: View) => {
        if (newView === 'WALLET' && userProfile?.walletPin && userProfile.walletPin !== 'SKIPPED' && isWalletLocked) {
            setShowPinModal('enter');
            return;
        }
        if (newView !== view) {
            setView(newView);
            setViewHistory(prev => [...prev, newView]);
        }
        setIsSidebarOpen(false);
    };

    const handleBack = () => {
        if (viewHistory.length > 1) {
            const newHistory = [...viewHistory];
            newHistory.pop();
            setView(newHistory[newHistory.length - 1]);
            setViewHistory(newHistory);
        }
    };

    const handleSignup = async ({ username, email, phone, password }: any) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                await updateProfile(user, { displayName: username });
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    uid: user.uid, username, email, phone,
                    joinedAt: serverTimestamp(),
                    paymentStatus: 'UNPAID',
                    jobSubscription: null,
                    referralCount: 0,
                    balance: 0,
                    completedTaskIds: [],
                    savedWithdrawalDetails: null,
                    walletPin: null,
                });
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            alert(error.message);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error("Login error:", error);
            alert(error.message);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    const handlePaymentSubmit = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error("Payment submitted without a logged-in user.");
            alert("You must be logged in to submit payment.");
            return;
        }
        const userId = currentUser.uid;
        const userDocRef = doc(db, 'users', userId);

        try {
            await updateDoc(userDocRef, { paymentStatus: 'PENDING_VERIFICATION' });
            
            setTimeout(() => {
                (async () => {
                    try {
                        const userAfterDelay = auth.currentUser;
                        if (userAfterDelay && userAfterDelay.uid === userId) {
                            
                            const userDoc = await getDoc(userDocRef);
                            if (userDoc.exists() && userDoc.data()?.paymentStatus === 'PENDING_VERIFICATION') {
                                await updateDoc(userDocRef, { paymentStatus: 'VERIFIED', balance: 0 });
                                await addTransaction(userId, TransactionType.JOINING_FEE, 'One-time joining fee', 0);
                                setShowWelcomeModal(true);
                            } else {
                                console.log("User status is no longer 'PENDING_VERIFICATION'. Skipping update.");
                            }
                        } else {
                            console.log("User changed during verification delay. Aborting.");
                        }
                    } catch(error) {
                        console.error("Error during the final verification step:", error);
                        alert("A final error occurred during verification. Please contact support.");
                    }
                })();
            }, 10000);
        } catch (error) {
            console.error("Error updating payment status to pending:", error);
            alert("There was an error submitting your payment proof. Please try again.");
        }
    };

    const handleCreateTask = async (taskData: Omit<Task, 'id'>, quantity: number, totalCost: number) => {
        if (!userProfile) return;
        try {
            await updateBalance(userProfile.uid, -totalCost);
            try {
                await addTransaction(userProfile.uid, TransactionType.TASK_CREATION, `Campaign: ${taskData.title}`, -totalCost);
                // The global task list logic remains in localStorage as per original design.
                const newUserTask: UserCreatedTask = {
                    id: `utask_${Date.now()}`, ...taskData, quantity, completions: 0, views: 0
                };
                const updatedGlobalTasks = [...userTasks, newUserTask];
                setUserTasks(updatedGlobalTasks);
                localStorage.setItem('globalUserTasks', JSON.stringify(updatedGlobalTasks));
            } catch (transactionError) {
                console.error("Task transaction failed, reverting balance.", transactionError);
                await updateBalance(userProfile.uid, totalCost); // Revert
                throw transactionError; // Re-throw to be caught by outer handler
            }
        } catch (error) {
            console.error("Error creating task:", error);
            alert("An error occurred while creating your task. Please check your balance and try again.");
        }
    };

    const handleTaskView = (taskId: string) => {
        const newTasks = userTasks.map(task => 
            task.id === taskId ? { ...task, views: task.views + 1 } : task
        );
        setUserTasks(newTasks);
        localStorage.setItem('globalUserTasks', JSON.stringify(newTasks));
    };

    const handleCompleteTask = async (taskId: string) => {
        if (!userProfile) return;
        const task = userTasks.find(t => t.id === taskId);
        if (!task || userProfile.completedTaskIds?.includes(taskId)) return;
        try {
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, {
                completedTaskIds: arrayUnion(taskId)
            });
            await updateBalance(userProfile.uid, task.reward);
            await addTransaction(userProfile.uid, TransactionType.EARNING, `Completed: ${task.title}`, task.reward);

            // Update global task list in localStorage
            const updatedUserTasks = userTasks.map(t =>
                t.id === taskId ? { ...t, completions: t.completions + 1 } : t
            );
            setUserTasks(updatedUserTasks);
            localStorage.setItem('globalUserTasks', JSON.stringify(updatedUserTasks));
        } catch (error) {
            console.error("Error completing task:", error);
            alert("Failed to record task completion. Please try again.");
        }
    };

    const handleWithdraw = async (amount: number, details: WithdrawalDetails) => {
        if (!userProfile) return;
        const userId = userProfile.uid;

        try {
            await runTransaction(db, async (transaction) => {
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userDocRef);

                if (!userDoc.exists()) {
                    throw "User document does not exist!";
                }

                const currentBalance = userDoc.data().balance || 0;
                if (currentBalance < amount) {
                    throw "Insufficient balance.";
                }

                // Deduct from balance
                transaction.update(userDocRef, { balance: increment(-amount) });

                // Create request in top-level withdrawalRequests collection
                const withdrawalRequestRef = doc(collection(db, 'withdrawalRequests'));
                transaction.set(withdrawalRequestRef, {
                    userId: userId,
                    username: userProfile.username, // For easier admin review
                    amount: amount,
                    status: 'Pending',
                    ...details,
                    createdAt: serverTimestamp()
                });

                // Create history record in user's transactions sub-collection
                const transactionHistoryRef = doc(collection(db, 'users', userId, 'transactions'));
                transaction.set(transactionHistoryRef, {
                    type: TransactionType.WITHDRAWAL,
                    description: `Withdrawal via ${details.method}`,
                    amount: -amount,
                    date: serverTimestamp(),
                    status: 'Pending',
                    withdrawalDetails: details
                });
            });

            // Update saved details (can be outside transaction)
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, { savedWithdrawalDetails: details });
        } catch (error) {
            console.error("Error processing withdrawal:", error);
            alert(`There was an error processing your withdrawal request. ${error}`);
        }
    };

    const handleSubscribeToJob = async (plan: JobSubscriptionPlan, cost: number) => {
        if (!userProfile) return;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        const subscription = { 
            plan, 
            expiryDate: expiryDate.toLocaleDateString(),
            applicationsToday: 0,
            lastApplicationDate: new Date().toISOString().split('T')[0]
        };
        try {
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, { jobSubscription: subscription });
            await updateBalance(userProfile.uid, -cost);
            await addTransaction(userProfile.uid, TransactionType.JOB_SUBSCRIPTION, `Subscribed to ${plan} plan`, -cost);
        } catch (error) {
            console.error("Error subscribing to job plan:", error);
            alert("Failed to subscribe. Please check your balance and try again.");
        }
    };

    const handleApplyForJob = async (jobId: string) => {
        if (!userProfile || !userProfile.jobSubscription) return;
        
        try {
            let subscription = { ...userProfile.jobSubscription };
            const today = new Date().toISOString().split('T')[0];

            if (subscription.lastApplicationDate !== today) {
                subscription.applicationsToday = 0;
                subscription.lastApplicationDate = today;
            }

            const limits = { Starter: 5, Growth: 15, Business: Infinity, Enterprise: Infinity };
            const limit = limits[subscription.plan] || 0;

            if (subscription.applicationsToday < limit) {
                subscription.applicationsToday += 1;
                const job = jobs.find(j => j.id === jobId);
                if (!job) return;

                const userDocRef = doc(db, 'users', userProfile.uid);
                await updateDoc(userDocRef, { jobSubscription: subscription });
                
                const applicationsColRef = collection(db, 'users', userProfile.uid, 'applications');
                await addDoc(applicationsColRef, {
                    jobId: job.id, jobTitle: job.title, date: serverTimestamp(), status: 'Submitted',
                });
                alert('Application submitted successfully!');
            } else {
                alert('You have reached your daily application limit.');
            }
        } catch (error) {
            console.error("Error applying for job:", error);
            alert("There was an error submitting your application. Please try again.");
        }
    };
    
    const handleUpdateProfile = async (updatedData: { name: string; email: string; }) => {
        if (!userProfile || !authUser) return;
        try {
            if (authUser.email !== updatedData.email) {
                await updateEmail(authUser, updatedData.email);
            }
            if (authUser.displayName !== updatedData.name) {
                await updateProfile(authUser, { displayName: updatedData.name });
            }
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, {
                username: updatedData.name,
                email: updatedData.email,
            });
        } catch(error: any) {
            alert(`Error updating profile: ${error.message}. Please re-login if you changed your email.`);
        }
    };

    const handleDeposit = async (amount: number, transactionId: string) => {
        if (!userProfile) return;
        try {
            const transactionsColRef = collection(db, 'users', userProfile.uid, 'transactions');
            await addDoc(transactionsColRef, {
                type: TransactionType.PENDING_DEPOSIT,
                description: `Deposit via TXID: ${transactionId}`, 
                amount, 
                date: serverTimestamp(),
                status: 'Pending'
            });
            alert(`Your deposit request for ${amount.toFixed(2)} Rs has been submitted and is pending verification.`);
        } catch (error) {
            console.error("Error submitting deposit:", error);
            alert("There was an error submitting your deposit. Please try again.");
        }
    };

    const handleSpinWin = async (amount: number) => {
        if (!userProfile) return;
        try {
            await updateBalance(userProfile.uid, amount);
            await addTransaction(userProfile.uid, TransactionType.EARNING, 'Spin Wheel Prize', amount);
        } catch (error) {
            console.error("Error processing spin win:", error);
        }
    };
    
    const handleBuySpin = async (cost: number): Promise<boolean> => {
        if (!userProfile || balance < cost) {
            return false;
        }
        try {
            await updateBalance(userProfile.uid, -cost);
            await addTransaction(userProfile.uid, TransactionType.SPIN_PURCHASE, `Spin purchase (${cost} Rs)`, -cost);
            return true;
        } catch (error) {
            console.error("Error buying spin:", error);
            // Revert balance if update succeeded but transaction failed
            try { await updateBalance(userProfile.uid, cost); } catch (revertError) { console.error("FATAL: Could not revert balance after failed spin purchase.", revertError); }
            return false;
        }
    };

    const handleSimulateReferral = async (level: 1 | 2) => {
        if(!userProfile) return;
        try {
            if (level === 1) {
                await addReferral(userProfile.uid);
                await updateBalance(userProfile.uid, 20);
                await addTransaction(userProfile.uid, TransactionType.REFERRAL, 'Level 1 Referral Bonus', 20);
            } else {
                await updateBalance(userProfile.uid, 5);
                await addTransaction(userProfile.uid, TransactionType.REFERRAL, 'Level 2 Referral Bonus', 5);
            }
        } catch(error) {
            console.error("Error simulating referral:", error);
        }
    }
    
    const handlePinSet = async (newPin: string) => {
        if (!userProfile) return;
        try {
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, { walletPin: newPin });
            setShowPinModal(false);
        } catch (error) {
            console.error("Error setting PIN:", error);
            alert("Failed to set PIN. Please try again.");
        }
    };

    const handlePinSkip = async () => {
        if (!userProfile) return;
        try {
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, { walletPin: 'SKIPPED' });
            setShowPinModal(false);
        } catch (error) {
            console.error("Error skipping PIN setup:", error);
            alert("An error occurred. Please try again.");
        }
    };
    
    // Derived state
    const referralEarnings = useMemo(() => transactions.filter(tx => tx.type === TransactionType.REFERRAL).reduce((sum, tx) => sum + tx.amount, 0), [transactions]);
    const tasksCompletedCount = useMemo(() => userProfile?.completedTaskIds?.length || 0, [userProfile]);
    const availableTasks = useMemo(() => userTasks.filter(task => task.completions < task.quantity), [userTasks]);

    // --- RENDER LOGIC ---
    if (isAuthLoading) {
        return <div className="bg-[#0a192f] min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }
    
    if (showLanding && !authUser) {
        return <LandingView onGetStarted={() => setShowLanding(false)} />;
    }

    if (!authUser) {
        return <AuthView onLogin={handleLogin} onSignup={handleSignup} />;
    }

    if (userProfile && userProfile.paymentStatus === 'UNPAID') {
        return <PaymentView onSubmit={handlePaymentSubmit} />;
    }

    if (userProfile && userProfile.paymentStatus === 'PENDING_VERIFICATION') {
        return <PendingVerificationView />;
    }
    
    if (!userProfile) {
        return <div className="bg-[#0a192f] min-h-screen flex items-center justify-center text-white">Loading user profile...</div>;
    }

    return (
        <div className="bg-[#0a192f] text-slate-300 min-h-screen font-sans flex">
            {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
            {showPinModal && (
                <PinLockView 
                    mode={showPinModal}
                    pinToVerify={userProfile.walletPin || undefined}
                    onClose={() => setShowPinModal(false)}
                    onPinCorrect={() => {
                        setIsWalletLocked(false);
                        setShowPinModal(false);
                        setView('WALLET');
                        setViewHistory(prev => [...prev, 'WALLET']);
                    }}
                    onPinSet={handlePinSet}
                    onSkip={handlePinSkip}
                />
            )}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <Sidebar activeView={view} setActiveView={handleSetActiveView} isSidebarOpen={isSidebarOpen} />
            <div className={`flex-1 flex flex-col transition-all duration-300 lg:ml-64`}>
                <Header activeView={view} balance={balance} username={userProfile.username} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} canGoBack={viewHistory.length > 1} onBack={handleBack} />
                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    <div key={view} className="animate-fade-in">
                        {(() => {
                            switch (view) {
                                case 'DASHBOARD': return <DashboardView balance={balance} tasksCompleted={tasksCompletedCount} referrals={userProfile.referralCount} setActiveView={handleSetActiveView} transactions={transactions} onSimulateNewTask={()=>{}} />;
                                case 'EARN': return <EarnView tasks={availableTasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile.completedTaskIds} />;
                                case 'SPIN_WHEEL': return <SpinWheelView onWin={handleSpinWin} balance={balance} onBuySpin={handleBuySpin} />;
                                case 'WALLET': return <WalletView balance={balance} pendingRewards={pendingRewards} transactions={transactions} onWithdraw={handleWithdraw} username={userProfile.username} savedDetails={userProfile.savedWithdrawalDetails} hasPin={!!userProfile.walletPin} onSetupPin={() => setShowPinModal('set')} />;
                                case 'DEPOSIT': return <DepositView onDeposit={handleDeposit} />;
                                case 'CREATE_TASK': return <CreateTaskView balance={balance} onCreateTask={handleCreateTask} />;
                                case 'TASK_HISTORY': return <TaskHistoryView userTasks={userTasks} />;
                                case 'INVITE': return <InviteView referrals={{level1: userProfile.referralCount, level2: 0}} referralEarnings={referralEarnings} onSimulateReferral={handleSimulateReferral} username={userProfile.username} />;
                                case 'PROFILE_SETTINGS': return <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />;
                                case 'HOW_IT_WORKS': return <HowItWorksView />;
                                case 'ABOUT_US': return <AboutUsView />;
                                case 'CONTACT_US': return <ContactUsView />;
                                case 'PRIVACY_POLICY': return <PrivacyPolicyView />;
                                case 'TERMS_CONDITIONS': return <TermsAndConditionsView />;
                                case 'JOBS': return <JobsView userProfile={userProfile} balance={balance} jobs={jobs} onSubscribe={handleSubscribeToJob} onApply={handleApplyForJob} applications={applications} />;
                                case 'MY_APPLICATIONS': return <MyApplicationsView applications={applications} />;
                                default: return <div>Not Found</div>;
                            }
                        })()}
                    </div>
                </main>
                <Footer setActiveView={handleSetActiveView} />
            </div>
            <AIAgentChatbot />
        </div>
    );
};

export default App;