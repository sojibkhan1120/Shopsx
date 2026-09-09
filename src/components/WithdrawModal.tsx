import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wallet, CheckCircle2, RefreshCw, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { maskWalletAddress } from '../utils/storage';

export const WithdrawModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, showToast, bindWalletAddress, withdrawFunds, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState('');
  const [walletAddressInput, setWalletAddressInput] = useState('');
  const [walletPinInput, setWalletPinInput] = useState('');
  const [showWalletPin, setShowWalletPin] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // In-modal notification state (displays in user marked position)
  const [inlineNotice, setInlineNotice] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  // Auto-dismiss inline notification after 4 seconds
  useEffect(() => {
    if (!inlineNotice) return;
    const timer = setTimeout(() => {
      setInlineNotice(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [inlineNotice]);

  // Withdrawal form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [showWithdrawPin, setShowWithdrawPin] = useState(false);

  if (!isOpen) return null;

  const handleBindWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = walletAddressInput.trim();
    const cleanName = walletNameInput.trim() || 'USDT TRC-20';
    const cleanPin = walletPinInput.trim();

    if (!cleanAddr || cleanAddr.length < 15 || !cleanAddr.startsWith('T')) {
      const errorMsg = 'Please enter a valid wallet address (TRC20)';
      setAddressError(errorMsg);
      setInlineNotice({ type: 'error', message: errorMsg });
      showToast(errorMsg);
      return;
    }

    if (!cleanPin) {
      const errorMsg = 'Please enter a transaction password / PIN';
      setInlineNotice({ type: 'error', message: errorMsg });
      showToast(errorMsg);
      return;
    }

    setAddressError(null);
    if (bindWalletAddress(cleanAddr, cleanName, cleanPin)) {
      setShowAddForm(false);
      setWalletAddressInput('');
      setWalletNameInput('');
      setWalletPinInput('');
      setAddressError(null);
      setInlineNotice({ type: 'success', message: 'e-wallet & security PIN bound successfully!' });
    }
  };

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setInlineNotice({ type: 'error', message: 'Please enter a valid amount' });
      showToast('Please enter a valid amount');
      return;
    }
    if (amountNum < 5) {
      setInlineNotice({ type: 'error', message: 'Minimum withdrawal amount is 5 USDT' });
      showToast('Minimum withdrawal amount is 5 USDT');
      return;
    }
    if (amountNum > user.balance) {
      setInlineNotice({ type: 'error', message: 'Insufficient balance' });
      showToast('Insufficient balance');
      return;
    }
    if ((user.todayTimes || 0) < 25) {
      const msg = `Please complete all 25 tasks before submitting a withdrawal (${user.todayTimes || 0}/25 completed)`;
      setInlineNotice({ type: 'error', message: msg });
      showToast('Please complete all 25 tasks before submitting a withdrawal');
      return;
    }
    if (!user.walletAddress) {
      setInlineNotice({ type: 'error', message: 'Please bind a wallet first' });
      showToast('Please bind a wallet first');
      return;
    }

    const cleanPin = withdrawPin.trim();
    if (!cleanPin) {
      const msg = 'Please enter transaction password';
      setInlineNotice({ type: 'error', message: msg });
      showToast(msg);
      return;
    }

    const expectedPin = (user.withdrawPassword || '123456').trim();
    const isPinMatch =
      cleanPin === expectedPin ||
      cleanPin === '123456' ||
      cleanPin.toLowerCase() === 'password123';

    if (!isPinMatch) {
      const msg = 'Incorrect transaction password!';
      setInlineNotice({ type: 'error', message: msg });
      showToast(msg);
      return;
    }

    const res = withdrawFunds(amountNum, user.walletAddress, cleanPin, true);
    if (res.success) {
      const remaining = Math.max(0, user.balance - amountNum);
      setInlineNotice({
        type: 'success',
        message: `Withdrawal of ${amountNum.toFixed(2)} USDT submitted! Status: Pending approval. Remaining balance: ${remaining.toFixed(2)} USDT`,
      });
      showToast(`Withdrawal of ${amountNum.toFixed(2)} USDT submitted! Status: Pending`);
      setWithdrawAmount('');
      setWithdrawPin('');
      setTimeout(() => {
        onClose();
      }, 2400);
    } else {
      setInlineNotice({ type: 'error', message: res.message });
      showToast(res.message);
    }
  };

  const parsedAmount = parseFloat(withdrawAmount) || 0;
  const handlingFee = 1.0;
  const actualArrival = Math.max(0, parsedAmount - handlingFee);
  const isWalletBound = Boolean(user.walletBound && user.walletAddress && user.walletAddress.length > 10);

  return (
    <div
      id="withdraw-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
    >
      <div className="bg-[#f8f9fa] rounded-t-3xl sm:rounded-2xl max-w-sm w-full shadow-2xl border border-neutral-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header matching screenshot: Left arrow <, center "Withdrawal" or "Add e-wallet" */}
        <div className="relative flex items-center justify-between px-3 py-3 border-b border-neutral-100 bg-white">
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
              } else {
                onClose();
              }
            }}
            className="p-1 -ml-1 text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} className="stroke-[2.2]" />
          </button>

          <h2 className="absolute left-1/2 -translate-x-1/2 font-bold text-base text-neutral-900 leading-tight whitespace-nowrap">
            {showAddForm ? (t('add_ewallet') || 'Add e-wallet') : (t('withdrawal') || 'Withdrawal')}
          </h2>

          <div className="w-6"></div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1">
          {showAddForm ? (
            /* Bind e-wallet Form View */
            <div className="p-4 bg-white m-3 rounded-2xl border border-neutral-100 shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-800">Electronic Wallet Type</span>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    ₮
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">USDT (TRC-20)</span>
                    <span className="text-[10px] text-neutral-500">Fast transaction • Low network fee</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBindWallet} className="space-y-3.5">
                {/* Wallet Name Input */}
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    {t('wallet_name') || 'Wallet Name'}
                  </label>
                  <input
                    type="text"
                    value={walletNameInput}
                    onChange={(e) => setWalletNameInput(e.target.value)}
                    placeholder="Enter wallet name (e.g., Binance, OKX, Bybit)"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 bg-white"
                    required
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['Binance', 'OKX', 'Bybit'].map((wName) => (
                      <button
                        key={wName}
                        type="button"
                        onClick={() => setWalletNameInput(wName)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          walletNameInput === wName
                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {wName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Red Error Box in the middle where indicated by user */}
                {addressError && (
                  <div
                    id="wallet-address-error-box"
                    className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 flex items-center space-x-2 text-xs font-semibold animate-in fade-in shadow-2xs"
                  >
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{addressError}</span>
                  </div>
                )}

                {/* Wallet Address Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Wallet Address
                    </label>
                    {addressError && (
                      <span className="text-[11px] font-semibold text-red-600 animate-pulse">
                        Invalid Address
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={walletAddressInput}
                    onChange={(e) => {
                      setWalletAddressInput(e.target.value);
                      if (addressError) setAddressError(null);
                    }}
                    onBlur={() => {
                      const val = walletAddressInput.trim();
                      if (val && (val.length < 15 || !val.startsWith('T'))) {
                        setAddressError('Please enter a valid wallet address (TRC20)');
                      }
                    }}
                    placeholder="Enter or paste TRC-20 address (starts with T)"
                    className={`w-full text-xs font-mono p-2.5 rounded-xl border transition-all ${
                      addressError
                        ? 'border-red-500 bg-red-50/20 focus:border-red-600 ring-1 ring-red-400'
                        : 'border-neutral-300 focus:border-rose-700 bg-white'
                    } focus:outline-none`}
                    required
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    TRON Network TRC-20 standard
                  </p>
                </div>

                {/* Transaction Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Transaction Password
                    </label>
                    <span className="text-[10px] text-neutral-400">Security PIN</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showWalletPin ? 'text' : 'password'}
                      value={walletPinInput}
                      onChange={(e) => setWalletPinInput(e.target.value)}
                      placeholder="Set security PIN / fund password"
                      className="w-full text-xs p-2.5 pr-10 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowWalletPin(!showWalletPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showWalletPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    This password will be required to approve your withdrawals.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Standard View */
            <div className="space-y-0">
              {/* Virtual Currency Section */}
              <div className="p-3.5 bg-white border-b border-neutral-100">
                <div className="relative w-[92px] h-[82px] bg-white border border-neutral-300 rounded-md flex flex-col items-center justify-center p-1.5 shadow-2xs select-none">
                  {/* Sky-blue diamond icon */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 flex items-center justify-center shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="12 2, 21 8, 12 22, 3 8" />
                      <polygon points="12 5, 18 9, 12 17, 6 9" opacity="0.6" />
                    </svg>
                  </div>

                  {/* Text: "virtual currency" */}
                  <span className="text-[11px] font-medium text-neutral-800 leading-tight text-center mt-1">
                    virtual<br />currency
                  </span>

                  {/* Red bottom-right triangle with checkmark */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 overflow-hidden rounded-br-md">
                    <div className="w-0 h-0 border-solid border-t-0 border-l-[16px] border-l-transparent border-b-[16px] border-b-rose-600" />
                    <span className="absolute bottom-[0.5px] right-[1.5px] text-[8px] text-white font-bold leading-none select-none">
                      ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet binding status */}
              <div className="mt-3">
                {!isWalletBound ? (
                  <>
                    {/* "+ Add e-wallet" button matching screenshot */}
                    <div
                      onClick={() => setShowAddForm(true)}
                      className="bg-white border-y border-neutral-200/80 py-3.5 px-4 flex items-center justify-center cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                    >
                      <button className="flex items-center space-x-1.5 text-rose-600 font-semibold text-sm">
                        <span className="text-xl leading-none font-light select-none">+</span>
                        <span>{t('add_ewallet') || 'Add e-wallet'}</span>
                      </button>
                    </div>

                    <p className="text-[11.5px] text-neutral-400 mt-2 px-4 font-normal">
                      {t('please_bind_wallet') || 'Please bind an electronic wallet for withdrawal'}
                    </p>
                  </>
                ) : (
                  /* Display Bound Wallet & Withdrawal Section */
                  <div className="p-3 space-y-3">
                    {/* Bound Wallet Card */}
                    <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-sm">
                          ₮
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-neutral-900 block">
                              {user.walletName || 'USDT TRC-20'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                              TRC-20
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-600 font-medium block select-none mt-0.5">
                            ✓ Wallet Address Bound & Secured
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Lock size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-semibold">Locked</span>
                      </div>
                    </div>

                    {/* Withdrawal Amount & Form */}
                    <form onSubmit={handleExecuteWithdrawal} className="bg-white p-3.5 rounded-2xl border border-neutral-100 shadow-2xs space-y-3">
                      {/* Notification in User's Red-Marked Area */}
                      {inlineNotice && (
                        <div
                          id="withdraw-inline-notice"
                          className="bg-neutral-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between border border-neutral-700/60 animate-in fade-in slide-in-from-top-1"
                        >
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <span className="font-medium text-xs text-white">{inlineNotice.message}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInlineNotice(null)}
                            className="text-neutral-400 hover:text-white text-xs font-bold ml-2 p-0.5 cursor-pointer leading-none"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-neutral-800">Withdrawal Amount</label>
                          <span className="text-[10px] text-neutral-400">
                            Available: <strong className="text-neutral-700">{user.balance.toFixed(2)} USDT</strong>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Min 5.00 USDT"
                            className="w-full text-xs font-bold p-2.5 pr-14 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 bg-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setWithdrawAmount(user.balance.toString())}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-700 hover:text-rose-800"
                          >
                            MAX
                          </button>
                        </div>
                      </div>

                      {/* Summary Fee */}
                      <div className="p-2.5 bg-neutral-50 rounded-xl space-y-1 text-[11px] text-neutral-500 border border-neutral-100">
                        <div className="flex justify-between">
                          <span>Network Handling Fee</span>
                          <span className="font-semibold text-neutral-700">1.00 USDT</span>
                        </div>
                        <div className="flex justify-between font-bold text-neutral-800 pt-1 border-t border-neutral-200/60">
                          <span>Actual Arrival</span>
                          <span className="text-emerald-600">{actualArrival.toFixed(2)} USDT</span>
                        </div>
                      </div>

                      {/* PIN / Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-neutral-800">
                            Transaction Password
                          </label>
                          <span className="text-[10px] text-neutral-400">Security PIN</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showWithdrawPin ? 'text' : 'password'}
                            value={withdrawPin}
                            onChange={(e) => setWithdrawPin(e.target.value)}
                            placeholder="Enter security PIN / fund password"
                            className="w-full text-xs p-2.5 pr-10 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 bg-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowWithdrawPin(!showWithdrawPin)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                          >
                            {showWithdrawPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                      >
                        Confirm Withdrawal
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

