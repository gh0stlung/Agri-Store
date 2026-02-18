import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Lock, ArrowLeft, Loader2, Mail, Sprout, ShieldCheck } from 'lucide-react';
import { Link } from '../components/Link';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { replace } = useNavigation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('System Error: Database connection missing.');
      setLoading(false);
      return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Invalid credentials. Access denied.');
        } else {
            replace('/admin');
        }
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  return (
    // 'fixed inset-0' ensures it fills the window and 'overflow-hidden' prevents scrolling
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#00241B]">
      
      {/* Professional Agriculture Background */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599583733055-6b2f7f185e3c?auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture Background" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Heavy Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001E15] via-[#064E3B]/90 to-[#001E15]/80 mix-blend-multiply"></div>
          {/* Subtle Texture Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/40 rounded-full blur-[80px]"></div>

      <div className="relative z-20 w-full max-w-[320px] flex flex-col">
          
          {/* Back Button */}
          <div className="self-start mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold py-2 px-1">
                <ArrowLeft size={16} /> Back to Store
            </Link>
          </div>

          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/30">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white font-serif tracking-tight drop-shadow-md">Admin Portal</h1>
            <p className="text-emerald-100/50 text-xs font-medium mt-1 tracking-widest uppercase">Secure Access Only</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-6 border border-white/10 relative overflow-hidden">
             
             {/* Top Gloss Line */}
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
             
            {error && (
                <div className="bg-red-500/20 backdrop-blur-sm text-red-100 p-3 rounded-xl mb-4 text-[11px] font-bold text-center border border-red-500/30 flex items-center justify-center gap-2 animate-fade-in">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_5px_red]"></span>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">Email ID</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/50 group-focus-within:text-emerald-400 transition-colors">
                            <Mail size={16} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none font-medium text-white placeholder-white/20 transition-all text-sm backdrop-blur-md"
                            placeholder="admin@nikhilkhad.com"
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/50 group-focus-within:text-emerald-400 transition-colors">
                            <Lock size={16} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none font-medium text-white placeholder-white/20 transition-all text-sm backdrop-blur-md"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-[14px] shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-2 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400/20"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <span>Access Dashboard</span>
                    )}
                </button>
            </form>
          </div>
          
          <div className="text-center mt-6 opacity-40">
              <p className="text-emerald-100 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                  New Nikhil Khad Bhandar
                  <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
              </p>
          </div>
      </div>
    </div>
  );
};