'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPaymentSuccessEmail } from '../lib/email';
import API from '../lib/api';
import { CreditCard, Smartphone, CheckCircle, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const { user, refreshUser } = useAuth();
  const [method, setMethod] = useState<'TELEBIRR' | 'CBE_BIRR'>('TELEBIRR');
  const [phone, setPhone] = useState(user?.phone || '');
  const [step, setStep] = useState(1); // 1 = input, 2 = USSD prompt, 3 = success
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState('');
  const [pin, setPin] = useState('');
  const [fee, setFee] = useState<number>(200);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data && res.data.membershipFee) {
          setFee(res.data.membershipFee);
        }
      } catch (err) {
        console.error('Failed to load membership fee:', err);
      }
    };
    fetchFee();
  }, []);

  const handleInitiate = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await API.post('/payments/initiate', {
        amount: fee,
        paymentMethod: method,
        phoneNumber: phone
      });
      setTxId(res.data.transactionId);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    try {
      await API.post('/payments/verify', {
        transactionId: txId,
        status: 'SUCCESS'
      });
      
      // Refresh Auth State
      await refreshUser();
      
      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Send Payment Success Email
      if (user) {
        await sendPaymentSuccessEmail(user.email, user.profile?.fullName || 'User', txId);
      }

      setStep(3);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to verify payment pin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-dark-surface border border-white/10 rounded-3xl overflow-hidden glass-panel relative flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Unlock Whaatachi Premium</span>
          </h3>
          {step !== 3 && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold">
              Close
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">One-Time Fee</span>
                <span className="text-4xl font-extrabold text-white mt-1 block">{fee} ETB</span>
                <span className="text-gray-500 text-xs mt-2 block">Unlock unlimited verified contact handles forever.</span>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select Gateway</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'TELEBIRR', name: 'Telebirr', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/5' },
                    { id: 'CBE_BIRR', name: 'CBE Birr', color: 'border-primary text-primary bg-primary/5' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as any)}
                      className={`py-4 px-3 rounded-2xl border-2 font-bold transition-all text-center cursor-pointer ${
                        method === m.id ? m.color : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Payment Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-primary transition-all text-sm"
                    placeholder="+2519xxxxxxxx"
                  />
                </div>
              </div>

              <button
                onClick={handleInitiate}
                disabled={loading || !phone}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-bold text-white hover:opacity-95 shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify & Pay {fee} ETB</span>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-fade-in flex flex-col items-center">
              {/* Simulated Mobile USSD Screen */}
              <div className="w-64 rounded-3xl bg-black border-4 border-gray-800 p-4 shadow-xl flex flex-col relative text-left">
                <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-4" />
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between">
                  <p className="text-xs text-gray-200 font-mono">
                    {method === 'TELEBIRR' ? 'Telebirr Payment push:' : 'CBE Birr Payment push:'}
                    <br />
                    Confirm payment of {fee} ETB to Whaatachi. Enter PIN to authorize.
                  </p>
                  <input
                    type="password"
                    maxLength={5}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full py-1.5 px-3 rounded border border-white/15 bg-black text-center font-mono text-white text-lg tracking-widest focus:outline-none"
                    placeholder="•••••"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 text-xs font-mono text-cyan-400">
                  <button onClick={onClose} className="hover:underline">Cancel</button>
                  <button onClick={handleVerify} disabled={pin.length < 4} className="hover:underline font-bold">Send</button>
                </div>
              </div>

              <p className="text-sm text-gray-400 max-w-xs">
                We sent a simulated payment verification push. Enter your PIN above to complete the payment.
              </p>
              
              <div className="flex items-center space-x-1.5 text-xs text-amber-500">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Simulated Sandbox Environment</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center animate-fade-in flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-emerald-400 mb-4 animate-bounce" />
              <h4 className="text-2xl font-extrabold text-white">Payment Completed!</h4>
              <p className="text-sm text-gray-400 mt-2 max-w-xs">
                Congratulations! Your Premium membership is now active. All female profiles have been unlocked.
              </p>
              <button
                onClick={onClose}
                className="mt-8 rounded-xl bg-white text-black font-bold px-8 py-3.5 hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
