'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { sendWelcomeEmail } from '../../lib/email';
import API from '../../lib/api';
import {
  Heart, User, Mail, Phone, Lock, Send, Camera,
  AlertCircle, CheckCircle, ChevronRight, ChevronLeft
} from 'lucide-react';

const InstagramSVG = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookSVG = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsAppSVG = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const TikTokSVG = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.25 8.25 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
  </svg>
);

type Step = 1 | 2 | 3;

export default function Register() {
  const { registerUser } = useAuth();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<Step>(1);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName:               '',
    email:                  '',
    password:               '',
    phone:                  '',
    gender:                 'MALE',
    dateOfBirth:            '',
    location:               'Addis Ababa',
    city:                   '',
    bio:                    '',
    profilePhotoUrl:        '',
    relationshipPreference: 'RELATIONSHIP',
    telegramUsername:       '',
    instagramUsername:      '',
    facebookUsername:       '',
    whatsappNumber:         '',
    tiktokUsername:         '',
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return form.profilePhotoUrl || null;
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const res = await API.post('/upload/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url as string;
    } catch {
      return null;
    }
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) { setError('Full name is required.'); return false; }
    if (!form.email.trim())    { setError('Email is required.');     return false; }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!form.location.trim()) { setError('Location is required.'); return false; }
    if (!form.relationshipPreference) { setError('Please select what you are looking for.'); return false; }
    setError(''); return true;
  };

  const validateStep3 = () => {
    if (!form.phone && !form.telegramUsername && !form.instagramUsername) {
      setError('Please provide at least one contact method: phone, Telegram, or Instagram username.');
      return false;
    }
    setError(''); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const photoUrl = await uploadPhoto();
      const payload = { ...form, profilePhotoUrl: photoUrl || '' };
      await registerUser(payload);
      await sendWelcomeEmail(form.email, form.fullName);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setError('');
    setStep((s) => (s + 1) as Step);
  };

  const prevStep = () => {
    setError('');
    setStep((s) => (s - 1) as Step);
  };

  const STEPS = ['Account', 'Profile', 'Contact'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Heart className="h-10 w-10 text-primary fill-primary mb-3" />
          <h2 className="text-3xl font-extrabold text-white">Create Profile</h2>
          <p className="mt-1 text-sm text-gray-400">Join Whaatachi — Ethiopia&rsquo;s dating platform</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step === i + 1 ? 'text-primary' : step > i + 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] border-2 transition-all ${step === i + 1 ? 'border-primary bg-primary text-white' : step > i + 1 ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400' : 'border-gray-600 text-gray-500'}`}>
                  {step > i + 1 ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px max-w-[40px] transition-colors ${step > i + 1 ? 'bg-emerald-400/60' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-8 rounded-3xl border border-white/10 glass-panel shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Account Basics */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-white font-bold text-base border-b border-white/10 pb-3">Account Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input type="text" required value={form.fullName} onChange={e => set('fullName', e.target.value)}
                      placeholder="e.g. Sara Getnet"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Gender *</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all h-[42px]">
                    <option value="MALE">Male 👨</option>
                    <option value="FEMALE">Female 👩</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Date of Birth <span className="normal-case font-normal text-gray-500">(optional)</span></label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <button type="button" onClick={nextStep}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-white hover:opacity-95 shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-2">
                Next: Profile Details <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-white font-bold text-base border-b border-white/10 pb-3">Profile Details</h3>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Profile Photo <span className="normal-case font-normal text-gray-500">(optional — can be added later)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-black/40 flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-7 w-7 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 hover:border-primary transition-all cursor-pointer">
                      {photoFile ? '📸 Change Photo' : '📸 Upload Photo from Device'}
                    </button>
                    {photoFile && <p className="mt-1.5 text-xs text-emerald-400">{photoFile.name}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Location *</label>
                  <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Addis Ababa"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">City <span className="normal-case font-normal text-gray-500">(optional)</span></label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="Sub-city or area"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Looking For *</label>
                <select value={form.relationshipPreference} onChange={e => set('relationshipPreference', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all h-[42px]">
                  <option value="RELATIONSHIP">❤️ Serious Relationship</option>
                  <option value="DATING">💕 Dating</option>
                  <option value="FWB">🤝 Friends with Benefits</option>
                  <option value="CASUAL">🔥 Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">About Me <span className="normal-case font-normal text-gray-500">(optional)</span></label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  rows={3} placeholder="Tell a bit about yourself..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all resize-none" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={prevStep}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 font-bold text-gray-300 hover:bg-white/10 transition-all cursor-pointer text-sm flex items-center justify-center gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" onClick={nextStep}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-white hover:opacity-95 shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-2">
                  Next: Contacts <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Private Contact Details */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-white font-bold text-base border-b border-white/10 pb-3">Private Contact Details</h3>
                <p className="text-xs text-gray-500 mt-2">
                  🔒 These details are <strong className="text-gray-300">only revealed to paid users</strong> or to women viewing men.
                  <br />At least <strong className="text-primary">one contact method is required</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+251912345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-sky-400" /> Telegram
                  </label>
                  <input type="text" value={form.telegramUsername} onChange={e => set('telegramUsername', e.target.value)}
                    placeholder="username (no @)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <InstagramSVG /> Instagram
                  </label>
                  <input type="text" value={form.instagramUsername} onChange={e => set('instagramUsername', e.target.value)}
                    placeholder="username (no @)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Socials <span className="normal-case font-normal">(optional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <WhatsAppSVG /> WhatsApp
                  </label>
                  <input type="tel" value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)}
                    placeholder="+251912345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <FacebookSVG /> Facebook
                  </label>
                  <input type="text" value={form.facebookUsername} onChange={e => set('facebookUsername', e.target.value)}
                    placeholder="username or profile link"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <TikTokSVG /> TikTok
                  </label>
                  <input type="text" value={form.tiktokUsername} onChange={e => set('tiktokUsername', e.target.value)}
                    placeholder="username (no @)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={prevStep}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 font-bold text-gray-300 hover:bg-white/10 transition-all cursor-pointer text-sm flex items-center justify-center gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-white hover:opacity-95 shadow-lg transition-all cursor-pointer text-sm">
                  {loading ? 'Creating Account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
