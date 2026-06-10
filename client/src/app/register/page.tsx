'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { sendWelcomeEmail } from '../../lib/email';
import { Heart, User, Mail, Phone, Lock, Send, Camera, AlertCircle } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
];

export default function Register() {
  const { registerUser } = useAuth();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName:            '',
    email:               '',
    password:            '',
    phone:               '',         // private — revealed after payment
    gender:              'MALE',
    dateOfBirth:         '',
    location:            'Addis Ababa',
    bio:                 '',
    profilePhotoUrl:     PRESET_AVATARS[0],
    relationshipPreference: 'RELATIONSHIP',
    telegramUsername:    '',         // private
    instagramUsername:   '',         // private
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError('Full name, email, phone and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerUser(form);
      await sendWelcomeEmail(form.email, form.fullName);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-lg p-8 rounded-3xl border border-white/10 glass-panel shadow-2xl">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Heart className="h-10 w-10 text-primary fill-primary mb-3" />
          <h2 className="text-3xl font-extrabold text-white">Create Profile</h2>
          <p className="mt-1 text-sm text-gray-400">Join Whaatachi — Ethiopia&rsquo;s dating platform</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Photo Upload
            </label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_AVATARS.map((url) => (
                <button key={url} type="button" onClick={() => set('profilePhotoUrl', url)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${form.profilePhotoUrl === url ? 'border-primary scale-105' : 'border-white/10 hover:border-white/30'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="avatar" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or paste a custom photo URL"
              value={form.profilePhotoUrl}
              onChange={e => set('profilePhotoUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Full Name + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input type="text" required value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="e.g. Sara Getnet"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all h-[42px]">
                <option value="MALE">Male 👨</option>
                <option value="FEMALE">Female 👩</option>
              </select>
            </div>
          </div>

          {/* Age + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Age (Optional)</label>
              <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Looking For</label>
              <select value={form.relationshipPreference} onChange={e => set('relationshipPreference', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all h-[42px]">
                <option value="RELATIONSHIP">❤️ Relationship</option>
                <option value="DATING">💕 Dating</option>
                <option value="FWB">🤝 FWB</option>
                <option value="CASUAL">🔥 Casual</option>
              </select>
            </div>
          </div>

          {/* Email + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>
          </div>

          {/* Private Contact Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              🔒 Private Contact Details{' '}
              <span className="font-normal normal-case tracking-normal text-gray-500">— only revealed after payment</span>
            </p>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+251912345678"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Telegram Username</label>
                <div className="relative">
                  <Send className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input type="text" value={form.telegramUsername} onChange={e => set('telegramUsername', e.target.value)}
                    placeholder="username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Instagram Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">📷</span>
                  <input type="text" value={form.instagramUsername} onChange={e => set('instagramUsername', e.target.value)}
                    placeholder="username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 font-bold text-white hover:opacity-95 shadow-lg transition-all cursor-pointer text-sm">
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
