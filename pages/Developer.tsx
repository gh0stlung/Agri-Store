import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../components/AppLayout';
import { motion } from 'motion/react';
import { 
  Terminal, Globe, User, 
  Clock, ShoppingCart, CheckCircle2, XCircle, 
  RefreshCw, Server, AlertTriangle,
  ShieldCheck, ShieldAlert, Zap, DatabaseZap, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

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

  const StatusCard = ({ title, status, message, icon: Icon, colorClass }: any) => (
    <div className="bg-black/40 p-5 rounded-none border border-green-900/50 shadow-[0_0_10px_rgba(21,128,61,0.1)] space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 ${colorClass.text}`}>
          <Icon size={20} />
        </div>
        <div className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider ${colorClass.text}`}>
          {status}
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-mono text-green-700 uppercase tracking-widest">{title}</h3>
        <p className="text-sm font-mono text-green-500 mt-1 truncate">{message}</p>
      </div>
    </div>
  );

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'OK': return { text: 'text-green-500' };
      case 'ERROR': return { text: 'text-red-500' };
      case 'WARNING': return { text: 'text-yellow-500' };
      default: return { text: 'text-green-700' };
    }
  };

  return (
    <AppLayout activePage="profile" pageTitle="Developer Console">
      <div className="max-w-md mx-auto space-y-5 pb-24 px-4 font-mono bg-black min-h-screen text-green-500">
        
        {/* Header Section */}
        <div className="bg-black border-b border-green-900/50 p-8 text-green-500 relative shadow-[0_0_20px_rgba(21,128,61,0.2)]">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={18} className="text-green-500" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">System Monitoring</span>
              </div>
              <h2 className="text-3xl font-black">DEV_CONSOLE</h2>
            </div>
            <button 
              onClick={performCheck}
              disabled={isRefreshing}
              className={`p-3 border border-green-900/50 hover:bg-green-950 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={20} className="text-green-500" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-green-700 uppercase tracking-widest">
            <Clock size={12} />
            LAST_CHECK: {lastCheckTime || 'NEVER'}
          </div>
        </div>

        {/* Connection & Auth Status */}
        <div className="grid grid-cols-2 gap-3">
          <StatusCard 
            title="DB_STATUS"
            status={dbStatus.status}
            message={dbStatus.status === 'OK' ? 'CONNECTED' : 'ERROR'}
            icon={Globe}
            colorClass={getStatusColors(dbStatus.status)}
          />
          <StatusCard 
            title="AUTH_SESSION"
            status={user ? 'OK' : 'ERROR'}
            message={user ? 'ACTIVE' : 'NONE'}
            icon={user ? ShieldCheck : ShieldAlert}
            colorClass={getStatusColors(user ? 'OK' : 'ERROR')}
          />
        </div>

        {/* Database Health */}
        <div className="bg-black/40 p-6 border border-green-900/50 shadow-[0_0_10px_rgba(21,128,61,0.1)]">
          <div className="flex items-center gap-2 mb-6">
            <DatabaseZap size={18} className="text-green-500" />
            <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-widest">DATABASE_HEALTH</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-green-500">{counts.products}</p>
              <p className="text-[9px] font-bold text-green-700 uppercase mt-1">PRODUCTS</p>
            </div>
            <div className="text-center border-l border-r border-green-900/50">
              <p className="text-2xl font-black text-green-500">{counts.orders}</p>
              <p className="text-[9px] font-bold text-green-700 uppercase mt-1">ORDERS</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-500">{counts.updates}</p>
              <p className="text-[9px] font-bold text-green-700 uppercase mt-1">UPDATES</p>
            </div>
          </div>
        </div>

        {/* API Response Check */}
        <div className="bg-black/40 p-6 border border-green-900/50 shadow-[0_0_10px_rgba(21,128,61,0.1)]">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-green-500" />
            <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-widest">API_RESPONSE_CHECK</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-green-900/50">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-green-700" />
                <span className="text-xs font-bold text-green-500">PRODUCTS_ENDPOINT</span>
              </div>
              {apiCheck.products === null ? (
                <span className="text-[10px] font-bold text-green-700">PENDING</span>
              ) : apiCheck.products ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 border border-green-900/50">
              <div className="flex items-center gap-3">
                <ShoppingCart size={16} className="text-green-700" />
                <span className="text-xs font-bold text-green-500">ORDERS_ENDPOINT</span>
              </div>
              {apiCheck.orders === null ? (
                <span className="text-[10px] font-bold text-green-700">PENDING</span>
              ) : apiCheck.orders ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Error Visibility */}
        {lastError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/20 border border-red-900/50 p-5 flex gap-4 items-start"
          >
            <div className="p-2 text-red-500 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">LAST_ERROR_LOGGED</h4>
              <p className="text-xs font-medium text-red-400 leading-relaxed break-words">{lastError}</p>
            </div>
          </motion.div>
        )}

        {/* Auth Details */}
        <div className="bg-black/40 p-6 border border-green-900/50 shadow-[0_0_10px_rgba(21,128,61,0.1)]">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-green-500" />
            <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-widest">AUTH_CONTEXT</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-green-700 uppercase">USER_EMAIL</span>
              <span className="text-xs font-black text-green-500 truncate ml-4">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-green-700 uppercase">ADMIN_PRIVILEGES</span>
              <span className="text-xs font-black text-green-500">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={performCheck}
            disabled={isRefreshing}
            className="bg-black border border-green-900/50 py-5 text-[10px] font-black text-green-500 flex flex-col items-center justify-center gap-2 hover:bg-green-950 transition-all shadow-[0_0_10px_rgba(21,128,61,0.1)] uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw size={20} className="text-green-500" />
            REFRESH_DATA
          </button>
          <button 
            onClick={performCheck}
            disabled={isRefreshing}
            className="bg-black border border-green-900/50 py-5 text-[10px] font-black text-green-500 flex flex-col items-center justify-center gap-2 hover:bg-green-950 transition-all shadow-[0_0_10px_rgba(21,128,61,0.1)] uppercase tracking-widest disabled:opacity-50"
          >
            <Server size={20} className="text-green-500" />
            TEST_CONNECTION
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

