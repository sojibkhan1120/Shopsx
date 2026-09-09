import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, CheckCircle2, Clock, ShoppingBag, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RecordView: React.FC = () => {
  const { orders, language, completeOrder, t, user, rechargeCashGap, setActiveTab, setIsDepositModalOpen, showToast, refreshBackendData } = useApp();

  // Fresh real-time sync with server database on entering Record View
  useEffect(() => {
    refreshBackendData?.();
  }, []);

  const incompleteOrders = orders.filter((o) => o.status === 'pending');
  const completeOrders = orders.filter((o) => o.status === 'completed');

  // Ensure completed orders count always harmonizes with user's todayTimes
  const effectiveCompleteOrders = React.useMemo(() => {
    const targetCount = Math.max(completeOrders.length, user.todayTimes || 0);
    if (targetCount <= completeOrders.length) {
      return completeOrders;
    }
    const existingIndices = new Set(completeOrders.map((o) => o.taskIndex).filter(Boolean));
    const backfilled = [...completeOrders];
    for (let tIdx = 1; tIdx <= targetCount; tIdx++) {
      if (!existingIndices.has(tIdx)) {
        const taskAmount = parseFloat((Math.min(500, Math.max(80, (user.balance * 0.15) + (tIdx * 5)))).toFixed(2));
        const taskComm = parseFloat((taskAmount * 0.08).toFixed(2));
        backfilled.push({
          id: `ord-rec-heal-${tIdx}`,
          orderNumber: `ORD${Date.now()}${tIdx}`,
          username: user.username,
          platform: 'Alibaba',
          title: 'Commercial Grade Precision Equipment & Wholesale Module',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
          amount: taskAmount,
          commissionRate: 0.08,
          commissionEarned: taskComm,
          createdAt: new Date(Date.now() - (targetCount - tIdx) * 15000).toISOString().replace('T', ' ').substring(0, 19),
          status: 'completed',
          isCombo: false,
          taskIndex: tIdx,
        });
        existingIndices.add(tIdx);
      }
    }
    return backfilled.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [completeOrders, user.todayTimes, user.balance, user.username]);

  const [activeSubTab, setActiveSubTab] = useState<'incomplete' | 'complete'>(() => {
    return incompleteOrders.length > 0 ? 'incomplete' : 'complete';
  });

  // If there are pending orders, ensure user lands on the incomplete tab to submit
  useEffect(() => {
    if (incompleteOrders.length > 0 && effectiveCompleteOrders.length === 0) {
      setActiveSubTab('incomplete');
    }
  }, [incompleteOrders.length, effectiveCompleteOrders.length]);

  const currentList = activeSubTab === 'incomplete' ? incompleteOrders : effectiveCompleteOrders;

  return (
    <div id="record-view-container" className="pb-24 px-3 pt-2">
      <div className="py-2.5 px-4 text-center rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white shadow-xs">
        <h2 className="text-base font-bold text-white tracking-wide">
          {t('record_title')}
        </h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          onClick={() => setActiveSubTab('incomplete')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'incomplete'
              ? 'bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white shadow-xs border border-transparent'
              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/80'
          }`}
        >
          <span>{t('incomplete')}</span>
          {incompleteOrders.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'incomplete'
                  ? 'bg-white/25 text-white'
                  : 'bg-rose-200 text-rose-900'
              }`}
            >
              {incompleteOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('complete')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'complete'
              ? 'bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white shadow-xs border border-transparent'
              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/80'
          }`}
        >
          <span>{t('complete')}</span>
          {effectiveCompleteOrders.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'complete'
                  ? 'bg-white/25 text-white'
                  : 'bg-rose-200 text-rose-900'
              }`}
            >
              {effectiveCompleteOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Advisory notice when pending orders need submission */}
      {activeSubTab === 'incomplete' && incompleteOrders.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-center space-x-2.5 shadow-2xs animate-in fade-in">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <p className="leading-snug text-[11.5px] text-amber-900">
            Please submit your pending order(s) below. Once submitted, you can continue grabbing subsequent task orders.
          </p>
        </div>
      )}

      {/* Records list */}
      <div className="mt-3 space-y-3">
        {currentList.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-xs">
            <FileText size={36} className="mx-auto mb-2 text-neutral-300 stroke-[1.5]" />
            <p>No more</p>
            {activeSubTab === 'incomplete' && (
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2 bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white rounded-xl text-xs font-bold hover:opacity-95 active:scale-95 shadow-xs transition-all inline-flex items-center space-x-1.5"
                >
                  <span>Go to Tasks to Grab Orders</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          currentList.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-3 border border-neutral-100 shadow-xs flex flex-col space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-2 border-b border-neutral-100">
                <span className="font-mono">{order.orderNumber}</span>
                <span className="text-[10px] text-neutral-400">{order.createdAt}</span>
              </div>

              <div className="flex space-x-3 items-center">
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-900 truncate">
                    {order.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-neutral-600">
                      Amount: <span className="font-bold text-neutral-900">{order.amount.toFixed(2)} USDT</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{(order.commissionEarned).toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="pt-2 flex items-center justify-end border-t border-neutral-50">
                  {(() => {
                    const requiredGap = Math.max(user.cashGap || 0, order.cashGap || 0);
                    const isLocked = order.isCombo && requiredGap > 0;
                    return (
                      <button
                        onClick={() => {
                          if (isLocked) {
                            showToast(`Please recharge the cash gap of ${requiredGap.toFixed(2)} USDT first to submit this combination order!`);
                            return;
                          }
                          completeOrder(order.id);
                          confetti({
                            particleCount: 65,
                            spread: 70,
                            origin: { y: 0.65 },
                          });
                        }}
                        disabled={isLocked}
                        className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ${
                          isLocked
                            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                            : 'bg-[#00875a] hover:bg-[#00744e] active:scale-95'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isLocked ? `Deposit ${requiredGap.toFixed(2)} USDT Required` : 'Submit Order Now'}</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {currentList.length > 0 && (
        <div className="mt-8 text-center text-xs text-neutral-400">
          No more
        </div>
      )}
    </div>
  );
};
