import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { maskWalletAddress } from '../utils/storage';

export const WalletManagementModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, bindWalletAddress, showToast } = useApp();
  const [walletName, setWalletName] = useState(user.walletName || '');
  const [address, setAddress] = useState(user.walletAddress || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isBound = Boolean(user.walletBound && user.walletAddress && user.walletAddress.length > 10);

  useEffect(() => {
    if (isOpen) {
      setWalletName(user.walletName || '');
      setAddress(user.walletAddress || '');
      setPassword('');
    }
  }, [isOpen, user.walletName, user.walletAddress]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBound) {
      showToast('Wallet address is securely locked and protected.');
      return;
    }

    const cleanAddr = address.trim();
    const cleanName = walletName.trim();
    const cleanPass = password.trim();

    if (!cleanAddr || cleanAddr.length < 15 || !cleanAddr.startsWith('T')) {
      showToast('Please enter a valid TRC-20 address (starts with T)');
      return;
    }

    if (!cleanPass) {
      showToast('Please enter a transaction password');
      return;
    }

    if (bindWalletAddress(cleanAddr, cleanName, cleanPass)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <button onClick={onClose} className="flex items-center space-x-1 text-neutral-800 cursor-pointer">
            <ArrowLeft size={18} />
            <span className="font-semibold text-xs">Wallet management</span>
          </button>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
            TRC-20
          </span>
        </div>

        {isBound ? (
          /* Locked Bound View for Users */
          <div className="py-4 space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start space-x-3">
              <ShieldCheck className="text-emerald-600 mt-0.5 shrink-0" size={20} />
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 text-xs flex items-center space-x-1.5">
                  <span>Wallet Address Bound & Locked</span>
                  <Lock size={12} className="text-emerald-600" />
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  For your account security, bound withdrawal wallets cannot be changed directly by user accounts.
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2.5">
              <div>
                <span className="text-[10.5px] text-neutral-400 block uppercase font-bold tracking-wider">Wallet Name</span>
                <span className="text-xs font-semibold text-neutral-800">{user.walletName || 'USDT TRC-20'}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10.5px] text-neutral-400 uppercase font-bold tracking-wider">TRC-20 Address</span>
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center space-x-1">
                    <Lock size={9} />
                    <span>Protected & Hidden</span>
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-100/90 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-400 font-medium tracking-widest select-none flex items-center justify-between">
                  <span>••••••••••••••••••••••••••••••••</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-sans font-medium">Bound & Active</span>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] text-neutral-400 text-center px-2">
              For account security and privacy, your bound withdrawal wallet address is hidden and cannot be viewed or modified.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-sm hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          /* Initial Binding Form */
          <form onSubmit={handleSave} className="py-4 space-y-3 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">Wallet Name</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. Binance, Trust Wallet, OKX"
                className="w-full border border-neutral-300 rounded-xl p-2.5 text-xs focus:border-rose-800 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">TRC-20 Wallet Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. TL5zkR87nZT2RHTDQa6kY2P4C59orFdCTe"
                className="w-full border border-neutral-300 rounded-xl p-2.5 text-xs font-mono focus:border-rose-800 outline-none resize-none"
                required
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Please double-check your TRON address. Fund transfers cannot be reversed.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-800">Transaction Password</label>
                <span className="text-[10px] text-neutral-400">Security PIN</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter transaction password"
                  className="w-full border border-neutral-300 rounded-xl p-2.5 pr-10 text-xs focus:border-rose-800 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                This password is required for approving all withdrawals.
              </p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-xl text-[11px] text-neutral-600 border border-neutral-100">
              Current Status:{' '}
              <span className="text-neutral-500">Not Bound</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white font-bold text-xs shadow-sm hover:opacity-95 cursor-pointer"
            >
              Save Wallet Details
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
