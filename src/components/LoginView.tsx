import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PolygonLogo } from './PolygonLogo';
import { safeStorage } from '../utils/storage';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Gift,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LanguageSelectModal } from './LanguageSelectModal';

export const LoginView: React.FC = () => {
  const {
    login,
    registerUserAccount,
    validateInvitationCode,
    navigateToAdmin,
    adminLogin,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form states
  const [loginUsername, setLoginUsername] = useState(() => {
    return safeStorage.getItem('mall_usdt_active_username') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration form states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('604374');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Live invitation code validation feedback
  const inviteCodeStatus = regInviteCode.trim()
    ? validateInvitationCode(regInviteCode.trim())
    : { valid: false };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your account username.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    if (cleanUser.toLowerCase() === 'admin') {
      const ok = adminLogin(cleanUser, cleanPass);
      if (ok) {
        navigateToAdmin();
        return;
      } else {
        setErrorMessage('Invalid username or password.');
        return;
      }
    }

    const result = await login(cleanUser, cleanPass);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = regUsername.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();
    const cleanInvite = regInviteCode.trim();

    if (!cleanUser || cleanUser.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      setErrorMessage('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMessage('Passwords do not match! Please re-type correctly.');
      return;
    }

    // Referral code check (defaults to 604374 if left blank)
    const finalInvite = cleanInvite || '604374';
    const valResult = validateInvitationCode(finalInvite);
    if (!valResult.valid) {
      setErrorMessage(`Invalid invitation code "${finalInvite}". Please check and try again.`);
      return;
    }

    const res = await registerUserAccount(cleanUser, cleanPass, finalInvite);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#85283c] via-[#6e1c2d] to-[#501320] flex flex-col justify-between p-4 py-6 animate-in fade-in">
      {/* Top Header with Logo and Language Selector */}
      <div className="flex items-center justify-between max-w-sm w-full mx-auto">
        <div className="flex items-center space-x-2">
          <div
            className="p-1 rounded-full bg-white/10 backdrop-blur-xs select-none"
            title="Polygon"
          >
            <PolygonLogo size={32} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLangModalOpen(true)}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xs hover:bg-white/30 cursor-pointer transition-all active:scale-95"
          title="Select Language"
        >
          <Globe size={18} strokeWidth={1.9} />
        </button>
      </div>

      {/* Main Form Card */}
      <div className="my-auto w-full max-w-sm mx-auto py-2">
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs text-neutral-500">
              {activeTab === 'login'
                ? 'Sign in to access your commission tasks & balance'
                : 'Registration requires a verified invitation code'}
            </p>
          </div>

          {/* Tab Switcher (Sign In / Register) */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-700 text-xs animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <div className="font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Username / Account
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter registered username"
                    className="w-full text-xs font-medium pl-9 pr-3 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Login Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs font-medium pl-9 pr-10 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#85283c] to-[#5d1726] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <LogIn size={15} />
                <span>Sign In Securely</span>
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Choose Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Min 3 letters / numbers"
                    className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Password (Min 6 chars)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create your login password"
                    className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Invitation Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 block">
                  Invitation Code
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Gift size={16} />
                  </div>
                  <input
                    type="text"
                    value={regInviteCode}
                    onChange={(e) => setRegInviteCode(e.target.value.toUpperCase())}
                    placeholder="Invitation code (e.g. 604374)"
                    className="w-full text-xs font-mono font-bold pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-700 focus:ring-1 focus:ring-rose-700 bg-white"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 bg-gradient-to-r from-[#85283c] to-[#5d1726] hover:opacity-95"
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </form>
          )}
        </div>
      </div>



      {/* Language Select Modal */}
      <LanguageSelectModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </div>
  );
};
