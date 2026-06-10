'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import API from '../../lib/api';
import { MapPin, Search, SlidersHorizontal, Heart } from 'lucide-react';

function BrowseFeed() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [gender, setGender]     = useState(searchParams.get('gender') || '');
  const [preference, setPref]   = useState(searchParams.get('preference') || '');
  const [location, setLocation] = useState('');
  const [fee, setFee]           = useState<number>(200);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (gender)     params.gender     = gender;
      if (preference) params.preference = preference;
      if (location)   params.location   = location;
      const res = await API.get('/profiles', { params });
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data && res.data.membershipFee) {
          setFee(res.data.membershipFee);
        }
      } catch (err) {
        console.error('Failed to load membership fee settings:', err);
      }
    };
    if (token) {
      fetchFee();
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gender, preference, location]);

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <Heart className="h-12 w-12 text-primary fill-primary animate-bounce mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to Browse</h2>
        <p className="text-gray-400 mb-6 max-w-xs">Create a free account to start browsing verified Ethiopian profiles.</p>
        <div className="flex gap-4">
          <Link href="/login"    className="px-6 py-2.5 rounded-full bg-primary font-bold text-sm text-white shadow-md hover:opacity-90">Log In</Link>
          <Link href="/register" className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 font-bold text-sm text-white hover:bg-white/10">Sign Up Free</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

      {/* ── Sidebar Filters ──────────────────────────────── */}
      <aside className="w-full lg:w-60 shrink-0 rounded-2xl border border-white/10 bg-dark-surface p-6 h-fit glass-panel">
        <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-white">Filters</h3>
        </div>

        {/* Gender pills */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Looking For</p>
          <div className="flex gap-2">
            {[{ label: '👩 Women', val: 'FEMALE' }, { label: '👨 Men', val: 'MALE' }, { label: 'All', val: '' }].map(g => (
              <button key={g.val} onClick={() => setGender(g.val)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${gender === g.val ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/25'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preference */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Intent</p>
          <select value={preference} onChange={e => setPref(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary h-9">
            <option value="">All</option>
            <option value="RELATIONSHIP">❤️ Relationship</option>
            <option value="DATING">💕 Dating</option>
            <option value="FWB">🤝 FWB</option>
            <option value="CASUAL">🔥 Casual</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Location</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input type="text" placeholder="City…" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary h-9" />
          </div>
        </div>
      </aside>

      {/* ── Profile Grid ─────────────────────────────────── */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Browse Profiles</h2>
          <span className="text-sm text-gray-400">{profiles.length} profiles found</span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(n => (
              <div key={n} className="rounded-2xl bg-dark-surface border border-white/5 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
            <Heart className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="font-bold text-gray-300">No profiles found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => {
              const age = p.dateOfBirth
                ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
                : null;
              const contactsVisible = !!(p.telegramUsername || p.user?.email);

              return (
                <div key={p.id} className="group rounded-2xl overflow-hidden border border-white/10 bg-dark-surface hover:border-primary/40 transition-all shadow-lg flex flex-col">

                  {/* Photo */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.profilePhotoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400`}
                      alt={p.fullName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Online badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Online
                    </div>

                    {/* Preference badge */}
                    <div className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {p.relationshipPreference}
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-bold text-lg leading-tight">
                        {p.fullName}{age ? `, ${age}` : ''}
                      </p>
                      <p className="text-gray-300 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{p.location}
                      </p>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-4">
                    <Link
                      href={`/profile/${p.id}`}
                      className={`block w-full text-center rounded-xl py-2.5 text-sm font-bold transition-all ${
                        !contactsVisible
                          ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md'
                          : 'bg-white/5 border border-white/10 text-gray-200 hover:bg-primary hover:border-primary hover:text-white'
                      }`}
                    >
                      {!contactsVisible ? `🔒 View Contact (${fee} ETB)` : '📞 View Contact'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-t-2 border-primary" /></div>}>
      <BrowseFeed />
    </Suspense>
  );
}
