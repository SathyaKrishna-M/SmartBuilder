"use client";

import { useAuth } from './auth-provider';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
      >
        <User className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Email */}
      <div className="text-xs text-gray-400 dark:text-gray-400 truncate max-w-[120px]">
        {user.email}
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        disabled={isLoggingOut}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background-cardDark dark:bg-background-cardDark border border-border-dark dark:border-border-dark hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] text-gray-300 dark:text-gray-300 rounded-xl transition-all duration-300 disabled:opacity-50"
        title="Sign out"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </motion.button>
    </div>
  );
}

