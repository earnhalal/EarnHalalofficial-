// types.ts

// FIX: To resolve project-wide "Property '...' does not exist on type 'JSX.IntrinsicElements'" errors,
// the global JSX namespace is being correctly augmented. This is done by:
// 1. Importing the full 'react' module to bring its types into scope.
// 2. Extending `React.JSX.IntrinsicElements` to ensure all standard HTML/SVG element types are preserved.
// FIX: Changed import to be consistent with other files in the project.
// FIX: Changed to `import * as React` to ensure the full React namespace is available for global JSX augmentation,
// which is a more robust way to handle this depending on tsconfig settings.
import * as React from 'react';

// FIX: Removed reference to 'vite/client' as it was not found, causing a compilation error.
// /// <reference types="vite/client" />

// FIX: Globally declare and augment types for JSX custom elements and import.meta.env
// This fixes widespread "Property '...' does not exist on type 'JSX.IntrinsicElements'" errors
// and also the 'import.meta.env' error which arose from removing 'vite/client' types.
declare global {
  // For import.meta.env used in AIAgentChatbot.tsx
  interface ImportMeta {
    readonly env: {
      readonly [key: string]: string;
      readonly VITE_API_KEY: string;
    };
  }

  // FIX: Corrected the augmentation of JSX.IntrinsicElements.
  // By removing `extends React.JSX.IntrinsicElements`, we allow TypeScript's
  // declaration merging to add 'lottie-player' to the existing intrinsic elements
  // from React's types, rather than overwriting them. This resolves all JSX-related type errors.
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any;
    }
  }
}

// The global JSX declaration for 'lottie-player' was moved to AuthView.tsx to avoid overwriting React's default intrinsic elements.
// (Note: it has been moved back here in a safer, augmenting way to fix global type issues)

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
  isFingerprintEnabled?: boolean;
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