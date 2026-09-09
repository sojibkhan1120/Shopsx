import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Users, UserPlus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLATFORM_TOPICS, PlatformInfoModal, InfoTopic } from './PlatformInfoModal';
import { LivePayoutTicker } from './LivePayoutTicker';

export const HomeView: React.FC = () => {
  const {
    language,
    t,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsTeamsModalOpen,
    setIsInviteModalOpen,
  } = useApp();

  const [selectedTopic, setSelectedTopic] = useState<InfoTopic | null>(null);

  const quickActions = [
    {
      id: 'recharge',
      label: 'Recharge',
      icon: (
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="30" height="30" rx="8" stroke="#2B2B2B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 22 L16 16 L20 19 L26 12" stroke="#E23A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => setIsDepositModalOpen(true),
    },
    {
      id: 'withdrawal',
      label: 'Withdrawal',
      icon: (
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="4" width="7" height="3" rx="1.5" fill="#E23A57" />
          <rect x="4" y="7" width="28" height="23" rx="7" stroke="#2B2B2B" strokeWidth="2.6" />
          <path d="M22 14.5 H28 C29.4 14.5 30.5 15.6 30.5 17 V20 C30.5 21.4 29.4 22.5 28 22.5 H22 C20.6 22.5 19.5 21.4 19.5 20 V17 C19.5 15.6 20.6 14.5 22 14.5 Z" stroke="#2B2B2B" strokeWidth="2.4" fill="white" />
          <circle cx="25" cy="18.5" r="1.5" fill="#2B2B2B" />
        </svg>
      ),
      onClick: () => setIsWithdrawModalOpen(true),
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: (
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 10 C26 10 27.8 11.6 27.8 13.8 C27.8 16 26 17.6 24 17.6" stroke="#E23A57" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M26 23.5 C28.5 24.6 30.5 26.8 30.5 29.5" stroke="#E23A57" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="15" cy="12" r="5" stroke="#2B2B2B" strokeWidth="2.6" />
          <path d="M6 29.5 C6 24.5 10 21.5 15 21.5 C20 21.5 24 24.5 24 29.5" stroke="#2B2B2B" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => setIsTeamsModalOpen(true),
    },
    {
      id: 'invitation',
      label: 'Invitation',
      icon: (
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="12" r="5" stroke="#2B2B2B" strokeWidth="2.6" />
          <path d="M7 29.5 C7 24.8 11 21.8 16 21.8 C21 21.8 25 24.8 25 29.5" stroke="#2B2B2B" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M26 12.5 H32" stroke="#E23A57" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M29 9.5 V15.5" stroke="#E23A57" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => setIsInviteModalOpen(true),
    },
  ];

  return (
    <div id="home-view-container" className="pb-20 pt-1">
      {/* 4 Quick Action Buttons matching screenshot */}
      <div className="grid grid-cols-4 gap-1 py-4 px-2 bg-white border-b border-neutral-100">
        {quickActions.map((action) => (
          <button
            key={action.id}
            id={`home-action-${action.id}`}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-1 bg-transparent hover:opacity-80 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              {action.icon}
            </div>
            <span className="text-[12.5px] font-normal text-neutral-700 tracking-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <div className="px-3">

      {/* Live Member Payout / Success Ticker */}
      <LivePayoutTicker />

      {/* Platform introduction Section */}
      <div className="mt-2">
        <h3 className="text-sm font-bold text-neutral-900 mb-2.5">
          <span>{t('platform_intro')}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {PLATFORM_TOPICS.map((topic) => (
            <div
              key={topic.id}
              id={`intro-card-${topic.id}`}
              onClick={() => setSelectedTopic(topic)}
              className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-98 flex flex-col"
            >
              <div className="h-28 w-full relative bg-neutral-100 overflow-hidden">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-white px-1.5 py-0.5 rounded">
                  {topic.tag}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 leading-tight">
                    {language === 'bn' ? topic.titleBn : topic.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? topic.summaryBn : topic.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Modal for topic details */}
      <PlatformInfoModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </div>
  );
};
