
// types.ts

// FIX: Globally declare and augment types for JSX custom elements and import.meta.env
declare global {
  // For particles.js used in AuthView.tsx and LandingView.tsx
  interface Window {
    particlesJS: any;
  }
}

export type View =
  | 'DASHBOARD'
  | 'EARN'
  | 'SPIN_WHEEL'
  | 'PLAY_AND_EARN'
  | 'ADS_WATCH' // Added for new feature
  | 'WALLET'
  | 'DEPOSIT'
  | 'CREATE_TASK'
  | 'TASK_HISTORY'
  | 'INVITE'
  | 'PROFILE_SETTINGS'
  | 'HOW_IT_WORKS'
  | 'ABOUT_US'
  | 'CONTACT_US'
  | 'JOBS'
  | 'MY_APPLICATIONS'
  | 'PRIVACY_POLICY'
  | 'TERMS_CONDITIONS'
  | 'LUDO_GAME'
  | 'LOTTERY_GAME'
  | 'COIN_FLIP_GAME'
  | 'MINES_GAME'
  | 'SOCIAL_GROUPS'
  | 'UPDATES_INBOX'
  | 'PREMIUM_HUB'
  | 'LEADERBOARD'
  | 'LEVELS_INFO'
  | 'MAILBOX'
  // Advertiser Views
  | 'ADVERTISER_DASHBOARD'
  | 'POST_JOB'
  | 'MANAGE_CAMPAIGNS'
  | 'ADS_GUIDE'
  | 'ADS_POLICY'
  | 'AD_PIXEL'
  | 'GEOFENCING'
  | 'CONVERSION_EVENTS'
  | 'BILLING';

export type UserMode = 'EARNER' | 'ADVERTISER';

export enum TransactionType {
  EARNING = 'Earning',
  WITHDRAWAL = 'Withdrawal',
  DEPOSIT = 'Deposit',
  PENDING_DEPOSIT = 'Pending Deposit',
  TASK_CREATION = 'Task Creation Fee',
  JOB_POSTING_FEE = 'Job Posting Fee',
  REFERRAL = 'Referral Bonus',
  JOINING_FEE = 'Joining Fee',
  JOB_SUBSCRIPTION = 'Job Subscription',
  SPIN_PURCHASE = 'Spin Purchase',
  GAME_WIN = 'Game Win',
  GAME_LOSS = 'Game Loss',
  BET_CANCELLED = 'Bet Cancelled',
  AD_WATCH = 'Ad Watch Reward', // Added for new feature
}

export interface WithdrawalDetails {
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'NayaPay' | 'SadaPay' | 'UPaisa';
  accountName: string;
  accountNumber: string;
  bankName?: string;
}

export interface DepositDetails {
    method: 'EasyPaisa' | 'JazzCash';
    transactionId: string;
    proofUrl?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: any; // Can be string or Firestore timestamp
  withdrawalDetails?: WithdrawalDetails;
  depositDetails?: DepositDetails;
  status?: 'Completed' | 'Pending' | 'Failed' | 'Approved' | 'Rejected';
  withdrawalRequestId?: string; // Link to the top-level withdrawal request
  depositRequestId?: string; // Link to the top-level deposit request
}

export enum TaskType {
  VISIT_WEBSITE = 'Visit Website',
  YOUTUBE_SUBSCRIBE = 'YouTube Subscribe',
  FACEBOOK_LIKE = 'Facebook Like Page',
  INSTAGRAM_FOLLOW = 'Instagram Follow',
  TIKTOK_FOLLOW = 'TikTok Follow',
  TWITTER_FOLLOW = 'Twitter Follow',
  LINKEDIN_FOLLOW = 'LinkedIn Follow',
  DISCORD_JOIN = 'Discord Join',
  TELEGRAM_JOIN = 'Telegram Join',
  SNAPCHAT_FOLLOW = 'Snapchat Follow',
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  url: string;
  reward: number;
}

export interface UserCreatedTask extends Task {
    quantity: number;
    completions: number;
    views: number;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
    createdBy: string;
}


export type PaymentStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'VERIFIED';

export type JobSubscriptionPlan = 'Starter' | 'Growth' | 'Business' | 'Enterprise';

export interface JobSubscription {
    plan: JobSubscriptionPlan;
    expiryDate: string;
    applicationsToday: number;
    lastApplicationDate: string; // YYYY-MM-DD
}

export interface UserProfile {
  uid: string;
  username: string;
  username_lowercase: string;
  email: string;
  phone: string;
  photoURL: string | null; // Added photoURL
  joinedAt: any; // Firestore Timestamp
  paymentStatus: PaymentStatus;
  jobSubscription: JobSubscription | null;
  referralCount: number; // Deprecated, use invitedCount instead for clarity
  invitedCount: number;
  totalReferralEarnings: number;
  balance: number;
  completedTaskIds: string[];
  savedWithdrawalDetails: WithdrawalDetails | null;
  walletPin: string | null;
  isFingerprintEnabled?: boolean;
  referralCode: string; // Made non-optional
  referredBy?: string; // Storing only referrerId
  tasksCompletedCount: number;
  
  // --- NEW LEVEL SYSTEM FIELDS ---
  level?: number;
  levelName?: string;
  totalTasks?: number; // Redundant with tasksCompletedCount but added per request
  tasksForNextLevel?: number;
  levelProgress?: number;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    type: string; // e.g., 'Full-time', 'Part-time'
    salary: string;
    isPremium: boolean;
    postedBy?: string; // Added to link back to advertiser
    postedAt?: any;
}

export interface Application {
    id: string; // Firestore document ID
    jobId: string;
    jobTitle: string;
    date: any; // Firestore timestamp
    status: 'Submitted' | 'Under Review' | 'Rejected';
}

export interface SocialGroup {
    id: string;
    url: string;
    category: 'Study' | 'Dating' | 'Gaming' | 'Movies' | 'News' | 'Funny' | 'Videos' | 'Sad Statuses' | 'Tech' | 'Prompts' | 'Other';
    title: string;
    description: string;
    imageUrl?: string; // Auto-fetched by backend
    submittedBy: string; // user uid
    submittedAt: any; // Firestore timestamp
    status: 'pending' | 'approved' | 'rejected';
}

export type ReferralStatus = 'pending_referrer_tasks' | 'pending_referred_tasks' | 'eligible' | 'credited';

export interface Referral {
    id: string;
    referrerId: string;
    referredUserId: string;
    referredUsername: string;
    isNewSystem?: boolean; // Flag to identify new cards definitively
    referrerTasksCompleted?: number; // Tracks Inviter's tasks relative to this referral
    referredUserTasksCompleted: number;
    status: ReferralStatus;
    bonusAmount: number;
    createdAt: any; // Firestore timestamp
}

// --- NEW EMAIL SYSTEM TYPES ---
export interface EmailLog {
    id: string;
    type: 'Welcome' | 'Security Alert' | 'Verification' | 'Notification' | 'Password Reset';
    subject: string;
    recipient: string;
    date: any; // Firestore timestamp
    status: 'Sent' | 'Delivered' | 'Opened';
    bodyPreview?: string;
}
