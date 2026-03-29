import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../components/AppLayout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Globe,
  Clock, ShoppingCart, CheckCircle2, XCircle, 
  RefreshCw, Server, AlertTriangle,
  ShieldCheck, ShieldAlert, DatabaseZap, Package,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

// Helper for animated counter
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1000; // 1s
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(end * progress);
      setCount(currentCount);

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{count}</span>;
};

export const Developer: React.FC = () => {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState<{ status: 'OK' | 'ERROR' | 'IDLE', message: string }>({ status: 'IDLE', message: '' });
  const [counts, setCounts] = useState({ products: 0, orders: 0, updates: 0 });
  const [apiCheck, setApiCheck] = useState<{ products: boolean | null, orders: boolean | null }>({ products: null, orders: null });
  const [lastError, setLastError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  const performCheck = useCallback(async () => {
    setIsRefreshing(true);
    setLastError(null);
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      // 1. Database Health Check (Counts)
      const [pRes, oRes, uRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('updates').select('*', { count: 'exact', head: true })
      ]);

      if (pRes.error || oRes.error || uRes.error) {
        const err = pRes.error || oRes.error || uRes.error;
        throw err;
      }

      setCounts({
        products: pRes.count || 0,
        orders: oRes.count || 0,
        updates: uRes.count || 0
      });

      // 2. API Response Check (Fetch minimal data)
      const [pApi, oApi] = await Promise.all([
        supabase.from('products').select('id').limit(1),
        supabase.from('orders').select('id').limit(1)
      ]);

      setApiCheck({
        products: !pApi.error,
        orders: !oApi.error
      });

      setDbStatus({ status: 'OK', message: 'All systems operational' });
      setLastCheckTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('System check failed:', err);
      setLastError(err.message || 'Unknown connection error');
      setDbStatus({ status: 'ERROR', message: err.message || 'Database connection failed' });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    performCheck();
  }, [performCheck]);

  const StatusCard = ({ title, status, message, icon: Icon, isOk }: any) => (
    <motion.div 
      whileHover={{ y: -5, boxShadow: isOk ? "0 10px 30px rgba(20,184,166,0.15)" : "0 10px 30px rgba(239,68,68,0.15)" }}
      className={`bg-black/40 backdrop-blur-md p-6 rounded-2xl border ${isOk ? 'border-teal-500/30' : 'border-red-500/30'} flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${isOk ? 'from-teal-500/10' : 'from-red-500/10'} to-transparent rounded-bl-full pointer-events-none`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${isOk ? 'bg-teal-950/50 text-teal-400' : 'bg-red-950/50 text-red-400'}`}>
          <Icon size={24} className={isOk ? 'animate-pulse' : ''} />
        </div>
        <div className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${isOk ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {status}
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <p className={`text-2xl font-black ${isOk ? 'text-white' : 'text-red-400'} drop-shadow-md`}>{message}</p>
      </div>
    </motion.div>
  );

  return (
    <AppLayout activePage="profile" pageTitle="Developer Console">
      <div className="min-h-screen bg-[#020617] text-teal-500 font-mono relative overflow-hidden pb-24">
        {/* Background Grid & Noise */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-[#020617] to-[#020617] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-8 space-y-8">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-black/40 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(20,184,166,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Terminal size={20} className="text-teal-400" />
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em]">System Monitoring Panel</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                  DEV CONSOLE
                </h2>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-2 bg-teal-950/50 px-3 py-1.5 rounded-full border border-teal-500/20">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,1)]"></div>
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">Live</span>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(20,184,166,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={performCheck}
                  disabled={isRefreshing}
                  className="p-3 bg-teal-950/40 border border-teal-500/40 rounded-xl text-teal-400 hover:bg-teal-900/60 transition-colors"
                >
                  <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                </motion.button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-teal-600/80 uppercase tracking-widest">
              <Clock size={14} />
              LAST_SYNC: <span className="text-teal-400">{lastCheckTime || 'NEVER'}</span>
            </div>
          </motion.div>

          {/* Connection & Auth Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusCard 
              title="DB_STATUS"
              status={dbStatus.status}
              message={dbStatus.status === 'OK' ? 'CONNECTED' : 'ERROR'}
              icon={Globe}
              isOk={dbStatus.status === 'OK'}
            />
            <StatusCard 
              title="AUTH_SESSION"
              status={user ? 'OK' : 'ERROR'}
              message={user ? 'ACTIVE' : 'NONE'}
              icon={user ? ShieldCheck : ShieldAlert}
              isOk={!!user}
            />
          </div>

          {/* Database Health */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.05)] relative"
          >
            <div className="flex items-center gap-3 mb-8">
              <DatabaseZap size={20} className="text-teal-400" />
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.2em]">Database Health</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/30 to-transparent ml-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center relative group py-4">
                <p className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)] group-hover:text-teal-300 transition-colors">
                  <AnimatedCounter value={counts.products} />
                </p>
                <p className="text-[10px] font-bold text-teal-600 uppercase mt-3 tracking-[0.2em]">Total Products</p>
              </motion.div>
              
              <div className="relative py-4">
                <div className="hidden md:block absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent"></div>
                <div className="hidden md:block absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent"></div>
                <div className="md:hidden absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
                <div className="md:hidden absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
                <motion.div whileHover={{ scale: 1.05 }} className="text-center group">
                  <p className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)] group-hover:text-teal-300 transition-colors">
                    <AnimatedCounter value={counts.orders} />
                  </p>
                  <p className="text-[10px] font-bold text-teal-600 uppercase mt-3 tracking-[0.2em]">Total Orders</p>
                </motion.div>
              </div>
              
              <motion.div whileHover={{ scale: 1.05 }} className="text-center group py-4">
                <p className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)] group-hover:text-teal-300 transition-colors">
                  <AnimatedCounter value={counts.updates} />
                </p>
                <p className="text-[10px] font-bold text-teal-600 uppercase mt-3 tracking-[0.2em]">System Updates</p>
              </motion.div>
            </div>
          </motion.div>

          {/* API Response Check */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.05)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity size={20} className="text-teal-400" />
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.2em]">Live System Checks</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/30 to-transparent ml-4"></div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'PRODUCTS_ENDPOINT', icon: Package, status: apiCheck.products },
                { name: 'ORDERS_ENDPOINT', icon: ShoppingCart, status: apiCheck.orders }
              ].map((api, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-teal-950/20 border border-teal-900/50 hover:bg-teal-900/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-black/50 rounded-lg border border-teal-900/50 group-hover:border-teal-500/50 transition-colors">
                      <api.icon size={18} className="text-teal-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 tracking-wider">{api.name}</span>
                  </div>
                  
                  {api.status === null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-teal-600 tracking-widest">TESTING...</span>
                    </div>
                  ) : api.status ? (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20"
                    >
                      <CheckCircle2 size={16} className="animate-pulse" />
                      <span className="text-[10px] font-bold tracking-widest">200 OK</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"
                    >
                      <XCircle size={16} />
                      <span className="text-[10px] font-bold tracking-widest">FAILED</span>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Error Visibility */}
          <AnimatePresence>
            {lastError && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="bg-red-950/30 backdrop-blur-md border border-red-500/40 rounded-2xl p-6 flex gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.15)] overflow-hidden"
              >
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400 shrink-0">
                  <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-2">System Alert</h4>
                  <p className="text-sm font-mono text-red-300/80 leading-relaxed break-words">{lastError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Context */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0f1a] backdrop-blur-xl p-8 rounded-2xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.05)] font-mono relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/50 to-transparent"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Terminal size={20} className="text-teal-400" />
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.2em]">Secure Context</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center">
                <span className="text-teal-600 w-32">user.email</span>
                <span className="text-teal-400 mr-2">=</span>
                <span className="text-white">"{user?.email || 'null'}"</span>
              </div>
              <div className="flex items-center">
                <span className="text-teal-600 w-32">user.role</span>
                <span className="text-teal-400 mr-2">=</span>
                <span className="text-teal-300">"admin"</span>
              </div>
              <div className="flex items-center">
                <span className="text-teal-600 w-32">session.status</span>
                <span className="text-teal-400 mr-2">=</span>
                <span className="text-green-400">"active"</span>
              </div>
              <div className="flex items-center mt-6 pt-6 border-t border-teal-900/50">
                <span className="text-teal-500 animate-pulse">root@system:~#</span>
                <span className="w-2 h-4 bg-teal-400 ml-2 animate-[pulse_1s_step-end_infinite]"></span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={performCheck}
              disabled={isRefreshing}
              className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-teal-500/40 rounded-2xl py-6 flex flex-col items-center justify-center gap-3 group transition-all disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <RefreshCw size={24} className={`text-teal-400 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="text-xs font-bold text-teal-300 uppercase tracking-[0.2em]">Refresh Data</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={performCheck}
              disabled={isRefreshing}
              className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-teal-500/40 rounded-2xl py-6 flex flex-col items-center justify-center gap-3 group transition-all disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Server size={24} className="text-teal-400 group-hover:animate-pulse" />
              <span className="text-xs font-bold text-teal-300 uppercase tracking-[0.2em]">Test Connection</span>
            </motion.button>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
};


