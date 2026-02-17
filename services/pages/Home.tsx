import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">New Nikhil <br/>Khad Bhandar</h1>
          <p className="text-emerald-100 mb-6 text-lg">Your trusted partner for quality agriculture products.</p>
          
          <Link 
            to="/catalog"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Genuine<br/>Products</span>
          </div>
          <div className="w-px h-12 bg-gray-100"></div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Leaf size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Organic<br/>Options</span>
          </div>
          <div className="w-px h-12 bg-gray-100"></div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Truck size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Fast<br/>Delivery</span>
          </div>
        </div>
      </div>

      {/* Featured Categories (Static for Layout) */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Explore</h2>
          <Link to="/catalog" className="text-emerald-600 text-sm font-semibold">View All</Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Link to="/catalog" className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white h-32 flex flex-col justify-end shadow-md hover:shadow-lg transition-shadow">
            <span className="font-bold text-lg">Seeds</span>
            <span className="text-emerald-100 text-xs">High Yield Varieties</span>
          </Link>
          <Link to="/catalog" className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white h-32 flex flex-col justify-end shadow-md hover:shadow-lg transition-shadow">
            <span className="font-bold text-lg">Fertilizers</span>
            <span className="text-blue-100 text-xs">Growth Boosters</span>
          </Link>
          <Link to="/catalog" className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white h-32 flex flex-col justify-end shadow-md hover:shadow-lg transition-shadow">
            <span className="font-bold text-lg">Pesticides</span>
            <span className="text-orange-100 text-xs">Crop Protection</span>
          </Link>
           <Link to="/catalog" className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white h-32 flex flex-col justify-end shadow-md hover:shadow-lg transition-shadow">
            <span className="font-bold text-lg">Tools</span>
            <span className="text-purple-100 text-xs">Farming Equipment</span>
          </Link>
        </div>
      </div>
      
       <div className="px-6 mt-8">
          <div className="bg-gray-800 rounded-2xl p-6 text-white text-center">
             <h3 className="font-bold text-lg mb-2">Need Help?</h3>
             <p className="text-gray-300 text-sm mb-4">Contact our experts for crop advice.</p>
             <Link to="/contact" className="inline-block bg-white text-gray-900 font-bold px-6 py-2 rounded-lg text-sm">Contact Us</Link>
          </div>
       </div>
    </div>
  );
};
