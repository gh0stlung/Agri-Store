import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Loader2, Delete, ArrowLeft, User, Phone } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const DeliveryLogin: React.FC = () => {
  const { push } = useNavigation();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ name: string; phone: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin(prev => prev + d);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setStaffInfo(null);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Preview staff name as PIN is entered (4+ digits)
  React.useEffect(() => {
    const preview = async () => {
      if (pin.length >= 4 && supabase) {
        setLookingUp(true);
        const { data } = await supabase
          .from('delivery_staff')
          .select('name, phone')
          .eq('pin', pin)
          .eq('is_active', true)
          .single();
        setStaffInfo(data || null);
        setLookingUp(false);
      } else {
        setStaffInfo(null);
      }
    };
    preview();
  }, [pin]);

  const handleLogin = async () => {
    if (pin.length < 4) return;
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
        setError('Invalid PIN. Try again.');
        triggerShake();
        setPin('');
        setLoading(false);
        return;
      }
      sessionStorage.setItem('delivery_staff', JSON.stringify(data));
      push('/delivery');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      triggerShake();
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (pin.length === 6) handleLogin();
  }, [pin]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center">
        <button onClick={() => push('/login')}
          className="self-start mb-8 flex items-center gap-2 text-orange-200/40 hover:text-orange-200/70 transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-4 border border-orange-500/20 shadow-[0_0_40px_rgba(251,146,60,0.15)]">
          <Truck size={36} className="text-orange-400" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Delivery Login</h1>
        <p className="text-orange-200/40 text-xs uppercase tracking-widest font-bold mb-6">Enter Your PIN</p>

        {/* Staff preview card */}
        <div className={`w-full mb-4 transition-all duration-300 ${staffInfo ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <User size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm">{staffInfo?.name}</p>
              <p className="text-orange-300/50 text-[10px] font-bold flex items-center gap-1">
                <Phone size={9} /> {staffInfo?.phone}
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-3 mb-6 ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
              i < pin.length ? 'bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.4)]' : 'bg-white/5 border-white/10'
            }`}>
              {i < pin.length && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-xs font-bold mb-4 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            {error}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {digits.map((d, i) => {
            if (d === '') return <div key={i} />;
            if (d === 'del') return (
              <button key={i} onClick={handleDelete}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-300 hover:bg-white/10 active:scale-95 transition-all">
                <Delete size={20} />
              </button>
            );
            return (
              <button key={i} onClick={() => handleDigit(d)} disabled={loading}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-orange-500/10 hover:border-orange-500/30 active:scale-95 transition-all disabled:opacity-50">
                {loading && pin.length === 6 ? <Loader2 size={20} className="animate-spin mx-auto" /> : d}
              </button>
            );
          })}
        </div>

        {/* Login button (for < 6 digit PINs) */}
        {pin.length >= 4 && pin.length < 6 && (
          <button onClick={handleLogin} disabled={loading}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,146,60,0.3)]">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
            {loading ? 'Verifying...' : 'Login'}
          </button>
        )}

        <p className="mt-6 text-orange-200/20 text-[10px] font-bold uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
