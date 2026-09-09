import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, HelpCircle, Users, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface InfoTopic {
  id: string;
  title: string;
  titleBn: string;
  summary: string;
  summaryBn: string;
  fullContent: string;
  fullContentBn: string;
  image: string;
  tag: string;
}

export const PLATFORM_TOPICS: InfoTopic[] = [
  {
    id: 'profile',
    title: 'Platform profile',
    titleBn: 'Platform profile',
    summary: 'MALL is an intelligent cloud global order matching platform connecting top merchants...',
    summaryBn: 'MALL is an intelligent cloud global order matching platform connecting top merchants...',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
    tag: 'Official Profile',
    fullContent: `MALL is an intelligent cloud global order matching and algorithmic merchant boosting ecosystem. By partnering with leading worldwide e-commerce giants such as Amazon, Alibaba, and AliExpress, we optimize store visibility, transaction liquidity, and authentic sales indexing.

Users contribute automated transaction validation through their secure USDT TRC-20 accounts, earning guaranteed task commissions between 4% and 12% per completed order matching cycle.`,
    fullContentBn: `MALL is an intelligent cloud global order matching and algorithmic merchant boosting ecosystem. By partnering with leading worldwide e-commerce giants such as Amazon, Alibaba, and AliExpress, we optimize store visibility, transaction liquidity, and authentic sales indexing.

Users contribute automated transaction validation through their secure USDT TRC-20 accounts, earning guaranteed task commissions between 4% and 12% per completed order matching cycle.`,
  },
  {
    id: 'rules',
    title: 'Platform rules',
    titleBn: 'Platform rules',
    summary: 'About recharge: [The platform will change the deposit address periodically...',
    summaryBn: 'About recharge: [The platform will change the deposit address periodically...',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&auto=format&fit=crop&q=80',
    tag: 'Security Rules',
    fullContent: `1. Recharging Protocol: Only TRON (TRC-20) network is supported. Always generate a fresh one-time address before initiating any transfer. Minimum recharge threshold is 10 USDT.
2. Withdrawal Policy: Withdrawals are processed within 10-30 minutes. An electronic TRC-20 wallet must be securely bound. Fixed handling fee is 1.0 USDT per transaction.
3. Order Rules: Each task is randomly dispatched according to your VIP level. Complete and submit orders promptly to maintain tier health.`,
    fullContentBn: `1. Recharging Protocol: Only TRON (TRC-20) network is supported. Always generate a fresh one-time address before initiating any transfer. Minimum recharge threshold is 10 USDT.
2. Withdrawal Policy: Withdrawals are processed within 10-30 minutes. An electronic TRC-20 wallet must be securely bound. Fixed handling fee is 1.0 USDT per transaction.
3. Order Rules: Each task is randomly dispatched according to your VIP level. Complete and submit orders promptly to maintain tier health.`,
  },
  {
    id: 'cooperation',
    title: 'What are the VIP tiers?',
    titleBn: 'What are the VIP tiers?',
    summary: 'VIP 1 (Amazon): 20-498 USDT balance, 4% commission. VIP 2 (Alibaba): 499-899 USDT balance...',
    summaryBn: 'VIP 1 (Amazon): 20-498 USDT balance, 4% commission. VIP 2 (Alibaba): 499-899 USDT balance...',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&auto=format&fit=crop&q=80',
    tag: 'VIP Tiers',
    fullContent: `What are the VIP tiers?

VIP 1 (Amazon): 20-498 USDT balance, 4% commission.
VIP 2 (Alibaba): 499-899 USDT balance, 8% commission.
VIP 3 (AliExpress): 899+ USDT balance, 12% commission.`,
    fullContentBn: `What are the VIP tiers?

VIP 1 (Amazon): 20-498 USDT balance, 4% commission.
VIP 2 (Alibaba): 499-899 USDT balance, 8% commission.
VIP 3 (AliExpress): 899+ USDT balance, 12% commission.`,
  },
  {
    id: 'instructions',
    title: 'Instructions for use',
    titleBn: 'Instructions for use',
    summary: 'To celebrate the MALL membership surpassing 1M, special bonuses are awarded...',
    summaryBn: 'To celebrate the MALL membership surpassing 1M, special bonuses are awarded...',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&auto=format&fit=crop&q=80',
    tag: 'User Guide',
    fullContent: `How to start earning in 3 simple steps:
Step 1: Deposit USDT (TRC-20) into your account (minimum 20 USDT to activate VIP 1 Amazon matching).
Step 2: Navigate to "Menu", select your VIP tier, and click "Grab the order immediately".
Step 3: Confirm and submit the generated order. Your original capital and earned commission will be credited directly to your accessible balance instantly!`,
    fullContentBn: `How to start earning in 3 simple steps:
Step 1: Deposit USDT (TRC-20) into your account (minimum 20 USDT to activate VIP 1 Amazon matching).
Step 2: Navigate to "Menu", select your VIP tier, and click "Grab the order immediately".
Step 3: Confirm and submit the generated order. Your original capital and earned commission will be credited directly to your accessible balance instantly!`,
  },
];

export const PlatformInfoModal: React.FC<{ topic: InfoTopic | null; onClose: () => void }> = ({
  topic,
  onClose,
}) => {
  const { language } = useApp();
  if (!topic) return null;

  return (
    <div
      id="platform-info-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-neutral-100 flex flex-col max-h-[85vh]">
        <div className="relative h-44 w-full bg-neutral-100">
          <img
            src={topic.image}
            alt={topic.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
            <span className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
              {topic.tag}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">
              {language === 'bn' ? topic.titleBn : topic.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto text-sm text-neutral-600 leading-relaxed whitespace-pre-line space-y-2">
          <p>{language === 'bn' ? topic.fullContentBn : topic.fullContent}</p>
        </div>

        <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-800 text-white text-xs font-semibold hover:bg-rose-900 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
