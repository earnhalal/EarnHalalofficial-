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
import Footer from './Footer';
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
import AviatorGame from './games/AviatorGame';
import LudoGame from './games/LudoGame';
import LotteryGame from './games/LotteryGame';
import CoinFlipGame from './games/CoinFlipGame';
import MinesGame from './games/MinesGame';
import WhatsNewModal from './WhatsNewModal';
import LoadingScreen from './LoadingScreen';


import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, PaymentStatus } from '../types';
import { TransactionType, TaskType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction, where, writeBatch } from 'firebase/firestore';

const LATEST_UPDATE_VERSION = '1.2.0';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewStack, setViewStack] = useState<View[]>(['DASHBOARD']);
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  
  const [initialAuthView, setInitialAuthView] = useState<'login' | 'signup'>('signup');
  const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
  
  const [showPinLock, setShowPinLock] = useState(false);
  const [pinLockMode, setPinLockMode] = useState<'enter' | 'set'>('set');
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);


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
            
            const lastVersion = localStorage.getItem('lastSeenVersion');
            if (profileData.paymentStatus === 'VERIFIED' && lastVersion !== LATEST_UPDATE_VERSION) {
                setShowWhatsNewModal(true);
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

        return () => {
          unsubscribeProfile();
          unsubscribeTransactions();
          unsubscribeUserTasks();
          unsubscribeApplications();
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
        setViewStack(['DASHBOARD']);
        setIsLoading(false);
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
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      unsubscribe();
      unsubscribeTasks();
      unsubscribeJobs();
    };
  }, [userProfile?.paymentStatus]);
  
  // Set loading to false once profile is loaded
  useEffect(() => {
    if(user && userProfile) {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  // --- Handlers ---
  const setActiveView = (view: View) => {
    if (view === activeView) return;
    setActiveViewInternal(view);
    setViewStack(prev => [...prev, view]);
    setIsSidebarOpen(false);
  };

  const goBack = () => {
    if (viewStack.length > 1) {
      const newStack = [...viewStack];
      newStack.pop();
      setActiveViewInternal(newStack[newStack.length - 1]);
      setViewStack(newStack);
    }
  };

  const handleAuthNavigation = (view: 'login' | 'signup') => {
      setInitialAuthView(view);
      setAuthAction(view);
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

  // --- Render Logic ---
  const renderContent = () => {
    const views: Record<View, React.ReactNode> = {
      DASHBOARD: <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.completedTaskIds.length ?? 0} referrals={userProfile?.referralCount ?? 0} setActiveView={setActiveView} transactions={transactions} onSimulateNewTask={()=>{}} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView username={userProfile?.username ?? ''} totalReferrals={userProfile?.referralCount ?? 0} pendingBonuses={0} referralEarnings={transactions.filter(t=>t.type === TransactionType.REFERRAL).reduce((acc, t) => acc + t.amount, 0)} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />,
      HOW_IT_WORKS: <HowItWorksView />,
      ABOUT_US: <AboutUsView />,
      CONTACT_US: <ContactUsView />,
      PRIVACY_POLICY: <PrivacyPolicyView />,
      TERMS_CONDITIONS: <TermsAndConditionsView />,
      JOBS: <JobsView userProfile={userProfile} balance={userProfile?.balance ?? 0} jobs={jobs} onSubscribe={handleSubscribe} onApply={handleApply} applications={applications} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      SPIN_WHEEL: <SpinWheelView balance={userProfile?.balance ?? 0} onWin={(amount) => handleGameWin(amount, "Spin Wheel")} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      MY_APPLICATIONS: <MyApplicationsView applications={applications} />,
      AVIATOR_GAME: <AviatorGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} onCancelBet={handleCancelBet}/>,
      LUDO_GAME: <LudoGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      LOTTERY_GAME: <LotteryGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      COIN_FLIP_GAME: <CoinFlipGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      MINES_GAME: <MinesGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
    };
    return views[activeView] || <DashboardView balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.completedTaskIds.length ?? 0} referrals={userProfile?.referralCount ?? 0} setActiveView={setActiveView} transactions={transactions} onSimulateNewTask={()=>{}} />;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    if (authAction) {
      return <AuthView onSignup={handleSignup} onLogin={handleLogin} initialView={authAction} />;
    }
    return <LandingView onGetStarted={handleAuthNavigation} />;
  }

  if (!userProfile) {
    return <LoadingScreen />;
  }

  if (userProfile.paymentStatus === 'UNPAID') {
    return <PaymentView onSubmit={handlePaymentSubmit} />;
  }
  
  if (userProfile.paymentStatus === 'PENDING_VERIFICATION') {
    return <PendingVerificationView />;
  }

  // User is logged in, paid, and verified
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      {showWhatsNewModal && <WhatsNewModal onClose={() => { setShowWhatsNewModal(false); localStorage.setItem('lastSeenVersion', LATEST_UPDATE_VERSION); }} />}
      {showPinLock && userProfile && (
        <PinLockView 
            mode={pinLockMode} 
            onClose={() => setShowPinLock(false)}
            onPinCorrect={handlePinCorrect}
            onPinSet={handleSetPin}
            pinToVerify={userProfile.walletPin ?? undefined}
            onSkip={() => setShowPinLock(false)}
        />
      )}
      <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {notificationPermission === 'default' && (
          <NotificationBanner onRequestPermission={handleRequestPermission} onDismiss={() => setNotificationPermission('dismissed')} />
        )}
        <Header 
          activeView={activeView}
          balance={userProfile.balance}
          username={userProfile.username}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          canGoBack={viewStack.length > 1}
          onBack={goBack}
          setActiveView={setActiveView}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
        <Footer setActiveView={setActiveView}/>
      </div>
      <AIAgentChatbot />
    </div>
  );
};

export default App;
