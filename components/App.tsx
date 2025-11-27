
// components/App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'; // Kept for desktop if needed, but we are moving to BottomNav per request
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
import AdsWatchView from './AdsWatchView'; // New Import
import ModeSwitchLoader from './ModeSwitchLoader';
import AIAgentChatbot from './AIAgentChatbot';
import { GameControllerIcon, CloseIcon, CodeIcon } from './icons';

import type { View, UserProfile, Transaction, Task, UserCreatedTask, Job, JobSubscriptionPlan, WithdrawalDetails, Application, SocialGroup, Referral, EmailLog, UserMode } from '../types';
import { TransactionType } from '../types';

import { auth, db, serverTimestamp, increment, arrayUnion, storage } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, sendEmailVerification, sendPasswordResetEmail, User } from 'firebase/auth';
import { doc, getDoc, getDocs, updateDoc, collection, addDoc, onSnapshot, query, orderBy, runTransaction, where, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ... (AppUpdate Interface and Data remains same)
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

// ... (LEVEL_NAMES and UpdatesView remains same)
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

// --- Functional Dummy Views for Advertiser ---
const AdPixelView = () => (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tracking Pixel Setup</h2>
        <p className="text-slate-600 mb-6">Install this code snippet in the <code>&lt;head&gt;</code> of your website to track conversions.</p>
        <div className="bg-slate-900 p-4 rounded-xl overflow-x-auto mb-6">
            <pre className="text-green-400 text-sm font-mono">
{`<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.taskmint.net/en_US/fbevents.js');
  fbq('init', 'TM-${Math.floor(Math.random()*100000000)}');
  fbq('track', 'PageView');
</script>`}
            </pre>
        </div>
        <button className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">Copy Code</button>
    </div>
);

const GeofencingView = () => (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Audience Geofencing (Pakistan)</h2>
        <p className="text-slate-600 mb-6">Select target regions in Pakistan for your campaign.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['All Pakistan', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta'].map(region => (
                <button key={region} className="p-4 border rounded-xl text-left hover:border-green-500 hover:bg-green-50 transition-all group flex justify-between items-center">
                    <span className="font-bold text-slate-700 group-hover:text-green-700">{region}</span>
                    {region === 'All Pakistan' && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">Best Value</span>}
                </button>
            ))}
        </div>
        <button className="mt-6 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
            Update Targeting
        </button>
    </div>
);

const ConversionEventsView = () => (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Conversion Events</h2>
        <div className="space-y-4">
            {['Sign Up', 'Purchase', 'Add to Cart', 'Lead'].map(event => (
                <div key={event} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800">{event}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                </div>
            ))}
        </div>
        <button className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors">
            + Create Custom Event
        </button>
    </div>
);

const BillingView = () => (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Billing & Invoices</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[1, 2, 3].map(i => (
                        <tr key={i} className="bg-white hover:bg-gray-50">
                            <td className="px-6 py-4 text-slate-900">Aug {10 + i}, 2024</td>
                            <td className="px-6 py-4 font-mono text-slate-500">INV-{2024000 + i}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{500 * i} Rs</td>
                            <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">Paid</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const App: React.FC = () => {
  // ... (State and Effects remain mostly the same)
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Initialize userMode from localStorage to persist state across refreshes
  const [userMode, setUserMode] = useState<UserMode>(() => {
      const savedMode = localStorage.getItem('userMode');
      return (savedMode === 'ADVERTISER' || savedMode === 'EARNER') ? savedMode : 'EARNER';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Kept but maybe unused for Advertiser now
  
  const [activeView, setActiveViewInternal] = useState<View>(() => {
      if (typeof window !== 'undefined' && window.history.state?.view) {
          return window.history.state.view as View;
      }
      return 'DASHBOARD';
  });

  // ... (All other standard state: transactions, tasks, etc.)
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Global chat state
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

  // Real-time Stats aggregation for Advertiser Dashboard
  const adStats = useMemo(() => {
      let impressions = 0;
      let clicks = 0;
      let spend = 0;

      // Sum up impressions and clicks from all user created tasks
      userCreatedTasks.forEach(task => {
          impressions += (task.views || 0);
          clicks += (task.completions || 0);
      });

      // Calculate real spend from transactions (Task Creation, Job Posting)
      baseTransactions.forEach(tx => {
          if (tx.type === TransactionType.TASK_CREATION || tx.type === TransactionType.JOB_POSTING_FEE) {
              spend += Math.abs(tx.amount);
          }
      });

      return { impressions, clicks, spend };
  }, [userCreatedTasks, baseTransactions]);

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
      setIsSwitchingMode(true);
      
      // Delay to allow loader animation to play
      setTimeout(() => {
          setUserMode(prev => {
              const newMode = prev === 'EARNER' ? 'ADVERTISER' : 'EARNER';
              localStorage.setItem('userMode', newMode); // Persist choice
              setActiveView(newMode === 'ADVERTISER' ? 'ADVERTISER_DASHBOARD' : 'DASHBOARD');
              
              // Show Toast
              setNotifications(prevNotifs => [
                  ...prevNotifs,
                  {
                      id: Date.now().toString(),
                      title: newMode === 'ADVERTISER' ? 'Creator Mode Enabled' : 'Earning Mode Enabled',
                      message: newMode === 'ADVERTISER' ? 'Welcome to your Business Console.' : 'Welcome back to Task Wall.',
                      type: 'success'
                  }
              ]);
              return newMode;
          });
          setIsSwitchingMode(false);
      }, 3000);
  };

  // ... (Email, Login, Signup, Task Logic remains same)
  const sendSystemEmail = async (userId: string, userEmail: string, type: EmailLog['type'], subject: string, htmlContent: string) => {
      try {
          const batch = writeBatch(db);
          const logRef = doc(collection(db, `users/${userId}/email_logs`));
          const logData: Omit<EmailLog, 'id'> = { type, subject, recipient: userEmail, date: serverTimestamp(), status: 'Sent', bodyPreview: htmlContent };
          batch.set(logRef, logData);
          await batch.commit();
      } catch (e) { console.error(e); }
  };
  const handleMarkEmailAsRead = async (emailId: string) => { if (!user) return; await updateDoc(doc(db, `users/${user.uid}/email_logs`, emailId), { status: 'Opened' }); };
  const handleSendVerificationOTP = async (type: 'email' | 'phone', destination: string, otp: string) => { if(user) sendSystemEmail(user.uid, destination, 'Verification', 'Verification Code', `Code: ${otp}`); };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) setUserProfile(docSnap.data() as UserProfile);
        });
        const transactionsQuery = query(collection(db, "users", firebaseUser.uid, "transactions"), orderBy("date", "desc"));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => setBaseTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))));
        
        const withdrawalsQuery = query(collection(db, "withdrawal_requests"), where("userId", "==", firebaseUser.uid));
        const unsubscribeWithdrawals = onSnapshot(withdrawalsQuery, (s) => { const m:any={}; s.forEach(d=>m[d.id]=d.data().status); setWithdrawalStatuses(m); });
        const userTasksQuery = query(collection(db, "tasks"), where("createdBy", "==", firebaseUser.uid), orderBy("submittedAt", "desc"));
        const unsubscribeUserTasks = onSnapshot(userTasksQuery, (s) => setUserCreatedTasks(s.docs.map(d=>({id:d.id,...d.data()} as UserCreatedTask))));
        const applicationsQuery = query(collection(db, "users", firebaseUser.uid, "applications"), orderBy("date", "desc"));
        const unsubscribeApplications = onSnapshot(applicationsQuery, (s) => setApplications(s.docs.map(d=>({id:d.id,...d.data()} as Application))));
        const userGroupsQuery = query(collection(db, 'social_groups'), where('submittedBy', '==', firebaseUser.uid), orderBy('submittedAt', 'desc'));
        const unsubscribeUserGroups = onSnapshot(userGroupsQuery, (s) => setUserSocialGroups(s.docs.map(d=>({id:d.id,...d.data()} as SocialGroup))));
        const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribeReferrals = onSnapshot(referralsQuery, (s) => setReferrals(s.docs.map(d=>({id:d.id,...d.data()} as Referral))));
        const emailsQuery = query(collection(db, `users/${firebaseUser.uid}/email_logs`), orderBy('date', 'desc'));
        const unsubscribeEmails = onSnapshot(emailsQuery, (s) => setEmailLogs(s.docs.map(d=>({id:d.id,...d.data()} as EmailLog))));

        return () => { unsubscribeProfile(); unsubscribeTransactions(); unsubscribeWithdrawals(); unsubscribeUserTasks(); unsubscribeApplications(); unsubscribeUserGroups(); unsubscribeReferrals(); unsubscribeEmails(); };
      } else {
        setUser(null); setUserProfile(null); setBaseTransactions([]); setActiveViewInternal('DASHBOARD'); setIsLoading(false); setAuthAction(null); setEmailLogs([]);
      }
    });
    
    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (s) => setTasks(s.docs.map(d=>({id:d.id,...d.data()} as UserCreatedTask))));
    const jobsQuery = query(collection(db, 'jobs'));
    const unsubscribeJobs = onSnapshot(jobsQuery, (s) => setJobs(s.docs.map(d=>({id:d.id,...d.data()} as Job))));
    const groupsQuery = query(collection(db, 'social_groups'), where('status', '==', 'approved'), orderBy('submittedAt', 'desc'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (s) => setSocialGroups(s.docs.map(d=>({id:d.id,...d.data()} as SocialGroup))));
    return () => { unsubscribe(); unsubscribeTasks(); unsubscribeJobs(); unsubscribeGroups(); };
  }, []);

  useEffect(() => { if ((user && userProfile) || !user) setIsLoading(false); }, [user, userProfile]);

  // ... (Auth Handlers)
  const handleAuthNavigation = useCallback((view: 'login' | 'signup') => setAuthAction(view), []);
  const handleSignup = async (data: any) => { /* Simplified */ try { const uc = await createUserWithEmailAndPassword(auth, data.email, data.password); await updateProfile(uc.user, {displayName: data.username}); const batch=writeBatch(db); const uRef=doc(db,"users",uc.user.uid); batch.set(uRef, {uid:uc.user.uid, username:data.username, username_lowercase: data.username.toLowerCase(), email:data.email, phone:data.phone, photoURL:null, joinedAt:serverTimestamp(), paymentStatus:'VERIFIED', balance:100, referralCode:uc.user.uid.substring(0,8), tasksCompletedCount:0, invitedCount:0, totalReferralEarnings:0, completedTaskIds:[], savedWithdrawalDetails:null, walletPin:null, isFingerprintEnabled:false, jobSubscription:null, level:1, levelName:"Starter", totalTasks:0, levelProgress:0, tasksForNextLevel:10}); batch.set(doc(collection(uRef,"transactions")), {type:TransactionType.JOINING_FEE,description:"Joining Bonus",amount:100,date:serverTimestamp()}); await batch.commit(); setActiveViewInternal('DASHBOARD'); } catch(e:any) { alert(e.message); } };
  const handleLogin = async (email: string, password: string) => { try { await signInWithEmailAndPassword(auth, email, password); setAuthAction(null); } catch(e:any) { alert(e.message); } };
  const handleForgotPassword = async (email: string) => { try { await sendPasswordResetEmail(auth, email); alert("Email sent!"); } catch(e:any) { alert(e.message); } };
  const handleLogout = () => signOut(auth);

  // ... (Action Handlers)
  const handleCompleteTask = async (taskId: string) => { if(!user||!userProfile)return; const task=tasks.find(t=>t.id===taskId); if(!task)return; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{balance:increment(task.reward),completedTaskIds:arrayUnion(taskId),tasksCompletedCount:increment(1)}); batch.update(doc(db,"tasks",taskId),{completions:increment(1)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.EARNING,description:`Completed: ${task.title}`,amount:task.reward,date:serverTimestamp()}); await batch.commit(); };
  const handleTaskView = async (id:string) => updateDoc(doc(db,"tasks",id),{views:increment(1)});
  const handleCreateTask = async (task:any,qty:number,cost:number) => { if(!user||!userProfile||userProfile.balance<cost)return; const batch=writeBatch(db); batch.set(doc(collection(db,"tasks")),{...task,quantity:qty,completions:0,views:0,status:'pending',submittedAt:serverTimestamp(),createdBy:user.uid}); batch.update(doc(db,"users",user.uid),{balance:increment(-cost)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.TASK_CREATION,description:`Campaign: ${task.title}`,amount:-cost,date:serverTimestamp()}); await batch.commit(); };
  const handlePostJob = async (jobData:any, cost:number) => { if(!user||!userProfile||userProfile.balance<cost)return; const batch=writeBatch(db); batch.set(doc(collection(db,"jobs")),{...jobData,postedAt:serverTimestamp(),postedBy:user.uid}); batch.update(doc(db,"users",user.uid),{balance:increment(-cost)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.JOB_POSTING_FEE,description:`Posted Job: ${jobData.title}`,amount:-cost,date:serverTimestamp()}); await batch.commit(); };
  const handleWithdraw = async (amt:number, details:WithdrawalDetails) => { if(!user||!userProfile)return; const action=async()=>{ const req=doc(collection(db,"withdrawal_requests")); await runTransaction(db,async(t)=>{ const u=await t.get(doc(db,"users",user.uid)); if(u.data()?.balance<amt)throw new Error("Low balance"); t.update(doc(db,"users",user.uid),{balance:increment(-amt),savedWithdrawalDetails:details}); t.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.WITHDRAWAL,description:`Withdrawal to ${details.method}`,amount:-amt,date:serverTimestamp(),withdrawalDetails:details,status:'Pending',withdrawalRequestId:req.id}); t.set(req,{userId:user.uid,username:u.data()?.username,amount:amt,withdrawalDetails:details,status:'Pending',createdAt:serverTimestamp()}); }); }; if(userProfile.walletPin){ setPinLockMode('enter'); setShowPinLock(true); setPinAction(()=>action); }else{ await action(); } };
  const handleDeposit = async (amt:number, method:any, tid:string) => { if(!user)return; const batch=writeBatch(db); const req=doc(collection(db,"deposit_requests")); batch.set(req,{userId:user.uid,username:userProfile?.username,amount:amt,transactionId:tid,method,status:'Pending',createdAt:serverTimestamp()}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.PENDING_DEPOSIT,description:`Deposit via ${method}`,amount:amt,date:serverTimestamp(),status:'Pending',depositDetails:{method,transactionId:tid},depositRequestId:req.id}); await batch.commit(); };
  const handleBuySpin = async (cost: number) => { if(!user||!userProfile||userProfile.balance<cost)return false; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{balance:increment(-cost)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.SPIN_PURCHASE,description:'Purchased a Spin',amount:-cost,date:serverTimestamp()}); await batch.commit(); return true; };
  const handleGameWin = async(amt:number, name:string)=>{ if(!user)return; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{balance:increment(amt)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.GAME_WIN,description:`Won in ${name}`,amount:amt,date:serverTimestamp()}); await batch.commit(); };
  const handleGameLoss = async(amt:number, name:string)=>{ if(!user)return; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{balance:increment(-amt)}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.GAME_LOSS,description:`Lost in ${name}`,amount:-amt,date:serverTimestamp()}); await batch.commit(); };
  const handleSubscribe = async(plan:JobSubscriptionPlan, cost:number)=>{ if(!user||!userProfile||userProfile.balance<cost)return; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{balance:increment(-cost),jobSubscription:{plan,expiryDate:new Date(Date.now()+30*86400000).toISOString(),applicationsToday:0,lastApplicationDate:new Date().toISOString()}}); batch.set(doc(collection(db,"users",user.uid,"transactions")),{type:TransactionType.JOB_SUBSCRIPTION,description:`${plan} Plan`,amount:-cost,date:serverTimestamp()}); await batch.commit(); };
  const handleApply = async(jobId:string)=>{ if(!user)return; const job=jobs.find(j=>j.id===jobId); if(!job)return; const batch=writeBatch(db); batch.update(doc(db,"users",user.uid),{'jobSubscription.applicationsToday':increment(1)}); batch.set(doc(collection(db,"users",user.uid,"applications")),{jobId,jobTitle:job.title,date:serverTimestamp(),status:'Submitted'}); await batch.commit(); };
  const handleUpdateProfile = async(data:any)=>{ if(!user)return; if(data.name!==user.displayName) await updateProfile(user,{displayName:data.name}); if(data.email!==user.email) await updateEmail(user,data.email); if(data.password) await updatePassword(user,data.password); await updateDoc(doc(db,"users",user.uid),{username:data.name,email:data.email}); };
  const handleCreateSocialGroup = async(g:any)=>{ if(!user)return; await addDoc(collection(db,"social_groups"),{...g,submittedBy:user.uid,submittedAt:serverTimestamp(),status:'pending'}); };
  const handleUploadProfilePicture = async(file:File|null,url?:string)=>{ if(!user)return; let p=url||''; if(file){const r=ref(storage,`profile_pictures/${user.uid}`); await uploadBytes(r,file); p=await getDownloadURL(r);} await updateProfile(user,{photoURL:p}); await updateDoc(doc(db,"users",user.uid),{photoURL:p}); setUserProfile(pr=>pr?{...pr,photoURL:p}:null); };

  // NEW: Handle Watch Ad Reward
  const handleWatchAd = async (reward: number) => {
      if (!user) return;
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { balance: increment(reward) });
      batch.set(doc(collection(db, "users", user.uid, "transactions")), {
          type: TransactionType.AD_WATCH,
          description: 'Watched Video Ad',
          amount: reward,
          date: serverTimestamp()
      });
      await batch.commit();
  };

  const renderContent = () => {
    const views: Record<View, React.ReactNode> = {
      // EARNER VIEWS
      DASHBOARD: <DashboardView userProfile={userProfile} balance={userProfile?.balance ?? 0} tasksCompleted={userProfile?.tasksCompletedCount ?? 0} invitedCount={userProfile?.invitedCount ?? 0} setActiveView={setActiveView} username={userProfile?.username ?? ''} onSwitchMode={toggleUserMode} />,
      EARN: <EarnView tasks={tasks} onCompleteTask={handleCompleteTask} onTaskView={handleTaskView} completedTaskIds={userProfile?.completedTaskIds ?? []} />,
      ADS_WATCH: <AdsWatchView onWatchAd={handleWatchAd} />, // New View
      WALLET: <WalletView balance={userProfile?.balance ?? 0} pendingRewards={0} transactions={transactions} username={userProfile?.username ?? ''} onWithdraw={handleWithdraw} savedDetails={userProfile?.savedWithdrawalDetails ?? null} hasPin={!!userProfile?.walletPin} onSetupPin={() => { setPinLockMode('set'); setShowPinLock(true); }} joinedAt={userProfile?.joinedAt} userMode={userMode} />,
      TASK_HISTORY: <TaskHistoryView userTasks={userCreatedTasks} />,
      INVITE: <InviteView userProfile={userProfile} referrals={referrals} />,
      SPIN_WHEEL: <SpinWheelView onWin={(amount) => handleGameWin(amount, 'Spin & Win')} balance={userProfile?.balance ?? 0} onBuySpin={handleBuySpin} />,
      PLAY_AND_EARN: <PlayAndEarnView setActiveView={setActiveView} />,
      DEPOSIT: <DepositView onDeposit={handleDeposit} transactions={transactions} />,
      PROFILE_SETTINGS: <ProfileSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onUpdatePhoto={handleUploadProfilePicture} onLogout={handleLogout} onSetFingerprintEnabled={async () => { if (user) await updateDoc(doc(db, "users", user.uid), { isFingerprintEnabled: true }); }} onNavigate={setActiveView} onSendVerificationOTP={handleSendVerificationOTP} userMode={userMode} onSwitchMode={toggleUserMode} onOpenSupport={() => setIsChatOpen(true)} />,
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
      ADVERTISER_DASHBOARD: <AdvertiserDashboard balance={userProfile?.balance ?? 0} setActiveView={setActiveView} stats={adStats} transactions={transactions} onSwitchMode={toggleUserMode} />,
      CREATE_TASK: <CreateTaskView balance={userProfile?.balance ?? 0} onCreateTask={handleCreateTask} />,
      POST_JOB: <PostJobView balance={userProfile?.balance ?? 0} onPostJob={handlePostJob} />,
      MANAGE_CAMPAIGNS: <TaskHistoryView userTasks={userCreatedTasks} />,
      ADS_GUIDE: <AdsGuideView />,
      ADS_POLICY: <AdsPolicyView />,
      AD_PIXEL: <AdPixelView />,
      GEOFENCING: <GeofencingView />,
      CONVERSION_EVENTS: <ConversionEventsView />,
      BILLING: <BillingView />
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
      
      {isSwitchingMode && <ModeSwitchLoader targetMode={userMode === 'EARNER' ? 'ADVERTISER' : 'EARNER'} />}

      <div className="fixed top-4 right-4 z-[100] space-y-3 w-full max-w-sm"> {notifications.map(n => (<NotificationToast key={n.id} title={n.title} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(i => i.id !== n.id))} />))} </div>
      
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
            userMode={userMode}
          />
          
          <div className="flex flex-1 relative">
              <main className={`flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full transition-all duration-300`}>
                  {renderContent()}
              </main>
          </div>

          {/* BottomNav for BOTH modes, passing userMode prop */}
          <BottomNav activeView={activeView} setActiveView={setActiveView} userMode={userMode} />
          
          {showPinLock && <PinLockView mode={pinLockMode} onClose={() => { setShowPinLock(false); setPinAction(null); }} onPinCorrect={() => { setShowPinLock(false); pinAction && pinAction(); setPinAction(null); }} onPinSet={async (pin) => { if (user) { await updateDoc(doc(db, "users", user.uid), { walletPin: pin }); setShowPinLock(false); pinAction && pinAction(); setPinAction(null); } }} onSkip={() => setShowPinLock(false)} pinToVerify={userProfile.walletPin ?? undefined} />}
      </div>
      
      {/* AI Chatbot Widget - Controlled by app state */}
      <AIAgentChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
