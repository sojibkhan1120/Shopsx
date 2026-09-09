import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface PayoutRecord {
  id: number;
  username: string;
  amount: string;
}

const PAYOUT_RECORDS: PayoutRecord[] = [
  { id: 1, username: '2*********a', amount: '9.5 USDT' },
  { id: 2, username: '6*********d', amount: '24.0 USDT' },
  { id: 3, username: '8*********m', amount: '9.5 USDT' },
  { id: 4, username: '3*********k', amount: '68.5 USDT' },
  { id: 5, username: '9*********x', amount: '140.0 USDT' },
  { id: 6, username: '5*********t', amount: '9.5 USDT' },
  { id: 7, username: '7*********e', amount: '360.0 USDT' },
  { id: 8, username: '1*********a', amount: '24.0 USDT' },
  { id: 9, username: '4*********w', amount: '9.5 USDT' },
  { id: 10, username: '9*********v', amount: '520.0 USDT' },
];

export const LivePayoutTicker: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PAYOUT_RECORDS.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const currentItem = PAYOUT_RECORDS[currentIndex];

  return (
    <div
      id="live-payout-ticker"
      className="w-full my-2.5 px-4 py-3 bg-white rounded-xl border border-neutral-100 shadow-xs flex items-center justify-between overflow-hidden relative"
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* User Avatar Icon in Rose/Pink Outline */}
        <div className="w-9 h-9 rounded-full bg-rose-50/80 flex items-center justify-center shrink-0 border border-rose-100/60">
          <User size={20} className="text-rose-500 stroke-[1.8]" />
        </div>

        {/* Dynamic Animated User Info */}
        <div className="relative h-10 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              <span className="text-sm font-semibold text-neutral-800 tracking-tight leading-tight">
                {currentItem.username}
              </span>
              <span className="text-[11px] text-neutral-400 capitalize leading-tight mt-0.5">
                {t('successful') || 'successful'}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic Animated USDT Amount */}
      <div className="relative h-10 w-28 overflow-hidden shrink-0 flex items-center justify-end">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute text-sm font-semibold text-neutral-500 tracking-tight"
          >
            {currentItem.amount}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
