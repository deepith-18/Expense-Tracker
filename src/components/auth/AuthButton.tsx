import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  RefreshCw,
  LogOut,
  Settings,
  ChevronDown,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { isFirebaseConfigured, loginWithGoogle, logOut } from '../../lib/firebase';

export const AuthButton: React.FC = () => {
  const {
    currentUser,
    syncStatus,
    syncErrorMessage,
    setAuthModalOpen,
    syncLocalToCloud,
    showToast,
  } = useExpenseStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setIsSigningIn(true);
      const { user, error } = await loginWithGoogle();
      if (error) {
        showToast(`Sign in error: ${error}`);
      } else if (user) {
        showToast(`Signed in as ${user.displayName || user.email}!`);
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Sign in failed';
      showToast(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await logOut();
    showToast('Signed out. Your transactions remain saved locally.');
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await syncLocalToCloud();
    setIsSyncing(false);
  };

  // Logged in UI
  if (currentUser) {
    const initials = (currentUser.displayName || currentUser.email || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-xs text-slate-200"
          title="Account & Cloud Sync Options"
        >
          {/* Avatar */}
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] ring-1 ring-emerald-500/30">
              {initials}
            </div>
          )}

          {/* Sync indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-medium truncate max-w-[90px]">
              {currentUser.displayName?.split(' ')[0] || 'Account'}
            </span>
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* User details */}
            <div className="p-2 border-b border-slate-800">
              <p className="font-semibold text-xs text-white truncate">
                {currentUser.displayName || 'Google User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser.email}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <Cloud className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {syncStatus === 'syncing'
                    ? 'Syncing with Firestore...'
                    : syncStatus === 'error'
                    ? `Sync error: ${syncErrorMessage || 'Check connection'}`
                    : 'Firestore Cloud Sync Active'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1 space-y-0.5">
              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <UploadCloud className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Local Data to Cloud'}</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Firestore Setup & Rules</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged out UI
  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      title={isFirebaseConfigured ? 'Sign in with Google to sync to Firestore' : 'Click to configure Firebase credentials'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all text-xs font-semibold active:scale-95 shadow-sm"
    >
      {/* Google "G" icon */}
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span className="hidden sm:inline">
        {isSigningIn ? 'Signing In...' : isFirebaseConfigured ? 'Sign in with Google' : 'Connect Firestore'}
      </span>
      <span className="sm:hidden font-medium">
        {isSigningIn ? '...' : 'Sign In'}
      </span>
      {!isFirebaseConfigured && (
        <span className="w-2 h-2 rounded-full bg-amber-400" title="Setup needed" />
      )}
    </button>
  );
};
