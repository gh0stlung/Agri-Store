import React, { useEffect, useState } from 'react';
import { Link } from '../components/Link';
import { useNavigation } from '../context/NavigationContext';
import { ArrowRight, Bell, Megaphone, ChevronRight, Package, Clock } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { supabase } from '../services/supabase';
import { StoreUpdate } from '../types';

export const Home: React.FC = () => {
  const { push } = useNavigation();
  const [updates, setUpdates] = useState<StoreUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    if (!supabase) {
        setUpdates([
            { id: '1', content: 'Shop is closed today due to heavy rain.', created_at: new Date().toISOString() },
            { id: '2', content: 'New stock of Urea Gold has arrived!', created_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
        setLoadingUpdates(false);
        return;
    }

    try {
        const { data, error } = await supabase
            .from('store_updates')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        
        if (error) throw error;
        setUpdates(data || []);
    } catch (err) {
        console.error("Error fetching updates:", err);
    } finally {
        setLoadingUpdates(false);
    }
  };

  return (
    <AppLayout activePage="home">
        
        {/* HERO SECTION - Polished Spacing & Alignment */}
        <div className="relative mt-0 min-h-[360px] h-auto rounded-[28px] overflow-hidden shadow-2xl group animate-fade-in bg-gray-900 flex flex-col justify-center">
            {/* Background Image - Reliable Unsplash URL with Fallback Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&w=800&q=80" 
                    alt="Green Farm Field" 
                    className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-105" 
                    onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
                    }}
                />
                {/* Gradient Overlays - Balanced for Centered Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] via-[#064E3B]/50 to-black/20 opacity-90"></div>
            </div>
            
            {/* Top Bar inside Hero */}
            <div className="relative z-10 px-6 pt-6 flex justify-between items-start w-full absolute top-0 left-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-white shadow-lg">
                    <span>👋 Welcome Farmer</span>
                </div>
            </div>
            
            {/* Hero Content - Centered */}
            <div className="relative z-10 px-8 py-12 text-white flex flex-col justify-center h-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                
                <h2 className="text-4xl font-black mb-3 leading-tight font-serif drop-shadow-xl tracking-tight text-white text-center sm:text-left">
                    New Nikhil<br/>Khad Bhandar
                </h2>
                <p className="text-emerald-50 font-medium mb-8 text-sm opacity-95 shadow-sm max-w-[90%] leading-relaxed text-center sm:text-left mx-auto sm:mx-0">
                    Premium seeds, fertilizers & expert advice for your best harvest yet. 🌾
                </p>
                
                <div className="flex justify-center sm:justify-start">
                    <Link href="/catalog" className="inline-flex items-center justify-center gap-3 bg-white text-[#064E3B] px-8 py-3.5 rounded-[16px] font-bold shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-emerald-50 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-sm w-fit group/btn z-20">
                        <span>Order Now</span>
                        <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
        
        {/* QUICK ACTIONS - Consistent Spacing */}
        <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link href="/track" className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E7E5E4] flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-200 transition-all active:scale-95">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[14px] flex items-center justify-center shadow-inner">
                    <Package size={24} />
                </div>
                <span className="font-bold text-gray-800 text-sm">Track Order</span>
            </Link>
            <Link href="/contact" className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E7E5E4] flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-200 transition-all active:scale-95">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-[14px] flex items-center justify-center shadow-inner">
                    <Clock size={24} />
                </div>
                <span className="font-bold text-gray-800 text-sm">Timings</span>
            </Link>
        </div>

        {/* BULK ORDER BANNER */}
        <div 
            onClick={() => push('/catalog')}
            className="relative mt-5 rounded-[24px] overflow-hidden shadow-xl border border-emerald-100/50 cursor-pointer group animate-fade-in-up min-h-[100px] flex items-center mx-0.5 bg-[#78350F]"
            style={{animationDelay: '400ms'}}
        >
             <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80" alt="Bulk Order" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#78350F] via-[#92400E] to-transparent opacity-90"></div>
             </div>

             <div className="relative z-10 p-5 flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 backdrop-blur-md text-white flex items-center justify-center flex-shrink-0 shadow-inner border border-white/10 group-hover:scale-110 transition-transform">
                    <Megaphone size={20} className="animate-pulse" />
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-white leading-tight mb-0.5 drop-shadow-sm">Bulk Scheme</h3>
                    <p className="text-[11px] text-orange-100 font-medium opacity-90">Special rates for large orders.</p>
                </div>
                <div className="bg-white text-[#78350F] p-2 rounded-full shadow-lg group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={18} strokeWidth={3} />
                </div>
             </div>
        </div>

        {/* UPDATES SECTION */}
        <div className="mt-7 mb-6 animate-fade-in-up" style={{animationDelay: '500ms'}}>
            <div className="flex items-center gap-2 mb-3 px-1">
                <Bell size={18} className="text-emerald-700 fill-emerald-100" />
                <h3 className="text-lg font-black text-[#064E3B] font-serif">Store Updates</h3>
            </div>
            
            <div className="space-y-3">
                {loadingUpdates ? (
                    <div className="bg-white p-6 rounded-[20px] animate-pulse h-24 shadow-sm border border-gray-100"></div>
                ) : updates.length === 0 ? (
                    <div className="bg-white p-8 rounded-[20px] border border-dashed border-[#E7E5E4] text-center text-gray-400 font-medium text-xs">
                        No recent updates.
                    </div>
                ) : (
                    updates.map((update, idx) => (
                        <div key={update.id} className="bg-white p-4 rounded-[20px] shadow-sm border border-[#E7E5E4] flex gap-4 items-start relative overflow-hidden animate-fade-in-up group hover:shadow-md transition-all" style={{ animationDelay: `${600 + (idx * 100)}ms` }}>
                            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-[#064E3B] to-emerald-500"></div>
                            <div className="flex-1 pl-1">
                                <p className="text-[#27272a] font-bold text-sm leading-relaxed">{update.content}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-wide">
                                    {new Date(update.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    </AppLayout>
  );
};