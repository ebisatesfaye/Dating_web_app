'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/browse');
    }
  }, [user, authLoading, router]);

  // Show spinner while auth context is initialising
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      // AuthContext.login redirects to /browse on success
    } catch (err: any) {
      console.error('[Login Error]', err);
      if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } else {
        setError(err?.response?.data?.error || 'Invalid email or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 glass-panel shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <Heart className="h-10 w-10 text-primary fill-primary animate-pulse mb-3" />
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400">Log in to view active connections and matches.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-bold text-white hover:opacity-95 shadow-lg transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick test credentials */}
        <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-400 mb-1">Test accounts:</p>
          <p>Admin: <span className="text-gray-300">admin@whaatachi.com</span> / <span className="text-gray-300">AdminPassword123!</span></p>
          <p>User: <span className="text-gray-300">jeru@whaatachi.com</span> / <span className="text-gray-300">Password123!</span></p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          New to Whaatachi?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
