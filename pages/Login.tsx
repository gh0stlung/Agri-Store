import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Lock, ArrowLeft, Loader2, Mail, Sprout } from 'lucide-react';
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#064E3B]">
      
      {/* Background Image with Motion */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop" 
            alt="Agriculture Background" 
            className="w-full h-full object-cover animate-ken-burns opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] via-[#064E3B]/80 to-[#064E3B]/40 mix-blend-multiply"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/40 to-transparent z-10"></div>

      <div className="relative z-20 w-full max-w-sm px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20">
            <ArrowLeft size={16} /> Back to Store
          </Link>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/50 relative group">
                <div className="absolute inset-0 bg-emerald-100 rounded-[24px] rotate-6 scale-90 -z-10 group-hover:rotate-12 transition-transform duration-500"></div>
                <Sprout size={40} className="text-[#064E3B] fill-emerald-100" />
            </div>
            <h1 className="text-3xl font-black text-white font-serif tracking-tight drop-shadow-md">Admin Portal</h1>
            <p className="text-emerald-100/90 text-sm font-medium mt-2 tracking-wide">New Nikhil Khad Bhandar</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] p-8 border border-white/50 relative overflow-hidden">
             {/* Top Highlight Line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
             
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-6 text-xs font-bold text-center border border-red-100 flex items-center justify-center gap-2 animate-fade-in">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none font-bold text-gray-800 placeholder-gray-400 transition-all text-sm"
                            placeholder="admin@store.com"
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none font-bold text-gray-800 placeholder-gray-400 transition-all text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-4 rounded-[16px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Secure Login</span>
                            <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
          </div>
          
          <div className="text-center mt-8">
              <p className="text-emerald-100/60 text-[10px] font-medium tracking-wider">
                  SECURE ADMIN GATEWAY • ENCRYPTED CONNECTION
              </p>
          </div>
      </div>
    </div>
  );
};