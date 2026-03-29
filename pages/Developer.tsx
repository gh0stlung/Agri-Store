import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Globe,
  ShoppingCart, 
  AlertTriangle,
  ShieldCheck, ShieldAlert, DatabaseZap, Package,
  Activity, ArrowLeft, Users, Search, Filter, Trash2, 
  Phone, User, ChevronRight, History,
  LayoutDashboard, Trash, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '@/lib/supabase';
import { Order } from '../types';

interface Profile {
  id: string;
  name: string;
  mobile: string;
  address: string;
}

interface ActivityLog {
  id: string;
  type: 'order' | 'profile' | 'system';
  message: string;
  timestamp: string;
  user?: string;
}

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
  const { back } = useNavigation();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'orders' | 'users' | 'activity'>('monitoring');
  
  // Monitoring State
  const [dbStatus, setDbStatus] = useState<{ status: 'OK' | 'ERROR' | 'IDLE', message: string }>({ status: 'IDLE', message: '' });
  const [counts, setCounts] = useState({ products: 0, orders: 0, updates: 0, users: 0 });
  const [apiCheck, setApiCheck] = useState<{ products: boolean | null, orders: boolean | null }>({ products: null, orders: null });
  const [lastError, setLastError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState<'latest' | 'oldest'>('latest');
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState<Profile[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Activity State
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // User Details State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'order' | 'user' | 'bulk', id?: string, title: string } | null>(null);

  const isAdmin = user?.email === 'admin69@gmail.com';

  const fetchOrders = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setIsOrdersLoading(true);
    try {
      let query = supabase.from('orders').select('*');
      
      if (orderSort === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setLastError(err.message);
    } finally {
      setIsOrdersLoading(false);
    }
  }, [isAdmin, orderSort]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, mobile, address");

      if (error) {
        console.error("Fetch error:", error);
        setLastError(error.message || "Database unreachable");
        // Do not setUsers([]) here if we want to keep previous data or just handle it silently
        return;
      }

      const safeData = (data || []).map(u => ({
        ...u,
        name: u.name || 'Anonymous',
        mobile: u.mobile || 'N/A',
        address: u.address || 'N/A'
      }));

      setUsers(safeData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setLastError(err.message || "Database unreachable");
    }
  }, [isAdmin]);

  const fetchActivity = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    try {
      // Derive activity from orders and profiles
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('id, created_at, customer_name').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id, name').limit(10)
      ]);

      const activities: ActivityLog[] = [];

      ordersRes.data?.forEach(o => {
        activities.push({
          id: `order-${o.id}`,
          type: 'order',
          message: `New order placed by ${o.customer_name || 'Guest'}`,
          timestamp: o.created_at,
          user: o.customer_name
        });
      });

      profilesRes.data?.forEach(p => {
        activities.push({
          id: `profile-${p.id}`,
          type: 'profile',
          message: `New user registered: ${p.name || 'Anonymous'}`,
          timestamp: new Date().toISOString(),
          user: p.name
        });
      });

      setActivityLog(activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err: any) {
      setLastError(err.message);
    } finally {
      // Done
    }
  }, [isAdmin]);

  const performCheck = useCallback(async () => {
    setLastError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase client failed to initialize. Check your environment variables.');
      }

      // 1. Database Health Check (Simple query as requested)
      const { count, error: dbError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (dbError) {
        throw new Error(dbError.message || 'Database unreachable');
      }

      setCounts(prev => ({ ...prev, products: count || 0 }));
      setDbStatus({ status: 'OK', message: 'All systems operational' });

      // 2. Fetch other counts for the dashboard
      const [oRes, uRes, prRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('updates').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      setCounts({
        products: count || 0,
        orders: oRes.count || 0,
        updates: uRes.count || 0,
        users: prRes.count || 0
      });

      // 3. API Response Check
      setApiCheck({
        products: true,
        orders: !oRes.error
      });

    } catch (err: any) {
      console.error('System check failed:', err);
      const errorMessage = err.message || 'Database unreachable';
      setLastError(errorMessage);
      setDbStatus({ status: 'ERROR', message: errorMessage });
    }
  }, []);

  useEffect(() => {
    performCheck();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'activity') fetchActivity();
  }, [performCheck, activeTab, fetchOrders, fetchUsers, fetchActivity]);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      // Log activity
      const log: ActivityLog = {
        id: `update-${Date.now()}`,
        type: 'system',
        message: `Order #${id.slice(0, 8)} status updated to ${newStatus}`,
        timestamp: new Date().toISOString(),
        user: 'Admin'
      };
      setActivityLog(prev => [log, ...prev].slice(0, 20));
    } catch (err: any) {
      setLastError(err.message);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setLastError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setLastError(err.message);
    }
  };

  const handleBulkDeleteOrders = async (type: 'delivered' | 'old') => {
    if (!supabase) return;
    try {
      let query = supabase.from('orders').delete();
      if (type === 'delivered') {
        query = query.eq('status', 'Delivered');
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.lt('created_at', thirtyDaysAgo.toISOString());
      }
      
      const { error } = await query;
      if (error) throw error;
      fetchOrders();
      setDeleteConfirm(null);
    } catch (err: any) {
      setLastError(err.message);
    }
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-red-500/10 rounded-full mb-6 border border-red-500/20">
          <ShieldAlert size={48} className="text-red-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-slate-400 max-w-xs mb-8">This terminal is restricted to authorized administrators only.</p>
        <button 
          onClick={() => back()}
          className="px-8 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Return to Safety
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#020617] text-teal-500 font-mono relative min-h-screen flex flex-col"
    >
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-[#020617] to-[#020617] pointer-events-none"></div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 bg-black/60 backdrop-blur-xl border-b border-teal-500/30 p-6 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => back()} 
              className="p-2 bg-teal-950/50 rounded-xl text-teal-500 hover:text-teal-300 transition-colors border border-teal-500/20"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Terminal size={16} className="text-teal-400" />
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.3em]">Admin Data Panel</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                ADMIN CONSOLE
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-teal-500/20">
            {[
              { id: 'monitoring', icon: LayoutDashboard, label: 'Monitor' },
              { id: 'orders', icon: ShoppingCart, label: 'Orders' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'activity', icon: History, label: 'Activity' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.4)]' 
                    : 'text-teal-500/60 hover:text-teal-400 hover:bg-teal-500/5'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'monitoring' && (
            <motion.div 
              key="monitoring"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.05)]">
        <div className="flex items-center gap-3 mb-8">
          <DatabaseZap size={20} className="text-teal-400" />
          <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.2em]">Database Health</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-teal-500/30 to-transparent ml-4"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <AnimatedCounter value={counts.products} />
            </p>
            <p className="text-[10px] font-bold text-teal-600 uppercase mt-2 tracking-widest">Products</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <AnimatedCounter value={counts.orders} />
            </p>
            <p className="text-[10px] font-bold text-teal-600 uppercase mt-2 tracking-widest">Orders</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <AnimatedCounter value={counts.users} />
            </p>
            <p className="text-[10px] font-bold text-teal-600 uppercase mt-2 tracking-widest">Users</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <AnimatedCounter value={counts.updates} />
            </p>
            <p className="text-[10px] font-bold text-teal-600 uppercase mt-2 tracking-widest">Updates</p>
          </div>
        </div>
      </div>

              <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-teal-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={20} className="text-teal-400" />
                  <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.2em]">Live System Checks</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'PRODUCTS_ENDPOINT', icon: Package, status: apiCheck.products },
                    { name: 'ORDERS_ENDPOINT', icon: ShoppingCart, status: apiCheck.orders }
                  ].map((api, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-teal-950/20 border border-teal-900/50">
                      <div className="flex items-center gap-4">
                        <api.icon size={18} className="text-teal-500" />
                        <span className="text-sm font-bold text-slate-300">{api.name}</span>
                      </div>
                      {api.status ? (
                        <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">200 OK</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">FAILED</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 pb-20"
            >
              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-black/40 p-3 rounded-xl border border-teal-500/20">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500/50" size={18} />
                  <input 
                    type="text"
                    placeholder="Search Order ID or Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-teal-950/20 border border-teal-500/20 rounded-lg py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select 
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="flex-1 md:flex-none bg-teal-950/20 border border-teal-500/20 rounded-lg py-2.5 px-4 text-xs font-bold text-teal-400 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button 
                    onClick={() => setOrderSort(prev => prev === 'latest' ? 'oldest' : 'latest')}
                    className="p-2.5 bg-teal-950/20 border border-teal-500/20 rounded-lg text-teal-400 hover:bg-teal-500/10 transition-all"
                    title="Sort by Date"
                  >
                    <Filter size={18} />
                  </button>
                  <div className="relative group">
                    <button className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash size={18} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0f1a] border border-red-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'bulk', id: 'delivered', title: 'Delete all Delivered orders?' })}
                        className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg uppercase tracking-widest"
                      >
                        Delivered Orders
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'bulk', id: 'old', title: 'Delete orders older than 30 days?' })}
                        className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg uppercase tracking-widest"
                      >
                        Older than 30d
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {orders
                  .filter(o => 
                    (orderFilter === 'all' || o.status === orderFilter) &&
                    (o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.phone?.includes(orderSearch))
                  )
                  .map(order => (
                    <motion.div 
                      layout
                      key={order.id}
                      className="bg-black/40 backdrop-blur-md border border-teal-500/10 rounded-xl p-4 hover:border-teal-500/30 transition-all group"
                    >
                      {/* Row 1: Order ID + Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-teal-500" />
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">ID:</span>
                          <span className="text-xs font-black text-white">#{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            order.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.status || 'Pending'}
                          </div>
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-teal-950/40 border border-teal-500/20 rounded-lg py-0.5 px-1.5 text-[9px] font-bold text-teal-400 focus:outline-none hover:border-teal-500/50 transition-all cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Customer name + phone (inline) */}
                      <div className="flex items-center gap-3 mb-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <User size={12} className="text-teal-600" />
                          <span className="font-bold">{order.customer_name || 'Guest'}</span>
                        </div>
                        <div className="w-1 h-1 bg-teal-500/30 rounded-full"></div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone size={12} className="text-teal-600" />
                          <span>{order.phone || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Row 3: Total amount (bold) + date (right) */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">Total:</span>
                          <span className="text-sm font-black text-white">₹{order.total}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => setDeleteConfirm({ type: 'order', id: order.id, title: 'Delete this order?' })}
                            className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Row 4: Items (small text, single line) */}
                      <div className="pt-2 border-t border-teal-500/5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <ShoppingCart size={10} className="text-teal-600 shrink-0" />
                          <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                            {order.items?.map((item, i) => (
                              <span key={i} className="text-[9px] text-teal-400/70 font-medium">
                                {item.name} (x{item.quantity}){i < (order.items?.length || 0) - 1 ? ',' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                
                {orders.length === 0 && !isOrdersLoading && (
                  <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-teal-500/20">
                    <Package size={48} className="text-teal-900 mx-auto mb-4" />
                    <p className="text-teal-700 font-bold uppercase tracking-widest">No orders found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 pb-20"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500/50" size={18} />
                <input 
                  type="text"
                  placeholder="Search Users by Name or Email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-black/40 border border-teal-500/20 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users
                  .filter(u => 
                    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                    (u.mobile || '').toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map(profile => (
                    <motion.div 
                      key={profile.id}
                      className="bg-black/40 backdrop-blur-md border border-teal-500/10 rounded-2xl p-6 hover:border-teal-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <button 
                          onClick={() => setDeleteConfirm({ type: 'user', id: profile.id, title: `Delete user ${profile.name}?` })}
                          className="p-2 text-red-400/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
                          <User size={24} className="text-teal-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{profile.name || 'Anonymous'}</h4>
                          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Registered User</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 uppercase tracking-widest font-bold">Mobile</span>
                          <span className="text-slate-300">{profile.mobile || 'N/A'}</span>
                        </div>
                        <div className="flex items-start justify-between text-xs pt-3 border-t border-teal-500/5">
                          <span className="text-slate-500 uppercase tracking-widest font-bold">Address</span>
                          <span className="text-slate-300 text-right line-clamp-2 ml-4">{profile.address || 'N/A'}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedUser(profile)}
                          className="w-full mt-4 py-2 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-teal-400 transition-all flex items-center justify-center gap-2"
                        >
                          View Full Details
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div 
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto space-y-8 pb-20"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-teal-300 uppercase tracking-[0.3em]">System Timeline</h3>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Last 20 Events</span>
              </div>

              <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-gradient-to-b before:from-teal-500/50 before:via-teal-500/20 before:to-transparent">
                {activityLog.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={log.id} 
                    className="relative pl-12"
                  >
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-xl flex items-center justify-center border ${
                      log.type === 'order' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      log.type === 'profile' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-teal-500/10 text-teal-400 border-teal-500/20'
                    } z-10 backdrop-blur-md`}>
                      {log.type === 'order' ? <ShoppingCart size={14} /> : 
                       log.type === 'profile' ? <User size={14} /> : 
                       <Activity size={14} />}
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-md border border-teal-500/10 rounded-2xl p-5 hover:border-teal-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          log.type === 'order' ? 'text-blue-400' :
                          log.type === 'profile' ? 'text-purple-400' :
                          'text-teal-400'
                        }`}>
                          {log.type} event
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{log.message}</p>
                      {log.user && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <User size={10} />
                          <span>{log.user}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0f1a] border border-teal-500/30 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(20,184,166,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
                    <User size={32} className="text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{selectedUser.name || 'Anonymous'}</h3>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em]">User Profile Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-teal-500/10 rounded-xl text-teal-500 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <p className="text-sm font-bold text-white break-all">{selectedUser.mobile || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Address</label>
                  <p className="text-sm font-bold text-white">{selectedUser.address || 'Not provided'}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account ID</label>
                  <p className="text-[10px] font-mono text-teal-500/70 break-all">{selectedUser.id}</p>
                </div>
              </div>

              <div className="bg-teal-500/5 border border-teal-500/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-teal-500" />
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Security Status</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Account Verification</span>
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">VERIFIED</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-4 bg-teal-500 text-black font-black rounded-2xl hover:bg-teal-400 transition-all uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              >
                Close Terminal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0a0f1a] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
                <AlertTriangle size={32} className="text-red-500 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tight">Confirm Deletion</h3>
              <p className="text-slate-400 text-center text-sm mb-8">{deleteConfirm.title}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="py-3 bg-teal-950/30 text-teal-500 font-bold rounded-xl border border-teal-500/20 hover:bg-teal-500/10 transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'order') handleDeleteOrder(deleteConfirm.id!);
                    if (deleteConfirm.type === 'user') handleDeleteUser(deleteConfirm.id!);
                    if (deleteConfirm.type === 'bulk') handleBulkDeleteOrders(deleteConfirm.id as any);
                  }}
                  className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Visibility */}
      <AnimatePresence>
        {lastError && (
          <div className="fixed bottom-6 right-6 z-[110] max-w-md w-full">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-red-950/90 backdrop-blur-xl border border-red-500/40 rounded-2xl p-4 flex gap-4 items-start shadow-2xl"
            >
              <AlertTriangle size={20} className="text-red-500 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs font-mono text-red-200 break-words">{lastError}</p>
              </div>
              <button onClick={() => setLastError(null)} className="text-red-400 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


