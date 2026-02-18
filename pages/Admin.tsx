import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Product, Order, StoreUpdate } from '../types';
import { 
  Plus, Trash2, Edit2, LogOut, Save, X, ArrowLeft, 
  Package, ShoppingBag, Bell, ChevronDown, Image as ImageIcon, Sparkles, Wand2,
  Search, Calendar, MapPin, Phone, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Link } from '../components/Link';
import { GoogleGenAI } from "@google/genai";

export const Admin: React.FC = () => {
  const { push } = useNavigation();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'updates'>('products');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updates, setUpdates] = useState<StoreUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms & Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Product Form
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', category: '', price: '' as any, stock: '' as any, image_url: '', unit: 'kg', is_active: true 
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  
  // Update Form
  const [updateText, setUpdateText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const CATEGORIES = ['Seeds', 'Fertilizer', 'Pesticides', 'Tools', 'Offers'];
  const UNITS = ['kg', 'gram', 'bag', 'liter', 'ml', 'piece', 'packet'];
  
  const STATUS_OPTIONS = [
      { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' },
      { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  ];

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await fetchData();
  };

  const fetchData = async () => {
    if (!supabase) {
        setLoading(false);
        return;
    }
    try {
      const [prod, ord, upd] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('store_updates').select('*').order('created_at', { ascending: false })
      ]);
      
      setProducts(prod.data || []);
      setOrders(ord.data || []);
      setUpdates(upd.data || []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    push('/login');
  };

  // --- HANDLERS ---

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          setProductForm(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
  };

  // Optional AI Feature: Autofill details from Name
  const handleAIAutofill = async () => {
      if (!productForm.name) {
          alert("Enter a product name first!");
          return;
      }
      setIsAutofilling(true);
      
      try {
          const apiKey = process.env.API_KEY;
          if (!apiKey) throw new Error("No API Key");
          
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Given the agricultural product name "${productForm.name}", suggest a JSON with: 
            category (one of: Seeds, Fertilizer, Pesticides, Tools, Offers), 
            price (estimated numeric value in INR, default 500 if unknown),
            unit (one of: kg, gram, bag, liter, ml, piece, packet)
            
            Example output: {"category": "Fertilizer", "price": 1200, "unit": "bag"}
            Only return JSON.`
          });
          
          const text = response.text || "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              setProductForm(prev => ({
                  ...prev,
                  category: data.category || prev.category,
                  price: data.price || prev.price,
                  unit: data.unit || prev.unit
              }));
          }
      } catch (e) {
          console.error("Autofill error", e);
          alert("AI Autofill failed. Please enter manually.");
      } finally {
          setIsAutofilling(false);
      }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setUploadingImage(true);
    try {
        let finalImageUrl = productForm.image_url;
        
        // Handle Image Upload if base64 (new selection)
        if (finalImageUrl && finalImageUrl.startsWith('data:')) {
             const res = await fetch(finalImageUrl);
             const blob = await res.blob();
             const fileName = `prod_${Date.now()}.png`;
             
             // Upload to 'product-images' bucket
             const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, { upsert: true });
             
             if (uploadError) throw uploadError;
             
             const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
             finalImageUrl = data.publicUrl;
        }

        const payload = { 
            name: productForm.name,
            category: productForm.category,
            price: Number(productForm.price),
            stock: Number(productForm.stock),
            unit: productForm.unit,
            image_url: finalImageUrl,
            is_active: productForm.is_active ?? true
        };
        
        if (editingId) {
             const { error } = await supabase.from('products').update(payload).eq('id', editingId);
             if (error) throw error;
        } else {
             const { error } = await supabase.from('products').insert([payload]);
             if (error) throw error;
        }
        
        resetForms();
        fetchData();
        setIsFormOpen(false);
    } catch (e: any) {
        console.error(e);
        alert("Error saving product: " + e.message);
    } finally {
        setUploadingImage(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!supabase) return;
    if (confirm("Delete product?")) {
        await supabase.from('products').delete().eq('id', id);
        fetchData();
    }
  };

  const saveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!updateText.trim()) return;
    await supabase.from('store_updates').insert([{ content: updateText }]);
    setUpdateText('');
    fetchData();
  };

  const deleteUpdate = async (id: string) => {
      if (!supabase) return;
      await supabase.from('store_updates').delete().eq('id', id);
      fetchData();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) alert("Failed to update status");
      else setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const resetForms = () => {
    setProductForm({ name: '', category: '', price: '' as any, stock: '' as any, image_url: '', unit: 'kg', is_active: true });
    setEditingId(null);
    setUpdateText('');
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFCF0]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#064E3B]"></div>
            <p className="text-[#064E3B] font-bold text-sm">Loading Dashboard...</p>
          </div>
      </div>
  );
  
  if (!supabase) {
    return (
        <div className="min-h-screen bg-[#FFFCF0] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[24px] shadow-xl text-center max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">Supabase Not Connected</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Please configure your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables to access the Admin Panel.
                </p>
                <button onClick={() => push('/')} className="px-6 py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF0] pb-32 text-gray-800 font-['Plus_Jakarta_Sans']">
      
      {/* Top Navigation */}
      <nav className="bg-[#FFFCF0]/95 backdrop-blur-md border-b border-[#E7E5E4] sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Link href="/" className="p-2 bg-white rounded-full hover:bg-gray-50 transition-colors active:scale-95 border border-[#E7E5E4] shadow-sm">
                    <ArrowLeft size={18} className="text-[var(--text-primary)]" />
                </Link>
                <div>
                    <h1 className="font-black text-lg text-[var(--text-primary)] font-serif leading-none">Admin Panel</h1>
                    <p className="text-[10px] font-bold text-[#78350F] tracking-wide mt-0.5">STORE MANAGER</p>
                </div>
            </div>
            <button onClick={handleLogout} className="text-red-500 px-3 py-2 bg-red-50 rounded-[12px] text-xs font-bold flex items-center gap-2 hover:bg-red-100 active:scale-95 transition-all border border-red-100">
                <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-[20px] border border-[#E7E5E4] shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-[var(--text-primary)]">{products.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Products</span>
            </div>
            <div className="bg-white p-4 rounded-[20px] border border-[#E7E5E4] shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-emerald-600">{orders.filter(o => o.status === 'pending').length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Orders</span>
            </div>
            <div className="bg-white p-4 rounded-[20px] border border-[#E7E5E4] shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-blue-600">{orders.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-1.5 rounded-[16px] flex gap-1 shadow-sm border border-[#E7E5E4]">
            {[
                { id: 'products', icon: Package, label: 'Products' },
                { id: 'orders', icon: ShoppingBag, label: 'Orders' },
                { id: 'updates', icon: Bell, label: 'Updates' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); resetForms(); setIsFormOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-xs font-bold transition-all duration-200 ${
                        activeTab === tab.id 
                        ? 'bg-[#064E3B] text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
            <div className="space-y-4 animate-fade-in">
                {/* Search Bar */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search inventory..." 
                            className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[#E7E5E4] bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm font-medium text-gray-800 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[#064E3B] text-white px-4 md:px-6 rounded-[12px] font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-[#053d2e] active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden md:inline">Add Product</span>
                    </button>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsFormOpen(false)} />
                        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col border border-[#E7E5E4]">
                            <div className="bg-[#FFFCF0] px-6 py-4 border-b border-[#E7E5E4] flex justify-between items-center sticky top-0 z-20 shrink-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2 font-serif">
                                    {editingId ? <Edit2 size={18} className="text-blue-500"/> : <Plus size={18} className="text-emerald-600"/>}
                                    {editingId ? 'Edit Product' : 'Add New Item'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="bg-white p-2 rounded-full hover:bg-gray-100 border border-[#E7E5E4] transition-colors text-gray-500"><X size={18} /></button>
                            </div>
                            
                            {/* Polished Modal Content with Tighter Spacing */}
                            <div className="overflow-y-auto p-5">
                                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-[#E7E5E4] rounded-[16px] bg-[#FFFCF0]/50 hover:bg-[#FFFCF0] transition-colors relative group">
                                            {productForm.image_url ? (
                                                <div className="relative w-24 h-24 rounded-[12px] overflow-hidden shadow-sm border border-[#E7E5E4]">
                                                    <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-300 border border-[#E7E5E4]">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                            
                                            <label className="cursor-pointer">
                                                <span className="bg-white text-gray-600 px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-[10px] font-bold shadow-sm hover:bg-gray-50 transition-all inline-block">
                                                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                                                </span>
                                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploadingImage} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Product Name</label>
                                        <div className="flex gap-2">
                                            <input type="text" required className="w-full py-2.5 px-3 border border-[#E7E5E4] rounded-[12px] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 text-sm" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Urea Fertilizer" />
                                            <button 
                                                type="button" 
                                                onClick={handleAIAutofill} 
                                                disabled={isAutofilling}
                                                className="bg-indigo-600 text-white px-3 rounded-[12px] hover:bg-indigo-500 transition-colors flex items-center gap-2 text-xs font-bold shadow-sm"
                                                title="Auto-fill details using AI"
                                            >
                                                {isAutofilling ? <Sparkles size={14} className="animate-spin" /> : <Wand2 size={14} />} 
                                                <span className="hidden sm:inline">Auto-fill</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Category</label>
                                        <div className="relative">
                                            <select className="w-full py-2.5 px-3 border border-[#E7E5E4] rounded-[12px] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 text-sm appearance-none" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                                <option value="">Select...</option>
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Price (₹)</label>
                                            <input type="number" required className="w-full py-2.5 px-3 border border-[#E7E5E4] rounded-[12px] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 text-sm" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Stock</label>
                                            <div className="flex gap-2">
                                                <input type="number" required className="w-full py-2.5 px-3 border border-[#E7E5E4] rounded-[12px] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 text-sm" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} placeholder="0" />
                                                <select className="w-20 px-1 text-center border border-[#E7E5E4] rounded-[12px] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 text-sm" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})}>
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-2 flex items-center gap-2 p-2.5 bg-gray-50 rounded-[12px] border border-[#E7E5E4] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setProductForm({...productForm, is_active: !productForm.is_active})}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${productForm.is_active !== false ? 'bg-[#064E3B] border-[#064E3B]' : 'bg-white border-gray-400'}`}>
                                            {productForm.is_active !== false && <CheckCircle size={12} className="text-white" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">Show in Catalog</span>
                                    </div>

                                    <button type="submit" disabled={uploadingImage} className="md:col-span-2 bg-[#064E3B] text-white py-3.5 rounded-[12px] font-bold shadow-lg hover:bg-[#053d2e] active:scale-[0.98] transition-all text-sm flex justify-center items-center gap-2 mt-1">
                                        <Save size={18} />
                                        {editingId ? 'Update Product' : 'Save Product'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredProducts.map((p) => (
                        <div key={p.id} className={`bg-white rounded-[16px] p-3 shadow-sm border border-[#E7E5E4] flex gap-3 transition-all hover:border-[#064E3B]/20 ${p.is_active === false ? 'opacity-60 grayscale' : ''}`}>
                             <div className="w-16 h-16 rounded-[10px] bg-gray-100 flex-shrink-0 overflow-hidden border border-[#E7E5E4]">
                                <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt={p.name} />
                             </div>
                             <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1 leading-snug">{p.name}</h4>
                                        {p.is_active === false && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded border border-red-100">Hidden</span>}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#78350F] bg-[#FFFCF0] px-2 py-0.5 rounded-md mt-1 inline-block border border-[#E7E5E4]">{p.category}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Stock: {p.stock} {p.unit}</span>
                                        <div className="font-black text-[#064E3B] text-sm">₹{p.price}</div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setEditingId(p.id); setProductForm(p); setIsFormOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 active:scale-95 transition-transform"><Edit2 size={14}/></button>
                                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 active:scale-95 transition-transform"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
            <div className="space-y-3 animate-fade-in">
                 {orders.length === 0 ? <div className="p-10 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-[#E7E5E4]">No orders received yet.</div> : (
                     orders.map(order => (
                         <div key={order.id} className="bg-white rounded-[20px] shadow-sm border border-[#E7E5E4] overflow-hidden hover:border-[#064E3B]/20 transition-colors">
                             <div className="bg-[#FFFCF0] p-4 border-b border-[#E7E5E4] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#064E3B] font-bold border border-[#D1FAE5]">
                                         #{order.id.slice(0, 4)}
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-[var(--text-primary)]">{order.customer_name}</p>
                                         <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                             <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}
                                         </p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="block text-lg font-black text-[#064E3B]">₹{order.total_price}</span>
                                 </div>
                             </div>
                             
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Items</p>
                                     <div className="bg-gray-50 rounded-[16px] p-3 space-y-2 border border-[#E7E5E4]">
                                         {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                                             <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-200 last:border-0 pb-1 last:pb-0">
                                                 <span className="font-medium text-gray-700">{item.quantity} x {item.name}</span>
                                                 <span className="font-bold text-[#064E3B]">₹{item.price * item.quantity}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                                 
                                 <div className="flex flex-col justify-between gap-4">
                                     <div>
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Details</p>
                                         <div className="space-y-1">
                                             <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-[12px] border border-[#E7E5E4]">
                                                 <Phone size={14} className="text-gray-400" /> <a href={`tel:${order.phone}`} className="hover:text-blue-600">{order.phone}</a>
                                             </div>
                                             <div className="flex items-start gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-[12px] border border-[#E7E5E4]">
                                                 <MapPin size={14} className="text-gray-400 mt-0.5" /> <span>{order.address}</span>
                                             </div>
                                         </div>
                                     </div>

                                     <div>
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Update Status</p>
                                         <select 
                                             value={order.status || 'pending'} 
                                             onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                             className="w-full bg-white border border-[#E7E5E4] rounded-[12px] px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-[#064E3B] outline-none text-[var(--text-primary)]"
                                         >
                                             {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                         </select>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className={`px-4 py-2 text-xs font-bold text-center border-t border-opacity-20 ${STATUS_OPTIONS.find(s => s.value === order.status)?.color}`}>
                                 STATUS: {order.status?.toUpperCase() || 'PENDING'}
                             </div>
                         </div>
                     ))
                 )}
            </div>
        )}

        {/* --- UPDATES TAB --- */}
        {activeTab === 'updates' && (
             <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
                <div className="bg-white rounded-[24px] shadow-sm border border-[#E7E5E4] p-5">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Bell size={18} /> New Announcement</h3>
                    <form onSubmit={saveUpdate} className="flex flex-col gap-3">
                        <textarea 
                            required 
                            placeholder="Type update here..." 
                            className="w-full p-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0] text-sm font-medium resize-none h-28 text-gray-800 placeholder-gray-400"
                            value={updateText} 
                            onChange={e => setUpdateText(e.target.value)} 
                        />
                        <button type="submit" className="bg-[#064E3B] text-white py-3 rounded-[12px] font-bold text-sm hover:bg-[#053d2e] active:scale-95 transition-all shadow-md self-end px-8">
                            Post Update
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Recent Posts</h3>
                    {updates.map((u) => (
                        <div key={u.id} className="bg-white p-4 rounded-[20px] border border-[#E7E5E4] flex gap-4 items-start shadow-sm relative group hover:bg-[#FFFCF0] transition-colors">
                            <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Bell size={18} />
                                </div>
                                <div className="h-full w-0.5 bg-gray-100 rounded-full"></div>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-gray-700 font-medium text-sm leading-relaxed">{u.content}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(u.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => deleteUpdate(u.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <style>{`
        .input-dark {
            @apply w-full py-2.5 px-3 rounded-[12px] border border-[#E7E5E4] bg-white focus:ring-2 focus:ring-[#064E3B] outline-none transition-all text-sm font-bold text-gray-800 placeholder-gray-400;
        }
      `}</style>
    </div>
  );
};