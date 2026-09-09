import React, { useState } from 'react';
import { ArrowLeft, Users, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TeamsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { teamMembers } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<'all' | 1 | 2 | 3>('all');

  if (!isOpen) return null;

  const totalRecharge = teamMembers.reduce((sum, m) => sum + (m.rechargeAmount || 0), 0);
  const totalWithdrawal = teamMembers.reduce((sum, m) => sum + (m.withdrawalAmount || 0), 0);
  const totalCommission = teamMembers.reduce(
    (sum, m) =>
      sum +
      (typeof m.commissionContribution === 'number' && m.commissionContribution > 0
        ? m.commissionContribution
        : (m.rechargeAmount || 0) * 0.1),
    0
  );

  // Level member counts
  const lv1Members = teamMembers.filter((m) => (m.level || 1) === 1);
  const lv2Members = teamMembers.filter((m) => m.level === 2);
  const lv3Members = teamMembers.filter((m) => m.level === 3);

  const filteredMembers = teamMembers.filter((member) => {
    // Filter by Level (1st, 2nd, or 3rd Referral)
    if (selectedLevel !== 'all' && (member.level || 1) !== selectedLevel) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 flex flex-col">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <button onClick={onClose} className="flex items-center space-x-1 text-neutral-800 cursor-pointer">
            <ArrowLeft size={18} />
            <span className="font-bold text-xs">My Referral Team</span>
          </button>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            {teamMembers.length} Accounts
          </span>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {/* Statistical Summary - 4 Options */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] font-bold text-red-600 block">Total Referrals</span>
              <span className="text-sm font-bold text-neutral-900">{teamMembers.length}</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">Accounts</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] font-bold text-red-600 block">Team Deposit</span>
              <span className="text-sm font-bold text-neutral-900">{totalRecharge.toFixed(0)}</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">USDT</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] font-bold text-red-600 block">Team Withdrawal</span>
              <span className="text-sm font-bold text-neutral-900">{totalWithdrawal.toFixed(0)}</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">USDT</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] font-bold text-red-600 block">Team Commission</span>
              <span className="text-sm font-bold text-neutral-900">
                {totalCommission.toFixed(totalCommission % 1 === 0 ? 0 : 2)}
              </span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">USDT</span>
            </div>
          </div>

          {/* Action Row: 3-Tier Referral Selection */}
          <div className="pt-2 border-t border-neutral-100">
            {/* 3 Referral Tier Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* 1st Referral Option */}
              <button
                type="button"
                onClick={() => setSelectedLevel(selectedLevel === 1 ? 'all' : 1)}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  selectedLevel === 1
                    ? 'bg-rose-900 text-white border-rose-900 shadow-xs ring-2 ring-rose-900/20'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70'
                }`}
              >
                <span className="block text-[11px] font-bold">1st Referral</span>
                <span className={`block text-[9px] ${selectedLevel === 1 ? 'text-rose-200' : 'text-neutral-400'}`}>
                  Direct Link
                </span>
                <span
                  className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedLevel === 1 ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {lv1Members.length} Users
                </span>
              </button>

              {/* 2nd Referral Option */}
              <button
                type="button"
                onClick={() => setSelectedLevel(selectedLevel === 2 ? 'all' : 2)}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  selectedLevel === 2
                    ? 'bg-rose-900 text-white border-rose-900 shadow-xs ring-2 ring-rose-900/20'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70'
                }`}
              >
                <span className="block text-[11px] font-bold">2nd Referral</span>
                <span className={`block text-[9px] ${selectedLevel === 2 ? 'text-rose-200' : 'text-neutral-400'}`}>
                  From 1st Link
                </span>
                <span
                  className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedLevel === 2 ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {lv2Members.length} Users
                </span>
              </button>

              {/* 3rd Referral Option */}
              <button
                type="button"
                onClick={() => setSelectedLevel(selectedLevel === 3 ? 'all' : 3)}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  selectedLevel === 3
                    ? 'bg-rose-900 text-white border-rose-900 shadow-xs ring-2 ring-rose-900/20'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70'
                }`}
              >
                <span className="block text-[11px] font-bold">3rd Referral</span>
                <span className={`block text-[9px] ${selectedLevel === 3 ? 'text-rose-200' : 'text-neutral-400'}`}>
                  From 2nd Link
                </span>
                <span
                  className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedLevel === 3 ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {lv3Members.length} Users
                </span>
              </button>
            </div>
          </div>

          {/* Referred Accounts List */}
          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
            {filteredMembers.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <Users size={24} className="mx-auto mb-1 text-neutral-300" />
                <p className="text-xs font-semibold text-neutral-700">
                  {selectedLevel === 'all'
                    ? 'No referral accounts found'
                    : selectedLevel === 1
                    ? 'No 1st Referral accounts found'
                    : selectedLevel === 2
                    ? 'No 2nd Referral accounts found'
                    : 'No 3rd Referral accounts found'}
                </p>
                <p className="text-[10px] mt-1 text-neutral-400 max-w-[240px] mx-auto leading-relaxed">
                  {selectedLevel === 1
                    ? 'Users who register directly with your referral link will appear in 1st Referral.'
                    : selectedLevel === 2
                    ? 'Users who register from your 1st referrals’ links will appear in 2nd Referral.'
                    : 'Users who register from your 2nd referrals’ links will appear in 3rd Referral.'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-3 bg-white border border-neutral-100 rounded-xl flex items-center justify-between shadow-2xs hover:border-neutral-200 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    {/* User Avatar Circle */}
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                      {member.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-neutral-800 text-xs">{member.username}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            (member.level || 1) === 1
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : member.level === 2
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {(member.level || 1) === 1
                            ? '1st Ref'
                            : member.level === 2
                            ? '2nd Ref'
                            : '3rd Ref'}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {member.phone || 'Phone verified'}
                      </span>
                      <span className="text-[9px] text-neutral-500 block">
                        {(member.level || 1) === 1
                          ? 'Source: Direct Referral Link'
                          : member.level === 2
                          ? `Invited by: ${member.referredBy || '1st Referral'}`
                          : `Invited by: ${member.referredBy || '2nd Referral'}`}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">
                        Joined: {member.joinDate.substring(0, 16)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {member.rechargeAmount > 0 ? (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={9} className="mr-0.5" />
                          Recharged
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500">
                          Registered
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-neutral-800 block mt-0.5">
                      Deposit: {member.rechargeAmount.toFixed(0)} USDT
                    </span>
                    <span className="text-[10px] font-semibold text-rose-700 block">
                      Withdraw: {(member.withdrawalAmount || 0).toFixed(0)} USDT
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-xs cursor-pointer hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
