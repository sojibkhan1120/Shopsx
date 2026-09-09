import React, { useState } from 'react';
import { useApp, VIP_TIERS } from '../context/AppContext';
import { OrderGrabDetailView } from './OrderGrabDetailView';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import {
  AmazonBrandLogo,
  AlibabaBrandLogo,
  AliExpressBrandLogo,
  VipBadge,
} from './PlatformBrandLogos';

export const MenuView: React.FC = () => {
  const {
    user,
    language,
    activeTaskTier,
    setActiveTaskTier,
    orders,
    showToast,
    t,
  } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'VIP 1' | 'VIP 2' | 'VIP 3'>('All');

  const incompleteCount = orders.filter((o) => o.status === 'pending').length;

  if (activeTaskTier) {
    return <OrderGrabDetailView tier={activeTaskTier} onBack={() => setActiveTaskTier(null)} />;
  }

  const filteredTiers = VIP_TIERS.filter((tier) => {
    if (selectedFilter === 'All') return true;
    return tier.name === selectedFilter;
  });

  return (
    <div id="menu-view-container" className="pb-24 px-3 pt-2 bg-[#f8f9fa] min-h-screen">
      {/* Top Header */}
      <div className="py-2.5 text-center bg-gradient-to-r from-[#782335] via-[#691c2c] to-[#571422] text-white rounded-xl shadow-xs">
        <h2 className="text-base font-bold text-white">
          {t('nav_menu')}
        </h2>
      </div>

      {/* Tabs Filter matching the screenshot */}
      <div className="flex items-center space-x-2 my-3 overflow-x-auto no-scrollbar py-1">
        {(['All', 'VIP 1', 'VIP 2', 'VIP 3'] as const).map((tab) => (
          <button
            key={tab}
            id={`menu-filter-${tab.replace(/\s+/g, '')}`}
            onClick={() => setSelectedFilter(tab)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
              selectedFilter === tab
                ? 'bg-[#5a222f] text-white shadow-xs font-bold'
                : 'bg-white border border-neutral-200/80 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* VIP Cards List matching the screenshot exactly */}
      <div className="space-y-3 mt-3">
        {filteredTiers.map((tier) => {
          const effectiveBal = user.balance + user.frozenBalance;
          const isBalanceTooLow = effectiveBal < tier.minBalance;
          const isBalanceExceeded = effectiveBal > tier.maxBalance;
          const isEligible = !isBalanceTooLow && !isBalanceExceeded;
          const displayName = tier.platform === 'Aliexpress' ? 'AliExpress' : tier.platform;

          const handleTierClick = () => {
            if (isBalanceExceeded) {
              const eligibleTierName = effectiveBal >= 899 ? 'AliExpress (VIP 3)' : 'Alibaba (VIP 2)';
              showToast(
                `Your balance (${effectiveBal.toFixed(2)} USDT) exceeds ${displayName} limit (max ${tier.maxBalance} USDT). Please work on ${eligibleTierName}!`
              );
              return;
            }
            if (isBalanceTooLow) {
              showToast(
                `Insufficient balance! Minimum ${tier.minBalance} USDT required to unlock ${displayName}. Current balance: ${effectiveBal.toFixed(2)} USDT.`
              );
              return;
            }
            setActiveTaskTier(tier);
          };

          return (
            <div
              key={tier.id}
              id={`vip-tier-card-${tier.id}`}
              onClick={handleTierClick}
              className={`rounded-2xl p-4 border transition-all relative overflow-hidden group ${
                isEligible
                  ? 'bg-white border-neutral-100 shadow-xs hover:border-neutral-200 cursor-pointer active:scale-[0.99]'
                  : isBalanceExceeded
                  ? 'bg-neutral-50/80 border-amber-200/70 hover:border-amber-300 cursor-pointer opacity-90'
                  : 'bg-white/80 border-neutral-200/70 hover:border-neutral-300 cursor-pointer opacity-80'
              }`}
            >
              {/* Top VIP Badge directly matching the screenshot */}
              <div className="flex items-center justify-between mb-2">
                <VipBadge name={tier.name} />

                {isEligible ? (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 size={11} />
                    <span>Active</span>
                  </span>
                ) : isBalanceExceeded ? (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Lock size={11} />
                    <span>Balance Exceeded</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Lock size={11} />
                    <span>Balance Locked</span>
                  </span>
                )}
              </div>

              {/* Card Body: Logo on left, details on right */}
              <div className="flex items-center space-x-4">
                {/* Platform Logo matching the user's uploaded image */}
                <div className="shrink-0 flex items-center justify-center">
                  {tier.platform === 'Amazon' && (
                    <AmazonBrandLogo size={62} />
                  )}
                  {tier.platform === 'Alibaba' && (
                    <AlibabaBrandLogo size={62} />
                  )}
                  {(tier.platform === 'AliExpress' || tier.platform === 'Aliexpress') && (
                    <AliExpressBrandLogo size={62} />
                  )}
                </div>

                {/* Details matching screenshot typography */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-neutral-900 leading-tight">
                      {displayName}
                    </h3>
                    <ChevronRight size={18} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <p className="text-[12px] text-neutral-500 mt-1 truncate">
                    Available balance:{' '}
                    <span className="font-semibold text-neutral-700">
                      {tier.maxBalance > 10000
                        ? `≥${tier.minBalance}USDT`
                        : `${tier.minBalance}USDT-${tier.maxBalance}USDT`}
                    </span>
                  </p>

                  <p className="text-[12px] text-[#5578a8] font-medium mt-0.5">
                    Commissions:{' '}
                    <span className="font-bold text-[#39639b]">
                      {(tier.commissionRate * 100).toFixed(0)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center text-xs text-neutral-400">
        No more
      </div>
    </div>
  );
};
