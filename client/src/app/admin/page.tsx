'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendProfileApprovedEmail } from '../../lib/email';
import API from '../../lib/api';
import {
  Shield, Users, DollarSign, Flag, FileText,
  Check, Trash2, Clock, CheckCircle, Settings, TrendingUp,
  Search, Filter, CreditCard, X, AlertTriangle
} from 'lucide-react';

type Tab = 'moderation' | 'users' | 'payments' | 'reports' | 'fees';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats]               = useState<any>(null);
  const [users, setUsers]               = useState<any[]>([]);
  const [payments, setPayments]         = useState<any[]>([]);
  const [pending, setPending]           = useState<any[]>([]);
  const [reports, setReports]           = useState<any[]>([]);
  const [currentFee, setCurrentFee]     = useState<number>(200);
  const [newFee, setNewFee]             = useState('');
  const [feeMsg, setFeeMsg]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<Tab>('moderation');

  // Search & Filters
  const [userSearch, setUserSearch]     = useState('');
  const [userFilter, setUserFilter]     = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('ALL');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, p, r, cfg, u, pay] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/profiles/pending'),
        API.get('/admin/reports'),
        API.get('/admin/settings'),
        API.get('/admin/users'),
        API.get('/admin/payments'),
      ]);
      setStats(s.data);
      setPending(p.data);
      setReports(r.data);
      setCurrentFee(cfg.data.membershipFee);
      setUsers(u.data);
      setPayments(pay.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'ADMIN') loadAll(); }, [user]);

  const approveProfile = async (id: string, approve: boolean, email: string, name: string) => {
    try {
      await API.post(`/admin/profiles/${id}/approve`, { approve });
      if (approve) await sendProfileApprovedEmail(email, name);
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile status');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user account? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const resolveReport = async (id: string) => {
    try {
      await API.put(`/admin/reports/${id}/resolve`);
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve report');
    }
  };

  const handleVerifyPayment = async (id: string, status: 'COMPLETED' | 'FAILED') => {
    try {
      await API.post(`/admin/payments/${id}/verify`, { status });
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Failed to verify payment status');
    }
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

  // Clickable stats card config
  const STATS_CARDS = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      sub: `${stats?.maleUsers || 0}M / ${stats?.femaleUsers || 0}F`,
      icon: Users,
      color: 'text-cyan-400 border-cyan-500/20 hover:border-cyan-400/60 bg-cyan-500/5',
      targetTab: 'users' as Tab
    },
    {
      label: 'Total Revenue',
      value: `${stats?.totalRevenue || 0} ETB`,
      sub: 'Completed payments',
      icon: TrendingUp,
      color: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-400/60 bg-emerald-500/5',
      targetTab: 'payments' as Tab
    },
    {
      label: 'Pending Review',
      value: stats?.pendingApprovals || 0,
      sub: 'Awaiting moderation',
      icon: Clock,
      color: 'text-amber-500 border-amber-500/20 hover:border-amber-400/60 bg-amber-500/5',
      targetTab: 'moderation' as Tab
    },
    {
      label: 'Active Reports',
      value: stats?.activeReports || 0,
      sub: 'Safety alerts',
      icon: Flag,
      color: 'text-red-400 border-red-500/20 hover:border-red-400/60 bg-red-500/5',
      targetTab: 'reports' as Tab
    }
  ];

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'moderation', label: 'Pending Profiles', count: pending.length },
    { id: 'users',      label: 'Manage Users',      count: users.length },
    { id: 'payments',   label: 'Verify Payments',   count: payments.filter(p => p.status === 'PENDING').length },
    { id: 'reports',    label: 'Abuse Reports',     count: reports.filter(r => r.status === 'PENDING').length },
    { id: 'fees',       label: 'Membership Fees' },
  ];

  // Filters logic
  const filteredUsers = users.filter(u => {
    const searchMatch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      (u.profile?.fullName || '').toLowerCase().includes(userSearch.toLowerCase());

    const isPendingProfile = u.profile && !u.profile.isActive;
    const isApprovedProfile = u.profile && u.profile.isActive;

    if (userFilter === 'PENDING') return searchMatch && isPendingProfile;
    if (userFilter === 'APPROVED') return searchMatch && isApprovedProfile;
    return searchMatch;
  });

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'ALL') return true;
    return p.status === paymentFilter;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-extrabold text-white tracking-wide">Admin Dashboard</h2>
        </div>
        <button
          onClick={loadAll}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid - Clickable cards */}
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-8">
            {STATS_CARDS.map((s, i) => (
              <button
                key={i}
                onClick={() => setTab(s.targetTab)}
                className={`text-left rounded-2xl border p-5 transition-all duration-300 cursor-pointer group hover:scale-[1.03] shadow-md hover:shadow-lg ${s.color} ${
                  tab === s.targetTab ? 'ring-2 ring-primary border-transparent' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">{s.label}</span>
                  <s.icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="mt-1 text-xs text-gray-400/80">{s.sub}</div>
                <div className="mt-3 text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View details &rarr;
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${t.count > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/10 text-gray-400'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Moderation Queue */}
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

          {/* Manage Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-dark-surface border border-white/10 rounded-2xl p-4 glass-panel">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {(['ALL', 'APPROVED', 'PENDING'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setUserFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        userFilter === f
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f === 'ALL' ? 'All Profiles' : f === 'APPROVED' ? 'Approved' : 'Pending'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users table */}
              <div className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden glass-panel">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <p className="font-bold">No users match the search filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">User Account</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Verification</th>
                          <th className="p-4">Role</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={u.profile?.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <p className="font-bold text-white">{u.profile?.fullName || 'No profile created yet'}</p>
                                  <p className="text-xs text-gray-400">{u.email} · {u.phone} ({u.gender})</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                u.profile?.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : u.profile
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                              }`}>
                                {u.profile?.isActive ? 'Active' : u.profile ? 'Pending review' : 'No profile'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                u.paymentStatus === 'PAID'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {u.paymentStatus}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-semibold text-gray-300">{u.role}</td>
                            <td className="p-4 text-right space-x-2">
                              {/* Toggle Profile Status */}
                              {u.profile && !u.profile.isActive && (
                                <button
                                  onClick={() => approveProfile(u.profile.id, true, u.email, u.profile.fullName)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                  title="Approve Profile"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              {/* Remove Fake Account */}
                              {u.role !== 'ADMIN' && (
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verify Payments Tab */}
          {tab === 'payments' && (
            <div className="space-y-4">
              {/* Payment Filter */}
              <div className="flex justify-end gap-2 bg-dark-surface border border-white/10 rounded-2xl p-4 glass-panel">
                {(['ALL', 'PENDING', 'COMPLETED', 'FAILED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPaymentFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      paymentFilter === f
                        ? 'bg-primary text-white border-transparent'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Payments table */}
              <div className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden glass-panel">
                {filteredPayments.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <p className="font-bold">No payments records found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">User</th>
                          <th className="p-4">Phone & Method</th>
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPayments.map(p => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-white">{p.user?.profile?.fullName || 'Guest User'}</p>
                              <p className="text-xs text-gray-400">{p.user?.email}</p>
                            </td>
                            <td className="p-4 text-xs text-gray-300">
                              <div>{p.user?.phone}</div>
                              <div className="text-gray-500 font-semibold">{p.paymentMethod}</div>
                            </td>
                            <td className="p-4 text-xs font-mono text-gray-400">{p.transactionId}</td>
                            <td className="p-4 text-sm font-bold text-white">{Number(p.amount)} ETB</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                p.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : p.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {p.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id, 'COMPLETED')}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                    title="Verify Completed"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id, 'FAILED')}
                                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                    title="Reject Payment"
                                  >
                                    <X className="h-4 w-4" />
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
            </div>
          )}

          {/* Abuse Reports */}
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

          {/* Membership Fees */}
          {tab === 'fees' && (
            <div className="max-w-md space-y-6 animate-fade-in">
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
