import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Loader2, Delete, User, Phone } from 'lucide-react';

const DELIVERY_KEY = 'nnkb_delivery_locked';

// This component is ONLY shown when no delivery staff is locked in
export const DeliveryLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ name: string; phone: string } | null>(null);
  const [checking, setChecking] = useState(true);

  // On mount — if already locked in, redirect to dashboard
  useEffect(() => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data?.id) {
          window.location.replace('/delivery');
          return;
        }
      } catch(e) {}
    }
    setChecking(false);
  }, []);

  // Live PIN preview
  useEffect(() => {
    const preview = async () => {
      if (pin.length >= 4 && supabase) {
        const { data } = await supabase
          .from('delivery_staff')
          .select('name, phone')
          .eq('pin', pin)
          .eq('is_active', true)
          .single();
        setStaffInfo(data || null);
      } else {
        setStaffInfo(null);
      }
    };
    preview();
  }, [pin]);

  // Auto submit at 6 digits
  useEffect(() => {
    if (pin.length === 6) handleLogin();
  }, [pin]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin(prev => prev + d);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setStaffInfo(null);
  };

  const handleLogin = async () => {
    if (pin.length < 4 || loading) return;
    setLoading(true);
    setError('');
    try {
      if (!supabase) throw new Error('Database not connected');
      const { data, error } = await supabase
        .from('delivery_staff')
        .select('*')
        .eq('pin', pin)
        .eq('is_active', true)
        .single();
      if (error || !data) {
        setError('Wrong PIN. Try again.');
        triggerShake();
        setPin('');
        setLoading(false);
        return;
      }
      // Lock permanently
      localStorage.setItem(DELIVERY_KEY, JSON.stringify(data));
      window.location.replace('/delivery');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      triggerShake();
      setPin('');
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-orange-400" />
    </div>
  );

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col overflow-hidden select-none">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-600/4 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 pt-16 pb-8">

        {/* Top — Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-orange-500/10 rounded-[20px] flex items-center justify-center border border-orange-500/20 shadow-[0_0_30px_rgba(251,146,60,0.1)]">
            <Truck size={30} className="text-orange-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Delivery Portal</h1>
          <p className="text-orange-200/30 text-[11px] uppercase tracking-widest font-bold">Enter PIN to Access</p>
        </div>

        {/* Middle — PIN + preview */}
        <div className="w-full flex flex-col items-center gap-4">

          {/* Staff name preview */}
          <div className={`w-full transition-all duration-300 ${staffInfo ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                <User size={16} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{staffInfo?.name}</p>
                <p className="text-orange-300/50 text-[10px] font-bold flex items-center gap-1">
                  <Phone size={9} />{staffInfo?.phone}
                </p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
            </div>
          </div>

          {/* PIN dots */}
          <div className={`flex gap-2.5 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                i < pin.length
                  ? 'bg-orange-500 border-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.5)]'
                  : 'bg-white/5 border-white/10'
              }`}>
                {i < pin.length && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
              {error}
            </p>
          )}
        </div>

        {/* Bottom — Keypad */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {digits.map((d, i) => {
              if (d === '') return <div key={i} />;
              if (d === 'del') return (
                <button key={i} onClick={handleDelete}
                  className="h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-orange-300 hover:bg-white/10 active:scale-95 transition-all">
                  <Delete size={18} />
                </button>
              );
              return (
                <button key={i} onClick={() => handleDigit(d)} disabled={loading}
                  className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white font-black text-xl hover:bg-orange-500/10 hover:border-orange-500/20 active:scale-95 transition-all disabled:opacity-50">
                  {loading && pin.length >= 4 ? <Loader2 size={18} className="animate-spin mx-auto" /> : d}
                </button>
              );
            })}
          </div>

          {/* Manual confirm for 4-5 digit PINs */}
          {pin.length >= 4 && pin.length < 6 && (
            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,146,60,0.25)]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
              {loading ? 'Verifying...' : 'Enter Dashboard'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          25%{transform:translateX(-8px)}
          75%{transform:translateX(8px)}
        }
      `}</style>
    </div>
  );
};
