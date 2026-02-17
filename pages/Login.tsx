import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.ts';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin', { replace: true });
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login failed:", error);
            setError('Invalid credentials. Please try again.');
        } else {
            // Successful login -> Redirect to Admin
            navigate('/admin', { replace: true });
        }
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  if (checkingSession) {
      return (
          <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
              <Loader2 className="animate-spin text-[var(--text-primary)]" size={32} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 relative">
      <Link to="/" className="absolute top-6 left-6 p-2 rounded-full bg-white shadow-sm border border-[#E7E5E4] text-[var(--text-primary)]">
        <ArrowLeft size={24} />
      </Link>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#ECFDF5] text-[#064E3B] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-premium)] transform rotate-3">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] font-serif mb-2">Admin Portal</h1>
          <p className="text-[#78350F] font-medium opacity-80">Restricted access for store managers.</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-[var(--shadow-premium)] border border-[#E7E5E4] p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold text-center border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0] font-bold text-[var(--text-body)] transition-all"
                placeholder="admin@store.com"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0] font-bold text-[var(--text-body)] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064E3B] hover:bg-[#065E4B] text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:scale-100 mt-4 flex justify-center items-center gap-2"
            >
              {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verifying...
                  </>
              ) : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};