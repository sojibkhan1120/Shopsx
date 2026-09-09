import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPOSIT_ADDRESSES, getNextDepositAddress, getCurrentDepositAddress } from '../data/depositAddresses';

export const DepositModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, showToast, recordPendingDeposit } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>(DEPOSIT_ADDRESSES[0]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { address } = getCurrentDepositAddress();
      setCurrentAddress(address);
      setHasSubmitted(false);
      setStep(1);
      setDepositAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickAmounts = ['10', '50', '100', '300', '500', '1000'];

  const handleDepositNow = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val < 0.1) {
      showToast('Deposit amount must be greater than 0.1 USDT');
      return;
    }
    // Advance to next address in the 5-address rotation pool
    const { address } = getNextDepositAddress();
    setCurrentAddress(address);
    setStep(2);

    const effectiveSender = user?.walletAddress || user?.withdrawalAddress || '';
    // ONLY record as pending deposit — balance is NOT added until Admin approves in Admin Panel
    recordPendingDeposit(val, address, undefined, effectiveSender || undefined, user?.walletName, true);
    setHasSubmitted(true);
  };

  const copyAddress = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(currentAddress).catch(() => {});
      }
    } catch {}
    showToast('TRC-20 address copied to clipboard!');
  };

  return (
    <div
      id="deposit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-100 flex flex-col">
        {/* Header matching video */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <button
            onClick={() => {
              if (step === 2) setStep(1);
              else onClose();
            }}
            className="flex items-center space-x-1 text-neutral-800 hover:text-neutral-950"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Deposit</span>
          </button>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            TRON (TRC-20)
          </span>
        </div>

        {step === 1 ? (
          /* Step 1 matching video at 00:08 - 00:12 */
          <div className="p-4 space-y-4 text-xs">
            {/* Payment method */}
            <div>
              <label className="font-bold text-neutral-800 block mb-2">Payment method</label>
              <div className="inline-block relative">
                <div className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border-2 border-rose-800 bg-rose-50/40 text-neutral-900 font-semibold cursor-pointer">
                  {/* Tether Tether USDT logo */}
                  <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">
                    ₮
                  </div>
                  <span>USDT</span>
                </div>
                {/* Red corner ribbon */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-rose-800 clip-triangle rounded-tr-lg"></div>
              </div>
            </div>

            {/* Protocol */}
            <div>
              <label className="font-bold text-neutral-800 block mb-2">Select the protocol to use</label>
              <div className="inline-block relative">
                <div className="px-3.5 py-2 rounded-lg border-2 border-rose-800 bg-rose-50/40 text-neutral-900 font-bold">
                  TRC-20
                </div>
              </div>
            </div>

            {/* Currency selection */}
            <div>
              <label className="font-bold text-neutral-800 block mb-2">Currency selection</label>
              <div className="inline-block relative">
                <div className="px-3.5 py-2 rounded-lg border-2 border-rose-800 bg-rose-50/40 text-neutral-900 font-bold">
                  ALL
                </div>
              </div>
            </div>

            {/* Deposit amount input */}
            <div>
              <label className="font-bold text-neutral-800 block mb-1.5">Deposit amount</label>
              <div className="flex items-center border border-neutral-300 rounded-xl px-3 py-2.5 focus-within:border-rose-800 bg-white">
                <span className="font-bold text-neutral-600 mr-2">USDT</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-sm font-bold text-neutral-900 outline-none"
                  min="0.1"
                  step="1"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Deposit amount must be greater than 0.1USDT
              </p>

              {/* Quick Select Chips */}
              <div className="grid grid-cols-6 gap-1.5 mt-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                      depositAmount === amt
                        ? 'bg-rose-800 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-neutral-50 p-3 rounded-xl space-y-1 text-neutral-500 border border-neutral-100">
              <div className="flex justify-between font-semibold text-neutral-800">
                <span>Estimated payment:</span>
                <span className="text-rose-800 font-bold">{depositAmount ? `${depositAmount} USDT` : '0.00 USDT'}</span>
              </div>
              <p className="text-[10px]">Reference rate: 1 USDT = 1 USDT</p>
              <p className="text-[10px] text-neutral-400 leading-tight pt-1">
                The payment amount and exchange rate are subject to the actual payment.
              </p>
            </div>

            {/* Submit button */}
            <button
              id="btn-deposit-now"
              onClick={handleDepositNow}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
            >
              Deposit now
            </button>
          </div>
        ) : (
          /* Step 2 matching video at 00:15 - 00:18 */
          <div className="p-4 space-y-3.5 text-xs text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {depositAmount}
            </h2>
            <p className="text-xs font-semibold text-neutral-600">
              Network - <span className="text-rose-800">TRON(TRC-20)</span>
            </p>

            <div className="text-left text-neutral-500 text-[11px]">
              <span>One Time Address:</span>
            </div>

            {/* Dynamic QR Code */}
            <div className="flex justify-center p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs max-w-[200px] mx-auto">
              <QRCodeSVG
                value={currentAddress}
                size={170}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Address bar with copy button matching video */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 border border-neutral-200">
              <span className="font-mono text-[11px] text-neutral-800 truncate select-all pr-2">
                {currentAddress}
              </span>
              <button
                onClick={copyAddress}
                className="p-1.5 bg-white rounded-lg shadow-xs text-neutral-700 hover:text-neutral-900 shrink-0"
                title="Copy Address"
              >
                <Copy size={15} />
              </button>
            </div>

            {/* Waiting for payment indicator matching video */}
            <div className="py-2 flex items-center justify-center space-x-2 text-rose-800 font-bold text-xs">
              <div className="w-2 h-2 rounded-full bg-rose-800 animate-ping"></div>
              <span>Waiting for network confirmation...</span>
            </div>

            {/* Tips matching exact text from video at 00:16 */}
            <div className="text-left bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 leading-relaxed space-y-1.5">
              <p className="font-bold text-neutral-800">Tips:</p>
              <p>
                1. The recharge address is a <strong className="text-rose-800">one-time address</strong>, please do not leave it or transfer it repeatedly.
              </p>
              <p>
                2. The minimum recharge amount is subject to the actual transfer amount, not less than{' '}
                <strong className="text-rose-800">10 USDT</strong>.
              </p>
              <p>
                3. After recharging, it will take about <strong className="text-rose-800">1 to 2 minutes</strong> to confirm the payment. Please wait patiently.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
