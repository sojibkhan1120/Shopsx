import React, { useState, useRef } from 'react';
import { UserAvatar } from './UserAvatar';
import { ProfileAvatarModal } from './ProfileAvatarModal';
import { useApp } from '../context/AppContext';
import { COUNTRY_LANGUAGES } from '../data/languages';
import { LanguageSelectModal } from './LanguageSelectModal';
import { maskWalletAddress } from '../utils/storage';
import {
  Copy,
  Settings,
  ChevronRight,
  MessageCircle,
  Contact,
  ClipboardList,
  Layers,
  LogOut,
  Camera,
  Flame,
  Sparkles,
} from 'lucide-react';

export const MineView: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsTeamsModalOpen,
    setIsInviteModalOpen,
    setIsWalletModalOpen,
    setActiveTab,
    showToast,
    deposits,
    withdrawals,
    logout,
  } = useApp();

  const [isDepositRecordsOpen, setIsDepositRecordsOpen] = useState(false);
  const [isWithdrawalRecordsOpen, setIsWithdrawalRecordsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const copyInviteCode = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(user.invitationCode).catch(() => {});
      }
    } catch {}
    showToast('Invitation code copied to clipboard!');
  };

  return (
    <div id="mine-view-container" className="pb-24 bg-[#f7f8fa] min-h-screen">
      {/* Burgundy gradient header matching user's screenshot */}
      <div className="bg-gradient-to-b from-[#6e1e32] via-[#521725] to-[#3a101b] text-white p-4 pt-4 pb-7 relative shadow-sm">
        {/* Top Chat Icon on right matching screenshot */}
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setActiveTab('service')}
            className="text-white/90 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            title="Customer Support"
          >
            <MessageCircle size={22} strokeWidth={1.8} />
          </button>
        </div>

        {/* User Info Bar matching screenshot */}
        <div className="flex items-center space-x-3.5">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="w-16 h-16 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0 cursor-pointer relative group overflow-hidden border border-white/20 hover:scale-105 active:scale-95 transition-all"
            title="Change Profile Picture"
          >
            <UserAvatar avatar={user.avatar} size={54} />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white drop-shadow" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xl text-white tracking-tight">{user.username}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-black bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 uppercase tracking-wider shadow-2xs">
                VIP {user.vipLevel}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-rose-200/90 mt-1 font-normal">
              <span>Invitation code: {user.invitationCode}</span>
              <button
                onClick={copyInviteCode}
                className="p-0.5 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* My Account Section with White Action Buttons matching screenshot */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/90 font-medium">My Account</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xs font-medium text-rose-200/80">USDT</span>
              <span className="text-2xl font-semibold text-white tracking-normal font-sans">
                {user.balance ?? 0}
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* Deposit button matching screenshot */}
            <button
              id="mine-deposit-btn"
              onClick={() => setIsDepositModalOpen(true)}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-black/25 mb-1 group-hover:bg-neutral-50 transition-colors">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7H4C2.89543 7 2 7.89543 2 9V17C2 18.1046 2.89543 19 4 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7Z" fill="#1C61C4" />
                  <path d="M16 10.5H21V15.5H16C14.6193 15.5 13.5 14.3807 13.5 13C13.5 11.6193 14.6193 10.5 16 10.5Z" fill="white" />
                  <circle cx="17.5" cy="13" r="1.2" fill="#1C61C4" />
                  <path d="M5 7V5C5 3.89543 5.89543 3 7 3H16" stroke="#1C61C4" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[11.5px] font-normal text-white">Deposit</span>
            </button>

            {/* Withdrawal button matching screenshot */}
            <button
              id="mine-withdraw-btn"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-black/25 mb-1 group-hover:bg-neutral-50 transition-colors">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="5" width="20" height="14" rx="3.5" fill="#1C61C4" />
                  <path d="M2 9H22" stroke="white" strokeWidth="2" />
                  <rect x="5" y="13.5" width="4.5" height="2.2" rx="0.5" fill="white" />
                </svg>
              </div>
              <span className="text-[11.5px] font-normal text-white">Withdrawal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Action Icons matching screenshot */}
      <div className="bg-white py-4 px-2 border-b border-neutral-100 shadow-2xs">
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setIsTeamsModalOpen(true)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="9" r="4.5" fill="#F59E0B" />
                <path d="M3 21 C3 16.5 7 15 12 15 C17 15 21 16.5 21 21" fill="#F59E0B" />
                <circle cx="20" cy="9.5" r="3.5" fill="#FDBA74" />
                <path d="M19 16 C22 16.5 25 18 25 21" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[12px] font-normal text-neutral-700">Teams</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className="flex flex-col items-center hover:opacity-80 transition-opacity active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="3" width="18" height="22" rx="3.5" fill="#34D399" />
                <path d="M9 8 H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 12 H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16 H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[12px] font-normal text-neutral-700">Record</span>
          </button>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="12" fill="#E11D48" />
                <path d="M8 15 L12 11 L15 14 L20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] font-normal text-neutral-700 text-center leading-tight">
              Wallet management
            </span>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="22" height="16" rx="4" fill="#3B82F6" />
                <path d="M4 10 L15 17 L26 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <rect x="9" y="4" width="12" height="6" rx="1.5" fill="#93C5FD" />
              </svg>
            </div>
            <span className="text-[12px] font-normal text-neutral-700">Invite friends</span>
          </button>
        </div>
      </div>

      {/* Profile Menu List matching screenshot */}
      <div className="bg-white mt-4 border-t border-b border-neutral-100 divide-y divide-neutral-100">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <Contact size={20} className="text-neutral-500 stroke-[1.8]" />
            <span className="text-[13.5px] font-normal text-neutral-800">Profile</span>
          </div>
          <ChevronRight size={18} className="text-neutral-400 stroke-[1.8]" />
        </button>

        <button
          onClick={() => setIsDepositRecordsOpen(true)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <ClipboardList size={20} className="text-neutral-500 stroke-[1.8]" />
            <span className="text-[13.5px] font-normal text-neutral-800">Deposit records</span>
          </div>
          <ChevronRight size={18} className="text-neutral-400 stroke-[1.8]" />
        </button>

        <button
          onClick={() => setIsWithdrawalRecordsOpen(true)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <Layers size={20} className="text-neutral-500 stroke-[1.8]" />
            <span className="text-[13.5px] font-normal text-neutral-800">Withdrawal records</span>
          </div>
          <ChevronRight size={18} className="text-neutral-400 stroke-[1.8]" />
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <Settings size={20} className="text-neutral-500 stroke-[1.8]" />
            <span className="text-[13.5px] font-normal text-neutral-800">Setting</span>
          </div>
          <ChevronRight size={18} className="text-neutral-400 stroke-[1.8]" />
        </button>
      </div>



      {/* Profile Details Modal with Photo Upload System */}
      <ProfileAvatarModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Deposit Records Modal */}
      {isDepositRecordsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Deposit Records</h3>
              <button onClick={() => setIsDepositRecordsOpen(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">✕</button>
            </div>
            <div className="py-3 flex-1 overflow-y-auto space-y-2.5 text-xs">
              {deposits
                .filter((d) => d.username && d.username.toLowerCase() === (user.username || '').toLowerCase())
                .length === 0 ? (
                <div className="text-center text-neutral-400 py-10 space-y-1">
                  <p className="font-medium">No deposit records yet</p>
                  <p className="text-[11px] text-neutral-300">Submit a deposit from the Recharge menu</p>
                </div>
              ) : (
                deposits
                  .filter((d) => d.username && d.username.toLowerCase() === (user.username || '').toLowerCase())
                  .map((d) => {
                    const isApproved = d.status === 'completed' || d.status === 'approved';
                    const isPending = d.status === 'pending';
                    return (
                      <div key={d.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-neutral-800 font-bold">{d.currency} ({d.network || 'TRC-20'})</span>
                          <span className="text-emerald-600 font-black text-sm">+{d.amount.toFixed(2)} USDT</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">Address: {d.address}</p>
                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-neutral-200/60">
                          <span className="text-neutral-400">{d.createdAt}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                : 'bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                          >
                            {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                          </span>
                        </div>
                        {isApproved && d.approvedAt && (
                          <div className="text-[9px] text-emerald-600 font-medium">
                            Credited: {d.approvedAt}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
            <button
              onClick={() => setIsDepositRecordsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Records Modal */}
      {isWithdrawalRecordsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Withdrawal Records</h3>
              <button onClick={() => setIsWithdrawalRecordsOpen(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">✕</button>
            </div>
            <div className="py-3 flex-1 overflow-y-auto space-y-2.5 text-xs">
              {withdrawals
                .filter((w) => w.username && w.username.toLowerCase() === (user.username || '').toLowerCase())
                .length === 0 ? (
                <div className="text-center text-neutral-400 py-10 space-y-1">
                  <p className="font-medium">No withdrawal records yet</p>
                  <p className="text-[11px] text-neutral-300">Submit a withdrawal request to track status</p>
                </div>
              ) : (
                withdrawals
                  .filter((w) => w.username && w.username.toLowerCase() === (user.username || '').toLowerCase())
                  .map((w) => {
                    const isApproved = w.status === 'approved' || w.status === 'completed';
                    const isPending = w.status === 'pending';
                    return (
                      <div key={w.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-neutral-800 font-bold">TRON ({w.network || 'TRC-20'})</span>
                          <span className="text-rose-600 font-black text-sm">-{w.amount.toFixed(2)} USDT</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono truncate select-none">To: {w.walletName || 'USDT TRC-20'} (••••••••••••••••)</p>
                        <div className="flex justify-between items-center text-[10px] text-neutral-500">
                          <span>Net: ${(w.actualAmount || w.amount - 1).toFixed(2)} (Fee: ${w.fee.toFixed(2)})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                : 'bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                          >
                            {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-200/60">
                          <span>Submitted: {w.createdAt}</span>
                          {isApproved && (
                            <span className="text-emerald-600 font-medium">Released</span>
                          )}
                          {w.status === 'rejected' && (
                            <span className="text-rose-600 font-medium">Refunded to balance</span>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            <button
              onClick={() => setIsWithdrawalRecordsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (including demo testing options) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-neutral-400">✕</button>
            </div>

            <div className="py-3 text-xs space-y-3">
              {/* Language selection */}
              <div>
                {(() => {
                  const currentCountryLang =
                    COUNTRY_LANGUAGES.find((c) => c.code === language) ||
                    COUNTRY_LANGUAGES.find((c) => c.code === 'en') ||
                    COUNTRY_LANGUAGES[0];
                  return (
                    <button
                      onClick={() => setIsLangModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl leading-none">{currentCountryLang.flag}</span>
                        <div className="text-left">
                          <span className="font-bold text-neutral-900 block leading-tight">
                            {currentCountryLang.nativeName} ({currentCountryLang.country})
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {currentCountryLang.name} • {currentCountryLang.countryCode}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-md">
                        Change
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Logout Option */}
              <div>
                {showLogoutConfirm ? (
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl text-center space-y-2.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                      <LogOut size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">Log out of account?</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Are you sure you want to sign out of <strong className="text-neutral-800">{user.username}</strong>?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        className="py-2 px-3 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          setIsSettingsOpen(false);
                          logout();
                        }}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white font-bold text-xs hover:opacity-95 shadow-xs cursor-pointer transition-opacity"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold border border-rose-200/80 bg-rose-50/40 hover:bg-rose-100/60 flex items-center justify-between transition-colors cursor-pointer text-rose-900"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <LogOut size={16} />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-neutral-900 block leading-tight">
                          Log Out
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Sign out of account ({user.username})
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md">
                      Log Out
                    </span>
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}
      {/* Language Select Modal */}
      <LanguageSelectModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </div>
  );
};
