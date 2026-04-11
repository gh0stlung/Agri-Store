import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { User, ShieldCheck, Truck, Leaf } from 'lucide-react';

export const Login: React.FC = () => {
  const { push } = useNavigation();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0b1a0e]">

      {/* Static gradient background — no image, no scroll */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a0e] via-[#0f2d14] to-[#071209]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/6 rounded-full blur-2xl" />
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(52,211,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
      </div>

      <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center px-2">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_40px_rgba(52,211,153,0.15)] p-2">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-black text-white font-serif tracking-tight text-center leading-tight">
            New Nikhil<br />Khad Bhandar
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-8 bg-emerald-500/30" />
            <p className="text-emerald-400/50 text-[10px] font-bold uppercase tracking-[0.3em]">Choose Login Type</p>
            <div className="h-px w-8 bg-emerald-500/30" />
          </div>
        </div>

        {/* 3 Login Buttons */}
        <div className="w-full space-y-3">

          {/* Customer */}
          <button onClick={() => push('/user-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-emerald-500/10 border border-white/8 hover:border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/15 group-hover:scale-110 transition-transform shrink-0">
              <User size={20} className="text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-white text-sm">Customer Login</p>
              <p className="text-emerald-200/30 text-[11px] font-medium mt-0.5">Shop, order & track delivery</p>
            </div>
            <div className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
              <span className="text-lg font-black">›</span>
            </div>
          </button>

          {/* Admin */}
          <button onClick={() => push('/admin-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-blue-500/10 border border-white/8 hover:border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]">
            <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/15 group-hover:scale-110 transition-transform shrink-0">
              <ShieldCheck size={20} className="text-blue-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-white text-sm">Admin Login</p>
              <p className="text-blue-200/30 text-[11px] font-medium mt-0.5">Manage store & inventory</p>
            </div>
            <div className="text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
              <span className="text-lg font-black">›</span>
            </div>
          </button>

          {/* Delivery */}
          <button onClick={() => push('/delivery-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-orange-500/10 border border-white/8 hover:border-orange-500/30 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/15 group-hover:scale-110 transition-transform shrink-0">
              <Truck size={20} className="text-orange-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-white text-sm">Delivery Login</p>
              <p className="text-orange-200/30 text-[11px] font-medium mt-0.5">View & deliver assigned orders</p>
            </div>
            <div className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
              <span className="text-lg font-black">›</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center gap-2 opacity-20">
          <Leaf size={10} className="text-emerald-400" />
          <p className="text-emerald-100 text-[9px] font-bold tracking-[0.3em] uppercase">Est. 2005 • Ganjdundwara</p>
          <Leaf size={10} className="text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
