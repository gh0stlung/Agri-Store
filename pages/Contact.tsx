import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { MapPin, Phone, Clock, Shield, ExternalLink, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <AppLayout activePage="contact" pageTitle="Information">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-orange-100/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <div className="relative z-10 space-y-6">
            
            {/* Hero Card with Background Image */}
            <div className="rounded-[32px] p-8 text-center text-white shadow-xl relative overflow-hidden animate-fade-in-up">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=800&q=80" 
                        alt="Green Field" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#064E3B] to-[#047857] opacity-90 mix-blend-multiply"></div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 z-0"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/3 -translate-x-1/3 z-0"></div>
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
                        <img src="https://cdn-icons-png.flaticon.com/512/628/628283.png" alt="Logo" className="w-10 h-10 brightness-0 invert opacity-90" />
                    </div>
                    <h1 className="text-3xl font-black font-serif mb-2 tracking-tight drop-shadow-sm">New Nikhil<br/>Khad Bhandar</h1>
                    <div className="h-1 w-12 bg-emerald-400/50 mx-auto rounded-full mb-3"></div>
                    <p className="text-emerald-100 font-medium text-xs tracking-widest uppercase opacity-80">Serving Farmers Since 2015</p>
                </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 ml-1">Contact Information</h2>
                
                <div className="space-y-6">
                    {/* Address */}
                    <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-[18px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 border border-[#D1FAE5] shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="text-[#064E3B]" size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#27272a] text-base">Visit Store</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                                Main Market Road, Near Railway Station<br/>
                                Ganjdundwara, Kasganj - 207242<br/>
                                Uttar Pradesh
                            </p>
                            <a 
                                href="https://maps.app.goo.gl/z8FjeQ8185246q6eA" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-700 mt-2 inline-flex items-center gap-1 hover:underline bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100"
                            >
                                Get Directions <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Phone */}
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-[18px] bg-[#FFF7ED] flex items-center justify-center flex-shrink-0 border border-[#FFEDD5] shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Phone className="text-[#9A3412]" size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#27272a] text-base">Call Us</h3>
                            <a href="tel:+919368340997" className="text-sm text-[#78350F] font-bold hover:underline tracking-wide block mt-1">+91 9368340997</a>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Hours */}
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-[18px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 border border-[#DBEAFE] shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Clock className="text-[#1E40AF]" size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#27272a] text-base">Opening Hours</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                Mon - Sat: 9:00 AM - 8:00 PM<br/>
                                <span className="text-red-500 font-bold">Sunday: Closed</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Map Card - Restored Full Color */}
            <div className="bg-white p-2 rounded-[28px] shadow-sm border border-gray-100 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                <div className="h-48 w-full rounded-[24px] overflow-hidden relative group">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.2163357545465!2d78.93280807534293!3d27.58686697625206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3975079a49479e05%3A0xe7a01a3089d424b9!2sNew%20Nikhil%20Khad%20Bhandar!5e0!3m2!1sen!2sin!4v1708688400000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{border:0}} 
                        allowFullScreen={true} 
                        loading="lazy"
                        title="Store Location"
                        className="transition-all duration-700 opacity-95 group-hover:opacity-100"
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none border-[4px] border-white/30 rounded-[24px]"></div>
                </div>
            </div>

            {/* Social & Support */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                <a 
                    href="https://www.instagram.com/new_nikhilkhadbhandar" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-[1px] rounded-[24px] shadow-sm group"
                >
                    <div className="bg-white rounded-[23px] h-full flex flex-col items-center justify-center p-4 group-hover:bg-opacity-95 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C] mb-2 group-hover:scale-110 transition-transform">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span className="font-bold text-xs text-gray-700">Follow Us</span>
                    </div>
                </a>
                
                <a 
                    href="mailto:contact@nikhilkhad.com" 
                    className="bg-white p-4 rounded-[24px] shadow-sm border-2 border-emerald-600/10 flex flex-col items-center justify-center group hover:border-emerald-600/30 transition-all"
                >
                    <Mail size={24} className="text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                    <span className="font-bold text-xs text-gray-700">Email Support</span>
                </a>
            </div>

            {/* Trust Badge */}
            <div className="bg-emerald-50/80 backdrop-blur-sm rounded-[24px] p-5 flex items-center gap-4 border border-emerald-100 animate-fade-in-up text-left" style={{animationDelay: '400ms'}}>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="text-emerald-600" size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">100% Genuine Products</h4>
                    <p className="text-[10px] font-medium text-emerald-600 mt-0.5 leading-snug">
                        Trusted by 500+ local farmers for authentic seeds & fertilizers.
                    </p>
                </div>
            </div>

            {/* Footer Credits - Extra Bottom Padding for WhatsApp Button */}
            <div className="text-center pt-10 pb-24 opacity-50">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p className="text-[10px] font-bold text-[#78350F] tracking-wider">
                    EST. 2015 • GANJDUNDWARA<br/>
                    Developer & Manager
                </p>
            </div>
        </div>

        {/* WhatsApp Floating Button */}
        <div className="fixed bottom-28 right-6 z-40 animate-slide-up" style={{animationDelay: '500ms'}}>
            <a 
                href="https://wa.me/919368340997" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-full shadow-[0_8px_20px_rgba(37,211,102,0.3)] hover:-translate-y-1 hover:shadow-2xl hover:bg-[#20b857] active:scale-[0.98] transition-all duration-300 font-bold text-base group border-2 border-white/20 backdrop-blur-sm"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white group-hover:rotate-12 transition-transform duration-300">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Chat on WhatsApp</span>
            </a>
        </div>
    </AppLayout>
  );
};