import React from 'react';
import { AppLayout } from '../components/AppLayout.tsx';
import { MapPin, Phone, MessageCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <AppLayout activePage="contact" pageTitle="Get in Touch">
        {/* Contact Info Card */}
        <div className="card-premium p-8 space-y-8 animate-fade-in relative mt-2">
            <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 rounded-[16px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 border border-[#D1FAE5]">
                    <MapPin className="text-[var(--text-primary)]" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-xl font-serif">Visit Store</h3>
                    <p className="text-sm text-[#27272a] mt-2 font-medium leading-relaxed">Ganjdundwara, Kasganj,<br/>Uttar Pradesh, India</p>
                </div>
            </div>

            <div className="h-px bg-[#E7E5E4] w-full"></div>

            <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-[16px] bg-[#FFFCF0] flex items-center justify-center flex-shrink-0 border border-[#E7E5E4]">
                    <Phone className="text-[#78350F]" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-xl font-serif">Call Us</h3>
                    <a href="tel:+919368340997" className="text-lg text-[#78350F] font-bold hover:underline font-sans">+91 9368340997</a>
                </div>
            </div>
        </div>

        {/* Google Map - Clean Frame */}
        <div className="card-premium h-80 relative animate-fade-in shadow-md group border-0 overflow-hidden" style={{animationDelay: '100ms'}}>
            <iframe 
                src="https://www.google.com/maps?q=Ganjdundwara&output=embed" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={true} 
                loading="lazy"
                title="Store Location"
                className="opacity-95 group-hover:opacity-100 transition-opacity duration-500"
            ></iframe>
        </div>

        {/* WhatsApp Floating Button */}
        <div className="fixed bottom-28 right-6 z-40 animate-fade-in" style={{animationDelay: '200ms'}}>
            <a 
                href="https://wa.me/919368340997" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-[32px] shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 font-bold text-lg group min-h-[56px]"
            >
                <MessageCircle size={24} />
                <span>WhatsApp</span>
            </a>
        </div>

        {/* Owner Info */}
        <div className="text-center py-8 opacity-60 animate-fade-in" style={{animationDelay: '300ms'}}>
             <p className="text-[10px] font-bold text-[#78350F] uppercase tracking-[0.2em] mb-2">Managed by</p>
             <span className="text-sm font-bold text-[var(--text-primary)]">Abhay Kumar</span>
        </div>
    </AppLayout>
  );
};