import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { MapPin, Phone, Clock, Shield, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <AppLayout activePage="contact" pageTitle="Get in Touch">
        
        {/* Business Info Card */}
        <div className="card-premium p-6 space-y-6 animate-fade-in relative mt-2 bg-white/80 backdrop-blur-sm">
            {/* Address */}
            <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-[16px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 border border-[#D1FAE5] shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="text-[var(--text-primary)]" size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg font-serif">Visit Store</h3>
                    <p className="text-sm text-[#27272a] mt-1 font-medium leading-relaxed opacity-80">
                        New Nikhil Khad Bhandar<br/>
                        Main Market Road, Near Railway Station<br/>
                        Ganjdundwara, Kasganj - 207242<br/>
                        Uttar Pradesh, India
                    </p>
                    <a 
                        href="https://maps.app.goo.gl/z8FjeQ8185246q6eA" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-[#064E3B] mt-2 inline-flex items-center gap-1 hover:underline bg-emerald-50 px-2 py-1 rounded-md"
                    >
                        Open Google Maps <ExternalLink size={10} />
                    </a>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#E7E5E4] to-transparent w-full"></div>

            {/* Phone */}
            <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-[16px] bg-[#FFFCF0] flex items-center justify-center flex-shrink-0 border border-[#E7E5E4] shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Phone className="text-[#78350F]" size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg font-serif">Call Us</h3>
                    <a href="tel:+919368340997" className="text-base text-[#78350F] font-bold hover:underline font-sans tracking-wide block mt-1">+91 9368340997</a>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#E7E5E4] to-transparent w-full"></div>

            {/* Hours */}
            <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Clock className="text-blue-700" size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg font-serif">Opening Hours</h3>
                    <p className="text-sm text-[#27272a] mt-1 font-medium opacity-80">
                        Mon - Sat: 9:00 AM - 8:00 PM<br/>
                        Sunday: Closed
                    </p>
                </div>
            </div>
        </div>

        {/* Social Buttons - Official Colors */}
        <div className="grid grid-cols-2 gap-4 mt-6 animate-fade-in" style={{animationDelay: '100ms'}}>
             <a 
                href="https://www.instagram.com/new_nikhilkhadbhandar" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors group"
            >
                {/* Official Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C] group-hover:scale-110 transition-transform">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span className="font-bold text-sm text-gray-700">Instagram</span>
            </a>
            <a 
                href="https://maps.app.goo.gl/z8FjeQ8185246q6eA" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors group"
            >
                <MapPin size={24} className="text-[#4285F4] group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-gray-700">Location</span>
            </a>
        </div>

        {/* Trust Badge */}
        <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100 animate-fade-in mt-6" style={{animationDelay: '200ms'}}>
            <Shield className="text-emerald-600" size={24} />
            <p className="text-xs font-bold text-emerald-800 leading-tight">
                Trusted by 500+ local farmers for genuine seeds and fertilizers since 2015.
            </p>
        </div>

        {/* Google Map - Fixed Layout */}
        <div className="card-premium h-64 relative animate-fade-in shadow-lg group border-0 overflow-hidden cursor-pointer rounded-[24px] mt-6" style={{animationDelay: '300ms'}}>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.2163357545465!2d78.93280807534293!3d27.58686697625206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3975079a49479e05%3A0xe7a01a3089d424b9!2sNew%20Nikhil%20Khad%20Bhandar!5e0!3m2!1sen!2sin!4v1708688400000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={true} 
                loading="lazy"
                title="Store Location"
                className="opacity-95 group-hover:opacity-100 transition-opacity duration-500 grayscale-[0.2] group-hover:grayscale-0"
            ></iframe>
            {/* Interactive Border Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[3px] border-white/20 rounded-[24px]"></div>
        </div>

        {/* WhatsApp Floating Button - Official Green */}
        <div className="fixed bottom-28 right-6 z-40 animate-slide-up" style={{animationDelay: '300ms'}}>
            <a 
                href="https://wa.me/919368340997" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:bg-[#20b857] active:scale-[0.98] transition-all duration-300 font-bold text-base group border-2 border-white/20 backdrop-blur-sm"
            >
                {/* Official WhatsApp SVG */}
                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white group-hover:rotate-12 transition-transform duration-300">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Chat on WhatsApp</span>
            </a>
        </div>

        {/* FOOTER CREDITS */}
        <div className="text-center pb-8 pt-8 opacity-60 animate-fade-in" style={{animationDelay: '400ms'}}>
             <p className="text-xs font-bold text-[#78350F] tracking-wide mb-1">Managed by Abhay</p>
             <p className="text-[10px] font-medium text-gray-500">
                Developed by <span className="text-[#064E3B] font-bold">TORN-D</span>
             </p>
        </div>
    </AppLayout>
  );
};