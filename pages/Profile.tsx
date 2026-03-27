import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, Save, User, Phone, LogOut, 
  ChevronRight, Settings, ShieldCheck, Moon, Bell,
  Heart, HelpCircle, Sun
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';

import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

const Profile: React.FC = () => {
  const { user: authUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(authUser);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      console.log("USER:", user);
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;
    
    // Validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        phone: formData.phone
        // Removed address to fix "address column not found" error
      })
      .eq('id', user.id);

    if (error) {
      showToast("Error saving profile: " + error.message, "error");
    } else {
      showToast("Profile updated successfully!", "success");
    }
    setSaving(false);
  };

  if (loading) return (
    <AppLayout activePage="profile">
      <div className="max-w-md mx-auto space-y-2 pb-24 px-4 pt-2">
        <div className="bg-[var(--card-bg)] rounded-[24px] p-3 shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 skeleton rounded-2xl" />
            <div className="flex-1 space-y-1.5">
              <div className="h-5 w-3/4 bg-gray-100 dark:bg-gray-700 skeleton rounded" />
              <div className="h-2.5 w-1/2 bg-gray-100 dark:bg-gray-700 skeleton rounded" />
              <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 skeleton rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 w-28 bg-gray-100 dark:bg-gray-800 skeleton rounded ml-2" />
          <div className="bg-white dark:bg-gray-800 rounded-[28px] p-3 shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-16 bg-gray-100 dark:bg-gray-700 skeleton rounded ml-1" />
                <div className="h-9 w-full bg-gray-100 dark:bg-gray-700 skeleton rounded-[16px]" />
              </div>
            ))}
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 skeleton rounded-[18px]" />
          </div>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout activePage="profile">
      <div className="max-w-md mx-auto space-y-2.5 pb-24 px-4 pt-2">
        
        {/* Login Prompt for Guests */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] rounded-[28px] p-6 shadow-[var(--shadow-soft)] border border-[var(--border-color)] text-center flex flex-col items-center gap-3 mt-2"
          >
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)] font-serif">You're not logged in</h2>
              <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] mx-auto">Login to save your details and view orders</p>
            </div>
            <button 
              onClick={() => push('/login')}
              className="w-full bg-[var(--primary-btn)] text-white font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-all text-xs"
            >
              Go to Login
            </button>
          </motion.div>
        )}

        {/* Profile Header Card (Only for logged in) */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] rounded-[28px] p-3 shadow-[var(--shadow-soft)] border border-[var(--border-color)] relative overflow-hidden mt-2"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
            
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl flex items-center justify-center text-[var(--text-primary)] shadow-inner border-4 border-[var(--card-bg)]">
                  <User size={28} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-[var(--card-bg)] flex items-center justify-center shadow-sm">
                  <ShieldCheck size={9} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-[var(--text-primary)] font-serif tracking-tight truncate">
                  {formData.name || 'Your Profile'}
                </h2>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
                  {user?.email}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Session</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Info Section (Only for logged in) */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 px-2">
              <User size={10} className="text-[var(--text-primary)]" />
              <h3 className="text-[8px] font-black text-[var(--text-primary)] uppercase tracking-widest">Personal Information</h3>
            </div>

            <div className="bg-[var(--card-bg)] rounded-[24px] p-2.5 shadow-[var(--shadow-soft)] border border-[var(--border-color)] space-y-1.5">
              <form onSubmit={handleSave} className="space-y-1.5">
                <div className="space-y-0.5">
                  <label className="text-[7px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={12} />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-3 h-[40px] rounded-[12px] border border-[var(--border-color)] focus:ring-1 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] outline-none bg-[var(--input-bg)] font-bold text-[var(--text-body)] transition-all text-xs"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-0.5">
                  <label className="text-[7px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={12} />
                    <input 
                      type="tel" 
                      className="w-full pl-9 pr-3 h-[40px] rounded-[12px] border border-[var(--border-color)] focus:ring-1 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] outline-none bg-[var(--input-bg)] font-bold text-[var(--text-body)] transition-all text-xs"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-[var(--primary-btn)] hover:opacity-90 text-white font-bold h-[40px] rounded-[12px] shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs mt-1"
                >
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {saving ? 'Updating...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Preferences Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-2 px-2">
            <Settings size={10} className="text-[var(--text-primary)]" />
            <h3 className="text-[8px] font-black text-[var(--text-primary)] uppercase tracking-widest">Preferences</h3>
          </div>

          <div className="bg-[var(--card-bg)] rounded-[24px] p-0.5 shadow-[var(--shadow-soft)] border border-[var(--border-color)] overflow-hidden">
            <div className="divide-y divide-[var(--border-color)]/30">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-50 text-gray-600'}`}>
                    <Moon size={12} />
                  </div>
                  <p className="text-[10px] font-bold text-[var(--text-body)]">Dark Mode</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 flex items-center p-0.5 ${theme === 'dark' ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm"
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  >
                    {theme === 'dark' ? <Moon size={10} className="text-indigo-600" /> : <Sun size={10} className="text-amber-500" />}
                  </motion.div>
                </button>
              </div>

              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[var(--input-bg)] rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <Bell size={12} />
                  </div>
                  <p className="text-[10px] font-bold text-[var(--text-body)]">Notifications</p>
                </div>
                <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions (Only for logged in) */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-1 gap-2">
              <button className="bg-[var(--card-bg)] border border-[var(--border-color)] p-2.5 rounded-[16px] flex items-center justify-between shadow-sm hover:opacity-80 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">My Wishlist</span>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            </div>

            <button 
              onClick={() => signOut()}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-black py-2.5 rounded-[16px] shadow-sm transition-all flex items-center justify-center gap-2 border border-red-500/20 active:scale-[0.98]"
            >
              <LogOut size={14} />
              <span className="text-xs font-serif">Sign Out</span>
            </button>
          </motion.div>
        )}

        {/* Help & Support */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors">
            <HelpCircle size={12} />
            Support
          </button>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <button className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors">
            <ShieldCheck size={12} />
            Privacy
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
