import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Users,
  Sliders,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Sparkles,
  DollarSign,
  Clock,
  TrendingUp,
  LogOut,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Zap,
  Activity,
  Award,
  Calendar,
  Wallet,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Key,
  Smartphone,
  Check,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Globe,
  FileText,
  ShoppingBag,
  Edit3,
  Trash2,
  X,
  ArrowRight,
  ArrowRightLeft,
  Share2,
  GitBranch,
  Network,
  Link2,
} from 'lucide-react';
import { useApp, computeReferralTeam, isDemoAccount } from '../context/AppContext';
import { CustomComboConfig, ComboStage, AccountCategory, UserRecord, DepositRecord, WithdrawalRecord, LoginEvent } from '../types';
import { DEFAULT_HELP_TRAINING_COMBO_STAGES } from '../context/AppContext';
import { getComboStagesForCycle } from '../utils/comboPresets';
import { maskWalletAddress } from '../utils/storage';
import { getDepositAddresses, saveDepositAddresses } from '../data/depositAddresses';

export const AdminPanel: React.FC = () => {
  const {
    allUsers,
    deposits,
    withdrawals,
    orders,
    allOrders,
    user: currentUser,
    isAdminRoute,
    isAdminOpen,
    setIsAdminOpen,
    isAdminAuthenticated,
    adminUsername,
    adminLogin,
    adminLogout,
    updateAdminCredentials,
    navigateToUserApp,
    navigateToAdmin,
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
    showToast,
    resetUserTasks,
    resetAllUsersTasks,
    clearUserCashGap,
    updateUserAccountDetails,
    clearUserOrders,
    transferUserReferral,
    batchTransferReferrals,
    refreshBackendData,
  } = useApp();

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const prevUsersCountRef = useRef(allUsers.length);

  // Auto sync on mount and active real-time polling every 1.5 seconds for admin
  useEffect(() => {
    if (isAdminAuthenticated) {
      refreshBackendData().catch(console.error);

      const syncInterval = setInterval(() => {
        refreshBackendData().catch(console.error);
      }, 1500);

      // Listen to cross-tab broadcast for instant updates
      let bc: BroadcastChannel | null = null;
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          bc = new BroadcastChannel('mall_usdt_sync_channel');
          bc.onmessage = () => {
            refreshBackendData().catch(console.error);
          };
        }
      } catch {
        // ignore
      }

      return () => {
        clearInterval(syncInterval);
        if (bc) {
          try {
            bc.close();
          } catch {
            // ignore
          }
        }
      };
    }
  }, [isAdminAuthenticated]);

  // Notify admin when a new user registers in real-time
  useEffect(() => {
    if (allUsers.length > prevUsersCountRef.current) {
      const newestUser = allUsers[0];
      if (newestUser && prevUsersCountRef.current > 0) {
        showToast(`🔔 New User Joined: ${newestUser.username} (${newestUser.location || 'Online'})!`);
      }
    }
    prevUsersCountRef.current = allUsers.length;
  }, [allUsers.length]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshBackendData();
      showToast('✅ Live Database synced! Total: ' + allUsers.length + ' accounts.');
    } catch {
      showToast('Database refresh completed');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Admin Login Form State
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('admin7788');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'demo_accounts' | 'combos' | 'deposits' | 'withdrawals' | 'settings' | 'referrals'
  >('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [demoSearchTerm, setDemoSearchTerm] = useState('');
  const [demoFilter, setDemoFilter] = useState<'all' | 'pending_password' | 'password_done' | 'in_progress' | 'completed_tasks'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Referral Network & Transfer State
  const [transferTargetUser, setTransferTargetUser] = useState<string>('');
  const [transferNewReferrer, setTransferNewReferrer] = useState<string>('');
  const [transferDownlineTogether, setTransferDownlineTogether] = useState<boolean>(true);
  const [batchFromUser, setBatchFromUser] = useState<string>('');
  const [batchToUser, setBatchToUser] = useState<string>('');
  const [referralSearchTerm, setReferralSearchTerm] = useState<string>('');
  const [isProcessingTransfer, setIsProcessingTransfer] = useState<boolean>(false);
  const [quickTransferModalUser, setQuickTransferModalUser] = useState<UserRecord | null>(null);
  const [viewDownlineModalUser, setViewDownlineModalUser] = useState<UserRecord | null>(null);

  // Selected user for custom combo configuration
  const [selectedUsername, setSelectedUsername] = useState<string>(currentUser.username || 'jldfdg180');

  // Custom Combo Form state
  const targetUserRecord = allUsers.find((u) => u.username === selectedUsername) || allUsers[0];
  const [comboEnabled, setComboEnabled] = useState<boolean>(targetUserRecord?.customCombo?.enabled ?? true);
  const [triggerTaskIndex, setTriggerTaskIndex] = useState<number>(targetUserRecord?.customCombo?.triggerTaskIndex ?? 12);
  const [comboPrice, setComboPrice] = useState<string>(targetUserRecord?.customCombo?.comboPrice?.toString() ?? '118.24');
  const [cashGap, setCashGap] = useState<string>(targetUserRecord?.customCombo?.cashGap?.toString() ?? '18.24');
  const [commissionEarned, setCommissionEarned] = useState<string>(targetUserRecord?.customCombo?.commissionEarned?.toString() ?? '18.5');
  
  // 3-Stage Combo Pipeline Editor State for target user
  const [userStages, setUserStages] = useState<ComboStage[]>(() => {
    return targetUserRecord?.customCombo?.multiStages || DEFAULT_HELP_TRAINING_COMBO_STAGES;
  });

  // New User Form Modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddDemoModalOpen, setIsAddDemoModalOpen] = useState(false);
  const [demoCreateTab, setDemoCreateTab] = useState<'batch' | 'single'>('batch');
  const [demoBatchPrefix, setDemoBatchPrefix] = useState('Cari');
  const [demoBatchCount, setDemoBatchCount] = useState('10');
  const [demoBatchStartIndex, setDemoBatchStartIndex] = useState('1');
  const [demoBatchPassword, setDemoBatchPassword] = useState('123456');
  const [demoBatchBalance, setDemoBatchBalance] = useState('0');
  const [demoTraineeName, setDemoTraineeName] = useState(() => `trainee_${Math.floor(100 + Math.random() * 900)}`);
  const [demoInitialBalance, setDemoInitialBalance] = useState('0');

  // Batch Password Change Modal state (to set password to 112233)
  const [isBatchPasswordModalOpen, setIsBatchPasswordModalOpen] = useState(false);
  const [batchPasswordUsernames, setBatchPasswordUsernames] = useState('');
  const [batchNewPassword, setBatchNewPassword] = useState('112233');
  const [isBatchChangingPassword, setIsBatchChangingPassword] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'standard_real' | 'vip_elite'>('all');
  const [newUsername, setNewUsername] = useState('');
  const [newBalance, setNewBalance] = useState('350');
  const [newPassword, setNewPassword] = useState('123456');
  const [newUserCategory, setNewUserCategory] = useState<AccountCategory>('standard_real');

  // Manual Credit Modal state
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditUser, setCreditUser] = useState('');
  const [creditAmount, setCreditAmount] = useState('100');
  const [creditFromAddress, setCreditFromAddress] = useState('');

  // Edit Balance state
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [editingBalanceValue, setEditingBalanceValue] = useState('');

  // Edit Combo Offer state
  const [editingComboUser, setEditingComboUser] = useState<string | null>(null);
  const [editingComboOffer, setEditingComboOffer] = useState('');
  const [editingComboTaskIndex, setEditingComboTaskIndex] = useState('12');

  // Login Activity & Geo Audit Modal state
  const [inspectLoginUser, setInspectLoginUser] = useState<UserRecord | null>(null);
  const [inspectLoginLogs, setInspectLoginLogs] = useState<LoginEvent[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const openLoginAuditModal = async (u: UserRecord) => {
    setInspectLoginUser(u);
    setInspectLoginLogs(u.loginHistory || []);
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(u.username)}/login-history`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.loginHistory)) {
          setInspectLoginLogs(data.loginHistory);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user login history', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleClearUserLoginHistory = async (username: string) => {
    if (!confirm(`Are you sure you want to reset and clear login tracking history for ${username}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/clear-login-history`, {
        method: 'POST',
      });
      if (res.ok) {
        setInspectLoginLogs([]);
        if (inspectLoginUser) {
          setInspectLoginUser({ ...inspectLoginUser, loginCount: 0, loginHistory: [] });
        }
        await refreshBackendData();
        showToast(`Login tracking history reset for ${username}`);
      }
    } catch (err) {
      console.error('Failed to clear login history', err);
    }
  };

  // Helper to determine combo offer details for a user account
  const getComboOfferInfo = (u: UserRecord) => {
    // 1. If user has an active cashGap (e.g. from an active combo or partial deposit)
    if (u.cashGap !== undefined && u.cashGap > 0) {
      let originalOffer = u.cashGap;
      let taskIdx = (u.todayTimes || 0) + 1;
      let isMulti = false;
      let stageNumber = 1;
      let commission = 0;
      let comboPrice = (u.balance || 0) + u.cashGap;

      if (u.customCombo?.multiStages && u.customCombo.multiStages.length > 0) {
        const activeStage =
          u.customCombo.multiStages.find((st) => (u.todayTimes || 0) < st.triggerTaskIndex) ||
          u.customCombo.multiStages[0];
        if (activeStage) {
          originalOffer = activeStage.cashGap;
          taskIdx = activeStage.triggerTaskIndex;
          isMulti = true;
          stageNumber = activeStage.stageNumber;
          commission = activeStage.commissionEarned;
          comboPrice = activeStage.comboPrice;
        }
      } else if (u.customCombo?.cashGap && u.customCombo.cashGap > 0) {
        originalOffer = u.customCombo.cashGap;
        taskIdx = u.customCombo.triggerTaskIndex || 12;
        commission = u.customCombo.commissionEarned || 0;
        comboPrice = u.customCombo.comboPrice || comboPrice;
      } else if (u.pendingComboOrder) {
        originalOffer = u.pendingComboOrder.amount ? Math.max(u.cashGap, (u.pendingComboOrder.amount - (u.balance || 0) + u.cashGap)) : u.cashGap;
        taskIdx = u.pendingComboOrder.taskIndex || taskIdx;
        commission = u.pendingComboOrder.commissionEarned || 0;
        comboPrice = u.pendingComboOrder.amount || comboPrice;
      }

      const depositedSoFar = originalOffer > u.cashGap ? parseFloat((originalOffer - u.cashGap).toFixed(2)) : 0;

      return {
        offer: u.cashGap, // remaining balance needed
        originalOffer,
        depositedSoFar,
        isPartial: depositedSoFar > 0,
        price: comboPrice,
        taskIndex: taskIdx,
        isMulti,
        stageNumber,
        commission,
      };
    }

    // 2. Pending combo order with 0 cash gap (completed recharge, ready to submit)
    if (u.pendingComboOrder) {
      return {
        offer: u.cashGap || 0,
        originalOffer: u.pendingComboOrder.amount || 0,
        depositedSoFar: 0,
        isPartial: false,
        price: u.pendingComboOrder.amount || 0,
        taskIndex: u.pendingComboOrder.taskIndex || (u.todayTimes || 0) + 1,
        isMulti: false,
        stageNumber: 1,
        commission: u.pendingComboOrder.commissionEarned || 0,
      };
    }

    // 3. Multi stages configured
    if (u.customCombo?.multiStages && u.customCombo.multiStages.length > 0) {
      const activeStage =
        u.customCombo.multiStages.find((st) => (u.todayTimes || 0) < st.triggerTaskIndex) ||
        u.customCombo.multiStages[0];
      return {
        offer: activeStage.cashGap,
        originalOffer: activeStage.cashGap,
        depositedSoFar: 0,
        isPartial: false,
        price: activeStage.comboPrice,
        taskIndex: activeStage.triggerTaskIndex,
        isMulti: true,
        stageNumber: activeStage.stageNumber,
        commission: activeStage.commissionEarned,
      };
    }

    // 4. Custom combo configured
    if (u.customCombo && (u.customCombo.enabled || (u.customCombo.cashGap && u.customCombo.cashGap > 0) || (u.customCombo.comboPrice && u.customCombo.comboPrice > 0))) {
      const offerAmount = u.customCombo.cashGap !== undefined && u.customCombo.cashGap > 0
        ? u.customCombo.cashGap
        : (u.customCombo.comboPrice ? Math.max(0, u.customCombo.comboPrice - (u.balance || 0)) : 0);
      return {
        offer: offerAmount,
        originalOffer: offerAmount,
        depositedSoFar: 0,
        isPartial: false,
        price: u.customCombo.comboPrice || 0,
        taskIndex: u.customCombo.triggerTaskIndex || 12,
        isMulti: false,
        stageNumber: 1,
        commission: u.customCombo.commissionEarned || 0,
      };
    }

    return null;
  };

  // Deposit Addresses Management State
  const [adminDepositAddresses, setAdminDepositAddresses] = useState<string[]>(() => getDepositAddresses());
  const [isSavingDepositAddresses, setIsSavingDepositAddresses] = useState(false);
  const [depositAddressInput, setDepositAddressInput] = useState<string>(() => getDepositAddresses()[0] || '');

  useEffect(() => {
    const handleUpdate = () => {
      const current = getDepositAddresses();
      setAdminDepositAddresses(current);
      if (current.length > 0) setDepositAddressInput(current[0]);
    };
    window.addEventListener('deposit_addresses_updated', handleUpdate);
    return () => window.removeEventListener('deposit_addresses_updated', handleUpdate);
  }, []);

  const handleSaveDepositAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = depositAddressInput.trim();
    if (!trimmed) {
      showToast('Please enter a valid TRC-20 wallet address!');
      return;
    }
    if (!trimmed.startsWith('T') || trimmed.length < 30) {
      showToast('⚠️ Note: TRON (TRC-20) addresses usually start with "T" and are 34 characters long.');
    }
    setIsSavingDepositAddresses(true);
    try {
      const newAddresses = [trimmed, ...adminDepositAddresses.slice(1)].filter(Boolean);
      const ok = await saveDepositAddresses(newAddresses);
      if (ok) {
        setAdminDepositAddresses(newAddresses);
        showToast('✅ Platform TRC-20 deposit address saved successfully!');
      } else {
        showToast('❌ Failed to save deposit address to server.');
      }
    } finally {
      setIsSavingDepositAddresses(false);
    }
  };

  // Overview Tab Live User Tracker Filter & Search
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewAccountType, setOverviewAccountType] = useState<'all' | 'real' | 'demo'>('all');
  const [overviewDateFilter, setOverviewDateFilter] = useState<'today_active' | 'yesterday' | 'all'>('today_active');
  const [overviewCategoryFilter, setOverviewCategoryFilter] = useState<'all' | 'with_balance' | 'with_deposits' | 'active_tasks'>('all');

  // Password Change Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changeUsername, setChangeUsername] = useState(adminUsername);
  const [changePassword, setChangePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset Task Modal State
  const [isResetTaskModalOpen, setIsResetTaskModalOpen] = useState(false);
  const [resetTargetUsername, setResetTargetUsername] = useState<string>('');
  const [resetTaskCount, setResetTaskCount] = useState<number>(0);
  const [resetKeepBalance, setResetKeepBalance] = useState<boolean>(true);
  const [resetCustomBalance, setResetCustomBalance] = useState<string>('618');
  const [resetClearOrders, setResetClearOrders] = useState<boolean>(true);
  const [resetTargetCycle, setResetTargetCycle] = useState<number | 'auto' | 'keep'>('auto');

  // Comprehensive User Account Edit Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editFormUsername, setEditFormUsername] = useState('');
  const [editFormPassword, setEditFormPassword] = useState('');
  const [editFormWithdrawPassword, setEditFormWithdrawPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [showEditWithdrawPass, setShowEditWithdrawPass] = useState(false);
  const [editFormBalance, setEditFormBalance] = useState('');
  const [editFormFrozenBalance, setEditFormFrozenBalance] = useState('');
  const [editFormCashGap, setEditFormCashGap] = useState('');
  const [editFormTodayTimes, setEditFormTodayTimes] = useState(0);
  const [editFormTodayCommission, setEditFormTodayCommission] = useState('');
  const [editFormVipLevel, setEditFormVipLevel] = useState(0);
  const [editFormStatus, setEditFormStatus] = useState<'active' | 'suspended'>('active');
  const [editFormCategory, setEditFormCategory] = useState<AccountCategory>('standard_real');
  const [editFormWalletAddress, setEditFormWalletAddress] = useState('');
  const [editFormWalletName, setEditFormWalletName] = useState('');
  const [editFormWalletBound, setEditFormWalletBound] = useState(false);
  const [editFormInviteCode, setEditFormInviteCode] = useState('');
  const [editFormReferredBy, setEditFormReferredBy] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const openEditUserModal = (u: UserRecord) => {
    setEditingUser(u);
    setEditFormUsername(u.username);
    setEditFormPassword(u.password || '123456');
    setEditFormWithdrawPassword(u.withdrawPassword || '123456');
    setShowEditPass(false);
    setShowEditWithdrawPass(false);
    setEditFormBalance(u.balance.toString());
    setEditFormFrozenBalance((u.frozenBalance || 0).toString());
    setEditFormCashGap((u.cashGap || 0).toString());
    setEditFormTodayTimes(u.todayTimes || 0);
    setEditFormTodayCommission((u.todayCommission || 0).toString());
    setEditFormVipLevel(u.vipLevel || 0);
    setEditFormStatus(u.status || 'active');
    setEditFormCategory(u.accountCategory || 'standard_real');
    setEditFormWalletAddress(u.walletAddress || '');
    setEditFormWalletName(u.walletName || 'TRC20 Wallet');
    setEditFormWalletBound(Boolean(u.walletBound));
    setEditFormInviteCode(u.invitationCode || '');
    setEditFormReferredBy(u.referredBy || '');
    setIsEditUserModalOpen(true);
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      const bal = parseFloat(editFormBalance) || 0;
      const fBal = parseFloat(editFormFrozenBalance) || 0;
      const gap = parseFloat(editFormCashGap) || 0;
      const comm = parseFloat(editFormTodayCommission) || 0;
      const times = Math.max(0, Math.min(25, parseInt(editFormTodayTimes.toString(), 10) || 0));

      const updates: Partial<UserRecord> = {
        password: editFormPassword.trim(),
        withdrawPassword: editFormWithdrawPassword.trim(),
        balance: Math.max(0, bal),
        frozenBalance: Math.max(0, fBal),
        cashGap: Math.max(0, gap),
        todayTimes: times,
        todayCommission: Math.max(0, comm),
        vipLevel: editFormVipLevel,
        status: editFormStatus,
        accountCategory: editFormCategory,
        walletAddress: editFormWalletAddress.trim() || null,
        walletName: editFormWalletName.trim() || null,
        walletBound: editFormWalletBound,
        invitationCode: editFormInviteCode.trim(),
        referredBy: editFormReferredBy.trim(),
      };

      const success = await updateUserAccountDetails(editingUser.username, updates);
      if (success) {
        setIsEditUserModalOpen(false);
      }
    } finally {
      setIsSavingUser(false);
    }
  };

  // Filter for deposit / withdrawal queues
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [depositUserFilter, setDepositUserFilter] = useState<string>('all');
  const [copiedDepositKey, setCopiedDepositKey] = useState<string | null>(null);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

  const copyDepositField = (text: string, key: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setCopiedDepositKey(key);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedDepositKey(null), 2000);
  };

  // Sub-tabs and filters for Demo Accounts Manager (strictly isolated transactions)
  const [demoActiveSubTab, setDemoActiveSubTab] = useState<'accounts' | 'deposits' | 'withdrawals'>('accounts');
  const [demoDepositFilter, setDemoDepositFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [demoWithdrawalFilter, setDemoWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [demoTransactionUserFilter, setDemoTransactionUserFilter] = useState<string>('all');

  // Sync selected user details when combo user changes
  const handleSelectUserForCombo = (username: string) => {
    setSelectedUsername(username);
    const u = allUsers.find((user) => user.username === username);
    if (u) {
      setComboEnabled(u.customCombo?.enabled ?? true);
      setTriggerTaskIndex(u.customCombo?.triggerTaskIndex ?? 12);
      setComboPrice(u.customCombo?.comboPrice?.toString() ?? '118.24');
      setCashGap(u.customCombo?.cashGap?.toString() ?? '18.24');
      setCommissionEarned(u.customCombo?.commissionEarned?.toString() ?? '18.5');
      setUserStages(u.customCombo?.multiStages || DEFAULT_HELP_TRAINING_COMBO_STAGES);
    }
  };

  // Task #24 Manual Combo Modal State
  const [isTask24ModalOpen, setIsTask24ModalOpen] = useState(false);
  const [task24TargetUser, setTask24TargetUser] = useState<UserRecord | null>(null);
  const [task24CashGap, setTask24CashGap] = useState<string>('12478.00');
  const [task24ComboPrice, setTask24ComboPrice] = useState<string>('');
  const [task24Commission, setTask24Commission] = useState<string>('');
  const [task24ManualActive, setTask24ManualActive] = useState<boolean>(true);

  const openTask24Modal = (u: UserRecord) => {
    setTask24TargetUser(u);
    const st24 = u.customCombo?.multiStages?.find((st) => st.triggerTaskIndex === 24);
    const gap = st24 && st24.cashGap > 0 ? st24.cashGap : 12478.0;
    setTask24CashGap(gap.toString());
    const minPrice = parseFloat(((u.balance || 0) + gap + 200).toFixed(2));
    setTask24ComboPrice(
      st24 && st24.comboPrice > gap ? st24.comboPrice.toString() : minPrice.toString()
    );
    setTask24Commission(
      st24 && st24.commissionEarned > 0 ? st24.commissionEarned.toString() : (gap * 0.2).toFixed(2)
    );
    setTask24ManualActive(true);
    setIsTask24ModalOpen(true);
  };

  const handleSaveTask24Combo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task24TargetUser) return;
    const gap = parseFloat(task24CashGap);
    if (isNaN(gap) || gap <= 0) {
      showToast('Please enter a valid cash gap top-up amount for Task #24!');
      return;
    }
    const calculatedPrice = parseFloat(((task24TargetUser.balance || 0) + gap + 200).toFixed(2));
    const inputPrice = parseFloat(task24ComboPrice);
    const price = !isNaN(inputPrice) && inputPrice > gap ? inputPrice : calculatedPrice;
    const comm = parseFloat(task24Commission) || parseFloat((gap * 0.2).toFixed(2));
    setTask24ManualCombo(task24TargetUser.username, gap, price, comm, true);
    setIsTask24ModalOpen(false);
  };

  const handleLockTask24Combo = () => {
    if (!task24TargetUser) return;
    setTask24ManualCombo(task24TargetUser.username, 0, 0, 0, false);
    setIsTask24ModalOpen(false);
  };

  const handleUpdateStageField = (
    index: number,
    field: keyof ComboStage,
    value: string | number | boolean
  ) => {
    setUserStages((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          [field]:
            typeof value === 'boolean'
              ? value
              : typeof next[index][field] === 'number'
              ? parseFloat(value as string) || 0
              : value,
        };
      }
      return next;
    });
  };

  const handleSaveMultiStages = () => {
    updateUserComboStages(selectedUsername, userStages);
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      const ok = adminLogin(loginUser, loginPass);
      setIsLoggingIn(false);
      if (ok) {
        setIsAdminOpen(true);
      }
    }, 400);
  };

  const handleCopyAdminLink = () => {
    const adminUrl = `${window.location.origin}${window.location.pathname}#admin`;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(adminUrl).catch(() => {});
      }
    } catch {}
    setCopiedLink(true);
    showToast('Secret Admin Link copied! You can bookmark this URL.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(comboPrice);
    const gapNum = parseFloat(cashGap);
    const commNum = parseFloat(commissionEarned);

    if (isNaN(priceNum) || isNaN(gapNum) || isNaN(commNum)) {
      showToast('Please enter valid numeric amounts');
      return;
    }

    const updatedStages = [...(userStages || [])];
    if (triggerTaskIndex === 24) {
      const idx24 = updatedStages.findIndex((s) => s.triggerTaskIndex === 24);
      const stage24Obj: ComboStage = {
        stageNumber: idx24 !== -1 ? updatedStages[idx24].stageNumber : updatedStages.length + 1,
        triggerTaskIndex: 24,
        comboPrice: priceNum,
        cashGap: gapNum,
        commissionEarned: commNum,
        isManual: true,
        manualAdded: gapNum > 0,
        description: gapNum > 0 ? `Task #24 Manual Combo ($${gapNum})` : 'Task #24 Manual Combo Required',
      };
      if (idx24 !== -1) {
        updatedStages[idx24] = stage24Obj;
      } else {
        updatedStages.push(stage24Obj);
      }
      setUserStages(updatedStages);
    }

    const config: CustomComboConfig = {
      enabled: comboEnabled,
      triggerTaskIndex,
      comboPrice: priceNum,
      cashGap: gapNum,
      commissionEarned: commNum,
      forceNext: targetUserRecord?.customCombo?.forceNext || false,
      multiStages: updatedStages,
    };

    updateUserCustomCombo(selectedUsername, config);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(newBalance);
    if (!newUsername.trim()) {
      showToast('Username is required');
      return;
    }
    const success = createNewUserAccount(
      newUsername.trim(),
      isNaN(bal) ? (newUserCategory === 'training_help' ? 0 : 350) : bal,
      newPassword.trim(),
      newUserCategory,
      newUserCategory === 'training_help' ? DEFAULT_HELP_TRAINING_COMBO_STAGES : undefined
    );
    if (success) {
      setIsAddUserModalOpen(false);
      setNewUsername('');
      setNewBalance('0');
    }
  };

  const handleManualCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(creditAmount);
    if (!creditUser || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid user and amount');
      return;
    }
    const targetUser = allUsers.find((u) => u.username.toLowerCase() === creditUser.toLowerCase());
    const effectiveSender = creditFromAddress.trim() || targetUser?.walletAddress || targetUser?.withdrawalAddress || '';
    manualCreditDeposit(creditUser, amt, effectiveSender || undefined);
    setIsCreditModalOpen(false);
    setCreditAmount('100');
    setCreditFromAddress('');
  };

  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePassword.trim() || changePassword.length < 4) {
      showToast('Password must be at least 4 characters');
      return;
    }
    if (changePassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }
    const ok = updateAdminCredentials(changeUsername.trim(), changePassword.trim());
    if (ok) {
      setIsChangePasswordModalOpen(false);
      setChangePassword('');
      setConfirmPassword('');
    }
  };

  const handleExecuteSingleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetUser) {
      showToast('Please select a target user to transfer');
      return;
    }
    if (!transferNewReferrer) {
      showToast('Please select or specify the new referrer');
      return;
    }
    if (transferTargetUser.toLowerCase() === transferNewReferrer.toLowerCase()) {
      showToast('A user cannot be referred by themselves!');
      return;
    }

    setIsProcessingTransfer(true);
    try {
      const res = await transferUserReferral(
        transferTargetUser,
        transferNewReferrer,
        transferDownlineTogether
      );
      if (res.success) {
        setQuickTransferModalUser(null);
      }
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  const handleExecuteBatchTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFromUser) {
      showToast('Please select the source user');
      return;
    }
    if (!batchToUser) {
      showToast('Please select the destination referrer');
      return;
    }
    if (batchFromUser.toLowerCase() === batchToUser.toLowerCase()) {
      showToast('Source and destination referrer cannot be the same user!');
      return;
    }

    if (!confirm(`Are you sure you want to transfer ALL referrals under "${batchFromUser}" to "${batchToUser}"?`)) {
      return;
    }

    setIsProcessingTransfer(true);
    try {
      const res = await batchTransferReferrals(batchFromUser, batchToUser);
      if (res.success) {
        setBatchFromUser('');
        setBatchToUser('');
      }
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  const [isPurgingTestData, setIsPurgingTestData] = useState(false);

  const handlePurgeTestData = async () => {
    if (
      !confirm(
        '⚠️ RESET TO PURE REAL USDT STATE?\n\nThis will remove all test transactions, mock deposits/withdrawals, and set balances to 0 so only genuine incoming USDT is tracked. Are you sure?'
      )
    ) {
      return;
    }
    try {
      setIsPurgingTestData(true);
      const res = await fetch('/api/admin/purge-test-transactions', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('All test transactions purged! Real USDT tracking is clean.');
        await refreshBackendData();
      } else {
        showToast(data.message || 'Failed to purge data');
      }
    } catch (err: any) {
      showToast('Error purging test data: ' + (err.message || 'Network error'));
    } finally {
      setIsPurgingTestData(false);
    }
  };

  // Only render if on admin route or isAdminOpen is true
  if (!isAdminRoute && !isAdminOpen) return null;

  // -------------------------------------------------------------
  // 1. GATEWAY SCREEN: IF NOT AUTHENTICATED AS ADMIN
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 selection:bg-rose-600 selection:text-white">
        {/* Top security header */}
        <div className="w-full max-w-md flex items-center justify-between py-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Shield size={14} className="text-rose-500" />
            <span className="font-mono tracking-wider uppercase font-semibold text-slate-400">Admin Control Gate</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
            SSL 256-BIT ENCRYPTED
          </span>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 my-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-rose-950/50">
              <Lock size={26} strokeWidth={2.2} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal Login</h1>
            <p className="text-xs text-slate-400">
              Restricted management portal for global task matching, multi-user accounts, and crypto transaction queues.
            </p>
          </div>

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Admin Username</span>
                <span className="text-[10px] text-slate-500 font-mono">default: admin</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Admin Password</span>
                <span className="text-[10px] text-slate-500 font-mono">default: admin7788</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Key size={13} />
                <span>Security Notice:</span>
              </div>
              <p>
                This backend portal is completely hidden from regular members. Save or bookmark your admin link (
                <code className="text-rose-400 font-mono">#admin</code>) to access it anytime.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              {isLoggingIn ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <Shield size={16} />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </button>

            {/* Quick 1-Click Login with default admin credentials */}
            <button
              type="button"
              onClick={() => {
                setLoginUser('admin');
                setLoginPass('admin7788');
                adminLogin('admin', 'admin7788');
                setIsAdminOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-amber-300 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Quick 1-Click Login (admin / admin7788)</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              type="button"
              onClick={navigateToUserApp}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <span>← Return to Member Store</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-slate-600 text-center py-2">
          VIP USDT Intelligent Cloud Engine • Isolated Administrative Portal
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN MANAGEMENT CONSOLE SOFTWARE
  // -------------------------------------------------------------

  // Isolate Demo Accounts completely from Real Member Accounts
  const isDemoUser = (u: UserRecord) => {
    if (!u) return false;
    if (u.accountCategory === 'training_help') return true;
    const clean = (u.username || '').trim().toLowerCase();
    return (
      clean.startsWith('demo') ||
      clean.startsWith('cari') ||
      clean.startsWith('trainee') ||
      clean.startsWith('help_') ||
      clean.includes('demo') ||
      clean.includes('training')
    );
  };

  const realUsers = allUsers.filter((u) => !isDemoUser(u));
  const demoUsers = allUsers.filter((u) => isDemoUser(u));
  const standardUsers = realUsers.filter((u) => !u.accountCategory || u.accountCategory === 'standard_real');
  const vipUsers = realUsers.filter((u) => u.accountCategory === 'vip_elite');

  // Strict helper for isolating transactions:
  const isDemoUsername = (username?: string) => {
    if (!username) return false;
    const clean = username.trim().toLowerCase();
    return (
      clean.startsWith('demo') ||
      clean.startsWith('cari') ||
      clean.startsWith('trainee') ||
      clean.startsWith('help_') ||
      clean.includes('demo') ||
      clean.includes('training') ||
      demoUsers.some((u) => u.username.toLowerCase() === clean)
    );
  };

  // Real Member transactions (strictly exclude demo accounts)
  const realDeposits = deposits.filter((d) => !isDemoUsername(d.username));
  const realWithdrawals = withdrawals.filter((w) => !isDemoUsername(w.username));

  // Demo Account transactions (strictly isolated inside Demo Accounts manager)
  const demoDeposits = deposits.filter((d) => isDemoUsername(d.username));
  const demoWithdrawals = withdrawals.filter((w) => isDemoUsername(w.username));

  // User Accounts table filter: ONLY searches and filters REAL member accounts!
  // Demo accounts are strictly quarantined into the dedicated Demo Accounts tab.
  const filteredUsers = realUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.invitationCode?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'standard_real') return !u.accountCategory || u.accountCategory === 'standard_real';
    if (categoryFilter === 'vip_elite') return u.accountCategory === 'vip_elite';
    return true;
  });

  // Dedicated filter for Demo Accounts tab
  const filteredDemoUsers = demoUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(demoSearchTerm.toLowerCase()) ||
      u.invitationCode?.toLowerCase().includes(demoSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (demoFilter === 'all') return true;
    if (demoFilter === 'pending_password') return u.password !== '112233';
    if (demoFilter === 'password_done') return u.password === '112233';
    if (demoFilter === 'completed_tasks') return (u.todayTimes || 0) >= (u.maxDailyTimes || 25);
    if (demoFilter === 'in_progress') return (u.todayTimes || 0) > 0 && (u.todayTimes || 0) < (u.maxDailyTimes || 25);
    return true;
  });

  // Helper to distinguish genuine user deposit transactions from manual admin score adjustments
  const isManualAdminScore = (d: DepositRecord) => {
    if (!d) return true;
    const id = (d.id || '').toLowerCase();
    const hash = (d.txHash || '').toLowerCase();
    const address = (d.address || '').toLowerCase();
    return (
      id.startsWith('dep-man') ||
      id.startsWith('man-') ||
      id.includes('manual') ||
      id.includes('score') ||
      hash.startsWith('manual') ||
      hash.startsWith('score') ||
      hash.startsWith('admin') ||
      hash.includes('manual_credit') ||
      address.includes('manual') ||
      address.includes('admin')
    );
  };

  // Real Member genuine deposits (strictly exclude demo accounts and manual admin score adjustments)
  const realGenuineDeposits = realDeposits.filter((d) => !isManualAdminScore(d));

  // Statistics calculation for Real Users ONLY (Strictly real deposited USDT & processed withdrawals)
  const realCompletedDeposits = realGenuineDeposits.filter(
    (d) => d.status === 'completed' || d.status === 'approved'
  );
  const totalRealCompletedDeposits = realCompletedDeposits.reduce((sum, d) => sum + d.amount, 0);

  const realCompletedWithdrawals = realWithdrawals.filter(
    (w) => w.status === 'completed' || w.status === 'approved'
  );
  const totalRealCompletedWithdrawals = realCompletedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Total Real Platform USDT = Real User Deposited USDT minus Real User Withdrawn USDT (Net Real Vault)
  const realPlatformNetUSDT = Math.max(0, parseFloat((totalRealCompletedDeposits - totalRealCompletedWithdrawals).toFixed(2)));

  const pendingDepositsCount = realGenuineDeposits.filter((d) => d.status === 'pending').length;
  const pendingWithdrawalsCount = realWithdrawals.filter((w) => w.status === 'pending').length;
  const pendingDemoDepositsCount = demoDeposits.filter((d) => d.status === 'pending').length;
  const pendingDemoWithdrawalsCount = demoWithdrawals.filter((w) => w.status === 'pending').length;

  const directAdminLink = `${window.location.origin}${window.location.pathname}#admin`;

  return (
    <div
      id="admin-management-portal"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white"
    >
      {/* ========================================================= */}
      {/* 1. TOP SYSTEM HEADER */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/40 shrink-0">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                VIP GLOBAL CONTROLLER
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span>Admin:</span>
              <span className="text-amber-400 font-bold">{adminUsername}</span>
              <span>•</span>
              <span className="text-slate-300">Members: <strong className="text-white">{realUsers.length}</strong></span>
              <span>•</span>
              <span className="text-sky-400">Demo: <strong className="text-sky-300">{demoUsers.length}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          {/* Real-time sync button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`px-3 py-2 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isSyncing
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300 shadow-sm'
            }`}
            title="Sync latest user registrations and live database records"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          {/* Direct Link Copy Button */}
          <button
            type="button"
            onClick={handleCopyAdminLink}
            className={`px-3 py-2 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-slate-200'
            }`}
            title="Copy Secret Direct Admin URL"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Secret Admin Link'}</span>
          </button>

          {/* Open in New Window/Tab */}
          <button
            type="button"
            onClick={() => {
              const adminUrl = `${window.location.origin}${window.location.pathname}#admin`;
              window.open(adminUrl, '_blank');
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Open Admin Software in a separate browser window"
          >
            <ExternalLink size={14} />
            <span>New Tab ↗</span>
          </button>

          {/* Preview Member App Button */}
          <button
            type="button"
            onClick={navigateToUserApp}
            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Open Member App to test and browse"
          >
            <Smartphone size={14} />
            <span>Open Member App</span>
          </button>

          {/* Change Admin Password */}
          <button
            type="button"
            onClick={() => {
              setChangeUsername(adminUsername);
              setIsChangePasswordModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Change Admin Username & Password"
          >
            <Key size={14} />
            <span className="hidden sm:inline">Password</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={adminLogout}
            className="px-3 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Logout from Admin Console"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================= */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center space-x-1.5 overflow-x-auto text-xs shrink-0 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveAdminTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'overview'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Activity size={15} />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAdminTab('users');
            setCategoryFilter('all');
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'users'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Users size={15} />
          <span>User Accounts ({realUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('demo_accounts')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'demo_accounts'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50 border border-sky-400/40'
              : 'text-sky-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <span className="text-base leading-none">🎓</span>
          <span>Demo Accounts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800 font-bold">
            {demoUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('combos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'combos'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Zap size={15} className="text-amber-400" />
          <span>Custom Tasks & Combos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('deposits')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'deposits'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <ArrowDownCircle size={15} className="text-emerald-400" />
          <span>Deposit Queue</span>
          {pendingDepositsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
              {pendingDepositsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'withdrawals'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <ArrowUpCircle size={15} className="text-rose-400" />
          <span>Withdrawal Queue</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[10px]">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('settings')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'settings'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Settings size={15} />
          <span>Settings & Direct Link</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('referrals')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'referrals'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Share2 size={15} className="text-sky-400" />
          <span>Referrals & Network</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold">Total Platform USDT</span>
                  <DollarSign size={16} className="text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  ${realPlatformNetUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500">Real Vault Net (Deposits - Withdrawals)</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold">Pending Deposits</span>
                  <ArrowDownCircle size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {pendingDepositsCount}
                </div>
                <div className="text-[11px] text-slate-500">
                  Completed: ${totalRealCompletedDeposits.toFixed(2)} USDT
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold">Pending Withdrawals</span>
                  <ArrowUpCircle size={16} className="text-rose-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-400">
                  {pendingWithdrawalsCount}
                </div>
                <div className="text-[11px] text-slate-500">
                  Processed: ${totalRealCompletedWithdrawals.toFixed(2)} USDT
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold">Connected Users</span>
                  <Users size={16} className="text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {realUsers.length}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>TRC-20 Engine Live</span>
                </div>
              </div>
            </div>

            {/* REAL-TIME SERIAL-BY-SERIAL MEMBER ACTIVITY, DAILY SCORE & DEPOSIT TRACKER */}
            {(() => {
              const now = new Date();
              const todayUTC = now.toISOString().substring(0, 10);
              const padZero = (n: number) => String(n).padStart(2, '0');
              const todayLocal = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;

              const isDateToday = (dStr?: string) => {
                if (!dStr) return false;
                const d = dStr.substring(0, 10);
                return d === todayUTC || d === todayLocal;
              };

              const yesterdayDate = new Date();
              yesterdayDate.setDate(yesterdayDate.getDate() - 1);
              const yesterdayUTC = yesterdayDate.toISOString().substring(0, 10);
              const yesterdayLocal = `${yesterdayDate.getFullYear()}-${padZero(yesterdayDate.getMonth() + 1)}-${padZero(yesterdayDate.getDate())}`;

              const isDateYesterday = (dStr?: string) => {
                if (!dStr) return false;
                const d = dStr.substring(0, 10);
                return d === yesterdayUTC || d === yesterdayLocal;
              };

              // Helper to compute user stats for today and yesterday
              const getUserDailyStats = (u: UserRecord) => {
                const uClean = (u.username || '').toLowerCase();
                const uOrdersToday = (allOrders || orders || []).filter(
                  (o) => (o.username || '').toLowerCase() === uClean &&
                         o.status === 'completed' &&
                         Boolean(o.createdAt) &&
                         isDateToday(o.createdAt)
                );
                const uOrdersYesterday = (allOrders || orders || []).filter(
                  (o) => (o.username || '').toLowerCase() === uClean &&
                         o.status === 'completed' &&
                         Boolean(o.createdAt) &&
                         isDateYesterday(o.createdAt)
                );
                const uDepsToday = deposits.filter(
                  (d) => (d.username || '').toLowerCase() === uClean &&
                         (d.status === 'completed' || d.status === 'approved') &&
                         Boolean(d.createdAt) &&
                         isDateToday(d.createdAt)
                );
                const uDepsYesterday = deposits.filter(
                  (d) => (d.username || '').toLowerCase() === uClean &&
                         (d.status === 'completed' || d.status === 'approved') &&
                         Boolean(d.createdAt) &&
                         isDateYesterday(d.createdAt)
                );

                // Tasks done today
                const tasksFromTodayProp = (u.todayTimes || 0) > 0 ? (u.todayTimes || 0) : 0;
                const tasksToday = Math.max(uOrdersToday.length, tasksFromTodayProp);

                // Commission earned today
                const commFromOrders = parseFloat(uOrdersToday.reduce((sum, o) => sum + (o.commissionEarned || 0), 0).toFixed(2));
                const commFromTodayProp = (u.todayCommission || 0) > 0 ? (u.todayCommission || 0) : 0;
                const commToday = Math.max(commFromOrders, commFromTodayProp);

                // Deposit amount today
                const depToday = uDepsToday.reduce((sum, d) => sum + (d.amount || 0), 0);

                // Yesterday stats
                const tasksYesterday = uOrdersYesterday.length > 0 
                  ? uOrdersYesterday.length 
                  : (u.yesterdayTimes || 0);
                const commYesterday = uOrdersYesterday.length > 0
                  ? parseFloat(uOrdersYesterday.reduce((sum, o) => sum + (o.commissionEarned || 0), 0).toFixed(2))
                  : (u.yesterdayCommission || 0);
                const depYesterday = uDepsYesterday.reduce((sum, d) => sum + (d.amount || 0), 0);

                const hasWorkedToday = tasksToday > 0 || commToday > 0 || depToday > 0 || (u.todayTimes || 0) > 0 || (u.todayCommission || 0) > 0 || isDateToday(u.lastTaskDate) || isDateToday(u.lastActive) || (typeof u.lastActive === 'string' && u.lastActive.toLowerCase().includes('active now'));
                const hasWorkedYesterday = tasksYesterday > 0 || commYesterday > 0 || depYesterday > 0;

                return {
                  tasksToday,
                  commToday,
                  depToday,
                  tasksYesterday,
                  commYesterday,
                  depYesterday,
                  hasWorkedToday,
                  hasWorkedYesterday,
                  ordersTodayCount: uOrdersToday.length,
                  ordersYesterdayCount: uOrdersYesterday.length,
                };
              };

              // Base users according to selected account scope
              const basePoolUsers = overviewAccountType === 'real'
                ? realUsers
                : overviewAccountType === 'demo'
                ? demoUsers
                : allUsers;

              // Global metrics across base pool
              let globalActiveTodayCount = 0;
              let globalTasksTodaySum = 0;
              let globalCommTodaySum = 0;
              let globalDepTodaySum = 0;
              let globalActiveYesterdayCount = 0;

              basePoolUsers.forEach((u) => {
                const stats = getUserDailyStats(u);
                if (stats.hasWorkedToday) {
                  globalActiveTodayCount++;
                  globalTasksTodaySum += stats.tasksToday;
                  globalCommTodaySum += stats.commToday;
                  globalDepTodaySum += stats.depToday;
                }
                if (stats.hasWorkedYesterday) {
                  globalActiveYesterdayCount++;
                }
              });

              // Filter users according to date filter and search/category
              const overviewUsers = basePoolUsers.filter((u) => {
                const stats = getUserDailyStats(u);

                // 1. DATE FILTER
                if (overviewDateFilter === 'today_active') {
                  // Only show users who have activity/work TODAY!
                  if (!stats.hasWorkedToday) return false;
                } else if (overviewDateFilter === 'yesterday') {
                  if (!stats.hasWorkedYesterday) return false;
                }

                // 2. SEARCH QUERY
                if (overviewSearch.trim()) {
                  const q = overviewSearch.toLowerCase().trim();
                  const matchName = u.username.toLowerCase().includes(q);
                  const matchInvite = (u.invitationCode || '').toLowerCase().includes(q);
                  const matchWallet = (u.walletAddress || '').toLowerCase().includes(q);
                  if (!matchName && !matchInvite && !matchWallet) return false;
                }

                // 3. CATEGORY FILTER
                if (overviewCategoryFilter === 'with_balance') {
                  return u.balance > 0 || (u.frozenBalance || 0) > 0;
                }
                if (overviewCategoryFilter === 'with_deposits') {
                  const uDeps = deposits.filter((d) => (d.username || '').toLowerCase() === u.username.toLowerCase());
                  return uDeps.length > 0;
                }
                if (overviewCategoryFilter === 'active_tasks') {
                  return stats.tasksToday > 0;
                }

                return true;
              });

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                  {/* Table Header & Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                          <Activity size={18} />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                          Live Member Ledger & Daily Score Tracker
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          SERIAL BY SERIAL ({overviewUsers.length})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Daily Score Tracker: Real-time ledger of active members, completed tasks, commissions, and deposits for today.
                      </p>
                    </div>

                    {/* Filter & Search Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 sm:w-60">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={overviewSearch}
                          onChange={(e) => setOverviewSearch(e.target.value)}
                          placeholder="Search username, invite, wallet..."
                          className="w-full pl-8.5 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      {/* ACCOUNT SCOPE SELECTOR */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setOverviewAccountType('all')}
                          className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            overviewAccountType === 'all'
                              ? 'bg-rose-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          All ({allUsers.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewAccountType('real')}
                          className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            overviewAccountType === 'real'
                              ? 'bg-rose-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Real ({realUsers.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewAccountType('demo')}
                          className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            overviewAccountType === 'demo'
                              ? 'bg-rose-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Training ({demoUsers.length})
                        </button>
                      </div>

                      {/* DATE FILTER BUTTONS */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setOverviewDateFilter('today_active')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                            overviewDateFilter === 'today_active'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Zap size={12} className={overviewDateFilter === 'today_active' ? 'text-amber-300 fill-amber-300' : ''} />
                          <span>Today's Active ({globalActiveTodayCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewDateFilter('yesterday')}
                          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                            overviewDateFilter === 'yesterday'
                              ? 'bg-rose-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Calendar size={12} />
                          <span>Yesterday ({globalActiveYesterdayCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewDateFilter('all')}
                          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            overviewDateFilter === 'all'
                              ? 'bg-rose-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          All Time
                        </button>
                      </div>

                      {/* SUB-CATEGORY FILTERS */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setOverviewCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            overviewCategoryFilter === 'all'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewCategoryFilter('with_deposits')}
                          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            overviewCategoryFilter === 'with_deposits'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Deposited
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewCategoryFilter('with_balance')}
                          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            overviewCategoryFilter === 'with_balance'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Balance
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverviewCategoryFilter('active_tasks')}
                          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            overviewCategoryFilter === 'active_tasks'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tasks Active
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TODAY'S LIVE SUMMARY KPI BAR */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="text-[10.5px] uppercase font-bold text-slate-400">Active Users Today</div>
                        <div className="text-base font-black text-white font-mono">
                          {globalActiveTodayCount} <span className="text-[10px] text-slate-500 font-normal">Active Members</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <div className="text-[10.5px] uppercase font-bold text-slate-400">Tasks Done Today</div>
                        <div className="text-base font-black text-sky-400 font-mono">
                          {globalTasksTodaySum} <span className="text-[10px] text-slate-500 font-normal">Tasks Done</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <div className="text-[10.5px] uppercase font-bold text-slate-400">Total Commission Today</div>
                        <div className="text-base font-black text-emerald-400 font-mono">
                          +${globalCommTodaySum.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">USDT</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                        <ArrowDownCircle size={16} />
                      </div>
                      <div>
                        <div className="text-[10.5px] uppercase font-bold text-slate-400">Total Deposits Today</div>
                        <div className="text-base font-black text-purple-400 font-mono">
                          ${globalDepTodaySum.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">USDT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1140px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                          <th className="py-3 px-3 text-center w-12">SL #</th>
                          <th className="py-3 px-3">User Account</th>
                          <th className="py-3 px-3">Current Balance</th>
                          <th className="py-3 px-3">Daily Score (Today's Work)</th>
                          <th className="py-3 px-3">Total Deposited</th>
                          <th className="py-3 px-3">Deposit Receiving & Sender Address</th>
                          <th className="py-3 px-3">Deposit Entered Amount</th>
                          <th className="py-3 px-3">Round / Cycle</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {overviewUsers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-500">
                              <div className="max-w-md mx-auto space-y-2">
                                <Activity size={24} className="mx-auto text-slate-600" />
                                <p className="text-sm font-bold text-slate-300">
                                  {overviewDateFilter === 'today_active'
                                    ? 'No members have started tasks or deposits today.'
                                    : 'No members match the selected filter criteria.'}
                                </p>
                                {overviewDateFilter === 'today_active' && (
                                  <p className="text-xs text-slate-500">
                                    Members who worked yesterday are hidden in today's active filter. Click "All Members" above to view full user list.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          overviewUsers.map((u, index) => {
                            const stats = getUserDailyStats(u);
                            const userDeps = deposits.filter(
                              (d) => (d.username || '').toLowerCase() === u.username.toLowerCase()
                            );
                            const completedDeps = userDeps.filter(
                              (d) => d.status === 'completed' || d.status === 'approved'
                            );
                            const totalDeposited = completedDeps.reduce((sum, d) => sum + (d.amount || 0), 0);
                            const pendingDeps = userDeps.filter((d) => d.status === 'pending');
                            const pendingAmount = pendingDeps.reduce((sum, d) => sum + (d.amount || 0), 0);
                            const latestPending = pendingDeps[0];
                            const latestDep = userDeps[0];
                            const targetPlatformAddress = latestDep?.address || adminDepositAddresses[0] || 'Default Platform Address';
                            const userSenderWallet = u.walletAddress || latestDep?.fromAddress || null;
                            const maxTasks = u.maxDailyTimes || 25;
                            const taskProgressPercent = Math.min(100, Math.round((stats.tasksToday / maxTasks) * 100));

                            return (
                              <tr key={u.username} className="hover:bg-slate-800/40 transition-colors">
                                {/* 1. Serial Number */}
                                <td className="py-3.5 px-3 text-center">
                                  <span className="font-mono font-black text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                                    #{index + 1}
                                  </span>
                                </td>

                                {/* 2. User Details */}
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase shrink-0 overflow-hidden">
                                      {u.avatar ? (
                                        <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                      ) : (
                                        u.username.slice(0, 2)
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-bold text-white text-xs truncate">{u.username}</span>
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                          VIP {u.vipLevel}
                                        </span>
                                      </div>
                                      <div className="text-[10.5px] text-slate-400 font-mono flex items-center space-x-1.5 mt-0.5">
                                        <span>Code: {u.invitationCode}</span>
                                        {u.status === 'suspended' && (
                                          <span className="text-rose-400 font-bold">• Suspended</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* 3. Account Balance */}
                                <td className="py-3.5 px-3">
                                  <div className="space-y-0.5">
                                    <div className="font-mono font-black text-emerald-400 text-sm">
                                      ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-emerald-500/80 font-normal">USDT</span>
                                    </div>
                                    {((u.frozenBalance || 0) > 0 || (u.cashGap || 0) > 0) && (
                                      <div className="text-[10px] flex items-center space-x-1.5 font-mono">
                                        {(u.frozenBalance || 0) > 0 && (
                                          <span className="text-amber-400">Frozen: ${u.frozenBalance.toFixed(2)}</span>
                                        )}
                                        {(u.cashGap || 0) > 0 && (
                                          <span className="text-rose-400">Gap: ${u.cashGap.toFixed(2)}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* 4. DAILY SCORE & TODAY'S WORK */}
                                <td className="py-3.5 px-3">
                                  <div className="space-y-1.5 w-44">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center space-x-1">
                                        <span className="font-black text-sky-400 font-mono">
                                          Task #{stats.tasksToday}
                                        </span>
                                        <span className="text-[10.5px] text-slate-500 font-mono">
                                          / {maxTasks}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-emerald-400 text-[11px]">
                                        +${stats.commToday.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                      <div
                                        className={`h-full transition-all duration-300 ${
                                          stats.tasksToday >= maxTasks
                                            ? 'bg-emerald-400'
                                            : stats.tasksToday > 0
                                            ? 'bg-sky-400'
                                            : 'bg-slate-700'
                                        }`}
                                        style={{ width: `${taskProgressPercent}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                      {stats.tasksToday >= maxTasks ? (
                                        <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                          <span>⭐ Completed (25/25)</span>
                                        </span>
                                      ) : stats.tasksToday > 0 ? (
                                        <span className="text-sky-400 font-medium">
                                          {maxTasks - stats.tasksToday} tasks left
                                        </span>
                                      ) : stats.depToday > 0 ? (
                                        <span className="text-purple-400 font-medium">
                                          Deposit Confirmed (+${stats.depToday})
                                        </span>
                                      ) : (
                                        <span className="text-slate-500">
                                          Not started today
                                        </span>
                                      )}

                                      {stats.tasksYesterday > 0 && overviewDateFilter !== 'today_active' && (
                                        <span className="text-slate-400 text-[9.5px]">
                                          Yesterday: {stats.tasksYesterday} tasks
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* 5. Total Deposited */}
                                <td className="py-3.5 px-3">
                                  <div className="space-y-0.5">
                                    <div className="font-mono font-bold text-white text-xs">
                                      ${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
                                    </div>
                                    {stats.depToday > 0 && (
                                      <div className="text-[10px] font-bold text-emerald-400">
                                        Today: +${stats.depToday.toFixed(2)} USDT
                                      </div>
                                    )}
                                    {pendingAmount > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDepositSearchQuery(u.username);
                                          setActiveAdminTab('deposits');
                                        }}
                                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded hover:bg-amber-500/20 cursor-pointer transition-colors"
                                      >
                                        <Clock size={10} />
                                        <span>+${pendingAmount.toFixed(2)} Pending</span>
                                      </button>
                                    ) : (
                                      stats.depToday === 0 && (
                                        <span className="text-[10px] text-slate-500">
                                          {completedDeps.length > 0 ? `${completedDeps.length} deposit${completedDeps.length > 1 ? 's' : ''}` : 'No deposits yet'}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </td>

                                {/* 6. Deposit Receiving & Sender Address */}
                                <td className="py-3.5 px-3">
                                  <div className="space-y-1 max-w-xs">
                                    {/* Platform Receiving Target */}
                                    <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                      <span className="text-[9.5px] uppercase font-bold text-slate-400 shrink-0">To:</span>
                                      <span className="font-mono text-[10.5px] text-amber-300 truncate select-all flex-1" title={targetPlatformAddress}>
                                        {targetPlatformAddress.length > 18
                                          ? `${targetPlatformAddress.slice(0, 8)}...${targetPlatformAddress.slice(-6)}`
                                          : targetPlatformAddress}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => copyDepositField(targetPlatformAddress, `to_${u.username}`, 'Deposit Receiving Address')}
                                        className="text-slate-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
                                        title="Copy Deposit Address"
                                      >
                                        {copiedDepositKey === `to_${u.username}` ? (
                                          <Check size={11} className="text-emerald-400" />
                                        ) : (
                                          <Copy size={11} />
                                        )}
                                      </button>
                                    </div>

                                    {/* User's Sender / Bound Wallet */}
                                    <div className="flex items-center space-x-1 px-1 text-[10px] text-slate-400">
                                      <span className="text-[9.5px] uppercase font-bold text-slate-400 shrink-0">From:</span>
                                      {userSenderWallet ? (
                                        <>
                                          <span className="font-mono text-slate-300 truncate select-all flex-1" title={userSenderWallet}>
                                            {userSenderWallet.length > 18
                                              ? `${userSenderWallet.slice(0, 8)}...${userSenderWallet.slice(-6)}`
                                              : userSenderWallet}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => copyDepositField(userSenderWallet, `from_${u.username}`, 'User Wallet Address')}
                                            className="text-slate-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
                                            title="Copy User Wallet"
                                          >
                                            {copiedDepositKey === `from_${u.username}` ? (
                                              <Check size={10} className="text-emerald-400" />
                                            ) : (
                                              <Copy size={10} />
                                            )}
                                          </button>
                                        </>
                                      ) : (
                                        <span className="text-slate-400 italic">No wallet bound yet</span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* 7. Deposit Entered Amount (ডিপোজিটের জন্য দেওয়া ব্যালেন্স / রিকোয়েস্ট) */}
                                <td className="py-3.5 px-3">
                                  {latestPending ? (
                                    <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 min-w-[165px] shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center space-x-1 text-[9px] font-extrabold uppercase text-amber-300">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                          <span>Pending Input</span>
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-mono">
                                          {latestPending.createdAt?.split(' ')[1] || 'Just now'}
                                        </span>
                                      </div>
                                      <div className="font-mono font-black text-sm text-amber-300">
                                        +${latestPending.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                                        <span className="text-[10px] text-amber-400/80 font-normal">USDT</span>
                                      </div>
                                      <div className="flex items-center space-x-1 pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => approveDeposit(latestPending.id)}
                                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-colors"
                                          title="Approve and credit deposit balance to user"
                                        >
                                          <Check size={12} />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => rejectDeposit(latestPending.id)}
                                          className="py-1 px-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold text-[10.5px] flex items-center justify-center cursor-pointer transition-colors"
                                          title="Reject deposit"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : latestDep ? (
                                    <div className="space-y-1 min-w-[145px]">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-mono font-black text-xs text-emerald-400">
                                          +${latestDep.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                                          <span className="text-[9.5px] text-emerald-500/80 font-normal">USDT</span>
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                          latestDep.status === 'completed' || latestDep.status === 'approved'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                        }`}>
                                          {latestDep.status === 'completed' || latestDep.status === 'approved' ? 'Approved' : latestDep.status}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {latestDep.createdAt ? latestDep.createdAt.substring(0, 16) : 'Recorded'}
                                      </div>
                                      {userDeps.length > 1 && (
                                        <div className="text-[9.5px] text-slate-500">
                                          {userDeps.length} total deposit records
                                        </div>
                                      )}
                                    </div>
                                  ) : u.lastEnteredDepositAmount ? (
                                    <div className="space-y-1 min-w-[140px]">
                                      <div className="font-mono font-bold text-xs text-sky-400">
                                        +${u.lastEnteredDepositAmount.toFixed(2)} <span className="text-[9.5px] text-slate-400">USDT</span>
                                      </div>
                                      <div className="text-[9.5px] text-slate-400">
                                        Entered: {u.lastEnteredDepositTime?.substring(0, 16) || 'Recently'}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 min-w-[130px]">
                                      <div className="text-slate-500 font-mono text-xs flex items-center space-x-1">
                                        <span>$0.00</span>
                                        <span className="text-[9.5px] text-slate-600">(No deposit input)</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => openEditUserModal(u)}
                                        className="text-[9.5px] text-slate-400 hover:text-amber-400 cursor-pointer underline transition-colors"
                                      >
                                        + Credit balance
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* 8. Round / Work Cycle */}
                                <td className="py-3.5 px-3">
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs">
                                      <Sparkles size={12} className="text-purple-400 shrink-0" />
                                      <span>Round {u.workCycle || 1}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {u.customCombo?.enabled && (u.customCombo?.multiStages?.length || 0) > 0 ? (
                                        <span className="text-amber-400">
                                          Combo Active ({u.customCombo.multiStages.length} Stg)
                                        </span>
                                      ) : (
                                        <span>Standard Mode</span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* 8. Actions */}
                                <td className="py-3.5 px-3 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditUserModal(u)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                                      title="Edit User Details & Balance"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectUserForCombo(u.username);
                                        setActiveAdminTab('combos');
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white cursor-pointer transition-colors"
                                      title="Configure Combos & Tasks"
                                    >
                                      <Sliders size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: USER ACCOUNTS & ACTIVITY */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search user by username or invite code..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
                  <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>Backend Live ({realUsers.length} Members)</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSyncing(true);
                      try {
                        await refreshBackendData();
                        showToast('Database synced successfully!');
                      } finally {
                        setTimeout(() => setIsSyncing(false), 500);
                      }
                    }}
                    disabled={isSyncing}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-sky-400 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors disabled:opacity-50"
                    title="Sync with server database"
                  >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to reset daily task progress to 0/25 for all real member users?")) {
                        realUsers.forEach((u) => resetUserTasks(u.username, 0, 0, true, 1, false));
                        showToast(`Reset tasks to 0/25 for ${realUsers.length} real member accounts!`);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-amber-300 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                    title="Reset all real members' tasks to 0/25 at once"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Tasks (0/25)</span>
                  </button>

                  {/* STANDARD REAL USER CREATION BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserCategory('standard_real');
                      setNewBalance('350');
                      setNewPassword('123456');
                      setIsAddUserModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Plus size={15} />
                    <span>Create User</span>
                  </button>
                </div>
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1">Filter Accounts:</span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All Accounts ({realUsers.length})
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryFilter('standard_real')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                    categoryFilter === 'standard_real'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>👤 Standard Users</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                    {standardUsers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryFilter('vip_elite')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                    categoryFilter === 'vip_elite'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>👑 VIP Elite</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-purple-300">
                    {vipUsers.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Users Table / Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">User Profile</th>
                      <th className="px-4 py-3.5">Location & IP</th>
                      <th className="px-4 py-3.5">VIP Tier</th>
                      <th className="px-4 py-3.5">Available Balance</th>
                      <th className="px-4 py-3.5">Combo Offer</th>
                      <th className="px-4 py-3.5">Tasks Today</th>
                      <th className="px-4 py-3.5">Combo Trigger</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          No users found matching "{searchTerm}"
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isCurrent = currentUser.username === u.username;
                        const isEditingThisBalance = editingBalanceUser === u.username;
                        const isEditingThisCombo = editingComboUser === u.username;

                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isCurrent ? 'bg-rose-950/20' : ''
                            }`}
                          >
                            {/* Username & Avatar */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-2.5">
                                <img
                                  src={u.avatar}
                                  alt={u.username}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-1.5 flex-wrap gap-1">
                                    <span>{u.username}</span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        ACTIVE
                                      </span>
                                    )}
                                    {u.accountCategory === 'training_help' ? (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center space-x-1">
                                        <span>🎓 Training Demo</span>
                                      </span>
                                    ) : u.accountCategory === 'vip_elite' ? (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
                                        <span>👑 VIP Elite</span>
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                        Standard
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 font-mono flex items-center space-x-2 flex-wrap gap-y-0.5 mt-0.5">
                                    <span className="text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                      Pass: {u.password || '123456'}
                                    </span>
                                    <span>Inv: {u.invitationCode}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuickTransferModalUser(u);
                                        setTransferTargetUser(u.username);
                                        setTransferNewReferrer(u.referredBy || 'Official Platform');
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center space-x-1 cursor-pointer transition-colors"
                                      title="Click to transfer or change this user's referral upline"
                                    >
                                      <span>Ref: {u.referredBy || 'Direct'}</span>
                                      <ArrowRightLeft size={10} className="text-sky-400" />
                                    </button>
                                  </div>
                                  <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                                    Joined {u.joinDate}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Location & IP */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 font-mono text-[11px]">
                                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                                  {(u.loginCount || 0) > 0 ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                      <span>{u.loginCount} Logins</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-slate-800 text-slate-400 border border-slate-700">
                                      0 Logins
                                    </span>
                                  )}
                                  {u.lastActive === 'Active Now' && (
                                    <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-500 text-slate-950">
                                      ONLINE
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                                  <MapPin size={12} className="text-emerald-400 shrink-0" />
                                  <span className="truncate max-w-[150px]" title={u.location || 'Dhaka, Bangladesh'}>
                                    {u.location || 'Dhaka, Bangladesh'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-cyan-300 text-[10px]">
                                  <Globe size={11} className="text-cyan-400 shrink-0" />
                                  <span>{u.ipAddress || '103.145.74.22'}</span>
                                </div>
                                {u.device && (
                                  <div className="flex items-center space-x-1 text-slate-400 text-[9.5px]">
                                    <Smartphone size={10} className="text-slate-500 shrink-0" />
                                    <span className="truncate max-w-[140px]">{u.device}</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openLoginAuditModal(u)}
                                  className="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center space-x-1 cursor-pointer pt-0.5"
                                  title={`View login history audit logs for ${u.username}`}
                                >
                                  <Activity size={10} />
                                  <span>Audit Logs ({u.loginHistory?.length || u.loginCount || 0})</span>
                                </button>
                              </div>
                            </td>

                            {/* VIP Tier */}
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10.5px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                VIP {u.vipLevel}
                              </span>
                            </td>

                            {/* Balance */}
                            <td className="px-4 py-3.5">
                              {isEditingThisBalance ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editingBalanceValue}
                                    onChange={(e) => setEditingBalanceValue(e.target.value)}
                                    className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = parseFloat(editingBalanceValue);
                                      if (!isNaN(val)) {
                                        updateUserBalance(u.username, val);
                                      }
                                      setEditingBalanceUser(null);
                                    }}
                                    className="p-1 rounded bg-emerald-600 text-white"
                                  >
                                    <Check size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="font-bold text-white font-mono flex items-center space-x-1.5">
                                  <span>${u.balance.toFixed(2)} USDT</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBalanceUser(u.username);
                                      setEditingBalanceValue(u.balance.toString());
                                    }}
                                    className="text-slate-500 hover:text-slate-300 text-[10px] underline cursor-pointer"
                                  >
                                    edit
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Combo Offer (Replaced Frozen Balance) */}
                            <td className="px-4 py-3.5">
                              {isEditingThisCombo ? (
                                <div className="space-y-1.5 p-1.5 rounded-lg bg-slate-950 border border-amber-500/40 min-w-[140px]">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-[10px] text-slate-400 w-12">Offer:</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editingComboOffer}
                                      onChange={(e) => setEditingComboOffer(e.target.value)}
                                      className="w-20 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs font-bold focus:outline-none focus:border-amber-400"
                                      placeholder="18.24"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const off = parseFloat(editingComboOffer);
                                        const tIdx = parseInt(editingComboTaskIndex, 10) || 12;
                                        if (!isNaN(off)) {
                                          const currentBal = u.balance || 0;
                                          const prevConfig = u.customCombo || {
                                            enabled: true,
                                            triggerTaskIndex: tIdx,
                                            comboPrice: currentBal + off,
                                            cashGap: off,
                                            commissionEarned: 85,
                                          };
                                          updateUserCustomCombo(u.username, {
                                            ...prevConfig,
                                            enabled: true,
                                            triggerTaskIndex: tIdx,
                                            cashGap: Math.max(0, off),
                                            comboPrice: Math.max(0, currentBal + off),
                                          });
                                          showToast(`Combo Offer updated to $${off.toFixed(2)} USDT for ${u.username}!`);
                                        }
                                        setEditingComboUser(null);
                                      }}
                                      className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                      title="Save Combo Offer"
                                    >
                                      <Check size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingComboUser(null)}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-[10px] text-slate-400 w-12">Task #:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="25"
                                      value={editingComboTaskIndex}
                                      onChange={(e) => setEditingComboTaskIndex(e.target.value)}
                                      className="w-20 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono text-xs focus:outline-none focus:border-sky-400"
                                      placeholder="12"
                                    />
                                  </div>
                                </div>
                              ) : (() => {
                                const combo = getComboOfferInfo(u);
                                const userWList = (withdrawals || []).filter(
                                  (w) => (w.username || '').trim().toLowerCase() === (u.username || '').trim().toLowerCase()
                                );
                                const userApprovedW = userWList.filter((w) => w.status === 'approved' || w.status === 'completed');
                                const userPendingW = userWList.filter((w) => w.status === 'pending');
                                const userTotalW = userWList.filter((w) => w.status !== 'rejected').length;

                                const withdrawBadge = (
                                  <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center gap-1 flex-wrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                        userApprovedW.length > 0
                                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                          : userPendingW.length > 0
                                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                          : 'bg-slate-900 text-slate-400 border-slate-800'
                                      }`}
                                      title={`Withdrawals made by ${u.username}: ${userTotalW} total (${userApprovedW.length} approved, ${userPendingW.length} pending)`}
                                    >
                                      <ArrowUpRight size={10} className={userApprovedW.length > 0 ? 'text-emerald-400' : 'text-slate-400'} />
                                      <span>Withdraws: {userTotalW}</span>
                                      {userApprovedW.length > 0 && <span className="text-[9px] text-emerald-400 font-normal">({userApprovedW.length}✓)</span>}
                                      {userPendingW.length > 0 && <span className="text-[9px] text-amber-400 font-normal">({userPendingW.length}⏳)</span>}
                                    </span>

                                    {/* Auto Round 2 Indicator if 1st withdrawal completed */}
                                    {u.accountCategory !== 'training_help' && (u.workCycle || 1) === 1 && userTotalW >= 1 && (
                                      <span
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono font-bold"
                                        title="1st withdrawal completed! Next task reset will auto-upgrade this user to Round 2 (3 Combos)"
                                      >
                                        ➔ Auto R2 on Reset
                                      </span>
                                    )}

                                    {u.accountCategory !== 'training_help' && (u.workCycle || 1) === 2 && userTotalW >= 2 && (
                                      <span
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono font-bold"
                                        title="2nd withdrawal completed! Next task reset will auto-upgrade this user to Round 3 (5 Combos)"
                                      >
                                        ➔ Auto R3 on Reset
                                      </span>
                                    )}
                                  </div>
                                );

                                if (!combo || combo.offer <= 0) {
                                  return (
                                    <div className="space-y-0.5 font-mono">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="text-slate-500 font-medium">$0.00</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingComboUser(u.username);
                                            setEditingComboOffer('18.24');
                                            setEditingComboTaskIndex('12');
                                          }}
                                          className="text-amber-500/80 hover:text-amber-400 text-[10px] underline cursor-pointer"
                                          title="Set combo offer for this user"
                                        >
                                          +set
                                        </button>
                                      </div>
                                      <div className="text-[9.5px] text-slate-500">No Offer</div>
                                      {withdrawBadge}
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-0.5 font-mono">
                                    <div className="font-bold text-amber-400 flex items-center space-x-1.5 flex-wrap">
                                      <span>${combo.offer.toFixed(2)} USDT</span>
                                      {combo.isPartial && (
                                        <span className="text-[9.5px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                                          Remaining
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingComboUser(u.username);
                                          setEditingComboOffer(combo.offer.toString());
                                          setEditingComboTaskIndex((combo.taskIndex || 12).toString());
                                        }}
                                        className="text-slate-500 hover:text-amber-300 text-[10px] underline cursor-pointer"
                                        title="Quick edit combo offer"
                                      >
                                        edit
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 flex-wrap">
                                      <span className="text-amber-300/90 font-medium">
                                        Combo Offer • Task #{combo.taskIndex}
                                      </span>
                                      {combo.isMulti && (
                                        <span className="text-[9px] px-1 rounded bg-sky-950 text-sky-300 border border-sky-800">
                                          Stage {combo.stageNumber}
                                        </span>
                                      )}
                                    </div>
                                    {combo.isPartial && (
                                      <div className="text-[9px] text-emerald-400 font-medium">
                                        Deposited: ${combo.depositedSoFar?.toFixed(2)} / ${combo.originalOffer?.toFixed(2)}
                                      </div>
                                    )}
                                    {withdrawBadge}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Tasks Today */}
                            <td className="px-4 py-3.5">
                              {(() => {
                                const userCompleted = (allOrders || orders || []).filter(
                                  (o) => o.status === 'completed' && (o.username || '').toLowerCase() === u.username.toLowerCase()
                                );
                                const userPending = (allOrders || orders || []).filter(
                                  (o) => o.status === 'pending' && (o.username || '').toLowerCase() === u.username.toLowerCase()
                                );
                                const completedCount = Math.max(u.todayTimes || 0, userCompleted.length);
                                const maxDaily = u.maxDailyTimes || 25;
                                const commEarned = Math.max(
                                  u.todayCommission || 0,
                                  parseFloat(userCompleted.reduce((s, o) => s + (o.commissionEarned || 0), 0).toFixed(2))
                                );

                                return (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-slate-100 font-mono text-xs">
                                        {completedCount}/{maxDaily}
                                      </span>
                                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-rose-500 rounded-full"
                                          style={{ width: `${Math.min(100, (completedCount / maxDaily) * 100)}%` }}
                                        ></div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const userWList = (withdrawals || []).filter(
                                            (w) => (w.username || '').trim().toLowerCase() === (u.username || '').trim().toLowerCase() && w.status !== 'rejected'
                                          );
                                          const wCount = userWList.length;
                                          const curCycle = u.workCycle || 1;
                                          const isReal = u.accountCategory !== 'training_help';
                                          const promoNotice = isReal && curCycle === 1 && wCount >= 1
                                            ? `\n\n✨ 1st withdrawal completed (${wCount}x)! This user will automatically graduate to Round 2 (3 Combos).`
                                            : isReal && curCycle === 2 && wCount >= 2
                                            ? `\n\n✨ 2nd withdrawal completed (${wCount}x)! This user will automatically graduate to Round 3 (5 Combos).`
                                            : isReal && curCycle === 1 && wCount === 0
                                            ? `\n\nℹ️ Note: User has 0 withdrawals. Round 1 (1 Combo) will be maintained.`
                                            : '';
                                          if (confirm(`Reset tasks for ${u.username} back to 0/25 and permanently delete all task record history?${promoNotice}`)) {
                                            resetUserTasks(u.username, undefined, 0, true);
                                          }
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                        title={`Quick reset ${u.username} tasks to 0/25 & delete all records`}
                                      >
                                        <RotateCcw size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Permanently delete all task order records for ${u.username}?`)) {
                                            clearUserOrders(u.username);
                                          }
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                        title={`Wipe all task order records for ${u.username}`}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-emerald-400 font-mono">
                                      +${commEarned.toFixed(2)} USDT comm
                                    </div>
                                    {userCompleted.length > 0 && (
                                      <div className="text-[9.5px] text-slate-400 font-medium">
                                        {userCompleted.length} order(s) in record
                                      </div>
                                    )}
                                    {userPending.length > 0 && (
                                      <div className="text-[9.5px] text-amber-400 font-medium">
                                        {userPending.length} pending combo/order
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Combo Trigger Info */}
                            <td className="px-4 py-3.5">
                              <div className="text-[10px] space-y-1">
                                {u.customCombo?.forceNext ? (
                                  <span className="text-amber-400 font-bold flex items-center space-x-1">
                                    <Zap size={11} />
                                    <span>FORCED NEXT</span>
                                  </span>
                                ) : u.customCombo?.multiStages && u.customCombo.multiStages.length > 0 ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center space-x-1">
                                      {u.accountCategory === 'training_help' ? (
                                        <span className="font-extrabold text-sky-300">🎓 Demo {u.customCombo.multiStages.length}-Stage:</span>
                                      ) : (
                                        <span className="font-extrabold text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                                          Round {u.workCycle || 1} ({u.customCombo.multiStages.length} Combo{u.customCombo.multiStages.length > 1 ? 's' : ''}):
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9.5px] text-slate-300 font-mono flex flex-wrap gap-1">
                                      {u.customCombo.multiStages.map((st, sIdx) => {
                                        const isRealUser = u.accountCategory !== 'training_help' && !isDemoAccount(u);
                                        const isManual24 = isRealUser && (st.isManual || st.triggerTaskIndex === 24);
                                        const isPassed = u.todayTimes >= st.triggerTaskIndex;
                                        return (
                                          <span
                                            key={st.stageIndex || sIdx}
                                            className={`px-1 py-0.2 rounded border ${
                                              isManual24 && !st.manualAdded
                                                ? 'bg-rose-950/80 text-rose-300 border-rose-600/70 font-bold'
                                                : isManual24 && st.manualAdded
                                                ? 'bg-purple-900/60 text-purple-200 border-purple-500/60 font-bold'
                                                : isPassed
                                                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                            title={
                                              isManual24 && !st.manualAdded
                                                ? 'Task #24 Manual Combo: NOT added yet! (Blocked until admin adds)'
                                                : isManual24 && st.manualAdded
                                                ? `Task #24 Manual Combo: Active ($${st.cashGap})`
                                                : `Task #${st.triggerTaskIndex}: $${st.cashGap}`
                                            }
                                          >
                                            #{st.triggerTaskIndex}:{' '}
                                            {isManual24 && !st.manualAdded ? 'Manual Req ⚠️' : `$${st.cashGap}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                    {u.accountCategory !== 'training_help' && !isDemoAccount(u) && (u.workCycle || 1) >= 3 && u.customCombo.multiStages.some((st) => st.triggerTaskIndex === 24) && (
                                      <div className="pt-0.5">
                                        {u.customCombo.multiStages.find((st) => st.triggerTaskIndex === 24)?.manualAdded ? (
                                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center space-x-0.5">
                                            <span>✓ #24 Combo Added (${u.customCombo.multiStages.find((st) => st.triggerTaskIndex === 24)?.cashGap})</span>
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-amber-400 font-bold flex items-center space-x-0.5">
                                            <span>⚠️ #24 Manual Offer Required</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : u.customCombo?.enabled ? (
                                  <div className="space-y-0.5">
                                    {u.accountCategory !== 'training_help' && (
                                      <span className="font-extrabold text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30 block w-fit">
                                        Round {u.workCycle || 1} (1 Combo)
                                      </span>
                                    )}
                                    <span className="text-slate-300 block">
                                      Task #{u.customCombo.triggerTaskIndex} (Combo Offer: ${u.customCombo.cashGap})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500">Disabled</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                                {/* Comprehensive Account Manager */}
                                <button
                                  type="button"
                                  onClick={() => openEditUserModal(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                                  title="Full Account Manager: Passwords, Balances, Wallet, VIP, Tasks"
                                >
                                  <Edit3 size={12} className="text-indigo-400" />
                                  <span>Edit Account</span>
                                </button>

                                {/* 1-Click Quick Password Reset to 112233 */}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await quickResetPasswordTo112233(u.username);
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10.5px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                                  title={`Change password for ${u.username} to 112233`}
                                >
                                  <Key size={11} className="text-amber-400" />
                                  <span>112233</span>
                                </button>

                                {/* 1-Click Cycle Presets for Real Users / Demo Preset for Training */}
                                {u.accountCategory === 'training_help' ? (
                                  <button
                                    type="button"
                                    onClick={() => applyHelpTrainingPreset(u.username)}
                                    className="px-2 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10.5px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                                    title="Apply 3-Stage Combo Preset ($159 -> $299 -> $490 Gaps)"
                                  >
                                    <span>🎓 3-Combo</span>
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-700/80 p-0.5 space-x-0.5">
                                    <button
                                      type="button"
                                      onClick={() => applyUserCyclePreset(u.username, 1)}
                                      className={`px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        (u.workCycle || 1) === 1
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                      title="Round 1: 1 Combo Offer (Task #12, $18.24 gap)"
                                    >
                                      R1 (1)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => applyUserCyclePreset(u.username, 2)}
                                      className={`px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        u.workCycle === 2
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                      title="Round 2: 3 Combo Offers (#8: $89.004, #15: $168.22, #22: $243.14)"
                                    >
                                      R2 (3)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => applyUserCyclePreset(u.username, 3)}
                                      className={`px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        u.workCycle === 3
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                      title="Round 3: 5 Auto Combos (#5, #10, #14, #17, #21) + #24 Manual Combo"
                                    >
                                      R3 (5+1)
                                    </button>
                                  </div>
                                )}

                                {/* Dedicated Button: Set / Edit Task #24 Manual Combo (Round 3 Users Only) */}
                                {u.accountCategory !== 'training_help' && !isDemoAccount(u) && (u.workCycle || 1) >= 3 && (
                                  <button
                                    type="button"
                                    onClick={() => openTask24Modal(u)}
                                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs ${
                                      (u.customCombo?.multiStages?.find((st) => st.triggerTaskIndex === 24)?.cashGap || 0) > 0 ||
                                      (u.customCombo?.triggerTaskIndex === 24 && (u.customCombo?.cashGap || 0) > 0) ||
                                      (u.cashGap || 0) > 0
                                        ? 'bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-500/50'
                                        : 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-500/60 animate-pulse'
                                    }`}
                                    title={
                                      (u.customCombo?.multiStages?.find((st) => st.triggerTaskIndex === 24)?.cashGap || 0) > 0 ||
                                      (u.customCombo?.triggerTaskIndex === 24 && (u.customCombo?.cashGap || 0) > 0) ||
                                      (u.cashGap || 0) > 0
                                        ? 'Task #24 Manual Combo Active! Click to edit.'
                                        : 'Task #24 Manual Combo Required! Click to add and unlock task #24.'
                                    }
                                  >
                                    <Zap size={11} className="text-amber-400" />
                                    <span>
                                      {(u.customCombo?.multiStages?.find((st) => st.triggerTaskIndex === 24)?.cashGap || 0) > 0 ||
                                      (u.customCombo?.triggerTaskIndex === 24 && (u.customCombo?.cashGap || 0) > 0) ||
                                      (u.cashGap || 0) > 0
                                        ? 'Edit #24'
                                        : '+ Set #24'}
                                    </span>
                                  </button>
                                )}

                                {/* Reset Tasks & Balance */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetTargetUsername(u.username);
                                    setResetTaskCount(0);
                                    setResetCustomBalance(u.balance.toString());
                                    setResetKeepBalance(true);
                                    setIsResetTaskModalOpen(true);
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Reset or adjust daily tasks and balance for this user"
                                >
                                  <RotateCcw size={12} />
                                  <span>Reset</span>
                                </button>

                                {/* Switch to User */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    switchUserAccount(u.username);
                                    showToast(`Switched to user account ${u.username}!`);
                                    navigateToUserApp();
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Test this user account in Member App"
                                >
                                  <UserCheck size={12} />
                                  <span>Switch</span>
                                </button>

                                {/* Configure Combo */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectUserForCombo(u.username);
                                    setActiveAdminTab('combos');
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Configure custom combo task for this user"
                                >
                                  <Zap size={12} />
                                  <span>Combo</span>
                                </button>

                                {/* Delete User (except currently active) */}
                                {allUsers.length > 1 && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Delete account ${u.username}? This cannot be undone.`)) {
                                        deleteUserAccount(u.username);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                                    title="Delete account"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DEDICATED DEMO & TRAINING ACCOUNTS (STRICTLY ISOLATED) */}
        {activeAdminTab === 'demo_accounts' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Description & Metrics Card */}
            <div className="bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 border border-sky-800/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-xl">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center space-x-2">
                        <span>Demo & Training Accounts Manager</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          STRICTLY ISOLATED
                        </span>
                      </h2>
                      <p className="text-xs text-sky-200/70">
                        Demo accounts are kept completely separate from the real user accounts list to keep your platform clean.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoCreateTab('batch');
                      setDemoBatchPrefix('Cari');
                      setDemoBatchCount('10');
                      setDemoBatchStartIndex('1');
                      setDemoBatchPassword('123456');
                      setDemoBatchBalance('0');
                      setIsAddDemoModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-sky-950/50 border border-sky-400/40 transition-all transform active:scale-95"
                  >
                    <Plus size={15} />
                    <span>+ Create 10 Demo (Cari001-010)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const names = demoUsers.map((u) => u.username);
                      setBatchPasswordUsernames(names.slice(0, 10).join(', '));
                      setBatchNewPassword('112233');
                      setIsBatchPasswordModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/45 hover:to-orange-600/45 text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-all transform active:scale-95"
                  >
                    <Key size={14} className="text-amber-400" />
                    <span>🔑 Change Passwords (112233)</span>
                  </button>
                </div>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Total Demo Accounts</div>
                  <div className="text-xl font-black text-sky-400 font-mono mt-0.5">{demoUsers.length}</div>
                  <div className="text-[10px] text-slate-500">Cari001 - Cari...</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Login Activity</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {demoUsers.filter((u) => (u.loginCount || 0) > 0 || u.lastActive === 'Active Now').length}/{demoUsers.length}
                  </div>
                  <div className="text-[10px] text-emerald-500/80">
                    {demoUsers.filter((u) => !u.loginCount && u.lastActive !== 'Active Now').length} Unopened
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Pass = 112233 (Done)</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {demoUsers.filter((u) => u.password === '112233').length}
                  </div>
                  <div className="text-[10px] text-emerald-500/80">Training Finished</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Pass ≠ 112233 (Active)</div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                    {demoUsers.filter((u) => u.password !== '112233').length}
                  </div>
                  <div className="text-[10px] text-amber-500/80">Ready for Reset</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Wallet Status</div>
                  <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                    {demoUsers.filter((u) => !u.withdrawalAddress).length}/{demoUsers.length}
                  </div>
                  <div className="text-[10px] text-cyan-500/80">Unbound (Zero Conflict)</div>
                </div>
              </div>

              {/* Quick Batch Controls */}
              {demoUsers.length > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Set password to 112233 for all ${demoUsers.length} demo accounts now?`)) {
                          const names = demoUsers.map((u) => u.username);
                          await batchChangeUserPassword(names, '112233');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Key size={13} />
                      <span>Set ALL to 112233 (1-Click)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Reset daily task progress to 0/25 for all ${demoUsers.length} demo accounts?`)) {
                          demoUsers.forEach((u) => resetUserTasks(u.username, 0, 0, true, 1, false));
                          showToast(`Reset tasks to 0/25 for all ${demoUsers.length} demo accounts!`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={13} />
                      <span>Reset ALL Demo Tasks (0/25)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to DELETE ALL ${demoUsers.length} demo accounts? Real member accounts will not be affected.`)) {
                        demoUsers.forEach((u) => deleteUserAccount(u.username));
                        showToast(`Deleted all ${demoUsers.length} demo training accounts!`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Clear All Demo Accounts</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-Navigation Tabs inside Demo Accounts Manager */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl overflow-x-auto shadow-md">
              <button
                type="button"
                onClick={() => setDemoActiveSubTab('accounts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  demoActiveSubTab === 'accounts'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users size={14} />
                <span>Demo Accounts List ({demoUsers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoActiveSubTab('deposits')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  demoActiveSubTab === 'deposits'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ArrowDownCircle size={14} className="text-emerald-400" />
                <span>Demo Deposits History ({demoDeposits.length})</span>
                {pendingDemoDepositsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                    {pendingDemoDepositsCount} pending
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDemoActiveSubTab('withdrawals')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  demoActiveSubTab === 'withdrawals'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ArrowUpCircle size={14} className="text-rose-400" />
                <span>Demo Withdrawals History ({demoWithdrawals.length})</span>
                {pendingDemoWithdrawalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    {pendingDemoWithdrawalsCount} pending
                  </span>
                )}
              </button>

              {(demoDeposits.length > 0 || demoWithdrawals.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Clear all demo transactions (${demoDeposits.length} deposits, ${demoWithdrawals.length} withdrawals)? Real users' transaction history will not be touched.`
                      )
                    ) {
                      clearAllDemoTransactions();
                    }
                  }}
                  className="ml-auto px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors"
                  title="Wipe demo deposit and withdrawal records"
                >
                  <Trash2 size={13} />
                  <span>Clear All Demo History ({demoDeposits.length + demoWithdrawals.length})</span>
                </button>
              )}
            </div>

            {/* SUBTAB 1: DEMO ACCOUNTS LIST */}
            {demoActiveSubTab === 'accounts' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Search & Filter Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={demoSearchTerm}
                        onChange={(e) => setDemoSearchTerm(e.target.value)}
                        placeholder="Search demo account (e.g. Cari001, Cari002)..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-semibold">Showing:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-mono text-xs font-bold">
                        {filteredDemoUsers.length} of {demoUsers.length} Demo Accounts
                      </span>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1">Filter Demo:</span>
                    <button
                      type="button"
                      onClick={() => setDemoFilter('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                        demoFilter === 'all'
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      All Demo ({demoUsers.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoFilter('pending_password')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                        demoFilter === 'pending_password'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-slate-800'
                      }`}
                    >
                      <span>🔑 Pass ≠ 112233</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {demoUsers.filter((u) => u.password !== '112233').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoFilter('password_done')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                        demoFilter === 'password_done'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                      }`}
                    >
                      <span>✅ Pass = 112233</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {demoUsers.filter((u) => u.password === '112233').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoFilter('in_progress')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                        demoFilter === 'in_progress'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>⚡ Tasks In Progress</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {demoUsers.filter((u) => (u.todayTimes || 0) > 0 && (u.todayTimes || 0) < (u.maxDailyTimes || 25)).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoFilter('completed_tasks')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1 ${
                        demoFilter === 'completed_tasks'
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>🎯 Tasks 25/25</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {demoUsers.filter((u) => (u.todayTimes || 0) >= (u.maxDailyTimes || 25)).length}
                      </span>
                    </button>
                  </div>
                </div>

            {/* Demo Accounts Table or Empty State */}
            {demoUsers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-3xl mx-auto">
                  🎓
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Demo Accounts Created Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Create 10 demo accounts at once (e.g. Cari001, Cari002 ... Cari010) with no bound wallet address. They will be stored exclusively in this tab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDemoCreateTab('batch');
                    setDemoBatchPrefix('Cari');
                    setDemoBatchCount('10');
                    setDemoBatchStartIndex('1');
                    setDemoBatchPassword('123456');
                    setDemoBatchBalance('0');
                    setIsAddDemoModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-950/50 inline-flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Plus size={15} />
                  <span>+ Create 10 Demo Accounts (Cari001-Cari010)</span>
                </button>
              </div>
            ) : filteredDemoUsers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No demo accounts match your search or filter.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Demo Account</th>
                        <th className="px-4 py-3.5">Login Password</th>
                        <th className="px-4 py-3.5">Login Activity & Geo</th>
                        <th className="px-4 py-3.5">Wallet Status</th>
                        <th className="px-4 py-3.5">Balance</th>
                        <th className="px-4 py-3.5">Tasks & 3-Stage Combos</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDemoUsers.map((u) => {
                        const isCurrent = currentUser?.username === u.username;
                        const isPass112233 = u.password === '112233';
                        const taskProgress = u.todayTimes || 0;
                        const maxTasks = u.maxDailyTimes || 25;
                        const percent = Math.min(100, Math.round((taskProgress / maxTasks) * 100));

                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isCurrent ? 'bg-sky-950/20' : ''
                            }`}
                          >
                            {/* Demo Account & Avatar */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-sky-900/60 border border-sky-500/40 flex items-center justify-center text-sm font-black text-sky-300 shrink-0">
                                  🎓
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-1.5 flex-wrap gap-1">
                                    <span className="font-mono text-sky-200">{u.username}</span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        CURRENT TESTER
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                      Demo
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Invite: <span className="text-slate-300">{u.invitationCode}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Password Status with 1-Click Set 112233 */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-2">
                                {isPass112233 ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40 font-bold flex items-center space-x-1">
                                    <span>✓ 112233</span>
                                    <span className="text-[9px] font-normal text-emerald-400">(Done)</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40 font-bold">
                                    {u.password}
                                  </span>
                                )}

                                {!isPass112233 && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await quickResetPasswordTo112233(u.username);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                                    title="Set password to 112233 with 1 click"
                                  >
                                    Set 112233
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Login Activity & Geo */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 font-mono text-[11px]">
                                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                                  {(u.loginCount || 0) > 0 ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                      <span>{u.loginCount} Logins</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-slate-800 text-slate-400 border border-slate-700">
                                      0 Logins (Unopened)
                                    </span>
                                  )}
                                  {u.lastActive === 'Active Now' && (
                                    <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-500 text-slate-950">
                                      ONLINE
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                                  <MapPin size={12} className="text-emerald-400 shrink-0" />
                                  <span className="truncate max-w-[150px]" title={u.location || 'Dhaka, Bangladesh'}>
                                    {u.location || 'Dhaka, Bangladesh'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-cyan-300 text-[10px]">
                                  <Globe size={11} className="text-cyan-400 shrink-0" />
                                  <span>{u.ipAddress || '103.145.74.22'}</span>
                                </div>
                                {u.device && (
                                  <div className="flex items-center space-x-1 text-slate-400 text-[9.5px]">
                                    <Smartphone size={10} className="text-slate-500 shrink-0" />
                                    <span className="truncate max-w-[140px]">{u.device}</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openLoginAuditModal(u)}
                                  className="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center space-x-1 cursor-pointer pt-0.5"
                                  title={`View login activity & geo history for ${u.username}`}
                                >
                                  <Activity size={10} />
                                  <span>Login Audit ({u.loginHistory?.length || u.loginCount || 0})</span>
                                </button>
                              </div>
                            </td>

                            {/* Wallet Status: No Wallet Bound by default */}
                            <td className="px-4 py-3.5">
                              {u.withdrawalAddress || u.walletAddress ? (
                                <div className="space-y-1">
                                  <div className="text-[10.5px] font-bold text-sky-400">
                                    {u.walletName || 'USDT TRC-20'}
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    <span
                                      className="font-mono text-[10.5px] text-amber-400 font-semibold select-all block truncate max-w-[135px]"
                                      title={u.withdrawalAddress || u.walletAddress || ''}
                                    >
                                      {u.withdrawalAddress || u.walletAddress}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(u.withdrawalAddress || u.walletAddress || '');
                                        showToast(`Copied wallet address for ${u.username}!`);
                                      }}
                                      className="text-slate-400 hover:text-white p-0.5"
                                      title="Copy Address"
                                    >
                                      <Copy size={11} />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateUserAccountDetails(u.username, { withdrawalAddress: '', walletAddress: null, walletBound: false });
                                      showToast(`Cleared wallet address for ${u.username}!`);
                                    }}
                                    className="text-[9px] text-rose-400 hover:text-rose-300 underline cursor-pointer block"
                                  >
                                    Unbind / Clear Wallet
                                  </button>
                                </div>
                              ) : (
                                <span className="px-2 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-semibold flex items-center space-x-1 w-fit">
                                  <span>🛡️ No Wallet (Unbound)</span>
                                </span>
                              )}
                            </td>

                            {/* Balance */}
                            <td className="px-4 py-3.5">
                              <div className="font-mono font-bold text-white">
                                ${u.balance.toFixed(2)}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateUserBalance(u.username, u.balance + 100);
                                  showToast(`Added +100 USDT to ${u.username}!`);
                                }}
                                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline mt-0.5 block"
                              >
                                +$100 USDT
                              </button>
                            </td>

                            {/* Tasks & Combos */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 max-w-[160px]">
                                <div className="flex items-center justify-between text-[10.5px]">
                                  <span className="text-slate-300 font-mono font-bold">
                                    {taskProgress} / {maxTasks}
                                  </span>
                                  <span className="text-sky-400 font-semibold">{percent}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      percent >= 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="text-[9.5px] text-slate-400">
                                  3-Combos: <strong className="text-sky-300">$159 • $299 • $490</strong>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                                {/* Demo User Transactions count & quick wipe */}
                                {(() => {
                                  const uDeposits = demoDeposits.filter(
                                    (d) => (d.username || '').toLowerCase() === u.username.toLowerCase()
                                  );
                                  const uWithdrawals = demoWithdrawals.filter(
                                    (w) => (w.username || '').toLowerCase() === u.username.toLowerCase()
                                  );
                                  if (uDeposits.length === 0 && uWithdrawals.length === 0) return null;

                                  return (
                                    <div className="flex items-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDemoTransactionUserFilter(u.username);
                                          setDemoActiveSubTab(uDeposits.length > 0 ? 'deposits' : 'withdrawals');
                                        }}
                                        className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-sky-300 text-[10.5px] font-semibold cursor-pointer"
                                        title={`View transactions for ${u.username}`}
                                      >
                                        {uDeposits.length} dep • {uWithdrawals.length} wth
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              `Clear all transaction history (deposits & withdrawals) for demo user ${u.username}?`
                                            )
                                          ) {
                                            clearUserDepositsAndWithdrawals(u.username);
                                          }
                                        }}
                                        className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                        title={`Clear transactions for ${u.username}`}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  );
                                })()}

                                {/* Switch / Test as this demo user */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    switchUserAccount(u.username);
                                    showToast(`Switched to demo account ${u.username}!`);
                                    navigateToUserApp();
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Test this demo account in Member App"
                                >
                                  <UserCheck size={12} />
                                  <span>Login / Test</span>
                                </button>

                                {/* Reset Tasks */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    resetUserTasks(u.username, 0, 0, true, 1, false);
                                    showToast(`Reset tasks to 0/25 for ${u.username}!`);
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Reset tasks to 0/25"
                                >
                                  <RotateCcw size={12} />
                                  <span>0/25</span>
                                </button>

                                {/* Configure Combos */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectUserForCombo(u.username);
                                    setActiveAdminTab('combos');
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Configure combos for this demo account"
                                >
                                  <Zap size={12} />
                                  <span>Combo</span>
                                </button>

                                {/* Delete demo account */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Delete demo account ${u.username}?`)) {
                                      deleteUserAccount(u.username);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                                  title="Delete demo account"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

            {/* SUBTAB 2: DEMO DEPOSITS HISTORY (ISOLATED) */}
            {demoActiveSubTab === 'deposits' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDemoDepositFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      demoDepositFilter === filter
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                {/* Account Filter dropdown */}
                <div className="flex items-center space-x-1.5 ml-2">
                  <span className="text-xs text-slate-400 font-semibold">User:</span>
                  <select
                    value={demoTransactionUserFilter}
                    onChange={(e) => setDemoTransactionUserFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">All Demo Accounts</option>
                    {demoUsers.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {demoDeposits.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Wipe all ${demoDeposits.length} demo deposit records? This will not touch real member records.`
                      )
                    ) {
                      demoDeposits.forEach((d) => deleteDepositRecord(d.id));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Wipe All Demo Deposits</span>
                </button>
              )}
            </div>

            {/* Deposits List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {(() => {
                  const filtered = demoDeposits.filter((d) => {
                    if (
                      demoTransactionUserFilter !== 'all' &&
                      (d.username || '').toLowerCase() !== demoTransactionUserFilter.toLowerCase()
                    ) {
                      return false;
                    }
                    if (demoDepositFilter === 'all') return true;
                    if (demoDepositFilter === 'completed') return d.status === 'completed' || d.status === 'approved';
                    return d.status === demoDepositFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-10 text-center space-y-2">
                        <ArrowDownCircle size={32} className="mx-auto text-slate-600" />
                        <div className="text-xs font-semibold text-slate-300">
                          No demo deposit records found for this filter.
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Demo account recharges are recorded here exclusively and will never leak into real members' deposit queue.
                        </div>
                      </div>
                    );
                  }

                  return filtered.map((d) => {
                    const isApproved = d.status === 'completed' || d.status === 'approved';
                    const isPending = d.status === 'pending';
                    const userRecord = demoUsers.find(
                      (u) => u.username.toLowerCase() === (d.username || '').toLowerCase()
                    );
                    const effectiveSenderWallet =
                      d.fromAddress?.trim() ||
                      userRecord?.walletAddress?.trim() ||
                      userRecord?.withdrawalAddress?.trim() ||
                      '';

                    return (
                      <div
                        key={d.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-emerald-400 font-mono">
                              +${d.amount.toFixed(2)} USDT
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              {d.currency || 'USDT'} ({d.network || 'TRC-20'})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400">
                            Demo Account: <strong className="text-sky-300 font-mono">{d.username}</strong> • Current Balance:{' '}
                            <span className="text-emerald-400 font-mono font-bold">
                              ${userRecord ? userRecord.balance.toFixed(2) : '0.00'} USDT
                            </span>{' '}
                            • Time: {d.createdAt}
                          </div>

                          {/* Sender and To Address */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] pt-0.5 font-mono">
                            <div className="p-2 rounded-lg bg-teal-950/20 border border-teal-500/20 flex items-center justify-between gap-1 text-teal-300">
                              <span className="truncate">From: {effectiveSenderWallet || 'TRC-20 Sender'}</span>
                              {effectiveSenderWallet && (
                                <button
                                  type="button"
                                  onClick={() => copyDepositField(effectiveSenderWallet, `demo-from-${d.id}`, 'Sender Wallet')}
                                  className="text-[10px] text-teal-400 hover:text-teal-200 cursor-pointer p-0.5"
                                >
                                  {copiedDepositKey === `demo-from-${d.id}` ? '✓' : <Copy size={11} />}
                                </button>
                              )}
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-1 text-slate-400">
                              <span className="truncate">To: {d.address}</span>
                              <button
                                type="button"
                                onClick={() => copyDepositField(d.address, `demo-to-${d.id}`, 'Platform Address')}
                                className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                              >
                                {copiedDepositKey === `demo-to-${d.id}` ? '✓' : <Copy size={11} />}
                              </button>
                            </div>
                          </div>

                          <div className="text-[10.5px] text-slate-500 font-mono select-all truncate max-w-md">
                            TX: {d.txHash || 'Demo Recharge Simulation'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveDeposit(d.id)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve & Credit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectDeposit(d.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 italic mr-2">
                              {isApproved ? `Approved at ${d.approvedAt || d.createdAt}` : 'Rejected'}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove demo deposit record ${d.id}?`)) {
                                deleteDepositRecord(d.id);
                              }
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete deposit record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

            {/* SUBTAB 3: DEMO WITHDRAWALS HISTORY (ISOLATED) */}
            {demoActiveSubTab === 'withdrawals' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDemoWithdrawalFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      demoWithdrawalFilter === filter
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                {/* Account Filter dropdown */}
                <div className="flex items-center space-x-1.5 ml-2">
                  <span className="text-xs text-slate-400 font-semibold">User:</span>
                  <select
                    value={demoTransactionUserFilter}
                    onChange={(e) => setDemoTransactionUserFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">All Demo Accounts</option>
                    {demoUsers.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {demoWithdrawals.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Wipe all ${demoWithdrawals.length} demo withdrawal records? This will not touch real member records.`
                      )
                    ) {
                      demoWithdrawals.forEach((w) => deleteWithdrawalRecord(w.id));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Wipe All Demo Withdrawals</span>
                </button>
              )}
            </div>

            {/* Withdrawals List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {(() => {
                  const filtered = demoWithdrawals.filter((w) => {
                    if (
                      demoTransactionUserFilter !== 'all' &&
                      (w.username || '').toLowerCase() !== demoTransactionUserFilter.toLowerCase()
                    ) {
                      return false;
                    }
                    if (demoWithdrawalFilter === 'all') return true;
                    if (demoWithdrawalFilter === 'completed') return w.status === 'completed' || w.status === 'approved';
                    return w.status === demoWithdrawalFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-10 text-center space-y-2">
                        <ArrowUpCircle size={32} className="mx-auto text-slate-600" />
                        <div className="text-xs font-semibold text-slate-300">
                          No demo withdrawal records found for this filter.
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Demo account withdrawal attempts are kept here exclusively and will never mix with real member payout requests.
                        </div>
                      </div>
                    );
                  }

                  return filtered.map((w) => {
                    const isApproved = w.status === 'completed' || w.status === 'approved';
                    const isPending = w.status === 'pending';
                    const userRecord = demoUsers.find(
                      (u) => u.username.toLowerCase() === (w.username || '').toLowerCase()
                    );
                    return (
                      <div
                        key={w.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-rose-400 font-mono">
                              -${w.amount.toFixed(2)} USDT
                            </span>
                            <span className="text-xs text-slate-400">
                              (Net payout: <strong className="text-white">${w.actualAmount.toFixed(2)}</strong>, Fee: $
                              {w.fee.toFixed(2)})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400">
                            Demo Account: <strong className="text-sky-300 font-mono">{w.username}</strong> • Remaining Balance:{' '}
                            <span className="text-emerald-400 font-mono font-bold">
                              ${userRecord ? userRecord.balance.toFixed(2) : '0.00'} USDT
                            </span>{' '}
                            • Submitted: {w.createdAt}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs mt-1.5">
                            <span className="text-slate-400">Wallet Name:</span>
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                              {w.walletName || userRecord?.walletName || 'USDT TRC-20'}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Network:</span>
                            <span className="text-slate-300 font-semibold">{w.network || 'TRC-20'}</span>
                          </div>
                          <div className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-slate-400">Destination TRC-20 Wallet:</span>
                            <span className="text-amber-300 font-bold select-all bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 tracking-wider break-all">
                              {w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress || 'N/A'}
                            </span>
                            {(w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress) && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress || '');
                                  showToast('Wallet address copied to clipboard!');
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-[11px] font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                                title="Copy Full Address"
                              >
                                <Copy size={12} />
                                <span>Copy</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(w.id)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve & Release</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectWithdrawal(w.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <XCircle size={14} />
                                <span>Reject & Refund</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 italic mr-2">
                              {isApproved ? `Approved at ${w.approvedAt || w.createdAt}` : 'Rejected & Refunded'}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove demo withdrawal record ${w.id}?`)) {
                                deleteWithdrawalRecord(w.id);
                              }
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete withdrawal record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

        {/* TAB 3: CUSTOM COMBO OFFER ENGINE */}
        {activeAdminTab === 'combos' && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <Zap size={20} className="text-amber-400" />
                    <span>Combination Task & Help Demo Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Control single combos or the 3-Stage progressive combo pipeline ($159 &rarr; $299 &rarr; $490).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => applyHelpTrainingPreset(selectedUsername)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 cursor-pointer transition-all shrink-0"
                  title="Apply 3-Stage Combo Preset: Enables 3 stages ($159, $299, $490)"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>🎓 Apply 3-Stage Help Preset</span>
                </button>
              </div>

              {/* Target User Selector & Quick Cycle Presets */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Target User Account</span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      Balance: ${targetUserRecord?.balance.toFixed(2)} USDT • Tasks {targetUserRecord?.todayTimes}/25 • Round {targetUserRecord?.workCycle || 1}
                    </span>
                  </label>
                  <select
                    value={selectedUsername}
                    onChange={(e) => handleSelectUserForCombo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                  >
                    <optgroup label="👤 Real Member Accounts">
                      {realUsers.map((u) => (
                        <option key={u.id} value={u.username}>
                          {u.username} ({u.accountCategory === 'vip_elite' ? '👑 VIP Elite' : '👤 Standard'} • Round {u.workCycle || 1} • VIP {u.vipLevel} • ${u.balance.toFixed(2)} USDT • Tasks {u.todayTimes}/25)
                        </option>
                      ))}
                    </optgroup>
                    {demoUsers.length > 0 && (
                      <optgroup label="🎓 Training Demo Accounts (Isolated)">
                        {demoUsers.map((u) => (
                          <option key={u.id} value={u.username}>
                            🎓 {u.username} (Pass: {u.password} • Tasks {u.todayTimes}/25 • ${u.balance.toFixed(2)} USDT)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 1-Click Round Selection Bar */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Zap size={13} className="text-amber-400" />
                      <span>One-Click Combo Cycle Presets:</span>
                    </span>
                    <span className="text-amber-400/90 font-mono text-[10px]">
                      Selected User: {selectedUsername} (Round {targetUserRecord?.workCycle || 1})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        applyUserCyclePreset(selectedUsername, 1);
                        setUserStages(getComboStagesForCycle(1));
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        (targetUserRecord?.workCycle || 1) === 1
                          ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-amber-300">Round 1 (New)</div>
                      <div className="text-[9.5px] text-slate-300 font-mono">1 Combo (#12 • $18.24)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        applyUserCyclePreset(selectedUsername, 2);
                        setUserStages(getComboStagesForCycle(2));
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        targetUserRecord?.workCycle === 2
                          ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-amber-300">Round 2 (2nd Reset)</div>
                      <div className="text-[9.5px] text-slate-300 font-mono">3 Combos (#8,#15,#22)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        applyUserCyclePreset(selectedUsername, 3);
                        setUserStages(getComboStagesForCycle(3));
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        targetUserRecord?.workCycle === 3
                          ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-amber-300">Round 3 (3rd Reset)</div>
                      <div className="text-[9.5px] text-slate-300 font-mono">5 Combos (5 Stages)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        applyHelpTrainingPreset(selectedUsername);
                        setUserStages(DEFAULT_HELP_TRAINING_COMBO_STAGES);
                      }}
                      className="p-2 rounded-xl text-left border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-sky-300">🎓 Demo 3-Stage</div>
                      <div className="text-[9.5px] text-sky-200/80 font-mono">3 Combos ($159-$490)</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-STAGE PROGRESSIVE COMBO PIPELINE CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 border border-sky-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-bold text-xs">
                      🎓
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>3-Stage Help / Training Combo Pipeline</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Demo Teaching Model
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Stage 1 ($159 Gap) &bull; Stage 2 ($299 Gap) &bull; Stage 3 ($490 Gap)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMultiStages}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer shadow flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Check size={14} />
                    <span>Save Pipeline Changes</span>
                  </button>
                </div>

                {/* 4 Stage Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userStages.map((st, idx) => {
                    const isPassed = (targetUserRecord?.todayTimes || 0) >= st.triggerTaskIndex;
                    const isCurrentTrigger = (targetUserRecord?.todayTimes || 0) === st.triggerTaskIndex - 1;

                    return (
                      <div
                        key={st.stageIndex}
                        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                          isCurrentTrigger
                            ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                            : isPassed
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center text-xs font-bold">
                              #{st.stageIndex}
                            </span>
                            <span className="text-xs font-bold text-white">
                              Stage {st.stageIndex} &bull; Task #{st.triggerTaskIndex}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {isCurrentTrigger && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-slate-950 animate-pulse">
                                NEXT TRIGGER
                              </span>
                            )}
                            {isPassed && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                COMPLETED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Editable Inputs for this Stage */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <label className="text-slate-400 text-[10px] block">Trigger Task #</label>
                            <input
                              type="number"
                              min={1}
                              max={25}
                              value={st.triggerTaskIndex}
                              onChange={(e) => handleUpdateStageField(idx, 'triggerTaskIndex', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-amber-400 font-bold text-[10px] block">Required Gap ($)</label>
                            <input
                              type="number"
                              step="1"
                              value={st.cashGap}
                              onChange={(e) => handleUpdateStageField(idx, 'cashGap', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 text-[10px] block">Order Value ($)</label>
                            <input
                              type="number"
                              step="1"
                              value={st.comboPrice}
                              onChange={(e) => handleUpdateStageField(idx, 'comboPrice', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-emerald-400 font-bold text-[10px] block">Commission ($)</label>
                            <input
                              type="number"
                              step="1"
                              value={st.commissionEarned}
                              onChange={(e) => handleUpdateStageField(idx, 'commissionEarned', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                            />
                          </div>
                        </div>

                        {/* Test Actions for this Stage */}
                        <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-800/60">
                          <button
                            type="button"
                            onClick={() => jumpToTask(selectedUsername, Math.max(0, st.triggerTaskIndex - 1))}
                            className="w-1/2 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            title={`Set user task count to ${st.triggerTaskIndex - 1} so next click triggers Task #${st.triggerTaskIndex}`}
                          >
                            <Zap size={11} className="text-amber-400" />
                            <span>Jump to Task #{st.triggerTaskIndex - 1}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              manualCreditDeposit(selectedUsername, st.cashGap);
                              clearUserCashGap(selectedUsername);
                              showToast(`Credited $${st.cashGap} gap & unfroze ${selectedUsername}!`);
                            }}
                            className="w-1/2 py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            title={`Simulate deposit approval of $${st.cashGap} to unlock Stage ${st.stageIndex}`}
                          >
                            <DollarSign size={11} />
                            <span>Deposit ${st.cashGap} & Unlock</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Progress & Reset Controls for Selected User */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <Activity size={14} className="text-rose-400" />
                      <span>Daily Task Progress:</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-bold">
                        {targetUserRecord?.todayTimes || 0} / 25
                      </span>
                    </div>
                    {targetUserRecord && targetUserRecord.frozenBalance > 0 && (
                      <p className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
                        <AlertTriangle size={12} />
                        <span>
                          Account Frozen in Escrow: ${targetUserRecord.frozenBalance.toFixed(2)} USDT (Combo Offer: ${targetUserRecord.cashGap.toFixed(2)} USDT)
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const userWList = (withdrawals || []).filter(
                          (w) => (w.username || '').trim().toLowerCase() === (selectedUsername || '').trim().toLowerCase() && w.status !== 'rejected'
                        );
                        const wCount = userWList.length;
                        const curCycle = targetUserRecord?.workCycle || 1;
                        const isReal = targetUserRecord?.accountCategory !== 'training_help';
                        const promoNotice = isReal && curCycle === 1 && wCount >= 1
                          ? `\n\n✨ 1st withdrawal completed (${wCount}x)! User will automatically graduate to Round 2 (3 Combos).`
                          : isReal && curCycle === 2 && wCount >= 2
                          ? `\n\n✨ 2nd withdrawal completed (${wCount}x)! User will automatically graduate to Round 3 (5 Combos).`
                          : isReal && curCycle === 1 && wCount === 0
                          ? `\n\nℹ️ Note: User has 0 withdrawals. Round 1 (1 Combo) will be maintained.`
                          : '';
                        if (confirm(`Reset ${selectedUsername}'s tasks back to 0/25 and permanently delete all task record history?${promoNotice}`)) {
                          resetUserTasks(selectedUsername, undefined, 0, true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                      title="Reset this user's tasks to 0/25 and wipe all records"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Tasks (0/25 & Wipe Records)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently delete all task order record history for ${selectedUsername}?`)) {
                          clearUserOrders(selectedUsername);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                      title="Wipe task order records for this user"
                    >
                      <Trash2 size={13} />
                      <span>Clear Records</span>
                    </button>

                    {targetUserRecord && targetUserRecord.frozenBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => clearUserCashGap(selectedUsername)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title="Unfreeze escrow and clear cash gap"
                      >
                        <Check size={13} />
                        <span>Clear Gap & Unfreeze</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-semibold">Fast Jump to Stage:</span>
                  <button
                    type="button"
                    onClick={() => jumpToTask(selectedUsername, 5)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                  >
                    Task 5/25 (Stage 1 @ 6)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTask(selectedUsername, 11)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                  >
                    Task 11/25 (Stage 2 @ 12)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTask(selectedUsername, 17)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                  >
                    Task 17/25 (Stage 3 @ 18)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTask(selectedUsername, 22)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                  >
                    Task 22/25 (Stage 4 @ 23)
                  </button>
                </div>
              </div>

              {/* Single Combo Trigger Fallback / Force Trigger */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Zap size={14} className="text-amber-400" />
                    <span>Single Ad-hoc Combo Override / Force Next Trigger</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => forceInjectCombo(selectedUsername)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-md transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Zap size={12} className="fill-slate-950" />
                    <span>⚡ Force Trigger on Next Task</span>
                  </button>
                </div>

                <form onSubmit={handleSaveCombo} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 text-[10px]">Task Number</label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={triggerTaskIndex}
                        onChange={(e) => setTriggerTaskIndex(parseInt(e.target.value, 10) || 12)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px]">Order Value ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={comboPrice}
                        onChange={(e) => setComboPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-amber-400 text-[10px] font-bold">Deposit Gap ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={cashGap}
                        onChange={(e) => setCashGap(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-emerald-400 text-[10px] font-bold">Commission ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={commissionEarned}
                        onChange={(e) => setCommissionEarned(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-slate-300 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comboEnabled}
                        onChange={(e) => setComboEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                      />
                      <span>Enable Single Combo Override</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                    >
                      Save Single Override
                    </button>
                  </div>
                </form>
              </div>

              {/* Explanation card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>How Combination Tasks & 3-Stage Trainee Flow Work:</span>
                </div>
                <p>
                  1. <strong>Trainee Help Account</strong> starts with 25 daily tasks.
                </p>
                <p>
                  2. At <strong>Task #6</strong>, Stage 1 combo hits &rarr; freezes balance in escrow and demands <strong>$159.00</strong> USDT top-up.
                </p>
                <p>
                  3. At <strong>Task #12</strong>, Stage 2 combo hits &rarr; demands <strong>$299.00</strong> USDT top-up.
                </p>
                <p>
                  4. At <strong>Task #18</strong>, Stage 3 combo hits &rarr; demands <strong>$490.00</strong> USDT top-up.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEPOSIT APPROVAL QUEUE */}
        {activeAdminTab === 'deposits' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Active Platform Deposit Address Card */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Platform TRC-20 Deposit Wallet (USDT)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="font-mono text-amber-300 text-xs truncate select-all">
                    {depositAddressInput || adminDepositAddresses[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(depositAddressInput || adminDepositAddresses[0]);
                      showToast('Address copied to clipboard!');
                    } catch {}
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('settings')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Edit3 size={13} />
                  <span>Change in Settings</span>
                </button>
              </div>
            </div>

            {/* Isolation Notice Banner */}
            <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-sky-400 shrink-0" />
                <span>
                  Showing <strong>Real Member Deposits ({realDeposits.length})</strong>. Demo training deposit history ({demoDeposits.length}) is strictly isolated inside the Demo Accounts tab.
                </span>
              </div>
              {demoDeposits.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveAdminTab('demo_accounts');
                    setDemoActiveSubTab('deposits');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
                >
                  View {demoDeposits.length} Demo Deposits &rarr;
                </button>
              )}
            </div>

            {/* Summary Statistics Cards */}
            {(() => {
              const pendingList = realDeposits.filter((d) => d.status === 'pending');
              const approvedList = realDeposits.filter((d) => d.status === 'completed' || d.status === 'approved');
              const totalApprovedSum = approvedList.reduce((sum, d) => sum + (d.amount || 0), 0);
              const totalPendingSum = pendingList.reduce((sum, d) => sum + (d.amount || 0), 0);
              const uniqueUsernames = Array.from(
                new Set(realDeposits.map((d) => (d.username || '').trim()).filter(Boolean))
              );

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Total Real Deposits</span>
                      <ArrowDownCircle size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      ${totalApprovedSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      {approvedList.length} approved transactions
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Pending Approval</span>
                      <Clock size={14} className={pendingList.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
                    </div>
                    <div className={`text-lg font-black font-mono ${pendingList.length > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                      {pendingList.length > 0
                        ? `$${totalPendingSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '$0.00'}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      {pendingList.length} recharges waiting
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Depositing Accounts</span>
                      <Users size={14} className="text-sky-400" />
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {uniqueUsernames.length}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      Unique member accounts
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Queue Total</span>
                      <Shield size={14} className="text-rose-400" />
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {realDeposits.length} Records
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      All statuses combined
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Toolbar: Search, Filters, and Manual Credit */}
            <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={depositSearchQuery}
                    onChange={(e) => setDepositSearchQuery(e.target.value)}
                    placeholder="Search by Username, Sender Wallet, To Address, or TXID..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                  />
                  {depositSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDepositSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filter by User Dropdown */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                    <Users size={13} className="text-slate-500" />
                    <span>User:</span>
                  </span>
                  <select
                    value={depositUserFilter}
                    onChange={(e) => setDepositUserFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="all">All Member Accounts ({realDeposits.length})</option>
                    {Array.from(
                      new Set(realDeposits.map((d) => (d.username || '').trim()).filter(Boolean))
                    ).map((uName) => {
                      const count = realDeposits.filter(
                        (d) => (d.username || '').toLowerCase() === uName.toLowerCase()
                      ).length;
                      return (
                        <option key={uName} value={uName}>
                          {uName} ({count} deposits)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Manual Credit Action */}
                <button
                  type="button"
                  onClick={() => {
                    const defaultUser = realUsers[0]?.username || '';
                    setCreditUser(defaultUser);
                    const targetU = allUsers.find(
                      (u) => u.username.toLowerCase() === defaultUser.toLowerCase()
                    );
                    setCreditFromAddress(targetU?.walletAddress || targetU?.withdrawalAddress || '');
                    setIsCreditModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors shrink-0"
                >
                  <Plus size={14} />
                  <span>+ Manual Credit USDT</span>
                </button>
              </div>

              {/* Status Filter Tabs & Reset */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
                  {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => {
                    const count = realDeposits.filter((d) => {
                      if (filter === 'all') return true;
                      if (filter === 'completed') return d.status === 'completed' || d.status === 'approved';
                      return d.status === filter;
                    }).length;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setDepositFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          depositFilter === filter
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{filter}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                            depositFilter === filter
                              ? 'bg-rose-950/80 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(depositSearchQuery || depositUserFilter !== 'all' || depositFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDepositSearchQuery('');
                      setDepositUserFilter('all');
                      setDepositFilter('all');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Deposits List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {(() => {
                  const filtered = realDeposits.filter((d) => {
                    // Status filter
                    if (depositFilter === 'completed') {
                      if (d.status !== 'completed' && d.status !== 'approved') return false;
                    } else if (depositFilter !== 'all') {
                      if (d.status !== depositFilter) return false;
                    }

                    // User filter
                    if (
                      depositUserFilter !== 'all' &&
                      (d.username || '').toLowerCase() !== depositUserFilter.toLowerCase()
                    ) {
                      return false;
                    }

                    // Search query
                    if (depositSearchQuery.trim()) {
                      const q = depositSearchQuery.toLowerCase().trim();
                      const uRec = allUsers.find(
                        (u) => u.username.toLowerCase() === (d.username || '').toLowerCase()
                      );
                      const effectiveFrom =
                        d.fromAddress || uRec?.walletAddress || uRec?.withdrawalAddress || '';
                      const matchUser = (d.username || '').toLowerCase().includes(q);
                      const matchFrom = effectiveFrom.toLowerCase().includes(q);
                      const matchTo = (d.address || '').toLowerCase().includes(q);
                      const matchTx = (d.txHash || '').toLowerCase().includes(q);
                      const matchAmount = (d.amount || '').toString().includes(q);
                      if (!matchUser && !matchFrom && !matchTo && !matchTx && !matchAmount) {
                        return false;
                      }
                    }

                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-10 text-center space-y-3">
                        <ArrowDownCircle size={36} className="mx-auto text-slate-600" />
                        <div className="text-sm font-bold text-slate-300">
                          No real member deposits found matching criteria.
                        </div>
                        <div className="text-xs text-slate-500 max-w-md mx-auto">
                          Try adjusting your search query, status filter ({depositFilter}), or user account selection ({depositUserFilter}).
                        </div>
                        {demoDeposits.length > 0 && (
                          <div className="text-xs text-sky-400 pt-2">
                            Looking for demo recharges? Check the dedicated{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAdminTab('demo_accounts');
                                setDemoActiveSubTab('deposits');
                              }}
                              className="underline font-bold hover:text-sky-300 cursor-pointer"
                            >
                              Demo Deposits Sub-tab ({demoDeposits.length})
                            </button>
                            .
                          </div>
                        )}
                      </div>
                    );
                  }

                  return filtered.map((d) => {
                    const isApproved = d.status === 'completed' || d.status === 'approved';
                    const isPending = d.status === 'pending';
                    const userRecord = allUsers.find(
                      (u) => u.username.toLowerCase() === (d.username || '').toLowerCase()
                    );
                    const effectiveSenderWallet =
                      d.fromAddress?.trim() ||
                      userRecord?.walletAddress?.trim() ||
                      userRecord?.withdrawalAddress?.trim() ||
                      '';
                    const effectiveWalletName =
                      d.walletName || userRecord?.walletName || 'TRC-20 Wallet';

                    return (
                      <div
                        key={d.id}
                        className={`p-4 sm:p-5 transition-colors ${
                          isPending
                            ? 'bg-amber-950/15 hover:bg-amber-950/25'
                            : isApproved
                            ? 'hover:bg-slate-800/40'
                            : 'bg-rose-950/10 hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left Column: Details */}
                          <div className="space-y-2.5 flex-1 min-w-0">
                            {/* Line 1: Amount, Protocol, Status */}
                            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                              <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
                                +${d.amount.toFixed(2)} USDT
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                                {d.currency || 'USDT'} ({d.network || 'TRC-20'})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                                  isApproved
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isPending
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <CheckCircle2 size={11} />
                                    <span>Approved & Credited</span>
                                  </>
                                ) : isPending ? (
                                  <>
                                    <Clock size={11} />
                                    <span>Pending Admin Approval</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={11} />
                                    <span>Rejected</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Line 2: User Account info - Which user deposited into which user */}
                            <div className="flex items-center space-x-2 text-xs text-slate-300 flex-wrap gap-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 font-medium">Deposited To Member Account:</span>
                              <strong className="text-white text-xs sm:text-sm font-bold bg-sky-950/80 text-sky-300 px-2.5 py-0.5 rounded-lg border border-sky-600/40 font-mono flex items-center space-x-1">
                                <span>👤 {d.username || 'System User'}</span>
                              </strong>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">Current Balance:</span>
                              <span className="text-emerald-400 font-mono font-bold">
                                ${userRecord ? userRecord.balance.toFixed(2) : '0.00'} USDT
                              </span>
                              {userRecord && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  VIP {userRecord.vipLevel}
                                </span>
                              )}
                              {userRecord?.cashGap && userRecord.cashGap > 0 ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Combo Gap: ${userRecord.cashGap.toFixed(2)}
                                </span>
                              ) : null}
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">Deposit Time:</span>
                              <span className="text-slate-200 font-mono font-semibold">{d.createdAt}</span>
                            </div>

                            {/* Line 3: WALLET ADDRESSES - Sender (From) and Platform (To) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-0.5">
                              {/* SENDER WALLET ADDRESS (FROM) */}
                              <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-teal-300 font-bold flex items-center space-x-1">
                                    <ArrowUpRight size={13} className="text-teal-400" />
                                    <span>Sender Wallet Address (From):</span>
                                  </span>
                                  <span className="text-[10px] text-teal-400/90 font-medium font-mono">
                                    {effectiveWalletName}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-mono text-white text-[11.5px] truncate select-all">
                                    {effectiveSenderWallet || (
                                      <span className="text-slate-500 italic">Not specified (Check user profile)</span>
                                    )}
                                  </span>
                                  {effectiveSenderWallet && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyDepositField(effectiveSenderWallet, `from-${d.id}`, 'Sender Wallet Address')
                                      }
                                      className="px-2 py-1 rounded-lg bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 text-[10px] font-semibold flex items-center space-x-1 shrink-0 cursor-pointer transition-colors"
                                      title="Copy Sender Wallet"
                                    >
                                      {copiedDepositKey === `from-${d.id}` ? (
                                        <Check size={12} className="text-emerald-400" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                      <span>{copiedDepositKey === `from-${d.id}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* PLATFORM RECEIVING WALLET (TO) */}
                              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                                    <ArrowDownCircle size={13} className="text-slate-500" />
                                    <span>Receiving Platform Wallet (To):</span>
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    One Time Deposit Address
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-mono text-slate-300 text-[11.5px] truncate select-all">
                                    {d.address}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyDepositField(d.address, `to-${d.id}`, 'Platform Deposit Address')
                                    }
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold flex items-center space-x-1 shrink-0 cursor-pointer transition-colors"
                                    title="Copy Platform Address"
                                  >
                                    {copiedDepositKey === `to-${d.id}` ? (
                                      <Check size={12} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                    <span>{copiedDepositKey === `to-${d.id}` ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Line 4: TX Hash & Approval Timestamp */}
                            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-slate-500">TX Hash:</span>
                                <span className="text-slate-300 select-all font-mono">{d.txHash || 'Platform Recharge'}</span>
                                {d.txHash && (
                                  <button
                                    type="button"
                                    onClick={() => copyDepositField(d.txHash, `tx-${d.id}`, 'TX Hash')}
                                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                                    title="Copy TX Hash"
                                  >
                                    {copiedDepositKey === `tx-${d.id}` ? (
                                      <Check size={11} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                )}
                              </div>
                              {d.approvedAt && (
                                <div className="text-emerald-400/90 italic font-mono text-[10.5px]">
                                  Approved: {d.approvedAt}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Actions */}
                          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveDeposit(d.id)}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                                >
                                  <CheckCircle2 size={15} />
                                  <span>Approve & Credit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectDeposit(d.id)}
                                  className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                                >
                                  <XCircle size={15} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove deposit record ${d.id}?`)) {
                                  deleteDepositRecord(d.id);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete deposit record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WITHDRAWAL APPROVAL QUEUE */}
        {activeAdminTab === 'withdrawals' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Isolation Notice Banner */}
            <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-sky-400 shrink-0" />
                <span>
                  Showing <strong>Real Member Withdrawals ({realWithdrawals.length})</strong>. Demo training withdrawal history ({demoWithdrawals.length}) is strictly isolated inside the Demo Accounts tab.
                </span>
              </div>
              {demoWithdrawals.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveAdminTab('demo_accounts');
                    setDemoActiveSubTab('withdrawals');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
                >
                  View {demoWithdrawals.length} Demo Withdrawals &rarr;
                </button>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-2 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Filter:</span>
              {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setWithdrawalFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    withdrawalFilter === filter
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Withdrawals List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {(() => {
                  const filtered = realWithdrawals.filter((w) => {
                    if (withdrawalFilter === 'all') return true;
                    if (withdrawalFilter === 'completed') return w.status === 'completed' || w.status === 'approved';
                    return w.status === withdrawalFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center space-y-2">
                        <ArrowUpCircle size={32} className="mx-auto text-slate-600" />
                        <div className="text-xs font-semibold text-slate-400">
                          No real member withdrawals found in this filter ({withdrawalFilter}).
                        </div>
                        {demoWithdrawals.length > 0 && (
                          <div className="text-[11px] text-sky-400">
                            Looking for demo withdrawals? Check the dedicated{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAdminTab('demo_accounts');
                                setDemoActiveSubTab('withdrawals');
                              }}
                              className="underline font-bold hover:text-sky-300 cursor-pointer"
                            >
                              Demo Withdrawals Sub-tab
                            </button>
                            .
                          </div>
                        )}
                      </div>
                    );
                  }

                  return filtered.map((w) => {
                    const isApproved = w.status === 'completed' || w.status === 'approved';
                    const isPending = w.status === 'pending';
                    const userRecord = allUsers.find(
                      (u) => u.username.toLowerCase() === (w.username || '').toLowerCase()
                    );
                    return (
                      <div
                        key={w.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-rose-400 font-mono">
                              -${w.amount.toFixed(2)} USDT
                            </span>
                            <span className="text-xs text-slate-400">
                              (Net payout: <strong className="text-white">${w.actualAmount.toFixed(2)}</strong>, Fee: $
                              {w.fee.toFixed(2)})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400">
                            Account: <strong className="text-white">{w.username || 'Member'}</strong> • Remaining Balance:{' '}
                            <span className="text-emerald-400 font-mono font-bold">
                              ${userRecord ? userRecord.balance.toFixed(2) : '0.00'} USDT
                            </span>{' '}
                            • Submitted: {w.createdAt}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs mt-1.5">
                            <span className="text-slate-400">Wallet Name:</span>
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                              {w.walletName || userRecord?.walletName || 'USDT TRC-20'}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Network:</span>
                            <span className="text-slate-300 font-semibold">{w.network || 'TRC-20'}</span>
                          </div>
                          <div className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-slate-400">Destination TRC-20 Wallet:</span>
                            <span className="text-amber-300 font-bold select-all bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 tracking-wider break-all">
                              {w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress || 'N/A'}
                            </span>
                            {(w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress) && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(w.walletAddress || userRecord?.walletAddress || userRecord?.withdrawalAddress || '');
                                  showToast('Wallet address copied to clipboard!');
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-[11px] font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                                title="Copy Full Address"
                              >
                                <Copy size={12} />
                                <span>Copy</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(w.id)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve & Release</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectWithdrawal(w.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <XCircle size={14} />
                                <span>Reject & Refund</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 italic mr-2">
                              {isApproved ? `Approved at ${w.approvedAt || w.createdAt}` : 'Rejected & Refunded'}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove withdrawal record ${w.id}?`)) {
                                deleteWithdrawalRecord(w.id);
                              }
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete withdrawal record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & DIRECT LINK */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
            {/* Platform Deposit Wallet Address Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Platform TRON (TRC-20) Deposit Wallet Address</h3>
                  <p className="text-xs text-slate-400">
                    Set your official USDT TRC-20 address where user recharge payments will be sent:
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDepositAddresses} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Active TRC-20 Wallet Address (USDT)</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE IN DEPOSIT MODAL & QR
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={depositAddressInput}
                      onChange={(e) => setDepositAddressInput(e.target.value)}
                      placeholder="Paste your real TRON TRC-20 USDT address (e.g. TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT)"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <strong className="text-slate-300">How this works:</strong> When any user opens the Deposit page in the app, the QR code and wallet address will instantly update to this address. All incoming USDT transfers will go to this wallet.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingDepositAddresses}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-950/20 flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>{isSavingDepositAddresses ? 'Saving...' : 'Save Deposit Address'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(depositAddressInput);
                        showToast('Address copied to clipboard!');
                      } catch {}
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Copy size={13} />
                    <span>Copy Address</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Secret URL Display Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Private Admin Software Link</h3>
                  <p className="text-xs text-slate-400">
                    Use this dedicated link to access the admin portal from any browser or phone:
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-mono text-xs text-amber-300 select-all flex-1 truncate">{directAdminLink}</span>
                <button
                  type="button"
                  onClick={handleCopyAdminLink}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Tip: You can add this URL to your phone's home screen as a Web App to open your Admin Console with a
                single tap!
              </p>
            </div>

            {/* Change Admin Password Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Admin Credentials</h3>
                  <p className="text-xs text-slate-400">
                    Update your admin username and password for accessing this software portal:
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePasswordChange} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Admin Username</label>
                  <input
                    type="text"
                    value={changeUsername}
                    onChange={(e) => setChangeUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">New Admin Password</label>
                    <input
                      type="password"
                      value={changePassword}
                      onChange={(e) => setChangePassword(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  Update Admin Credentials
                </button>
              </form>
            </div>

            {/* Platform Launch & Pure Real USDT Data Management */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Launch & Pure Real USDT Mode</h3>
                  <p className="text-xs text-slate-400">
                    Purge all test/demo transaction records and ensure the Admin Panel reflects only genuine deposited USDT:
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Real USDT Vault Status: Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The Admin Panel dashboard calculates platform statistics purely from verified user TRC-20 deposit requests and processed withdrawals. If you tested with mock transactions previously, click below to wipe test data and start 100% clean.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePurgeTestData}
                    disabled={isPurgingTestData}
                    className="px-5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isPurgingTestData ? 'animate-spin' : ''} />
                    <span>{isPurgingTestData ? 'Purging Test Transactions...' : 'Wipe Test Data & Reset Vault to Pure 0.00 USDT'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: REFERRALS & NETWORK MANAGEMENT (TRANSFER ENGINE) */}
        {activeAdminTab === 'referrals' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <Share2 size={18} />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Referral Network & Account Transfer Engine
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    3-TIER HIERARCHY
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Audit, reassign, and transfer referral ownership between accounts. Only accounts directly or indirectly registered under a specific user will appear in their team view.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-sky-400 border border-slate-700 text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md transition-colors"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Sync Hierarchy</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</div>
                <div className="text-2xl font-black text-white">{allUsers.length}</div>
                <div className="text-[10px] text-slate-500">Registered platform users</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Referrers</div>
                <div className="text-2xl font-black text-sky-400">
                  {allUsers.filter((u) => u && u.username && allUsers.some((child) => (child.referredBy || '').toLowerCase() === (u.username || '').toLowerCase() || (child.referredBy || '').toLowerCase() === (u.invitationCode || '').toLowerCase())).length}
                </div>
                <div className="text-[10px] text-slate-500">Users with direct downline</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Downlines</div>
                <div className="text-2xl font-black text-emerald-400">
                  {allUsers.filter((u) => Boolean(u.referredBy && u.referredBy.toLowerCase() !== 'official link' && u.referredBy.toLowerCase() !== 'direct link')).length}
                </div>
                <div className="text-[10px] text-slate-500">Connected to an upline sponsor</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Orphans</div>
                <div className="text-2xl font-black text-amber-400">
                  {allUsers.filter((u) => !u.referredBy || u.referredBy.toLowerCase() === 'official link' || u.referredBy.toLowerCase() === 'direct link').length}
                </div>
                <div className="text-[10px] text-slate-500">Direct or unlinked accounts</div>
              </div>
            </div>

            {/* Transfer Control Hub (Two Actions) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: 1-to-1 User Referral Transfer */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <ArrowRightLeft size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Transfer Individual Account Referrer</h4>
                    <p className="text-[11px] text-slate-400">
                      Reassign who referred this user. All commissions and team counts will move dynamically.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleExecuteSingleTransfer} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      1. Select Target User (Member to Transfer)
                    </label>
                    <select
                      value={transferTargetUser}
                      onChange={(e) => {
                        const uname = e.target.value;
                        setTransferTargetUser(uname);
                        const found = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
                        if (found && !transferNewReferrer) {
                          setTransferNewReferrer(found.referredBy || '');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-semibold"
                    >
                      <option value="">-- Choose User to Reassign --</option>
                      {allUsers.map((u) => (
                        <option key={u.id || u.username} value={u.username}>
                          {u.username} (Current Upline: {u.referredBy || 'Direct / Platform'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      2. Select New Referrer Sponsor (Destination Upline)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={transferNewReferrer}
                        onChange={(e) => setTransferNewReferrer(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-semibold"
                      >
                        <option value="">-- Choose Existing User --</option>
                        <option value="Direct Link">Official Platform (Direct Link)</option>
                        {allUsers
                          .filter((u) => u.username.toLowerCase() !== transferTargetUser.toLowerCase())
                          .map((u) => (
                            <option key={u.id || u.username} value={u.username}>
                              {u.username} (Code: {u.invitationCode})
                            </option>
                          ))}
                      </select>

                      <input
                        type="text"
                        value={transferNewReferrer}
                        onChange={(e) => setTransferNewReferrer(e.target.value)}
                        placeholder="Or custom sponsor / code..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="transferDownline"
                      checked={transferDownlineTogether}
                      onChange={(e) => setTransferDownlineTogether(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="transferDownline" className="text-xs text-slate-300 cursor-pointer">
                      Keep sub-team intact (downline members stay under {transferTargetUser || 'this user'})
                    </label>
                  </div>

                  {/* Transfer Preview Card */}
                  {transferTargetUser && transferNewReferrer && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-[11px] font-mono">
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Target Member:</span>
                        <span className="text-white font-bold">{transferTargetUser}</span>
                      </div>
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Previous Sponsor:</span>
                        <span className="text-rose-300">
                          {allUsers.find((u) => u.username.toLowerCase() === transferTargetUser.toLowerCase())?.referredBy || 'Direct / None'}
                        </span>
                      </div>
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>New Destination Sponsor:</span>
                        <span className="text-emerald-400 font-bold">{transferNewReferrer}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessingTransfer || !transferTargetUser || !transferNewReferrer}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
                  >
                    <ArrowRightLeft size={15} />
                    <span>{isProcessingTransfer ? 'Transferring...' : 'Execute Referral Transfer'}</span>
                  </button>
                </form>
              </div>

              {/* Box 2: Batch Referral Reassignment */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <GitBranch size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Batch Team Referral Reassignment</h4>
                    <p className="text-[11px] text-slate-400">
                      Move all downline members from one referrer to a new referrer in a single click.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleExecuteBatchTransfer} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Source Referrer (Current Upline to Move From)
                    </label>
                    <select
                      value={batchFromUser}
                      onChange={(e) => setBatchFromUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      <option value="">-- Choose Source Referrer --</option>
                      {allUsers.map((u) => {
                        const directCount = allUsers.filter(
                          (c) =>
                            (c.referredBy || '').toLowerCase() === u.username.toLowerCase() ||
                            (c.referredBy || '').toLowerCase() === (u.invitationCode || '').toLowerCase()
                        ).length;
                        return (
                          <option key={u.id || u.username} value={u.username}>
                            {u.username} ({directCount} direct referrals)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Destination Referrer (New Sponsor to Move To)
                    </label>
                    <select
                      value={batchToUser}
                      onChange={(e) => setBatchToUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      <option value="">-- Choose Destination Referrer --</option>
                      <option value="Direct Link">Official Platform (Direct Link)</option>
                      {allUsers
                        .filter((u) => u.username.toLowerCase() !== batchFromUser.toLowerCase())
                        .map((u) => (
                          <option key={u.id || u.username} value={u.username}>
                            {u.username} (Code: {u.invitationCode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[11px] space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <AlertTriangle size={13} />
                      <span>Instant Network Migration</span>
                    </div>
                    <p className="text-[10.5px] text-amber-200/80">
                      All Level 1 accounts currently linked to "{batchFromUser || 'Source'}" will be immediately updated to point to "{batchToUser || 'Destination'}" as their upline.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingTransfer || !batchFromUser || !batchToUser}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
                  >
                    <GitBranch size={15} />
                    <span>{isProcessingTransfer ? 'Migrating...' : 'Execute Batch Migration'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Complete Referral Hierarchy Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Network size={16} className="text-sky-400" />
                    <span>All Accounts Referral Hierarchy & Commission Audit</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Calculated live using verified deposits, orders, and 3-tier relations.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={referralSearchTerm}
                    onChange={(e) => setReferralSearchTerm(e.target.value)}
                    placeholder="Search account, code, or referrer..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">User Account</th>
                      <th className="px-4 py-3.5">Invite Code</th>
                      <th className="px-4 py-3.5">Current Upline Referrer</th>
                      <th className="px-4 py-3.5 text-center">Level 1 Direct</th>
                      <th className="px-4 py-3.5 text-center">3-Tier Team Size</th>
                      <th className="px-4 py-3.5">Team Recharge Total</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {realUsers
                      .filter((u) => {
                        if (!referralSearchTerm) return true;
                        const term = referralSearchTerm.toLowerCase();
                        return (
                          u.username.toLowerCase().includes(term) ||
                          (u.invitationCode || '').toLowerCase().includes(term) ||
                          (u.referredBy || '').toLowerCase().includes(term)
                        );
                      })
                      .map((u) => {
                        const team = computeReferralTeam(
                          u.username,
                          u.invitationCode,
                          allUsers,
                          deposits,
                          withdrawals,
                          allOrders || orders || []
                        );
                        const level1Count = team.filter((m) => m.level === 1).length;
                        const totalRecharge = team.reduce((sum, m) => sum + (m.rechargeAmount || 0), 0);
                        const isCurrent = currentUser.username.toLowerCase() === u.username.toLowerCase();

                        return (
                          <tr key={u.id || u.username} className={`hover:bg-slate-800/40 transition-colors ${isCurrent ? 'bg-sky-950/20' : ''}`}>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-2.5">
                                <img
                                  src={u.avatar}
                                  alt={u.username}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-1.5">
                                    <span>{u.username}</span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    Balance: ${u.balance.toFixed(2)} USDT
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 font-mono text-amber-300 font-bold">
                              {u.invitationCode}
                            </td>

                            <td className="px-4 py-3.5 font-mono">
                              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                u.referredBy && u.referredBy.toLowerCase() !== 'direct link' && u.referredBy.toLowerCase() !== 'official link'
                                  ? 'bg-sky-950/60 text-sky-300 border-sky-700/60'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {u.referredBy || 'Direct Link (None)'}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold font-mono">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] ${level1Count > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'}`}>
                                {level1Count}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold font-mono">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] ${team.length > 0 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-500'}`}>
                                {team.length} Members
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                              ${totalRecharge.toFixed(2)} USDT
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickTransferModalUser(u);
                                    setTransferTargetUser(u.username);
                                    setTransferNewReferrer(u.referredBy || '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Transfer this account's upline referrer"
                                >
                                  <ArrowRightLeft size={12} />
                                  <span>Transfer Upline</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setViewDownlineModalUser(u)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="View 3-tier team members for this account"
                                >
                                  <Users size={12} />
                                  <span>Inspect Team ({team.length})</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 4. MODALS */}
      {/* ========================================================= */}

      {/* CHANGE PASSWORD MODAL (QUICK POPUP) */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Lock size={16} className="text-rose-500" />
                <span>Change Admin Password</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePasswordChange} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Admin Username</label>
                <input
                  type="text"
                  value={changeUsername}
                  onChange={(e) => setChangeUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">New Password</label>
                <input
                  type="password"
                  value={changePassword}
                  onChange={(e) => setChangePassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users size={16} className="text-rose-500" />
                <span>Create User Account</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5 text-xs">
              {/* Account Category Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Account Type / Model</span>
                  <span className="text-[10px] text-sky-400 font-bold">Presets Available</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserCategory('training_help');
                      setNewBalance('300');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserCategory === 'training_help'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">🎓</div>
                    <div className="text-[10px] mt-0.5 font-bold leading-tight">Help Demo</div>
                    <div className="text-[8.5px] text-slate-400">3-Stage Combo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserCategory('standard_real');
                      setNewBalance('350');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserCategory === 'standard_real'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">👤</div>
                    <div className="text-[10px] mt-0.5 font-bold leading-tight">Standard</div>
                    <div className="text-[8.5px] text-slate-400">$350 Start</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserCategory('vip_elite');
                      setNewBalance('1000');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserCategory === 'vip_elite'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">👑</div>
                    <div className="text-[10px] mt-0.5 font-bold leading-tight">VIP Elite</div>
                    <div className="text-[8.5px] text-slate-400">$1000 Start</div>
                  </button>
                </div>
                {newUserCategory === 'training_help' && (
                  <p className="text-[10px] text-sky-300/90 bg-sky-950/40 p-2 rounded-lg border border-sky-500/30">
                    💡 <strong>Auto-Configured:</strong> 3-Stage Combo Pipeline ($159, $299, $490) will be enabled for teaching trainees!
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. trainee01"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Initial Balance (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="300.00"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Member Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 cursor-pointer shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED DEMO / HELP ACCOUNT CREATION MODAL (BATCH 10x or SINGLE) */}
      {isAddDemoModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl shadow-sky-950/80 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md">
                  🎓
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                    <span>Create Demo / Help Accounts</span>
                  </h4>
                  <p className="text-[11px] text-sky-400 font-medium">
                    No Wallet Bound • 3-Stage Training Pipeline
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDemoModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* MODE SWITCH TABS: BATCH 10x vs SINGLE */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDemoCreateTab('batch')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  demoCreateTab === 'batch'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡ Batch 10 Accounts (Cari001-Cari010)</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCreateTab('single')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  demoCreateTab === 'single'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👤 Single Demo Account</span>
              </button>
            </div>

            {/* KEY FEATURES CARD: NO WALLET & 3 STAGES */}
            <div className="bg-sky-950/30 border border-sky-500/30 rounded-2xl p-3.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/20 space-y-1">
                  <div className="font-bold text-sky-300 flex items-center space-x-1">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Wallet Status: Unbound</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    No wallet address is added. Trainees can practice binding their own address.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/20 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center space-x-1">
                    <Zap size={13} className="text-amber-400" />
                    <span>3-Stage Combo Pipeline</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Stage 1: $159 (#6) • Stage 2: $299 (#12) • Stage 3: $490 (#18)
                  </p>
                </div>
              </div>
            </div>

            {demoCreateTab === 'batch' ? (
              /* ================== BATCH 10x FORM ================== */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const prefix = demoBatchPrefix.trim() || 'Cari';
                  const count = parseInt(demoBatchCount, 10) || 10;
                  const startNum = parseInt(demoBatchStartIndex, 10) || 1;
                  const bal = parseFloat(demoBatchBalance);
                  const finalBal = isNaN(bal) ? 0 : Math.max(0, bal);
                  const pass = demoBatchPassword.trim() || '123456';

                  await batchCreateDemoAccounts(
                    prefix,
                    count,
                    startNum,
                    3,
                    finalBal,
                    pass,
                    DEFAULT_HELP_TRAINING_COMBO_STAGES
                  );

                  setIsAddDemoModalOpen(false);
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Account Prefix</label>
                    <input
                      type="text"
                      value={demoBatchPrefix}
                      onChange={(e) => setDemoBatchPrefix(e.target.value)}
                      placeholder="e.g. Cari"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                      required
                    />
                    <p className="text-[10px] text-slate-500">e.g. "Cari" produces Cari001, Cari002...</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Start Number</label>
                    <input
                      type="number"
                      min="1"
                      value={demoBatchStartIndex}
                      onChange={(e) => setDemoBatchStartIndex(e.target.value)}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                      required
                    />
                    <p className="text-[10px] text-slate-500">e.g. 1 = Cari001, 11 = Cari011</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">Account Count</label>
                    <div className="flex items-center space-x-1.5">
                      {[5, 10, 15, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDemoBatchCount(String(num))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            demoBatchCount === String(num)
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {num} accounts
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={demoBatchCount}
                    onChange={(e) => setDemoBatchCount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Starting Balance ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={demoBatchBalance}
                      onChange={(e) => setDemoBatchBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                    />
                    <p className="text-[10px] text-slate-500">Default 0.00 USDT</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Shared Password</label>
                    <input
                      type="text"
                      value={demoBatchPassword}
                      onChange={(e) => setDemoBatchPassword(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                      required
                    />
                    <p className="text-[10px] text-slate-500">Same password for all 10</p>
                  </div>
                </div>

                {/* LIVE GENERATION PREVIEW */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                    <span>Generated Accounts Preview:</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {demoBatchCount} accounts
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {Array.from({ length: Math.min(20, parseInt(demoBatchCount, 10) || 10) }).map((_, idx) => {
                      const num = (parseInt(demoBatchStartIndex, 10) || 1) + idx;
                      const name = `${demoBatchPrefix.trim() || 'Cari'}${String(num).padStart(3, '0')}`;
                      return (
                        <span
                          key={name}
                          className="px-2 py-1 rounded-md bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono text-[10px] font-bold"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDemoModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-sky-950/50 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>🎓</span>
                    <span>Create {demoBatchCount} Demo Accounts</span>
                  </button>
                </div>
              </form>
            ) : (
              /* ================== SINGLE DEMO FORM ================== */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!demoTraineeName.trim()) {
                    showToast('Please enter a trainee username');
                    return;
                  }
                  const bal = parseFloat(demoInitialBalance);
                  const finalBal = isNaN(bal) ? 0 : Math.max(0, bal);
                  const success = createNewUserAccount(
                    demoTraineeName.trim(),
                    finalBal,
                    '123456',
                    'training_help',
                    DEFAULT_HELP_TRAINING_COMBO_STAGES
                  );
                  if (success) {
                    setIsAddDemoModalOpen(false);
                    showToast(`🎓 Demo Help Account "${demoTraineeName.trim()}" created with No Wallet bound & 3-Stage Combos!`);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">Trainee / Demo Username</label>
                    <button
                      type="button"
                      onClick={() => setDemoTraineeName(`trainee_${Math.floor(100 + Math.random() * 900)}`)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      <span>Generate Random</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={demoTraineeName}
                    onChange={(e) => setDemoTraineeName(e.target.value)}
                    placeholder="e.g. trainee_user1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Initial Balance (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={demoInitialBalance}
                    onChange={(e) => setDemoInitialBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-500/50 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                  />
                  <p className="text-[10px] text-slate-500">Starting balance (default is 0 USDT, no wallet bound)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Default Password</label>
                  <input
                    type="text"
                    defaultValue="123456"
                    readOnly
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500">Trainee default password is 123456</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDemoModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-sky-950/50 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>🎓</span>
                    <span>Create Demo User</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DEDICATED BATCH CHANGE PASSWORD MODAL (TO 112233) */}
      {isBatchPasswordModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl shadow-amber-950/80 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md">
                  🔑
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                    <span>Batch Change Password</span>
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium">
                    Reset demo/trainee accounts to password 112233
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Quick helper info */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-amber-300 flex items-center space-x-1">
                <CheckCircle2 size={13} className="text-amber-400" />
                <span>Finished Training? Reset passwords in 1-click:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                When training is completed, enter the account usernames below (e.g. Cari001, Cari002... Cari010) and their passwords will be changed to <span className="font-mono font-bold text-amber-300">112233</span>!
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const raw = batchPasswordUsernames.trim();
                if (!raw) {
                  showToast('Please enter at least one username');
                  return;
                }
                const parsedNames = raw
                  .split(/[\s,;\n]+/)
                  .map((n) => n.trim())
                  .filter(Boolean);

                if (parsedNames.length === 0) {
                  showToast('No valid usernames found');
                  return;
                }

                setIsBatchChangingPassword(true);
                try {
                  const res = await batchChangeUserPassword(parsedNames, batchNewPassword.trim() || '112233');
                  if (res.successCount > 0) {
                    setIsBatchPasswordModalOpen(false);
                  }
                } finally {
                  setIsBatchChangingPassword(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Account names input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Account Usernames</label>
                  {/* Quick Select Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const cariNames = demoUsers
                          .filter((u) => u.username.toLowerCase().startsWith('cari'))
                          .map((u) => u.username);
                        if (cariNames.length === 0) {
                          showToast('No accounts starting with "Cari" found!');
                          return;
                        }
                        setBatchPasswordUsernames(cariNames.join(', '));
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer"
                    >
                      All "Cari*"
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (demoUsers.length === 0) {
                          showToast('No Demo/Training accounts found!');
                          return;
                        }
                        setBatchPasswordUsernames(demoUsers.map((u) => u.username).join(', '));
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 cursor-pointer"
                    >
                      All Demo ({demoUsers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchPasswordUsernames('')}
                      className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={batchPasswordUsernames}
                  onChange={(e) => setBatchPasswordUsernames(e.target.value)}
                  placeholder="e.g. Cari001, Cari002, Cari003, Cari004, Cari005, Cari006, Cari007, Cari008, Cari009, Cari010"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[10px] text-slate-500">Separate names with commas, spaces, or newlines.</p>
              </div>

              {/* Target Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">New Password to Set</label>
                  <button
                    type="button"
                    onClick={() => setBatchNewPassword('112233')}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Set to 112233
                  </button>
                </div>
                <input
                  type="text"
                  value={batchNewPassword}
                  onChange={(e) => setBatchNewPassword(e.target.value)}
                  placeholder="112233"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[10px] text-slate-500">All matching accounts will have their password changed to this value (default: 112233).</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchPasswordModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBatchChangingPassword}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Key size={14} />
                  <span>{isBatchChangingPassword ? 'Changing...' : `Change Password to ${batchNewPassword || '112233'}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL CREDIT MODAL */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span>Manual Credit USDT</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsCreditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleManualCredit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select User Account</label>
                <select
                  value={creditUser}
                  onChange={(e) => {
                    const selU = e.target.value;
                    setCreditUser(selU);
                    const targetU = allUsers.find(
                      (u) => u.username.toLowerCase() === selU.toLowerCase()
                    );
                    setCreditFromAddress(targetU?.walletAddress || targetU?.withdrawalAddress || '');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username} (${u.balance.toFixed(2)} USDT) {u.walletAddress ? `• [${maskWalletAddress(u.walletAddress)}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Credit Amount (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="e.g. 100.00"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Sender Wallet Address (From)</span>
                  <span className="text-[10px] text-teal-400 font-normal">Optional / Auto-filled</span>
                </label>
                <input
                  type="text"
                  value={creditFromAddress}
                  onChange={(e) => setCreditFromAddress(e.target.value)}
                  placeholder="e.g. TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-400">
                  Wallet address where the deposit originated from. Saved in deposit history.
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer shadow-md"
                >
                  Credit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET USER TASKS & PROGRESS MODAL */}
      {isResetTaskModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <RotateCcw size={17} className="text-amber-400" />
                <span>Reset User Daily Tasks</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsResetTaskModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetObj = allUsers.find((u) => u.username === resetTargetUsername);
                const curC = targetObj?.workCycle || 1;
                const bal = resetKeepBalance ? undefined : parseFloat(resetCustomBalance);
                const targetC = resetTargetCycle === 'auto' ? undefined : (resetTargetCycle === 'keep' ? curC : resetTargetCycle);
                const keepC = resetTargetCycle === 'keep';
                resetUserTasks(resetTargetUsername, bal, resetTaskCount, resetClearOrders, targetC, keepC);
                setIsResetTaskModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              {/* Target User */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Select User Account</label>
                <select
                  value={resetTargetUsername}
                  onChange={(e) => {
                    setResetTargetUsername(e.target.value);
                    const found = allUsers.find((u) => u.username === e.target.value);
                    if (found) {
                      setResetCustomBalance(found.balance.toString());
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username} (VIP {u.vipLevel} • ${u.balance.toFixed(2)} USDT • Task {u.todayTimes}/25)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Task Stage */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Reset Task Stage To:</span>
                  <span className="font-mono text-amber-400 font-bold">{resetTaskCount} / 25</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResetTaskCount(0)}
                    className={`py-2 px-2.5 rounded-xl text-center font-bold border transition-colors cursor-pointer ${
                      resetTaskCount === 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    0/25 (Fresh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetTaskCount(11)}
                    className={`py-2 px-2.5 rounded-xl text-center font-bold border transition-colors cursor-pointer ${
                      resetTaskCount === 11
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    11/25 (Combo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetTaskCount(24)}
                    className={`py-2 px-2.5 rounded-xl text-center font-bold border transition-colors cursor-pointer ${
                      resetTaskCount === 24
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    24/25 (Last)
                  </button>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-slate-400 text-[11px] shrink-0">Custom Count:</span>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={resetTaskCount}
                    onChange={(e) => setResetTaskCount(Math.max(0, Math.min(25, parseInt(e.target.value, 10) || 0)))}
                    className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Work Cycle & Combo Progression Option (Real Users) */}
              {resetTaskCount === 0 &&
                (() => {
                  const targetObj = allUsers.find((u) => u.username === resetTargetUsername);
                  const isReal = targetObj?.accountCategory !== 'training_help';
                  if (!isReal) return null;
                  const curCycle = targetObj?.workCycle || 1;
                  const userWList = (withdrawals || []).filter(
                    (w) => (w.username || '').trim().toLowerCase() === (resetTargetUsername || '').trim().toLowerCase() && w.status !== 'rejected'
                  );
                  const wCount = userWList.length;
                  const approvedW = userWList.filter((w) => w.status === 'approved' || w.status === 'completed').length;
                  let nextCycle = curCycle;
                  if (curCycle === 1) {
                    nextCycle = wCount >= 1 ? 2 : 1;
                  } else if (curCycle === 2) {
                    nextCycle = wCount >= 2 ? 3 : 2;
                  } else {
                    nextCycle = 3;
                  }

                  return (
                    <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-amber-300 font-bold flex items-center space-x-1.5">
                          <Zap size={13} className="text-amber-400" />
                          <span>Combo Progression / Work Cycle</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          Current: Round {curCycle} • Withdraws: {wCount} ({approvedW}✓)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {curCycle === 1 && wCount >= 1 ? (
                          <span className="text-emerald-300 font-medium">
                            ✨ User completed 1st withdrawal ({wCount} total)! Auto progression will advance user to Round 2 (3 Combos).
                          </span>
                        ) : curCycle === 1 ? (
                          <span className="text-slate-400">
                            User has 0 withdrawals. Round 1 (1 Combo) will be maintained until first withdrawal.
                          </span>
                        ) : (
                          <span>Progressive combo pipeline based on withdrawal milestones:</span>
                        )}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResetTargetCycle('auto')}
                          className={`py-1.5 px-2 rounded-xl text-left border transition-colors cursor-pointer ${
                            resetTargetCycle === 'auto'
                              ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-amber-300">✨ Auto Progression</div>
                          <div className="text-[9.5px] text-slate-300">
                            Next &rarr; Round {nextCycle} ({nextCycle === 1 ? '1 Combo ($18.24)' : nextCycle === 2 ? '3 Combos' : '5 Combos'})
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResetTargetCycle(1)}
                          className={`py-1.5 px-2 rounded-xl text-left border transition-colors cursor-pointer ${
                            resetTargetCycle === 1
                              ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold">Round 1 (New User)</div>
                          <div className="text-[9.5px] text-slate-400">1 Combo Offer ($18.24)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResetTargetCycle(2)}
                          className={`py-1.5 px-2 rounded-xl text-left border transition-colors cursor-pointer ${
                            resetTargetCycle === 2
                              ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold">Round 2 (2nd Cycle)</div>
                          <div className="text-[9.5px] text-slate-400">3 Combo Offers</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResetTargetCycle(3)}
                          className={`py-1.5 px-2 rounded-xl text-left border transition-colors cursor-pointer ${
                            resetTargetCycle === 3
                              ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold">Round 3 (3rd Cycle)</div>
                          <div className="text-[9.5px] text-slate-400">5 Combo Offers</div>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              {/* Balance Option */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="keep-balance"
                    checked={resetKeepBalance}
                    onChange={(e) => setResetKeepBalance(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="keep-balance" className="text-xs text-slate-200 font-semibold cursor-pointer">
                    Keep current balance intact
                  </label>
                </div>

                {!resetKeepBalance && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-slate-400 text-[11px]">Set Custom New Balance (USDT):</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={resetCustomBalance}
                        onChange={(e) => setResetCustomBalance(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setResetCustomBalance('618')}
                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 font-bold cursor-pointer"
                      >
                        618
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetCustomBalance('350')}
                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-300 font-bold cursor-pointer"
                      >
                        350
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wipe Order History Option */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="reset-clear-orders-checkbox"
                  checked={resetClearOrders}
                  onChange={(e) => setResetClearOrders(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="reset-clear-orders-checkbox" className="text-xs text-rose-300 font-semibold cursor-pointer">
                  Delete all task record history for this user (Records start fresh from 0)
                </label>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                ⚡ Note: Resetting will automatically unfreeze escrow orders, clear cash gap, and permanently delete all previous task order records from the database so the user's Record list starts completely clean.
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetTaskModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md transition-colors"
                >
                  Reset Tasks Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPREHENSIVE ACCOUNT MANAGEMENT MODAL (DO EVERYTHING)     */}
      {/* ========================================================= */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-xl w-full my-auto shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <Edit3 size={18} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-white">
                      Account Manager: <span className="text-amber-400">{editingUser.username}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      ID: {editingUser.id.substring(0, 8)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Full administrative control: credentials, balances, tasks, VIP & payouts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveUserModal} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* SECTION 1: CREDENTIALS & SECURITY */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-indigo-300 font-bold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <Key size={14} />
                    <span>Login & Withdrawal Passwords</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Passwords visible & editable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Login Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>Login Password</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditFormPassword('112233')}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                        >
                          Set 112233
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => setEditFormPassword('123456')}
                          className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                        >
                          Set 123456
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPass ? 'text' : 'password'}
                        value={editFormPassword}
                        onChange={(e) => setEditFormPassword(e.target.value)}
                        placeholder="Login password"
                        className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPass(!showEditPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showEditPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Fund / Withdrawal Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>Withdrawal Password</span>
                      <button
                        type="button"
                        onClick={() => setEditFormWithdrawPassword('123456')}
                        className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                      >
                        Set 123456
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditWithdrawPass ? 'text' : 'password'}
                        value={editFormWithdrawPassword}
                        onChange={(e) => setEditFormWithdrawPassword(e.target.value)}
                        placeholder="Withdrawal password"
                        className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditWithdrawPass(!showEditWithdrawPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showEditWithdrawPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Account Category</label>
                    <select
                      value={editFormCategory}
                      onChange={(e) => setEditFormCategory(e.target.value as AccountCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="training_help">🎓 Help / Training Demo</option>
                      <option value="standard_real">👤 Standard Member</option>
                      <option value="vip_elite">👑 VIP Elite Member</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Account Status</label>
                    <select
                      value={editFormStatus}
                      onChange={(e) => setEditFormStatus(e.target.value as 'active' | 'suspended')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="active">Active (Permitted to work)</option>
                      <option value="suspended">Suspended (Blocked)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FINANCIAL BALANCES & CASH GAPS */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <DollarSign size={14} />
                    <span>Balance & Escrow Funds (USDT)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Total: {(parseFloat(editFormBalance || '0') + parseFloat(editFormFrozenBalance || '0')).toFixed(2)} USDT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Available Balance */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Available Balance ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormBalance}
                      onChange={(e) => setEditFormBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Frozen Balance */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Frozen Escrow ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormFrozenBalance}
                      onChange={(e) => setEditFormFrozenBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Combo Offer */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Combo Offer ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormCashGap}
                      onChange={(e) => setEditFormCashGap(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 font-mono font-bold text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Quick Balance Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500">Quick Add:</span>
                    {[50, 100, 300, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(editFormBalance) || 0;
                          setEditFormBalance((curr + amt).toFixed(2));
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[10px] cursor-pointer"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>

                  {/* 1-Click Clear Cash Gap */}
                  <button
                    type="button"
                    onClick={() => {
                      const frozen = parseFloat(editFormFrozenBalance) || 0;
                      const bal = parseFloat(editFormBalance) || 0;
                      setEditFormBalance((bal + frozen).toFixed(2));
                      setEditFormFrozenBalance('0');
                      setEditFormCashGap('0');
                      showToast('Escrow balance restored to available balance & gap cleared!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    ✓ Unfreeze Balance & Clear Gap
                  </button>
                </div>
              </div>

              {/* SECTION 3: DAILY TASKS, COMMISSIONS & ORDERS */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <Sliders size={14} />
                    <span>Daily Task Progress & Orders</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {editFormTodayTimes} / 25 Tasks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Completed Tasks</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={editFormTodayTimes}
                      onChange={(e) => setEditFormTodayTimes(Math.max(0, Math.min(25, parseInt(e.target.value, 10) || 0)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Today's Commission ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormTodayCommission}
                      onChange={(e) => setEditFormTodayCommission(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">VIP Level</label>
                    <select
                      value={editFormVipLevel}
                      onChange={(e) => setEditFormVipLevel(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value={0}>VIP 0 (Default)</option>
                      <option value={1}>VIP 1 (Threshold $20)</option>
                      <option value={2}>VIP 2 (Threshold $499)</option>
                      <option value={3}>VIP 3 (Threshold $899)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Task Actions */}
                <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditFormTodayTimes(0);
                      setEditFormTodayCommission('0');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-bold cursor-pointer"
                  >
                    Set Tasks to 0/25
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditFormTodayTimes(25);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-bold cursor-pointer"
                  >
                    Set Tasks to 25/25
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Wipe order history for ${editingUser.username}?`)) {
                        clearUserOrders(editingUser.username);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-[10.5px] font-bold cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear Order History</span>
                  </button>
                </div>
              </div>

              {/* SECTION 4: WALLET ADDRESS & INVITATION */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sky-300 font-bold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <Wallet size={14} />
                    <span>TRC-20 Wallet & Referral</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Payout destination</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">TRC-20 Wallet Address</label>
                    <input
                      type="text"
                      value={editFormWalletAddress}
                      onChange={(e) => setEditFormWalletAddress(e.target.value)}
                      placeholder="e.g. TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Wallet App / Exchange Name</label>
                    <input
                      type="text"
                      value={editFormWalletName}
                      onChange={(e) => setEditFormWalletName(e.target.value)}
                      placeholder="e.g. Binance / TrustWallet"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Invitation Code</label>
                    <input
                      type="text"
                      value={editFormInviteCode}
                      onChange={(e) => setEditFormInviteCode(e.target.value)}
                      placeholder="e.g. 784920"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Referred By (Inviter)</label>
                    <input
                      type="text"
                      value={editFormReferredBy}
                      onChange={(e) => setEditFormReferredBy(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="edit-wallet-bound"
                        checked={editFormWalletBound}
                        onChange={(e) => setEditFormWalletBound(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <label htmlFor="edit-wallet-bound" className="text-xs text-slate-200 font-semibold cursor-pointer">
                        Wallet Bound Status
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: ONE-CLICK COMBO PIPELINE SHORTCUTS */}
              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] text-indigo-300 font-semibold flex items-center space-x-1.5">
                  <Zap size={14} className="text-amber-400" />
                  <span>Preset Pipeline:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      applyHelpTrainingPreset(editingUser.username);
                      setEditFormCategory('training_help');
                      showToast(`Applied 3-Stage Combo Preset to ${editingUser.username}!`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10.5px] font-bold cursor-pointer"
                  >
                    🎓 Apply 3-Stage Combo Preset
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchUserAccount(editingUser.username);
                      showToast(`Switched to user ${editingUser.username}!`);
                      setIsEditUserModalOpen(false);
                      navigateToUserApp();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-bold cursor-pointer flex items-center space-x-1"
                  >
                    <UserCheck size={12} />
                    <span>Open in App</span>
                  </button>
                </div>
              </div>

              {/* Bottom Submit Buttons */}
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSavingUser ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save All Account Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK TRANSFER MODAL */}
      {quickTransferModalUser && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <ArrowRightLeft size={16} className="text-rose-500" />
                <span>Transfer User Referral Upline</span>
              </h4>
              <button
                type="button"
                onClick={() => setQuickTransferModalUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center space-x-3">
              <img
                src={quickTransferModalUser.avatar}
                alt={quickTransferModalUser.username}
                className="w-10 h-10 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <div className="font-bold text-white text-sm">{quickTransferModalUser.username}</div>
                <div className="text-xs text-slate-400 font-mono">
                  Current Sponsor: <span className="text-rose-300 font-bold">{quickTransferModalUser.referredBy || 'Direct / None'}</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleExecuteSingleTransfer(e);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Destination Referrer / Sponsor
                </label>
                <select
                  value={transferNewReferrer}
                  onChange={(e) => setTransferNewReferrer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Select New Sponsor --</option>
                  <option value="Direct Link">Official Platform (Direct Link)</option>
                  {allUsers
                    .filter((u) => u.username.toLowerCase() !== quickTransferModalUser.username.toLowerCase())
                    .map((u) => (
                      <option key={u.id || u.username} value={u.username}>
                        {u.username} (Code: {u.invitationCode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Or Custom Username / Invite Code
                </label>
                <input
                  type="text"
                  value={transferNewReferrer}
                  onChange={(e) => setTransferNewReferrer(e.target.value)}
                  placeholder="Enter username or sponsor code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modalDownlineCheck"
                  checked={transferDownlineTogether}
                  onChange={(e) => setTransferDownlineTogether(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="modalDownlineCheck" className="text-xs text-slate-300 cursor-pointer">
                  Preserve downline team structure under {quickTransferModalUser.username}
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickTransferModalUser(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingTransfer || !transferNewReferrer}
                  className="w-2/3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowRightLeft size={14} />
                  <span>{isProcessingTransfer ? 'Transferring...' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DOWNLINE 3-TIER TEAM MODAL */}
      {viewDownlineModalUser && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={viewDownlineModalUser.avatar}
                  alt={viewDownlineModalUser.username}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{viewDownlineModalUser.username}'s Referral Team</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Code: {viewDownlineModalUser.invitationCode}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Upline: {viewDownlineModalUser.referredBy || 'Direct / Platform'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDownlineModalUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {(() => {
              const team = computeReferralTeam(
                viewDownlineModalUser.username,
                viewDownlineModalUser.invitationCode,
                allUsers,
                deposits,
                withdrawals,
                allOrders || orders || []
              );
              const l1 = team.filter((m) => m.level === 1);
              const l2 = team.filter((m) => m.level === 2);
              const l3 = team.filter((m) => m.level === 3);
              const totalRecharge = team.reduce((s, m) => s + (m.rechargeAmount || 0), 0);
              const totalComm = team.reduce((s, m) => s + (m.commissionContribution || 0), 0);

              return (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Total Members</div>
                      <div className="text-lg font-black text-white">{team.length}</div>
                      <div className="text-[10px] text-sky-400">L1: {l1.length} | L2: {l2.length} | L3: {l3.length}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Team Recharges</div>
                      <div className="text-lg font-black text-emerald-400">${totalRecharge.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">Total USDT</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Commission Earned</div>
                      <div className="text-lg font-black text-amber-400">+${totalComm.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">From Downline</div>
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300">Downline Members Roster</div>
                    {team.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 text-xs bg-slate-950/60 rounded-2xl border border-slate-800/80">
                        <Users size={32} className="mx-auto mb-2 text-slate-600 opacity-60" />
                        <p>This user currently has no referrals registered.</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Share invitation code <span className="font-mono text-amber-400">{viewDownlineModalUser.invitationCode}</span> or transfer accounts to them.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {team.map((member) => (
                          <div
                            key={member.id}
                            className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                                  member.level === 1
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : member.level === 2
                                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                }`}
                              >
                                Tier {member.level}
                              </span>
                              <div>
                                <div className="font-bold text-white">{member.username}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Joined {member.joinDate} • Ref By: {member.referredBy || 'Direct'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 font-mono text-right">
                              <div>
                                <div className="text-slate-200 font-bold">${member.rechargeAmount.toFixed(2)}</div>
                                <div className="text-[10px] text-slate-500">Recharge</div>
                              </div>
                              <div>
                                <div className="text-emerald-400 font-bold">+${member.commissionContribution.toFixed(2)}</div>
                                <div className="text-[10px] text-slate-500">Commission</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const targetU = allUsers.find(
                                    (u) => u.username.toLowerCase() === member.username.toLowerCase()
                                  );
                                  if (targetU) {
                                    setQuickTransferModalUser(targetU);
                                    setTransferTargetUser(targetU.username);
                                    setTransferNewReferrer(targetU.referredBy || '');
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-[10.5px] font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                                title="Transfer this downline member"
                              >
                                <ArrowRightLeft size={11} />
                                <span>Transfer</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewDownlineModalUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN ACTIVITY & GEO AUDIT MODAL */}
      {inspectLoginUser && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-sky-400 shrink-0">
                  {inspectLoginUser.accountCategory === 'training_help' ? '🎓' : '👤'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2 flex-wrap gap-1">
                    <span>Login & Geo Audit Log:</span>
                    <span className="font-mono text-sky-300">{inspectLoginUser.username}</span>
                    {inspectLoginUser.accountCategory === 'training_help' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        Demo Account
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Real User Account
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Invite Code: <span className="text-amber-400 font-bold">{inspectLoginUser.invitationCode}</span> • Password: <span className="text-slate-300">{inspectLoginUser.password || '112233'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectLoginUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Key Metrics Bar */}
              {(() => {
                const logs = inspectLoginLogs;
                const totalAttempts = Math.max(logs.length, inspectLoginUser.loginCount || 0);
                const successfulLogins = logs.filter((l) => l.status === 'success').length;
                const failedAttempts = logs.filter((l) => l.status === 'failed').length;
                const uniqueLocations = Array.from(
                  new Set(
                    logs
                      .map((l) => l.location)
                      .concat(inspectLoginUser.location ? [inspectLoginUser.location] : [])
                      .filter(Boolean)
                  )
                );
                const uniqueIps = Array.from(
                  new Set(
                    logs
                      .map((l) => l.ipAddress)
                      .concat(inspectLoginUser.ipAddress ? [inspectLoginUser.ipAddress] : [])
                      .filter(Boolean)
                  )
                );

                return (
                  <div className="space-y-3">
                    {/* Top Stat Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="text-[10.5px] text-slate-400 font-medium">Total Logins Recorded</div>
                        <div className="text-xl font-black text-sky-400 font-mono mt-0.5">{totalAttempts}</div>
                        <div className="text-[10px] text-slate-500">
                          {totalAttempts === 0 ? 'Unopened Account' : `${totalAttempts} total session(s)`}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="text-[10.5px] text-slate-400 font-medium">Successful Logins</div>
                        <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                          {successfulLogins || (inspectLoginUser.loginCount ? inspectLoginUser.loginCount : 0)}
                        </div>
                        <div className="text-[10px] text-emerald-500/80">Authorized Access</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="text-[10.5px] text-slate-400 font-medium">Failed Attempts</div>
                        <div className={`text-xl font-black font-mono mt-0.5 ${failedAttempts > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                          {failedAttempts}
                        </div>
                        <div className="text-[10px] text-slate-500">Invalid Passwords</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="text-[10.5px] text-slate-400 font-medium">Locations Detected</div>
                        <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                          {uniqueLocations.length || (inspectLoginUser.location ? 1 : 0)}
                        </div>
                        <div className="text-[10px] text-amber-500/80">Unique Cities/Regions</div>
                      </div>
                    </div>

                    {/* Geo Location & Device Profile Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <MapPin size={14} className="text-emerald-400" />
                          <span>Detected Access Locations & Network IPs</span>
                        </span>
                        {isLoadingLogs && (
                          <span className="text-[10px] text-sky-400 flex items-center space-x-1 animate-pulse">
                            <RefreshCw size={10} className="animate-spin" />
                            <span>Updating Live...</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {uniqueLocations.length > 0 ? (
                          uniqueLocations.map((loc, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium flex items-center space-x-1.5"
                            >
                              <MapPin size={12} className="text-emerald-400" />
                              <span>{loc}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">No geo location captured yet</span>
                        )}

                        {uniqueIps.map((ip, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono flex items-center space-x-1.5"
                          >
                            <Globe size={12} className="text-cyan-400" />
                            <span>IP: {ip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chronological Audit Log Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center space-x-1.5">
                          <Clock size={14} className="text-sky-400" />
                          <span>Detailed Login Activity Stream</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {logs.length} record(s) logged
                        </span>
                      </div>

                      {logs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-2">
                          <Activity size={32} className="mx-auto text-slate-600 opacity-60" />
                          <div className="font-bold text-slate-300">No Login History Recorded Yet</div>
                          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                            When the user or trainee enters their username and password to log in, their exact IP address, location, device details, and success status will be permanently tracked here in real time.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {logs.map((event, index) => {
                            const isSuccess = event.status === 'success';
                            return (
                              <div
                                key={event.id || index}
                                className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono transition-all ${
                                  isSuccess
                                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
                                    : 'bg-rose-950/20 border-rose-900/50 hover:border-rose-500/40'
                                }`}
                              >
                                <div className="flex items-start sm:items-center space-x-3">
                                  <div
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                                      isSuccess
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {isSuccess ? <Check size={14} /> : <X size={14} />}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2 flex-wrap">
                                      <span
                                        className={`font-bold ${
                                          isSuccess ? 'text-emerald-400' : 'text-rose-400'
                                        }`}
                                      >
                                        {isSuccess ? 'Login Successful' : 'Failed Login Attempt'}
                                      </span>
                                      <span className="text-[10.5px] text-slate-400">
                                        • {event.timestamp}
                                      </span>
                                    </div>
                                    <div className="text-[10.5px] text-slate-300 flex items-center space-x-2 flex-wrap gap-y-0.5 mt-0.5">
                                      <span className="text-emerald-300 flex items-center space-x-1">
                                        <MapPin size={10} className="text-emerald-400" />
                                        <span>{event.location || 'Dhaka, Bangladesh'}</span>
                                      </span>
                                      <span className="text-cyan-300 flex items-center space-x-1">
                                        <Globe size={10} className="text-cyan-400" />
                                        <span>{event.ipAddress || '103.145.74.22'}</span>
                                      </span>
                                      {event.device && (
                                        <span className="text-slate-400 flex items-center space-x-1">
                                          <Smartphone size={10} className="text-slate-500" />
                                          <span>{event.device}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {event.note && (
                                  <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 self-start sm:self-center">
                                    {event.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => openLoginAuditModal(inspectLoginUser)}
                  disabled={isLoadingLogs}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin' : ''} />
                  <span>Refresh Live Logs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleClearUserLoginHistory(inspectLoginUser.username)}
                  className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                  title="Reset and clear login history logs for this account"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInspectLoginUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
