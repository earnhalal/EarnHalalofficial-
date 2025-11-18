// types.ts

// FIX: The unnecessary top-level React import has been removed. It was causing a module resolution conflict
// that prevented the application from loading. All component files that use JSX already import React
// directly, which is the correct pattern.

// FIX: Removed reference to 'vite/client' as it was not found, causing a compilation error.
// /// <reference types="vite/client" />

// FIX: Globally declare and augment types for JSX custom elements and import.meta.env
// This fixes widespread "Property '...' does not exist on type 'JSX.IntrinsicElements'" errors
// and also the 'import.meta.env' error which arose from removing 'vite/client' types.
declare global {
  // For particles.js used in AuthView.tsx and LandingView.tsx
  interface Window {
    particlesJS: any;
  }

  // FIX: Removed the faulty JSX.IntrinsicElements augmentation.
  // The previous implementation was overwriting React's default types instead of merging with them,
  // which caused all standard HTML and SVG elements to be unrecognized by TypeScript.
  // Since the custom 'lottie-player' element is not used in the project, this entire block has been removed,
  // allowing the project to fall back to the default JSX types from @types/react.
}

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

export type ReferralStatus = 'pending_referrer_tasks' | 'pending_referred_tasks' | 'eligible' | 'credited';

export interface Referral {
    id: string;
    referrerId: string;
    referredUserId: string;
    referredUsername: string;
    referredUserTasksCompleted: number;
    status: ReferralStatus;
    bonusAmount: number;
    createdAt: any; // Firestore timestamp
}