'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { sendAdminReportNotification } from '../../../lib/email';
import API from '../../../lib/api';
import PaymentModal from '../../../components/PaymentModal';
import {
  MapPin, Phone, MessageSquare, Lock, CheckCircle,
  Flag, ShieldAlert, ExternalLink, Heart, Calendar
} from 'lucide-react';

// Inline social SVG icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.25 8.25 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
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
        if (res.data?.membershipFee) setFee(res.data.membershipFee);
      } catch { /* ignore */ }
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

  // Build contacts list from unlocked data
  const contacts = [
    profile.user?.phone        && { icon: Phone,        color: 'text-emerald-400', label: 'Phone',     href: `tel:${profile.user.phone}`,                            text: profile.user.phone,        external: false },
    profile.telegramUsername   && { icon: MessageSquare, color: 'text-sky-400',    label: 'Telegram',  href: `https://t.me/${profile.telegramUsername}`,              text: `@${profile.telegramUsername}`, external: true },
    profile.instagramUsername  && { icon: InstagramIcon, color: 'text-pink-500',   label: 'Instagram', href: `https://instagram.com/${profile.instagramUsername}`,    text: `@${profile.instagramUsername}`, external: true },
    profile.whatsappNumber     && { icon: WhatsAppIcon,  color: 'text-green-400',  label: 'WhatsApp',  href: `https://wa.me/${profile.whatsappNumber.replace(/\D/g,'')}`, text: profile.whatsappNumber, external: true },
    profile.facebookUsername   && { icon: FacebookIcon,  color: 'text-blue-400',   label: 'Facebook',  href: profile.facebookUsername.startsWith('http') ? profile.facebookUsername : `https://facebook.com/${profile.facebookUsername}`, text: profile.facebookUsername, external: true },
    profile.tiktokUsername     && { icon: TikTokIcon,    color: 'text-gray-200',   label: 'TikTok',    href: `https://tiktok.com/@${profile.tiktokUsername}`,         text: `@${profile.tiktokUsername}`, external: true },
    profile.user?.email        && { icon: null,           color: 'text-gray-300',  label: 'Email',     href: `mailto:${profile.user.email}`,                          text: profile.user.email,        external: false },
  ].filter(Boolean) as any[];

  const primaryContact = profile.telegramUsername
    ? `https://t.me/${profile.telegramUsername}`
    : profile.whatsappNumber
      ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, '')}`
      : profile.user?.phone ? `tel:${profile.user.phone}` : null;

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 relative">
      <div className="absolute top-10 left-1/3 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="rounded-3xl border border-white/10 bg-dark-surface/50 glass-panel overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* Photo */}
        <div className="w-full md:w-2/5 aspect-[3/4] relative bg-gray-900 shrink-0">
          {profile.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profilePhotoUrl} alt={profile.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Heart className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Online
          </div>
          <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {profile.relationshipPreference}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-7 flex flex-col justify-between">
          <div className="space-y-5">

            {/* Name / age / location */}
            <div>
              <h2 className="text-3xl font-extrabold text-white">
                {profile.fullName}{age ? `, ${age}` : ''}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {profile.location}{profile.city ? `, ${profile.city}` : ''}
                </p>
                {age && (
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-500" /> {age} years old
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">About</p>
                <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{profile.bio}&rdquo;</p>
              </div>
            )}

            {/* Contact Info box */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 relative overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact Information</p>

              {isLocked ? (
                /* Locked overlay */
                <div>
                  <div className="filter blur-sm select-none pointer-events-none space-y-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400"><Phone className="h-4 w-4" /> +251 900 000 000</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400"><MessageSquare className="h-4 w-4" /> @telegram_user</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400"><InstagramIcon className="h-4 w-4" /> @instagram_user</div>
                  </div>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="h-6 w-6 text-primary mb-2" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Contacts Locked</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[220px]">
                      One-time payment of <strong className="text-white">{fee} ETB</strong> unlocks phone, Telegram, Instagram &amp; all social contacts.
                    </p>
                    <button onClick={() => setShowPayment(true)}
                      className="mt-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-6 py-2 shadow hover:opacity-90 transition-all cursor-pointer">
                      Unlock Now — {fee} ETB
                    </button>
                  </div>
                </div>
              ) : contacts.length > 0 ? (
                /* Revealed contacts */
                <div className="space-y-3 animate-fade-in">
                  {contacts.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white">
                      {c.icon && <c.icon className={`h-4 w-4 ${c.color} shrink-0`} />}
                      {c.external ? (
                        <a href={c.href} target="_blank" rel="noreferrer"
                          className={`font-mono hover:underline flex items-center gap-1 ${c.color}`}>
                          {c.text} <ExternalLink className="h-3 w-3 text-gray-500" />
                        </a>
                      ) : (
                        <a href={c.href} className={`font-mono ${c.color}`}>{c.text}</a>
                      )}
                      <span className="text-[10px] text-gray-600 uppercase">{c.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No contact details provided by this user.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {!isLocked && primaryContact && (
              <a href={primaryContact} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-sm text-white hover:opacity-90 shadow-lg transition-all">
                <MessageSquare className="h-4 w-4" /> Contact Now
              </a>
            )}

            {isLocked && (
              <button onClick={() => setShowPayment(true)}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-sm text-white hover:opacity-90 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" /> Unlock Contact — {fee} ETB
              </button>
            )}

            {!isLocked && (
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="h-4 w-4" /> Contact details revealed
              </div>
            )}

            <button onClick={() => setShowReport(!showReport)}
              className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Flag className="h-3.5 w-3.5" /> Report this profile
            </button>
          </div>
        </div>
      </div>

      {/* Report Form */}
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
