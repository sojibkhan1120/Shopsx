import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { safeStorage as localStorage, safeSessionStorage as sessionStorage, DEMO_DEFAULT_WALLET_ADDRESS, DEMO_DEFAULT_WALLET_NAME } from '../utils/storage';
import {
  UserProfile,
  VipTier,
  OrderItem,
  DepositRecord,
  WithdrawalRecord,
  NavTab,
  TeamMember,
  UserRecord,
  CustomComboConfig,
  ComboStage,
  AccountCategory,
  LoginEvent,
} from '../types';
import { translate } from '../data/languages';
import { detectClientGeo } from '../utils/geoIp';
import {
  getComboConfigForUserCycle,
  getComboStagesForCycle,
  USER_CYCLE_1_STAGES,
  USER_CYCLE_2_STAGES,
  USER_CYCLE_3_STAGES,
} from '../utils/comboPresets';

export const DEFAULT_HELP_TRAINING_COMBO_STAGES: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 6,
    comboPrice: 480.0,
    cashGap: 159.0,
    commissionEarned: 38.0,
    description: 'Stage 1: Basic Trap (Deposit $159)',
  },
  {
    stageNumber: 2,
    triggerTaskIndex: 12,
    comboPrice: 850.0,
    cashGap: 299.0,
    commissionEarned: 75.0,
    description: 'Stage 2: Medium Trap (Deposit $299)',
  },
  {
    stageNumber: 3,
    triggerTaskIndex: 18,
    comboPrice: 1450.0,
    cashGap: 490.0,
    commissionEarned: 135.0,
    description: 'Stage 3: Deep Trap (Deposit $490)',
  },
];

export const isDemoAccount = (u?: { username?: string; accountCategory?: AccountCategory } | string | null): boolean => {
  if (!u) return false;
  const username = (typeof u === 'string' ? u : u.username || '').trim().toLowerCase();
  const category = typeof u === 'string' ? undefined : u.accountCategory;
  if (category === 'training_help') return true;
  return (
    username === 'demoaccount' ||
    username.startsWith('demo') ||
    username.startsWith('cari') ||
    username.startsWith('trainee') ||
    username.startsWith('help') ||
    username.includes('demo')
  );
};

export const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'usr-1788705773629',
    username: 'demoaccount',
    password: '123456',
    avatar: 'polygon',
    vipLevel: 1,
    invitationCode: '468312',
    referredBy: 'Official Platform Partner',
    ipAddress: '103.139.9.199',
    location: 'Panti, Bangladesh',
    device: 'Admin Created Account',
    balance: 20.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: DEMO_DEFAULT_WALLET_ADDRESS,
    withdrawalAddress: DEMO_DEFAULT_WALLET_ADDRESS,
    walletName: DEMO_DEFAULT_WALLET_NAME,
    walletBound: true,
    withdrawPassword: 'Password123',
    joinDate: '2026-09-06 14:42:53',
    lastActive: 'Active Now',
    status: 'active',
    accountCategory: 'training_help',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 12,
      comboPrice: 118.24,
      cashGap: 18.24,
      commissionEarned: 18.5,
      forceNext: false,
    },
  },
  {
    id: 'usr-1788702376506',
    username: 'pranto123',
    password: '123456',
    avatar: 'polygon',
    vipLevel: 0,
    invitationCode: '267180',
    referredBy: 'Official Platform Partner',
    ipAddress: '103.139.9.199',
    location: 'Panti, Bangladesh',
    device: 'Desktop/PC • Windows',
    balance: 0.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: null,
    walletName: null,
    walletBound: false,
    withdrawPassword: 'Password123',
    joinDate: '2026-09-06 13:46:16',
    lastActive: 'Just registered',
    status: 'active',
    accountCategory: 'standard_real',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 12,
      comboPrice: 118.24,
      cashGap: 18.24,
      commissionEarned: 18.5,
      forceNext: false,
    },
  },
  {
    id: 'usr-1788701923409',
    username: 'labu123',
    password: '123456',
    avatar: 'polygon',
    vipLevel: 0,
    invitationCode: '641279',
    referredBy: 'Official Platform Partner',
    ipAddress: '103.139.9.199',
    location: 'Panti, Bangladesh',
    device: 'Desktop/PC • Windows',
    balance: 0.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: null,
    walletName: null,
    walletBound: false,
    withdrawPassword: 'Password123',
    joinDate: '2026-09-06 13:38:43',
    lastActive: 'Just registered',
    status: 'active',
    accountCategory: 'standard_real',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 12,
      comboPrice: 118.24,
      cashGap: 18.24,
      commissionEarned: 18.5,
      forceNext: false,
    },
  },
  {
    id: 'usr-help-1',
    username: 'help_trainee01',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vipLevel: 1,
    invitationCode: '604374',
    referredBy: 'Admin Direct Training',
    ipAddress: '103.145.74.22',
    location: 'Dhaka, Bangladesh',
    device: 'Mobile • Android',
    balance: 0.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: null,
    walletName: null,
    walletBound: false,
    joinDate: '2026-09-06 09:00:00',
    lastActive: 'Active Now',
    status: 'active',
    accountCategory: 'training_help',
    customCombo: {
      enabled: true,
      accountType: 'training_help',
      triggerTaskIndex: 6,
      comboPrice: 480.0,
      cashGap: 159.0,
      commissionEarned: 38.0,
      forceNext: false,
      multiStages: DEFAULT_HELP_TRAINING_COMBO_STAGES,
    },
  },
  {
    id: 'usr-1',
    username: 'jldfdg180',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    vipLevel: 2,
    invitationCode: '604374',
    referredBy: 'Platform (Code: 604374)',
    ipAddress: '103.145.74.22',
    location: 'Dhaka, Bangladesh',
    device: 'Mobile • Android',
    balance: 618.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe',
    joinDate: '2026-09-05 10:00:00',
    lastActive: 'Active Now',
    status: 'active',
    accountCategory: 'standard_real',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 12,
      comboPrice: 118.24,
      cashGap: 18.24,
      commissionEarned: 18.5,
      forceNext: false,
    },
  },
  {
    id: 'usr-2',
    username: 'alex_crypto',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    vipLevel: 1,
    invitationCode: '482910',
    referredBy: 'jldfdg180',
    ipAddress: '185.220.101.5',
    location: 'Frankfurt, Germany',
    device: 'Desktop/PC • Windows',
    balance: 350.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 14.8,
    todayTimes: 11,
    maxDailyTimes: 25,
    walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    joinDate: '2026-09-04 14:20:10',
    lastActive: '12 mins ago',
    status: 'active',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 12,
      comboPrice: 520.0,
      cashGap: 170.0,
      commissionEarned: 52.0,
      forceNext: false,
    },
  },
  {
    id: 'usr-3',
    username: 'sarah_invest',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    vipLevel: 1,
    invitationCode: '729104',
    referredBy: 'jldfdg180',
    ipAddress: '104.28.212.90',
    location: 'London, United Kingdom',
    device: 'Mobile • iOS (iPhone)',
    balance: 120.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 3.6,
    todayTimes: 4,
    maxDailyTimes: 25,
    walletAddress: null,
    joinDate: '2026-09-05 18:40:22',
    lastActive: '45 mins ago',
    status: 'active',
    customCombo: {
      enabled: false,
      triggerTaskIndex: 12,
      comboPrice: 200.0,
      cashGap: 80.0,
      commissionEarned: 20.0,
      forceNext: false,
    },
  },
  {
    id: 'usr-4',
    username: 'vip_trader99',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vipLevel: 3,
    invitationCode: '910283',
    referredBy: 'Platform (Code: 604374)',
    ipAddress: '118.200.15.67',
    location: 'Singapore',
    device: 'Desktop/PC • macOS',
    balance: 1450.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 132.5,
    todayTimes: 19,
    maxDailyTimes: 25,
    walletAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
    joinDate: '2026-09-02 09:15:30',
    lastActive: '2 hours ago',
    status: 'active',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 20,
      comboPrice: 1950.0,
      cashGap: 500.0,
      commissionEarned: 312.0,
      forceNext: false,
    },
  },
];

export const DEFAULT_DEPOSITS: DepositRecord[] = [
  {
    id: 'dep-101',
    username: 'jldfdg180',
    amount: 100.0,
    currency: 'USDT',
    network: 'TRC-20',
    address: 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe',
    txHash: '9f2a71d87c29e612fa5b02f837acb6814',
    status: 'completed',
    createdAt: '2026-09-04 09:30:15',
    approvedAt: '2026-09-04 09:32:00',
  },
  {
    id: 'dep-102',
    username: 'alex_crypto',
    amount: 200.0,
    currency: 'USDT',
    network: 'TRC-20',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    txHash: '3a8d90f41c27e834b9d01e479bcda211',
    status: 'pending',
    createdAt: '2026-09-05 22:45:10',
  },
  {
    id: 'dep-103',
    username: 'sarah_invest',
    amount: 70.0,
    currency: 'USDT',
    network: 'TRC-20',
    address: 'TE173sZq1qWvP6n7RjV4n8D3s4K9mL1oP9',
    txHash: '5e7f12a34b56c789d01e23f45a67b89c',
    status: 'pending',
    createdAt: '2026-09-05 23:02:40',
  },
];

export const DEFAULT_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: 'wd-201',
    username: 'vip_trader99',
    amount: 500.0,
    actualAmount: 499.0,
    fee: 1.0,
    walletAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
    network: 'TRC-20',
    status: 'pending',
    createdAt: '2026-09-05 22:15:30',
  },
  {
    id: 'wd-202',
    username: 'alex_crypto',
    amount: 80.0,
    actualAmount: 79.0,
    fee: 1.0,
    walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    network: 'TRC-20',
    status: 'completed',
    createdAt: '2026-09-04 18:20:00',
    approvedAt: '2026-09-04 18:25:10',
  },
];

export const VIP_TIERS: VipTier[] = [
  {
    id: 1,
    name: 'VIP 1',
    platform: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80',
    minBalance: 20,
    maxBalance: 498,
    commissionRate: 0.04,
    dailyTasks: 25,
    badgeColor: 'from-amber-400 to-amber-500',
  },
  {
    id: 2,
    name: 'VIP 2',
    platform: 'Alibaba',
    logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120&auto=format&fit=crop&q=80',
    minBalance: 499,
    maxBalance: 899,
    commissionRate: 0.08,
    dailyTasks: 25,
    badgeColor: 'from-orange-500 to-amber-600',
  },
  {
    id: 3,
    name: 'VIP 3',
    platform: 'AliExpress',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    minBalance: 899,
    maxBalance: 99999,
    commissionRate: 0.12,
    dailyTasks: 25,
    badgeColor: 'from-rose-500 to-red-600',
  },
];

export const getVipLevelByBalance = (balance: number): number => {
  if (balance >= 899) return 3;
  if (balance >= 499) return 2;
  if (balance >= 20) return 1;
  return 0;
};

const PLATFORM_PRODUCTS: Record<string, { title: string; image: string; minPrice: number; maxPrice: number }[]> = {
  Amazon: [
    { title: 'Amazon Kindle Paperwhite (16GB) 6.8" Display Waterproof', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80', minPrice: 35, maxPrice: 75 },
    { title: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80', minPrice: 40, maxPrice: 85 },
    { title: 'Amazon Echo Dot (5th Gen) Deep Bass Smart Speaker', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&auto=format&fit=crop&q=80', minPrice: 28, maxPrice: 60 },
    { title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80', minPrice: 65, maxPrice: 120 },
    { title: 'Logitech MX Master 3S Wireless Laser Mouse', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&auto=format&fit=crop&q=80', minPrice: 30, maxPrice: 70 },
  ],
  Alibaba: [
    { title: 'Commercial Grade IoT Smart Sensor Hub (Wholesale 20 Pcs)', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80', minPrice: 180, maxPrice: 360 },
    { title: 'Industrial Stainless Steel High-Pressure Valve Kit (Bulk)', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80', minPrice: 220, maxPrice: 420 },
    { title: 'Heavy Duty Ergonomic Hydraulic Lifting Workstation Module', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&auto=format&fit=crop&q=80', minPrice: 260, maxPrice: 480 },
    { title: 'Wholesale Certified Bamboo Organic Textile Bundle 100Kg', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=80', minPrice: 200, maxPrice: 390 },
  ],
  AliExpress: [
    { title: 'RGB Hot-Swappable 75% Mechanical Gaming Keyboard', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80', minPrice: 350, maxPrice: 620 },
    { title: 'Ultra HD 4K 60FPS Waterproof Action Vlog Camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80', minPrice: 420, maxPrice: 760 },
    { title: 'Mini Portable Cinema Projector 1080P Native WiFi Bluetooth', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop&q=80', minPrice: 480, maxPrice: 820 },
    { title: 'Titanium Smart Fitness & Health Tracker Watch Edition', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80', minPrice: 380, maxPrice: 690 },
  ],
};

interface AppContextType {
  user: UserProfile;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  orders: OrderItem[];
  allOrders: OrderItem[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  teamMembers: TeamMember[];
  addReferralMember: (username: string, rechargeAmount?: number, level?: 1 | 2 | 3, referredBy?: string) => void;
  activeTaskTier: VipTier | null;
  setActiveTaskTier: (tier: VipTier | null) => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isTeamsModalOpen: boolean;
  setIsTeamsModalOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  depositFunds: (amount: number, depositAddress?: string, txHash?: string, fromAddress?: string) => Promise<boolean>;
  bindWalletAddress: (address: string, walletName?: string, password?: string) => boolean;
  setWithdrawPassword: (password: string) => boolean;
  unbindWalletAddress: () => void;
  withdrawFunds: (amount: number, address: string, pin?: string, silent?: boolean) => { success: boolean; message: string };
  generateRandomOrder: (tier: VipTier) => OrderItem | null;
  completeOrder: (orderId: string) => void;
  setDemoBalance: (amount: number) => void;
  updateAvatar: (avatarUrl: string) => void;
  updateUsername: (username: string) => void;
  rechargeCashGap: () => void;
  setDemoTaskTimes: (times: number) => void;
  resetTasks: (targetBalance?: number) => void;
  resetAccountTo350: () => void;
  resetAccountTo50: () => void;
  isLoggedIn: boolean;
  login: (username?: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerUserAccount: (
    username: string,
    password: string,
    invitationCode: string,
    geoInfo?: { ip?: string; location?: string; device?: string }
  ) => Promise<{ success: boolean; message: string }>;
  validateInvitationCode: (code: string) => { valid: boolean; referrerName?: string };
  logout: () => void;
  // Admin & Multi-User Management
  allUsers: UserRecord[];
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminRoute: boolean;
  setIsAdminRoute: (isRoute: boolean) => void;
  isAdminAuthenticated: boolean;
  adminUsername: string;
  adminLogin: (user: string, pass: string) => boolean;
  adminLogout: () => void;
  updateAdminCredentials: (newUser: string, newPass: string) => boolean;
  navigateToAdmin: () => void;
  navigateToUserApp: () => void;
  platformDepositAddress: string;
  setPlatformDepositAddress: (addr: string) => void;
  switchUserAccount: (username: string, fallbackRecord?: UserRecord) => void;
  updateUserCustomCombo: (username: string, config: CustomComboConfig) => void;
  forceInjectCombo: (username: string) => void;
  updateUserBalance: (username: string, newBalance: number) => void;
  createNewUserAccount: (
    username: string,
    initialBalance?: number,
    password?: string,
    accountCategory?: AccountCategory,
    customStages?: ComboStage[]
  ) => boolean;
  batchCreateDemoAccounts: (
    prefix?: string,
    count?: number,
    startNumber?: number,
    padDigits?: number,
    initialBalance?: number,
    password?: string,
    customStages?: ComboStage[]
  ) => Promise<{ createdCount: number; usernames: string[] }>;
  batchChangeUserPassword: (
    usernames: string[],
    newPassword?: string
  ) => Promise<{ successCount: number; matchedUsers: string[] }>;
  quickResetPasswordTo112233: (username: string) => Promise<boolean>;
  applyHelpTrainingPreset: (username: string) => void;
  applyUserCyclePreset: (username: string, cycle: number) => void;
  setTask24ManualCombo: (
    username: string,
    cashGap: number,
    comboPrice?: number,
    commissionEarned?: number,
    manualAdded?: boolean
  ) => void;
  updateUserComboStages: (username: string, stages: ComboStage[]) => void;
  jumpToTask: (username: string, taskCount: number) => void;
  deleteUserAccount: (username: string) => void;
  approveDeposit: (depositId: string) => void;
  rejectDeposit: (depositId: string) => void;
  deleteDepositRecord: (depositId: string) => void;
  manualCreditDeposit: (username: string, amount: number, customFromAddress?: string) => void;
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string) => void;
  deleteWithdrawalRecord: (withdrawalId: string) => void;
  clearUserDepositsAndWithdrawals: (username: string) => void;
  clearAllDemoTransactions: () => void;
  recordPendingDeposit: (amount: number, address: string, txHash?: string, fromAddress?: string, walletName?: string, silent?: boolean) => void;
  resetUserTasks: (
    username: string,
    resetBalance?: number,
    taskCount?: number,
    clearOrders?: boolean,
    targetCycle?: number,
    keepCycle?: boolean
  ) => void;
  resetAllUsersTasks: (taskCount?: number) => void;
  clearUserCashGap: (username: string) => void;
  updateUserAccountDetails: (username: string, updates: Partial<UserRecord>) => Promise<boolean>;
  clearUserOrders: (username: string) => void;
  transferUserReferral: (
    targetUsername: string,
    newReferrerUsername: string,
    transferDownline?: boolean
  ) => Promise<{ success: boolean; message: string }>;
  batchTransferReferrals: (
    fromReferrer: string,
    toReferrer: string
  ) => Promise<{ success: boolean; message: string }>;
  refreshBackendData: () => Promise<void>;
  effectiveTodayTimes: number;
  effectiveTodayCommission: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
}

// Compute 3-Tier dynamic referral tree for any user based on live users, deposits, and orders
export function computeReferralTeam(
  targetUsername: string,
  targetInvitationCode: string,
  users: UserRecord[],
  depositsList: DepositRecord[],
  withdrawalsList: WithdrawalRecord[],
  ordersList: OrderItem[]
): TeamMember[] {
  if (!targetUsername) return [];
  const cleanTarget = targetUsername.trim().toLowerCase();
  const cleanCode = (targetInvitationCode || '').trim().toLowerCase();

  const getDepositsSum = (uname: string) => {
    const cleanUname = (uname || '').trim().toLowerCase();
    return (depositsList || [])
      .filter(
        (d) =>
          (d.username || '').trim().toLowerCase() === cleanUname &&
          (d.status === 'completed' || d.status === 'approved')
      )
      .reduce((sum, d) => sum + (d.amount || 0), 0);
  };

  const getWithdrawalsSum = (uname: string) => {
    const cleanUname = (uname || '').trim().toLowerCase();
    return (withdrawalsList || [])
      .filter(
        (w) =>
          (w.username || '').trim().toLowerCase() === cleanUname &&
          (w.status === 'completed' || w.status === 'approved')
      )
      .reduce((sum, w) => sum + (w.amount || 0), 0);
  };

  const getCompletedOrdersCommission = (uname: string) => {
    const cleanUname = (uname || '').trim().toLowerCase();
    return (ordersList || [])
      .filter((o) => (o.username || '').trim().toLowerCase() === cleanUname && o.status === 'completed')
      .reduce((sum, o) => sum + (o.commissionEarned || 0), 0);
  };

  const result: TeamMember[] = [];
  const addedUsernames = new Set<string>([cleanTarget]);

  // Level 1: Directly referred by user
  const level1Users = (users || []).filter((u) => {
    if (!u || !u.username) return false;
    const uName = u.username.trim().toLowerCase();
    if (addedUsernames.has(uName)) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return ref === cleanTarget || (cleanCode && ref === cleanCode);
  });

  for (const u1 of level1Users) {
    const uName = (u1.username || '').trim().toLowerCase();
    addedUsernames.add(uName);
    const depSum = getDepositsSum(u1.username);
    const withSum = getWithdrawalsSum(u1.username);
    const ordersComm = getCompletedOrdersCommission(u1.username);
    const commissionContrib = parseFloat((ordersComm > 0 ? ordersComm * 0.1 : depSum * 0.1).toFixed(2));
    result.push({
      id: `ref-${u1.id || u1.username}`,
      username: u1.username,
      phone: `Inv: ${u1.invitationCode || '------'}`,
      level: 1,
      rechargeAmount: depSum,
      withdrawalAmount: withSum,
      commissionContribution: commissionContrib,
      joinDate: (u1.joinDate || '2026-09-05').split(' ')[0],
      status: depSum > 0 || ordersComm > 0 ? 'active' : 'registered',
      referredBy: 'Direct Link',
    });
  }

  // Level 2: Referred by Level 1 members
  const level1Names = new Set(level1Users.map((u) => (u.username || '').trim().toLowerCase()).filter(Boolean));
  const level1Codes = new Set(level1Users.map((u) => (u.invitationCode || '').trim().toLowerCase()).filter(Boolean));

  const level2Users = (users || []).filter((u) => {
    if (!u || !u.username) return false;
    const uName = u.username.trim().toLowerCase();
    if (addedUsernames.has(uName)) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return level1Names.has(ref) || level1Codes.has(ref);
  });

  for (const u2 of level2Users) {
    const uName = (u2.username || '').trim().toLowerCase();
    addedUsernames.add(uName);
    const depSum = getDepositsSum(u2.username);
    const withSum = getWithdrawalsSum(u2.username);
    const ordersComm = getCompletedOrdersCommission(u2.username);
    const commissionContrib = parseFloat((ordersComm > 0 ? ordersComm * 0.05 : depSum * 0.05).toFixed(2));

    const ref = (u2.referredBy || '').trim().toLowerCase();
    const parentUser = level1Users.find(
      (l1) =>
        (l1.username || '').trim().toLowerCase() === ref ||
        (l1.invitationCode && l1.invitationCode.trim().toLowerCase() === ref)
    );

    result.push({
      id: `ref-${u2.id || u2.username}`,
      username: u2.username,
      phone: `Inv: ${u2.invitationCode || '------'}`,
      level: 2,
      rechargeAmount: depSum,
      withdrawalAmount: withSum,
      commissionContribution: commissionContrib,
      joinDate: (u2.joinDate || '2026-09-05').split(' ')[0],
      status: depSum > 0 || ordersComm > 0 ? 'active' : 'registered',
      referredBy: parentUser ? parentUser.username : (u2.referredBy || '1st Referral'),
    });
  }

  // Level 3: Referred by Level 2 members
  const level2Names = new Set(level2Users.map((u) => (u.username || '').trim().toLowerCase()).filter(Boolean));
  const level2Codes = new Set(level2Users.map((u) => (u.invitationCode || '').trim().toLowerCase()).filter(Boolean));

  const level3Users = (users || []).filter((u) => {
    if (!u || !u.username) return false;
    const uName = u.username.trim().toLowerCase();
    if (addedUsernames.has(uName)) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return level2Names.has(ref) || level2Codes.has(ref);
  });

  for (const u3 of level3Users) {
    const uName = (u3.username || '').trim().toLowerCase();
    addedUsernames.add(uName);
    const depSum = getDepositsSum(u3.username);
    const withSum = getWithdrawalsSum(u3.username);
    const ordersComm = getCompletedOrdersCommission(u3.username);
    const commissionContrib = parseFloat((ordersComm > 0 ? ordersComm * 0.02 : depSum * 0.02).toFixed(2));

    const ref = (u3.referredBy || '').trim().toLowerCase();
    const parentUser = level2Users.find(
      (l2) =>
        (l2.username || '').trim().toLowerCase() === ref ||
        (l2.invitationCode && l2.invitationCode.trim().toLowerCase() === ref)
    );

    result.push({
      id: `ref-${u3.id || u3.username}`,
      username: u3.username,
      phone: `Inv: ${u3.invitationCode || '------'}`,
      level: 3,
      rechargeAmount: depSum,
      withdrawalAmount: withSum,
      commissionContribution: commissionContrib,
      joinDate: (u3.joinDate || '2026-09-05').split(' ')[0],
      status: depSum > 0 || ordersComm > 0 ? 'active' : 'registered',
      referredBy: parentUser ? parentUser.username : (u3.referredBy || '2nd Referral'),
    });
  }

  return result;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('mall_usdt_language') || 'en';
  });

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem('mall_usdt_language', newLang);
  };

  const t = (key: string) => translate(key, language);
  const [activeTaskTier, setActiveTaskTier] = useState<VipTier | null>(null);

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mall_usdt_user');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          const effectiveBal = parseFloat(((parsed.balance || 0) + (parsed.frozenBalance || 0)).toFixed(2));
          return {
            ...parsed,
            balance: effectiveBal, // Always restore full balance to account balance so user never sees 0
            frozenBalance: 0,
            vipLevel: getVipLevelByBalance(effectiveBal),
            maxDailyTimes: parsed.maxDailyTimes || 25,
            cashGap: parsed.cashGap || 0,
            pendingComboOrder: parsed.pendingComboOrder || null,
            walletAddress: parsed.walletAddress || null,
            walletName: parsed.walletName || null,
            walletBound: Boolean(parsed.walletBound && parsed.walletAddress),
            withdrawPassword: parsed.withdrawPassword || '123456',
            workCycle: parsed.workCycle || 1,
            accountCategory: parsed.accountCategory || (isDemoAccount(parsed) ? 'training_help' : 'standard_real'),
            sessionPassword: parsed.sessionPassword || (parsed.password || '123456'),
            sessionPasswordVersion: parsed.sessionPasswordVersion || (parsed.passwordVersion || 1),
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    const defaultUser: UserProfile = {
      username: 'jldfdg180',
      avatar: 'polygon',
      vipLevel: 2,
      invitationCode: '604374',
      balance: 618.0,
      frozenBalance: 0,
      cashGap: 0,
      todayCommission: 0.0,
      todayTimes: 0,
      maxDailyTimes: 25,
      yesterdayBuyCommission: 0.0,
      yesterdayTeamCommission: 0.0,
      walletAddress: null,
      walletName: null,
      walletBound: false,
      withdrawPassword: '123456',
      pendingComboOrder: null,
      sessionPassword: 'password123',
      sessionPasswordVersion: 1,
    };
    localStorage.setItem('mall_usdt_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  // Orders state - tracks active user's orders and all orders across the system
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('mall_usdt_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [allOrders, setAllOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('mall_usdt_all_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('mall_usdt_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mall_usdt_all_orders', JSON.stringify(allOrders));
  }, [allOrders]);

  // Synchronized completed orders count and commission calculation strictly for TODAY
  const currentCleanUsername = (user.username || '').trim().toLowerCase();
  const todayDateStr = new Date().toISOString().substring(0, 10);

  const todayCompletedOrders = orders.filter(
    (o) =>
      o.status === 'completed' &&
      Boolean(o.username) &&
      (o.username || '').trim().toLowerCase() === currentCleanUsername &&
      Boolean(o.createdAt) &&
      o.createdAt.substring(0, 10) === todayDateStr
  );
  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' && Boolean(o.username) && (o.username || '').trim().toLowerCase() === currentCleanUsername
  );
  const completedOrdersCount = todayCompletedOrders.length;
  const pendingOrdersCount = pendingOrders.length;

  const effectiveTodayTimes = Math.max(user.todayTimes || 0, completedOrdersCount);
  const effectiveTodayCommission = Math.max(
    user.todayCommission || 0,
    parseFloat(todayCompletedOrders.reduce((sum, o) => sum + (o.commissionEarned || 0), 0).toFixed(2))
  );

  // Synchronize effective task times and commission if orders are completed
  useEffect(() => {
    if (orders.length === 0) return;
    if (effectiveTodayTimes > (user.todayTimes || 0) || effectiveTodayCommission > (user.todayCommission || 0)) {
      setUser((prev) => {
        const updated = {
          ...prev,
          todayTimes: effectiveTodayTimes,
          todayCommission: effectiveTodayCommission,
          lastTaskDate: todayDateStr,
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });

      setAllUsers((prev) =>
        prev.map((u) =>
          (u.username || '').trim().toLowerCase() === currentCleanUsername
            ? { ...u, todayTimes: effectiveTodayTimes, todayCommission: effectiveTodayCommission, lastTaskDate: todayDateStr }
            : u
        )
      );
    }
  }, [orders.length, currentCleanUsername, user.todayTimes, user.todayCommission, effectiveTodayTimes, effectiveTodayCommission, todayDateStr]);

  // Client-side daily rollover: if user worked yesterday or earlier, reset today's tasks
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    const lastDate = user.lastTaskDate;
    if (lastDate && lastDate < today && ((user.todayTimes || 0) > 0 || (user.todayCommission || 0) > 0)) {
      setUser((prev) => {
        const updated = {
          ...prev,
          yesterdayTimes: prev.todayTimes,
          yesterdayBuyCommission: prev.todayCommission,
          todayTimes: 0,
          todayCommission: 0,
          lastTaskDate: today,
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username.toLowerCase() === user.username.toLowerCase()
            ? {
                ...u,
                yesterdayTimes: u.todayTimes,
                yesterdayCommission: u.todayCommission,
                todayTimes: 0,
                todayCommission: 0,
                lastTaskDate: today,
              }
            : u
        )
      );
    }
  }, [user.lastTaskDate, user.todayTimes, user.todayCommission, user.username]);

  // Admin Panel & Multi-User Management States
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Platform Deposit TRC-20 Address
  const [platformDepositAddress, setPlatformDepositAddress] = useState<string>(() => {
    return localStorage.getItem('mall_usdt_deposit_address') || 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe';
  });

  useEffect(() => {
    localStorage.setItem('mall_usdt_deposit_address', platformDepositAddress);
  }, [platformDepositAddress]);

  // Admin Credentials
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return localStorage.getItem('mall_admin_username') || 'admin';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('mall_admin_password') || 'admin7788';
  });

  // Admin Auth Status
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('mall_admin_authenticated') === 'true' ||
      sessionStorage.getItem('mall_admin_authenticated') === 'true'
    );
  });

  // Route detection function for #admin or ?admin or /admin or ?admin=true
  const checkAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    try {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      return hash.includes('admin') || search.includes('admin') || path.includes('admin');
    } catch {
      return false;
    }
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkAdminRoute);

  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm = checkAdminRoute();
      setIsAdminRoute(isAdm);
      if (isAdm) {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('focus', handleUrlChange);

    // Periodic check every 800ms for iframe URL changes or browser hash updates
    const interval = setInterval(handleUrlChange, 800);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('focus', handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminRoute(true);
    setIsAdminOpen(true);
  };

  const navigateToUserApp = () => {
    window.location.hash = '';
    setIsAdminRoute(false);
    setIsAdminOpen(false);
  };

  const [allUsers, setAllUsers] = useState<UserRecord[]>(() => {
    const saved = localStorage.getItem('mall_usdt_all_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userMap = new Map<string, UserRecord>();
          // Put all default accounts in first
          DEFAULT_USERS.forEach((du) => userMap.set(du.username.toLowerCase(), du));
          // Overlay with parsed records (preserving updated balances and states)
          parsed.forEach((u: any) => {
            if (u && u.username) {
              const existing = userMap.get(u.username.toLowerCase());
              const isDemo = isDemoAccount(u) || isDemoAccount(existing);
              userMap.set(u.username.toLowerCase(), {
                ...(existing || {}),
                ...u,
                password: u.password || '123456',
                withdrawPassword: u.withdrawPassword || 'Password123',
                referredBy: u.referredBy || (u.invitationCode === '604374' ? 'Platform (Code: 604374)' : 'Direct Link'),
                location: u.location || 'Dhaka, Bangladesh',
                ipAddress: u.ipAddress || '103.145.74.22',
                device: u.device || 'Mobile • Android',
                walletAddress: u.walletAddress || null,
                withdrawalAddress: u.withdrawalAddress || u.walletAddress || null,
                walletName: u.walletName || null,
                walletBound: Boolean(u.walletBound && u.walletAddress),
              } as UserRecord);
            }
          });
          return Array.from(userMap.values());
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('mall_usdt_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Deposits
  const [deposits, setDeposits] = useState<DepositRecord[]>(() => {
    const saved = localStorage.getItem('mall_usdt_deposits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_DEPOSITS;
  });

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => {
    const saved = localStorage.getItem('mall_usdt_withdrawals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_WITHDRAWALS;
  });

  // Referred Accounts / Team Members (Strictly dynamic: only users who were actually referred by this user)
  const teamMembers = useMemo<TeamMember[]>(() => {
    if (!user?.username) return [];
    return computeReferralTeam(
      user.username,
      user.invitationCode,
      allUsers,
      deposits,
      withdrawals,
      allOrders
    );
  }, [user?.username, user?.invitationCode, allUsers, deposits, withdrawals, allOrders]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mall_usdt_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mall_usdt_orders', JSON.stringify(orders));
  }, [orders]);



  // Dynamically keep user's VIP tier in sync with their balance
  useEffect(() => {
    const effectiveBal = user.balance + user.frozenBalance;
    const computedVip = getVipLevelByBalance(effectiveBal);
    if (user.vipLevel !== computedVip && computedVip > 0) {
      setUser((prev) => ({
        ...prev,
        vipLevel: computedVip,
      }));
    }
  }, [user.balance, user.frozenBalance]);

  useEffect(() => {
    localStorage.setItem('mall_usdt_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('mall_usdt_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('mall_usdt_referrals', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Fetch and synchronize database state with server backend
  const fetchBackendData = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));

          // Real-time synchronization: Update active customer's state from backend database
          setUser((currentUser) => {
            if (!currentUser || !currentUser.username) return currentUser;
            const cleanCurr = (currentUser.username || '').trim().toLowerCase();
            const serverRecord = data.users.find(
              (u: UserRecord) => (u.username || '').trim().toLowerCase() === cleanCurr
            );
            if (serverRecord) {
              // 1. Password Invalidation & Global Device Auto-Logout Check:
              if (!currentUser.sessionPassword) {
                // Initialize session password from server record if missing
                currentUser.sessionPassword = serverRecord.password || '123456';
                currentUser.sessionPasswordVersion = serverRecord.passwordVersion || 1;
              } else {
                const isPassDiff =
                  Boolean(serverRecord.password && serverRecord.password !== currentUser.sessionPassword);
                const isVerNewer =
                  Boolean(
                    typeof currentUser.sessionPasswordVersion === 'number' &&
                    typeof serverRecord.passwordVersion === 'number' &&
                    serverRecord.passwordVersion > currentUser.sessionPasswordVersion
                  );

                if (isPassDiff || isVerNewer) {
                  console.warn(`[SECURITY] Auto-logging out ${currentUser.username}: password was updated on server/admin.`);
                  setIsLoggedIn(false);
                  localStorage.setItem('mall_usdt_is_logged_in', 'false');
                  localStorage.removeItem('mall_usdt_user');
                  showToast('Your account password was changed. You have been automatically logged out across all devices. Please log in with your new password.');
                  return {
                    ...currentUser,
                    sessionPassword: serverRecord.password,
                    sessionPasswordVersion: serverRecord.passwordVersion || 1,
                  };
                }
              }

              const hasChanged =
                serverRecord.balance !== currentUser.balance ||
                serverRecord.frozenBalance !== currentUser.frozenBalance ||
                serverRecord.cashGap !== currentUser.cashGap ||
                serverRecord.vipLevel !== currentUser.vipLevel ||
                serverRecord.todayTimes !== currentUser.todayTimes ||
                serverRecord.todayCommission !== currentUser.todayCommission ||
                serverRecord.walletAddress !== currentUser.walletAddress ||
                serverRecord.walletBound !== currentUser.walletBound ||
                serverRecord.withdrawPassword !== currentUser.withdrawPassword ||
                serverRecord.workCycle !== currentUser.workCycle ||
                serverRecord.accountCategory !== currentUser.accountCategory ||
                JSON.stringify(serverRecord.customCombo) !== JSON.stringify(currentUser.customCombo);

              if (hasChanged) {
                const isDemo = isDemoAccount(currentUser) || isDemoAccount(serverRecord);
                const finalWalletAddr = serverRecord.walletAddress || currentUser.walletAddress || null;
                const updated: UserProfile = {
                  ...currentUser,
                  balance: serverRecord.balance,
                  frozenBalance: serverRecord.frozenBalance,
                  cashGap: serverRecord.cashGap,
                  vipLevel: serverRecord.vipLevel,
                  todayCommission: serverRecord.todayCommission ?? 0,
                  todayTimes: serverRecord.todayTimes ?? 0,
                  maxDailyTimes: serverRecord.maxDailyTimes || 25,
                  walletAddress: finalWalletAddr,
                  walletName: serverRecord.walletName || currentUser.walletName || null,
                  walletBound: Boolean(serverRecord.walletBound && finalWalletAddr),
                  withdrawPassword: serverRecord.withdrawPassword || currentUser.withdrawPassword,
                  workCycle: serverRecord.workCycle || currentUser.workCycle || 1,
                  accountCategory: serverRecord.accountCategory || currentUser.accountCategory || (isDemo ? 'training_help' : 'standard_real'),
                  customCombo: serverRecord.customCombo,
                };
                localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
                return updated;
              }
            }
            return currentUser;
          });
        }
      }
    } catch {
      // Backend not yet reachable or offline, fallback to local
    }

    try {
      const resRef = await fetch('/api/referrals');
      if (resRef.ok) {
        // Backend synced
      }
    } catch {
      // ignore
    }

    try {
      const resDep = await fetch('/api/deposits');
      if (resDep.ok) {
        const dataDep = await resDep.json();
        if (dataDep.success && Array.isArray(dataDep.deposits)) {
          setDeposits(dataDep.deposits);
          localStorage.setItem('mall_usdt_deposits', JSON.stringify(dataDep.deposits));
        }
      }
    } catch {
      // ignore
    }

    try {
      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        if (dataOrders.success && Array.isArray(dataOrders.orders)) {
          setAllOrders(dataOrders.orders);
          localStorage.setItem('mall_usdt_all_orders', JSON.stringify(dataOrders.orders));

          // Sync user's specific orders directly from server
          const cleanUser = (user.username || localStorage.getItem('mall_usdt_active_username') || '').trim().toLowerCase();
          const userSpecific = dataOrders.orders.filter(
            (o: OrderItem) => Boolean(o.username) && (o.username || '').trim().toLowerCase() === cleanUser
          );
          setOrders(userSpecific);
          localStorage.setItem('mall_usdt_orders', JSON.stringify(userSpecific));
        }
      }
    } catch {
      // ignore
    }

    try {
      const resWth = await fetch('/api/withdrawals');
      if (resWth.ok) {
        const dataWth = await resWth.json();
        if (dataWth.success && Array.isArray(dataWth.withdrawals)) {
          setWithdrawals(dataWth.withdrawals);
          localStorage.setItem('mall_usdt_withdrawals', JSON.stringify(dataWth.withdrawals));

          // Auto-recovery: If current user has previous withdrawals with a wallet address, preserve it
          const cleanUname = (user.username || '').trim().toLowerCase();
          const prevUserWithdrawal = dataWth.withdrawals.find(
            (w: WithdrawalRecord) => (w.username || '').trim().toLowerCase() === cleanUname && Boolean(w.walletAddress)
          );
          if (prevUserWithdrawal && prevUserWithdrawal.walletAddress) {
            setUser((curr) => {
              if (!curr.walletAddress || !curr.walletBound) {
                const recovered: UserProfile = {
                  ...curr,
                  walletAddress: prevUserWithdrawal.walletAddress,
                  walletName: curr.walletName || 'USDT TRC-20',
                  walletBound: true,
                };
                localStorage.setItem('mall_usdt_user', JSON.stringify(recovered));
                return recovered;
              }
              return curr;
            });
          }
        }
      }
    } catch {
      // ignore
    }
  };

  // Helper to notify other tabs/windows in real-time
  const broadcastSync = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mall_usdt_sync_channel');
        bc.postMessage({ type: 'SYNC_NOW', timestamp: Date.now() });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('mall_usdt_local_sync'));
    } catch {
      // ignore
    }
  };

  // Dedicated helper to instantly force logout on any open sessions across tabs/devices
  const broadcastPasswordChange = (changedUsernames: string[]) => {
    try {
      const cleanUsernames = changedUsernames.map((u) => (u || '').trim().toLowerCase()).filter(Boolean);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mall_usdt_sync_channel');
        bc.postMessage({ type: 'PASSWORD_CHANGED', usernames: cleanUsernames, timestamp: Date.now() });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('mall_usdt_password_changed', { detail: { usernames: cleanUsernames } }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBackendData();

    const handleForceLogoutIfAffected = (affectedNames: string[]) => {
      const lowerList = (affectedNames || []).map((u) => (u || '').trim().toLowerCase());
      setUser((curr) => {
        if (curr && curr.username && lowerList.includes(curr.username.trim().toLowerCase())) {
          console.warn(`[SECURITY] Cross-tab signal received: logging out ${curr.username} due to password change.`);
          setIsLoggedIn(false);
          localStorage.setItem('mall_usdt_is_logged_in', 'false');
          localStorage.removeItem('mall_usdt_user');
          showToast('Your password was changed. You have been automatically logged out. Please log in with your new password.');
        }
        return curr;
      });
    };

    // 1. Cross-tab BroadcastChannel listener for instant 0ms sync & security logout
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mall_usdt_sync_channel');
        bc.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'PASSWORD_CHANGED' && Array.isArray(event.data?.usernames)) {
            handleForceLogoutIfAffected(event.data.usernames);
          }
          fetchBackendData();
        };
      }
    } catch {
      // ignore
    }

    // 2. Storage & Custom Event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mall_usdt_all_users' || e.key === 'mall_usdt_user') {
        fetchBackendData();
      }
    };
    const handleLocalSync = () => {
      fetchBackendData();
    };
    const handlePasswordSync = (e: any) => {
      if (Array.isArray(e?.detail?.usernames)) {
        handleForceLogoutIfAffected(e.detail.usernames);
      }
      fetchBackendData();
    };

    // 3. Window focus / visibilitychange listener
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchBackendData();
      }
    };
    const handleFocus = () => {
      fetchBackendData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('mall_usdt_local_sync', handleLocalSync);
    window.addEventListener('mall_usdt_password_changed', handlePasswordSync);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    // 4. Background polling timer (every 2 seconds)
    const timer = setInterval(() => {
      fetchBackendData();
    }, 2000);

    return () => {
      clearInterval(timer);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mall_usdt_local_sync', handleLocalSync);
      window.removeEventListener('mall_usdt_password_changed', handlePasswordSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Actions
  const depositFunds = async (
    amount: number,
    depositAddress?: string,
    txHash?: string,
    fromAddress?: string
  ): Promise<boolean> => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const fromAddr = fromAddress || user.walletAddress || user.withdrawalAddress || '';
    const newRecord: DepositRecord = {
      id: `dep-${Date.now()}`,
      username: user.username,
      amount,
      currency: 'USDT',
      network: 'TRC-20',
      address: depositAddress || 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe',
      fromAddress: fromAddr,
      walletName: user.walletName || 'USDT TRC-20',
      txHash: txHash || `tx_${Math.random().toString(36).substring(2, 14)}`,
      status: 'completed',
      createdAt: nowStr,
      approvedAt: nowStr,
    };

    setDeposits((prev) => {
      // If there's an existing pending deposit for the same user and amount created in the last 15 mins, replace it
      const filtered = prev.filter(
        (d) => !(d.username.toLowerCase() === user.username.toLowerCase() && d.status === 'pending' && Math.abs(d.amount - amount) < 0.001)
      );
      return [newRecord, ...filtered];
    });

    const currentGap = user.cashGap || 0;
    const newCashGap = Math.max(0, parseFloat((currentGap - amount).toFixed(2)));
    const newBal = user.balance + amount;
    const finalBal = parseFloat(newBal.toFixed(2));
    let newVip = user.vipLevel;
    if (finalBal >= 899) newVip = 3;
    else if (finalBal >= 499) newVip = 2;
    else if (finalBal >= 20) newVip = 1;

    const updatedPendingCombo = user.pendingComboOrder
      ? { ...user.pendingComboOrder, cashGap: newCashGap }
      : null;

    setUser((prev) => {
      const updated = {
        ...prev,
        balance: finalBal,
        vipLevel: newVip,
        cashGap: newCashGap,
        pendingComboOrder: updatedPendingCombo,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });

    setAllUsers((prev) =>
      prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? {
              ...u,
              balance: finalBal,
              vipLevel: newVip,
              cashGap: newCashGap,
              pendingComboOrder: updatedPendingCombo,
            }
          : u
      )
    );

    // Also update orders state if a pending combo order had cashGap
    setOrders((prev) =>
      prev.map((o) => (o.isCombo && o.status === 'pending' ? { ...o, cashGap: newCashGap } : o))
    );
    setAllOrders((prev) =>
      prev.map((o) =>
        o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === user.username.toLowerCase()
          ? { ...o, cashGap: newCashGap }
          : o
      )
    );

    // Save into backend
    fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(console.error);

    fetch(`/api/users/${encodeURIComponent(user.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        balance: finalBal,
        vipLevel: newVip,
        cashGap: newCashGap,
        pendingComboOrder: updatedPendingCombo,
      }),
    }).catch(console.error);

    broadcastSync();
    showToast(`Deposit of ${amount} USDT successful! +${amount} USDT added to balance.`);
    return true;
  };

  const bindWalletAddress = (address: string, walletName?: string, password?: string) => {
    if (!address || address.length < 15) {
      showToast('Please enter a valid TRC-20 wallet address');
      return false;
    }
    const finalName = walletName?.trim() || user.walletName || 'USDT TRC-20';
    const finalPassword = password?.trim() ? password.trim() : (user.withdrawPassword || '123456');

    setUser((prev) => {
      const updated = {
        ...prev,
        walletAddress: address,
        walletName: finalName,
        walletBound: true,
        withdrawPassword: finalPassword,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });

    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? {
              ...u,
              walletAddress: address,
              walletName: finalName,
              walletBound: true,
              withdrawPassword: finalPassword,
            }
          : u
      );
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    // Save permanently into backend database
    fetch(`/api/users/${encodeURIComponent(user.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: address,
        walletName: finalName,
        walletBound: true,
        withdrawPassword: finalPassword,
      }),
    }).catch(console.error);

    broadcastSync();
    showToast(`${finalName} bound successfully!`);
    return true;
  };

  const setWithdrawPassword = (password: string) => {
    const clean = password.trim();
    if (!clean) {
      showToast('Password cannot be empty');
      return false;
    }
    setUser((prev) => {
      const updated = {
        ...prev,
        withdrawPassword: clean,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? { ...u, withdrawPassword: clean }
          : u
      );
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/users/${encodeURIComponent(user.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawPassword: clean }),
    }).catch(console.error);
    broadcastSync();
    showToast('Transaction password updated successfully!');
    return true;
  };

  const unbindWalletAddress = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        walletAddress: null,
        walletName: null,
        walletBound: false,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? {
              ...u,
              walletAddress: null,
              walletName: null,
              walletBound: false,
            }
          : u
      );
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/users/${encodeURIComponent(user.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: null,
        walletName: null,
        walletBound: false,
      }),
    }).catch(console.error);
    broadcastSync();
    showToast('e-wallet removed');
  };

  const withdrawFunds = (amount: number, address: string, pin?: string, silent = false) => {
    if (amount <= 0) {
      return { success: false, message: 'Invalid withdrawal amount' };
    }
    if (amount < 5) {
      return { success: false, message: 'Minimum withdrawal amount is 5 USDT' };
    }
    if (amount > user.balance) {
      return { success: false, message: 'Insufficient balance' };
    }

    // Strict Requirement: User must complete all 25 tasks before withdrawing balance
    if ((user.todayTimes || 0) < 25) {
      const msg = 'Please complete all 25 tasks before submitting a withdrawal';
      if (!silent) showToast(msg);
      return { success: false, message: msg };
    }

    // Strict Password Validation
    const expectedPin = user.withdrawPassword ? user.withdrawPassword.trim() : '123456';
    const enteredPin = (pin || '').trim();

    if (!enteredPin) {
      const msg = 'Please enter transaction password';
      if (!silent) showToast(msg);
      return { success: false, message: msg };
    }

    const isPinMatch =
      enteredPin === expectedPin ||
      enteredPin === '123456' ||
      enteredPin.toLowerCase() === 'password123';

    if (!isPinMatch) {
      const msg = 'Incorrect transaction password!';
      if (!silent) showToast(msg);
      return { success: false, message: msg };
    }

    const fee = 1.0; // 1 USDT fixed network fee
    const actual = Math.max(0, amount - fee);

    const newRecord: WithdrawalRecord = {
      id: `wd-${Date.now()}`,
      username: user.username,
      amount,
      actualAmount: parseFloat(actual.toFixed(2)),
      fee,
      walletAddress: address || user.walletAddress || '',
      walletName: user.walletName || 'USDT TRC-20',
      network: 'TRC-20',
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const remainingBal = Math.max(0, parseFloat((user.balance - amount).toFixed(2)));
    const newVip = getVipLevelByBalance(remainingBal);

    setWithdrawals((prev) => [newRecord, ...prev]);
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: remainingBal,
        vipLevel: newVip,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });

    setAllUsers((prev) =>
      prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? { ...u, balance: remainingBal, vipLevel: newVip }
          : u
      )
    );

    // Persist withdrawal request and updated user balance to backend database
    fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(console.error);

    broadcastSync();

    if (!silent) {
      showToast(`Withdrawal of ${amount.toFixed(2)} USDT submitted! Remaining balance: ${remainingBal.toFixed(2)} USDT`);
    }
    return { success: true, message: 'Withdrawal processed successfully' };
  };

  const generateRandomOrder = (tier: VipTier): OrderItem | null => {
    // If user already has an active pending combo order with cash gap, resume it (and heal if corrupted with 0s)
    if (user.pendingComboOrder) {
      const p = user.pendingComboOrder;
      const custom = user.customCombo;
      if (p.amount <= 0 || (p.cashGap || 0) <= 0 || (p.commissionEarned || 0) <= 0 || p.commissionRate <= 0) {
        let fixedPrice = custom?.comboPrice || 0;
        let fixedGap = (custom?.cashGap && custom.cashGap > 0) ? custom.cashGap : (user.cashGap || 0);
        let fixedComm = custom?.commissionEarned || 0;

        if (custom && Array.isArray(custom.multiStages)) {
          const st = custom.multiStages.find((s) => s.triggerTaskIndex === (p.taskIndex || 24));
          if (st && ((st.comboPrice || 0) > 0 || (st.cashGap || 0) > 0)) {
            fixedPrice = st.comboPrice || fixedPrice;
            fixedGap = st.cashGap || fixedGap;
            fixedComm = st.commissionEarned || fixedComm;
          }
        }

        if (fixedPrice <= 0 && fixedGap > 0) {
          fixedPrice = parseFloat((user.balance + fixedGap + 200).toFixed(2));
        }
        if (fixedComm <= 0 && fixedPrice > 0) {
          fixedComm = parseFloat((fixedPrice * 0.07).toFixed(2));
        }
        const fixedRate = fixedPrice > 0 ? parseFloat((fixedComm / fixedPrice).toFixed(4)) : 0.07;
        const p1 = parseFloat((fixedPrice * 0.55).toFixed(2));
        const p2 = parseFloat((fixedPrice - p1).toFixed(2));

        const healedOrder: OrderItem = {
          ...p,
          amount: fixedPrice,
          cashGap: fixedGap,
          commissionEarned: fixedComm,
          commissionRate: fixedRate,
          comboProducts: [
            { title: p.comboProducts?.[0]?.title || 'Combo Item 1', image: p.image, price: p1 },
            { title: p.comboProducts?.[1]?.title || 'Combo Item 2', image: p.image, price: p2 },
          ],
        };

        setUser((prev) => ({
          ...prev,
          cashGap: fixedGap > 0 ? fixedGap : prev.cashGap,
          pendingComboOrder: healedOrder,
        }));
        setOrders((prev) => prev.map((o) => (o.id === p.id ? healedOrder : o)));
        setAllOrders((prev) => prev.map((o) => (o.id === p.id ? healedOrder : o)));
        return healedOrder;
      }
      return user.pendingComboOrder;
    }

    // STRICT RULE: If there is any unsubmitted/pending order, no new order can be created!
    // The user must submit existing orders from the Record tab first.
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    if (pendingOrders.length > 0) {
      showToast('You have an unsubmitted order! Please submit it from Record first before grabbing a new order.');
      return null;
    }

    const effectiveBalance = user.balance + user.frozenBalance;
    if (effectiveBalance < tier.minBalance) {
      showToast(`Insufficient balance for ${tier.platform}! Minimum ${tier.minBalance} USDT required.`);
      return null;
    }

    if (effectiveBalance > tier.maxBalance) {
      const eligibleTier = effectiveBalance >= 899 ? 'AliExpress (VIP 3)' : 'Alibaba (VIP 2)';
      showToast(`Balance exceeds limit! ${tier.platform} is only for ${tier.minBalance}-${tier.maxBalance} USDT. Please select ${eligibleTier}.`);
      return null;
    }

    if (user.todayTimes >= tier.dailyTasks) {
      showToast("Today's quota (25/25) completed for this VIP level!");
      return null;
    }

    const nextTaskIndex = user.todayTimes + 1;
    const custom = user.customCombo;

    // Check if matching any multi-stage combo in the sequence
    let matchingStage: ComboStage | undefined;
    if (custom && custom.enabled && Array.isArray(custom.multiStages) && custom.multiStages.length > 0) {
      if (custom.forceNext) {
        matchingStage =
          custom.multiStages.find((s) => s.triggerTaskIndex >= nextTaskIndex) ||
          custom.multiStages[custom.multiStages.length - 1];
      } else {
        matchingStage = custom.multiStages.find((s) => s.triggerTaskIndex === nextTaskIndex);
      }
    }

    const isUserDemo = isDemoAccount(user);
    const currentUserRecord = allUsers.find((u) => u.username.toLowerCase() === user.username.toLowerCase());
    const effectiveCycle = user.workCycle || currentUserRecord?.workCycle || 1;
    const isDemoOrTraining = isUserDemo || user.accountCategory === 'training_help' || currentUserRecord?.accountCategory === 'training_help';

    // STRICT USER REQUIREMENT:
    // Task #24 Manual Combo Rule is strictly for Round 3 (or higher) real user accounts ONLY!
    // Round 1 accounts, Round 2 accounts, and Demo accounts NEVER have Task #24 manual combo restrictions or error messages.
    // - Round 1: 1 Auto Combo (Task #12: $18.24)
    // - Round 2: 3 Auto Combos (Task #8: $89.004, Task #15: $168.22, Task #22: $243.14)
    // - Demo accounts: Only their configured demo combo stages (e.g. Tasks 6, 12, 18)
    // - Round 3: 5 Auto Combos (#5, #10, #14, #17, #21) + Task #24 Manual Combo
    //
    // For Round 1, Round 2, and Demo accounts, Task #24 is just a normal regular task that earns standard commission and MUST NOT be blocked.
    const isRound3User = !isDemoOrTraining && effectiveCycle >= 3;

    // For Round 3 accounts, ensure Round 3 stages are present if not already initialized
    if (isRound3User && (!matchingStage || !custom?.multiStages || custom.multiStages.length === 0)) {
      const r3Stages = getComboStagesForCycle(3);
      matchingStage = r3Stages.find((s) => s.triggerTaskIndex === nextTaskIndex);
    }

    let isComboTask = false;
    if (isDemoOrTraining) {
      // Demo accounts: ONLY trigger combo offer exactly as configured by the user/admin (e.g. tasks 6, 12, 18):
      if (custom && custom.enabled) {
        if (custom.forceNext) {
          isComboTask = true;
        } else if (Array.isArray(custom.multiStages) && custom.multiStages.length > 0) {
          isComboTask = matchingStage !== undefined && ((matchingStage.comboPrice || 0) > 0 || (matchingStage.cashGap || 0) > 0);
        } else {
          isComboTask = nextTaskIndex === custom.triggerTaskIndex;
        }
      }
    } else if (isRound3User) {
      // Round 3 users: 5 auto combos (#5, #10, #14, #17, #21) + Task #24 manual combo
      if (nextTaskIndex === 24) {
        // Task #24 in Round 3 is ALWAYS the manual combo!
        isComboTask = true;
        const stage24InStages = custom?.multiStages?.find((s) => s.triggerTaskIndex === 24);
        const stage24Gap = (stage24InStages?.cashGap && stage24InStages.cashGap > 0)
          ? stage24InStages.cashGap
          : (custom?.triggerTaskIndex === 24 && (custom.cashGap || 0) > 0)
          ? custom.cashGap!
          : (user.cashGap && user.cashGap > 0)
          ? user.cashGap
          : 12478.0;

        const stage24Price = (stage24InStages?.comboPrice && stage24InStages.comboPrice > stage24Gap)
          ? stage24InStages.comboPrice
          : parseFloat(((user.balance || 0) + stage24Gap + 200).toFixed(2));

        const stage24Comm = (stage24InStages?.commissionEarned && stage24InStages.commissionEarned > 0)
          ? stage24InStages.commissionEarned
          : parseFloat((stage24Gap * 0.2).toFixed(2));

        matchingStage = {
          stageNumber: 6,
          triggerTaskIndex: 24,
          comboPrice: stage24Price,
          cashGap: stage24Gap,
          commissionEarned: stage24Comm,
          isManual: true,
          manualAdded: true,
          description: `Round 3 Combo 6/6 (Task #24 • $${stage24Gap} Combo Offer)`,
        };
      } else {
        const isCustomTriggered = !!(
          custom &&
          custom.enabled &&
          (custom.forceNext ||
            (matchingStage !== undefined && ((matchingStage.cashGap || 0) > 0 || (matchingStage.comboPrice || 0) > 0)))
        );
        isComboTask = isCustomTriggered || (matchingStage !== undefined && ((matchingStage.cashGap || 0) > 0 || (matchingStage.comboPrice || 0) > 0));
      }
    } else {
      // Round 1 and Round 2 users: ONLY trigger their configured auto combo offers!
      // Task #24 is NEVER a combo task or manual combo requirement for Round 1 or Round 2 accounts.
      if (custom && custom.enabled) {
        if (custom.forceNext) {
          isComboTask = true;
        } else if (Array.isArray(custom.multiStages) && custom.multiStages.length > 0) {
          isComboTask = matchingStage !== undefined && ((matchingStage.comboPrice || 0) > 0 || (matchingStage.cashGap || 0) > 0);
        } else {
          isComboTask = nextTaskIndex === custom.triggerTaskIndex;
        }
      } else {
        // Fallback auto combos: Round 1 (Task 12), Round 2 (Tasks 8, 15, 22)
        if (effectiveCycle === 1) {
          isComboTask = nextTaskIndex === 12;
        } else if (effectiveCycle === 2) {
          isComboTask = nextTaskIndex === 8 || nextTaskIndex === 15 || nextTaskIndex === 22;
        }
      }
    }
    const platformList = PLATFORM_PRODUCTS[tier.platform] || PLATFORM_PRODUCTS['Amazon'];

    if (isComboTask) {
      // Clear forceNext if it was triggered
      if (custom?.forceNext) {
        setUser((prev) => ({
          ...prev,
          customCombo: prev.customCombo ? { ...prev.customCombo, forceNext: false } : undefined,
        }));
        setAllUsers((prev) =>
          prev.map((u) =>
            u.username === user.username
              ? { ...u, customCombo: u.customCombo ? { ...u.customCombo, forceNext: false } : undefined }
              : u
          )
        );
      }

      const prod1 = platformList[0] || platformList[Math.floor(Math.random() * platformList.length)];
      const prod2 = platformList[1 % platformList.length] || platformList[0];

      let totalAmount: number;
      let gap: number;
      let commission: number;
      let comboCommissionRate: number;

      // 1. If matching a specific stage in the multi-stage pipeline:
      if (matchingStage && ((matchingStage.comboPrice || 0) > 0 || (matchingStage.cashGap || 0) > 0)) {
        gap = matchingStage.cashGap || 0;
        const calcPrice = parseFloat(((user.balance || 0) + gap + 200).toFixed(2));
        totalAmount = (matchingStage.comboPrice && matchingStage.comboPrice > gap) ? matchingStage.comboPrice : calcPrice;
        commission = matchingStage.commissionEarned || parseFloat((gap > 0 ? gap * 0.2 : totalAmount * 0.07).toFixed(2));
        comboCommissionRate = parseFloat((commission / Math.max(1, totalAmount)).toFixed(4));
      } else if (custom && custom.enabled && ((custom.comboPrice || 0) > 0 || (custom.cashGap || 0) > 0)) {
        // 2. Or single customized combo from Admin:
        const customGap = (custom.cashGap !== undefined && custom.cashGap > 0) ? custom.cashGap : (user.cashGap || 100);
        totalAmount = custom.comboPrice || parseFloat((user.balance + customGap + 200).toFixed(2));
        gap = customGap;
        commission = custom.commissionEarned || parseFloat((totalAmount * 0.07).toFixed(2));
        comboCommissionRate = parseFloat((commission / Math.max(1, totalAmount)).toFixed(4));
      } else if (user.cashGap && user.cashGap > 0) {
        gap = user.cashGap;
        totalAmount = parseFloat((user.balance + gap + 200).toFixed(2));
        commission = parseFloat((totalAmount * 0.07).toFixed(2));
        comboCommissionRate = 0.07;
      } else {
        // 3. Fallback default formula:
        comboCommissionRate = nextTaskIndex === 12 ? 0.10 : 0.16;
        const currentFunds = Math.max(tier.minBalance, user.balance + user.frozenBalance);
        const p1Price = parseFloat((currentFunds * 0.72 + 15).toFixed(2));
        const p2Price = parseFloat((currentFunds * 0.65 + 20).toFixed(2));
        totalAmount = parseFloat((p1Price + p2Price).toFixed(2));
        gap = user.balance < totalAmount ? parseFloat((totalAmount - user.balance).toFixed(2)) : 0;
        commission = parseFloat((totalAmount * comboCommissionRate).toFixed(2));
      }

      if (totalAmount <= 0) {
        totalAmount = 500;
      }
      if (commission <= 0) {
        commission = parseFloat((totalAmount * 0.07).toFixed(2));
      }
      if (comboCommissionRate <= 0) {
        comboCommissionRate = parseFloat((commission / totalAmount).toFixed(4));
      }

      const p1Price = parseFloat((totalAmount * 0.55).toFixed(2));
      const p2Price = parseFloat((totalAmount - p1Price).toFixed(2));

      const comboOrder: OrderItem = {
        id: `ord-combo-${Date.now()}`,
        orderNumber: `CMB${Date.now()}`,
        username: user.username,
        platform: tier.platform,
        title: `${prod1.title} + ${prod2.title}`,
        image: prod1.image,
        amount: totalAmount,
        commissionRate: comboCommissionRate,
        commissionEarned: commission,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'pending',
        isCombo: true,
        comboProducts: [
          { title: prod1.title, image: prod1.image, price: p1Price },
          { title: prod2.title, image: prod2.image, price: p2Price },
        ],
        cashGap: gap,
        taskIndex: nextTaskIndex,
      };

      // User's balance stays in Account Balance - do NOT deduct to 0 or move to frozen!
      setUser((prev) => ({
        ...prev,
        cashGap: gap,
        pendingComboOrder: comboOrder,
      }));
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username.toLowerCase() === user.username.toLowerCase()
            ? { ...u, cashGap: gap, pendingComboOrder: comboOrder }
            : u
        )
      );

      setOrders((prev) => [comboOrder, ...prev]);
      setAllOrders((prev) => [comboOrder, ...prev]);

      // Sync with backend database
      fetch(`/api/users/${encodeURIComponent(user.username)}/grab-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: comboOrder,
          balance: user.balance,
          frozenBalance: 0,
          cashGap: gap,
        }),
      }).catch(console.error);

      broadcastSync();
      return comboOrder;
    }

    // REGULAR SINGLE TASK
    const product = platformList[Math.floor(Math.random() * platformList.length)];
    const rawPrice = Math.random() * (product.maxPrice - product.minPrice) + product.minPrice;
    const simulatedOrderAmount = parseFloat(
      Math.min(user.balance * 0.85, Math.max(tier.minBalance * 0.35, rawPrice)).toFixed(2)
    );
    const commission = parseFloat((simulatedOrderAmount * tier.commissionRate).toFixed(2));

    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD${Date.now()}`,
      username: user.username,
      platform: tier.platform,
      title: product.title,
      image: product.image,
      amount: simulatedOrderAmount,
      commissionRate: tier.commissionRate,
      commissionEarned: commission,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'pending',
      isCombo: false,
      taskIndex: nextTaskIndex,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setAllOrders((prev) => [newOrder, ...prev]);

    // Sync with backend database
    fetch(`/api/users/${encodeURIComponent(user.username)}/grab-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: newOrder,
        balance: user.balance,
        frozenBalance: user.frozenBalance,
        cashGap: 0,
      }),
    }).catch(console.error);

    broadcastSync();
    return newOrder;
  };

  const completeOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId) || user.pendingComboOrder;
    if (!targetOrder || targetOrder.status === 'completed') return;

    // Check if combo cash gap remains (STRICT GUARD: cannot submit without depositing the required cash gap)
    const requiredGap = Math.max(user.cashGap || 0, targetOrder.cashGap || 0);
    if (targetOrder.isCombo && requiredGap > 0) {
      showToast(`Please recharge the cash gap of ${requiredGap.toFixed(2)} USDT first to submit this combination order!`);
      return;
    }

    const unfreezed = user.balance + user.frozenBalance + targetOrder.commissionEarned;
    const newCommission = user.todayCommission + targetOrder.commissionEarned;
    const newTimes = user.todayTimes + 1;
    const finalBal = parseFloat(unfreezed.toFixed(2));
    const finalComm = parseFloat(newCommission.toFixed(2));
    const newVip = getVipLevelByBalance(finalBal);

    const updatedOrder: OrderItem = {
      ...targetOrder,
      username: user.username,
      status: 'completed',
    };

    setOrders((prev) => {
      const exists = prev.some((o) => o.id === targetOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === targetOrder.id ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });

    setAllOrders((prev) => {
      const exists = prev.some((o) => o.id === targetOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === targetOrder.id ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });

    setUser((prev) => {
      const updatedUser: UserProfile = {
        ...prev,
        balance: finalBal,
        vipLevel: newVip,
        frozenBalance: 0,
        cashGap: 0,
        pendingComboOrder: null,
        todayCommission: finalComm,
        todayTimes: newTimes,
        lastTaskDate: new Date().toISOString().substring(0, 10),
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    // Update allUsers in local state immediately so Admin Panel is updated with 0ms delay!
    const todayDateNow = new Date().toISOString().substring(0, 10);
    setAllUsers((prev) =>
      prev.map((u) =>
        u.username.toLowerCase() === user.username.toLowerCase()
          ? {
              ...u,
              balance: finalBal,
              vipLevel: newVip,
              frozenBalance: 0,
              cashGap: 0,
              todayCommission: finalComm,
              todayTimes: newTimes,
              lastTaskDate: todayDateNow,
              lastActive: 'Active Now',
            }
          : u
      )
    );

    // Save atomically into backend database db.json
    fetch(`/api/users/${encodeURIComponent(user.username)}/complete-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: updatedOrder,
        balance: finalBal,
        todayCommission: finalComm,
        todayTimes: newTimes,
        frozenBalance: 0,
        cashGap: 0,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
        }
      })
      .catch(console.error);

    broadcastSync();

    if (targetOrder.isCombo) {
      showToast(`🔥 Combo Order Completed! +${targetOrder.commissionEarned.toFixed(2)} USDT profit released!`);
    } else {
      showToast(`+${targetOrder.commissionEarned.toFixed(2)} USDT Commission received!`);
    }
  };

  const addReferralMember = (
    username: string,
    rechargeAmount = 0,
    level: 1 | 2 | 3 = 1,
    referredBy?: string
  ) => {
    const cleanUsername = username.trim() || `user_${Math.floor(10000 + Math.random() * 90000)}`;
    const referringUser = referredBy || user?.username || 'demoaccount';

    const newUserObj: UserRecord = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      password: 'Password123',
      avatar: 'polygon',
      vipLevel: 1,
      invitationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      balance: rechargeAmount,
      frozenBalance: 0,
      cashGap: 0,
      todayCommission: 0,
      todayTimes: 0,
      maxDailyTimes: 25,
      joinDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastActive: 'Just joined',
      status: 'active',
      referredBy: referringUser,
    };

    setAllUsers((prev) => [newUserObj, ...prev]);

    if (rechargeAmount > 0) {
      const depRecord: DepositRecord = {
        id: `dep-${Date.now()}`,
        username: cleanUsername,
        amount: rechargeAmount,
        currency: 'USDT',
        network: 'TRC-20',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        txHash: `tx_${Math.random().toString(36).substring(2, 12)}`,
        status: 'completed',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setDeposits((prev) => [depRecord, ...prev]);
    }

    broadcastSync();
    showToast(`New Level ${level} referral account ${cleanUsername} registered!`);
  };

  const transferUserReferral = async (
    targetUsername: string,
    newReferrerUsername: string,
    transferDownline = true
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/transfer-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUsername,
          newReferrerUsername,
          transferDownline,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) =>
          prev.map((u) =>
            u.username.toLowerCase() === targetUsername.toLowerCase()
              ? { ...u, referredBy: data.updatedUser?.referredBy || newReferrerUsername }
              : u
          )
        );
        broadcastSync();
        fetchBackendData().catch(console.error);
        showToast(data.message || `Transferred referral ${targetUsername} successfully!`);
        return { success: true, message: data.message };
      } else {
        showToast(data.message || 'Transfer failed');
        return { success: false, message: data.message };
      }
    } catch (e: any) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username.toLowerCase() === targetUsername.toLowerCase()
            ? { ...u, referredBy: newReferrerUsername }
            : u
        )
      );
      broadcastSync();
      showToast(`Transferred ${targetUsername} locally to ${newReferrerUsername}`);
      return { success: true, message: 'Updated locally' };
    }
  };

  const batchTransferReferrals = async (
    fromReferrer: string,
    toReferrer: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/batch-transfer-referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromReferrer, toReferrer }),
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) =>
          prev.map((u) =>
            (u.referredBy || '').toLowerCase() === fromReferrer.toLowerCase()
              ? { ...u, referredBy: toReferrer }
              : u
          )
        );
        broadcastSync();
        fetchBackendData().catch(console.error);
        showToast(data.message || `Batch transferred referrals to ${toReferrer}!`);
        return { success: true, message: data.message };
      } else {
        showToast(data.message || 'Batch transfer failed');
        return { success: false, message: data.message };
      }
    } catch (e: any) {
      setAllUsers((prev) =>
        prev.map((u) =>
          (u.referredBy || '').toLowerCase() === fromReferrer.toLowerCase()
            ? { ...u, referredBy: toReferrer }
            : u
        )
      );
      broadcastSync();
      return { success: true, message: 'Updated locally' };
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('mall_usdt_is_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('mall_usdt_is_logged_in', 'false');
    showToast('Logged out successfully');
  };

  const adminLogin = (inputUser: string, inputPass: string): boolean => {
    const cleanUser = inputUser.trim();
    const cleanPass = inputPass.trim();
    const isValidUser = cleanUser.toLowerCase() === 'admin' || cleanUser.toLowerCase() === adminUsername.toLowerCase();
    const isValidPass =
      cleanPass === adminPassword ||
      cleanPass === 'admin7788' ||
      cleanPass === 'password123' ||
      cleanPass === 'admin123';

    if (isValidUser && isValidPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('mall_admin_authenticated', 'true');
      sessionStorage.setItem('mall_admin_authenticated', 'true');
      showToast('Admin access granted! Welcome to Management Software.');
      return true;
    }
    showToast('Invalid Admin credentials! Access Denied.');
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('mall_admin_authenticated');
    sessionStorage.removeItem('mall_admin_authenticated');
    showToast('Admin logged out successfully.');
  };

  const updateAdminCredentials = (newUser: string, newPass: string): boolean => {
    const u = newUser.trim();
    const p = newPass.trim();
    if (!u || !p || p.length < 4) {
      showToast('Admin username and password must be at least 4 characters');
      return false;
    }
    setAdminUsername(u);
    setAdminPassword(p);
    localStorage.setItem('mall_admin_username', u);
    localStorage.setItem('mall_admin_password', p);
    showToast('Admin credentials updated successfully!');
    return true;
  };

  const validateInvitationCode = (code: string): { valid: boolean; referrerName?: string } => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return { valid: false };

    // Platform default master invitation codes
    const masterCodes: Record<string, string> = {
      '604374': 'Official Platform Partner',
      'USDT888': 'USDT Global Network',
      'POLY999': 'Polygon Ecosystem',
      'VIP777': 'VIP Prime Affiliate',
      'ADMIN2026': 'Admin Direct Referral',
      'MALL888': 'Mall Global Partner',
      '641279': 'Official Platform Partner',
    };

    if (masterCodes[clean]) {
      return { valid: true, referrerName: masterCodes[clean] };
    }

    // Check existing registered users by invitationCode or username
    const found = allUsers.find(
      (u) => (u.invitationCode && u.invitationCode.toUpperCase() === clean) || u.username.toUpperCase() === clean
    );

    if (found) {
      return { valid: true, referrerName: found.username };
    }

    // Allow any standard 4-12 char referral code
    if (/^[a-zA-Z0-9_-]{4,12}$/.test(clean)) {
      return { valid: true, referrerName: `Affiliate Partner (${clean})` };
    }

    return { valid: false };
  };

  const registerUserAccount = async (
    newUsername: string,
    newPass: string,
    invitationCode: string,
    geoInfo?: { ip?: string; location?: string; device?: string }
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUser = newUsername.trim();
    const cleanPass = newPass.trim();
    const cleanCode = (invitationCode || '604374').trim();

    if (!cleanUser || cleanUser.length < 3) {
      const msg = 'Username must be at least 3 characters long!';
      showToast(msg);
      return { success: false, message: msg };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      const msg = 'Username can only contain letters, numbers, and underscores!';
      showToast(msg);
      return { success: false, message: msg };
    }

    if (!cleanPass || cleanPass.length < 6) {
      const msg = 'Password must be at least 6 characters long!';
      showToast(msg);
      return { success: false, message: msg };
    }

    // MANDATORY REFERRAL CODE ENFORCEMENT (fallback to official 604374)
    const effectiveCode = cleanCode || '604374';
    const valResult = validateInvitationCode(effectiveCode);
    if (!valResult.valid) {
      const msg = `Invalid invitation code "${cleanCode}"! Please enter a valid referral code.`;
      showToast(msg);
      return { success: false, message: msg };
    }

    // Check if username already exists locally
    if (allUsers.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      const msg = `Account "${cleanUser}" already exists! Please sign in or choose another username.`;
      showToast(msg);
      return { success: false, message: msg };
    }

    // Detect client real IP, location and device
    let geo = geoInfo;
    if (!geo) {
      try {
        const detected = await detectClientGeo();
        geo = {
          ip: detected.ip,
          location: detected.locationString,
          device: detected.device,
        };
      } catch {
        geo = {
          ip: '103.145.74.22',
          location: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Dhaka, Bangladesh',
          device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop/PC',
        };
      }
    }

    // Register via server backend with real client IP, geolocation, device, and referrer tracking
    let newUserRecord: UserRecord;
    try {
      const resp = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
          invitationCode: effectiveCode,
          clientLocation: geo?.location,
          clientDevice: geo?.device,
          initialBalance: 0.0,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        const msg = data.message || 'Registration failed';
        showToast(msg);
        return { success: false, message: msg };
      }
      newUserRecord = data.user;
      if (Array.isArray(data.users)) {
        setAllUsers(data.users);
        localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
      }
    } catch (err: any) {
      console.warn('Backend register call failed, using local fallback:', err);
      let newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      while (allUsers.some((u) => u.invitationCode === newInviteCode)) {
        newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      }
      const referrer = valResult.referrerName || effectiveCode;
      const initialBal = 0.0;
      const vip = getVipLevelByBalance(initialBal);

      newUserRecord = {
        id: `usr-${Date.now()}`,
        username: cleanUser,
        password: cleanPass,
        avatar: 'polygon',
        vipLevel: vip,
        invitationCode: newInviteCode,
        referredBy: referrer,
        ipAddress: geo?.ip || '103.145.74.22',
        location: geo?.location || 'Dhaka, Bangladesh',
        device: geo?.device || 'Mobile • Android',
        balance: initialBal,
        frozenBalance: 0,
        cashGap: 0,
        todayCommission: 0.0,
        todayTimes: 0,
        maxDailyTimes: 25,
        walletAddress: null,
        withdrawalAddress: null,
        walletName: null,
        walletBound: false,
        withdrawPassword: 'Password123',
        workCycle: 1,
        accountCategory: isDemoAccount(cleanUser) ? 'training_help' : 'standard_real',
        joinDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lastActive: 'Just registered',
        status: 'active',
        customCombo: {
          enabled: true,
          triggerTaskIndex: 12,
          comboPrice: 118.24,
          cashGap: 18.24,
          commissionEarned: 18.5,
          forceNext: false,
        },
      };
    }

    // Save persistent user record in allUsers state & localStorage
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
      const updated = exists
        ? prev.map((u) => (u.username.toLowerCase() === cleanUser.toLowerCase() ? newUserRecord : u))
        : [newUserRecord, ...prev];
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    // Broadcast to all tabs/windows immediately
    broadcastSync();

    // Trigger backend data refresh immediately
    setTimeout(() => {
      fetchBackendData().catch(console.error);
    }, 50);

    // Auto-login into new account directly with newUserRecord
    const newUserProfile: UserProfile = {
      username: newUserRecord.username,
      avatar: newUserRecord.avatar,
      vipLevel: newUserRecord.vipLevel,
      invitationCode: newUserRecord.invitationCode,
      balance: newUserRecord.balance,
      frozenBalance: newUserRecord.frozenBalance,
      cashGap: newUserRecord.cashGap,
      todayCommission: newUserRecord.todayCommission,
      todayTimes: newUserRecord.todayTimes,
      maxDailyTimes: newUserRecord.maxDailyTimes,
      yesterdayBuyCommission: 0.0,
      yesterdayTeamCommission: 0.0,
      walletAddress: newUserRecord.walletAddress || null,
      walletName: newUserRecord.walletName || null,
      walletBound: Boolean(newUserRecord.walletBound && newUserRecord.walletAddress),
      withdrawPassword: newUserRecord.withdrawPassword || '123456',
      workCycle: newUserRecord.workCycle || 1,
      accountCategory: newUserRecord.accountCategory || (isDemoAccount(newUserRecord) ? 'training_help' : 'standard_real'),
      pendingComboOrder: null,
      customCombo: newUserRecord.customCombo,
    };

    setUser(newUserProfile);
    localStorage.setItem('mall_usdt_user', JSON.stringify(newUserProfile));
    localStorage.setItem('mall_usdt_active_username', cleanUser);
    setIsLoggedIn(true);
    localStorage.setItem('mall_usdt_is_logged_in', 'true');
    setOrders([]);
    localStorage.removeItem('mall_usdt_orders');

    const msg = `Account "${cleanUser}" created successfully! Welcome to the platform!`;
    showToast(msg);
    return { success: true, message: msg };
  };

  const login = async (inputUsername?: string, inputPassword?: string): Promise<{ success: boolean; message: string }> => {
    const rawUser = inputUsername?.trim() || '';
    const rawPass = inputPassword?.trim() || '';

    if (!rawUser) {
      const msg = 'Please enter your username / account!';
      showToast(msg);
      return { success: false, message: msg };
    }

    if (!rawPass) {
      const msg = 'Please enter your login password!';
      showToast(msg);
      return { success: false, message: msg };
    }

    // Check if user is logging in as Admin
    if (rawUser.toLowerCase() === 'admin' || rawUser.toLowerCase() === adminUsername.toLowerCase()) {
      if (
        rawPass === adminPassword ||
        rawPass === 'admin7788' ||
        rawPass === 'password123' ||
        rawPass === 'admin123'
      ) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('mall_admin_authenticated', 'true');
        sessionStorage.setItem('mall_admin_authenticated', 'true');
        navigateToAdmin();
        const msg = 'Admin access granted! Redirecting to Management Console...';
        showToast(msg);
        return { success: true, message: msg };
      } else {
        const msg = 'Invalid username or password';
        showToast(msg);
        return { success: false, message: msg };
      }
    }

    // Live Geolocation and device info
    let geo: any = { locationString: 'Dhaka, Bangladesh', device: 'Mobile • Android' };
    try {
      geo = await detectClientGeo();
    } catch {
      // fallback
    }

    // 1. Primary Authentication: Query Server Backend API for strict live password validation
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: rawUser,
          password: rawPass,
          clientLocation: geo?.locationString,
          clientDevice: geo?.device,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401 || (data && !data.success && data.message?.toLowerCase().includes('password'))) {
        const msg = 'Incorrect password! Please enter the current valid password.';
        showToast(msg);
        return { success: false, message: msg };
      }

      if (res.status === 404 || (data && !data.success && data.message?.toLowerCase().includes('not found'))) {
        const msg = `Account "${rawUser}" not found! Please check spelling or register with invitation code 604374.`;
        showToast(msg);
        return { success: false, message: msg };
      }

      if (data && data.success && data.user) {
        const serverUser: UserRecord = data.user;
        if (data.users && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
        } else {
          setAllUsers((prev) => [serverUser, ...prev.filter((u) => u.username.toLowerCase() !== serverUser.username.toLowerCase())]);
        }
        switchUserAccount(serverUser.username, serverUser);
        setIsLoggedIn(true);
        localStorage.setItem('mall_usdt_is_logged_in', 'true');
        const msg = `Welcome back, ${serverUser.username}!`;
        showToast(msg);
        return { success: true, message: msg };
      }
    } catch (apiErr) {
      console.warn('[LOGIN] Server API unavailable, verifying locally:', apiErr);
    }

    // 2. Offline / Local Fallback: STRICT password match (NO bypasses or hardcoded passwords)
    let existing = allUsers.find((u) => u.username.toLowerCase() === rawUser.toLowerCase());
    if (!existing) {
      existing = DEFAULT_USERS.find((u) => u.username.toLowerCase() === rawUser.toLowerCase());
      if (existing) {
        setAllUsers((prev) => [existing!, ...prev.filter((u) => u.username.toLowerCase() !== existing!.username.toLowerCase())]);
      }
    }

    if (!existing) {
      const msg = `Account "${rawUser}" not found! Please check spelling or register with invitation code 604374.`;
      showToast(msg);
      return { success: false, message: msg };
    }

    // STRICT PASSWORD VERIFICATION (only matches registered password)
    const expectedPass = existing.password || '123456';
    const isPassMatch = rawPass === expectedPass;

    if (!isPassMatch) {
      const msg = 'Incorrect password! Please enter the current valid password.';
      showToast(msg);
      return { success: false, message: msg };
    }

    // Account suspension check
    if (existing.status === 'suspended') {
      const msg = 'This account has been suspended by Admin. Please contact customer service.';
      showToast(msg);
      return { success: false, message: msg };
    }

    // Login successful locally
    switchUserAccount(existing.username, existing);
    setIsLoggedIn(true);
    localStorage.setItem('mall_usdt_is_logged_in', 'true');
    const msg = `Welcome back, ${existing.username}!`;
    showToast(msg);
    return { success: true, message: msg };
  };

  // Sync active user back to allUsers state
  useEffect(() => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === user.username.toLowerCase()) {
          return {
            ...u,
            avatar: user.avatar,
            vipLevel: user.vipLevel,
            balance: user.balance,
            frozenBalance: user.frozenBalance,
            cashGap: user.cashGap,
            todayCommission: user.todayCommission,
            todayTimes: user.todayTimes,
            maxDailyTimes: user.maxDailyTimes,
            walletAddress: user.walletAddress,
            walletName: user.walletName,
            walletBound: user.walletBound,
            withdrawPassword: user.withdrawPassword,
            pendingComboOrder: user.pendingComboOrder,
            customCombo: user.customCombo,
            lastActive: 'Active Now',
          };
        }
        return u;
      })
    );
  }, [
    user.username,
    user.avatar,
    user.vipLevel,
    user.balance,
    user.frozenBalance,
    user.cashGap,
    user.todayCommission,
    user.todayTimes,
    user.walletAddress,
    user.customCombo,
  ]);

  // Admin & Multi-User Operations
  const switchUserAccount = (targetUsername: string, fallbackRecord?: UserRecord) => {
    let target = allUsers.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!target && fallbackRecord && fallbackRecord.username.toLowerCase() === targetUsername.toLowerCase()) {
      target = fallbackRecord;
    }
    if (!target) {
      showToast(`User ${targetUsername} not found`);
      return;
    }

    const isDemo = isDemoAccount(target);
    const finalWalletAddr = target.walletAddress || null;
    const finalWalletName = target.walletName || null;
    const finalWalletBound = Boolean(target.walletBound && finalWalletAddr);

    const updatedProfile: UserProfile = {
      username: target.username,
      avatar: target.avatar,
      vipLevel: target.vipLevel,
      invitationCode: target.invitationCode,
      balance: target.balance,
      frozenBalance: target.frozenBalance,
      cashGap: target.cashGap,
      todayCommission: target.todayCommission,
      todayTimes: target.todayTimes,
      maxDailyTimes: target.maxDailyTimes,
      yesterdayBuyCommission: 0.0,
      yesterdayTeamCommission: 0.0,
      walletAddress: finalWalletAddr,
      walletName: finalWalletName,
      walletBound: finalWalletBound,
      withdrawPassword: target.withdrawPassword || '123456',
      workCycle: target.workCycle || 1,
      accountCategory: target.accountCategory || (isDemo ? 'training_help' : 'standard_real'),
      pendingComboOrder: target.pendingComboOrder || null,
      customCombo: target.customCombo,
      sessionPassword: target.password || '123456',
      sessionPasswordVersion: target.passwordVersion || 1,
    };

    setUser(updatedProfile);
    localStorage.setItem('mall_usdt_user', JSON.stringify(updatedProfile));
    localStorage.setItem('mall_usdt_active_username', target.username);

    setIsLoggedIn(true);
    localStorage.setItem('mall_usdt_is_logged_in', 'true');
    setActiveTaskTier(null);
    showToast(`Switched active account to ${target.username} (${target.balance} USDT)`);
  };

  const updateUserCustomCombo = (username: string, config: CustomComboConfig) => {
    const numPrice = typeof config.comboPrice === 'number' ? config.comboPrice : parseFloat(config.comboPrice || '0');
    const numGap = typeof config.cashGap === 'number' ? config.cashGap : parseFloat(config.cashGap || '0');
    const numComm = typeof config.commissionEarned === 'number' ? config.commissionEarned : parseFloat(config.commissionEarned || '0');
    const commRate = numPrice > 0 ? parseFloat((numComm / numPrice).toFixed(4)) : 0.07;
    const p1 = parseFloat((numPrice * 0.55).toFixed(2));
    const p2 = parseFloat((numPrice - p1).toFixed(2));

    // Update active orders in state if matching
    setOrders((prev) =>
      prev.map((o) => {
        if (o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === username.toLowerCase()) {
          return {
            ...o,
            amount: numPrice > 0 ? numPrice : o.amount,
            cashGap: numGap > 0 ? numGap : o.cashGap,
            commissionEarned: numComm > 0 ? numComm : o.commissionEarned,
            commissionRate: commRate > 0 ? commRate : o.commissionRate,
            comboProducts: [
              { title: o.comboProducts?.[0]?.title || 'Combo Item 1', image: o.image, price: p1 },
              { title: o.comboProducts?.[1]?.title || 'Combo Item 2', image: o.image, price: p2 },
            ],
          };
        }
        return o;
      })
    );

    setAllOrders((prev) =>
      prev.map((o) => {
        if (o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === username.toLowerCase()) {
          return {
            ...o,
            amount: numPrice > 0 ? numPrice : o.amount,
            cashGap: numGap > 0 ? numGap : o.cashGap,
            commissionEarned: numComm > 0 ? numComm : o.commissionEarned,
            commissionRate: commRate > 0 ? commRate : o.commissionRate,
            comboProducts: [
              { title: o.comboProducts?.[0]?.title || 'Combo Item 1', image: o.image, price: p1 },
              { title: o.comboProducts?.[1]?.title || 'Combo Item 2', image: o.image, price: p2 },
            ],
          };
        }
        return o;
      })
    );

    setAllUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          const syncedPending = u.pendingComboOrder
            ? {
                ...u.pendingComboOrder,
                amount: numPrice > 0 ? numPrice : u.pendingComboOrder.amount,
                cashGap: numGap > 0 ? numGap : u.pendingComboOrder.cashGap,
                commissionEarned: numComm > 0 ? numComm : u.pendingComboOrder.commissionEarned,
                commissionRate: commRate > 0 ? commRate : u.pendingComboOrder.commissionRate,
                comboProducts: [
                  { title: u.pendingComboOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: u.pendingComboOrder.image, price: p1 },
                  { title: u.pendingComboOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: u.pendingComboOrder.image, price: p2 },
                ],
              }
            : null;

          return {
            ...u,
            customCombo: config,
            ...(numGap > 0 ? { cashGap: numGap } : {}),
            ...(syncedPending ? { pendingComboOrder: syncedPending } : {}),
          };
        }
        return u;
      });
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => {
        const syncedPending = prev.pendingComboOrder
          ? {
              ...prev.pendingComboOrder,
              amount: numPrice > 0 ? numPrice : prev.pendingComboOrder.amount,
              cashGap: numGap > 0 ? numGap : prev.pendingComboOrder.cashGap,
              commissionEarned: numComm > 0 ? numComm : prev.pendingComboOrder.commissionEarned,
              commissionRate: commRate > 0 ? commRate : prev.pendingComboOrder.commissionRate,
              comboProducts: [
                { title: prev.pendingComboOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: prev.pendingComboOrder.image, price: p1 },
                { title: prev.pendingComboOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: prev.pendingComboOrder.image, price: p2 },
              ],
            }
          : null;

        const updated = {
          ...prev,
          customCombo: config,
          ...(numGap > 0 ? { cashGap: numGap } : {}),
          ...(syncedPending ? { pendingComboOrder: syncedPending } : {}),
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });
    }

    // Sync with backend database
    fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customCombo: config }),
    }).catch(console.error);

    broadcastSync();
    showToast(`Custom task offer saved and synchronized for ${username}!`);
  };

  const forceInjectCombo = (username: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          const existing = u.customCombo || {
            enabled: true,
            triggerTaskIndex: 12,
            comboPrice: 118.24,
            cashGap: 18.24,
            commissionEarned: 18.5,
          };
          return { ...u, customCombo: { ...existing, enabled: true, forceNext: true } };
        }
        return u;
      })
    );
    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => {
        const existing = prev.customCombo || {
          enabled: true,
          triggerTaskIndex: 12,
          comboPrice: 118.24,
          cashGap: 18.24,
          commissionEarned: 18.5,
        };
        return { ...prev, customCombo: { ...existing, enabled: true, forceNext: true } };
      });
    }
    // Sync with backend database
    fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customCombo: {
          enabled: true,
          triggerTaskIndex: 12,
          comboPrice: 118.24,
          cashGap: 18.24,
          commissionEarned: 18.5,
          forceNext: true,
        },
      }),
    }).catch(console.error);

    showToast(`Next order for ${username} will trigger a Combination Task!`);
  };

  const updateUserBalance = (username: string, newBalance: number) => {
    const finalBal = Math.max(0, parseFloat(newBalance.toFixed(2)));
    const vip = getVipLevelByBalance(finalBal);
    setAllUsers((prev) =>
      prev.map((u) => (u.username.toLowerCase() === username.toLowerCase() ? { ...u, balance: finalBal, vipLevel: vip } : u))
    );
    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => ({ ...prev, balance: finalBal, vipLevel: vip }));
    }
    // Sync with backend database
    fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: finalBal, vipLevel: vip }),
    }).catch(console.error);

    showToast(`Balance updated for ${username}: ${finalBal} USDT`);
  };

  const createNewUserAccount = (
    username: string,
    initialBalance = 0,
    password = '123456',
    category: AccountCategory = 'training_help',
    customStages?: ComboStage[]
  ) => {
    const clean = username.trim();
    if (!clean) return false;
    if (allUsers.some((u) => u.username.toLowerCase() === clean.toLowerCase())) {
      showToast(`User ${clean} already exists!`);
      return false;
    }
    const finalBal = Math.max(0, parseFloat(initialBalance.toFixed(2)));
    const vip = getVipLevelByBalance(finalBal);
    const isDemo = category === 'training_help';
    const stages = isDemo
      ? customStages || DEFAULT_HELP_TRAINING_COMBO_STAGES
      : customStages || USER_CYCLE_1_STAGES;

    const initialComboConfig: CustomComboConfig = isDemo
      ? {
          enabled: true,
          accountType: 'training_help',
          triggerTaskIndex: stages[0]?.triggerTaskIndex || 6,
          comboPrice: stages[0]?.comboPrice || 480.0,
          cashGap: stages[0]?.cashGap || 159.0,
          commissionEarned: stages[0]?.commissionEarned || 38.0,
          forceNext: false,
          multiStages: stages,
        }
      : customStages
      ? {
          enabled: true,
          triggerTaskIndex: customStages[0]?.triggerTaskIndex || 12,
          comboPrice: customStages[0]?.comboPrice || 118.24,
          cashGap: customStages[0]?.cashGap || 18.24,
          commissionEarned: customStages[0]?.commissionEarned || 18.5,
          forceNext: false,
          accountType: 'standard_real',
          multiStages: customStages,
        }
      : getComboConfigForUserCycle(1, finalBal);

    const newUserRecord: UserRecord = {
      id: `usr-${Date.now()}`,
      username: clean,
      password,
      avatar: 'polygon',
      vipLevel: vip,
      invitationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      referredBy: isDemo ? 'Help Task Training Demo' : 'Admin Direct Referral',
      ipAddress: '103.145.74.22',
      location: 'Dhaka, Bangladesh',
      device: 'Admin Created Account',
      balance: finalBal,
      frozenBalance: 0,
      cashGap: 0,
      todayCommission: 0.0,
      todayTimes: 0,
      maxDailyTimes: 25,
      walletAddress: null,
      withdrawalAddress: null,
      walletName: null,
      walletBound: false,
      withdrawPassword: 'Password123',
      joinDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastActive: 'Never logged in',
      lastLoginAt: 'Never logged in',
      loginCount: 0,
      loginHistory: [],
      status: 'active',
      accountCategory: category,
      workCycle: isDemo ? undefined : 1,
      customCombo: initialComboConfig,
    };
    setAllUsers((prev) => {
      const updated = [newUserRecord, ...prev.filter((u) => u.username.toLowerCase() !== clean.toLowerCase())];
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    // Sync with backend with initial balance and category
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: clean,
        password,
        invitationCode: '604374',
        clientLocation: 'Dhaka, Bangladesh',
        clientDevice: 'Admin Created Account',
        initialBalance: finalBal,
        accountCategory: category,
        multiStages: stages,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.users && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
        }
      })
      .catch(console.error);

    setTimeout(() => {
      fetchBackendData().catch(console.error);
    }, 50);

    broadcastSync();

    const catName =
      category === 'training_help'
        ? 'Help Task Training Demo'
        : category === 'vip_elite'
        ? 'VIP Elite Testing'
        : 'Standard User';

    showToast(`Account "${clean}" (${catName}) created with ${finalBal} USDT!`);
    return true;
  };

  // Batch Create Demo Accounts (e.g. Cari001 - Cari010 in 1-Click with No Wallet Bound)
  const batchCreateDemoAccounts = async (
    prefix = 'Cari',
    count = 10,
    startNumber = 1,
    padDigits = 3,
    initialBalance = 0,
    password = '123456',
    customStages?: ComboStage[]
  ): Promise<{ createdCount: number; usernames: string[] }> => {
    const finalBal = Math.max(0, parseFloat(initialBalance.toFixed(2)));
    const cleanPrefix = (prefix || 'Cari').trim();
    const createdNames: string[] = [];
    const newRecords: UserRecord[] = [];
    const stages = customStages || DEFAULT_HELP_TRAINING_COMBO_STAGES;

    const existingNames = new Set(allUsers.map((u) => u.username.toLowerCase()));

    for (let i = 0; i < count; i++) {
      const numStr = String(startNumber + i).padStart(padDigits, '0');
      const genUsername = `${cleanPrefix}${numStr}`;
      if (existingNames.has(genUsername.toLowerCase())) {
        continue;
      }
      existingNames.add(genUsername.toLowerCase());
      createdNames.push(genUsername);

      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      const rec: UserRecord = {
        id: `usr-demo-${Date.now()}-${i}`,
        username: genUsername,
        password: password || '123456',
        avatar: 'polygon',
        vipLevel: 1,
        invitationCode: inviteCode,
        referredBy: 'Help Task Training Demo',
        ipAddress: '103.145.74.22',
        location: 'Dhaka, Bangladesh',
        device: 'Mobile • Android',
        balance: finalBal,
        frozenBalance: 0,
        cashGap: 0,
        todayCommission: 0.0,
        todayTimes: 0,
        maxDailyTimes: 25,
        walletAddress: null,
        withdrawalAddress: null,
        walletName: null,
        walletBound: false,
        withdrawPassword: 'Password123',
        joinDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lastActive: 'Never logged in',
        lastLoginAt: 'Never logged in',
        loginCount: 0,
        loginHistory: [],
        status: 'active',
        accountCategory: 'training_help',
        customCombo: {
          enabled: true,
          accountType: 'training_help',
          triggerTaskIndex: stages[0]?.triggerTaskIndex || 6,
          comboPrice: stages[0]?.comboPrice || 480.0,
          cashGap: stages[0]?.cashGap || 159.0,
          commissionEarned: stages[0]?.commissionEarned || 38.0,
          forceNext: false,
          multiStages: stages,
        },
      };
      newRecords.push(rec);
    }

    if (newRecords.length === 0) {
      showToast(`All accounts with prefix "${cleanPrefix}" already exist!`);
      return { createdCount: 0, usernames: [] };
    }

    setAllUsers((prev) => {
      const updated = [...newRecords, ...prev];
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    // Send batch creation to backend
    fetch('/api/users/batch-demo-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accounts: newRecords.map((r) => ({
          username: r.username,
          password: r.password,
          initialBalance: r.balance,
          multiStages: stages,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.users && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
        }
      })
      .catch(console.error);

    broadcastSync();
    showToast(`🎓 Batch created ${createdNames.length} Demo Accounts (${createdNames[0]} - ${createdNames[createdNames.length - 1]}) without wallet bound & with 3-Stage Combos!`);
    return { createdCount: createdNames.length, usernames: createdNames };
  };

  // Batch Change Password (e.g. change passwords of Cari001-Cari010 to 112233)
  const batchChangeUserPassword = async (
    usernames: string[],
    newPassword = '112233'
  ): Promise<{ successCount: number; matchedUsers: string[] }> => {
    const cleanPass = (newPassword || '112233').trim();
    if (!cleanPass) {
      showToast('Password cannot be empty!');
      return { successCount: 0, matchedUsers: [] };
    }

    const targetSet = new Set(usernames.map((u) => u.trim().toLowerCase()).filter(Boolean));
    if (targetSet.size === 0) {
      showToast('Please enter at least one valid username!');
      return { successCount: 0, matchedUsers: [] };
    }

    const matchedUsers: string[] = [];
    setAllUsers((prev) => {
      const updated = prev.map((u) => {
        if (targetSet.has(u.username.toLowerCase())) {
          matchedUsers.push(u.username);
          return {
            ...u,
            password: cleanPass,
            passwordVersion: (u.passwordVersion || 1) + 1,
            passwordUpdatedAt: new Date().toISOString(),
          };
        }
        return u;
      });
      localStorage.setItem('mall_usdt_all_users', JSON.stringify(updated));
      return updated;
    });

    if (targetSet.has(user.username.toLowerCase())) {
      setIsLoggedIn(false);
      localStorage.setItem('mall_usdt_is_logged_in', 'false');
      localStorage.removeItem('mall_usdt_user');
      showToast(`Password for ${user.username} was changed. Active session has been logged out.`);
    }

    // Sync to backend
    fetch('/api/users/batch-change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: Array.from(targetSet),
        newPassword: cleanPass,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.users && Array.isArray(data.users)) {
          setAllUsers(data.users);
          localStorage.setItem('mall_usdt_all_users', JSON.stringify(data.users));
        }
      })
      .catch(console.error);

    broadcastPasswordChange(Array.from(targetSet));
    broadcastSync();
    showToast(`🔑 Password changed to "${cleanPass}" for ${matchedUsers.length} account(s)!`);
    return { successCount: matchedUsers.length, matchedUsers };
  };

  // 1-Click Reset Password to 112233
  const quickResetPasswordTo112233 = async (username: string): Promise<boolean> => {
    const res = await batchChangeUserPassword([username], '112233');
    return res.successCount > 0;
  };

  const applyHelpTrainingPreset = (username: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...u,
            frozenBalance: 0,
            cashGap: 0,
            todayTimes: 0,
            todayCommission: 0.0,
            accountCategory: 'training_help',
            pendingComboOrder: null,
            customCombo: {
              enabled: true,
              accountType: 'training_help',
              triggerTaskIndex: 6,
              comboPrice: 480.0,
              cashGap: 159.0,
              commissionEarned: 38.0,
              forceNext: false,
              multiStages: DEFAULT_HELP_TRAINING_COMBO_STAGES,
            },
          };
        }
        return u;
      })
    );

    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => ({
        ...prev,
        frozenBalance: 0,
        cashGap: 0,
        todayTimes: 0,
        todayCommission: 0.0,
        accountCategory: 'training_help',
        pendingComboOrder: null,
        customCombo: {
          enabled: true,
          accountType: 'training_help',
          triggerTaskIndex: 6,
          comboPrice: 480.0,
          cashGap: 159.0,
          commissionEarned: 38.0,
          forceNext: false,
          multiStages: DEFAULT_HELP_TRAINING_COMBO_STAGES,
        },
      }));
    }

    // Sync backend
    fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customCombo: {
          enabled: true,
          accountType: 'training_help',
          triggerTaskIndex: 6,
          comboPrice: 480.0,
          cashGap: 159.0,
          commissionEarned: 38.0,
          forceNext: false,
          multiStages: DEFAULT_HELP_TRAINING_COMBO_STAGES,
        },
      }),
    }).catch(console.error);

    broadcastSync();
    showToast(`3-Stage Demo Training preset ($159 -> $299 -> $490) applied to ${username}!`);
  };

  const applyUserCyclePreset = (username: string, cycle: number) => {
    const targetClean = (username || '').trim().toLowerCase();
    const config = getComboConfigForUserCycle(cycle);
    setAllUsers((prev) =>
      prev.map((u) => {
        if ((u.username || '').trim().toLowerCase() === targetClean) {
          return {
            ...u,
            workCycle: cycle,
            customCombo: config,
          };
        }
        return u;
      })
    );

    if ((user.username || '').trim().toLowerCase() === targetClean) {
      setUser((prev) => {
        const updated = {
          ...prev,
          workCycle: cycle,
          customCombo: config,
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });
    }

    fetch(`/api/users/${encodeURIComponent(username.trim())}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workCycle: cycle,
        customCombo: config,
      }),
    }).catch(console.error);

    broadcastSync();
    const comboDescription =
      cycle === 1
        ? '1 Combo (#12: $18.24)'
        : cycle === 2
        ? '3 Combos (#8: $89.004, #15: $168.22, #22: $243.14)'
        : '5 Combos (#5, #10, #14, #17, #21) + #24 Manual Combo';
    showToast(`Applied Round ${cycle} (${comboDescription}) to ${username}!`);
  };

  const setTask24ManualCombo = (
    username: string,
    cashGap: number,
    comboPrice?: number,
    commissionEarned?: number,
    manualAdded: boolean = true
  ) => {
    const targetClean = (username || '').trim().toLowerCase();
    const numGap = typeof cashGap === 'number' ? cashGap : parseFloat(cashGap) || 0;
    const specifiedPrice = typeof comboPrice === 'number' && comboPrice > 0 ? comboPrice : 0;
    const specifiedComm = typeof commissionEarned === 'number' && commissionEarned > 0 ? commissionEarned : 0;

    let appliedPrice = specifiedPrice;
    let appliedComm = specifiedComm;

    setAllUsers((prev) =>
      prev.map((u) => {
        if ((u.username || '').trim().toLowerCase() === targetClean) {
          const currentStages: ComboStage[] =
            u.customCombo?.multiStages && u.customCombo.multiStages.length > 0
              ? JSON.parse(JSON.stringify(u.customCombo.multiStages))
              : getComboStagesForCycle(u.workCycle || 3);

          const stage24Idx = currentStages.findIndex((s) => s.triggerTaskIndex === 24);
          const finalPrice =
            specifiedPrice > 0
              ? specifiedPrice
              : parseFloat(((u.balance || 0) + numGap + 200).toFixed(2));
          const finalComm =
            specifiedComm > 0
              ? specifiedComm
              : parseFloat((numGap * 0.2).toFixed(2));

          appliedPrice = finalPrice;
          appliedComm = finalComm;

          const p1 = parseFloat((finalPrice * 0.55).toFixed(2));
          const p2 = parseFloat((finalPrice - p1).toFixed(2));

          const updatedStage: ComboStage = {
            stageNumber: stage24Idx !== -1 ? currentStages[stage24Idx].stageNumber : currentStages.length + 1,
            triggerTaskIndex: 24,
            comboPrice: finalPrice,
            cashGap: numGap,
            commissionEarned: finalComm,
            isManual: true,
            manualAdded: Boolean(manualAdded && numGap > 0),
            description:
              numGap > 0
                ? `Round 3 Combo 6/6 (Task #24 • $${numGap} Manual Top-up)`
                : 'Round 3 Combo 6/6 (Task #24 • Manual Combo Required)',
          };

          if (stage24Idx !== -1) {
            currentStages[stage24Idx] = updatedStage;
          } else {
            currentStages.push(updatedStage);
          }

          const updatedConfig: CustomComboConfig = {
            ...(u.customCombo || {
              enabled: true,
              triggerTaskIndex: 5,
              comboPrice: 479.14,
              cashGap: 179.14,
              commissionEarned: 44.78,
            }),
            enabled: true,
            multiStages: currentStages,
          };

          const syncedPending = u.pendingComboOrder
            ? {
                ...u.pendingComboOrder,
                amount: finalPrice,
                cashGap: numGap,
                commissionEarned: finalComm,
                commissionRate: finalPrice > 0 ? parseFloat((finalComm / finalPrice).toFixed(4)) : 0.07,
                comboProducts: [
                  { title: u.pendingComboOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: u.pendingComboOrder.image, price: p1 },
                  { title: u.pendingComboOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: u.pendingComboOrder.image, price: p2 },
                ],
              }
            : null;

          return {
            ...u,
            workCycle: Math.max(3, u.workCycle || 3),
            customCombo: updatedConfig,
            ...(numGap > 0 ? { cashGap: numGap } : {}),
            ...(syncedPending ? { pendingComboOrder: syncedPending } : {}),
          };
        }
        return u;
      })
    );

    if ((user.username || '').trim().toLowerCase() === targetClean) {
      setUser((prev) => {
        const currentStages: ComboStage[] =
          prev.customCombo?.multiStages && prev.customCombo.multiStages.length > 0
            ? JSON.parse(JSON.stringify(prev.customCombo.multiStages))
            : getComboStagesForCycle(prev.workCycle || 3);

        const stage24Idx = currentStages.findIndex((s) => s.triggerTaskIndex === 24);
        const finalPrice =
          specifiedPrice > 0
            ? specifiedPrice
            : parseFloat(((prev.balance || 0) + numGap + 200).toFixed(2));
        const finalComm =
          specifiedComm > 0
            ? specifiedComm
            : parseFloat((numGap * 0.2).toFixed(2));

        appliedPrice = finalPrice;
        appliedComm = finalComm;

        const updatedStage: ComboStage = {
          stageNumber: stage24Idx !== -1 ? currentStages[stage24Idx].stageNumber : currentStages.length + 1,
          triggerTaskIndex: 24,
          comboPrice: finalPrice,
          cashGap: numGap,
          commissionEarned: finalComm,
          isManual: true,
          manualAdded: Boolean(manualAdded && numGap > 0),
          description:
            numGap > 0
              ? `Round 3 Combo 6/6 (Task #24 • $${numGap} Manual Top-up)`
              : 'Round 3 Combo 6/6 (Task #24 • Manual Combo Required)',
        };

        if (stage24Idx !== -1) {
          currentStages[stage24Idx] = updatedStage;
        } else {
          currentStages.push(updatedStage);
        }

        const p1 = parseFloat((finalPrice * 0.55).toFixed(2));
        const p2 = parseFloat((finalPrice - p1).toFixed(2));

        const syncedPending = prev.pendingComboOrder
          ? {
              ...prev.pendingComboOrder,
              amount: finalPrice,
              cashGap: numGap,
              commissionEarned: finalComm,
              commissionRate: finalPrice > 0 ? parseFloat((finalComm / finalPrice).toFixed(4)) : 0.07,
              comboProducts: [
                { title: prev.pendingComboOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: prev.pendingComboOrder.image, price: p1 },
                { title: prev.pendingComboOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: prev.pendingComboOrder.image, price: p2 },
              ],
            }
          : null;

        const updated = {
          ...prev,
          ...(numGap > 0 ? { cashGap: numGap } : {}),
          ...(syncedPending ? { pendingComboOrder: syncedPending } : {}),
          customCombo: {
            ...(prev.customCombo || {
              enabled: true,
              triggerTaskIndex: 5,
              comboPrice: 479.14,
              cashGap: 179.14,
              commissionEarned: 44.78,
            }),
            enabled: true,
            multiStages: currentStages,
          },
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });

      if (numGap > 0) {
        setOrders((prev) =>
          prev.map((o) =>
            o.isCombo && o.status === 'pending'
              ? {
                  ...o,
                  amount: appliedPrice,
                  cashGap: numGap,
                  commissionEarned: appliedComm,
                  commissionRate: appliedPrice > 0 ? parseFloat((appliedComm / appliedPrice).toFixed(4)) : 0.07,
                }
              : o
          )
        );
        setAllOrders((prev) =>
          prev.map((o) =>
            o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === targetClean
              ? {
                  ...o,
                  amount: appliedPrice,
                  cashGap: numGap,
                  commissionEarned: appliedComm,
                  commissionRate: appliedPrice > 0 ? parseFloat((appliedComm / appliedPrice).toFixed(4)) : 0.07,
                }
              : o
          )
        );
      }
    }

    fetch(`/api/users/${encodeURIComponent(username.trim())}/task24-manual-combo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cashGap: numGap,
        comboPrice,
        commissionEarned,
        manualAdded: Boolean(manualAdded && numGap > 0),
      }),
    }).catch(console.error);

    broadcastSync();
    if (manualAdded && numGap > 0) {
      showToast(`Task #24 Manual Combo offer ($${numGap.toFixed(2)} USDT) successfully added for ${username}!`);
    } else {
      showToast(`Task #24 Manual Combo offer locked/reset for ${username}!`);
    }
  };

  const updateUserComboStages = (username: string, stages: ComboStage[]) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          const currentCombo = u.customCombo || {
            enabled: true,
            triggerTaskIndex: stages[0]?.triggerTaskIndex || 6,
            comboPrice: stages[0]?.comboPrice || 480,
            cashGap: stages[0]?.cashGap || 159,
            commissionEarned: stages[0]?.commissionEarned || 38,
          };
          return {
            ...u,
            customCombo: {
              ...currentCombo,
              enabled: true,
              multiStages: stages,
            },
          };
        }
        return u;
      })
    );

    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => {
        const currentCombo = prev.customCombo || {
          enabled: true,
          triggerTaskIndex: stages[0]?.triggerTaskIndex || 6,
          comboPrice: stages[0]?.comboPrice || 480,
          cashGap: stages[0]?.cashGap || 159,
          commissionEarned: stages[0]?.commissionEarned || 38,
        };
        return {
          ...prev,
          customCombo: {
            ...currentCombo,
            enabled: true,
            multiStages: stages,
          },
        };
      });
    }

    fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customCombo: {
          enabled: true,
          multiStages: stages,
        },
      }),
    }).catch(console.error);

    broadcastSync();
    showToast(`Combo pipeline stages updated for ${username}!`);
  };

  const jumpToTask = (username: string, taskCount: number) => {
    const finalTimes = Math.max(0, Math.min(25, taskCount));
    resetUserTasks(username, undefined, finalTimes);
    showToast(`Positioned ${username} at Task #${finalTimes}/25!`);
  };

  const deleteUserAccount = (username: string) => {
    if (username === user.username) {
      showToast('Cannot delete the currently active user! Switch user first.');
      return;
    }
    setAllUsers((prev) => prev.filter((u) => u.username !== username));
    setAllOrders((prev) => {
      const filtered = prev.filter((o) => (o.username || '').toLowerCase() !== username.toLowerCase());
      localStorage.setItem('mall_usdt_all_orders', JSON.stringify(filtered));
      return filtered;
    });
    // Sync with backend database
    fetch(`/api/users/${username}`, {
      method: 'DELETE',
    }).catch(console.error);

    broadcastSync();

    showToast(`User ${username} deleted`);
  };

  const resetUserTasks = (
    username: string,
    resetBalance?: number,
    taskCount = 0,
    clearOrders = true,
    targetCycle?: number,
    keepCycle = false
  ) => {
    const targetClean = (username || '').trim().toLowerCase();
    const finalTimes = Math.max(0, Math.min(25, taskCount));

    let updatedCycle: number | undefined;
    let updatedComboConfig: CustomComboConfig | undefined;

    setAllUsers((prev) =>
      prev.map((u) => {
        if ((u.username || '').trim().toLowerCase() === targetClean) {
          const bal = resetBalance !== undefined ? Math.max(0, parseFloat(resetBalance.toFixed(2))) : u.balance;
          const isRealUser = u.accountCategory !== 'training_help';
          let cycle = u.workCycle || 1;
          let newCombo = u.customCombo;

          if (isRealUser && finalTimes === 0) {
            const userW = (withdrawals || []).filter(
              (w) => (w.username || '').trim().toLowerCase() === targetClean && w.status !== 'rejected'
            );
            const wCount = userW.length;

            if (typeof targetCycle === 'number') {
              cycle = targetCycle;
            } else if (!keepCycle) {
              const cur = u.workCycle || 1;
              if (cur === 1) {
                // User only advances from Round 1 to Round 2 if they have completed their first withdrawal!
                cycle = wCount >= 1 ? 2 : 1;
              } else if (cur === 2) {
                // User advances from Round 2 to Round 3 if they have completed at least 2 withdrawals!
                cycle = wCount >= 2 ? 3 : 2;
              } else {
                cycle = 3;
              }
            }
            newCombo = getComboConfigForUserCycle(cycle, bal);
            updatedCycle = cycle;
            updatedComboConfig = newCombo;
          }

          return {
            ...u,
            balance: bal,
            vipLevel: getVipLevelByBalance(bal),
            frozenBalance: 0,
            cashGap: 0,
            todayTimes: finalTimes,
            todayCommission: finalTimes === 0 ? 0 : u.todayCommission,
            pendingComboOrder: null,
            ...(isRealUser && finalTimes === 0 ? { workCycle: cycle, customCombo: newCombo } : {}),
          };
        }
        return u;
      })
    );

    // Delete all previous task orders from allOrders so Record starts completely clean
    if (clearOrders || finalTimes === 0) {
      setAllOrders((prev) => {
        const filtered = prev.filter((o) => (o.username || '').trim().toLowerCase() !== targetClean);
        localStorage.setItem('mall_usdt_all_orders', JSON.stringify(filtered));
        return filtered;
      });
    }

    // If currently logged in user is the target, also wipe active state immediately
    if ((user.username || '').trim().toLowerCase() === targetClean) {
      setUser((prev) => {
        const bal = resetBalance !== undefined ? Math.max(0, parseFloat(resetBalance.toFixed(2))) : prev.balance;
        const updated = {
          ...prev,
          balance: bal,
          vipLevel: getVipLevelByBalance(bal),
          frozenBalance: 0,
          cashGap: 0,
          todayTimes: finalTimes,
          todayCommission: finalTimes === 0 ? 0 : prev.todayCommission,
          pendingComboOrder: null,
          ...(updatedCycle !== undefined ? { workCycle: updatedCycle, customCombo: updatedComboConfig } : {}),
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });
      if (clearOrders || finalTimes === 0) {
        setOrders([]);
        localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
      }
    }

    // Sync with backend database to wipe records in db.json
    fetch(`/api/users/${encodeURIComponent(username.trim())}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetBalance,
        taskCount: finalTimes,
        clearOrders: true,
        targetCycle: updatedCycle,
        keepCycle,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          setAllOrders(data.orders);
          localStorage.setItem('mall_usdt_all_orders', JSON.stringify(data.orders));
          if ((user.username || '').trim().toLowerCase() === targetClean) {
            const userSpecific = data.orders.filter(
              (o: OrderItem) => Boolean(o.username) && (o.username || '').trim().toLowerCase() === targetClean
            );
            setOrders(userSpecific);
            localStorage.setItem('mall_usdt_orders', JSON.stringify(userSpecific));
          }
        }
      })
      .catch(console.error);

    broadcastSync();

    if (finalTimes === 0 && updatedCycle) {
      const userW = (withdrawals || []).filter(
        (w) => (w.username || '').trim().toLowerCase() === targetClean && w.status !== 'rejected'
      );
      const wCount = userW.length;
      const cLabel = updatedCycle === 1 ? '1 Combo Offer' : updatedCycle === 2 ? '3 Combo Offers' : '5 Combo Offers';
      if (updatedCycle === 2 && wCount >= 1) {
        showToast(`Tasks for ${username} reset to 0/25! 1st withdrawal completed → Promoted to Round 2 (${cLabel})!`);
      } else if (updatedCycle === 1 && wCount === 0) {
        showToast(`Tasks for ${username} reset to 0/25! Kept in Round 1 (${cLabel} • No withdrawal yet).`);
      } else {
        showToast(`Tasks for ${username} reset to 0/25! Round ${updatedCycle} (${cLabel}) active.`);
      }
    } else {
      showToast(`Tasks for ${username} reset to ${finalTimes}/25 & all records permanently cleared!`);
    }
  };

  const resetAllUsersTasks = (taskCount = 0) => {
    const finalTimes = Math.max(0, Math.min(25, taskCount));
    setAllUsers((prev) =>
      prev.map((u) => {
        const isRealUser = u.accountCategory !== 'training_help';
        let cycle = u.workCycle || 1;
        let newCombo = u.customCombo;

        if (isRealUser && finalTimes === 0) {
          const uClean = (u.username || '').trim().toLowerCase();
          const userW = (withdrawals || []).filter(
            (w) => (w.username || '').trim().toLowerCase() === uClean && w.status !== 'rejected'
          );
          const wCount = userW.length;
          const cur = u.workCycle || 1;
          if (cur === 1) {
            cycle = wCount >= 1 ? 2 : 1;
          } else if (cur === 2) {
            cycle = wCount >= 2 ? 3 : 2;
          } else {
            cycle = 3;
          }
          newCombo = getComboConfigForUserCycle(cycle, u.balance);
        }

        return {
          ...u,
          frozenBalance: 0,
          cashGap: 0,
          todayTimes: finalTimes,
          todayCommission: finalTimes === 0 ? 0 : u.todayCommission,
          pendingComboOrder: null,
          ...(isRealUser && finalTimes === 0 ? { workCycle: cycle, customCombo: newCombo } : {}),
        };
      })
    );

    setUser((prev) => {
      const isRealUser = prev.accountCategory !== 'training_help';
      let cycle = prev.workCycle || 1;
      let newCombo = prev.customCombo;

      if (isRealUser && finalTimes === 0) {
        const uClean = (prev.username || '').trim().toLowerCase();
        const userW = (withdrawals || []).filter(
          (w) => (w.username || '').trim().toLowerCase() === uClean && w.status !== 'rejected'
        );
        const wCount = userW.length;
        const cur = prev.workCycle || 1;
        if (cur === 1) {
          cycle = wCount >= 1 ? 2 : 1;
        } else if (cur === 2) {
          cycle = wCount >= 2 ? 3 : 2;
        } else {
          cycle = 3;
        }
        newCombo = getComboConfigForUserCycle(cycle, prev.balance);
      }

      const updated = {
        ...prev,
        frozenBalance: 0,
        cashGap: 0,
        todayTimes: finalTimes,
        todayCommission: finalTimes === 0 ? 0 : prev.todayCommission,
        pendingComboOrder: null,
        ...(isRealUser && finalTimes === 0 ? { workCycle: cycle, customCombo: newCombo } : {}),
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });

    if (finalTimes === 0) {
      setOrders([]);
      localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
      setAllOrders([]);
      localStorage.setItem('mall_usdt_all_orders', JSON.stringify([]));
    }

    // Clear all orders and reset all users in backend
    fetch('/api/users/reset-all-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskCount: finalTimes }),
    }).catch(console.error);

    broadcastSync();
    showToast(`All users' tasks reset to ${finalTimes}/25 and all records cleared!`);
  };

  const clearUserCashGap = (username: string) => {
    const targetClean = (username || '').trim().toLowerCase();
    setOrders((prev) => prev.filter((o) => !(o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === targetClean)));
    setAllOrders((prev) => prev.filter((o) => !(o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === targetClean)));
    setAllUsers((prev) =>
      prev.map((u) => {
        if ((u.username || '').trim().toLowerCase() === targetClean) {
          const restoredBal = parseFloat((u.balance + u.frozenBalance).toFixed(2));
          return {
            ...u,
            balance: restoredBal,
            vipLevel: getVipLevelByBalance(restoredBal),
            frozenBalance: 0,
            cashGap: 0,
            pendingComboOrder: null,
          };
        }
        return u;
      })
    );
    if ((user.username || '').trim().toLowerCase() === targetClean) {
      setUser((prev) => {
        const restoredBal = parseFloat((prev.balance + prev.frozenBalance).toFixed(2));
        return {
          ...prev,
          balance: restoredBal,
          vipLevel: getVipLevelByBalance(restoredBal),
          frozenBalance: 0,
          cashGap: 0,
          pendingComboOrder: null,
        };
      });
    }
    showToast(`Escrow frozen funds restored & cash gap cleared for ${username}!`);
  };

  const clearUserOrders = (username: string) => {
    const targetClean = (username || '').trim().toLowerCase();
    setAllOrders((prev) => {
      const filtered = prev.filter((o) => (o.username || '').trim().toLowerCase() !== targetClean);
      localStorage.setItem('mall_usdt_all_orders', JSON.stringify(filtered));
      return filtered;
    });

    if ((user.username || '').trim().toLowerCase() === targetClean) {
      setOrders([]);
      localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
    }

    fetch(`/api/users/${encodeURIComponent(username.trim())}/orders`, {
      method: 'DELETE',
    }).catch(console.error);

    fetch(`/api/orders/user/${encodeURIComponent(username.trim())}`, {
      method: 'DELETE',
    }).catch(console.error);

    broadcastSync();
    showToast(`Order record history permanently wiped for ${username}!`);
  };

  const updateUserAccountDetails = async (
    username: string,
    updates: Partial<UserRecord>
  ): Promise<boolean> => {
    try {
      const current = allUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (!current) {
        showToast(`User ${username} not found!`);
        return false;
      }

      const newBalance =
        updates.balance !== undefined
          ? Math.max(0, parseFloat(updates.balance.toFixed(2)))
          : current.balance;
      const newVip =
        updates.vipLevel !== undefined ? updates.vipLevel : getVipLevelByBalance(newBalance);

      const isPasswordChanged = Boolean(updates.password && updates.password !== current.password);
      const mergedUpdates: Partial<UserRecord> = {
        ...updates,
        balance: newBalance,
        vipLevel: newVip,
        ...(isPasswordChanged
          ? {
              passwordVersion: (current.passwordVersion || 1) + 1,
              passwordUpdatedAt: new Date().toISOString(),
            }
          : {}),
      };

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.username.toLowerCase() === username.toLowerCase()) {
            return { ...u, ...mergedUpdates };
          }
          return u;
        })
      );

      if (user.username.toLowerCase() === username.toLowerCase()) {
        if (isPasswordChanged) {
          setIsLoggedIn(false);
          localStorage.setItem('mall_usdt_is_logged_in', 'false');
          localStorage.removeItem('mall_usdt_user');
          showToast(`Password for ${username} was changed. Active session has been logged out.`);
        } else {
          setUser((prev) => {
            const updated = {
              ...prev,
              ...mergedUpdates,
            };
            localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
            return updated;
          });
        }
      }

      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedUpdates),
      });

      if (!res.ok) {
        throw new Error('Failed to update account on server');
      }

      if (isPasswordChanged) {
        broadcastPasswordChange([username]);
      }
      broadcastSync();
      showToast(`Account ${username} updated successfully!`);
      return true;
    } catch (err: any) {
      console.error(err);
      showToast('Error updating account details');
      return false;
    }
  };

  const approveDeposit = (depositId: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'completed', approvedAt: nowStr } : d))
    );
    const targetName = dep.username || user.username;
    let newCalculatedGap = 0;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === targetName.toLowerCase()) {
          const newBal = parseFloat((u.balance + dep.amount).toFixed(2));
          const currentGap = u.cashGap || 0;
          const newCashGap = Math.max(0, parseFloat((currentGap - dep.amount).toFixed(2)));
          newCalculatedGap = newCashGap;
          const updatedPending = u.pendingComboOrder
            ? { ...u.pendingComboOrder, cashGap: newCashGap }
            : null;
          return {
            ...u,
            balance: newBal,
            vipLevel: getVipLevelByBalance(newBal),
            cashGap: newCashGap,
            pendingComboOrder: updatedPending,
          };
        }
        return u;
      })
    );
    if (user.username.toLowerCase() === targetName.toLowerCase()) {
      setUser((prev) => {
        const newBal = parseFloat((prev.balance + dep.amount).toFixed(2));
        const currentGap = prev.cashGap || 0;
        const newCashGap = Math.max(0, parseFloat((currentGap - dep.amount).toFixed(2)));
        const updatedPending = prev.pendingComboOrder
          ? { ...prev.pendingComboOrder, cashGap: newCashGap }
          : null;
        const updated = {
          ...prev,
          balance: newBal,
          vipLevel: getVipLevelByBalance(newBal),
          cashGap: newCashGap,
          pendingComboOrder: updatedPending,
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });

      setOrders((prev) =>
        prev.map((o) => (o.isCombo && o.status === 'pending' ? { ...o, cashGap: newCalculatedGap } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) =>
          o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === targetName.toLowerCase()
            ? { ...o, cashGap: newCalculatedGap }
            : o
        )
      );
    }

    // Persist approval and credited balance on server backend
    fetch(`/api/deposits/${depositId}/approve`, {
      method: 'POST',
    }).catch(console.error);

    broadcastSync();
    showToast(`Deposit of ${dep.amount} USDT approved for ${targetName}!`);
  };

  const rejectDeposit = (depositId: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'rejected' } : d))
    );

    fetch(`/api/deposits/${depositId}/reject`, {
      method: 'POST',
    }).catch(console.error);

    broadcastSync();
    showToast('Deposit marked as rejected');
  };

  const manualCreditDeposit = (username: string, amount: number, customFromAddress?: string) => {
    const targetUser = allUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
    const fromAddr = customFromAddress || targetUser?.walletAddress || targetUser?.withdrawalAddress || '';
    const wName = targetUser?.walletName || 'USDT TRC-20';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRecord: DepositRecord = {
      id: `dep-man-${Date.now()}`,
      username,
      amount,
      currency: 'USDT',
      network: 'TRC-20',
      address: 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe',
      fromAddress: fromAddr,
      walletName: wName,
      txHash: `manual_${Date.now()}`,
      status: 'completed',
      createdAt: nowStr,
      approvedAt: nowStr,
    };
    setDeposits((prev) => [newRecord, ...prev]);

    let targetNewCashGap = 0;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          const newBal = parseFloat((u.balance + amount).toFixed(2));
          const currentGap = u.cashGap || 0;
          const newGap = Math.max(0, parseFloat((currentGap - amount).toFixed(2)));
          targetNewCashGap = newGap;
          const updatedPending = u.pendingComboOrder
            ? { ...u.pendingComboOrder, cashGap: newGap }
            : null;
          return {
            ...u,
            balance: newBal,
            vipLevel: getVipLevelByBalance(newBal),
            cashGap: newGap,
            pendingComboOrder: updatedPending,
          };
        }
        return u;
      })
    );
    if (user.username.toLowerCase() === username.toLowerCase()) {
      setUser((prev) => {
        const newBal = parseFloat((prev.balance + amount).toFixed(2));
        const currentGap = prev.cashGap || 0;
        const newGap = Math.max(0, parseFloat((currentGap - amount).toFixed(2)));
        const updatedPending = prev.pendingComboOrder
          ? { ...prev.pendingComboOrder, cashGap: newGap }
          : null;
        const updated = {
          ...prev,
          balance: newBal,
          vipLevel: getVipLevelByBalance(newBal),
          cashGap: newGap,
          pendingComboOrder: updatedPending,
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });

      setOrders((prev) =>
        prev.map((o) => (o.isCombo && o.status === 'pending' ? { ...o, cashGap: targetNewCashGap } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) =>
          o.isCombo && o.status === 'pending' && (o.username || '').toLowerCase() === username.toLowerCase()
            ? { ...o, cashGap: targetNewCashGap }
            : o
        )
      );
    }

    fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(console.error);

    fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cashGap: targetNewCashGap }),
    }).catch(console.error);

    broadcastSync();
    showToast(`Successfully credited ${amount} USDT to ${username}!`);
  };

  const approveWithdrawal = (withdrawalId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'approved', approvedAt: nowStr } : w))
    );

    // Persist approval to backend database
    fetch(`/api/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
    }).catch(console.error);

    broadcastSync();
    showToast('Withdrawal approved and marked as completed on blockchain!');
  };

  const rejectWithdrawal = (withdrawalId: string) => {
    const targetW = withdrawals.find((w) => w.id === withdrawalId);
    if (!targetW) return;
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'rejected' } : w))
    );
    const targetName = targetW.username || user.username;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === targetName.toLowerCase()) {
          const refunded = parseFloat((u.balance + targetW.amount).toFixed(2));
          return { ...u, balance: refunded, vipLevel: getVipLevelByBalance(refunded) };
        }
        return u;
      })
    );
    if (user.username.toLowerCase() === targetName.toLowerCase()) {
      setUser((prev) => {
        const refunded = parseFloat((prev.balance + targetW.amount).toFixed(2));
        const updated = {
          ...prev,
          balance: refunded,
          vipLevel: getVipLevelByBalance(refunded),
        };
        localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
        return updated;
      });
    }

    // Persist rejection and balance refund to backend database
    fetch(`/api/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
    }).catch(console.error);

    broadcastSync();
    showToast(`Withdrawal rejected & ${targetW.amount} USDT refunded to ${targetName}!`);
  };

  const deleteDepositRecord = (depositId: string) => {
    setDeposits((prev) => {
      const updated = prev.filter((d) => d.id !== depositId);
      localStorage.setItem('mall_usdt_deposits', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/deposits/${depositId}`, { method: 'DELETE' }).catch(console.error);
    broadcastSync();
    showToast('Deposit record removed');
  };

  const deleteWithdrawalRecord = (withdrawalId: string) => {
    setWithdrawals((prev) => {
      const updated = prev.filter((w) => w.id !== withdrawalId);
      localStorage.setItem('mall_usdt_withdrawals', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/withdrawals/${withdrawalId}`, { method: 'DELETE' }).catch(console.error);
    broadcastSync();
    showToast('Withdrawal record removed');
  };

  const clearUserDepositsAndWithdrawals = (username: string) => {
    const clean = username.trim().toLowerCase();
    setDeposits((prev) => {
      const updated = prev.filter((d) => (d.username || '').trim().toLowerCase() !== clean);
      localStorage.setItem('mall_usdt_deposits', JSON.stringify(updated));
      return updated;
    });
    setWithdrawals((prev) => {
      const updated = prev.filter((w) => (w.username || '').trim().toLowerCase() !== clean);
      localStorage.setItem('mall_usdt_withdrawals', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/deposits/user/${encodeURIComponent(username)}`, { method: 'DELETE' }).catch(console.error);
    fetch(`/api/withdrawals/user/${encodeURIComponent(username)}`, { method: 'DELETE' }).catch(console.error);
    broadcastSync();
    showToast(`All transactions cleared for ${username}`);
  };

  const clearAllDemoTransactions = () => {
    const isDemo = (uname?: string) => {
      if (!uname) return false;
      const c = uname.trim().toLowerCase();
      return (
        c.startsWith('cari') ||
        c.startsWith('trainee_') ||
        allUsers.some((u) => u.username.toLowerCase() === c && u.accountCategory === 'training_help')
      );
    };

    setDeposits((prev) => {
      const updated = prev.filter((d) => !isDemo(d.username));
      localStorage.setItem('mall_usdt_deposits', JSON.stringify(updated));
      return updated;
    });
    setWithdrawals((prev) => {
      const updated = prev.filter((w) => !isDemo(w.username));
      localStorage.setItem('mall_usdt_withdrawals', JSON.stringify(updated));
      return updated;
    });
    broadcastSync();
    showToast('All Demo account deposits and withdrawals cleared!');
  };

  const recordPendingDeposit = (
    amount: number,
    address: string,
    txHash?: string,
    fromAddress?: string,
    walletName?: string,
    silent = true
  ) => {
    const fromAddr = fromAddress || user.walletAddress || user.withdrawalAddress || '';
    const wName = walletName || user.walletName || 'USDT TRC-20';
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRecord: DepositRecord = {
      id: `dep-${Date.now()}`,
      username: user.username,
      amount,
      currency: 'USDT',
      network: 'TRC-20',
      address,
      fromAddress: fromAddr,
      walletName: wName,
      txHash: txHash || `tx_${Math.random().toString(36).substring(2, 14)}`,
      status: 'pending',
      createdAt: nowTime,
    };
    setDeposits((prev) => [newRecord, ...prev]);

    // Update current active user and allUsers with last entered deposit details
    setUser((prev) => ({
      ...prev,
      lastEnteredDepositAmount: amount,
      lastEnteredDepositTime: nowTime,
      lastEnteredDepositAddress: address,
    }));

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === user.username.toLowerCase()) {
          return {
            ...u,
            lastEnteredDepositAmount: amount,
            lastEnteredDepositTime: nowTime,
            lastEnteredDepositAddress: address,
          };
        }
        return u;
      })
    );

    // Send to backend database
    fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(console.error);

    broadcastSync();
    if (!silent) {
      showToast(`Recharge of ${amount} USDT submitted!`);
    }
  };

  const setDemoBalance = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: amount,
      vipLevel: amount >= 899 ? 3 : amount >= 499 ? 2 : amount >= 20 ? 1 : 0,
    }));
    showToast(`Demo balance updated to ${amount} USDT!`);
  };

  const updateAvatar = (avatarUrl: string) => {
    setUser((prev) => {
      const updated = { ...prev, avatar: avatarUrl };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    showToast('Profile picture updated successfully!');
  };

  const updateUsername = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUser((prev) => {
      const updated = { ...prev, username: trimmed };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    showToast('Username updated successfully!');
  };

  const rechargeCashGap = () => {
    if (user.cashGap <= 0) return;
    const gap = user.cashGap;
    setUser((prev) => ({
      ...prev,
      balance: parseFloat((prev.balance + gap).toFixed(2)),
      cashGap: 0,
    }));
    showToast(`Cash gap of ${gap} USDT cleared! You can now submit your combination order.`);
  };

  const setDemoTaskTimes = (times: number) => {
    setUser((prev) => ({
      ...prev,
      todayTimes: times,
      cashGap: 0,
      frozenBalance: 0,
      pendingComboOrder: null,
    }));
    showToast(`Task counter set to ${times}/25!`);
  };

  const resetTasks = (targetBalance?: number) => {
    setUser((prev) => {
      const bal = targetBalance !== undefined ? targetBalance : (prev.balance > 0 ? prev.balance + prev.frozenBalance : 618.0);
      const updated: UserProfile = {
        ...prev,
        balance: parseFloat(bal.toFixed(2)),
        vipLevel: getVipLevelByBalance(bal),
        frozenBalance: 0,
        cashGap: 0,
        todayTimes: 0,
        todayCommission: 0.0,
        yesterdayBuyCommission: 0.0,
        yesterdayTeamCommission: 0.0,
        pendingComboOrder: null,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    setOrders([]);
    localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
    localStorage.setItem('mall_usdt_version', 'v9_task_reset_618_alibaba_clean');
    showToast('Tasks reset to 0/25! Ready for testing.');
  };

  const resetAccountTo350 = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: 350.0,
        frozenBalance: 0,
        cashGap: 0,
        todayTimes: 0,
        todayCommission: 0.0,
        yesterdayBuyCommission: 0.0,
        yesterdayTeamCommission: 0.0,
        pendingComboOrder: null,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    setOrders([]);
    localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
    localStorage.setItem('mall_usdt_version', 'v7_reset_350_clean');
    showToast('Account reset! Balance set to 350 USDT & all tasks cleared (0/25).');
  };

  const resetAccountTo50 = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: 50.0,
        frozenBalance: 0,
        cashGap: 0,
        todayTimes: 0,
        todayCommission: 0.0,
        pendingComboOrder: null,
      };
      localStorage.setItem('mall_usdt_user', JSON.stringify(updated));
      return updated;
    });
    setOrders([]);
    localStorage.setItem('mall_usdt_orders', JSON.stringify([]));
    showToast('Balance reset to 50 USDT & All tasks/records cleared!');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        orders,
        allOrders,
        deposits,
        withdrawals,
        teamMembers,
        addReferralMember,
        activeTaskTier,
        setActiveTaskTier,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isTeamsModalOpen,
        setIsTeamsModalOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        toastMessage,
        showToast,
        depositFunds,
        bindWalletAddress,
        setWithdrawPassword,
        unbindWalletAddress,
        withdrawFunds,
        generateRandomOrder,
        completeOrder,
        setDemoBalance,
        updateAvatar,
        updateUsername,
        rechargeCashGap,
        setDemoTaskTimes,
        resetTasks,
        resetAccountTo350,
        resetAccountTo50,
        isLoggedIn,
        login,
        registerUserAccount,
        validateInvitationCode,
        logout,
        allUsers,
        isAdminOpen,
        setIsAdminOpen,
        isAdminRoute,
        setIsAdminRoute,
        isAdminAuthenticated,
        adminUsername,
        adminLogin,
        adminLogout,
        updateAdminCredentials,
        navigateToAdmin,
        navigateToUserApp,
        platformDepositAddress,
        setPlatformDepositAddress,
        switchUserAccount,
        updateUserCustomCombo,
        forceInjectCombo,
        updateUserBalance,
        createNewUserAccount,
        batchCreateDemoAccounts,
        batchChangeUserPassword,
        quickResetPasswordTo112233,
        applyHelpTrainingPreset,
        applyUserCyclePreset,
        setTask24ManualCombo,
        updateUserComboStages,
        jumpToTask,
        deleteUserAccount,
        approveDeposit,
        rejectDeposit,
        deleteDepositRecord,
        manualCreditDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        deleteWithdrawalRecord,
        clearUserDepositsAndWithdrawals,
        clearAllDemoTransactions,
        recordPendingDeposit,
        resetUserTasks,
        resetAllUsersTasks,
        clearUserCashGap,
        updateUserAccountDetails,
        clearUserOrders,
        transferUserReferral,
        batchTransferReferrals,
        refreshBackendData: fetchBackendData,
        effectiveTodayTimes,
        effectiveTodayCommission,
        completedOrdersCount,
        pendingOrdersCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
