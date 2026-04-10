import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Loader2, Delete, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const DeliveryLogin: React.FC = () => {
  const { push } = useNavigation();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin(prev => prev + d);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

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

      // Store delivery staff session in sessionStorage
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

  // Auto-submit when PIN reaches 6 digits
  React.useEffect(() => {
    if (pin.length === 6) handleLogin();
  }, [pin]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,146,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center">
        {/* Back button */}
        <button
          onClick={() => push('/')}
          className="self-start mb-8 flex items-center gap-2 text-orange-200/40 hover:text-orange-200/70 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Store
        </button>

        {/* Logo */}
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-6 border border-orange-500/20 shadow-[0_0_40px_rgba(251,146,60,0.15)]">
          <Truck size={36} className="text-orange-400" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Delivery Login</h1>
        <p className="text-orange-200/40 text-xs uppercase tracking-widest font-bold mb-8">Enter Your PIN</p>

        {/* PIN Display */}
        <div
          className={`flex gap-3 mb-8 transition-all ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
          style={shake ? { animation: 'shake 0.5s ease' } : {}}
        >
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                i < pin.length
                  ? 'bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.4)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {i < pin.length && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
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
              <button
                key={i}
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-300 hover:bg-white/10 active:scale-95 transition-all"
              >
                <Delete size={20} />
              </button>
            );
            return (
              <button
                key={i}
                onClick={() => handleDigit(d)}
                disabled={loading}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-orange-500/10 hover:border-orange-500/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading && pin.length === 6 ? <Loader2 size={20} className="animate-spin mx-auto" /> : d}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-orange-200/20 text-[10px] font-bold uppercase tracking-widest">
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
