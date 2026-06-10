'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { sendAdminReportNotification } from '../../../lib/email';
import API from '../../../lib/api';
import PaymentModal from '../../../components/PaymentModal';
import { MapPin, Phone, MessageSquare, Lock, CheckCircle, Flag, ShieldAlert, ExternalLink } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function ProfileDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [profile, setProfile]           = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [showPayment, setShowPayment]   = useState(false);
  const [showReport, setShowReport]     = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting]       = useState(false);
  const [reported, setReported]         = useState(false);
  const [fee, setFee]                   = useState<number>(200);

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
    if (token) fetchFee();
  }, [token]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/profiles/${id}`);
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && id) loadProfile(); }, [token, id]); // eslint-disable-line

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    setReporting(true);
    try {
      await API.post('/reports', { reportedUserId: profile.userId, reason: reportReason });
      await sendAdminReportNotification(user?.profile?.fullName || 'User', profile.fullName, reportReason);
      setReported(true);
      setTimeout(() => setShowReport(false), 3000);
    } catch { alert('Failed to submit report.'); }
    finally { setReporting(false); }
  };

  if (!token)   return <div className="flex-1 flex items-center justify-center"><p className="text-gray-400">Please log in to view profiles.</p></div>;
  if (loading)  return <div className="flex-1 flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-t-2 border-primary" /></div>;
  if (!profile) return <div className="flex-1 flex items-center justify-center"><p className="text-gray-400">Profile not found.</p></div>;

  const age = profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null;
  const isLocked = profile.isLocked;

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 relative">
      <div className="absolute top-10 left-1/3 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="rounded-3xl border border-white/10 bg-dark-surface/50 glass-panel overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* ── Photo ──────────────────────────────────────── */}
        <div className="w-full md:w-2/5 aspect-[3/4] relative bg-gray-900 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500'}
            alt={profile.fullName}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Online
          </div>
          <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {profile.relationshipPreference}
          </div>
        </div>

        {/* ── Info ───────────────────────────────────────── */}
        <div className="flex-1 p-7 flex flex-col justify-between">
          <div className="space-y-5">

            {/* Name / location */}
            <div>
              <h2 className="text-3xl font-extrabold text-white">
                {profile.fullName}{age ? `, ${age}` : ''}
              </h2>
              <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-500" />
                {profile.location}{profile.city ? `, ${profile.city}` : ''}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">About</p>
                <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{profile.bio}&rdquo;</p>
              </div>
            )}

            {/* ── Contact Information ─────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 relative overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact Information</p>

              {isLocked ? (
                /* Blurred lock overlay */
                <div>
                  <div className="filter blur-sm select-none pointer-events-none space-y-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400"><Phone className="h-4 w-4" /> +251 900 000 000</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400"><MessageSquare className="h-4 w-4" /> @telegram_user</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400"><InstagramIcon className="h-4 w-4" /> @instagram_user</div>
                  </div>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="h-6 w-6 text-primary mb-2" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Contacts Locked</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                      One-time payment of <strong className="text-white">{fee} ETB</strong> to reveal phone, Telegram &amp; Instagram.
                    </p>
                    <button onClick={() => setShowPayment(true)}
                      className="mt-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-6 py-2 shadow hover:opacity-90 transition-all cursor-pointer">
                      Unlock Now — {fee} ETB
                    </button>
                  </div>
                </div>
              ) : (
                /* Revealed contacts */
                <div className="space-y-3 animate-fade-in">
                  {profile.user?.phone && (
                    <div className="flex items-center gap-3 text-sm text-white">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono">{profile.user.phone}</span>
                    </div>
                  )}
                  {profile.telegramUsername && (
                    <div className="flex items-center gap-3 text-sm text-white">
                      <MessageSquare className="h-4 w-4 text-sky-400 shrink-0" />
                      <a href={`https://t.me/${profile.telegramUsername}`} target="_blank" rel="noreferrer"
                        className="font-mono hover:underline flex items-center gap-1">
                        @{profile.telegramUsername} <ExternalLink className="h-3 w-3 text-gray-500" />
                      </a>
                    </div>
                  )}
                  {profile.instagramUsername && (
                    <div className="flex items-center gap-3 text-sm text-white">
                      <InstagramIcon className="h-4 w-4 text-pink-500 shrink-0" />
                      <a href={`https://instagram.com/${profile.instagramUsername}`} target="_blank" rel="noreferrer"
                        className="font-mono hover:underline flex items-center gap-1">
                        @{profile.instagramUsername} <ExternalLink className="h-3 w-3 text-gray-500" />
                      </a>
                    </div>
                  )}
                  {!profile.user?.phone && !profile.telegramUsername && !profile.instagramUsername && (
                    <p className="text-xs text-gray-500">No contact details provided.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────── */}
          <div className="mt-6 space-y-3">
            {/* Contact Now CTA — only shown when unlocked */}
            {!isLocked && (profile.telegramUsername || profile.user?.phone) && (
              <a
                href={profile.telegramUsername ? `https://t.me/${profile.telegramUsername}` : `tel:${profile.user.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-sm text-white hover:opacity-90 shadow-lg transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Now
              </a>
            )}

            {/* Unlock CTA when locked */}
            {isLocked && (
              <button onClick={() => setShowPayment(true)}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-sm text-white hover:opacity-90 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" /> Unlock Contact — {fee} ETB
              </button>
            )}

            {/* Unlocked indicator */}
            {!isLocked && (
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="h-4 w-4" /> Contact details revealed
              </div>
            )}

            {/* Report */}
            <button onClick={() => setShowReport(!showReport)}
              className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Flag className="h-3.5 w-3.5" /> Report this profile
            </button>
          </div>
        </div>
      </div>

      {/* Report form */}
      {showReport && (
        <div className="mt-5 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 animate-fade-in">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-3">
            <ShieldAlert className="h-4 w-4 text-red-400" /> Report Profile
          </h4>
          {reported ? (
            <p className="text-xs text-emerald-400 font-semibold text-center py-2">Report submitted. Thank you for keeping Whaatachi safe.</p>
          ) : (
            <form onSubmit={handleReport} className="flex gap-3">
              <input type="text" required value={reportReason} onChange={e => setReportReason(e.target.value)}
                placeholder="Reason (fake account, inappropriate content…)"
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-red-500" />
              <button type="submit" disabled={reporting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer">
                {reporting ? '…' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} onSuccess={() => { setShowPayment(false); loadProfile(); }} />
      )}
    </div>
  );
}
