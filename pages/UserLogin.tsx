import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowLeft, Loader2, Mail, Eye, EyeOff, User } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useSearchParams } from 'react-router-dom';

export const UserLogin: React.FC = () => {
  const { push } = useNavigation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setIsLogin(mode !== 'signup'); }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (!supabase) throw new Error('Database not connected.');

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
        if (error) { setError(error.message); setLoading(false); return; }
        if (data?.user) { window.location.href = '/'; }
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });
        if (error) { setError(error.message); setLoading(false); return; }
        if (data?.user) {
          alert("Signed up! Please check your email for confirmation.");
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0b1120]">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1599583733055-6b2f7f185e3c?auto=format&fit=crop&w=1920&q=80" alt="bg" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#1e293b]/90 to-[#0b1120]/80"></div>
      </div>

      <div className="relative z-20 w-full max-w-[320px] flex flex-col">
        <div className="self-start mb-6">
          <button onClick={() => push('/login')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold py-2 px-1">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <User size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white font-serif">{isLogin ? 'Customer Login' : 'Create Account'}</h1>
          <p className="text-emerald-100/50 text-xs font-medium mt-1 tracking-widest uppercase">
            {isLogin ? 'Welcome back!' : 'Join us today'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[28px] p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>

          {error && (
            <div className="bg-red-500/20 text-red-100 p-3 rounded-xl mb-4 text-[11px] font-bold text-center border border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/50" size={16} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 outline-none font-medium text-white placeholder-white/20 text-sm"
                  placeholder="email@example.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/50" size={16} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 outline-none font-medium text-white placeholder-white/20 text-sm"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} onMouseDown={e => e.preventDefault()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/50 hover:text-emerald-400 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/50" size={16} />
                  <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 outline-none font-medium text-white placeholder-white/20 text-sm"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseDown={e => e.preventDefault()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/50 hover:text-emerald-400 transition-colors">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-3.5 rounded-[14px] shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-2 text-sm disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>{isLogin ? 'Login' : 'Sign Up'}</span>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-200/50 hover:text-emerald-200 text-[10px] font-bold uppercase tracking-widest transition-colors">
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
