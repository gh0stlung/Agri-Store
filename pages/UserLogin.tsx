import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowLeft, Loader2, Mail, Eye, EyeOff, User, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

type Step = 'auth' | 'profile';

export const UserLogin: React.FC = () => {
  const { push, replace } = useNavigation();
  const [step, setStep] = useState<Step>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newUserId, setNewUserId] = useState('');

  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && form.password !== form.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (!supabase) throw new Error('Database not connected');

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password.trim()
        });
        if (error) throw error;
        if (data?.user) replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password.trim()
        });
        if (error) throw error;
        if (data?.user) {
          setNewUserId(data.user.id);
          setStep('profile'); // Go to profile step
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newUserId) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: newUserId,
        name: profile.name.trim(),
        mobile: profile.phone.trim(),
        address: profile.address.trim()
      });
      if (error) throw error;
      localStorage.setItem(`profile_${newUserId}`, JSON.stringify({
        name: profile.name.trim(),
        mobile: profile.phone.trim(),
        address: profile.address.trim()
      }));
      replace('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── PROFILE STEP ──
  if (step === 'profile') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0b1a0e]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a0e] via-[#0f2d14] to-[#071209]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[320px] px-2">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <User size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white font-serif">Complete Your Profile</h2>
            <p className="text-emerald-200/40 text-xs font-medium mt-1">Required to place orders</p>
          </div>

          {error && (
            <div className="bg-red-500/15 text-red-300 p-3 rounded-xl mb-4 text-xs font-bold text-center border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40" size={15} />
              <input required type="text" value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm"
                placeholder="Full Name *" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40" size={15} />
              <input required type="tel" value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm"
                placeholder="Phone Number *" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-4 text-emerald-400/40" size={15} />
              <textarea required rows={3} value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm resize-none"
                placeholder="Full Address *" />
            </div>
            <button type="submit" disabled={savingProfile}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black py-4 rounded-[14px] shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-60 mt-1">
              {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {savingProfile ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── AUTH STEP ──
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0b1a0e]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a0e] via-[#0f2d14] to-[#071209]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-2xl" />
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-[320px]">

          {/* Back */}
          <button onClick={() => push('/login')}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-bold uppercase tracking-widest mb-6">
            <ArrowLeft size={14} /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <User size={24} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-black text-white font-serif">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-emerald-200/30 text-xs font-medium mt-1">
              {isLogin ? 'Login to your account' : 'Join thousands of farmers'}
            </p>
          </div>

          {/* Toggle Login/Signup — VERY VISIBLE */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-5 border border-white/8">
            <button onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-white/30 hover:text-white/60'}`}>
              Login
            </button>
            <button onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${!isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-white/30 hover:text-white/60'}`}>
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/15 text-red-300 p-3 rounded-xl mb-4 text-xs font-bold text-center border border-red-500/20">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button onClick={handleGoogleLogin} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-black py-3.5 rounded-[14px] shadow-md active:scale-[0.98] transition-all mb-4 disabled:opacity-60 text-sm">
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-gray-600" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecting...' : `Continue with Google`}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40" size={15} />
              <input type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm"
                placeholder="Email address" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40" size={15} />
              <input type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 pr-11 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm"
                placeholder="Password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} onMouseDown={e => e.preventDefault()}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40" size={15} />
                <input type={showConfirm ? 'text' : 'password'} required value={form.confirm}
                  onChange={e => setForm({...form, confirm: e.target.value})}
                  className="w-full pl-10 pr-11 py-3.5 bg-black/30 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/40 outline-none font-medium text-white placeholder-white/20 text-sm"
                  placeholder="Confirm password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} onMouseDown={e => e.preventDefault()}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black py-4 rounded-[14px] shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/15 text-[10px] font-medium mt-4">
            By continuing you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
};
