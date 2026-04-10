import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { User, ShieldCheck, Truck, ArrowLeft, Leaf } from 'lucide-react';

export const Login: React.FC = () => {
  const { push } = useNavigation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0b1120]">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1599583733055-6b2f7f185e3c?auto=format&fit=crop&w=1920&q=80" 
          alt="Agriculture Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#1e293b]/90 to-[#0b1120]/80"></div>
      </div>

      <div className="relative z-20 w-full max-w-[320px] flex flex-col items-center">

        {/* Back */}
        <div className="self-start mb-6">
          <button onClick={() => push('/')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold py-2 px-1">
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>

        {/* Logo */}
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner p-1">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
        </div>
        <h1 className="text-2xl font-black text-white font-serif tracking-tight drop-shadow-md mb-1">Welcome Back</h1>
        <p className="text-emerald-100/50 text-xs font-medium mb-10 tracking-widest uppercase">Choose how to continue</p>

        {/* Three Buttons */}
        <div className="w-full space-y-4">

          {/* User Login */}
          <button
            onClick={() => push('/user-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
              <User size={24} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-black text-white text-base">Customer</p>
              <p className="text-emerald-200/40 text-xs font-medium mt-0.5">Shop, order & track delivery</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-emerald-400 text-lg font-black">→</span>
            </div>
          </button>

          {/* Admin Login */}
          <button
            onClick={() => push('/admin-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform shrink-0">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-black text-white text-base">Admin</p>
              <p className="text-blue-200/40 text-xs font-medium mt-0.5">Manage store & inventory</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span className="text-blue-400 text-lg font-black">→</span>
            </div>
          </button>

          {/* Delivery Login */}
          <button
            onClick={() => push('/delivery-login')}
            className="w-full group relative overflow-hidden bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/40 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform shrink-0">
              <Truck size={24} className="text-orange-400" />
            </div>
            <div className="text-left">
              <p className="font-black text-white text-base">Delivery Man</p>
              <p className="text-orange-200/40 text-xs font-medium mt-0.5">View & deliver assigned orders</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span className="text-orange-400 text-lg font-black">→</span>
            </div>
          </button>

        </div>

        <div className="mt-10 opacity-30">
          <p className="text-emerald-100 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <Leaf size={10} /> New Nikhil Khad Bhandar <Leaf size={10} />
          </p>
        </div>
      </div>
    </div>
  );
};
