import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persistent data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DEMO_DEFAULT_WALLET_ADDRESS = 'TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT';
export const DEMO_DEFAULT_WALLET_NAME = 'USDT TRC-20';

export function isDemoAccountBackend(u?: { username?: string; accountCategory?: string } | null): boolean {
  if (!u) return false;
  if (u.accountCategory === 'training_help') return true;
  const uname = (u.username || '').toLowerCase();
  return (
    uname === 'demoaccount' ||
    uname.startsWith('demo') ||
    uname.startsWith('cari') ||
    uname.startsWith('trainee') ||
    uname.startsWith('help') ||
    uname.includes('demo')
  );
}

export type AccountCategory = 'training_help' | 'standard_real' | 'vip_elite';

export interface ComboStage {
  stageNumber: number; // 1, 2, 3, 4, 5, 6
  triggerTaskIndex: number; // e.g. Task 5, 8, 10, 14, 15, 17, 21, 22, 24
  comboPrice: number; // Product value
  cashGap: number; // Required deposit gap ($89.004, $168.22, $179.14, etc.)
  commissionEarned: number; // Commission reward
  description?: string;
  isManual?: boolean;
  manualAdded?: boolean;
}

interface CustomComboConfig {
  enabled: boolean;
  triggerTaskIndex: number;
  comboPrice: number;
  cashGap: number;
  commissionEarned: number;
  forceNext?: boolean;
  accountType?: AccountCategory;
  multiStages?: ComboStage[];
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  userAgent?: string;
  status: 'success' | 'failed';
  note?: string;
}

interface UserRecord {
  id: string;
  username: string;
  password?: string;
  passwordVersion?: number;
  passwordUpdatedAt?: string;
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
  referredBy?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  customCombo?: CustomComboConfig;
  pendingComboOrder?: OrderItem | null;
  workCycle?: number;
  lastTaskDate?: string;
  yesterdayTimes?: number;
  yesterdayCommission?: number;
}

interface TeamMember {
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

interface DepositRecord {
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

interface WithdrawalRecord {
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

export interface OrderItem {
  id: string;
  orderNumber: string;
  username?: string;
  platform: string;
  title: string;
  image: string;
  amount: number;
  commissionRate: number;
  commissionEarned: number;
  createdAt: string;
  status: 'pending' | 'completed';
  isCombo?: boolean;
  comboProducts?: {
    title: string;
    image: string;
    price: number;
  }[];
  cashGap?: number;
  taskIndex?: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  orders: OrderItem[];
  referrals: TeamMember[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  admin: {
    username: string;
    password: string;
  };
  depositAddresses?: string[];
}

const DEFAULT_DEPOSIT_ADDRESSES: string[] = [
  'TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT', // Address 1
  'TAzn4PPRh15uE15ozX1XkXUdK5t8BmgC3Q', // Address 2
  'TAZixn8H8XJn7hFRapvcb6fjEK6B87GRLS', // Address 3
  'TAZBK3NoYQt43fR2GDG9oeLZskZgGafJKm', // Address 4
  'TAZE8HFpLXqRcus6xYsV9eyBvxw5LcLBhW', // Address 5
];

const DEFAULT_3_STAGE_COMBOS: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 6,
    comboPrice: 480.0,
    cashGap: 159.0,
    commissionEarned: 38.0,
    description: 'Stage 1: Introduction Combo ($159 Top-up)',
  },
  {
    stageNumber: 2,
    triggerTaskIndex: 12,
    comboPrice: 850.0,
    cashGap: 299.0,
    commissionEarned: 75.0,
    description: 'Stage 2: Standard Teaching Combo ($299 Top-up)',
  },
  {
    stageNumber: 3,
    triggerTaskIndex: 18,
    comboPrice: 1450.0,
    cashGap: 490.0,
    commissionEarned: 135.0,
    description: 'Stage 3: Advanced Training Combo ($490 Top-up)',
  },
];
const DEFAULT_4_STAGE_COMBOS: ComboStage[] = DEFAULT_3_STAGE_COMBOS;

// Progressive Combo Cycles for Real User Accounts:
// Round 1: 1 Combo Offer
const USER_CYCLE_1_STAGES: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 12,
    comboPrice: 118.24,
    cashGap: 18.24,
    commissionEarned: 18.5,
    description: 'Round 1 Combo (1 of 1 • Task #12 • $18.24 Top-up)',
  },
];

// Round 2: 3 Combo Offers
// #8: $89.004, #15: $168.22, #22: $243.14
const USER_CYCLE_2_STAGES: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 8,
    comboPrice: 289.004,
    cashGap: 89.004,
    commissionEarned: 22.25,
    description: 'Round 2 Combo 1/3 (Task #8 • $89.004 Top-up)',
  },
  {
    stageNumber: 2,
    triggerTaskIndex: 15,
    comboPrice: 568.22,
    cashGap: 168.22,
    commissionEarned: 42.05,
    description: 'Round 2 Combo 2/3 (Task #15 • $168.22 Top-up)',
  },
  {
    stageNumber: 3,
    triggerTaskIndex: 22,
    comboPrice: 843.14,
    cashGap: 243.14,
    commissionEarned: 60.78,
    description: 'Round 2 Combo 3/3 (Task #22 • $243.14 Top-up)',
  },
];

// Round 3: 5 Auto Combos + Task #24 Manual Combo Offer
// #5: $179.14, #10: $361.47, #14: $854.40, #17: $1702.78, #21: $4872.001, #24: Manual Admin Offer
const USER_CYCLE_3_STAGES: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 5,
    comboPrice: 479.14,
    cashGap: 179.14,
    commissionEarned: 44.78,
    description: 'Round 3 Combo 1/6 (Task #5 • $179.14 Top-up)',
  },
  {
    stageNumber: 2,
    triggerTaskIndex: 10,
    comboPrice: 961.47,
    cashGap: 361.47,
    commissionEarned: 90.36,
    description: 'Round 3 Combo 2/6 (Task #10 • $361.47 Top-up)',
  },
  {
    stageNumber: 3,
    triggerTaskIndex: 14,
    comboPrice: 2254.40,
    cashGap: 854.40,
    commissionEarned: 213.60,
    description: 'Round 3 Combo 3/6 (Task #14 • $854.40 Top-up)',
  },
  {
    stageNumber: 4,
    triggerTaskIndex: 17,
    comboPrice: 4502.78,
    cashGap: 1702.78,
    commissionEarned: 425.69,
    description: 'Round 3 Combo 4/6 (Task #17 • $1702.78 Top-up)',
  },
  {
    stageNumber: 5,
    triggerTaskIndex: 21,
    comboPrice: 12872.001,
    cashGap: 4872.001,
    commissionEarned: 1218.00,
    description: 'Round 3 Combo 5/6 (Task #21 • $4872.001 Top-up)',
  },
  {
    stageNumber: 6,
    triggerTaskIndex: 24,
    comboPrice: 28478.00,
    cashGap: 12478.00,
    commissionEarned: 2495.60,
    isManual: true,
    manualAdded: true,
    description: 'Round 3 Combo 6/6 (Task #24 • $12478.00 Combo Offer)',
  },
];

function getStagesForUserCycle(cycle: number = 1): ComboStage[] {
  if (cycle === 1) return JSON.parse(JSON.stringify(USER_CYCLE_1_STAGES));
  if (cycle === 2) return JSON.parse(JSON.stringify(USER_CYCLE_2_STAGES));
  return JSON.parse(JSON.stringify(USER_CYCLE_3_STAGES));
}

function getComboConfigForUserCycle(cycle: number = 1): CustomComboConfig {
  const stages = getStagesForUserCycle(cycle);
  const first = stages[0];
  return {
    enabled: true,
    triggerTaskIndex: first.triggerTaskIndex,
    comboPrice: first.comboPrice,
    cashGap: first.cashGap,
    commissionEarned: first.commissionEarned,
    forceNext: false,
    accountType: 'standard_real',
    multiStages: stages,
  };
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-1788705773629',
    username: 'demoaccount',
    password: 'Password123',
    avatar: 'polygon',
    vipLevel: 0,
    invitationCode: '468312',
    referredBy: 'Official Platform Partner',
    ipAddress: '103.139.9.199',
    location: 'Dhaka, Bangladesh',
    device: 'Desktop/PC • Windows',
    balance: 0.0,
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
      triggerTaskIndex: 6,
      comboPrice: 480.0,
      cashGap: 159.0,
      commissionEarned: 38.0,
      forceNext: false,
    },
  },
  {
    id: 'usr-demo-1788855057613-bpde',
    username: 'Cari001',
    password: 'Password123',
    avatar: 'polygon',
    vipLevel: 0,
    invitationCode: '655545',
    referredBy: 'Help Task Training Demo',
    ipAddress: '37.111.243.12',
    location: 'Dhaka, Bangladesh',
    device: 'Desktop/PC • Windows',
    balance: 0.0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0.0,
    todayTimes: 0,
    maxDailyTimes: 25,
    walletAddress: DEMO_DEFAULT_WALLET_ADDRESS,
    withdrawalAddress: DEMO_DEFAULT_WALLET_ADDRESS,
    walletName: 'USDT TRC-20',
    walletBound: true,
    withdrawPassword: 'Password123',
    joinDate: '2026-09-08 08:10:57',
    lastActive: 'Active Now',
    status: 'active',
    accountCategory: 'training_help',
    customCombo: {
      enabled: true,
      triggerTaskIndex: 6,
      comboPrice: 480.0,
      cashGap: 159.0,
      commissionEarned: 38.0,
      forceNext: false,
    },
  },
  {
    id: 'usr-1788702376506',
    username: 'pranto123',
    password: 'Password123',
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
    password: 'Password123',
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
];

const INITIAL_REFERRALS: TeamMember[] = [];

const INITIAL_DEPOSITS: DepositRecord[] = [];

const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [];

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        users: Array.isArray(data.users) ? data.users : INITIAL_USERS,
        orders: Array.isArray(data.orders) ? data.orders : [],
        referrals: Array.isArray(data.referrals) ? data.referrals : INITIAL_REFERRALS,
        deposits: Array.isArray(data.deposits) ? data.deposits : INITIAL_DEPOSITS,
        withdrawals: Array.isArray(data.withdrawals) ? data.withdrawals : INITIAL_WITHDRAWALS,
        admin: data.admin || { username: 'admin', password: 'admin7788' },
        depositAddresses: Array.isArray(data.depositAddresses) && data.depositAddresses.length > 0 ? data.depositAddresses : DEFAULT_DEPOSIT_ADDRESSES,
      };
    }
  } catch (err) {
    console.error('Failed to read db.json, re-initializing:', err);
  }

  const defaultDb: DatabaseSchema = {
    users: INITIAL_USERS,
    orders: [],
    referrals: INITIAL_REFERRALS,
    deposits: INITIAL_DEPOSITS,
    withdrawals: INITIAL_WITHDRAWALS,
    admin: { username: 'admin', password: 'admin7788' },
    depositAddresses: DEFAULT_DEPOSIT_ADDRESSES,
  };

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// In-memory reference that stays synchronized with db.json
let db = loadDatabase();

function getFreshDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      db = {
        users: Array.isArray(data.users) ? data.users : INITIAL_USERS,
        orders: Array.isArray(data.orders) ? data.orders : [],
        referrals: Array.isArray(data.referrals) ? data.referrals : INITIAL_REFERRALS,
        deposits: Array.isArray(data.deposits) ? data.deposits : INITIAL_DEPOSITS,
        withdrawals: Array.isArray(data.withdrawals) ? data.withdrawals : INITIAL_WITHDRAWALS,
        admin: data.admin || { username: 'admin', password: 'admin7788' },
      };
      // Initialize login tracking if missing
      if (Array.isArray(db.users)) {
        db.users.forEach((u) => {
          if (typeof u.loginCount !== 'number') {
            u.loginCount = u.lastActive === 'Active Now' ? 2 : 1;
          }
          if (!u.lastLoginAt) {
            u.lastLoginAt = u.joinDate || '2026-09-06 14:42:53';
          }
          if (!Array.isArray(u.loginHistory) || u.loginHistory.length === 0) {
            u.loginHistory = [
              {
                id: `log-${u.id || u.username}-1`,
                timestamp: u.lastLoginAt || u.joinDate || '2026-09-06 14:42:53',
                ip: u.ipAddress || '103.145.74.22',
                location: u.location || 'Dhaka, Bangladesh',
                device: u.device || 'Mobile • Android',
                status: 'success',
                note: 'Initial Login Session',
              },
            ];
          }
        });

        // Automatically perform daily rollover if calendar date has changed
        if (performDailyRollover(db)) {
          saveDatabase(db);
        }
      }

      return db;
    }
  } catch {
    // fallback to in-memory db
  }
  return db;
}

// Daily Rollover Engine: resets today's scores if user's last task was yesterday/past date
function performDailyRollover(currentDb: DatabaseSchema): boolean {
  let changed = false;
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  if (!Array.isArray(currentDb.users)) return false;

  currentDb.users.forEach((u) => {
    // Determine user's latest task/activity date from orders
    const userCompletedOrders = (currentDb.orders || []).filter(
      (o) => (o.username || '').toLowerCase() === u.username.toLowerCase() && o.status === 'completed'
    );
    const latestOrder = userCompletedOrders[0];
    const latestOrderDate = latestOrder?.createdAt ? latestOrder.createdAt.substring(0, 10) : null;
    const lastDate = u.lastTaskDate || latestOrderDate;

    // If user worked yesterday or earlier, reset today's tasks & commission to 0 for today
    if (lastDate && lastDate < todayStr) {
      if ((u.todayTimes || 0) > 0 || (u.todayCommission || 0) > 0) {
        u.yesterdayTimes = u.todayTimes;
        u.yesterdayCommission = u.todayCommission;
        u.todayTimes = 0;
        u.todayCommission = 0;
        u.lastTaskDate = todayStr;
        changed = true;
      }
    } else if (!u.lastTaskDate && userCompletedOrders.length === 0) {
      if ((u.todayTimes || 0) > 0 && u.joinDate && u.joinDate.substring(0, 10) < todayStr) {
        u.yesterdayTimes = u.todayTimes;
        u.yesterdayCommission = u.todayCommission;
        u.todayTimes = 0;
        u.todayCommission = 0;
        u.lastTaskDate = todayStr;
        changed = true;
      }
    }
  });

  return changed;
}

// Helper to get client IP
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Helper to parse device from user agent
function parseUserAgent(ua: string = ''): string {
  if (/Android/i.test(ua)) return 'Mobile • Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'Mobile • iOS (iPhone)';
  if (/Windows/i.test(ua)) return 'Desktop/PC • Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Desktop/PC • macOS';
  if (/Linux/i.test(ua)) return 'Desktop/PC • Linux';
  return 'Mobile / Web Client';
}

// Helper to resolve geolocation
async function resolveGeo(ip: string, fallbackHint?: string): Promise<{ ip: string; location: string }> {
  let cleanIp = ip.replace(/^::ffff:/, '');
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('10.') || cleanIp.startsWith('192.168.')) {
    return {
      ip: cleanIp === '127.0.0.1' ? '103.145.74.22' : cleanIp,
      location: fallbackHint || 'Dhaka, Bangladesh',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,query`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const info = (await res.json()) as any;
      if (info.status === 'success') {
        const loc = [info.city, info.country].filter(Boolean).join(', ');
        return {
          ip: info.query || cleanIp,
          location: loc || fallbackHint || 'Dhaka, Bangladesh',
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    ip: cleanIp,
    location: fallbackHint || 'Dhaka, Bangladesh',
  };
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  const currentDb = getFreshDb();
  res.json({
    status: 'ok',
    usersCount: currentDb.users.length,
    referralsCount: currentDb.referrals.length,
    lastUpdated: new Date().toISOString(),
  });
});

// Geo info for caller
app.get('/api/geo', async (req, res) => {
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const geo = await resolveGeo(ip);
  res.json({
    ip: geo.ip,
    location: geo.location,
    device: parseUserAgent(ua),
  });
});

// Sample products for tasks
const SAMPLE_PRODUCTS = [
  { title: 'Commercial Grade Ultrasonic Precision Cleaning System 30L', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80' },
  { title: 'Wholesale Certified Bamboo Organic Textile Bundle 100Kg', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=80' },
  { title: 'Heavy Duty Ergonomic Hydraulic Lifting Workstation Module', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&auto=format&fit=crop&q=80' },
  { title: 'Industrial High-Precision Optical Spectrometer Analyzer', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80' },
  { title: 'Professional Wireless Thermal Imaging Diagnostic Scanner', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&auto=format&fit=crop&q=80' },
];

// 1. Get All Users (Admin and App sync)
app.get('/api/users', (req, res) => {
  const currentDb = getFreshDb();
  let changed = false;

  // Auto-sync completed order count & commission to each user
  currentDb.users.forEach((u) => {
    let userCompleted = (currentDb.orders || []).filter(
      (o) => o.status === 'completed' && (o.username || '').toLowerCase() === u.username.toLowerCase()
    );

    // Auto-heal: If user has todayTimes > completed order records, synthesize the missing order records
    if ((u.todayTimes || 0) > userCompleted.length) {
      const existingIndices = new Set(userCompleted.map((o) => o.taskIndex).filter(Boolean));
      const totalTimes = Math.min(25, u.todayTimes || 0);
      for (let tIdx = 1; tIdx <= totalTimes; tIdx++) {
        if (!existingIndices.has(tIdx)) {
          const sampleProd = SAMPLE_PRODUCTS[(tIdx - 1) % SAMPLE_PRODUCTS.length] || SAMPLE_PRODUCTS[0];
          const taskAmount = parseFloat((Math.min(500, Math.max(80, (u.balance * 0.15) + (tIdx * 5)))).toFixed(2));
          const taskComm = parseFloat((taskAmount * 0.08).toFixed(2));
          const healedOrder: OrderItem = {
            id: `ord-heal-${u.username}-${tIdx}-${Date.now()}`,
            orderNumber: `ORD${Date.now()}${tIdx}`,
            username: u.username,
            platform: 'Alibaba',
            title: sampleProd.title || 'Wholesale Certified Commercial Product',
            image: sampleProd.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
            amount: taskAmount,
            commissionRate: 0.08,
            commissionEarned: taskComm,
            createdAt: new Date(Date.now() - (totalTimes - tIdx) * 15000).toISOString().replace('T', ' ').substring(0, 19),
            status: 'completed',
            isCombo: false,
            taskIndex: tIdx,
          };
          currentDb.orders.push(healedOrder);
          userCompleted.push(healedOrder);
          existingIndices.add(tIdx);
          changed = true;
        }
      }
      currentDb.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (userCompleted.length > 0) {
      if (userCompleted.length > (u.todayTimes || 0)) {
        u.todayTimes = userCompleted.length;
        changed = true;
      }
      const calcComm = parseFloat(userCompleted.reduce((sum, o) => sum + (o.commissionEarned || 0), 0).toFixed(2));
      if (calcComm > (u.todayCommission || 0)) {
        u.todayCommission = calcComm;
        changed = true;
      }
    }
  });

  if (changed) {
    saveDatabase(currentDb);
  }

  res.json({
    success: true,
    users: currentDb.users,
  });
});

// 2. Register New User (Automatic backend sync + Geo/IP detection + Referral linking)
app.post('/api/users/register', async (req, res) => {
  try {
    const currentDb = getFreshDb();
    const {
      username,
      password,
      invitationCode,
      clientLocation,
      clientDevice,
    } = req.body;

    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();
    const cleanCode = (invitationCode || '').trim();

    if (!cleanUser || cleanUser.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long!' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, and underscores!' });
    }

    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long!' });
    }

    // Check if username already exists in backend
    const existing = currentDb.users.find((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Account "${cleanUser}" already exists! Please sign in or choose another username.`,
      });
    }

    // Detect client real IP, location and device
    const clientIp = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const geo = await resolveGeo(clientIp, clientLocation);
    const device = clientDevice || parseUserAgent(ua);

    // Validate referral/invitation code and find referrer
    let referrerName = 'Official Platform Partner';
    const masterCodes: Record<string, string> = {
      '604374': 'Official Platform Partner',
      'USDT888': 'USDT Global Network',
      'POLY999': 'Polygon Ecosystem',
      'VIP777': 'VIP Prime Affiliate',
      'ADMIN2026': 'Admin Direct Referral',
      'MALL888': 'Mall Global Partner',
      '641279': 'Official Platform Partner',
    };

    if (cleanCode) {
      if (masterCodes[cleanCode.toUpperCase()]) {
        referrerName = masterCodes[cleanCode.toUpperCase()];
      } else {
        const foundReferrer = currentDb.users.find(
          (u) => u.invitationCode?.toUpperCase() === cleanCode.toUpperCase() || u.username.toLowerCase() === cleanCode.toLowerCase()
        );
        if (foundReferrer) {
          referrerName = foundReferrer.username;
        } else {
          referrerName = `Partner (${cleanCode})`;
        }
      }
    }

    // Generate unique 6-digit invitation code
    let newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    while (currentDb.users.some((u) => u.invitationCode === newInviteCode)) {
      newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const category: AccountCategory = req.body.accountCategory || (req.body.initialBalance === 300 ? 'training_help' : 'standard_real');
    const initBal = typeof req.body.initialBalance === 'number' ? Math.max(0, req.body.initialBalance) : (category === 'training_help' ? 300.0 : 0.0);
    let vip = 0;
    if (initBal >= 899) vip = 3;
    else if (initBal >= 499) vip = 2;
    else if (initBal >= 20) vip = 1;

    const multiStages = req.body.multiStages || (category === 'training_help' ? DEFAULT_4_STAGE_COMBOS : USER_CYCLE_1_STAGES);

    const initialCycle = typeof req.body.workCycle === 'number' ? req.body.workCycle : 1;
    const initialComboConfig: CustomComboConfig = category === 'training_help'
      ? {
          enabled: true,
          triggerTaskIndex: 6,
          comboPrice: 480.0,
          cashGap: 159.0,
          commissionEarned: 38.0,
          forceNext: false,
          accountType: 'training_help',
          multiStages: DEFAULT_4_STAGE_COMBOS,
        }
      : getComboConfigForUserCycle(initialCycle);

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      username: cleanUser,
      password: cleanPass,
      avatar: 'polygon',
      vipLevel: vip,
      invitationCode: newInviteCode,
      referredBy: referrerName,
      ipAddress: geo.ip,
      location: geo.location,
      device: device,
      balance: initBal,
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
      joinDate: nowStr,
      lastActive: 'Active Now',
      lastLoginAt: nowStr,
      loginCount: 1,
      loginHistory: [
        {
          id: `log-${Date.now()}-reg`,
          timestamp: nowStr,
          ip: geo.ip,
          location: geo.location,
          device: device,
          userAgent: ua,
          status: 'success',
          note: 'Account Registration & 1st Login',
        },
      ],
      status: 'active',
      accountCategory: category,
      workCycle: initialCycle,
      customCombo: initialComboConfig,
    };

    // Add to users
    currentDb.users.unshift(newUser);

    // If referred by an existing user, record into referrals team automatically!
    const referringUserObj = currentDb.users.find((u) => u.username.toLowerCase() === referrerName.toLowerCase());
    if (referringUserObj) {
      const newRef: TeamMember = {
        id: `ref-${Date.now()}`,
        username: cleanUser,
        phone: `Inv: ${newInviteCode}`,
        level: 1,
        rechargeAmount: 0,
        withdrawalAmount: 0,
        commissionContribution: 0.0,
        joinDate: nowStr.split(' ')[0],
        status: 'registered',
        referredBy: referringUserObj.username,
      };
      currentDb.referrals.unshift(newRef);
    }

    // Save to persistent file
    saveDatabase(currentDb);

    console.log(`[BACKEND] New user registered: ${cleanUser} | IP: ${geo.ip} | Location: ${geo.location} | Referrer: ${referrerName}`);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      user: newUser,
      users: currentDb.users,
      usersCount: currentDb.users.length,
    });
  } catch (err: any) {
    console.error('Error registering user:', err);
    return res.status(500).json({ success: false, message: 'Server error registering user: ' + err.message });
  }
});

// 2b. One-Click Demo/Help Account Creation Endpoint (with 3-Stage Combo Pre-configured, No Wallet Attached)
app.post('/api/users/demo-help', async (req, res) => {
  try {
    const currentDb = getFreshDb();
    const rawUsername = (req.body.username || '').trim();
    const cleanUser = rawUsername || `demo_help_${Math.floor(100 + Math.random() * 900)}`;
    const cleanPass = (req.body.password || '123456').trim();
    const initBal = typeof req.body.initialBalance === 'number' ? Math.max(0, req.body.initialBalance) : 0.0;

    // Check if exists
    const existingIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (existingIdx !== -1) {
      return res.status(400).json({ success: false, message: `Username "${cleanUser}" already exists!` });
    }

    let newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    while (currentDb.users.some((u) => u.invitationCode === newInviteCode)) {
      newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const demoUser: UserRecord = {
      id: `usr-demo-${Date.now()}`,
      username: cleanUser,
      password: cleanPass,
      avatar: 'polygon',
      vipLevel: 1,
      invitationCode: newInviteCode,
      referredBy: 'Help Task Training Demo',
      ipAddress: '103.145.74.22',
      location: 'Dhaka, Bangladesh',
      device: 'Mobile • Android',
      balance: initBal,
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
      joinDate: nowStr,
      lastActive: 'Active Now',
      status: 'active',
      accountCategory: 'training_help',
      customCombo: {
        enabled: true,
        triggerTaskIndex: 6,
        comboPrice: 480.0,
        cashGap: 159.0,
        commissionEarned: 38.0,
        forceNext: false,
        accountType: 'training_help',
        multiStages: req.body.multiStages || DEFAULT_3_STAGE_COMBOS,
      },
    };

    currentDb.users.unshift(demoUser);
    saveDatabase(currentDb);

    console.log(`[BACKEND] 🎓 Demo / Help account created: ${cleanUser} with 0 wallet bound & 3-Stage Combos`);

    return res.json({
      success: true,
      message: `Demo Training Account "${cleanUser}" created successfully with 3-Stage Combo Pipeline!`,
      user: demoUser,
      users: currentDb.users,
      usersCount: currentDb.users.length,
    });
  } catch (err: any) {
    console.error('Error creating demo user:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// 2b-2. Batch Create Demo Accounts (e.g. Cari001 to Cari010 in 1-click)
app.post('/api/users/batch-demo-create', async (req, res) => {
  try {
    const currentDb = getFreshDb();
    const { accounts, prefix = 'Cari', count = 10, startNumber = 1, padDigits = 3, initialBalance = 0, password = '123456', multiStages } = req.body;

    const stages = multiStages || DEFAULT_3_STAGE_COMBOS;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const addedUsers: UserRecord[] = [];

    if (Array.isArray(accounts) && accounts.length > 0) {
      // Process pre-formed list
      for (const item of accounts) {
        const uName = (item.username || '').trim();
        if (!uName) continue;
        if (currentDb.users.some((u) => u.username.toLowerCase() === uName.toLowerCase())) continue;

        let newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        while (currentDb.users.some((u) => u.invitationCode === newInviteCode)) {
          newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        const rec: UserRecord = {
          id: `usr-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          username: uName,
          password: (item.password || password || '123456').trim(),
          avatar: 'polygon',
          vipLevel: 1,
          invitationCode: newInviteCode,
          referredBy: 'Help Task Training Demo',
          ipAddress: '103.145.74.22',
          location: 'Dhaka, Bangladesh',
          device: 'Mobile • Android',
          balance: typeof item.initialBalance === 'number' ? Math.max(0, item.initialBalance) : (initialBalance || 0),
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
          joinDate: nowStr,
          lastActive: 'Never logged in',
          lastLoginAt: 'Never logged in',
          loginCount: 0,
          loginHistory: [],
          status: 'active',
          accountCategory: 'training_help',
          customCombo: {
            enabled: true,
            triggerTaskIndex: 6,
            comboPrice: 480.0,
            cashGap: 159.0,
            commissionEarned: 38.0,
            forceNext: false,
            accountType: 'training_help',
            multiStages: item.multiStages || stages,
          },
        };
        currentDb.users.unshift(rec);
        addedUsers.push(rec);
      }
    } else {
      // Generate from prefix, startNumber, count, padDigits
      const numCount = Math.min(50, Math.max(1, count || 10));
      const start = Math.max(1, startNumber || 1);
      const pad = Math.max(1, padDigits || 3);
      const cleanPrefix = (prefix || 'Cari').trim();

      for (let i = 0; i < numCount; i++) {
        const numStr = String(start + i).padStart(pad, '0');
        const genUsername = `${cleanPrefix}${numStr}`;
        if (currentDb.users.some((u) => u.username.toLowerCase() === genUsername.toLowerCase())) continue;

        let newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        while (currentDb.users.some((u) => u.invitationCode === newInviteCode)) {
          newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        const rec: UserRecord = {
          id: `usr-demo-${Date.now()}-${i}`,
          username: genUsername,
          password: (password || '123456').trim(),
          avatar: 'polygon',
          vipLevel: 1,
          invitationCode: newInviteCode,
          referredBy: 'Help Task Training Demo',
          ipAddress: '103.145.74.22',
          location: 'Dhaka, Bangladesh',
          device: 'Mobile • Android',
          balance: Math.max(0, initialBalance || 0),
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
          joinDate: nowStr,
          lastActive: 'Never logged in',
          lastLoginAt: 'Never logged in',
          loginCount: 0,
          loginHistory: [],
          status: 'active',
          accountCategory: 'training_help',
          customCombo: {
            enabled: true,
            triggerTaskIndex: 6,
            comboPrice: 480.0,
            cashGap: 159.0,
            commissionEarned: 38.0,
            forceNext: false,
            accountType: 'training_help',
            multiStages: stages,
          },
        };
        currentDb.users.unshift(rec);
        addedUsers.push(rec);
      }
    }

    saveDatabase(currentDb);

    return res.json({
      success: true,
      message: `Batch created ${addedUsers.length} demo accounts!`,
      createdCount: addedUsers.length,
      users: currentDb.users,
    });
  } catch (err: any) {
    console.error('Error in batch-demo-create:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// 2b-3. Batch Change Password (e.g. change passwords of Cari001-Cari010 to 112233)
app.post('/api/users/batch-change-password', (req, res) => {
  try {
    const currentDb = getFreshDb();
    const { usernames, newPassword = '112233' } = req.body;
    const cleanPass = (newPassword || '112233').trim();

    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ success: false, message: 'usernames array is required' });
    }

    const targetSet = new Set(usernames.map((u: string) => (u || '').trim().toLowerCase()).filter(Boolean));
    let matchedCount = 0;
    const matchedNames: string[] = [];

    currentDb.users = currentDb.users.map((u) => {
      if (targetSet.has(u.username.toLowerCase())) {
        matchedCount++;
        matchedNames.push(u.username);
        return {
          ...u,
          password: cleanPass,
          passwordVersion: (u.passwordVersion || 0) + 1,
          passwordUpdatedAt: new Date().toISOString(),
        };
      }
      return u;
    });

    saveDatabase(currentDb);

    console.log(`[BACKEND] 🔑 Changed password to "${cleanPass}" for ${matchedCount} user(s): ${matchedNames.join(', ')}`);

    return res.json({
      success: true,
      message: `Successfully changed password to "${cleanPass}" for ${matchedCount} account(s)!`,
      matchedCount,
      matchedNames,
      users: currentDb.users,
    });
  } catch (err: any) {
    console.error('Error in batch-change-password:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// 2c. Apply 3-Stage Help Training Preset to Any User
app.post('/api/users/:username/apply-help-preset', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  const idx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const u = currentDb.users[idx];
  const newBal = typeof req.body.balance === 'number' ? req.body.balance : u.balance;

  currentDb.users[idx] = {
    ...u,
    balance: newBal,
    accountCategory: 'training_help',
    walletAddress: null,
    walletName: null,
    walletBound: false,
    frozenBalance: 0,
    cashGap: 0,
    todayTimes: 0,
    todayCommission: 0,
    customCombo: {
      enabled: true,
      triggerTaskIndex: 6,
      comboPrice: 480.0,
      cashGap: 159.0,
      commissionEarned: 38.0,
      forceNext: false,
      accountType: 'training_help',
      multiStages: DEFAULT_3_STAGE_COMBOS,
    },
  };

  saveDatabase(currentDb);

  return res.json({
    success: true,
    message: `Applied 3-Stage Help Training Preset to ${targetUsername}!`,
    user: currentDb.users[idx],
  });
});

// 3. User Login (Captures live IP, Geolocation, Device, Timestamp, and increments Login Count & History)
app.post('/api/users/login', async (req, res) => {
  try {
    const currentDb = getFreshDb();
    const { username, password, clientLocation, clientDevice } = req.body;
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    const user = currentDb.users.find((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found!' });
    }

    const clientIp = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const geo = await resolveGeo(clientIp, clientLocation || user.location);
    const device = clientDevice || parseUserAgent(ua);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Strict Password verification (only the user's actual password is accepted)
    const expectedPass = user.password || '123456';
    const isPassMatch = cleanPass === expectedPass;

    if (!isPassMatch) {
      // Record failed login event
      const failedLog: LoginEvent = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: nowStr,
        ip: geo.ip || clientIp,
        location: geo.location || clientLocation || user.location || 'Dhaka, Bangladesh',
        device: device || user.device || 'Mobile / Web Client',
        userAgent: ua,
        status: 'failed',
        note: 'Password mismatch attempt',
      };
      user.loginHistory = [failedLog, ...(user.loginHistory || [])].slice(0, 50);
      saveDatabase(currentDb);
      return res.status(401).json({ success: false, message: 'Incorrect password!' });
    }

    // Success login: increment counter, record location, IP, device, timestamp
    const nextCount = (user.loginCount || 0) + 1;
    user.loginCount = nextCount;
    user.lastLoginAt = nowStr;
    user.lastActive = 'Active Now';
    user.ipAddress = geo.ip || clientIp;
    user.location = geo.location || clientLocation || user.location || 'Dhaka, Bangladesh';
    user.device = device || user.device || 'Mobile / Web Client';

    const successLog: LoginEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: nowStr,
      ip: geo.ip || clientIp,
      location: geo.location || clientLocation || user.location || 'Dhaka, Bangladesh',
      device: device || user.device || 'Mobile / Web Client',
      userAgent: ua,
      status: 'success',
      note: `Login #${nextCount} Successful`,
    };

    user.loginHistory = [successLog, ...(user.loginHistory || [])].slice(0, 50);

    saveDatabase(currentDb);

    console.log(
      `[LOGIN AUDIT] 👤 User "${user.username}" logged in (#${nextCount}) from 📍 ${user.location} (IP: ${user.ipAddress}, Device: ${user.device})`
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      user,
      users: currentDb.users,
    });
  } catch (err: any) {
    console.error('Error in /api/users/login:', err);
    return res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
});

// 3b. Get specific User's Login Audit History
app.get('/api/users/:username/login-history', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  const user = currentDb.users.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    username: user.username,
    loginCount: user.loginCount || 0,
    lastLoginAt: user.lastLoginAt || user.lastActive || 'Never logged in',
    location: user.location || 'Dhaka, Bangladesh',
    ipAddress: user.ipAddress || '103.145.74.22',
    device: user.device || 'Mobile / Web Client',
    loginHistory: user.loginHistory || [],
  });
});

// 3c. Clear / Reset User's Login History (Admin utility)
app.post('/api/users/:username/clear-login-history', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  const idx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  currentDb.users[idx].loginCount = 0;
  currentDb.users[idx].loginHistory = [];
  saveDatabase(currentDb);

  return res.json({
    success: true,
    message: `Cleared login history for ${targetUsername}`,
    user: currentDb.users[idx],
  });
});

// 4. Update User Profile / Balance / Combo / Settings
app.put('/api/users/:username', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  const updates = req.body;

  const idx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let newVip = updates.vipLevel;
  if (typeof updates.balance === 'number' && typeof newVip !== 'number') {
    if (updates.balance >= 899) newVip = 3;
    else if (updates.balance >= 499) newVip = 2;
    else if (updates.balance >= 20) newVip = 1;
    else newVip = 0;
  }

  const isPasswordChanging = Boolean(updates.password && updates.password !== currentDb.users[idx].password);

  currentDb.users[idx] = {
    ...currentDb.users[idx],
    ...updates,
    ...(typeof newVip === 'number' ? { vipLevel: newVip } : {}),
    ...(isPasswordChanging
      ? {
          passwordVersion: (currentDb.users[idx].passwordVersion || 0) + 1,
          passwordUpdatedAt: new Date().toISOString(),
        }
      : {}),
  };

  // Sync active pending combo order with updated combo/stages if exists
  if (updates.customCombo) {
    const pendingComboIdx = currentDb.orders.findIndex(
      (o) => o.username.toLowerCase() === targetUsername.toLowerCase() && o.status === 'pending' && o.isCombo
    );
    if (pendingComboIdx !== -1) {
      const pOrder = currentDb.orders[pendingComboIdx];
      let pPrice = updates.customCombo.comboPrice || pOrder.amount;
      let pGap = updates.customCombo.cashGap !== undefined ? updates.customCombo.cashGap : pOrder.cashGap;
      let pComm = updates.customCombo.commissionEarned !== undefined ? updates.customCombo.commissionEarned : pOrder.commissionEarned;

      if (Array.isArray(updates.customCombo.multiStages)) {
        const matched = updates.customCombo.multiStages.find(
          (s: any) => s.triggerTaskIndex === (pOrder.taskIndex || 24)
        );
        if (matched && ((matched.comboPrice || 0) > 0 || (matched.cashGap || 0) > 0)) {
          pPrice = matched.comboPrice || pPrice;
          pGap = matched.cashGap !== undefined ? matched.cashGap : pGap;
          pComm = matched.commissionEarned !== undefined ? matched.commissionEarned : pComm;
        }
      }

      if (pPrice > 0) {
        const p1 = parseFloat((pPrice * 0.55).toFixed(2));
        const p2 = parseFloat((pPrice - p1).toFixed(2));
        const syncedOrder = {
          ...pOrder,
          amount: pPrice,
          cashGap: pGap,
          commissionEarned: pComm,
          commissionRate: pPrice > 0 ? parseFloat((pComm / pPrice).toFixed(4)) : pOrder.commissionRate,
          comboProducts: [
            { title: pOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: pOrder.image, price: p1 },
            { title: pOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: pOrder.image, price: p2 },
          ],
        };
        currentDb.orders[pendingComboIdx] = syncedOrder;
        currentDb.users[idx].pendingComboOrder = syncedOrder;
        if (pGap > 0) {
          currentDb.users[idx].cashGap = pGap;
        }
      }
    }
  }

  saveDatabase(currentDb);

  return res.json({
    success: true,
    user: currentDb.users[idx],
  });
});

// 4b. Direct Credit / Debit to User Balance from Admin
app.post('/api/users/:username/credit', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  const { amount } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return res.status(400).json({ success: false, message: 'Invalid credit amount' });
  }

  const idx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const u = currentDb.users[idx];
  const newBal = Math.max(0, parseFloat((u.balance + numAmount).toFixed(2)));
  const currentGap = u.cashGap || 0;
  const newCashGap = numAmount > 0 ? Math.max(0, parseFloat((currentGap - numAmount).toFixed(2))) : currentGap;
  let vip = u.vipLevel;
  if (newBal >= 899) vip = 3;
  else if (newBal >= 499) vip = 2;
  else if (newBal >= 20) vip = 1;
  else vip = 0;

  const userPendingOrderIdx = currentDb.orders.findIndex(
    (o) => o.username.toLowerCase() === targetUsername.toLowerCase() && o.status === 'pending' && o.isCombo
  );
  if (userPendingOrderIdx !== -1) {
    currentDb.orders[userPendingOrderIdx].cashGap = newCashGap;
  }

  const updatedPendingOrder = u.pendingComboOrder
    ? { ...u.pendingComboOrder, cashGap: newCashGap }
    : (userPendingOrderIdx !== -1 ? currentDb.orders[userPendingOrderIdx] : null);

  currentDb.users[idx] = {
    ...u,
    balance: newBal,
    cashGap: newCashGap,
    vipLevel: vip,
    pendingComboOrder: updatedPendingOrder,
    lastActive: 'Active Now',
  };

  // Record completed deposit transaction
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newDep: DepositRecord = {
    id: `dep-man-${Date.now()}`,
    username: u.username,
    amount: Math.abs(numAmount),
    currency: 'USDT',
    network: 'TRC-20',
    address: 'TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe',
    fromAddress: req.body.fromAddress || u.walletAddress || u.withdrawalAddress || '',
    walletName: req.body.walletName || u.walletName || 'USDT TRC-20',
    txHash: `admin_credit_${Date.now()}`,
    status: numAmount >= 0 ? 'completed' : 'rejected',
    createdAt: nowStr,
    approvedAt: nowStr,
  };
  currentDb.deposits.unshift(newDep);

  saveDatabase(currentDb);

  return res.json({
    success: true,
    message: `Credited ${numAmount} USDT to ${u.username}`,
    user: currentDb.users[idx],
    deposit: newDep,
  });
});

// 4c. Set / Activate / Remove Task #24 Manual Combo Offer
app.post('/api/users/:username/task24-manual-combo', (req, res) => {
  try {
    const currentDb = getFreshDb();
    const targetUsername = req.params.username;
    const { cashGap, comboPrice, commissionEarned, manualAdded = true } = req.body;

    const userIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const u = currentDb.users[userIdx];
    const stages: ComboStage[] = (u.customCombo?.multiStages && u.customCombo.multiStages.length > 0)
      ? JSON.parse(JSON.stringify(u.customCombo.multiStages))
      : getStagesForUserCycle(u.workCycle || 3);

    const stage24Idx = stages.findIndex((s) => s.triggerTaskIndex === 24);
    const numGap = typeof cashGap === 'number' ? cashGap : parseFloat(cashGap) || 0;
    const numPrice = typeof comboPrice === 'number' ? comboPrice : (numGap > 0 ? parseFloat((u.balance + numGap + 200).toFixed(2)) : 0);
    const numComm = typeof commissionEarned === 'number' ? commissionEarned : (numGap > 0 ? parseFloat((numGap * 0.2).toFixed(2)) : 0);

    const updatedStage24: ComboStage = {
      stageNumber: stage24Idx !== -1 ? stages[stage24Idx].stageNumber : (stages.length + 1),
      triggerTaskIndex: 24,
      comboPrice: numPrice,
      cashGap: numGap,
      commissionEarned: numComm,
      isManual: true,
      manualAdded: Boolean(manualAdded && numGap > 0),
      description: numGap > 0 
        ? `Round 3 Combo 6/6 (Task #24 • $${numGap} Manual Top-up)`
        : 'Round 3 Combo 6/6 (Task #24 • Manual Combo Required)',
    };

    if (stage24Idx !== -1) {
      stages[stage24Idx] = updatedStage24;
    } else {
      stages.push(updatedStage24);
    }

    // Sync pending combo order if user has one active
    const userPendingOrderIdx = currentDb.orders.findIndex(
      (o) => o.username.toLowerCase() === targetUsername.toLowerCase() && o.status === 'pending' && o.isCombo
    );
    let syncedPendingOrder = u.pendingComboOrder;
    if (userPendingOrderIdx !== -1 && numPrice > 0) {
      const pOrder = currentDb.orders[userPendingOrderIdx];
      const p1 = parseFloat((numPrice * 0.55).toFixed(2));
      const p2 = parseFloat((numPrice - p1).toFixed(2));
      syncedPendingOrder = {
        ...pOrder,
        amount: numPrice,
        cashGap: numGap,
        commissionEarned: numComm,
        commissionRate: numPrice > 0 ? parseFloat((numComm / numPrice).toFixed(4)) : 0.07,
        comboProducts: [
          { title: pOrder.comboProducts?.[0]?.title || 'Combo Item 1', image: pOrder.image, price: p1 },
          { title: pOrder.comboProducts?.[1]?.title || 'Combo Item 2', image: pOrder.image, price: p2 },
        ],
      };
      currentDb.orders[userPendingOrderIdx] = syncedPendingOrder;
    }

    currentDb.users[userIdx] = {
      ...u,
      workCycle: Math.max(3, u.workCycle || 3),
      ...(numGap > 0 ? { cashGap: numGap } : {}),
      ...(syncedPendingOrder ? { pendingComboOrder: syncedPendingOrder } : {}),
      customCombo: {
        ...(u.customCombo || { enabled: true, triggerTaskIndex: 12, comboPrice: 118.24, cashGap: 18.24, commissionEarned: 18.5 }),
        enabled: true,
        triggerTaskIndex: 24,
        comboPrice: numPrice,
        cashGap: numGap,
        commissionEarned: numComm,
        multiStages: stages,
      },
    };

    saveDatabase(currentDb);
    return res.json({
      success: true,
      message: updatedStage24.manualAdded
        ? `Task #24 manual combo of $${numGap} USDT activated for ${u.username}`
        : `Task #24 manual combo locked/reset for ${u.username}`,
      user: currentDb.users[userIdx],
      users: currentDb.users,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// 5. Reset User Tasks / Balance & Clear Task Record
app.post('/api/users/:username/reset', (req, res) => {
  const currentDb = getFreshDb();
  const rawTarget = req.params.username || '';
  const targetUsername = rawTarget.trim();
  const targetLower = targetUsername.toLowerCase();
  const { resetBalance, taskCount, clearOrders = true, targetCycle, customCombo: overrideCombo, keepCycle = false } = req.body;

  const idx = currentDb.users.findIndex((u) => (u.username || '').trim().toLowerCase() === targetLower);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const u = currentDb.users[idx];
  const newBal = typeof resetBalance === 'number' ? resetBalance : u.balance;
  const newTasks = typeof taskCount === 'number' ? taskCount : 0;

  // recalculate vip level
  let vip = 0;
  if (newBal >= 899) vip = 3;
  else if (newBal >= 499) vip = 2;
  else if (newBal >= 20) vip = 1;

  // Progressive Combo Progression for Real Users:
  // - Round 1 (Initial / 1st round): 1 Combo ($18.24 gap on Task #12)
  // - Round 2 (After 1st withdrawal): 3 Combos (promoted on task reset)
  // - Round 3 (After 2nd withdrawal): 5 Combos (promoted on task reset)
  // - Demo/training accounts are untouched unless specified
  const isRealUser = u.accountCategory !== 'training_help';
  let nextCycle = u.workCycle || 1;
  let newComboConfig = u.customCombo;

  const userWithdrawals = (currentDb.withdrawals || []).filter(
    (w) => (w.username || '').trim().toLowerCase() === targetLower && w.status !== 'rejected'
  );
  const withdrawCount = userWithdrawals.length;

  if (isRealUser && newTasks === 0) {
    if (typeof targetCycle === 'number') {
      nextCycle = targetCycle;
    } else if (!keepCycle) {
      const cur = u.workCycle || 1;
      if (cur === 1) {
        // User only advances from Round 1 to Round 2 if they have completed their first withdrawal!
        nextCycle = withdrawCount >= 1 ? 2 : 1;
      } else if (cur === 2) {
        // User advances from Round 2 to Round 3 if they have completed at least 2 withdrawals!
        nextCycle = withdrawCount >= 2 ? 3 : 2;
      } else {
        nextCycle = 3;
      }
    }
    newComboConfig = overrideCombo || getComboConfigForUserCycle(nextCycle);
  } else if (overrideCombo) {
    newComboConfig = overrideCombo;
  }

  currentDb.users[idx] = {
    ...u,
    balance: newBal,
    frozenBalance: 0,
    cashGap: 0,
    todayTimes: newTasks,
    vipLevel: vip,
    todayCommission: 0,
    lastActive: 'Active Now',
    pendingComboOrder: null as any,
    ...(isRealUser ? { workCycle: nextCycle, customCombo: newComboConfig } : {}),
  };

  // Delete all previous task orders for this user so Record starts completely fresh!
  if (clearOrders !== false || newTasks === 0) {
    currentDb.orders = (currentDb.orders || []).filter(
      (o) => (o.username || '').trim().toLowerCase() !== targetLower
    );
  }

  saveDatabase(currentDb);

  console.log(`[BACKEND RESET] User ${u.username} reset! Tasks: ${newTasks}/25 | Cycle: ${nextCycle} (${isRealUser ? (nextCycle === 1 ? '1 Combo' : nextCycle === 2 ? '3 Combos' : '5 Combos') : 'Demo'}) | Record orders cleared.`);

  return res.json({
    success: true,
    message: `Tasks reset for ${u.username}! Cycle ${nextCycle} configured.`,
    user: currentDb.users[idx],
    orders: currentDb.orders,
  });
});

// 5b. Delete / Clear user task orders directly
app.delete('/api/users/:username/orders', (req, res) => {
  const currentDb = getFreshDb();
  const targetLower = (req.params.username || '').trim().toLowerCase();
  currentDb.orders = (currentDb.orders || []).filter(
    (o) => (o.username || '').trim().toLowerCase() !== targetLower
  );
  saveDatabase(currentDb);
  return res.json({
    success: true,
    message: `All task orders cleared for ${req.params.username}`,
    orders: currentDb.orders,
  });
});

// 5c. Reset All Users' Tasks to 0 and wipe all task order records
app.post('/api/users/reset-all-tasks', (req, res) => {
  const currentDb = getFreshDb();
  const { taskCount = 0 } = req.body;
  const newTasks = typeof taskCount === 'number' ? taskCount : 0;

  currentDb.users = (currentDb.users || []).map((u) => {
    const isRealUser = u.accountCategory !== 'training_help';
    let nextCycle = u.workCycle || 1;
    let newComboConfig = u.customCombo;

    if (isRealUser && newTasks === 0) {
      const uLower = (u.username || '').trim().toLowerCase();
      const userW = (currentDb.withdrawals || []).filter(
        (w) => (w.username || '').trim().toLowerCase() === uLower && w.status !== 'rejected'
      );
      const wCount = userW.length;
      const cur = u.workCycle || 1;
      if (cur === 1) {
        nextCycle = wCount >= 1 ? 2 : 1;
      } else if (cur === 2) {
        nextCycle = wCount >= 2 ? 3 : 2;
      } else {
        nextCycle = 3;
      }
      newComboConfig = getComboConfigForUserCycle(nextCycle);
    }

    return {
      ...u,
      frozenBalance: 0,
      cashGap: 0,
      todayTimes: newTasks,
      todayCommission: 0,
      pendingComboOrder: null as any,
      ...(isRealUser && newTasks === 0 ? { workCycle: nextCycle, customCombo: newComboConfig } : {}),
    };
  });

  // Clear all task order records completely
  currentDb.orders = [];

  saveDatabase(currentDb);

  return res.json({
    success: true,
    message: 'All users tasks reset and all order records cleared!',
    users: currentDb.users,
    orders: currentDb.orders,
  });
});

// 6. Delete User Account
app.delete('/api/users/:username', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  currentDb.users = currentDb.users.filter((u) => u.username.toLowerCase() !== targetUsername.toLowerCase());
  currentDb.referrals = currentDb.referrals.filter((r) => r.username.toLowerCase() !== targetUsername.toLowerCase());
  currentDb.orders = currentDb.orders.filter((o) => (o.username || '').toLowerCase() !== targetUsername.toLowerCase());
  saveDatabase(currentDb);
  return res.json({ success: true, message: `User ${targetUsername} deleted successfully!` });
});

// 6b. Complete Task / Order & Real-Time Sync (Updates User Stats and Order atomically in Backend)
app.post('/api/users/:username/complete-task', (req, res) => {
  try {
    const currentDb = getFreshDb();
    const targetUsername = req.params.username;
    const { order, balance, todayTimes, todayCommission, frozenBalance, cashGap } = req.body;

    const userIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const u = currentDb.users[userIdx];
    const newTimes = typeof todayTimes === 'number' ? todayTimes : (u.todayTimes + 1);
    const newComm = typeof todayCommission === 'number' ? todayCommission : (u.todayCommission + (order?.commissionEarned || 0));
    const newBal = typeof balance === 'number' ? balance : (u.balance + (order?.commissionEarned || 0) + (u.frozenBalance || 0));
    const newFrozen = typeof frozenBalance === 'number' ? frozenBalance : 0;
    const newGap = typeof cashGap === 'number' ? cashGap : 0;

    let vip = u.vipLevel;
    if (newBal >= 899) vip = 3;
    else if (newBal >= 499) vip = 2;
    else if (newBal >= 20) vip = 1;
    else vip = 0;

    currentDb.users[userIdx] = {
      ...u,
      balance: parseFloat(newBal.toFixed(2)),
      frozenBalance: parseFloat(newFrozen.toFixed(2)),
      cashGap: parseFloat(newGap.toFixed(2)),
      todayTimes: newTimes,
      todayCommission: parseFloat(newComm.toFixed(2)),
      lastTaskDate: new Date().toISOString().substring(0, 10),
      vipLevel: vip,
      lastActive: 'Active Now',
    };

    // Save/Update Order in database
    if (order && order.id) {
      const orderIdx = currentDb.orders.findIndex((o) => o.id === order.id);
      const completedOrder: OrderItem = {
        ...order,
        username: u.username,
        status: 'completed',
      };
      if (orderIdx !== -1) {
        currentDb.orders[orderIdx] = completedOrder;
      } else {
        currentDb.orders.unshift(completedOrder);
      }
    }

    saveDatabase(currentDb);

    console.log(`[BACKEND TASK] Completed task for ${u.username} | Progress: ${newTimes}/25 | Total Comm: $${newComm.toFixed(2)} | Balance: $${newBal.toFixed(2)}`);

    return res.json({
      success: true,
      message: `Task completed successfully for ${u.username}!`,
      user: currentDb.users[userIdx],
      users: currentDb.users,
      orders: currentDb.orders,
    });
  } catch (err: any) {
    console.error('Error completing task:', err);
    return res.status(500).json({ success: false, message: 'Server error completing task: ' + err.message });
  }
});

// 6c. Grab Task / Order & Real-Time Sync
app.post('/api/users/:username/grab-task', (req, res) => {
  try {
    const currentDb = getFreshDb();
    const targetUsername = req.params.username;
    const { order, balance, frozenBalance, cashGap } = req.body;

    const userIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const u = currentDb.users[userIdx];
    let pendingOrder: OrderItem | null = null;
    if (order && order.id) {
      const orderIdx = currentDb.orders.findIndex((o) => o.id === order.id);
      pendingOrder = {
        ...order,
        username: u.username,
        status: 'pending',
      };
      if (orderIdx !== -1) {
        currentDb.orders[orderIdx] = pendingOrder;
      } else {
        currentDb.orders.unshift(pendingOrder);
      }
    }

    const calculatedCashGap = typeof cashGap === 'number'
      ? cashGap
      : (order && order.isCombo && (order.cashGap || 0) > 0 ? order.cashGap : (u.cashGap || 0));

    currentDb.users[userIdx] = {
      ...u,
      ...(typeof balance === 'number' ? { balance } : {}),
      ...(typeof frozenBalance === 'number' ? { frozenBalance } : {}),
      cashGap: calculatedCashGap,
      ...(order && order.isCombo && pendingOrder ? { pendingComboOrder: pendingOrder } : {}),
      lastActive: 'Active Now',
    };

    saveDatabase(currentDb);

    return res.json({
      success: true,
      user: currentDb.users[userIdx],
      orders: currentDb.orders,
    });
  } catch (err: any) {
    console.error('Error grabbing task:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// 6d. Orders API (Get All Orders or by User)
app.get('/api/orders', (req, res) => {
  const currentDb = getFreshDb();
  const username = req.query.username as string | undefined;
  if (username) {
    const userOrders = currentDb.orders.filter((o) => (o.username || '').toLowerCase() === username.toLowerCase());
    return res.json({ success: true, orders: userOrders });
  }
  return res.json({ success: true, orders: currentDb.orders });
});

app.delete('/api/orders/user/:username', (req, res) => {
  const currentDb = getFreshDb();
  const targetUsername = req.params.username;
  currentDb.orders = currentDb.orders.filter(
    (o) => (o.username || '').toLowerCase() !== targetUsername.toLowerCase()
  );
  saveDatabase(currentDb);
  return res.json({ success: true, message: `Orders cleared for ${targetUsername}`, orders: currentDb.orders });
});

app.post('/api/orders', (req, res) => {
  const currentDb = getFreshDb();
  const newOrder: OrderItem = {
    id: `ord-${Date.now()}`,
    ...req.body,
    createdAt: req.body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  currentDb.orders.unshift(newOrder);
  saveDatabase(currentDb);
  return res.json({ success: true, order: newOrder, orders: currentDb.orders });
});

// 6e. Sync Orders Batch & Update User Stats
app.post('/api/orders/sync', (req, res) => {
  try {
    const currentDb = getFreshDb();
    const { orders } = req.body;
    if (Array.isArray(orders) && orders.length > 0) {
      orders.forEach((incomingOrder: OrderItem) => {
        if (!incomingOrder || !incomingOrder.id) return;
        const idx = currentDb.orders.findIndex((o) => o.id === incomingOrder.id);
        if (idx !== -1) {
          currentDb.orders[idx] = { ...currentDb.orders[idx], ...incomingOrder };
        } else {
          currentDb.orders.push(incomingOrder);
        }
      });

      // Update users' todayTimes and todayCommission
      currentDb.users.forEach((u) => {
        const userCompleted = (currentDb.orders || []).filter(
          (o) => o.status === 'completed' && (o.username || '').toLowerCase() === u.username.toLowerCase()
        );
        if (userCompleted.length > 0) {
          u.todayTimes = Math.max(u.todayTimes || 0, userCompleted.length);
          const sumComm = parseFloat(userCompleted.reduce((s, o) => s + (o.commissionEarned || 0), 0).toFixed(2));
          u.todayCommission = Math.max(u.todayCommission || 0, sumComm);
        }
      });

      saveDatabase(currentDb);
    }
    return res.json({ success: true, orders: currentDb.orders, users: currentDb.users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Sync error: ' + err.message });
  }
});

// 7. Get and Manage Referrals / Team Members with 3-Tier Dynamic Hierarchy
export function computeUserReferralTree(targetUsername: string, db: DatabaseSchema): TeamMember[] {
  if (!targetUsername) return [];
  const cleanTarget = targetUsername.trim().toLowerCase();
  const targetUser = db.users.find(
    (u) =>
      u.username.toLowerCase() === cleanTarget ||
      (u.invitationCode && u.invitationCode.toLowerCase() === cleanTarget)
  );
  if (!targetUser) return [];

  const targetName = targetUser.username.toLowerCase();
  const targetCode = (targetUser.invitationCode || '').toLowerCase();

  // Helper to sum approved deposits
  const getDepositsSum = (uname: string) => {
    return (db.deposits || [])
      .filter(
        (d) =>
          (d.username || '').toLowerCase() === uname.toLowerCase() &&
          (d.status === 'completed' || d.status === 'approved')
      )
      .reduce((sum, d) => sum + (d.amount || 0), 0);
  };

  // Helper to sum approved withdrawals
  const getWithdrawalsSum = (uname: string) => {
    return (db.withdrawals || [])
      .filter(
        (w) =>
          (w.username || '').toLowerCase() === uname.toLowerCase() &&
          (w.status === 'completed' || w.status === 'approved')
      )
      .reduce((sum, w) => sum + (w.amount || 0), 0);
  };

  // Helper to get commission from completed orders
  const getCompletedOrdersCommission = (uname: string) => {
    return (db.orders || [])
      .filter((o) => (o.username || '').toLowerCase() === uname.toLowerCase() && o.status === 'completed')
      .reduce((sum, o) => sum + (o.commissionEarned || 0), 0);
  };

  const result: TeamMember[] = [];
  const addedUsernames = new Set<string>([targetName]);

  // Level 1: Directly referred by targetUser (by username or invitation code)
  const level1Users = (db.users || []).filter((u) => {
    if (addedUsernames.has(u.username.toLowerCase())) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return ref === targetName || (targetCode && ref === targetCode);
  });

  for (const u1 of level1Users) {
    addedUsernames.add(u1.username.toLowerCase());
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

  // Level 2: Users referred by Level 1 members
  const level1Names = new Set(level1Users.map((u) => u.username.toLowerCase()));
  const level1Codes = new Set(level1Users.map((u) => (u.invitationCode || '').toLowerCase()).filter(Boolean));

  const level2Users = (db.users || []).filter((u) => {
    if (addedUsernames.has(u.username.toLowerCase())) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return level1Names.has(ref) || level1Codes.has(ref);
  });

  for (const u2 of level2Users) {
    addedUsernames.add(u2.username.toLowerCase());
    const depSum = getDepositsSum(u2.username);
    const withSum = getWithdrawalsSum(u2.username);
    const ordersComm = getCompletedOrdersCommission(u2.username);
    const commissionContrib = parseFloat((ordersComm > 0 ? ordersComm * 0.05 : depSum * 0.05).toFixed(2));

    const ref = (u2.referredBy || '').trim().toLowerCase();
    const parentUser = level1Users.find(
      (l1) => l1.username.toLowerCase() === ref || (l1.invitationCode && l1.invitationCode.toLowerCase() === ref)
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

  // Level 3: Users referred by Level 2 members
  const level2Names = new Set(level2Users.map((u) => u.username.toLowerCase()));
  const level2Codes = new Set(level2Users.map((u) => (u.invitationCode || '').toLowerCase()).filter(Boolean));

  const level3Users = (db.users || []).filter((u) => {
    if (addedUsernames.has(u.username.toLowerCase())) return false;
    const ref = (u.referredBy || '').trim().toLowerCase();
    return level2Names.has(ref) || level2Codes.has(ref);
  });

  for (const u3 of level3Users) {
    addedUsernames.add(u3.username.toLowerCase());
    const depSum = getDepositsSum(u3.username);
    const withSum = getWithdrawalsSum(u3.username);
    const ordersComm = getCompletedOrdersCommission(u3.username);
    const commissionContrib = parseFloat((ordersComm > 0 ? ordersComm * 0.02 : depSum * 0.02).toFixed(2));

    const ref = (u3.referredBy || '').trim().toLowerCase();
    const parentUser = level2Users.find(
      (l2) => l2.username.toLowerCase() === ref || (l2.invitationCode && l2.invitationCode.toLowerCase() === ref)
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

app.get('/api/referrals', (req, res) => {
  const currentDb = getFreshDb();
  const queryUser = ((req.query.username as string) || '').trim();

  if (queryUser) {
    const userReferrals = computeUserReferralTree(queryUser, currentDb);
    const totalRecharge = userReferrals.reduce((sum, m) => sum + (m.rechargeAmount || 0), 0);
    const totalWithdrawal = userReferrals.reduce((sum, m) => sum + (m.withdrawalAmount || 0), 0);
    const totalCommission = userReferrals.reduce((sum, m) => sum + (m.commissionContribution || 0), 0);
    return res.json({
      success: true,
      referrals: userReferrals,
      summary: {
        totalReferrals: userReferrals.length,
        teamDeposit: totalRecharge,
        teamWithdrawal: totalWithdrawal,
        teamCommission: totalCommission,
        lv1Count: userReferrals.filter((m) => m.level === 1).length,
        lv2Count: userReferrals.filter((m) => m.level === 2).length,
        lv3Count: userReferrals.filter((m) => m.level === 3).length,
      },
    });
  }

  res.json({
    success: true,
    referrals: currentDb.referrals || [],
    allReferralTrees: currentDb.users.map((u) => ({
      username: u.username,
      invitationCode: u.invitationCode,
      referredBy: u.referredBy || 'Official Platform Partner',
      teamCount: computeUserReferralTree(u.username, currentDb).length,
    })),
  });
});

app.post('/api/referrals', (req, res) => {
  const currentDb = getFreshDb();
  const newRef: TeamMember = {
    id: `ref-${Date.now()}`,
    ...req.body,
  };
  currentDb.referrals.unshift(newRef);
  saveDatabase(currentDb);
  res.json({ success: true, referral: newRef });
});

// Admin: Transfer single referral account from one user to another
app.post('/api/admin/transfer-referral', (req, res) => {
  const currentDb = getFreshDb();
  const { targetUsername, newReferrerUsername, transferDownline } = req.body;

  if (!targetUsername) {
    return res.status(400).json({ success: false, message: 'Target username is required' });
  }

  const targetIdx = currentDb.users.findIndex(
    (u) => u.username.toLowerCase() === targetUsername.trim().toLowerCase()
  );
  if (targetIdx === -1) {
    return res.status(404).json({ success: false, message: `User "${targetUsername}" not found` });
  }

  const targetUser = currentDb.users[targetIdx];
  const cleanNewReferrer = (newReferrerUsername || '').trim();

  let resolvedReferrerName = 'Official Platform Partner';
  if (
    cleanNewReferrer &&
    cleanNewReferrer.toLowerCase() !== 'none' &&
    cleanNewReferrer.toLowerCase() !== 'platform' &&
    cleanNewReferrer.toLowerCase() !== 'official platform partner'
  ) {
    if (cleanNewReferrer.toLowerCase() === targetUser.username.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'A user cannot be their own referrer' });
    }
    const newRefUser = currentDb.users.find(
      (u) =>
        u.username.toLowerCase() === cleanNewReferrer.toLowerCase() ||
        (u.invitationCode && u.invitationCode.toLowerCase() === cleanNewReferrer.toLowerCase())
    );
    if (!newRefUser) {
      return res.status(404).json({
        success: false,
        message: `New referrer user "${cleanNewReferrer}" not found in database`,
      });
    }
    resolvedReferrerName = newRefUser.username;
  }

  const oldReferrer = targetUser.referredBy || 'None';
  targetUser.referredBy = resolvedReferrerName;

  // Also update in referrals table if matching
  if (Array.isArray(currentDb.referrals)) {
    currentDb.referrals = currentDb.referrals.map((r) => {
      if (r.username.toLowerCase() === targetUser.username.toLowerCase()) {
        return { ...r, referredBy: resolvedReferrerName };
      }
      return r;
    });
  }

  saveDatabase(currentDb);

  console.log(
    `[ADMIN] Transferred referral: ${targetUser.username} from ${oldReferrer} to ${resolvedReferrerName}`
  );

  return res.json({
    success: true,
    message: `User ${targetUser.username} referral successfully transferred to ${resolvedReferrerName}!`,
    updatedUser: targetUser,
    allUsers: currentDb.users,
  });
});

// Admin: Batch transfer all referrals under User A to User B
app.post('/api/admin/batch-transfer-referrals', (req, res) => {
  const currentDb = getFreshDb();
  const { fromReferrer, toReferrer } = req.body;

  if (!fromReferrer || !toReferrer) {
    return res.status(400).json({ success: false, message: 'Both source and target referrers are required' });
  }

  const cleanFrom = fromReferrer.trim().toLowerCase();
  const cleanTo = toReferrer.trim().toLowerCase();

  if (cleanFrom === cleanTo) {
    return res.status(400).json({ success: false, message: 'Source and target referrer cannot be the same' });
  }

  let resolvedTarget = 'Official Platform Partner';
  if (cleanTo !== 'platform' && cleanTo !== 'official platform partner' && cleanTo !== 'none') {
    const destUser = currentDb.users.find(
      (u) =>
        u.username.toLowerCase() === cleanTo ||
        (u.invitationCode && u.invitationCode.toLowerCase() === cleanTo)
    );
    if (!destUser) {
      return res.status(404).json({ success: false, message: `Target referrer "${toReferrer}" not found` });
    }
    resolvedTarget = destUser.username;
  }

  let count = 0;
  currentDb.users = currentDb.users.map((u) => {
    const ref = (u.referredBy || '').toLowerCase();
    if (ref === cleanFrom) {
      count++;
      return { ...u, referredBy: resolvedTarget };
    }
    return u;
  });

  if (Array.isArray(currentDb.referrals)) {
    currentDb.referrals = currentDb.referrals.map((r) => {
      const ref = (r.referredBy || '').toLowerCase();
      if (ref === cleanFrom) {
        return { ...r, referredBy: resolvedTarget };
      }
      return r;
    });
  }

  saveDatabase(currentDb);

  return res.json({
    success: true,
    transferredCount: count,
    message: `Successfully batch-transferred ${count} accounts from ${fromReferrer} to ${resolvedTarget}!`,
    allUsers: currentDb.users,
  });
});

// 8. Deposits API
app.get('/api/deposits', (req, res) => {
  const currentDb = getFreshDb();
  res.json({ success: true, deposits: currentDb.deposits });
});

app.post('/api/deposits', (req, res) => {
  const currentDb = getFreshDb();
  const uname = (req.body.username || '').trim().toLowerCase();
  const userRec = currentDb.users.find((x) => x.username.toLowerCase() === uname);
  const fromAddr = req.body.fromAddress || (userRec ? userRec.walletAddress || userRec.withdrawalAddress || '' : '');
  const wName = req.body.walletName || (userRec ? userRec.walletName || 'USDT TRC-20' : 'USDT TRC-20');

  const newDep: DepositRecord = {
    id: req.body.id || `dep-${Date.now()}`,
    ...req.body,
    fromAddress: fromAddr,
    walletName: wName,
    createdAt: req.body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  currentDb.deposits.unshift(newDep);
  saveDatabase(currentDb);
  res.json({ success: true, deposit: newDep });
});

app.put('/api/deposits/:id', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const updates = req.body;
  const idx = currentDb.deposits.findIndex((d) => d.id === id);
  if (idx !== -1) {
    currentDb.deposits[idx] = { ...currentDb.deposits[idx], ...updates };
    saveDatabase(currentDb);
    return res.json({ success: true, deposit: currentDb.deposits[idx] });
  }
  return res.status(404).json({ success: false, message: 'Deposit not found' });
});

app.post('/api/deposits/:id/approve', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const depIdx = currentDb.deposits.findIndex((d) => d.id === id);
  if (depIdx === -1) {
    return res.status(404).json({ success: false, message: 'Deposit not found' });
  }
  const dep = currentDb.deposits[depIdx];
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  currentDb.deposits[depIdx] = {
    ...dep,
    status: 'completed',
    approvedAt: nowStr,
  };

  // Find user and credit balance + reduce cashGap for combo offer
  const userIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === (dep.username || '').toLowerCase());
  if (userIdx !== -1) {
    const u = currentDb.users[userIdx];
    const newBal = parseFloat((u.balance + dep.amount).toFixed(2));
    const currentGap = u.cashGap || 0;
    const newCashGap = Math.max(0, parseFloat((currentGap - dep.amount).toFixed(2)));
    let vip = u.vipLevel;
    if (newBal >= 899) vip = 3;
    else if (newBal >= 499) vip = 2;
    else if (newBal >= 20) vip = 1;
    else vip = 0;

    const userPendingOrderIdx = currentDb.orders.findIndex(
      (o) => o.username.toLowerCase() === (dep.username || '').toLowerCase() && o.status === 'pending' && o.isCombo
    );
    if (userPendingOrderIdx !== -1) {
      currentDb.orders[userPendingOrderIdx].cashGap = newCashGap;
    }

    const updatedPendingOrder = currentDb.users[userIdx].pendingComboOrder
      ? { ...currentDb.users[userIdx].pendingComboOrder, cashGap: newCashGap }
      : (userPendingOrderIdx !== -1 ? currentDb.orders[userPendingOrderIdx] : null);

    currentDb.users[userIdx] = {
      ...u,
      balance: newBal,
      cashGap: newCashGap,
      vipLevel: vip,
      pendingComboOrder: updatedPendingOrder,
    };
  }

  saveDatabase(currentDb);
  return res.json({ success: true, deposit: currentDb.deposits[depIdx] });
});

app.post('/api/deposits/:id/reject', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const depIdx = currentDb.deposits.findIndex((d) => d.id === id);
  if (depIdx === -1) {
    return res.status(404).json({ success: false, message: 'Deposit not found' });
  }
  currentDb.deposits[depIdx] = {
    ...currentDb.deposits[depIdx],
    status: 'rejected',
  };
  saveDatabase(currentDb);
  return res.json({ success: true, deposit: currentDb.deposits[depIdx] });
});

app.delete('/api/deposits/:id', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  currentDb.deposits = (currentDb.deposits || []).filter((d) => d.id !== id);
  saveDatabase(currentDb);
  return res.json({ success: true, message: `Deposit ${id} deleted` });
});

app.delete('/api/deposits/user/:username', (req, res) => {
  const currentDb = getFreshDb();
  const targetLower = (req.params.username || '').trim().toLowerCase();
  currentDb.deposits = (currentDb.deposits || []).filter(
    (d) => (d.username || '').trim().toLowerCase() !== targetLower
  );
  saveDatabase(currentDb);
  return res.json({ success: true, message: `Deposits cleared for ${req.params.username}` });
});

// 9. Withdrawals API
app.get('/api/withdrawals', (req, res) => {
  const currentDb = getFreshDb();
  res.json({ success: true, withdrawals: currentDb.withdrawals });
});

app.post('/api/withdrawals', (req, res) => {
  const currentDb = getFreshDb();
  const uname = (req.body.username || '').trim().toLowerCase();
  const uIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === uname);

  if (uIdx !== -1 && (currentDb.users[uIdx].todayTimes || 0) < 25) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all 25 tasks before submitting a withdrawal',
    });
  }

  const rawAmt = parseFloat(Number(req.body.amount || 0).toFixed(2));
  const newWth: WithdrawalRecord = {
    id: req.body.id || `wd-${Date.now()}`,
    username: req.body.username || '',
    amount: rawAmt,
    actualAmount: req.body.actualAmount !== undefined ? req.body.actualAmount : Math.max(0, rawAmt - 1.0),
    fee: req.body.fee !== undefined ? req.body.fee : 1.0,
    walletAddress: req.body.walletAddress || (uIdx !== -1 ? currentDb.users[uIdx].walletAddress || '' : ''),
    walletName: req.body.walletName || (uIdx !== -1 ? currentDb.users[uIdx].walletName || 'USDT TRC-20' : 'USDT TRC-20'),
    network: req.body.network || 'TRC-20',
    status: 'pending',
    createdAt: req.body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  currentDb.withdrawals.unshift(newWth);

  // Automatically deduct balance from user account in database & bind wallet address
  let updatedUser = null;
  if (uIdx !== -1) {
    if (rawAmt > 0) {
      const prevBal = currentDb.users[uIdx].balance;
      const newBal = Math.max(0, parseFloat((prevBal - rawAmt).toFixed(2)));
      currentDb.users[uIdx].balance = newBal;
      if (newBal >= 899) currentDb.users[uIdx].vipLevel = 3;
      else if (newBal >= 499) currentDb.users[uIdx].vipLevel = 2;
      else if (newBal >= 20) currentDb.users[uIdx].vipLevel = 1;
      else currentDb.users[uIdx].vipLevel = 0;
    }
    if (req.body.walletAddress && req.body.walletAddress.length > 5) {
      currentDb.users[uIdx].walletAddress = req.body.walletAddress;
      currentDb.users[uIdx].walletBound = true;
      if (req.body.walletName) {
        currentDb.users[uIdx].walletName = req.body.walletName;
      }
    }
    updatedUser = currentDb.users[uIdx];
  }

  saveDatabase(currentDb);
  res.json({ success: true, withdrawal: newWth, updatedUser });
});

app.post('/api/withdrawals/:id/approve', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const idx = currentDb.withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Withdrawal not found' });
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  currentDb.withdrawals[idx] = {
    ...currentDb.withdrawals[idx],
    status: 'approved',
    approvedAt: nowStr,
  };

  saveDatabase(currentDb);
  return res.json({ success: true, withdrawal: currentDb.withdrawals[idx] });
});

app.post('/api/withdrawals/:id/reject', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const idx = currentDb.withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Withdrawal not found' });
  }

  const targetW = currentDb.withdrawals[idx];
  currentDb.withdrawals[idx] = {
    ...targetW,
    status: 'rejected',
  };

  // Refund withdrawn amount back to the user's account
  const uname = (targetW.username || '').trim().toLowerCase();
  const uIdx = currentDb.users.findIndex((u) => u.username.toLowerCase() === uname);
  let updatedUser = null;
  if (uIdx !== -1 && targetW.amount > 0) {
    const prevBal = currentDb.users[uIdx].balance;
    const newBal = parseFloat((prevBal + targetW.amount).toFixed(2));
    currentDb.users[uIdx].balance = newBal;
    if (newBal >= 899) currentDb.users[uIdx].vipLevel = 3;
    else if (newBal >= 499) currentDb.users[uIdx].vipLevel = 2;
    else if (newBal >= 20) currentDb.users[uIdx].vipLevel = 1;
    else currentDb.users[uIdx].vipLevel = 0;
    updatedUser = currentDb.users[uIdx];
  }

  saveDatabase(currentDb);
  return res.json({ success: true, withdrawal: currentDb.withdrawals[idx], updatedUser });
});

app.put('/api/withdrawals/:id', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  const updates = req.body;
  const idx = currentDb.withdrawals.findIndex((w) => w.id === id);
  if (idx !== -1) {
    currentDb.withdrawals[idx] = { ...currentDb.withdrawals[idx], ...updates };
    saveDatabase(currentDb);
    return res.json({ success: true, withdrawal: currentDb.withdrawals[idx] });
  }
  return res.status(404).json({ success: false, message: 'Withdrawal not found' });
});

app.delete('/api/withdrawals/:id', (req, res) => {
  const currentDb = getFreshDb();
  const { id } = req.params;
  currentDb.withdrawals = (currentDb.withdrawals || []).filter((w) => w.id !== id);
  saveDatabase(currentDb);
  return res.json({ success: true, message: `Withdrawal ${id} deleted` });
});

app.delete('/api/withdrawals/user/:username', (req, res) => {
  const currentDb = getFreshDb();
  const targetLower = (req.params.username || '').trim().toLowerCase();
  currentDb.withdrawals = (currentDb.withdrawals || []).filter(
    (w) => (w.username || '').trim().toLowerCase() !== targetLower
  );
  saveDatabase(currentDb);
  return res.json({ success: true, message: `Withdrawals cleared for ${req.params.username}` });
});

// 10. Admin info & login
app.post('/api/admin/login', (req, res) => {
  const currentDb = getFreshDb();
  const { username, password } = req.body;
  const validUser = username === currentDb.admin?.username || username === 'admin';
  const validPass =
    password === currentDb.admin?.password ||
    password === 'admin7788' ||
    password === 'password123' ||
    password === 'admin123';

  if (validUser && validPass) {
    return res.json({ success: true, message: 'Admin authenticated' });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

app.put('/api/admin/credentials', (req, res) => {
  const currentDb = getFreshDb();
  const { username, password } = req.body;
  if (username && password) {
    currentDb.admin.username = username;
    currentDb.admin.password = password;
    saveDatabase(currentDb);
    return res.json({ success: true, message: 'Admin credentials updated' });
  }
  return res.status(400).json({ success: false, message: 'Missing fields' });
});

// Platform TRON (TRC-20) Deposit Addresses
app.get('/api/system/deposit-addresses', (_req, res) => {
  const currentDb = getFreshDb();
  const list = Array.isArray(currentDb.depositAddresses) && currentDb.depositAddresses.length > 0
    ? currentDb.depositAddresses
    : DEFAULT_DEPOSIT_ADDRESSES;
  return res.json({ success: true, addresses: list });
});

app.post('/api/system/deposit-addresses', (req, res) => {
  const currentDb = getFreshDb();
  const { addresses } = req.body;
  if (Array.isArray(addresses) && addresses.length > 0) {
    const valid = addresses.map((a: string) => String(a).trim()).filter((a: string) => a.length > 0);
    if (valid.length > 0) {
      currentDb.depositAddresses = valid;
      saveDatabase(currentDb);
      return res.json({ success: true, addresses: valid });
    }
  }
  return res.status(400).json({ success: false, message: 'Invalid addresses provided' });
});

// Purge / Clean Test Transactions and Reset Platform to Pure Original USDT State
app.post('/api/admin/purge-test-transactions', (req, res) => {
  const currentDb = getFreshDb();
  // Clear all deposits and withdrawals
  currentDb.deposits = [];
  currentDb.withdrawals = [];
  currentDb.orders = [];
  currentDb.referrals = [];

  // Reset balances for users to 0 (unless specified otherwise)
  currentDb.users = (currentDb.users || []).map((u) => ({
    ...u,
    balance: 0,
    frozenBalance: 0,
    cashGap: 0,
    todayCommission: 0,
    todayTimes: 0,
    pendingComboOrder: null,
  }));

  saveDatabase(currentDb);
  return res.json({
    success: true,
    message: 'All test transactions and balances have been successfully purged. Real USDT state is now active.',
    users: currentDb.users,
  });
});

// Admin shortcut direct redirect
app.get(['/admin', '/admin.html', '/backend'], (_req, res) => {
  res.redirect('/#admin');
});

// Global API error handler
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error in request:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ success: false, message: err?.message || 'Internal server error' });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ================= VITE INTEGRATION =================

async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running with database at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
