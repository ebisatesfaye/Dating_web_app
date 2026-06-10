'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../lib/api';
import PaymentModal from '../../components/PaymentModal';
import {
  User, Shield, CreditCard, Sparkles, MapPin, MessageSquare,
  Edit, AlertTriangle, CheckCircle, Camera, Phone, Save, X
} from 'lucide-react';

// Inline Social Icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
);
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.25 8.25 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" /></svg>
);

export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    fullName: '', bio: '', location: '', city: '',
    profilePhotoUrl: '', relationshipPreference: 'RELATIONSHIP',
    dateOfBirth: '',
    phone: '',
    telegramUsername: '', instagramUsername: '',
    facebookUsername: '', whatsappNumber: '', tiktokUsername: '',
  });

  const [editing, setEditing]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [success, setSuccess]               = useState(false);
  const [photoFile, setPhotoFile]           = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]     = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setFormData({
        fullName:               p.fullName             || '',
        bio:                    p.bio                  || '',
        location:               p.location             || '',
        city:                   p.city                 || '',
        profilePhotoUrl:        p.profilePhotoUrl      || '',
        relationshipPreference: p.relationshipPreference || 'RELATIONSHIP',
        dateOfBirth:            p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
        phone:                  (user as any).phone    || '',
        telegramUsername:       p.telegramUsername     || '',
        instagramUsername:      p.instagramUsername    || '',
        facebookUsername:       p.facebookUsername     || '',
        whatsappNumber:         p.whatsappNumber       || '',
        tiktokUsername:         p.tiktokUsername       || '',
      });
      setPhotoPreview(p.profilePhotoUrl || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return formData.profilePhotoUrl || null;
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const res = await API.post('/upload/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.url as string;
    } catch { return formData.profilePhotoUrl || null; }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const photoUrl = await uploadPhoto();
      const payload = { ...formData, profilePhotoUrl: photoUrl };
      await API.put(`/profiles/${user.profile.id}`, payload);
      await refreshUser();
      setSuccess(true);
      setEditing(false);
      setPhotoFile(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Please log in to view your dashboard.</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  const age = user.profile?.dateOfBirth
    ? new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear()
    : null;

  const INPUT = 'w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-all';
  const LABEL = 'block text-xs font-semibold text-gray-400 mb-1.5';

  const socialHandles = [
    { icon: MessageSquare, color: 'text-sky-400',   label: 'Telegram',  val: user.profile?.telegramUsername,  prefix: '@' },
    { icon: InstagramIcon, color: 'text-pink-500',  label: 'Instagram', val: user.profile?.instagramUsername, prefix: '@' },
    { icon: WhatsAppIcon,  color: 'text-green-400', label: 'WhatsApp',  val: user.profile?.whatsappNumber,    prefix: '' },
    { icon: FacebookIcon,  color: 'text-blue-400',  label: 'Facebook',  val: user.profile?.facebookUsername,  prefix: '' },
    { icon: TikTokIcon,    color: 'text-gray-200',  label: 'TikTok',    val: user.profile?.tiktokUsername,    prefix: '@' },
  ].filter(s => s.val);

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-10 relative">
      <div className="absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left: Summary card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-dark-surface p-6 flex flex-col items-center text-center glass-panel">

            {/* Avatar with change button */}
            <div className="relative group cursor-pointer" onClick={() => editing && fileInputRef.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {photoPreview ? (
                <img src={photoPreview} alt="avatar" className="h-28 w-28 rounded-full object-cover border-2 border-primary/50 shadow-md" />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-primary/50 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary/60" />
                </div>
              )}
              {editing && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            {editing && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-primary hover:underline cursor-pointer">
                Change Photo
              </button>
            )}
            {photoFile && <p className="text-[10px] text-emerald-400 mt-1">{photoFile.name}</p>}

            <h3 className="text-xl font-bold text-white mt-4">{user.profile?.fullName}</h3>
            <span className="text-xs font-semibold text-gray-400 mt-1 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" /> {user.profile?.location}
            </span>

            <div className="w-full mt-6 pt-6 border-t border-white/5 space-y-3 text-left">
              {/* Moderation status */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Moderation Status</span>
                {user.profile?.isActive ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full justify-center">
                    <CheckCircle className="h-4 w-4" /> Active Profile
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full justify-center">
                    <AlertTriangle className="h-4 w-4" /> Awaiting Approval
                  </div>
                )}
              </div>

              {/* Payment/plan status */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Premium Status</span>
                {user.paymentStatus === 'PAID' ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full justify-center">
                    <Sparkles className="h-4 w-4" /> Premium Member
                  </div>
                ) : user.paymentStatus === 'FREE' ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full justify-center">
                    <CheckCircle className="h-4 w-4" /> Free Access (Female)
                  </div>
                ) : (
                  <div className="mt-1.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full justify-center">
                      <CreditCard className="h-4 w-4" /> Unpaid
                    </div>
                    <button onClick={() => setShowPaymentModal(true)}
                      className="w-full text-center py-2 rounded-xl bg-primary text-xs font-bold text-white shadow-md hover:bg-pink-600 transition-colors cursor-pointer">
                      Unlock Premium (200 ETB)
                    </button>
                  </div>
                )}
              </div>

              {/* My gender */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Gender</span>
                <span className="text-sm text-white mt-1 block">{user.gender} {user.gender === 'FEMALE' ? '👩' : '👨'}</span>
              </div>

              {age && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Age</span>
                  <span className="text-sm text-white mt-1 block">{age} years old</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="md:col-span-2 space-y-6">
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
              <CheckCircle className="h-5 w-5 shrink-0" /> Profile updated successfully!
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-dark-surface/40 p-8 glass-panel shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Details
              </h3>
              <button onClick={() => { setEditing(!editing); if (editing) setPhotoFile(null); }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                {editing ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Edit className="h-3.5 w-3.5" /> Edit Details</>}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Full Name *</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Location *</label>
                    <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Looking For</label>
                  <select name="relationshipPreference" value={formData.relationshipPreference} onChange={handleInputChange}
                    className={`${INPUT} h-10`}>
                    <option value="RELATIONSHIP">❤️ Serious Relationship</option>
                    <option value="DATING">💕 Dating</option>
                    <option value="FWB">🤝 Friends with Benefits</option>
                    <option value="CASUAL">🔥 Casual</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL}>About Me</label>
                  <textarea name="bio" rows={3} value={formData.bio} onChange={handleInputChange} className={`${INPUT} resize-none`} />
                </div>

                {/* Private Contact Details */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    🔒 Private Contact Details
                    <span className="font-normal normal-case tracking-normal text-gray-500 ml-1">— at least one required</span>
                  </p>

                  <div>
                    <label className={`${LABEL} flex items-center gap-1.5`}><Phone className="h-3.5 w-3.5" /> Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+251912345678" className={INPUT} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`${LABEL} flex items-center gap-1.5`}><MessageSquare className="h-3.5 w-3.5 text-sky-400" /> Telegram</label>
                      <input type="text" name="telegramUsername" value={formData.telegramUsername} onChange={handleInputChange} placeholder="username" className={INPUT} />
                    </div>
                    <div>
                      <label className={`${LABEL} flex items-center gap-1.5`}><InstagramIcon className="h-3.5 w-3.5 text-pink-500" /> Instagram</label>
                      <input type="text" name="instagramUsername" value={formData.instagramUsername} onChange={handleInputChange} placeholder="username" className={INPUT} />
                    </div>
                    <div>
                      <label className={`${LABEL} flex items-center gap-1.5`}><WhatsAppIcon className="h-3.5 w-3.5 text-green-400" /> WhatsApp</label>
                      <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="+251912345678" className={INPUT} />
                    </div>
                    <div>
                      <label className={`${LABEL} flex items-center gap-1.5`}><FacebookIcon className="h-3.5 w-3.5 text-blue-400" /> Facebook</label>
                      <input type="text" name="facebookUsername" value={formData.facebookUsername} onChange={handleInputChange} placeholder="username or link" className={INPUT} />
                    </div>
                    <div className="col-span-2">
                      <label className={`${LABEL} flex items-center gap-1.5`}><TikTokIcon className="h-3.5 w-3.5 text-gray-300" /> TikTok</label>
                      <input type="text" name="tiktokUsername" value={formData.tiktokUsername} onChange={handleInputChange} placeholder="username" className={INPUT} />
                    </div>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className={`${LABEL} flex items-center gap-1.5`}>
                    Email <span className="font-normal text-gray-500">(cannot be changed)</span>
                  </label>
                  <input type="email" value={user.email} disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-gray-500 text-sm cursor-not-allowed" />
                </div>

                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-primary hover:bg-pink-600 text-white font-bold px-8 py-3 text-sm transition-colors cursor-pointer">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-sm">
                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Email</span>
                    <span className="text-white mt-1 block break-all">{user.email}</span>
                  </div>
                  {(user as any).phone && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Phone</span>
                      <span className="text-white mt-1 block">{(user as any).phone}</span>
                    </div>
                  )}
                  {age && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Age</span>
                      <span className="text-white mt-1 block">{age} years old</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Location</span>
                    <span className="text-white mt-1 block">{user.profile?.location}{user.profile?.city ? `, ${user.profile.city}` : ''}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Looking For</span>
                    <span className="text-white mt-1 block">{user.profile?.relationshipPreference}</span>
                  </div>
                </div>

                {user.profile?.bio && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Bio</span>
                    <p className="text-gray-300 mt-2 leading-relaxed italic border-l-2 border-white/10 pl-3">
                      &ldquo;{user.profile.bio}&rdquo;
                    </p>
                  </div>
                )}

                {socialHandles.length > 0 && (
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Social Handles</span>
                    <div className="flex flex-wrap gap-3">
                      {socialHandles.map((s, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-white/5 text-xs font-mono text-white">
                          <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                          {s.prefix}{s.val}
                          <span className="text-[10px] text-gray-600 ml-1">{s.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {socialHandles.length === 0 && (
                  <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-400">
                    <AlertTriangle className="h-4 w-4 inline mr-1.5" />
                    No contact details added yet. Click <strong>Edit Details</strong> to add your phone, Telegram, or Instagram.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} onSuccess={() => { setShowPaymentModal(false); refreshUser(); }} />
      )}
    </div>
  );
}
