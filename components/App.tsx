
// components/App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import EarnView from './EarnView';
import WalletView from './WalletView';
import CreateTaskView from './CreateTaskView';
import TaskHistoryView from './TaskHistoryView';
import InviteView from './InviteView';
import ProfileSettingsView from './ProfileSettingsView';
import { HowItWorksView, AboutUsView, ContactUsView, PrivacyPolicyView, TermsAndConditionsView } from './InfoViews';
import { AdsGuideView, AdsPolicyView } from './AdsInfoViews';
import JobsView from './JobsView';
import BottomNav from './Footer';
import AuthView from './AuthView';
import LandingView from './LandingView';
import NotificationBanner from './NotificationBanner';
import DepositView from './DepositView';
import SpinWheelView from './SpinWheelView';
import PinLockView from './PinLockView';
import WelcomeModal from './WelcomeModal';
import MyApplicationsView from './MyApplicationsView';
import SocialGroupsView from './SocialGroupsView';
import LoadingScreen from './LoadingScreen';
import NotificationToast from './NotificationToast';
import PremiumView from './PremiumView';
import LeaderboardView from './LeaderboardView';
import LevelsInfoView from './LevelsInfoView';
import MailboxView from './MailboxView';
import PlayAndEarnView from './PlayAndEarnView';
import LudoGame from './games/LudoGame';
import LotteryGame from './games/LotteryGame';
import CoinFlipGame from './games/CoinFlipGame';
import MinesGame from './games/MinesGame';
import AdvertiserDashboard from './AdvertiserDashboard';
import PostJobView from './PostJobView';
import ModeSwitchLoader from './ModeSwitchLoader'; // Import the loader
import { GameControllerIcon, CloseIcon } from './icons';

import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, SocialGroup, Referral, EmailLog, UserMode } from '../types';
import { TransactionType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion, storage } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, sendEmailVerification, sendPasswordResetEmail, User } from 'firebase/auth';
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
        id: 'v1.4.0-premium',
        version: '1.4.0',
        date: 'July 27, 2024',
        title: 'Premium Hub Launched!',
        description: 'Explore the new Premium Hub with advanced earning methods, Influencer program, and exclusive job packages.',
        type: 'New Feature',
        icon: <GameControllerIcon className="w-5 h-5" />,
        color: 'text-amber-400'
    },
    {
        id: 'v1.5.0-campaign',
        version: '1.5.0',
        date: 'August 01, 2024',
        title: 'Pro Campaign Manager',
        description: 'Create professional task campaigns with our new easy-to-use manager.',
        type: 'Improvement',
        icon: <GameControllerIcon className="w-5 h-5" />,
        color: 'text-blue-400'
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
  const [isSwitchingMode, setIsSwitchingMode] = useState(false); // New State for Switch Loader
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('EARNER');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activeView, setActiveViewInternal] = useState<View>(() => {
      if (typeof window !== 'undefined' && window.history.state?.view) {
          return window.history.state.view as View;
      }
      return 'DASHBOARD';
  });

  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  const [baseTransactions, setBaseTransactions] = useState<Transaction[]>([]);
  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Record<string, string>>({});

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    if (window.location.pathname === '/signup') setAuthAction('signup');
  }, []);

  const transactions = useMemo(() => {
      return baseTransactions.map(tx => {
          if (tx.withdrawalRequestId && withdrawalStatuses[tx.withdrawalRequestId]) {
              return { ...tx, status: withdrawalStatuses[tx.withdrawalRequestId] as any };
          }
          return tx;
      });
  }, [baseTransactions, withdrawalStatuses]);
  
  const unreadEmailCount = useMemo(() => emailLogs.filter(email => email.status !== 'Opened').length, [emailLogs]);

  useEffect(() => {
    if (!user) return;
    if (!window.history.state) window.history.replaceState({ view: activeView }, '', '');
    const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.view) {
            setActiveViewInternal(event.state.view);
        } else {
            setActiveViewInternal('DASHBOARD');
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]); 

  const setActiveView = useCallback((view: View) => {
      setIsSidebarOpen(false); 
      if (view === 'MAILBOX') {
          setIsMailboxOpen(true);
      } else {
          setActiveViewInternal((currentView) => {
              if (currentView !== view) {
                  window.history.pushState({ view }, '', '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return view;
              }
              return currentView;
          });
      }
  }, []);

  const toggleUserMode = () => {
      setIsSwitchingMode(true); // Start loading animation
      
      // Delay switching by 5 seconds to show the loader
      setTimeout(() => {
          setUserMode(prev => {
              const newMode = prev === 'EARNER' ? 'ADVERTISER' : 'EARNER';
              setActiveView(newMode === 'ADVERTISER' ? 'ADVERTISER_DASHBOARD' : 'DASHBOARD');
              return newMode;
          });
          setIsSwitchingMode(false); // End loading animation
      }, 5000);
  };

  const sendSystemEmail = async (userId: string, userEmail: string, type: EmailLog['type'], subject: string, htmlContent: string) => {
      try {
          const batch = writeBatch(db);
          const logRef = doc(collection(db, `users/${userId}/email_logs`));
          const logData: Omit<EmailLog, 'id'> = {
              type: type,
              subject: subject,
              recipient: userEmail,
              date: serverTimestamp(),
              status: 'Sent',
              bodyPreview: htmlContent
          };
          batch.set(logRef, logData);
          await batch.commit();
      } catch (e) {
          console.error("Failed to send system email:", e);
      }
  };
  
  const handleMarkEmailAsRead = async (emailId: string) => {
      if (!user) return;
      try {
          const emailRef = doc(db, `users/${user.uid}/email_logs`, emailId);
          await updateDoc(emailRef, { status: 'Opened' });
      } catch (e) {
          console.error("Error marking email as read:", e);
      }
  };

  const handleSendVerificationOTP = async (type: 'email' | 'phone', destination: string, otp: string) => {
      if (!user) return;
      const subject = `Verify your ${type === 'email' ? 'Email Address' : 'Phone Number'}`;
      const htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #0F4C47;">Verification Code</h2>
            <p>You requested to verify your ${type}.</p>
            <div style="background: #f0f9f6; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0F4C47;">
                ${otp}
            </div>
            <p>If you did not request this, please ignore this message.</p>
        </div>
      `;
      await sendSystemEmail(user.uid, destination, 'Verification', subject, htmlContent);
      setNotifications(prev => [...prev, { id: Date.now().toString(), title: 'Code Sent', message: `Verification code sent to your System Mailbox.`, type: 'info' }]);
  };

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

        const withdrawalsQuery = query(collection(db, "withdrawal_requests"), where("userId", "==", firebaseUser.uid));
        const unsubscribeWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
            const statusMap: Record<string, string> = {};
            snapshot.forEach(doc => {
                statusMap[doc.id] = doc.data().status;
            });
            setWithdrawalStatuses(statusMap);
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
        
        const emailsQuery = query(collection(db, `users/${firebaseUser.uid}/email_logs`), orderBy('date', 'desc'));
        const unsubscribeEmails = onSnapshot(emailsQuery, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
            setEmailLogs(logs);
        });

        return () => { 
            unsubscribeProfile(); unsubscribeTransactions(); unsubscribeWithdrawals(); unsubscribeUserTasks(); 
            unsubscribeApplications(); unsubscribeUserGroups(); unsubscribeReferrals(); unsubscribeEmails();
        };
      } else {
        setUser(null); setUserProfile(null); setBaseTransactions([]); setActiveViewInternal('DASHBOARD'); setIsLoading(false); setAuthAction(null); setEmailLogs([]);
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

  const handleSignup = async (data: any) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const welcomeTemplate = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #D4AF37;">Welcome to TaskMint, ${data.username}!</h1>
                <p>You have successfully created your account. Start earning by completing tasks today.</p>
                <p><strong>Username:</strong> ${data.username}</p>
                <br/>
                <p>Earn Smart. TaskMint.</p>
            </div>
        `;
        await sendSystemEmail(userCredential.user.uid, data.email, 'Welcome', 'Welcome to TaskMint!', welcomeTemplate);
        await updateProfile(userCredential.user, { displayName: data.username });
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const newUserProfile = {
            uid: userCredential.user.uid, username: data.username, username_lowercase: data.username.toLowerCase(), email: data.email, phone: data.phone,
            photoURL: null, 
            joinedAt: serverTimestamp(), paymentStatus: 'VERIFIED', balance: 100, referralCode: userCredential.user.uid.substring(0, 8), tasksCompletedCount: 0, invitedCount: 0,
            totalReferralEarnings: 0, completedTaskIds: [], savedWithdrawalDetails: null, walletPin: null, isFingerprintEnabled: false, jobSubscription: null,
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
        const deviceId = Math.random().toString(36).substring(7);
        localStorage.setItem('taskmint_device_id', deviceId);
        setActiveViewInternal('DASHBOARD');
    } catch (error: any) { alert(`Signup failed: ${error.message}`); }
  };

  const handleLogin = async (email: string, password: string) => { 
      try { 
          const userCredential = await signInWithEmailAndPassword(auth, email, password); 
          const user = userCredential.user;
          
          const storedDeviceId = localStorage.getItem('taskmint_device_id');
          
          if (!storedDeviceId) {
               const newDeviceId = Math.random().toString(36).substring(7);
               localStorage.setItem('taskmint_device_id', newDeviceId);
               
               const alertTemplate = `
                   <div style="color: #333; font-family: sans-serif;">
                       <h2 style="color: #d32f2f;">New Login Detected</h2>
                       <p>Your TaskMint account was accessed from a new device or browser.</p>
                       <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                       <p>If this wasn't you, please change your password immediately.</p>
                   </div>
               `;
               await sendSystemEmail(user.uid, user.email || email, 'Security Alert', 'New Login Detected', alertTemplate);
          }

          setAuthAction(null); 
      } catch (error: any) { alert(`Login failed: ${error.message}`); } 
  };
  
  const handleForgotPassword = async (email: string) => {
      try { await sendPasswordResetEmail(auth, email); alert("Password Reset Email sent!"); } catch (error: any) { alert(`Error: ${error.message}`); }
  };

  const handleLogout = () => signOut(auth).catch(console.error);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!user || !userProfile || userProfile.completedTaskIds.includes(taskId)) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const currentTasks = userProfile.tasksCompletedCount || 0;
    const newTotalTasks = currentTasks + 1;
    let newLevel = 1;
    if (newTotalTasks > 10) newLevel = Math.ceil((newTotalTasks - 10) / 10) + 1;
    if (newLevel > 15) newLevel = 15; 
    const levelName = LEVEL_NAMES[newLevel - 1] || "God Mode";
    const batch = writeBatch(db);
    const userRef = doc(db, "users", user.uid);
    batch.update(userRef, { balance: increment(task.reward), completedTaskIds: arrayUnion(taskId), tasksCompletedCount: increment(1), level: newLevel, levelName: levelName, totalTasks: newTotalTasks });
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
      const campaignEmail = `<h3>Campaign Submitted</h3><p>Your task "<strong>${task.title}</strong>" has been submitted for approval.</p><p>Cost: ${totalCost} Rs</p><p>Status: Pending</p>`;
      await sendSystemEmail(user.uid, user.email || '', 'Notification', 'Campaign Created', campaignEmail);
  };

  const handlePostJob = async (jobData: Omit<Job, 'id' | 'postedAt'>, cost: number) => {
      if (!user || !userProfile || userProfile.balance < cost) return;
      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      
      const jobRef = doc(collection(db, "jobs"));
      batch.set(jobRef, { 
          ...jobData, 
          postedAt: serverTimestamp(), 
          postedBy: user.uid 
      });

      batch.update(userRef, { balance: increment(-cost) });
      
      batch.set(doc(collection(userRef, "transactions")), { 
          type: TransactionType.JOB_POSTING_FEE, 
          description: `Posted Job: ${jobData.title}`, 
          amount: -cost, 
          date: serverTimestamp() 
      });

      await batch.commit();
      const jobEmail = `<h3>Job Posted</h3><p>Your job "<strong>${jobData.title}</strong>" is now live in the Premium Hub.</p><p>Cost: ${cost} Rs</p>`;
      await sendSystemEmail(user.uid, user.email || '', 'Notification', 'Job Posted', jobEmail);
  };
  
  const handleWithdraw = async (amount: number, details: WithdrawalDetails) => {
    if (!user || !userProfile) return;
    const action = async () => {
      try { 
        const reqRef = doc(collection(db, "withdrawal_requests"));
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(doc(db, "users", user.uid));
          if (!userDoc.exists() || userDoc.data().balance < amount) throw new Error("Insufficient balance.");
          transaction.update(doc(db, "users", user.uid), { balance: increment(-amount), savedWithdrawalDetails: details });
          transaction.set(doc(collection(db, "users", user.uid, "transactions")), { type: TransactionType.WITHDRAWAL, description: `Withdrawal to ${details.method}`, amount: -amount, date: serverTimestamp(), withdrawalDetails: details, status: 'Pending', withdrawalRequestId: reqRef.id });
          transaction.set(reqRef, { userId: user.uid, username: userDoc.data().username, amount, withdrawalDetails: details, status: 'Pending', createdAt: serverTimestamp() });
        }); 
        const withdrawEmail = `<div style="font-family: sans-serif; color: #333;"><h2 style="color: #0F4C47;">Withdrawal Request Received</h2><p>Your withdrawal request has been successfully submitted.</p><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" /><p><strong>Amount:</strong> ${amount} Rs</p><p><strong>Method:</strong> ${details.method}</p><p><strong>Account:</strong> ${details.accountNumber}</p><p><strong>Transaction ID:</strong> ${reqRef.id}</p><p><strong>Status:</strong> Pending</p><br/><p style="font-size: 12px; color: #666;">Processing usually takes 24-48 hours. You will be notified once approved.</p></div>`;
        await sendSystemEmail(user.uid, user.email || '', 'Notification', 'Withdrawal Receipt', withdrawEmail);
      } catch (error: any) { console.error(error); alert(`Withdrawal failed: ${error.message}`); }
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
    const depositEmail = `<h3>Deposit Verification Pending</h3><p>We have received your deposit request.</p><p>Amount: ${amount} Rs</p><p>TID: ${transactionId}</p><p>Please allow 1-2 hours for verification.</p>`;
    await sendSystemEmail(user.uid, user.email || '', 'Notification', 'Deposit Request Submitted', depositEmail);
  };

  const handleBuySpin = async (cost: number): Promise<boolean> => {
      if (!user || !userProfile || userProfile.balance < cost) return false;
      try { const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(-cost) }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.SPIN_PURCHASE, description: `Purchased a Spin`, amount: -cost, date: serverTimestamp() }); await batch.commit(); return true; } catch { return false; }
  };
  
  const handleGameWin = async (amount: number, gameName: string) => { if (!user) return; const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { balance: increment(amount) }); batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.GAME_WIN, description: `Won in ${gameName}`, amount, date: serverTimestamp() }); await batch.commit(); };
  
  const handleGameLoss = async (amount: number, gameName: string) => { 
      if (!user) return; 
      const batch = writeBatch(db); 
      const userRef = doc(db, "users", user.uid); 
      batch.update(userRef, { balance: increment(-amount) }); 
      batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.GAME_LOSS, description: `Lost in ${gameName}`, amount: -amount, date: serverTimestamp() }); 
      await batch.commit(); 
  };
  
  const handleSubscribe = async (plan: JobSubscriptionPlan, cost: number) => { 
      if(!user || !userProfile || userProfile.balance < cost) return; 
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 30); 
      const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); 
      batch.update(userRef, { balance: increment(-cost), jobSubscription: { plan, expiryDate: expiry.toISOString().split('T')[0], applicationsToday: 0, lastApplicationDate: new Date().toISOString().split('T')[0] } }); 
      batch.set(doc(collection(userRef, "transactions")), { type: TransactionType.JOB_SUBSCRIPTION, description: `${plan} Plan Subscription`, amount: -cost, date: serverTimestamp() }); 
      await batch.commit(); 
      const subEmail = `<h2 style="color:#0F4C47;">Subscription Activated</h2><p>You are now a member of the <strong>${plan}</strong> Plan.</p><p>Validity: 30 Days</p><p>Enjoy premium access to jobs and features.</p>`;
      await sendSystemEmail(user.uid, user.email || '', 'Notification', 'Subscription Activated', subEmail);
  };

  const handleApply = async (jobId: string) => { if (!user || !userProfile) return; const job = jobs.find(j => j.id === jobId); if(!job) return; const batch = writeBatch(db); const userRef = doc(db, "users", user.uid); batch.update(userRef, { 'jobSubscription.applicationsToday': increment(1), 'jobSubscription.lastApplicationDate': new Date().toISOString().split('T')[0] }); batch.set(doc(collection(userRef, "applications")), { jobId, jobTitle: job.title, date: serverTimestamp(), status: 'Submitted' }); await batch.commit(); };
  const handleUpdateProfile = async (data: any) => { if(!user) return; if(data.name !== user.displayName) await updateProfile(user, { displayName: data.name }); if(data.email !== user.email) await updateEmail(user, data.email); if(data.password) await updatePassword(user, data.password); await updateDoc(doc(db, "users", user.uid), { username: data.name, email: data.email }); };
  const handleCreateSocialGroup = async (groupData: any) => { if (!user) return; await addDoc(collection(db, "social_groups"), { ...groupData, submittedBy: user.uid, submittedAt: serverTimestamp(), status: 'pending' }); };

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
    } catch (error) { console.error("Error updating profile picture:", error); alert("Failed to update profile picture."); }
  };

  const renderContent = () => {
    const views: Record<View, React.ReactNode> = {
      // EARNER VIEWS
      DASHBOARD: <DashboardView userProfile={userProfile} balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.tasksCompletedCount ?? 0} invitedCount={userProfile?.invitedCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} onSwitchMode={toggleUserMode} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} joinedAt={userProfile?.joinedAt} userMode={userMode} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView userProfile={userProfile} referrals={referrals} />,
      SPIN_WHEEL: <SpinWheelView onWin={(amount) => handleGameWin(amount, 'Spin & Win')} balance={userProfile?.balance ?? 0} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onUpdatePhoto={handleUploadProfilePicture} onLogout={handleLogout} onSetFingerprintEnabled={async () => { if (user) await updateDoc(doc(db, "users", user.uid), { isFingerprintEnabled: true }); }} onNavigate={setActiveView} onSendVerificationOTP={handleSendVerificationOTP} userMode={userMode} />,
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
      MAILBOX: <MailboxView emails={emailLogs} onMarkAsRead={handleMarkEmailAsRead} userMode={userMode} />,
      
      // ADVERTISER VIEWS
      ADVERTISER_DASHBOARD: <AdvertiserDashboard balance={userProfile?.balance ?? 0} setActiveView={setActiveView} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      POST_JOB: <PostJobView balance={userProfile?.balance ?? 0} onPostJob={handlePostJob} />,
      MANAGE_CAMPAIGNS: <TaskHistoryView userTasks={userCreatedTasks} />,
      ADS_GUIDE: <AdsGuideView />,
      ADS_POLICY: <AdsPolicyView />,
    };
    return views[activeView] || (userMode === 'ADVERTISER' ? views['ADVERTISER_DASHBOARD'] : views['DASHBOARD']);
  };

  if (isLoading) return <LoadingScreen />;
  if (!user) { if (authAction) return <AuthView onSignup={handleSignup} onLogin={handleLogin} onForgotPassword={handleForgotPassword} initialView={authAction} />; return <LandingView onGetStarted={handleAuthNavigation} />; }
  if (!userProfile) return <LoadingScreen />;

  return (
    <>
      {notificationPermission === 'default' && <NotificationBanner onRequestPermission={() => Notification.requestPermission().then(setNotificationPermission)} onDismiss={() => setNotificationPermission('dismissed')} />}
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      
      {/* Switching Loader Overlay */}
      {isSwitchingMode && (
          <ModeSwitchLoader targetMode={userMode === 'EARNER' ? 'ADVERTISER' : 'EARNER'} />
      )}

      <div className="fixed top-4 right-4 z-[100] space-y-3 w-full max-w-sm"> {notifications.map(n => (<NotificationToast key={n.id} title={n.title} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(i => i.id !== n.id))} />))} </div>
      
      {/* GLOBAL MAILBOX OVERLAY */}
      {isMailboxOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
              <div className="bg-white w-full h-[85vh] sm:max-w-2xl sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up relative">
                  <button onClick={() => setIsMailboxOpen(false)} className="absolute top-4 right-4 z-20 bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
                      <CloseIcon className="w-6 h-6 text-slate-900" />
                  </button>
                  <div className="overflow-y-auto flex-1">
                      <MailboxView emails={emailLogs} onMarkAsRead={handleMarkEmailAsRead} userMode={userMode} />
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col bg-[#F9FAFB] min-h-screen font-sans pb-[80px] md:pb-0">
          <Header 
            username={userProfile.username} 
            setActiveView={setActiveView} 
            unreadEmailCount={unreadEmailCount} 
            onMenuClick={() => setIsSidebarOpen(true)} 
            userMode={userMode}
          />
          
          <div className="flex flex-1 relative">
              {/* Sidebar - Only for Advertiser Mode */}
              {userMode === 'ADVERTISER' && (
                  <Sidebar 
                      activeView={activeView} 
                      setActiveView={setActiveView} 
                      isSidebarOpen={isSidebarOpen} 
                      onClose={() => setIsSidebarOpen(false)} 
                      unreadUpdatesCount={0} 
                      userMode={userMode}
                      onSwitchMode={toggleUserMode}
                  />
              )}
              
              {/* Main Content - Adjust margin based on Sidebar presence */}
              <main className={`flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full transition-all duration-300 ${userMode === 'EARNER' ? '' : 'md:ml-0'}`}>
                  {renderContent()}
              </main>
          </div>

          {/* BottomNav - Always Visible for Earner Mode (Mobile & Desktop) */}
          {userMode === 'EARNER' && <BottomNav activeView={activeView} setActiveView={setActiveView} />}
          
          {showPinLock && <PinLockView mode={pinLockMode} onClose={() => { setShowPinLock(false); setPinAction(null); }} onPinCorrect={() => { setShowPinLock(false); pinAction && pinAction(); setPinAction(null); }} onPinSet={handleSetPin} onSkip={() => setShowPinLock(false)} pinToVerify={userProfile.walletPin ?? undefined} />}
      </div>
      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default App;
