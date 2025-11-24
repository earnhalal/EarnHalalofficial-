
// components/App.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import PremiumView from './PremiumView';
import LeaderboardView from './LeaderboardView'; // Added
import LevelsInfoView from './LevelsInfoView'; // Added
import { GameControllerIcon } from './icons';

import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, SocialGroup, Referral } from '../types';
import { TransactionType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion, storage } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, sendEmailVerification, User } from 'firebase/auth';
import { doc, getDoc, getDocs, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction, where, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface AppUpdate {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    type: 'New Feature' | 'Improvement' | 'Game Release';
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
];

const LEVEL_NAMES = [
    "Starter", "Rookie", "Bronze", "Silver", "Gold", 
    "Platinum", "Diamond", "Master", "Grandmaster", "Elite", 
    "Champion", "Legend", "Titan", "Immortal", "God Mode"
];

interface UpdatesViewProps {
    updates: AppUpdate[];
    seenIds: string[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const UpdatesView: React.FC<UpdatesViewProps> = ({ updates, seenIds, onMarkAsRead, onMarkAllAsRead }) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg max-w-4xl mx-auto text-gray-800">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-bold">Inbox</h2>
                <button onClick={onMarkAllAsRead} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Mark all as read</button>
            </div>
            {updates.length === 0 ? <p className="text-center text-gray-500 py-8">No updates yet.</p> : (
                <div className="space-y-4">
                    {updates.map(update => (
                        <div key={update.id} onClick={() => onMarkAsRead(update.id)} className={`p-4 rounded-lg cursor-pointer ${!seenIds.includes(update.id) ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-gray-50'}`}>
                            <h3 className="font-bold">{update.title}</h3>
                            <p className="text-sm text-gray-600">{update.description}</p>
                        </div>
                    ))}
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
  const [tasks, setTasks] = useState<UserCreatedTask[]>([]);
  const [userCreatedTasks, setUserCreatedTasks] = useState<UserCreatedTask[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([]);
  const [userSocialGroups, setUserSocialGroups] = useState<SocialGroup[]>([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
  const [showPinLock, setShowPinLock] = useState(false);
  const [pinLockMode, setPinLockMode] = useState<'set' | 'enter'>('set');
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [seenUpdateIds, setSeenUpdateIds] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    if (window.location.pathname === '/signup') setAuthAction('signup');
  }, []);

  const transactions = useMemo(() => baseTransactions, [baseTransactions]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            if (!profileData.referralCode) updateDoc(userDocRef, { referralCode: firebaseUser.uid.substring(0, 8) });
            setUserProfile(profileData);
          }
        });

        const transactionsQuery = query(collection(db, "users", firebaseUser.uid, "transactions"), orderBy("date", "desc"));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const trans: Transaction[] = [];
          snapshot.forEach(doc => trans.push({ id: doc.id, ...doc.data() } as Transaction));
          setBaseTransactions(trans);
        });

        const userTasksQuery = query(collection(db, "tasks"), where("createdBy", "==", firebaseUser.uid), orderBy("submittedAt", "desc"));
        const unsubscribeUserTasks = onSnapshot(userTasksQuery, (snapshot) => {
            const uTasks: UserCreatedTask[] = [];
            snapshot.forEach(doc => uTasks.push({ id: doc.id, ...doc.data()} as UserCreatedTask));
            setUserCreatedTasks(uTasks);
        });

        const applicationsQuery = query(collection(db, "users", firebaseUser.uid, "applications"), orderBy("date", "desc"));
        const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
            const apps: Application[] = [];
            snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data()} as Application));
            setApplications(apps);
        });

        const userGroupsQuery = query(collection(db, 'social_groups'), where('submittedBy', '==', firebaseUser.uid), orderBy('submittedAt', 'desc'));
        const unsubscribeUserGroups = onSnapshot(userGroupsQuery, (snapshot) => setUserSocialGroups(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as SocialGroup))));
        
        const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribeReferrals = onSnapshot(referralsQuery, (snapshot) => setReferrals(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Referral))));

        return () => { unsubscribeProfile(); unsubscribeTransactions(); unsubscribeUserTasks(); unsubscribeApplications(); unsubscribeUserGroups(); unsubscribeReferrals(); };
      } else {
        setUser(null); setUserProfile(null); setBaseTransactions([]); setActiveViewInternal('DASHBOARD'); setIsLoading(false); setAuthAction(null);
      }
    });

    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => setTasks(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserCreatedTask))));

    const jobsQuery = query(collection(db, 'jobs'));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => setJobs(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Job))));

    const groupsQuery = query(collection(db, 'social_groups'), where('status', '==', 'approved'), orderBy('submittedAt', 'desc'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => setSocialGroups(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as SocialGroup))));
    
    if ('Notification' in window) setNotificationPermission(Notification.permission);

    return () => { unsubscribe(); unsubscribeTasks(); unsubscribeJobs(); unsubscribeGroups(); };
  }, []);

  useEffect(() => { if ((user && userProfile) || !user) setIsLoading(false); }, [user, userProfile]);

  const handleAuthNavigation = useCallback((view: 'login' | 'signup') => setAuthAction(view), []);
  const setActiveView = (view: View) => { if (view !== activeView) setActiveViewInternal(view); };

  const handleSignup = async (data: any) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // Send Verification Email
        await sendEmailVerification(userCredential.user);
        alert("Tasdeeqi (Verification) Email Bheja Gaya! Inbox check karein.");

        await updateProfile(userCredential.user, { displayName: data.username });
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const newUserProfile = {
            uid: userCredential.user.uid, username: data.username, username_lowercase: data.username.toLowerCase(), email: data.email, phone: data.phone,
            photoURL: null, // Initial photoURL
            joinedAt: serverTimestamp(), paymentStatus: 'VERIFIED', balance: 100, referralCode: userCredential.user.uid.substring(0, 8), tasksCompletedCount: 0, invitedCount: 0,
            totalReferralEarnings: 0, completedTaskIds: [], savedWithdrawalDetails: null, walletPin: null, isFingerprintEnabled: false, jobSubscription: null,
            // Level System Init
            level: 1, levelName: "Starter", totalTasks: 0, levelProgress: 0, tasksForNextLevel: 10
        };
        batch.set(userDocRef, newUserProfile);
        batch.set(doc(collection(userDocRef, "transactions")), { type: TransactionType.JOINING_FEE, description: "Joining Bonus", amount: 100, date: serverTimestamp() });
        
        if (data.referralCode) {
            const usersRef = collection(db, "users");
            let q = query(usersRef, where("username_lowercase", "==", data.referralCode.trim().toLowerCase()));
            let querySnapshot = await getDocs(q);
            if (querySnapshot.empty) { q = query(usersRef, where("username", "==", data.referralCode.trim())); querySnapshot = await getDocs(q); }
            
            if (!querySnapshot.empty) {
                const referrerDoc = querySnapshot.docs[0];
                if (referrerDoc.id !== userCredential.user.uid) {
                    batch.update(userDocRef, { referredBy: referrerDoc.id });
                    batch.update(referrerDoc.ref, { invitedCount: increment(1) });
                    batch.set(doc(collection(db, "referrals")), {
                        referrerId: referrerDoc.id, referredUserId: userCredential.user.uid, referredUsername: data.username,
                        referredUserTasksCompleted: 0, referrerTasksCompleted: 0, isNewSystem: true, status: 'pending_referred_tasks', bonusAmount: 200, createdAt: serverTimestamp()
                    });
                }
            }
        }
        await batch.commit();
        setActiveViewInternal('DASHBOARD');
    } catch (error: any) { alert(`Signup failed: ${error.message}`); }
  };

  const handleLogin = async (email: string, password: string) => { try { await signInWithEmailAndPassword(auth, email, password); setAuthAction(null); } catch (error: any) { alert(`Login failed: ${error.message}`); } };
  const handleLogout = () => signOut(auth).catch(console.error);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!user || !userProfile || userProfile.completedTaskIds.includes(taskId)) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Level Logic Calculation
    const currentTasks = userProfile.tasksCompletedCount || 0;
    const newTotalTasks = currentTasks + 1;
    
    // Logic: Lvl 1 (0-10), Lvl 2 (11-20), etc.
    // Formula: if tasks <= 10, lvl 1. else ceil((tasks - 10) / 10) + 1.
    let newLevel = 1;
    if (newTotalTasks > 10) {
        newLevel = Math.ceil((newTotalTasks - 10) / 10) + 1;
    }
    if (newLevel > 15) newLevel = 15; // Max level cap
    
    const levelName = LEVEL_NAMES[newLevel - 1] || "God Mode";

    const batch = writeBatch(db);
    const userRef = doc(db, "users", user.uid);
    batch.update(userRef, { 
        balance: increment(task.reward), 
        completedTaskIds: arrayUnion(taskId), 
        tasksCompletedCount: increment(1),
        // Add Level System fields
        level: newLevel,
        levelName: levelName,
        totalTasks: newTotalTasks // Keeping redundant field as requested
    });
    batch.update(doc(db, "tasks", taskId), { completions: increment(1) });
    batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.EARNING, description: `Completed: ${task.title}`, amount: task.reward, date: serverTimestamp() });
    await batch.commit();
  }, [user, userProfile, tasks]);
  
  const handleTaskView = async (taskId: string) => await updateDoc(doc(db, "tasks", taskId), { views: increment(1) });
  
  const handleCreateTask = async (task: any, quantity: number, totalCost: number) => {
      if(!user || !userProfile || userProfile.balance < totalCost) return;
      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      batch.set(doc(collection(db, "tasks")), { ...task, quantity, completions: 0, views: 0, status: 'pending', submittedAt: serverTimestamp(), createdBy: user.uid });
      batch.update(userRef, { balance: increment(-totalCost) });
      batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.TASK_CREATION, description: `Campaign: ${task.title}`, amount: -totalCost, date: serverTimestamp() });
      await batch.commit();
  };
  
  const handleWithdraw = async (amount: number, details: WithdrawalDetails) => {
    if (!user || !userProfile) return;
    const action = async () => {
      try { await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(doc(db, "users", user.uid));
          if (!userDoc.exists() || userDoc.data().balance < amount) throw new Error("Insufficient balance.");
          const reqRef = doc(collection(db, "withdrawal_requests"));
          transaction.update(doc(db, "users", user.uid), { balance: increment(-amount), savedWithdrawalDetails: details });
          transaction.set(doc(collection(db, "users", user.uid, "transactions")), { type: TransactionType.WITHDRAWAL, description: `Withdrawal to ${details.method}`, amount: -amount, date: serverTimestamp(), withdrawalDetails: details, status: 'Pending', withdrawalRequestId: reqRef.id });
          transaction.set(reqRef, { userId: user.uid, username: userDoc.data().username, amount, withdrawalDetails: details, status: 'Pending', createdAt: serverTimestamp() });
        }); } catch (error) { console.error(error); }
    };
    if (userProfile.walletPin) { setPinLockMode('enter'); setShowPinLock(true); setPinAction(() => action); } else { await action(); }
  };
  
  const handleSetPin = async (pin: string) => { if (user) { await updateDoc(doc(db, "users", user.uid), { walletPin: pin }); setShowPinLock(false); pinAction && pinAction(); setPinAction(null); } };
  const handleDeposit = async (amount: number, method: any, transactionId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    const reqRef = doc(collection(db, "deposit_requests"));
    batch.set(reqRef, { userId: user.uid, username: userProfile?.username, amount, transactionId, method, status: 'Pending', createdAt: serverTimestamp() });
    batch.set(doc(collection(db, "users", user.uid, "transactions")), { type: TransactionType.PENDING_DEPOSIT, description: `Deposit via ${method}`, amount, date: serverTimestamp(), status: 'Pending', depositDetails: { method, transactionId }, depositRequestId: reqRef.id });
    await batch.commit();
  };

  const handleBuySpin = async (cost: number): Promise<boolean> => {
      if (!user || !userProfile || userProfile.balance < cost) return false;
      try { const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(-cost) }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.SPIN_PURCHASE, description: `Purchased a Spin`, amount: -cost, date: serverTimestamp() }); await batch.commit(); return true; } catch { return false; }
  };
  
  const handleGameWin = async (amount: number, gameName: string) => { if (!user) return; const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(amount) }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.GAME_WIN, description: `Won in ${gameName}`, amount, date: serverTimestamp() }); await batch.commit(); };
  const handleGameLoss = async (amount: number, gameName: string) => { if (!user || !userProfile) return; const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(-amount) }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.GAME_LOSS, description: `Bet in ${gameName}`, amount: -amount, date: serverTimestamp() }); await batch.commit(); };
  const handleSubscribe = async (plan: JobSubscriptionPlan, cost: number) => { if(!user || !userProfile || userProfile.balance < cost) return; const expiry = new Date(); expiry.setDate(expiry.getDate() + 30); const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(-cost), jobSubscription: { plan, expiryDate: expiry.toISOString().split('T')[0], applicationsToday: 0, lastApplicationDate: new Date().toISOString().split('T')[0] } }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.JOB_SUBSCRIPTION, description: `${plan} Plan Subscription`, amount: -cost, date: serverTimestamp() }); await batch.commit(); };
  const handleApply = async (jobId: string) => { if (!user || !userProfile) return; const job = jobs.find(j => j.id === jobId); if(!job) return; const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { 'jobSubscription.applicationsToday': increment(1), 'jobSubscription.lastApplicationDate': new Date().toISOString().split('T')[0] }); batch.set(doc(collection(userRef, "applications")), { jobId, jobTitle: job.title, date: serverTimestamp(), status: 'Submitted' }); await batch.commit(); };
  const handleUpdateProfile = async (data: any) => { if(!user) return; if(data.name !== user.displayName) await updateProfile(user, { displayName: data.name }); if(data.email !== user.email) await updateEmail(user, data.email); if(data.password) await updatePassword(user, data.password); await updateDoc(doc(db, "users", user.uid), { username: data.name, email: data.email }); };
  const handleCreateSocialGroup = async (groupData: any) => { if (!user) return; await addDoc(collection(db, "social_groups"), { ...groupData, submittedBy: user.uid, submittedAt: serverTimestamp(), status: 'pending' }); };

  // New function to handle profile picture upload or avatar set
  const handleUploadProfilePicture = async (file: File | null, avatarUrl?: string) => {
    if (!user) return;
    try {
        let photoURL = avatarUrl || '';
        if (file) {
             const storageRef = ref(storage, `profile_pictures/${user.uid}`);
             await uploadBytes(storageRef, file);
             photoURL = await getDownloadURL(storageRef);
        }
        
        if (photoURL) {
            await updateProfile(user, { photoURL });
            await updateDoc(doc(db, "users", user.uid), { photoURL });
            setUserProfile(prev => prev ? { ...prev, photoURL } : null);
        }
    } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Failed to update profile picture.");
    }
  };

  const renderContent = () => {
    const views: Record<View | 'PREMIUM_HUB' | 'LEADERBOARD' | 'LEVELS_INFO', React.ReactNode> = {
      DASHBOARD: <DashboardView userProfile={userProfile} balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.tasksCompletedCount ?? 0} invitedCount={userProfile?.invitedCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView userProfile={userProfile} referrals={referrals} />,
      SPIN_WHEEL: <SpinWheelView onWin={(amount) => handleGameWin(amount, 'Spin & Win')} balance={userProfile?.balance ?? 0} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onUpdatePhoto={handleUploadProfilePicture} onLogout={handleLogout} showChatbot={showChatbot} onToggleChatbot={(v) => { setShowChatbot(v); localStorage.setItem('showChatbot', JSON.stringify(v)); }} onSetFingerprintEnabled={async () => { if (user) await updateDoc(doc(db, "users", user.uid), { isFingerprintEnabled: true }); }} onNavigate={setActiveView} />,
      HOW_IT_WORKS: <HowItWorksView />, ABOUT_US: <AboutUsView />, CONTACT_US: <ContactUsView />,
      
      PREMIUM_HUB: <PremiumView setActiveView={setActiveView} />,
      LEADERBOARD: <LeaderboardView />,
      LEVELS_INFO: <LevelsInfoView />,
      JOBS: <JobsView userProfile={userProfile} balance={userProfile?.balance ?? 0} jobs={jobs} onSubscribe={handleSubscribe} onApply={handleApply} applications={applications} />,
      SOCIAL_GROUPS: <SocialGroupsView allGroups={socialGroups} myGroups={userSocialGroups} onSubmitGroup={handleCreateSocialGroup} />,
      
      MY_APPLICATIONS: <MyApplicationsView applications={applications} />,
      PRIVACY_POLICY: <PrivacyPolicyView />, TERMS_CONDITIONS: <TermsAndConditionsView />,
      LUDO_GAME: <LudoGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      LOTTERY_GAME: <LotteryGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      COIN_FLIP_GAME: <CoinFlipGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      MINES_GAME: <MinesGame balance={userProfile?.balance ?? 0} onWin={handleGameWin} onLoss={handleGameLoss} />,
      UPDATES_INBOX: <UpdatesView updates={appUpdates} seenIds={seenUpdateIds} onMarkAsRead={(id) => { if(!seenUpdateIds.includes(id)) setSeenUpdateIds([...seenUpdateIds, id]); }} onMarkAllAsRead={() => setSeenUpdateIds(appUpdates.map(u => u.id))} />,
    };
    return views[activeView] || views['DASHBOARD'];
  };

  if (isLoading) return <LoadingScreen />;
  if (!user) { if (authAction) return <AuthView onSignup={handleSignup} onLogin={handleLogin} initialView={authAction} />; return <LandingView onGetStarted={handleAuthNavigation} />; }
  if (!userProfile) return <LoadingScreen />;

  return (
    <>
      {notificationPermission === 'default' && <NotificationBanner onRequestPermission={() => Notification.requestPermission().then(setNotificationPermission)} onDismiss={() => setNotificationPermission('dismissed')} />}
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      <div className="fixed top-4 right-4 z-[100] space-y-3 w-full max-w-sm"> {notifications.map(n => (<NotificationToast key={n.id} title={n.title} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(i => i.id !== n.id))} />))} </div>
      <div className="flex flex-col bg-[#F9FAFB] min-h-screen font-sans pb-[80px]">
          <Header username={userProfile.username} setActiveView={setActiveView} />
          <main className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full">{renderContent()}</main>
          <BottomNav activeView={activeView} setActiveView={setActiveView} />
          {showChatbot && <AIAgentChatbot />}
          {showPinLock && <PinLockView mode={pinLockMode} onClose={() => { setShowPinLock(false); setPinAction(null); }} onPinCorrect={() => { setShowPinLock(false); pinAction && pinAction(); setPinAction(null); }} onPinSet={handleSetPin} onSkip={() => setShowPinLock(false)} pinToVerify={userProfile.walletPin ?? undefined} />}
      </div>
    </>
  );
};

export default App;
