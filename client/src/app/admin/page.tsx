'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendProfileApprovedEmail } from '../../lib/email';
import API from '../../lib/api';
import {
  Shield, Users, DollarSign, Flag, FileText,
  Check, Trash2, Clock, CheckCircle, Settings, TrendingUp,
} from 'lucide-react';

type Tab = 'moderation' | 'reports' | 'fees';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats]               = useState<any>(null);
  const [pending, setPending]           = useState<any[]>([]);
  const [reports, setReports]           = useState<any[]>([]);
  const [currentFee, setCurrentFee]     = useState<number>(200);
  const [newFee, setNewFee]             = useState('');
  const [feeMsg, setFeeMsg]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<Tab>('moderation');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, p, r, cfg] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/profiles/pending'),
        API.get('/admin/reports'),
        API.get('/admin/settings'),
      ]);
      setStats(s.data);
      setPending(p.data);
      setReports(r.data);
      setCurrentFee(cfg.data.membershipFee);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'ADMIN') loadAll(); }, [user]);

  const approveProfile = async (id: string, approve: boolean, email: string, name: string) => {
    await API.post(`/admin/profiles/${id}/approve`, { approve });
    if (approve) await sendProfileApprovedEmail(email, name);
    loadAll();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Permanently ban this user?')) return;
    await API.delete(`/admin/users/${id}`);
    loadAll();
  };

  const resolveReport = async (id: string) => {
    await API.put(`/admin/reports/${id}/resolve`);
    loadAll();
  };

  const saveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.put('/admin/settings/fee', { amount: Number(newFee) });
      setCurrentFee(res.data.membershipFee);
      setFeeMsg(`✓ Fee updated to ${res.data.membershipFee} ETB`);
      setNewFee('');
      setTimeout(() => setFeeMsg(''), 4000);
    } catch { setFeeMsg('Failed to update fee.'); }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-gray-400 mt-1">Administrator privileges required.</p>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'moderation', label: `Pending Profiles`,   count: pending.length },
    { id: 'reports',    label: `Abuse Reports`,      count: reports.filter(r => r.status === 'PENDING').length },
    { id: 'fees',       label: `Membership Fees` },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-primary" />
        <h2 className="text-3xl font-extrabold text-white tracking-wide">Admin Dashboard</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        </div>
      ) : (
        <>
          {/* ── Stats Grid ─────────────────────────────────── */}
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: 'Total Users',     value: stats?.totalUsers,       sub: `${stats?.maleUsers}M / ${stats?.femaleUsers}F`, icon: Users,      color: 'text-cyan-400'   },
              { label: 'Total Revenue',   value: `${stats?.totalRevenue} ETB`, sub: 'Completed payments',                      icon: TrendingUp,  color: 'text-emerald-400' },
              { label: 'Pending Review',  value: stats?.pendingApprovals, sub: 'Profiles awaiting admin',                      icon: Clock,       color: 'text-amber-500'  },
              { label: 'Active Reports',  value: stats?.activeReports,    sub: 'Safety alerts',                               icon: Flag,        color: 'text-red-400'    },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-dark-surface p-5 glass-panel">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="mt-1 text-xs text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs ───────────────────────────────────────── */}
          <div className="flex gap-6 border-b border-white/10 mb-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                }`}>
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${t.count > 0 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Moderation Queue ───────────────────────────── */}
          {tab === 'moderation' && (
            <div className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden glass-panel">
              {pending.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <p className="font-bold">Queue is empty — all profiles reviewed!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Profile</th>
                        <th className="p-4">Goal</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Bio</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pending.map(p => {
                        const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : '?';
                        return (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10" />
                                <div>
                                  <p className="font-bold text-white">{p.fullName}</p>
                                  <p className="text-xs text-gray-400">{p.user?.gender} · {age} yrs · {p.location}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300">
                                {p.relationshipPreference}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-400 space-y-0.5">
                              <div>📞 {p.user?.phone}</div>
                              {p.telegramUsername && <div>✈️ @{p.telegramUsername}</div>}
                            </td>
                            <td className="p-4 max-w-[180px] truncate text-xs text-gray-300 italic" title={p.bio}>
                              {p.bio || '—'}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => approveProfile(p.id, true, p.user.email, p.fullName)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer" title="Approve">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => approveProfile(p.id, false, p.user.email, p.fullName)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer" title="Reject">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Reports ────────────────────────────────────── */}
          {tab === 'reports' && (
            <div className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden glass-panel">
              {reports.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <FileText className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="font-bold">No reports filed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Reported User</th>
                        <th className="p-4">Reporter</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports.map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white">{r.reportedUser?.profile?.fullName || 'Deleted'}</p>
                            <p className="text-xs text-gray-400">{r.reportedUser?.email}</p>
                          </td>
                          <td className="p-4 text-xs text-gray-300">{r.reporter?.profile?.fullName}</td>
                          <td className="p-4 text-xs text-gray-300 italic max-w-[200px] truncate">&ldquo;{r.reason}&rdquo;</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              r.status === 'PENDING' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>{r.status}</span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {r.status === 'PENDING' && (
                              <>
                                <button onClick={() => resolveReport(r.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                  Resolve
                                </button>
                                <button onClick={() => deleteUser(r.reportedUserId)}
                                  className="p-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer inline-flex items-center" title="Ban User">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Membership Fees ────────────────────────────── */}
          {tab === 'fees' && (
            <div className="max-w-md space-y-6">
              {/* Current fee display */}
              <div className="rounded-2xl border border-white/10 bg-dark-surface p-8 glass-panel text-center">
                <Settings className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Current Membership Fee</p>
                <p className="text-5xl font-extrabold text-white">{currentFee}</p>
                <p className="text-lg text-gray-400 mt-1">ETB <span className="text-xs">(one-time, male members only)</span></p>
              </div>

              {/* Update fee form */}
              <div className="rounded-2xl border border-white/10 bg-dark-surface p-6 glass-panel">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Update Fee Amount
                </h4>
                <form onSubmit={saveFee} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">New Amount (ETB)</label>
                    <div className="flex gap-3">
                      <input
                        type="number" min="0" step="10" required
                        value={newFee} onChange={e => setNewFee(e.target.value)}
                        placeholder={`Current: ${currentFee} ETB`}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                      />
                      <button type="submit"
                        className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-pink-600 transition-colors cursor-pointer">
                        Save
                      </button>
                    </div>
                  </div>
                  {feeMsg && (
                    <p className={`text-xs font-semibold ${feeMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {feeMsg}
                    </p>
                  )}
                </form>
                <p className="mt-4 text-xs text-gray-500">
                  Changes apply to new payments immediately. Existing payments are not affected.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
