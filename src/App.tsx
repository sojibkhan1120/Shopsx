import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { MenuView } from './components/MenuView';
import { RecordView } from './components/RecordView';
import { ServiceView } from './components/ServiceView';
import { MineView } from './components/MineView';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WalletManagementModal } from './components/WalletManagementModal';
import { TeamsModal } from './components/TeamsModal';
import { InviteModal } from './components/InviteModal';
import { LoginView } from './components/LoginView';
import { OrderGrabDetailView } from './components/OrderGrabDetailView';
import { AdminPanel } from './components/AdminPanel';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    isAdminRoute,
    isAdminOpen,
    isAdminAuthenticated,
    navigateToAdmin,
    isLoggedIn,
    activeTab,
    activeTaskTier,
    setActiveTaskTier,
    isDepositModalOpen,
    setIsDepositModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    isTeamsModalOpen,
    setIsTeamsModalOpen,
    isInviteModalOpen,
    setIsInviteModalOpen,
    toastMessage,
  } = useApp();

  // -------------------------------------------------------------
  // 1. DEDICATED ADMIN PORTAL ROUTE (#admin or ?admin or direct trigger)
  // -------------------------------------------------------------
  if (isAdminRoute || isAdminOpen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-900 selection:text-white">
        <AdminPanel />

        {/* Global Toast Alert */}
        {toastMessage && (() => {
          const isError =
            toastMessage.toLowerCase().includes('incorrect') ||
            toastMessage.toLowerCase().includes('error') ||
            toastMessage.toLowerCase().includes('failed') ||
            toastMessage.toLowerCase().includes('insufficient') ||
            toastMessage.toLowerCase().includes('invalid');
          return (
            <div
              id="app-toast-alert"
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-5 py-3 rounded-2xl ${
                isError
                  ? 'bg-red-950/95 text-red-100 border-red-500/80 shadow-red-950/50'
                  : 'bg-neutral-900/95 text-white border-neutral-700/80'
              } text-xs font-semibold shadow-2xl border flex items-center space-x-2.5 animate-in fade-in zoom-in-95 pointer-events-none max-w-[85vw] text-center justify-center`}
            >
              {isError ? (
                <AlertCircle size={17} className="text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage}</span>
            </div>
          );
        })()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. MEMBER LOGIN SCREEN (Isolated from Admin)
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-200 flex justify-center selection:bg-rose-900 selection:text-white">
        <div className="w-full max-w-md min-h-screen bg-[#85283c] shadow-2xl flex flex-col relative border-x border-neutral-300/40">
          <LoginView />

          {toastMessage && (() => {
            const isError =
              toastMessage.toLowerCase().includes('incorrect') ||
              toastMessage.toLowerCase().includes('error') ||
              toastMessage.toLowerCase().includes('failed') ||
              toastMessage.toLowerCase().includes('insufficient') ||
              toastMessage.toLowerCase().includes('invalid');
            return (
              <div
                id="app-toast-alert"
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-5 py-3 rounded-2xl ${
                  isError
                    ? 'bg-red-950/95 text-red-100 border-red-500/80 shadow-red-950/50'
                    : 'bg-neutral-900/95 text-white border-neutral-700/80'
                } text-xs font-semibold shadow-2xl border flex items-center space-x-2.5 animate-in fade-in zoom-in-95 pointer-events-none max-w-[85vw] text-center justify-center`}
              >
                {isError ? (
                  <AlertCircle size={17} className="text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                )}
                <span>{toastMessage}</span>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. REGULAR MEMBER STORE (Zero Admin traces for normal users)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-200 flex justify-center selection:bg-rose-900 selection:text-white">
      {/* Mobile viewport frame */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl flex flex-col relative border-x border-neutral-300/40">
        {/* Top App Header */}
        {activeTab !== 'mine' && !activeTaskTier && <Header />}

        {/* View Switcher */}
        <main className="flex-1 overflow-x-hidden">
          {activeTaskTier ? (
            <OrderGrabDetailView tier={activeTaskTier} onBack={() => setActiveTaskTier(null)} />
          ) : (
            <>
              {activeTab === 'home' && <HomeView />}
              {activeTab === 'service' && <ServiceView />}
              {activeTab === 'menu' && <MenuView />}
              {activeTab === 'record' && <RecordView />}
              {activeTab === 'mine' && <MineView />}
            </>
          )}
        </main>

        {/* Global Modals for Members */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />

        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
        />

        <WalletManagementModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />

        <TeamsModal
          isOpen={isTeamsModalOpen}
          onClose={() => setIsTeamsModalOpen(false)}
        />

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />

        {/* Toast Notification (Centered in screen) */}
        {toastMessage && (() => {
          const isError =
            toastMessage.toLowerCase().includes('incorrect') ||
            toastMessage.toLowerCase().includes('error') ||
            toastMessage.toLowerCase().includes('failed') ||
            toastMessage.toLowerCase().includes('insufficient') ||
            toastMessage.toLowerCase().includes('invalid');
          return (
            <div
              id="app-toast-alert"
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-5 py-3 rounded-2xl ${
                isError
                  ? 'bg-red-950/95 text-red-100 border-red-500/80 shadow-red-950/50'
                  : 'bg-neutral-900/95 text-white border-neutral-700/80'
              } text-xs font-semibold shadow-2xl border flex items-center space-x-2.5 animate-in fade-in zoom-in-95 pointer-events-none max-w-[85vw] text-center justify-center`}
            >
              {isError ? (
                <AlertCircle size={17} className="text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage}</span>
            </div>
          );
        })()}

        {/* Fixed Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
