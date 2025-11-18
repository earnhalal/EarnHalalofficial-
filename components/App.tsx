// App.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import BottomNav from './Footer';
import AuthView from './AuthView';
import PaymentView from './PaymentView';
import PendingVerificationView from './PendingVerificationView';
import LandingView from './LandingView';
import NotificationBanner from './NotificationBanner';
import DepositView from './DepositView';
import SpinWheelView from './SpinWheelView';
import PlayAndEarnView from './PlayAndEarnView';
import PinLockView from './PinLockView';
import AIAgentChatbot from './AIAgentChatbot';
import WelcomeModal from './WelcomeModal';
import MyApplicationsView from './MyApplicationsView';
import LudoGame from './games/LudoGame';
import LotteryGame from './games/LotteryGame';
import CoinFlipGame from './games/CoinFlipGame';
import MinesGame from './games/MinesGame';
import SocialGroupsView from './SocialGroupsView';
import LoadingScreen from './LoadingScreen';
import NotificationToast from './NotificationToast';
import { TagIcon, ArrowUpCircleIcon, GameControllerIcon } from './icons';


import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, PaymentStatus, SocialGroup, Referral } from '../types';
import { TransactionType, TaskType } from '../types';

import { auth, db, storage, serverTimestamp, increment, arrayUnion } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction, where, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


// --- New Data & Types ---
export interface AppUpdate {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    type: 'New Feature' | 'Improvement' | 'Game Release';
    // FIX: Using a more specific type for the icon element allows cloning with className without TypeScript errors.
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    color: string;
}

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

const appUpdates: AppUpdate[] = [
    {
        id: 'v1.2.0-games',
        version: '1.2.0',
        date: 'July 26, 2024',
        title: 'Coin Flip & Mines Games Live!',
        description: 'Test your luck with Coin Flip or your strategy in Mines. Two new exciting games have been added to the Play & Earn section.',
        type: 'Game Release',
        icon: <GameControllerIcon className="w-5 h-5" />,
        color: 'text-purple-400'
    },
    {
        id: 'v1.1.5-ludo-lottery',
        version: '1.1.5',
        date: 'July 24, 2024',
        title: 'Ludo & Lottery Games Arrived',
        description: 'Challenge players in Ludo Star or try your luck in the Daily Lottery. More ways to Play & Earn are now available for everyone.',
        type: 'Game Release',
        icon: <TagIcon className="w-5 h-5" />,
        color: 'text-blue-400'
    },
    {
        id: 'v1.1.0-ai-chatbot',
        version: '1.1.0',
        date: 'July 22, 2024',
        title: 'AI Support Chatbot',
        description: `Meet our new AI Support Agent! Get instant answers to your questions about tasks, withdrawals, and more, 24/7. Just click the chat icon!`,
        type: 'Improvement',
        icon: <ArrowUpCircleIcon className="w-5 h-5" />,
        color: 'text-green-400'
    },
];

// --- New Component Definition ---
interface UpdatesViewProps {
    updates: AppUpdate[];
    seenIds: string[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const UpdatesView: React.FC<UpdatesViewProps> = ({ updates, seenIds, onMarkAsRead, onMarkAllAsRead }) => {
    const unreadCount = updates.filter(u => !seenIds.includes(u.id)).length;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg max-w-4xl mx-auto text-gray-800">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-bold">Inbox</h2>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                        Mark all as read
                    </button>
                )}
            </div>
            {updates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No updates yet.</p>
            ) : (
                <div className="space-y-4">
                    {updates.map(update => {
                        const isUnread = !seenIds.includes(update.id);
                        return (
                            <div
                                key={update.id}
                                onClick={() => onMarkAsRead(update.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                                    isUnread ? 'bg-emerald-50 hover:bg-emerald-100 border-l-4 border-emerald-500' : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 ${update.color}`}>
                                        {React.cloneElement(update.icon, { className: "w-5 h-5" })}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className={`font-bold text-lg ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{update.title}</h3>
                                            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">{update.date}</p>
                                        </div>
                                        <p className={`text-sm mt-1 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>{update.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeView, setActiveViewInternal] = useState<View>('DASHBOARD');
  const [baseTransactions, setBaseTransactions] = useState<Transaction[]>([]);
  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Record<string, Transaction['status']>>({});
  const [depositStatuses, setDepositStatuses] = useState<Record<string, Transaction['status']>>({});
  const [tasks, setTasks] = useState<UserCreatedTask[]>([]);
  const [userCreatedTasks, setUserCreatedTasks] = useState<UserCreatedTask[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([]);
  const [userSocialGroups, setUserSocialGroups] = useState<SocialGroup[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
  const [showPinLock, setShowPinLock] = useState(false);
  const [pinLockMode, setPinLockMode] = useState<'set' | 'enter'>('set');
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [seenUpdateIds, setSeenUpdateIds] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevTransactionsRef = useRef<Transaction[]>([]);
  const prevUserCreatedTasksRef = useRef<UserCreatedTask[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // This effect checks the URL path on load. If it's '/signup',
  // it sets the app state to show the signup form, enabling referral links.
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/signup') {
      setAuthAction('signup');
    }
  }, []);

  const transactions = useMemo(() => {
    return baseTransactions.map(tx => {
        const newTx = { ...tx };
        if (tx.type === TransactionType.WITHDRAWAL && tx.withdrawalRequestId && withdrawalStatuses[tx.withdrawalRequestId]) {
            newTx.status = withdrawalStatuses[tx.withdrawalRequestId];
        }
        if (tx.type === TransactionType.PENDING_DEPOSIT && tx.depositRequestId && depositStatuses[tx.depositRequestId]) {
            newTx.status = depositStatuses[tx.depositRequestId];
            if (depositStatuses[tx.depositRequestId] === 'Approved') {
                newTx.type = TransactionType.DEPOSIT;
            }
        }
        return newTx;
    });
  }, [baseTransactions, withdrawalStatuses, depositStatuses]);


  // --- Data Fetching & Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            const wasUnpaid = userProfile?.paymentStatus === 'UNPAID';
            
            // MIGRATION: Ensure existing users have a referral code.
            if (!profileData.referralCode) {
                const newReferralCode = firebaseUser.uid.substring(0, 8);
                updateDoc(userDocRef, { referralCode: newReferralCode })
                    .catch(e => console.error("Failed to generate referral code:", e));
                profileData.referralCode = newReferralCode; // Optimistic update
            }

            setUserProfile(profileData);
            
            if (profileData.paymentStatus === 'VERIFIED' && wasUnpaid) {
              setShowWelcomeModal(true);
            }

          } else {
            console.warn("User profile not found on login, might be a race condition during signup.");
          }
        }, (error) => {
            console.error("Error listening to user profile:", error);
        });

        const transactionsQuery = query(collection(db, "users", firebaseUser.uid, "transactions"), orderBy("date", "desc"));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const trans: Transaction[] = [];
          snapshot.forEach(doc => trans.push({ id: doc.id, ...doc.data() } as Transaction));
          setBaseTransactions(trans);
        }, (error) => {
            console.error("Error listening to transactions:", error);
        });
        
        const withdrawalRequestsQuery = query(collection(db, "withdrawal_requests"), where("userId", "==", firebaseUser.uid));
        const unsubscribeWithdrawals = onSnapshot(withdrawalRequestsQuery, (requestsSnapshot) => {
            setWithdrawalStatuses(currentStatuses => {
                const newStatuses = {...currentStatuses};
                let hasChanges = false;
                requestsSnapshot.docChanges().forEach(change => {
                    if (change.type === "added" || change.type === "modified") {
                        const data = change.doc.data();
                        const requestId = change.doc.id;
                        if (requestId && data.status && newStatuses[requestId] !== data.status) {
                            newStatuses[requestId] = data.status;
                            hasChanges = true;
                        }
                    }
                });
                return hasChanges ? newStatuses : currentStatuses;
            });
        }, (error) => {
            console.error("Error listening to withdrawal requests:", error);
        });
        
        const depositRequestsQuery = query(collection(db, "deposit_requests"), where("userId", "==", firebaseUser.uid));
        const unsubscribeDeposits = onSnapshot(depositRequestsQuery, (requestsSnapshot) => {
            setDepositStatuses(currentStatuses => {
                const newStatuses = {...currentStatuses};
                let hasChanges = false;
                requestsSnapshot.docChanges().forEach(change => {
                    if (change.type === "added" || change.type === "modified") {
                        const data = change.doc.data();
                        const requestId = change.doc.id;
                        if (requestId && data.status && newStatuses[requestId] !== data.status) {
                            newStatuses[requestId] = data.status;
                            hasChanges = true;
                        }
                    }
                });
                return hasChanges ? newStatuses : currentStatuses;
            });
        }, (error) => {
            console.error("Error listening to deposit requests:", error);
        });

        const userTasksQuery = query(collection(db, "tasks"), where("createdBy", "==", firebaseUser.uid), orderBy("submittedAt", "desc"));
        const unsubscribeUserTasks = onSnapshot(userTasksQuery, (snapshot) => {
            const uTasks: UserCreatedTask[] = [];
            snapshot.forEach(doc => uTasks.push({ id: doc.id, ...doc.data()} as UserCreatedTask));
            setUserCreatedTasks(uTasks);
        }, (error) => {
            console.error("Error listening to user-created tasks:", error);
        });

        const applicationsQuery = query(collection(db, "users", firebaseUser.uid, "applications"), orderBy("date", "desc"));
        const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
            const apps: Application[] = [];
            snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data()} as Application));
            setApplications(apps);
        }, (error) => {
            console.error("Error listening to applications:", error);
        });

        const userGroupsQuery = query(collection(db, 'social_groups'), where('submittedBy', '==', firebaseUser.uid), orderBy('submittedAt', 'desc'));
        const unsubscribeUserGroups = onSnapshot(userGroupsQuery, (snapshot) => {
            const groupsData: SocialGroup[] = [];
            snapshot.forEach(doc => groupsData.push({ id: doc.id, ...doc.data() } as SocialGroup));
            setUserSocialGroups(groupsData);
        }, console.error);
        
        const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribeReferrals = onSnapshot(referralsQuery, (snapshot) => {
            const referralsData: Referral[] = [];
            snapshot.forEach(doc => referralsData.push({ id: doc.id, ...doc.data() } as Referral));
            setReferrals(referralsData);
        }, console.error);


        return () => {
          unsubscribeProfile();
          unsubscribeTransactions();
          unsubscribeWithdrawals();
          unsubscribeDeposits();
          unsubscribeUserTasks();
          unsubscribeApplications();
          unsubscribeUserGroups();
          unsubscribeReferrals();
        };

      } else {
        setUser(null);
        setUserProfile(null);
        setBaseTransactions([]);
        setWithdrawalStatuses({});
        setTasks([]);
        setUserCreatedTasks([]);
        setJobs([]);
        setApplications([]);
        setActiveViewInternal('DASHBOARD');
        setIsLoading(false);
        setAuthAction(null);
      }
    });

    // Fetch global data
    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData: UserCreatedTask[] = [];
        snapshot.forEach(doc => tasksData.push({ id: doc.id, ...doc.data() } as UserCreatedTask));
        setTasks(tasksData);
    }, (error) => {
        console.error("Error fetching global tasks:", error);
    });

    const jobsQuery = query(collection(db, 'jobs'));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
        const jobsData: Job[] = [];
        snapshot.forEach(doc => jobsData.push({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobsData);
    }, (error) => {
        console.error("Error fetching global jobs:", error);
    });

    const groupsQuery = query(collection(db, 'social_groups'), where('status', '==', 'approved'), orderBy('submittedAt', 'desc'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
        const groupsData: SocialGroup[] = [];
        snapshot.forEach(doc => groupsData.push({ id: doc.id, ...doc.data() } as SocialGroup));
        setSocialGroups(groupsData);
    }, console.error);
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      unsubscribe();
      unsubscribeTasks();
      unsubscribeJobs();
      unsubscribeGroups();
    };
  }, []);

  useEffect(() => {
    try {
      const seenIdsRaw = localStorage.getItem('seenUpdateIds');
      setSeenUpdateIds(seenIdsRaw ? JSON.parse(seenIdsRaw) : []);

      const showBotRaw = localStorage.getItem('showChatbot');
      if (showBotRaw !== null) {
        setShowChatbot(JSON.parse(showBotRaw));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
    if ((user && userProfile) || !user) {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    const oldTransactions = prevTransactionsRef.current;
    const newNotifications: Notification[] = [];

    transactions.forEach(newTx => {
        const oldTx = oldTransactions.find(t => t.id === newTx.id);
        if (oldTx && oldTx.status === 'Pending' && newTx.status !== 'Pending') {
            const notificationId = `${newTx.id}_${newTx.status}`;
            if (!localStorage.getItem(notificationId)) {
                let title = '', message = '', type: 'success' | 'error' = 'success';
                const actionType = newTx.type === TransactionType.WITHDRAWAL ? 'Withdrawal' : 'Deposit';
                if (newTx.status === 'Approved' || newTx.status === 'Completed') {
                    title = `${actionType} Approved!`; message = `Your ${actionType.toLowerCase()} of Rs. ${Math.abs(newTx.amount)} has been processed.`;
                } else if (newTx.status === 'Rejected' || newTx.status === 'Failed') {
                    title = `${actionType} Rejected`; message = `Your ${actionType.toLowerCase()} of Rs. ${Math.abs(newTx.amount)} was rejected. Contact support.`; type = 'error';
                }
                if (title) { newNotifications.push({ id: notificationId, title, message, type }); localStorage.setItem(notificationId, 'true'); }
            }
        }
    });

    const oldTasks = prevUserCreatedTasksRef.current;
    userCreatedTasks.forEach(newTask => {
        const oldTask = oldTasks.find(t => t.id === newTask.id);
        if (oldTask && oldTask.status === 'pending' && newTask.status !== 'pending') {
            const notificationId = `${newTask.id}_${newTask.status}`;
            if (!localStorage.getItem(notificationId)) {
                let title = '', message = '', type: 'success' | 'error' = 'success';
                if (newTask.status === 'approved') {
                    title = 'Task Approved!'; message = `Your task "${newTask.title}" is now live.`;
                } else if (newTask.status === 'rejected') {
                    title = 'Task Rejected'; message = `Your task "${newTask.title}" was rejected.`; type = 'error';
                }
                if (title) { newNotifications.push({ id: notificationId, title, message, type }); localStorage.setItem(notificationId, 'true'); }
            }
        }
    });

    if (newNotifications.length > 0) setNotifications(prev => [...prev, ...newNotifications]);
    prevTransactionsRef.current = transactions;
    prevUserCreatedTasksRef.current = userCreatedTasks;

  }, [transactions, userCreatedTasks]);


  const handleAuthNavigation = useCallback((view: 'login' | 'signup') => {
      setAuthAction(view);
  }, []);

  const setActiveView = (view: View) => {
    if (view === activeView) return;
    setActiveViewInternal(view);
    setIsSidebarOpen(false);
  };

  const handleSignup = async (data: {username: string, email: string, phone: string, password: string, referralCode?: string}) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(userCredential.user, { displayName: data.username });

        const userDocRef = doc(db, "users", userCredential.user.uid);
        
        const newUserProfile: UserProfile = {
            uid: userCredential.user.uid,
            username: data.username,
            username_lowercase: data.username.toLowerCase(),
            email: data.email,
            phone: data.phone,
            joinedAt: serverTimestamp(),
            paymentStatus: 'UNPAID',
            jobSubscription: null,
            referralCount: 0,
            invitedCount: 0,
            totalReferralEarnings: 0,
            balance: 100,
            completedTaskIds: [],
            savedWithdrawalDetails: null,
            walletPin: null,
            isFingerprintEnabled: false,
            referralCode: userCredential.user.uid.substring(0, 8),
            tasksCompletedCount: 0,
        };

        const batch = writeBatch(db);

        // Check for a referral username and apply referral logic if it exists.
        // The 'referralCode' from the form now holds the referrer's username.
        if (data.referralCode && data.referralCode.trim() !== '') {
            const usersRef = collection(db, "users");
            // Find the referrer by their username, case-insensitively.
            const q = query(usersRef, where("username_lowercase", "==", data.referralCode.trim().toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const referrerDoc = querySnapshot.docs[0];

                // Prevent a user from referring themselves.
                if (referrerDoc.id === userCredential.user.uid) {
                    console.warn("User attempted to refer themselves. Skipping referral bonus.");
                } else {
                    // Link the new user to their referrer.
                    newUserProfile.referredBy = referrerDoc.id;
                    
                    // Atomically increment the referrer's invited count.
                    batch.update(referrerDoc.ref, { invitedCount: increment(1) });
                    
                    // Create a 'referrals' document to track the relationship and bonus status.
                    const referralDocRef = doc(collection(db, "referrals"));
                    const newReferral: Omit<Referral, 'id'> = {
                        referrerId: referrerDoc.id,
                        referredUserId: userCredential.user.uid,
                        referredUsername: data.username,
                        referredUserTasksCompleted: 0,
                        status: 'pending_referred_tasks',
                        bonusAmount: 200,
                        createdAt: serverTimestamp()
                    };
                    batch.set(referralDocRef, newReferral);
                }
            } else {
                // It's not a critical error if the referral username is invalid, so just log a warning.
                console.warn(`Referrer with username "${data.referralCode}" not found.`);
            }
        }
        
        batch.set(userDocRef, newUserProfile);
        
        const welcomeBonusRef = doc(collection(userDocRef, "transactions"));
        batch.set(welcomeBonusRef, {
            type: TransactionType.JOINING_FEE,
            description: "Joining Bonus",
            amount: 100,
            date: serverTimestamp()
        });

        await batch.commit();

    } catch (error: any) {
        console.error("Signup Error:", error);
        alert(`Signup failed: ${error.message}`);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('lastUserEmail', email);
      setAuthAction(null);
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    }
  };
  
  const handleLogout = () => {
      signOut(auth).catch(console.error);
  };
  
  const handlePaymentSubmit = async () => {
      if(!user) return;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { paymentStatus: 'PENDING_VERIFICATION' });
  };

  const payEligibleBonuses = useCallback(async (referralIds: string[]) => {
    for (const referralId of referralIds) {
        try {
            await runTransaction(db, async (transaction) => {
                const referralDocRef = doc(db, "referrals", referralId);
                const referralDoc = await transaction.get(referralDocRef);
                if (!referralDoc.exists() || referralDoc.data().status !== 'eligible') {
                    return; // Already paid or not eligible, skip.
                }

                const referral = referralDoc.data() as Referral;
                const referrerRef = doc(db, "users", referral.referrerId);
                
                transaction.update(referrerRef, {
                    balance: increment(referral.bonusAmount),
                    totalReferralEarnings: increment(referral.bonusAmount)
                });
                const transRef = doc(collection(referrerRef, "transactions"));
                transaction.set(transRef, {
                    type: TransactionType.REFERRAL,
                    description: `Bonus from ${referral.referredUsername}`,
                    amount: referral.bonusAmount,
                    date: serverTimestamp()
                });
                transaction.update(referralDocRef, { status: 'credited' });
            });
        } catch (e) {
            console.error(`Bonus payment transaction for referral ${referralId} failed:`, e);
        }
    }
  }, []);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!user || !userProfile) return;
    if (userProfile.completedTaskIds.includes(taskId)) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const userDocRef = doc(db, "users", user.uid);
    const taskDocRef = doc(db, "tasks", taskId);
    
    const batch = writeBatch(db);
    batch.update(userDocRef, {
        balance: increment(task.reward),
        completedTaskIds: arrayUnion(taskId),
        tasksCompletedCount: increment(1)
    });
    batch.update(taskDocRef, { completions: increment(1) });
    const newTransRef = doc(collection(userDocRef, "transactions"));
    batch.set(newTransRef, {
        type: TransactionType.EARNING,
        description: `Completed: ${task.title}`,
        amount: task.reward,
        date: serverTimestamp()
    });
    
    try {
      await batch.commit();

      // --- Post-commit referral checks ---
      const newTasksCompletedCount = (userProfile.tasksCompletedCount || 0) + 1;

      // Check if this user (as a referred user) has met their condition
      if (userProfile.referredBy) {
          const q = query(collection(db, "referrals"), where("referredUserId", "==", user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
              const referralDoc = snapshot.docs[0];
              const referralData = referralDoc.data() as Referral;
              
              if (referralData.status !== 'credited') {
                  const updateData: Partial<Referral> = { referredUserTasksCompleted: increment(1) };
                  
                  if (newTasksCompletedCount >= 10) {
                      const referrerDoc = await getDoc(doc(db, 'users', userProfile.referredBy));
                      if (referrerDoc.exists() && (referrerDoc.data().tasksCompletedCount || 0) >= 50) {
                          updateData.status = 'eligible';
                      } else {
                          updateData.status = 'pending_referrer_tasks';
                      }
                  }
                  await updateDoc(referralDoc.ref, updateData);
                  if (updateData.status === 'eligible') {
                      await payEligibleBonuses([referralDoc.id]);
                  }
              }
          }
      }

      // Check if this user (as a referrer) has met their condition
      if (newTasksCompletedCount >= 50) {
          const q = query(collection(db, "referrals"), where("referrerId", "==", user.uid), where("status", "==", "pending_referrer_tasks"));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
              const updateBatch = writeBatch(db);
              const newlyEligibleIds: string[] = [];
              snapshot.forEach(docSnap => {
                  updateBatch.update(docSnap.ref, { status: 'eligible' });
                  newlyEligibleIds.push(docSnap.id);
              });
              await updateBatch.commit();
              if (newlyEligibleIds.length > 0) {
                  await payEligibleBonuses(newlyEligibleIds);
              }
          }
      }

    } catch (error) {
       console.error("Task completion & referral check failed:", error);
    }
  }, [user, userProfile, tasks, payEligibleBonuses]);
  
  const handleTaskView = async (taskId: string) => {
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, { views: increment(1) });
  }

  const handleCreateTask = async (task: Omit<Task, 'id'>, quantity: number, totalCost: number) => {
      if(!user || !userProfile || userProfile.balance < totalCost) return;
      
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);

      const taskData = { ...task, quantity, completions: 0, views: 0, status: 'pending' as const, submittedAt: serverTimestamp(), createdBy: user.uid };
      const newTaskRef = doc(collection(db, "tasks"));
      batch.set(newTaskRef, taskData);
      batch.update(userDocRef, { balance: increment(-totalCost) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, { type: TransactionType.TASK_CREATION, description: `Campaign: ${task.title}`, amount: -totalCost, date: serverTimestamp() });
      await batch.commit();
  };
  
  const handleWithdraw = async (amount: number, details: WithdrawalDetails) => {
    if (!user || !userProfile) return;

    const action = async () => {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists() || userDoc.data().balance < amount) throw new Error("Insufficient balance.");
          const withdrawalRequestRef = doc(collection(db, "withdrawal_requests"));
          const userTransactionRef = doc(collection(userDocRef, "transactions"));
          transaction.update(userDocRef, { balance: increment(-amount), savedWithdrawalDetails: details });
          transaction.set(userTransactionRef, { type: TransactionType.WITHDRAWAL, description: `Withdrawal to ${details.method}`, amount: -amount, date: serverTimestamp(), withdrawalDetails: details, status: 'Pending', withdrawalRequestId: withdrawalRequestRef.id });
          transaction.set(withdrawalRequestRef, { userId: user.uid, username: userDoc.data().username, amount, withdrawalDetails: details, status: 'Pending', createdAt: serverTimestamp(), userTransactionId: userTransactionRef.id });
        });
      } catch (error) { console.error("Withdrawal failed:", error); }
    };
    
    if (userProfile.walletPin) { setPinLockMode('enter'); setShowPinLock(true); setPinAction(() => action); } 
    else { await action(); }
  };
  
  const handleSetPin = async (pin: string) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), { walletPin: pin });
      setShowPinLock(false);
      pinAction && pinAction();
      setPinAction(null);
  };
  
  const handlePinCorrect = () => {
      setShowPinLock(false);
      pinAction && pinAction();
      setPinAction(null);
  };
  
  const handleDeposit = async (amount: number, method: 'EasyPaisa' | 'JazzCash', transactionId: string) => {
    if (!user || !userProfile) throw new Error("User not logged in.");
    const userDocRef = doc(db, "users", user.uid);
    const batch = writeBatch(db);
    const depositRequestRef = doc(collection(db, "deposit_requests"));
    batch.set(depositRequestRef, { userId: user.uid, username: userProfile.username, amount, transactionId, method, status: 'Pending', createdAt: serverTimestamp() });
    const userTransactionRef = doc(collection(userDocRef, "transactions"));
    batch.set(userTransactionRef, { type: TransactionType.PENDING_DEPOSIT, description: `Deposit via ${method}`, amount, date: serverTimestamp(), status: 'Pending', depositDetails: { method, transactionId }, depositRequestId: depositRequestRef.id });
    await batch.commit();
  };

  const handleBuySpin = async (cost: number): Promise<boolean> => {
      if (!user || !userProfile || userProfile.balance < cost) return false;
      const userDocRef = doc(db, "users", user.uid);
      try {
          const batch = writeBatch(db);
          batch.update(userDocRef, { balance: increment(-cost) });
          const transRef = doc(collection(userDocRef, "transactions"));
          batch.set(transRef, { type: TransactionType.SPIN_PURCHASE, description: `Purchased a Spin`, amount: -cost, date: serverTimestamp() });
          await batch.commit();
          return true;
      } catch (e) { console.error(e); return false; }
  };
  
  const handleGameWin = async (amount: number, gameName: string) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, { type: TransactionType.GAME_WIN, description: `Won in ${gameName}`, amount, date: serverTimestamp() });
      await batch.commit();
  };

  const handleGameLoss = async (amount: number, gameName: string) => {
      if (!user || !userProfile || userProfile.balance < amount) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(-amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, { type: TransactionType.GAME_LOSS, description: `Bet in ${gameName}`, amount: -amount, date: serverTimestamp() });
      await batch.commit();
  };
  
  const handleCancelBet = async (amount: number, gameName: string) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, { type: TransactionType.BET_CANCELLED, description: `Cancelled Bet in ${gameName}`, amount, date: serverTimestamp() });
      await batch.commit();
  };


  const handleSubscribe = async (plan: JobSubscriptionPlan, cost: number) => {
     if(!user || !userProfile || userProfile.balance < cost) return;
     const expiry = new Date();
     expiry.setDate(expiry.getDate() + (plan === 'Business' || plan === 'Enterprise' ? 60 : 30));
     const userDocRef = doc(db, "users", user.uid);
     const batch = writeBatch(db);
     batch.update(userDocRef, { balance: increment(-cost), jobSubscription: { plan, expiryDate: expiry.toISOString().split('T')[0], applicationsToday: 0, lastApplicationDate: new Date().toISOString().split('T')[0] } });
     const transRef = doc(collection(userDocRef, "transactions"));
     batch.set(transRef, { type: TransactionType.JOB_SUBSCRIPTION, description: `${plan} Plan Subscription`, amount: -cost, date: serverTimestamp() });
     await batch.commit();
  };

  const handleApply = async (jobId: string) => {
    if (!user || !userProfile || !userProfile.jobSubscription) return;
    const { plan, applicationsToday, lastApplicationDate } = userProfile.jobSubscription;
    const today = new Date().toISOString().split('T')[0];
    let dailyCount = lastApplicationDate !== today ? 0 : applicationsToday;
    const limit = plan === 'Starter' ? 5 : plan === 'Growth' ? 15 : Infinity;
    if (dailyCount >= limit) { alert("Daily application limit reached."); return; }
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const userDocRef = doc(db, "users", user.uid);
    const batch = writeBatch(db);
    batch.update(userDocRef, { jobSubscription: { ...userProfile.jobSubscription, applicationsToday: increment(1), lastApplicationDate: today } });
    const appRef = doc(collection(userDocRef, "applications"));
    batch.set(appRef, { jobId, jobTitle: job.title, date: serverTimestamp(), status: 'Submitted' });
    await batch.commit();
  };
  
  const handleUpdateProfile = async (data: { name: string; email: string; password?: string }) => {
    if(!user) throw new Error("Not logged in");
    if (data.name !== user.displayName) await updateProfile(user, { displayName: data.name });
    if (data.email !== user.email) await updateEmail(user, data.email);
    if (data.password) await updatePassword(user, data.password);
    await updateDoc(doc(db, "users", user.uid), { username: data.name, email: data.email });
  };
  
  const handleRequestPermission = () => { Notification.requestPermission().then(setNotificationPermission); };
  const handleCreateSocialGroup = async (groupData: {url: string, title: string, description: string, category: SocialGroup['category']}) => {
    if (!user) return;
    await addDoc(collection(db, "social_groups"), { ...groupData, submittedBy: user.uid, submittedAt: serverTimestamp(), status: 'pending' });
  };
  const unreadUpdatesCount = useMemo(() => appUpdates.filter(u => !seenUpdateIds.includes(u.id)).length, [seenUpdateIds]);
  const handleMarkUpdateAsRead = (id: string) => { if (seenUpdateIds.includes(id)) return; const newSeenIds = [...seenUpdateIds, id]; setSeenUpdateIds(newSeenIds); localStorage.setItem('seenUpdateIds', JSON.stringify(newSeenIds)); };
  const handleMarkAllUpdatesAsRead = () => { const allIds = appUpdates.map(u => u.id); setSeenUpdateIds(allIds); localStorage.setItem('seenUpdateIds', JSON.stringify(allIds)); };
  const handleToggleChatbot = (isVisible: boolean) => { setShowChatbot(isVisible); localStorage.setItem('showChatbot', JSON.stringify(isVisible)); };
  const handleSetFingerprintEnabled = async () => { if (!user) return; await updateDoc(doc(db, "users", user.uid), { isFingerprintEnabled: true }); };
  const handleCloseNotification = (id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); };

  const renderContent = () => {
    const views: Record<View, React.ReactNode> = {
      DASHBOARD: <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.tasksCompletedCount ?? 0} invitedCount={userProfile?.invitedCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView userProfile={userProfile} referrals={referrals} />,
      SPIN_WHEEL: <SpinWheelView onWin={(amount) => handleGameWin(amount, 'Spin & Win')} balance={userProfile?.balance ?? 0} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} showChatbot={showChatbot} onToggleChatbot={handleToggleChatbot} onSetFingerprintEnabled={handleSetFingerprintEnabled} />,
      HOW_IT_WORKS: <HowItWorksView />, ABOUT_US: <AboutUsView />, CONTACT_US: <ContactUsView />,
      JOBS: <JobsView userProfile={userProfile} balance={userProfile?.balance ?? 0} jobs={jobs} onSubscribe={handleSubscribe} onApply={handleApply} applications={applications} />,
      MY_APPLICATIONS: <MyApplicationsView applications={applications} />,
      PRIVACY_POLICY: <PrivacyPolicyView />, TERMS_CONDITIONS: <TermsAndConditionsView />,
      LUDO_GAME: <LudoGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      LOTTERY_GAME: <LotteryGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      COIN_FLIP_GAME: <CoinFlipGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      MINES_GAME: <MinesGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      SOCIAL_GROUPS: <SocialGroupsView allGroups={socialGroups} myGroups={userSocialGroups} onSubmitGroup={handleCreateSocialGroup} />,
      UPDATES_INBOX: <UpdatesView updates={appUpdates} seenIds={seenUpdateIds} onMarkAsRead={handleMarkUpdateAsRead} onMarkAllAsRead={handleMarkAllUpdatesAsRead} />,
    };
    return views[activeView] || <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.tasksCompletedCount ?? 0} invitedCount={userProfile?.invitedCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} />;
  };

  if (isLoading) return <LoadingScreen />;
  if (!user) { if (authAction) { return <AuthView onSignup={handleSignup} onLogin={handleLogin} initialView={authAction} />; } return <LandingView onGetStarted={handleAuthNavigation} />; }
  if (!userProfile) return <LoadingScreen />;
  if (userProfile.paymentStatus === 'UNPAID') return <PaymentView onSubmit={handlePaymentSubmit} />;
  if (userProfile.paymentStatus === 'PENDING_VERIFICATION') return <PendingVerificationView />;

  return (
    <>
      {notificationPermission === 'default' && <NotificationBanner onRequestPermission={handleRequestPermission} onDismiss={() => setNotificationPermission('dismissed')} />}
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      <div className="fixed top-4 right-4 z-[100] space-y-3 w-full max-w-sm"> {notifications.map(n => (<NotificationToast key={n.id} title={n.title} message={n.message} type={n.type} onClose={() => handleCloseNotification(n.id)} />))} </div>
      <div className="flex flex-col md:flex-row bg-gradient-to-b from-green-50/50 to-white min-h-screen font-sans">
          <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} unreadUpdatesCount={unreadUpdatesCount} />
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
          <div className="flex-1 flex flex-col w-full">
              <Header username={userProfile.username} setIsSidebarOpen={setIsSidebarOpen} setActiveView={setActiveView} />
              <main className="flex-grow pb-20 md:pb-6 p-4">{renderContent()}</main>
              <BottomNav activeView={activeView} setActiveView={setActiveView} />
          </div>
          {showChatbot && <AIAgentChatbot />}
          {showPinLock && <PinLockView mode={pinLockMode} onClose={() => { setShowPinLock(false); setPinAction(null); }} onPinCorrect={handlePinCorrect} onPinSet={handleSetPin} onSkip={() => setShowPinLock(false)} pinToVerify={userProfile.walletPin ?? undefined} />}
      </div>
    </>
  );
};

export default App;