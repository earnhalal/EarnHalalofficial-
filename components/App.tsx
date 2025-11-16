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
import { TagIcon, ArrowUpCircleIcon, GameControllerIcon } from './icons';


import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, PaymentStatus, SocialGroup } from '../types';
import { TransactionType, TaskType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction, where, writeBatch } from 'firebase/firestore';


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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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


  // --- Data Fetching & Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Setup Firestore listener for the user's profile
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            const wasUnpaid = userProfile?.paymentStatus === 'UNPAID';
            setUserProfile(profileData);
            
            if (profileData.paymentStatus === 'VERIFIED' && wasUnpaid) {
              setShowWelcomeModal(true);
            }

          } else {
            // Create a new user profile
            const username = firebaseUser.displayName || `user_${firebaseUser.uid.substring(0, 6)}`;
            const referrerMatch = window.location.pathname.match(/\/ref\/(\w+)/);
            const referrerUsername = referrerMatch ? referrerMatch[1] : null;

            const newUserProfile: UserProfile = {
              uid: firebaseUser.uid,
              username: username,
              username_lowercase: username.toLowerCase(),
              email: firebaseUser.email || '',
              phone: '',
              joinedAt: serverTimestamp(),
              paymentStatus: 'UNPAID',
              jobSubscription: null,
              referralCount: 0,
              balance: 0,
              completedTaskIds: [],
              savedWithdrawalDetails: null,
              walletPin: null
            };
            
            setDoc(userDocRef, newUserProfile).catch(console.error);
            setUserProfile(newUserProfile);
          }
        }, (error) => {
            console.error("Error listening to user profile:", error);
        });

        // Setup listeners for subcollections
        const transactionsQuery = query(collection(db, "users", firebaseUser.uid, "transactions"), orderBy("date", "desc"));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const trans: Transaction[] = [];
          snapshot.forEach(doc => trans.push({ id: doc.id, ...doc.data() } as Transaction));
          setTransactions(trans);
        }, (error) => {
            console.error("Error listening to transactions:", error);
        });
        
        const userTasksQuery = query(collection(db, "users", firebaseUser.uid, "user_tasks"));
        const unsubscribeUserTasks = onSnapshot(userTasksQuery, (snapshot) => {
            const uTasks: UserCreatedTask[] = [];
            snapshot.forEach(doc => uTasks.push({ id: doc.id, ...doc.data()} as UserCreatedTask));
            setUserCreatedTasks(uTasks);
        }, (error) => {
            console.error("Error listening to user tasks:", error);
        });

        const applicationsQuery = query(collection(db, "users", firebaseUser.uid, "applications"), orderBy("date", "desc"));
        const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
            const apps: Application[] = [];
            snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data()} as Application));
            setApplications(apps);
        }, (error) => {
            console.error("Error listening to applications:", error);
        });

        // Fetch user's submitted groups
        const userGroupsQuery = query(collection(db, 'social_groups'), where('submittedBy', '==', firebaseUser.uid), orderBy('submittedAt', 'desc'));
        const unsubscribeUserGroups = onSnapshot(userGroupsQuery, (snapshot) => {
            const groupsData: SocialGroup[] = [];
            snapshot.forEach(doc => groupsData.push({ id: doc.id, ...doc.data() } as SocialGroup));
            setUserSocialGroups(groupsData);
        }, console.error);


        return () => {
          unsubscribeProfile();
          unsubscribeTransactions();
          unsubscribeUserTasks();
          unsubscribeApplications();
          unsubscribeUserGroups();
        };

      } else {
        setUser(null);
        setUserProfile(null);
        setTransactions([]);
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

    // Fetch all approved social groups
    const groupsQuery = query(collection(db, 'social_groups'), where('status', '==', 'approved'), orderBy('submittedAt', 'desc'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
        const groupsData: SocialGroup[] = [];
        snapshot.forEach(doc => groupsData.push({ id: doc.id, ...doc.data() } as SocialGroup));
        setSocialGroups(groupsData);
    }, console.error);
    
    // Check notification permission
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

  // Effect for loading settings from localStorage
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
      localStorage.removeItem('seenUpdateIds');
      localStorage.removeItem('showChatbot');
    }
  }, []);
  
  // Set loading to false once profile is loaded or user is confirmed logged out
  useEffect(() => {
    if ((user && userProfile) || !user) {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  const handleAuthNavigation = useCallback((view: 'login' | 'signup') => {
      setAuthAction(view);
  }, []);

  // --- Handlers ---
  const setActiveView = (view: View) => {
    if (view === activeView) return;
    setActiveViewInternal(view);
    setIsSidebarOpen(false);
  };

  const handleSignup = async (data: {username: string, email: string, phone: string, password: string, referrer?: string}) => {
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
            balance: 25, // FREE BONUS
            completedTaskIds: [],
            savedWithdrawalDetails: null,
            walletPin: null,
            isFingerprintEnabled: false,
        };
        await setDoc(userDocRef, newUserProfile);
        
        // Add welcome bonus transaction
        await addDoc(collection(userDocRef, "transactions"), {
            type: TransactionType.REFERRAL,
            description: "Welcome Bonus",
            amount: 25,
            date: serverTimestamp()
        });

    } catch (error: any) {
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
  
  const handleCompleteTask = async (taskId: string) => {
    if(!user || !userProfile) return;
    if(userProfile.completedTaskIds.includes(taskId)) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const userDocRef = doc(db, "users", user.uid);
    const taskDocRef = doc(db, "tasks", taskId);
    
    try {
      await runTransaction(db, async (transaction) => {
        transaction.update(userDocRef, {
            balance: increment(task.reward),
            completedTaskIds: arrayUnion(taskId)
        });
        transaction.update(taskDocRef, {
            completions: increment(1)
        });

        // Add transaction record
        const transColRef = collection(userDocRef, "transactions");
        const newTransRef = doc(transColRef); // Create a new doc reference
        transaction.set(newTransRef, {
            type: TransactionType.EARNING,
            description: `Completed: ${task.title}`,
            amount: task.reward,
            date: serverTimestamp()
        });
      });
    } catch (error) {
        console.error("Task completion failed:", error);
    }
  };
  
  const handleTaskView = async (taskId: string) => {
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, { views: increment(1) });
  }

  const handleCreateTask = async (task: Omit<Task, 'id'>, quantity: number, totalCost: number) => {
      if(!user || !userProfile || userProfile.balance < totalCost) return;
      
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);

      // 1. Add task to global 'tasks' collection
      const newTaskRef = doc(collection(db, "tasks"));
      batch.set(newTaskRef, {
          ...task,
          quantity,
          completions: 0,
          views: 0,
      });

      // 2. Add task to user's 'user_tasks' subcollection
      const userTaskRef = doc(collection(userDocRef, "user_tasks"));
       batch.set(userTaskRef, {
          ...task,
          quantity,
          completions: 0,
          views: 0,
      });

      // 3. Deduct balance from user
      batch.update(userDocRef, { balance: increment(-totalCost) });

      // 4. Add transaction record
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, {
          type: TransactionType.TASK_CREATION,
          description: `Campaign: ${task.title}`,
          amount: -totalCost,
          date: serverTimestamp(),
      });
      
      await batch.commit();
  };
  
  const handleWithdraw = async (amount: number, details: WithdrawalDetails) => {
    if(!user || !userProfile || userProfile.balance < amount) return;
    
    const action = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const batch = writeBatch(db);

        // 1. Deduct balance and save withdrawal details
        batch.update(userDocRef, {
            balance: increment(-amount),
            savedWithdrawalDetails: details,
        });

        // 2. Add transaction record
        const transRef = doc(collection(userDocRef, "transactions"));
        batch.set(transRef, {
            type: TransactionType.WITHDRAWAL,
            description: `Withdrawal to ${details.method}`,
            amount: -amount,
            date: serverTimestamp(),
            withdrawalDetails: details,
            status: 'Pending'
        });
        await batch.commit();
    };
    
    if (userProfile.walletPin) {
        setPinLockMode('enter');
        setShowPinLock(true);
        setPinAction(() => action); // Use a function to prevent stale closure
    } else {
        await action();
    }
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
  
  const handleDeposit = async (amount: number, transactionId: string) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      await addDoc(collection(userDocRef, "transactions"), {
          type: TransactionType.PENDING_DEPOSIT,
          description: `Deposit via EasyPaisa`,
          amount: amount,
          date: serverTimestamp(),
          status: 'Pending',
          withdrawalDetails: {
              method: "EasyPaisa",
              accountName: "M-WASEEM",
              accountNumber: transactionId,
          }
      });
  };

  const handleBuySpin = async (cost: number): Promise<boolean> => {
      if (!user || !userProfile || userProfile.balance < cost) return false;
      const userDocRef = doc(db, "users", user.uid);
      try {
          const batch = writeBatch(db);
          batch.update(userDocRef, { balance: increment(-cost) });
          const transRef = doc(collection(userDocRef, "transactions"));
          batch.set(transRef, {
              type: TransactionType.SPIN_PURCHASE,
              description: `Purchased a Spin`,
              amount: -cost,
              date: serverTimestamp()
          });
          await batch.commit();
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  };
  
  const handleGameWin = async (amount: number, gameName: string) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, {
          type: TransactionType.GAME_WIN,
          description: `Won in ${gameName}`,
          amount: amount,
          date: serverTimestamp()
      });
      await batch.commit();
  };

  const handleGameLoss = async (amount: number, gameName: string) => {
      if (!user || !userProfile || userProfile.balance < amount) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(-amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, {
          type: TransactionType.GAME_LOSS,
          description: `Bet in ${gameName}`,
          amount: -amount,
          date: serverTimestamp()
      });
      await batch.commit();
  };
  
  const handleCancelBet = async (amount: number, gameName: string) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const batch = writeBatch(db);
      batch.update(userDocRef, { balance: increment(amount) });
      const transRef = doc(collection(userDocRef, "transactions"));
      batch.set(transRef, {
          type: TransactionType.BET_CANCELLED,
          description: `Cancelled Bet in ${gameName}`,
          amount: amount,
          date: serverTimestamp()
      });
      await batch.commit();
  };


  const handleSubscribe = async (plan: JobSubscriptionPlan, cost: number) => {
     if(!user || !userProfile || userProfile.balance < cost) return;
      
     const expiry = new Date();
     expiry.setDate(expiry.getDate() + (plan === 'Business' || plan === 'Enterprise' ? 60 : 30));
      
     const userDocRef = doc(db, "users", user.uid);
     const batch = writeBatch(db);
     
     batch.update(userDocRef, {
         balance: increment(-cost),
         jobSubscription: {
             plan: plan,
             expiryDate: expiry.toISOString().split('T')[0],
             applicationsToday: 0,
             lastApplicationDate: new Date().toISOString().split('T')[0]
         }
     });
     
     const transRef = doc(collection(userDocRef, "transactions"));
     batch.set(transRef, {
         type: TransactionType.JOB_SUBSCRIPTION,
         description: `${plan} Plan Subscription`,
         amount: -cost,
         date: serverTimestamp()
     });
     await batch.commit();
  };

  const handleApply = async (jobId: string) => {
    if (!user || !userProfile || !userProfile.jobSubscription) return;
    const { plan, applicationsToday, lastApplicationDate } = userProfile.jobSubscription;
    
    const today = new Date().toISOString().split('T')[0];
    let dailyCount = applicationsToday;
    if (lastApplicationDate !== today) dailyCount = 0;
    
    const limit = plan === 'Starter' ? 5 : plan === 'Growth' ? 15 : Infinity;
    if (dailyCount >= limit) {
        alert("Daily application limit reached.");
        return;
    }
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const userDocRef = doc(db, "users", user.uid);
    const batch = writeBatch(db);
    
    batch.update(userDocRef, {
        jobSubscription: {
            ...userProfile.jobSubscription,
            applicationsToday: increment(1),
            lastApplicationDate: today
        }
    });

    const appRef = doc(collection(userDocRef, "applications"));
    batch.set(appRef, {
        jobId: jobId,
        jobTitle: job.title,
        date: serverTimestamp(),
        status: 'Submitted'
    });
    
    await batch.commit();
  };
  
  const handleUpdateProfile = async (data: { name: string; email: string; password?: string }) => {
    if(!user) throw new Error("Not logged in");
    if (data.name !== user.displayName) await updateProfile(user, { displayName: data.name });
    if (data.email !== user.email) await updateEmail(user, data.email);
    if (data.password) await updatePassword(user, data.password);
    await updateDoc(doc(db, "users", user.uid), { username: data.name, email: data.email });
  };
  
  const handleRequestPermission = () => {
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
    });
  };

  const handleCreateSocialGroup = async (groupData: {url: string, title: string, description: string, category: SocialGroup['category']}) => {
    if (!user) return;
    
    const newGroup: Omit<SocialGroup, 'id' | 'imageUrl'> = {
        ...groupData,
        submittedBy: user.uid,
        submittedAt: serverTimestamp(),
        status: 'pending'
    };

    await addDoc(collection(db, "social_groups"), newGroup);
  };
  
  const unreadUpdatesCount = useMemo(() => {
    return appUpdates.filter(u => !seenUpdateIds.includes(u.id)).length;
  }, [seenUpdateIds]);

  const handleMarkUpdateAsRead = (id: string) => {
      if (seenUpdateIds.includes(id)) return;
      const newSeenIds = [...seenUpdateIds, id];
      setSeenUpdateIds(newSeenIds);
      localStorage.setItem('seenUpdateIds', JSON.stringify(newSeenIds));
  };

  const handleMarkAllUpdatesAsRead = () => {
      const allIds = appUpdates.map(u => u.id);
      setSeenUpdateIds(allIds);
      localStorage.setItem('seenUpdateIds', JSON.stringify(allIds));
  };

  const handleToggleChatbot = (isVisible: boolean) => {
      setShowChatbot(isVisible);
      localStorage.setItem('showChatbot', JSON.stringify(isVisible));
  };

  const handleSetFingerprintEnabled = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { isFingerprintEnabled: true });
    // The onSnapshot listener will automatically update the userProfile state.
  };

  // --- Render Logic ---
  const renderContent = () => {
    const views: Record<View, React.ReactNode> = {
      DASHBOARD: <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.completedTaskIds.length ?? 0} referrals={userProfile?.referralCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView username={userProfile?.username ?? ''} totalReferrals={userProfile?.referralCount ?? 0} pendingBonuses={0} referralEarnings={transactions.filter(t => t.type === TransactionType.REFERRAL).reduce((sum, tx) => sum + tx.amount, 0)} />,
      SPIN_WHEEL: <SpinWheelView onWin={(amount) => handleGameWin(amount, 'Spin & Win')} balance={userProfile?.balance ?? 0} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} showChatbot={showChatbot} onToggleChatbot={handleToggleChatbot} onSetFingerprintEnabled={handleSetFingerprintEnabled} />,
      HOW_IT_WORKS: <HowItWorksView />,
      ABOUT_US: <AboutUsView />,
      CONTACT_US: <ContactUsView />,
      JOBS: <JobsView userProfile={userProfile} balance={userProfile?.balance ?? 0} jobs={jobs} onSubscribe={handleSubscribe} onApply={handleApply} applications={applications} />,
      MY_APPLICATIONS: <MyApplicationsView applications={applications} />,
      PRIVACY_POLICY: <PrivacyPolicyView />,
      TERMS_CONDITIONS: <TermsAndConditionsView />,
      LUDO_GAME: <LudoGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      LOTTERY_GAME: <LotteryGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      COIN_FLIP_GAME: <CoinFlipGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      MINES_GAME: <MinesGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      SOCIAL_GROUPS: <SocialGroupsView allGroups={socialGroups} myGroups={userSocialGroups} onSubmitGroup={handleCreateSocialGroup} />,
      UPDATES_INBOX: <UpdatesView updates={appUpdates} seenIds={seenUpdateIds} onMarkAsRead={handleMarkUpdateAsRead} onMarkAllAsRead={handleMarkAllUpdatesAsRead} />,
    };
    return views[activeView] || <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.completedTaskIds.length ?? 0} referrals={userProfile?.referralCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} />;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If auth is resolved and there's no user, show public views
  if (!user) {
    if (authAction) {
        return <AuthView onSignup={handleSignup} onLogin={handleLogin} initialView={authAction} />;
    }
    return <LandingView onGetStarted={handleAuthNavigation} />;
  }

  // If there's a user but their profile is not yet loaded, continue showing the loading screen.
  // This prevents trying to access properties of a null userProfile.
  if (!userProfile) {
    return <LoadingScreen />;
  }

  // From here on, we know we have a logged-in user with a loaded profile.
  if (userProfile.paymentStatus === 'UNPAID') {
    return <PaymentView onSubmit={handlePaymentSubmit} />;
  }
  
  if (userProfile.paymentStatus === 'PENDING_VERIFICATION') {
    return <PendingVerificationView />;
  }

  const mainContent = (
      <div className="flex flex-col md:flex-row bg-gradient-to-b from-green-50/50 to-white min-h-screen font-sans">
          <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} unreadUpdatesCount={unreadUpdatesCount} />
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
          <div className="flex-1 flex flex-col w-full">
              <Header
                  username={userProfile.username}
                  setIsSidebarOpen={setIsSidebarOpen}
                  setActiveView={setActiveView}
              />
              <main className="flex-grow pb-20 md:pb-6 p-4">
                  {renderContent()}
              </main>
              <BottomNav activeView={activeView} setActiveView={setActiveView} />
          </div>
          {showChatbot && <AIAgentChatbot />}
          {showPinLock && <PinLockView mode={pinLockMode} onClose={() => { setShowPinLock(false); setPinAction(null); }} onPinCorrect={handlePinCorrect} onPinSet={handleSetPin} onSkip={() => setShowPinLock(false)} pinToVerify={userProfile.walletPin ?? undefined} />}
      </div>
  );
  
  return (
    <>
      {notificationPermission === 'default' && (
        <NotificationBanner
          onRequestPermission={handleRequestPermission}
          onDismiss={() => setNotificationPermission('dismissed')}
        />
      )}
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      {mainContent}
    </>
  );
};

export default App;