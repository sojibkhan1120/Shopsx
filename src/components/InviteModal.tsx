import React, { useState } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InviteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, showToast, language } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const invitationCode = user.invitationCode || '604374';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${invitationCode}`
    : `https://platform.vip/?ref=${invitationCode}`;

  const isBengali = language === 'bn';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopiedCode(true);
      showToast(isBengali ? 'রেফার কোড কপি করা হয়েছে!' : 'Referral code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      showToast(isBengali ? 'কপি ব্যর্থ হয়েছে' : 'Copy failed');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast(isBengali ? 'রেফারেল লিঙ্ক কপি করা হয়েছে!' : 'Referral link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast(isBengali ? 'কপি ব্যর্থ হয়েছে' : 'Copy failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-neutral-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 bg-white">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 text-neutral-800 cursor-pointer hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">
              {isBengali ? 'আমন্ত্রণ কোড' : 'Invitation'}
            </span>
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Only Referral Code and Invitation Link */}
        <div className="p-5 space-y-4">
          {/* 1. Referral Code Box */}
          <div className="p-4 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 rounded-2xl border border-rose-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-600">
                {isBengali ? 'আমার রেফার কোড' : 'My Referral Code'}
              </span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-full">
                {isBengali ? 'অ্যাক্টিভ' : 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-neutral-200/80 mt-1">
              <span className="text-xl font-extrabold tracking-wider text-rose-900 font-mono">
                {invitationCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check size={13} className="text-emerald-300" />
                    <span>{isBengali ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>{isBengali ? 'কপি কোড' : 'Copy Code'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Referral Link Box */}
          <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">
                {isBengali ? 'ইনভাইট লিংক' : 'Invitation Link'}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-neutral-200">
              <span className="text-xs text-neutral-600 font-mono truncate flex-1 select-all">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check size={13} className="text-emerald-300" />
                    <span>{isBengali ? 'কপি' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>{isBengali ? 'কপি' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {isBengali ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
