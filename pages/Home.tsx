import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Award, Megaphone } from 'lucide-react';
import { AppLayout } from '../components/AppLayout.tsx';

export const Home: React.FC = () => {
  return (
    <AppLayout activePage="home">
        {/* Clean Stacked Hero Section */}
        <div className="relative mt-2">
            {/* Main Hero Card */}
            <div className="card-premium relative h-[400px] flex items-end p-8 overflow-hidden group">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
                        alt="Agriculture Field" 
                        className="w-full h-full object-cover opacity-95 transition-transform duration-[2s] ease-out group-hover:scale-105 will-change-transform" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] via-[#064E3B]/50 to-transparent"></div>
                </div>
                
                <div className="relative z-10 w-full animate-fade-in">
                    <span className="inline-block px-4 py-1.5 bg-white rounded-full text-xs font-bold text-[var(--text-primary)] mb-4 shadow-sm">
                        👋 Welcome Farmer
                    </span>
                    <h2 className="text-4xl font-black text-white mb-3 leading-[1.1] drop-shadow-sm font-serif">
                        Premium<br/>Harvest.
                    </h2>
                    <p className="text-[#FFFCF0] font-medium mb-6 text-sm max-w-[90%] leading-relaxed opacity-90">
                        High-quality seeds & organic fertilizers for your best yield yet.
                    </p>
                    
                    <Link to="/catalog" className="bg-white text-[var(--text-primary)] px-8 py-4 rounded-[16px] font-bold shadow-lg hover:bg-[#F8FAFC] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 text-base w-full min-h-[56px]">
                        <span>Shop Products</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>

        {/* Quick Stats - Premium Clean Style */}
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="card-premium p-6 flex flex-col items-center text-center animate-fade-in" style={{animationDelay: '100ms'}}>
                <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-3">
                    <Sprout className="text-[#064E3B]" size={24} />
                </div>
                <span className="font-black text-[var(--text-primary)] text-3xl font-serif">100+</span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Items</span>
            </div>
            <div className="card-premium p-6 flex flex-col items-center text-center animate-fade-in" style={{animationDelay: '150ms'}}>
                <div className="w-12 h-12 rounded-full bg-[#FFEDD5] flex items-center justify-center mb-3">
                    <Award className="text-[#78350F]" size={24} />
                </div>
                <span className="font-black text-[var(--text-primary)] text-3xl font-serif">#1</span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Trusted</span>
            </div>
        </div>

        {/* Featured Highlight - Clean */}
        <div className="card-premium p-6 mt-4 flex items-center gap-5 animate-fade-in bg-white" style={{animationDelay: '200ms'}}>
             <div className="w-16 h-16 rounded-[16px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 border border-[#D1FAE5]">
                 <Megaphone className="text-[#064E3B]" size={24} />
             </div>
             <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1.5">
                     <span className="bg-[#064E3B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">NEW STOCK</span>
                 </div>
                 <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight mb-1">Urea Gold Arrived</h3>
                 <p className="text-xs text-[#78350F] font-medium">Check the catalog for latest stock.</p>
             </div>
        </div>
    </AppLayout>
  );
};