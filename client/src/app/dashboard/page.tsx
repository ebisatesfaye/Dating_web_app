'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../lib/api';
import PaymentModal from '../../components/PaymentModal';
import { User, Shield, CreditCard, Sparkles, MapPin, Mail, MessageSquare, Edit, AlertTriangle, CheckCircle } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);


export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState<any>({
    fullName: '',
    bio: '',
    location: '',
    city: '',
    profilePhotoUrl: '',
    relationshipPreference: '',
    telegramUsername: '',
    instagramUsername: ''
  });
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setFormData({
        fullName: p.fullName || '',
        bio: p.bio || '',
        location: p.location || '',
        city: p.city || '',
        profilePhotoUrl: p.profilePhotoUrl || '',
        relationshipPreference: p.relationshipPreference || 'RELATIONSHIP',
        telegramUsername: p.telegramUsername || '',
        instagramUsername: p.instagramUsername || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await API.put(`/profiles/${user.profile.id}`, formData);
      await refreshUser();
      setSuccess(true);
      setEditing(false);
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

  const birthYear = new Date(user.profile?.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-10 relative">
      <div className="absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Brief Summary card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-dark-surface p-6 flex flex-col items-center text-center glass-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.profile?.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500'}
              alt="avatar"
              className="h-28 w-28 rounded-full object-cover border-2 border-primary/50 shadow-md"
            />
            <h3 className="text-xl font-bold text-white mt-4">{user.profile?.fullName}</h3>
            <span className="text-xs font-semibold text-gray-400 mt-1 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" /> {user.profile?.location}
            </span>

            {/* Approval Status */}
            <div className="w-full mt-6 pt-6 border-t border-white/5 space-y-3">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Moderation Status</span>
                {user.profile?.isActive ? (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full justify-center">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Active Profile</span>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full justify-center">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Awaiting Admin Approval</span>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Premium Subscription</span>
                {user.paymentStatus === 'PAID' ? (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full justify-center">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Premium Member (Paid)</span>
                  </div>
                ) : user.paymentStatus === 'FREE' ? (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full justify-center">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Female Member (Free)</span>
                  </div>
                ) : (
                  <div className="mt-1.5 flex flex-col gap-2">
                    <div className="flex items-center space-x-1.5 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full justify-center">
                      <CreditCard className="h-4 w-4 shrink-0" />
                      <span>Pending Verification</span>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full text-center py-2 rounded-xl bg-primary text-xs font-bold text-white shadow-md hover:bg-pink-600 transition-colors cursor-pointer"
                    >
                      Unlock Premium (200 ETB)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile details */}
        <div className="md:col-span-2 space-y-6">
          {success && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-dark-surface/40 p-8 glass-panel shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Personal Details</span>
              </h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>{editing ? 'Cancel' : 'Edit Details'}</span>
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Goal / Intent</label>
                    <select
                      name="relationshipPreference"
                      value={formData.relationshipPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary h-10"
                    >
                      <option value="RELATIONSHIP">True Relationship</option>
                      <option value="DATING">Dating</option>
                      <option value="FWB">Friends with Benefits</option>
                      <option value="CASUAL">Casual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Photo URL</label>
                  <input
                    type="text"
                    name="profilePhotoUrl"
                    value={formData.profilePhotoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Telegram Username</label>
                    <input
                      type="text"
                      name="telegramUsername"
                      value={formData.telegramUsername}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Instagram Username</label>
                    <input
                      type="text"
                      name="instagramUsername"
                      value={formData.instagramUsername}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary hover:bg-pink-600 text-white font-bold px-8 py-3 text-sm transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Age</span>
                    <span className="text-white mt-1 block">{age} years</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Gender</span>
                    <span className="text-white mt-1 block">{user.gender}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Email</span>
                    <span className="text-white mt-1 block">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Phone</span>
                    <span className="text-white mt-1 block">{user.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Bio</span>
                  <p className="text-gray-300 mt-2 leading-relaxed italic border-l-2 border-white/10 pl-3">
                    &ldquo;{user.profile?.bio || 'No bio information added yet.'}&rdquo;
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Social Handles</span>
                  <div className="flex flex-wrap gap-4 text-xs font-mono">
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black border border-white/5 text-white">
                      <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                      <span>{user.profile?.telegramUsername ? `@${user.profile.telegramUsername}` : 'None'}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black border border-white/5 text-white">
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
                      <span>{user.profile?.instagramUsername ? `@${user.profile.instagramUsername}` : 'None'}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
