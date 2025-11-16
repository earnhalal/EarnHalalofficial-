// types.ts

// FIX: The <reference types="vite/client" /> directive was removed from this file to resolve a "Cannot find type definition file" error. It has been moved to the main application entrypoint (index.tsx) to ensure types are loaded globally.

// FIX: Removed the global JSX declaration for 'lottie-player'. It was incorrectly overwriting React's default intrinsic elements,
// causing errors for all standard HTML/SVG elements. The declaration was moved to AuthView.tsx where the element is used.

export type View =
  | 'DASHBOARD'
  | 'EARN'
  | 'SPIN_WHEEL'
  | 'PLAY_AND_EARN'
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
  | 'UPDATES_INBOX';

export enum TransactionType {
  EARNING = 'Earning',
  WITHDRAWAL = 'Withdrawal',
  DEPOSIT = 'Deposit',
  PENDING_DEPOSIT = 'Pending Deposit',
  TASK_CREATION = 'Task Creation Fee',
  REFERRAL = 'Referral Bonus',
  JOINING_FEE = 'Joining Fee',
  JOB_SUBSCRIPTION = 'Job Subscription',
  SPIN_PURCHASE = 'Spin Purchase',
  GAME_WIN = 'Game Win',
  GAME_LOSS = 'Game Loss',
  BET_CANCELLED = 'Bet Cancelled',
}

export interface WithdrawalDetails {
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'NayaPay' | 'SadaPay' | 'UPaisa';
  accountName: string;
  accountNumber: string;
  bankName?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: any; // Can be string or Firestore timestamp
  withdrawalDetails?: WithdrawalDetails;
  status?: 'Completed' | 'Pending' | 'Failed' | 'Approved' | 'Rejected';
  withdrawalRequestId?: string; // Link to the top-level withdrawal request
}

export enum TaskType {
  VISIT_WEBSITE = 'Visit Website',
  YOUTUBE_SUBSCRIBE = 'YouTube Subscribe',
  FACEBOOK_LIKE = 'Facebook Like Page',
  INSTAGRAM_FOLLOW = 'Instagram Follow',
  TIKTOK_FOLLOW = 'TikTok Follow',
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
  joinedAt: any; // Firestore Timestamp
  paymentStatus: PaymentStatus;
  jobSubscription: JobSubscription | null;
  referralCount: number;
  balance: number;
  completedTaskIds: string[];
  savedWithdrawalDetails: WithdrawalDetails | null;
  walletPin: string | null;
  referredBy?: {
    uid: string;
    username: string;
  };
  referralBonusProcessed?: boolean;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    type: string; // e.g., 'Full-time', 'Part-time'
    salary: string;
    isPremium: boolean;
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