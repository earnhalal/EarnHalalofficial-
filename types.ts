// types.ts

export type View =
  | 'DASHBOARD'
  | 'EARN'
  | 'SPIN_WHEEL'
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
  | 'PRIVACY_POLICY'
  | 'TERMS_CONDITIONS';

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
}

export interface WithdrawalDetails {
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  accountName: string;
  accountNumber: string;
  bankName?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  withdrawalDetails?: WithdrawalDetails;
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
  username: string;
  email: string;
  phone: string;
  paymentStatus: PaymentStatus;
  jobSubscription: JobSubscription | null;
  password?: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    type: string; // e.g., 'Full-time', 'Part-time'
    salary: string;
    isPremium: boolean;
}