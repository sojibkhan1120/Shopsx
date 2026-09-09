import React, { useState } from 'react';
import { ChevronLeft, Flame, Sparkles, AlertCircle, CheckCircle2, RefreshCw, FileText, ArrowRight, Lock } from 'lucide-react';
import { useApp, VIP_TIERS } from '../context/AppContext';
import { VipTier, OrderItem } from '../types';
import confetti from 'canvas-confetti';

interface OrderGrabDetailViewProps {
  tier: VipTier;
  onBack: () => void;
}

export const OrderGrabDetailView: React.FC<OrderGrabDetailViewProps> = ({ tier, onBack }) => {
  const {
    user,
    orders,
    setActiveTab,
    setActiveTaskTier,
    generateRandomOrder,
    completeOrder,
    showToast,
    rechargeCashGap,
    setIsDepositModalOpen,
    effectiveTodayTimes,
    effectiveTodayCommission,
    pendingOrdersCount,
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<OrderItem | null>(null);

  const platformDisplayName = tier.platform === 'Aliexpress' ? 'AliExpress' : tier.platform;
  const commissionPercent = (tier.commissionRate * 100).toFixed(0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const hasPendingOrders = pendingOrders.length > 0;

  const effectiveBal = user.balance + user.frozenBalance;
  const isBalanceTooLow = effectiveBal < tier.minBalance;
  const isBalanceExceeded = effectiveBal > tier.maxBalance;

  const handleGrabOrder = () => {
    // If there's an existing pending combo order with cash gap, open it directly!
    if (user.pendingComboOrder) {
      const existing = generateRandomOrder(tier) || user.pendingComboOrder;
      setMatchedOrder(existing);
      return;
    }

    // STRICT RULE: If there is an unsubmitted order, user cannot grab any new task!
    // They must submit it from the Record tab first.
    if (hasPendingOrders) {
      showToast('You have an unsubmitted order! Please submit it from Record first.');
      setActiveTaskTier(null);
      setActiveTab('record');
      return;
    }

    // Check balance limit
    if (isBalanceExceeded) {
      const eligibleTier = effectiveBal >= 899 ? 'AliExpress (VIP 3)' : 'Alibaba (VIP 2)';
      showToast(`Balance exceeds limit! ${platformDisplayName} is only for ${tier.minBalance}-${tier.maxBalance} USDT. Please switch to ${eligibleTier}.`);
      return;
    }

    if (isBalanceTooLow) {
      showToast(`Insufficient balance! Minimum ${tier.minBalance} USDT required to grab orders in ${platformDisplayName}.`);
      return;
    }

    if (user.todayTimes >= tier.dailyTasks) {
      showToast("Today's quota (25/25) has been completed!");
      return;
    }

    setIsGenerating(true);

    // Realistic matching delay (1.2 seconds)
    setTimeout(() => {
      setIsGenerating(false);
      const newOrder = generateRandomOrder(tier);
      if (newOrder) {
        setMatchedOrder(newOrder);
      }
    }, 1200);
  };

  const handleConfirmOrder = () => {
    if (!matchedOrder) return;
    
    const requiredGap = Math.max(user.cashGap || 0, matchedOrder.cashGap || 0);
    if (matchedOrder.isCombo && requiredGap > 0) {
      showToast(`Please recharge the cash gap of ${requiredGap.toFixed(2)} USDT first to submit this combination order!`);
      return;
    }

    completeOrder(matchedOrder.id);
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.65 },
    });
    setMatchedOrder(null);
  };

  return (
    <div id="order-grab-detail-view" className="min-h-screen bg-[#f7f8fa] pb-24 animate-in fade-in">
      {/* Top Header & Account Balance Burgundy Block matching the user's screenshot */}
      <div className="bg-gradient-to-b from-[#782335] via-[#691c2c] to-[#571422] text-white pt-2 pb-14 px-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between h-11 relative">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={26} strokeWidth={2.4} />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {platformDisplayName}
          </h1>
          <div className="w-8" />
        </div>

        {/* Account Balance */}
        <div className="mt-4 px-1">
          <p className="text-xs text-white/80 font-normal">Account Balance:</p>
          <div className="text-2xl font-bold tracking-tight text-white mt-1.5">
            {user.balance === 0 ? '0' : user.balance.toFixed(2)} USDT
          </div>
        </div>
      </div>

      {/* Floating 6-Item White Stats Card matching screenshot */}
      <div className="mx-4 -mt-7 bg-white rounded-2xl p-5 shadow-xs border border-neutral-100">
        <div className="grid grid-cols-2 gap-y-7 gap-x-4 py-2">
          {/* 1. Today's Times */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-neutral-700 font-bold text-sm sm:text-base">
              {effectiveTodayTimes}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Today's Times
            </span>
          </div>

          {/* 2. Today's commission */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-neutral-700 font-bold text-sm sm:text-base">
              {effectiveTodayCommission > 0 ? `${effectiveTodayCommission.toFixed(2)}USDT` : '0USDT'}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Today's commission
            </span>
          </div>

          {/* 3. Combo offer price */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className={`font-bold text-sm sm:text-base ${user.cashGap > 0 ? 'text-rose-600 animate-pulse' : 'text-neutral-700'}`}>
              {user.cashGap > 0 ? `${user.cashGap.toFixed(2)}USDT` : '0USDT'}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Combo offer price
            </span>
          </div>

          {/* 4. Yesterday's buy commission */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-neutral-700 font-bold text-sm sm:text-base">
              {user.yesterdayBuyCommission > 0 ? `${user.yesterdayBuyCommission.toFixed(2)}USDT` : '0USDT'}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Yesterday's buy commission
            </span>
          </div>

          {/* 5. Yesterday's team commission */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-neutral-700 font-bold text-sm sm:text-base">
              {user.yesterdayTeamCommission > 0 ? `${user.yesterdayTeamCommission.toFixed(2)}USDT` : '0USDT'}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Yesterday's team commission
            </span>
          </div>

          {/* 6. Money frozen in accounts */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className={`font-bold text-sm sm:text-base ${user.frozenBalance > 0 ? 'text-amber-600' : 'text-neutral-700'}`}>
              {user.frozenBalance > 0 ? `${user.frozenBalance.toFixed(2)}USDT` : '0USDT'}
            </span>
            <span className="text-neutral-400 text-xs mt-1">
              Money frozen in accounts
            </span>
          </div>
        </div>
      </div>

      {/* Tier Exceeded Notice Banner */}
      {isBalanceExceeded && (
        <div className="mx-4 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Lock size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-amber-950">
              Balance Exceeds {platformDisplayName} Limit
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Your current balance is <strong>{effectiveBal.toFixed(2)} USDT</strong>. {platformDisplayName} only allows balances between {tier.minBalance} USDT - {tier.maxBalance} USDT.
              Based on your balance, you must work in <strong>{effectiveBal >= 899 ? 'AliExpress (VIP 3)' : 'Alibaba (VIP 2)'}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                const targetTier = VIP_TIERS.find(
                  (t) => effectiveBal >= t.minBalance && effectiveBal <= t.maxBalance
                );
                if (targetTier) {
                  setActiveTaskTier(targetTier);
                } else {
                  onBack();
                }
              }}
              className="mt-2.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#85283c] to-[#5d1726] hover:opacity-95 text-white font-bold text-[11px] flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Switch to {effectiveBal >= 899 ? 'AliExpress (VIP 3)' : 'Alibaba (VIP 2)'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Insufficient Balance Notice Banner */}
      {isBalanceTooLow && (
        <div className="mx-4 mt-4 p-3.5 bg-neutral-100 border border-neutral-200 rounded-2xl flex items-start space-x-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
            <Lock size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-neutral-800">
              Minimum Balance Required
            </div>
            <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
              Minimum <strong>{tier.minBalance} USDT</strong> is required to grab orders in {platformDisplayName}. Your balance is <strong>{effectiveBal.toFixed(2)} USDT</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Deep Wine Grab Order Button matching screenshot */}
      <div className="px-4 mt-5">
        <button
          id="grab-order-btn"
          onClick={handleGrabOrder}
          disabled={isGenerating || isBalanceExceeded || isBalanceTooLow}
          className={`w-full py-3.5 rounded-2xl text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center ${
            isBalanceExceeded || isBalanceTooLow
              ? 'bg-neutral-400 cursor-not-allowed opacity-90'
              : 'bg-[#5f2937] hover:bg-[#52222f] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>The order is being generated...</span>
            </div>
          ) : isBalanceExceeded ? (
            <div className="flex items-center space-x-1.5">
              <Lock size={15} />
              <span>Balance Exceeds {platformDisplayName} Limit (Max {tier.maxBalance} USDT)</span>
            </div>
          ) : isBalanceTooLow ? (
            <div className="flex items-center space-x-1.5">
              <Lock size={15} />
              <span>Insufficient Balance (Min {tier.minBalance} USDT)</span>
            </div>
          ) : user.pendingComboOrder ? (
            <div className="flex items-center space-x-1.5">
              <Flame size={16} className="text-amber-300 animate-bounce" />
              <span>Complete Pending Combo Order</span>
            </div>
          ) : (
            <span>Grab the order immediately</span>
          )}
        </button>
      </div>

      {/* Hints section matching screenshot */}
      <div className="px-5 mt-5 text-neutral-500 text-xs leading-relaxed space-y-1">
        <p className="font-normal text-neutral-500">Hint:</p>
        <p className="text-neutral-400 text-[11.5px] leading-normal">
          1: {commissionPercent}% of the amount of completed transactions earned (Special combo tasks reward up to 16% extra commission).
        </p>
        <p className="text-neutral-400 text-[11.5px] leading-normal">
          2: The system sends tasks randomly (Total 25 tasks). Complete them as soon as possible after matching them, so as to avoid hanging all the time.
        </p>
      </div>

      {/* Matched Order Modal (Regular vs Combo) */}
      {matchedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-y-auto no-scrollbar">
            
            {/* Header: Regular vs Combo */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              {matchedOrder.isCombo ? (
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10.5px] uppercase tracking-wide flex items-center space-x-1 shadow-2xs">
                    <Flame size={12} className="animate-pulse" />
                    <span>Lucky Combo Order (#{matchedOrder.taskIndex || user.todayTimes + 1})</span>
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Matched {matchedOrder.platform} Order (#{matchedOrder.taskIndex || user.todayTimes + 1}/25)</span>
                </span>
              )}
              <span className="text-[10px] text-neutral-400 font-mono">{matchedOrder.orderNumber}</span>
            </div>

            {/* Content: If Combo, show 2 products bundle */}
            {matchedOrder.isCombo && matchedOrder.comboProducts && matchedOrder.comboProducts.length > 0 ? (
              <div className="my-3 space-y-2">
                <div className="space-y-2">
                  {matchedOrder.comboProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Item #{idx + 1}
                        </span>
                        <h6 className="text-[11.5px] font-medium text-neutral-800 truncate mt-0.5">
                          {p.title}
                        </h6>
                        <span className="text-xs font-bold text-neutral-900 mt-0.5 block">
                          {p.price.toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Regular Single Product */
              <div className="flex space-x-3 my-3">
                <img
                  src={matchedOrder.image}
                  alt={matchedOrder.title}
                  className="w-16 h-16 rounded-lg object-cover border border-neutral-100 shrink-0"
                />
                <div className="flex-1">
                  <h5 className="text-xs font-semibold text-neutral-800 line-clamp-2 leading-snug">
                    {matchedOrder.title}
                  </h5>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-neutral-900">{matchedOrder.amount.toFixed(2)} USDT</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{matchedOrder.commissionEarned.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Summary matching screenshot exactly */}
            <div className="bg-neutral-50 rounded-xl p-3 text-[11.5px] text-neutral-600 space-y-1.5 mb-3 border border-neutral-100">
              <div className="flex justify-between items-center">
                <span>Total Order Amount:</span>
                <span className="font-bold text-neutral-900">{matchedOrder.amount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Commission Rate:</span>
                <span className="font-bold text-neutral-800">
                  {(matchedOrder.commissionRate * 100).toFixed(0)}%
                </span>
              </div>
              {matchedOrder.isCombo && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-rose-600">Combo offer price:</span>
                  <span className="font-extrabold text-rose-600">
                    {(user.cashGap > 0 ? user.cashGap : (user.customCombo?.cashGap || matchedOrder.amount)).toFixed(2)} USDT
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-neutral-200">
                <span className="font-semibold text-neutral-800">Net Profit to Earn:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  +{matchedOrder.commissionEarned.toFixed(2)} USDT
                </span>
              </div>
            </div>

            {/* Combo Top-Up Required Warning if locked */}
            {matchedOrder.isCombo && (user.cashGap > 0 || (matchedOrder.cashGap && matchedOrder.cashGap > 0)) && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11.5px] space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Recharge Top-Up Required</span>
                </div>
                <p className="text-rose-700 leading-tight">
                  This combination order requires a deposit top-up of{' '}
                  <strong className="font-extrabold text-rose-900">
                    {(user.cashGap > 0 ? user.cashGap : matchedOrder.cashGap || 0).toFixed(2)} USDT
                  </strong>{' '}
                  before it can be submitted. Please deposit or contact customer service.
                </p>
              </div>
            )}

            {/* Action Buttons matching screenshot */}
            <div className="flex space-x-2 mt-1">
              <button
                onClick={() => setMatchedOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={Boolean(matchedOrder.isCombo && (user.cashGap > 0 || (matchedOrder.cashGap && matchedOrder.cashGap > 0)))}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  matchedOrder.isCombo && (user.cashGap > 0 || (matchedOrder.cashGap && matchedOrder.cashGap > 0))
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95'
                }`}
              >
                {matchedOrder.isCombo && (user.cashGap > 0 || (matchedOrder.cashGap && matchedOrder.cashGap > 0))
                  ? `Deposit ${(user.cashGap > 0 ? user.cashGap : matchedOrder.cashGap || 0).toFixed(2)} USDT Required`
                  : 'Submit order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
