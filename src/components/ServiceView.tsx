import React, { useState } from 'react';
import { ChevronRight, Send, ExternalLink, X } from 'lucide-react';
import agentIllustration from '../assets/images/customer_service_agent_1788591282432.jpg';

export const ServiceView: React.FC = () => {
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const telegramUrl = 'https://t.me/Userservies0138';

  return (
    <div id="service-view-container" className="pb-24 bg-[#f6f7f9] min-h-full">
      {/* Top Section with Soft Pinkish Banner matching screenshot */}
      <div className="bg-[#fceef0] pt-7 pb-4 px-4 text-center">
        <h1 className="text-xl font-medium text-[#3a3230] tracking-tight mb-3">
          Customer Service Center
        </h1>

        {/* Customer Service Representative Illustration matching screenshot */}
        <div className="flex justify-center items-center max-w-[330px] mx-auto overflow-hidden">
          <img
            src={agentIllustration}
            alt="Customer Service Representative"
            className="w-full max-h-56 object-contain rounded-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Menu Options matching screenshot */}
      <div className="p-4 space-y-3">
        <button
          id="btn-online-customer-service"
          onClick={() => setIsTelegramModalOpen(true)}
          className="w-full bg-white rounded-xl py-4 px-4 shadow-xs flex items-center justify-between border border-neutral-100 hover:bg-neutral-50/60 transition-all text-left active:scale-99"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-[13.5px] font-medium text-neutral-800">
              Online customer service
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
              Telegram
            </span>
            <ChevronRight size={19} className="text-neutral-400 stroke-[2]" />
          </div>
        </button>

        <button
          id="btn-service-help"
          onClick={() => setIsHelpOpen(true)}
          className="w-full bg-white rounded-xl py-4 px-4 shadow-xs flex items-center justify-between border border-neutral-100 hover:bg-neutral-50/60 transition-all text-left active:scale-99"
        >
          <span className="text-[13.5px] font-medium text-neutral-800">
            Help
          </span>
          <ChevronRight size={19} className="text-neutral-500 stroke-[2]" />
        </button>
      </div>

      {/* Telegram Support Modal */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-100 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-xs">
                  <Send size={15} className="ml-0.5 -mt-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-none">
                    Telegram Support
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span>Online 24/7</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTelegramModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 text-center space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Connect directly with our official customer service representative on Telegram for instant assistance:
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-sky-500/20"
                >
                  <Send size={15} />
                  <span>Start Chat on Telegram</span>
                  <ExternalLink size={13} className="opacity-80" />
                </a>

                <button
                  onClick={() => setIsTelegramModalOpen(false)}
                  className="w-full py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-neutral-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Help Center & FAQs</h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-3 text-xs space-y-3 text-neutral-600 leading-relaxed">
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <h5 className="font-bold text-neutral-900 mb-1">1. How do I recharge USDT?</h5>
                <p>Go to Home &gt; Recharge, select TRC-20 protocol, and send your payment to the generated TRON address. Allow 1-2 minutes for blockchain confirmations.</p>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <h5 className="font-bold text-neutral-900 mb-1">2. How do I withdraw funds?</h5>
                <p>Click "Withdrawal", bind your TRC-20 e-wallet, input the desired amount (min 5 USDT), and submit your request. 1.0 USDT network fee applies.</p>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <h5 className="font-bold text-neutral-900 mb-1">3. Company Rule</h5>
                <div className="space-y-1 text-neutral-700">
                  <p>• <strong>Network Protocol:</strong> Only TRON (TRC-20) network is supported for all deposits and withdrawals.</p>
                  <p>• <strong>Task Matching:</strong> Orders are dispatched according to your active VIP level. Tasks must be completed to unlock commission earnings.</p>
                  <p>• <strong>Withdrawal Policy:</strong> Withdrawals are processed within 10–30 minutes. Fixed network handling fee is 1.0 USDT per transaction.</p>
                  <p>• <strong>Account Security:</strong> One verified account per user. Any malicious or duplicate accounts are strictly prohibited.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

