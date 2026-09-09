import { ComboStage, CustomComboConfig } from '../types';

/**
 * Standard User Progressive Combo Cycles:
 * - Round 1 (New Account / Before 1st Withdraw): 1 Combo Offer
 * - Round 2 (Task Reset for 2nd time, after deposit): 3 Combo Offers
 * - Round 3 (Task Reset for 3rd time, after deposit): 5 Combo Offers
 * - Round 4+: Continues with 5 Combo Offers
 *
 * *Note: Demo/Training accounts are exempt from this progression.
 * Admin can freely customize any stage, gap, price, or task index anytime.
 */

// Round 1: 1 Combo Offer (Single Stage)
export const USER_CYCLE_1_STAGES: ComboStage[] = [
  {
    stageNumber: 1,
    triggerTaskIndex: 12,
    comboPrice: 118.24,
    cashGap: 18.24,
    commissionEarned: 18.5,
    description: 'Round 1 Combo (1 of 1 • Task #12 • $18.24 Top-up)',
  },
];

// Round 2: 3 Combo Offers (Multi-Stage)
// #8: $89.004, #15: $168.22, #22: $243.14
export const USER_CYCLE_2_STAGES: ComboStage[] = [
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
export const USER_CYCLE_3_STAGES: ComboStage[] = [
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

export function getComboStagesForCycle(cycle: number = 1): ComboStage[] {
  if (cycle === 1) return JSON.parse(JSON.stringify(USER_CYCLE_1_STAGES));
  if (cycle === 2) return JSON.parse(JSON.stringify(USER_CYCLE_2_STAGES));
  return JSON.parse(JSON.stringify(USER_CYCLE_3_STAGES));
}

export function getComboConfigForUserCycle(cycle: number = 1, currentBalance: number = 0): CustomComboConfig {
  const stages = getComboStagesForCycle(cycle);
  const firstStage = stages[0];
  return {
    enabled: true,
    triggerTaskIndex: firstStage.triggerTaskIndex,
    comboPrice: firstStage.comboPrice,
    cashGap: firstStage.cashGap,
    commissionEarned: firstStage.commissionEarned,
    forceNext: false,
    accountType: 'standard_real',
    multiStages: stages,
  };
}

export function getCycleSummary(cycle: number = 1): { label: string; count: number; badgeColor: string } {
  if (cycle === 1) {
    return { label: 'Round 1 (1 Combo)', count: 1, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  }
  if (cycle === 2) {
    return { label: 'Round 2 (3 Combos)', count: 3, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  }
  return { label: `Round ${cycle} (5 Auto + #24 Manual)`, count: 6, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
}
