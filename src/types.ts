export type NavTab = 'home' | 'service' | 'menu' | 'record' | 'mine';

export type AccountCategory = 'training_help' | 'standard_real' | 'vip_elite';

export interface ComboStage {
  stageNumber: number; // 1, 2, 3, 4, 5, 6
  stageIndex?: number; // 0-indexed stage pointer
  triggerTaskIndex: number; // e.g. Task 5, 8, 10, 14, 15, 17, 21, 22, 24
  comboPrice: number; // Product value
  cashGap: number; // Required deposit / recharge gap ($89.004, $168.22, etc.)
  commissionEarned: number; // Commission reward
  description?: string;
  isManual?: boolean; // When true, manual admin addition is required for this stage
  manualAdded?: boolean; // True once admin has manually configured/released this combo offer
}

export interface CustomComboConfig {
  enabled: boolean;
  triggerTaskIndex: number; // e.g. task 12 (primary / fallback)
  comboPrice: number; // e.g. 750 USDT
  cashGap: number; // e.g. 150 USDT
  commissionEarned: number; // e.g. 95 USDT
  forceNext?: boolean; // trigger on the very next order grab
  accountType?: AccountCategory;
  multiStages?: ComboStage[]; // Multi-stage combo pipeline
  activeStageIndex?: number;
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  ip: string;
  ipAddress?: string;
  location: string;
  device: string;
  userAgent?: string;
  status: 'success' | 'failed';
  note?: string;
}

export interface UserRecord {
  id: string;
  username: string;
  password?: string;
  avatar: string;
  vipLevel: number;
  invitationCode: string;
  balance: number;
  frozenBalance: number;
  cashGap: number;
  todayCommission: number;
  todayTimes: number;
  maxDailyTimes: number;
  walletAddress?: string | null;
  withdrawalAddress?: string | null;
  walletName?: string | null;
  walletNetwork?: string | null;
  walletBound?: boolean;
  withdrawPassword?: string | null;
  joinDate: string;
  lastActive: string;
  lastLoginAt?: string;
  loginCount?: number;
  loginHistory?: LoginEvent[];
  status: 'active' | 'suspended';
  accountCategory?: AccountCategory;
  workCycle?: number;
  lastTaskDate?: string;
  yesterdayTimes?: number;
  yesterdayCommission?: number;
  referredBy?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  customCombo?: CustomComboConfig;
  pendingComboOrder?: OrderItem | null;
  passwordVersion?: number;
  passwordUpdatedAt?: string;
  lastEnteredDepositAmount?: number;
  lastEnteredDepositTime?: string;
  lastEnteredDepositAddress?: string;
}

export interface UserProfile {
  username: string;
  avatar: string;
  vipLevel: number;
  invitationCode: string;
  balance: number;
  frozenBalance: number;
  cashGap: number;
  todayCommission: number;
  todayTimes: number;
  maxDailyTimes: number;
  yesterdayBuyCommission: number;
  yesterdayTeamCommission: number;
  walletAddress: string | null;
  withdrawalAddress?: string | null;
  walletName?: string | null;
  walletNetwork?: string | null;
  walletBound: boolean;
  withdrawPassword?: string | null;
  accountCategory?: AccountCategory;
  workCycle?: number;
  lastTaskDate?: string;
  yesterdayTimes?: number;
  yesterdayCommission?: number;
  pendingComboOrder?: OrderItem | null;
  customCombo?: CustomComboConfig;
  sessionPassword?: string;
  sessionPasswordVersion?: number;
  lastEnteredDepositAmount?: number;
  lastEnteredDepositTime?: string;
  lastEnteredDepositAddress?: string;
}

export interface VipTier {
  id: number;
  name: string;
  platform: 'Amazon' | 'Alibaba' | 'AliExpress' | 'Aliexpress';
  logo: string;
  minBalance: number;
  maxBalance: number;
  commissionRate: number; // e.g. 0.04 for 4%
  dailyTasks: number;
  badgeColor: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  username?: string;
  platform: 'Amazon' | 'Alibaba' | 'AliExpress' | 'Aliexpress';
  title: string;
  image: string;
  amount: number;
  commissionRate: number;
  commissionEarned: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  isCombo?: boolean;
  comboProducts?: { title: string; image: string; price: number }[];
  cashGap?: number;
  taskIndex?: number;
}

export interface DepositRecord {
  id: string;
  username?: string;
  amount: number;
  currency: string;
  network: string;
  address: string;
  fromAddress?: string;
  walletName?: string;
  txHash: string;
  status: 'pending' | 'completed' | 'approved' | 'failed' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

export interface WithdrawalRecord {
  id: string;
  username?: string;
  amount: number;
  actualAmount: number;
  fee: number;
  walletAddress: string;
  walletName?: string;
  network: string;
  status: 'pending' | 'completed' | 'approved' | 'processing' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

export interface TeamMember {
  id: string;
  username: string;
  phone?: string;
  level: 1 | 2 | 3;
  rechargeAmount: number;
  withdrawalAmount?: number;
  commissionContribution: number;
  joinDate: string;
  status?: 'active' | 'registered';
  referredBy?: string;
}
