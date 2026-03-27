import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Product, Order, StoreUpdate } from '../types';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Package, ShoppingBag, Bell, ChevronDown, Image as ImageIcon, Sparkles, Wand2,
  Search, Calendar, MapPin, Phone, Clock, AlertTriangle, Loader2,
  Inbox
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';

export const Admin: React.FC = () => {
  const { push } = useNavigation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'updates'>('products');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updates, setUpdates] = useState<StoreUpdate[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Forms & Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Product Form
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', category: '', price: '' as any, stock: '' as any, image_url: '', unit: 'kg', is_active: true 
  });
  const [isAutofilling, setIsAutofilling] = useState(false);
  
  // Update Form
  const [text, setText] = useState('');
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

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([loadProducts(), loadOrders(), loadUpdates()]);
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
          // Use a safer way to access environment variables in Vite
          const apiKey = (import.meta as any).env?.VITE_API_KEY || (typeof process !== 'undefined' ? (process.env as any).API_KEY : undefined);
          if (!apiKey) throw new Error("No API Key configured. Please set VITE_API_KEY.");
          
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
    
    setIsSaving(true);
    try {
        // 1. Check Authentication explicitly before action
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            showToast("Security Check Failed: You must be logged in.", "error");
            push('/login');
            return;
        }

        let finalImageUrl = productForm.image_url;
        
        // Handle Image Upload if base64 (new selection)
        if (finalImageUrl && finalImageUrl.startsWith('data:')) {
             const res = await fetch(finalImageUrl);
             const blob = await res.blob();
             const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
             
             // Upload to 'product-images' bucket
             const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, { 
                    upsert: true,
                    contentType: 'image/png'
                });
             
             if (uploadError) throw new Error(`Image Upload Failed: ${uploadError.message}`);
             
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
             if (error) throw new Error(`Update Failed: ${error.message}`);
             showToast("Product updated successfully!");
        } else {
             const { error } = await supabase.from('products').insert([payload]);
             if (error) throw new Error(`Insert Failed: ${error.message}`);
             showToast("Product added successfully!");
        }
        
        resetForms();
        fetchData();
        setIsFormOpen(false);
    } catch (e: any) {
        console.error(e);
        showToast(e.message || "Something went wrong", "error");
    } finally {
        setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        showToast("Product deleted successfully!");
        fetchData();
    } catch (err) {
        console.error(err);
        showToast("Failed to delete product", "error");
    } finally {
        setDeleteConfirmId(null);
    }
  };

  const postUpdate = async () => {
    if (!text) {
      showToast("Enter update message", "error");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("updates").insert([
      {
        message: text,
      },
    ]);

    setIsSaving(false);
    if (error) {
      showToast("Update failed: " + error.message, "error");
      return;
    }

    showToast("Update posted successfully!");
    setText("");
    fetchData();
  };

  const deleteUpdate = async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('updates').delete().eq('id', id);
      if (error) showToast("Failed to delete update", "error");
      else {
          showToast("Update deleted");
          fetchData();
      }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) showToast("Failed to update status", "error");
      else {
          showToast(`Order marked as ${newStatus}`);
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
  };

  const resetForms = () => {
    setProductForm({ name: '', category: '', price: '' as any, stock: '' as any, image_url: '', unit: 'kg', is_active: true });
    setEditingId(null);
    setText('');
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const ProductSkeleton = () => (
    <div className="bg-[var(--card-bg)] rounded-[16px] p-3 shadow-sm border border-[var(--border-color)] flex gap-3 transition-colors duration-200">
      <div className="w-16 h-16 rounded-[10px] bg-[var(--bg-main)] skeleton flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-[var(--bg-main)] skeleton rounded" />
          <div className="h-3 w-1/4 bg-[var(--bg-main)] skeleton rounded" />
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="h-2 w-12 bg-[var(--bg-main)] skeleton rounded" />
            <div className="h-4 w-16 bg-[var(--bg-main)] skeleton rounded" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-8 h-8 bg-[var(--bg-main)] skeleton rounded-lg" />
            <div className="w-8 h-8 bg-[var(--bg-main)] skeleton rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );

  const OrderSkeleton = () => (
    <div className="bg-[var(--card-bg)] rounded-[20px] shadow-sm border border-[var(--border-color)] overflow-hidden transition-colors duration-200">
      <div className="bg-[var(--bg-main)]/50 p-4 border-b border-[var(--border-color)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] skeleton" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[var(--bg-main)] skeleton rounded" />
            <div className="h-3 w-16 bg-[var(--bg-main)] skeleton rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-[var(--bg-main)] skeleton rounded" />
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-[var(--bg-main)] skeleton rounded" />
          <div className="h-16 w-full bg-[var(--bg-main)] skeleton rounded-[16px]" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-[var(--bg-main)] skeleton rounded" />
            <div className="h-8 w-full bg-[var(--bg-main)] skeleton rounded-[12px]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[var(--bg-main)] skeleton rounded" />
            <div className="h-8 w-full bg-[var(--bg-main)] skeleton rounded-[12px]" />
          </div>
        </div>
      </div>
    </div>
  );

  const UpdateSkeleton = () => (
    <div className="bg-[var(--card-bg)] p-4 rounded-[20px] border border-[var(--border-color)] flex gap-4 items-start shadow-sm transition-colors duration-200">
      <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] skeleton shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-full bg-[var(--bg-main)] skeleton rounded" />
        <div className="h-4 w-2/3 bg-[var(--bg-main)] skeleton rounded" />
        <div className="h-3 w-24 bg-[var(--bg-main)] skeleton rounded" />
      </div>
    </div>
  );

  if (!supabase) {
    return (
        <div className="min-h-[100dvh] bg-[var(--bg-main)] flex items-center justify-center p-6 transition-colors duration-200">
            <div className="bg-[var(--card-bg)] p-8 rounded-[24px] shadow-xl text-center max-w-md w-full border border-[var(--border-color)] transition-colors duration-200">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">Supabase Not Connected</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Please configure your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables to access the Admin Panel.
                </p>
                <button onClick={() => push('/')} className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-body)] hover:bg-[var(--bg-main)] transition-colors">
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <AppLayout activePage="profile" pageTitle="Admin Panel">
      <div className="max-w-5xl mx-auto space-y-5 relative pb-10">
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                <div className="bg-[var(--card-bg)] rounded-[24px] p-6 shadow-2xl relative z-10 w-full max-w-sm border border-[var(--border-color)] animate-scale-in transition-colors duration-200">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-2">Delete Product?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">This action cannot be undone. Are you sure you want to remove this item?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl font-bold text-[var(--text-body)] bg-[var(--bg-main)] hover:bg-[var(--bg-main)]/80 transition-colors border border-[var(--border-color)]">Cancel</button>
                        <button onClick={() => deleteProduct(deleteConfirmId)} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--card-bg)] p-4 rounded-[20px] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
                <span className="text-2xl font-black text-[var(--text-primary)]">{products.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Products</span>
            </div>
            <div className="bg-[var(--card-bg)] p-4 rounded-[20px] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{orders.filter(o => o.status === 'pending').length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Orders</span>
            </div>
            <div className="bg-[var(--card-bg)] p-4 rounded-[20px] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{orders.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[var(--card-bg)] p-1.5 rounded-[16px] flex gap-1 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
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
                        ? 'bg-[var(--primary-btn)] text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-[var(--bg-main)]'
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
                            className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--border-color)] bg-[var(--card-bg)] focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm font-medium text-[var(--text-body)] placeholder-gray-400 transition-colors duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[var(--primary-btn)] text-white px-4 md:px-6 rounded-[12px] font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden md:inline">Add Product</span>
                    </button>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsFormOpen(false)} />
                        <div className="bg-[var(--card-bg)] rounded-[24px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col border border-[var(--border-color)] transition-colors duration-200">
                            <div className="bg-[var(--bg-main)] px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center sticky top-0 z-20 shrink-0 transition-colors duration-200">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2 font-serif">
                                    {editingId ? <Edit2 size={18} className="text-blue-500"/> : <Plus size={18} className="text-emerald-600"/>}
                                    {editingId ? 'Edit Product' : 'Add New Item'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="bg-[var(--card-bg)] p-2 rounded-full hover:bg-[var(--bg-main)] border border-[var(--border-color)] transition-colors text-gray-500"><X size={18} /></button>
                            </div>
                            
                            {/* Polished Modal Content with Tighter Spacing */}
                            <div className="overflow-y-auto p-5">
                                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--border-color)] rounded-[16px] bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] transition-colors relative group">
                                            {productForm.image_url ? (
                                                <div className="relative w-24 h-24 rounded-[12px] overflow-hidden shadow-sm border border-[var(--border-color)]">
                                                    <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-gray-300 border border-[var(--border-color)]">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                            
                                            <label className="cursor-pointer">
                                                <span className="bg-[var(--card-bg)] text-[var(--text-body)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[10px] font-bold shadow-sm hover:bg-[var(--bg-main)] transition-all inline-block">
                                                    {isSaving ? 'Processing...' : 'Choose Image'}
                                                </span>
                                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isSaving} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Product Name</label>
                                        <div className="flex gap-2">
                                            <input type="text" required className="w-full py-2.5 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Urea Fertilizer" />
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
                                            <select className="w-full py-2.5 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm appearance-none" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                                <option value="">Select...</option>
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Price (₹)</label>
                                            <input type="number" required className="w-full py-2.5 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Stock</label>
                                            <div className="flex gap-2">
                                                <input type="number" required className="w-full py-2.5 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} placeholder="0" />
                                                <select className="w-20 px-1 text-center border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})}>
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-2 flex items-center justify-between p-3 bg-[var(--bg-main)]/50 rounded-[12px] border border-[var(--border-color)]">
                                        <span className="text-sm font-bold text-[var(--text-body)]">Show in Catalog</span>
                                        <button
                                            type="button"
                                            onClick={() => setProductForm({ ...productForm, is_active: !productForm.is_active })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                                productForm.is_active !== false ? 'bg-emerald-600' : 'bg-[var(--bg-main)]'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    productForm.is_active !== false ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <button type="submit" disabled={isSaving} className="md:col-span-2 bg-[var(--primary-btn)] text-white py-4 rounded-[12px] font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingId ? 'Update Product' : 'Save Product'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {filteredProducts.length === 0 && !loadingProducts ? (
                    <div className="p-12 text-center bg-[var(--card-bg)] rounded-[24px] border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 animate-fade-in transition-colors duration-200">
                        <div className="w-16 h-16 bg-[var(--bg-main)]/50 rounded-full flex items-center justify-center text-gray-400">
                            <Inbox size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">No products found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                {searchTerm ? `No results for "${searchTerm}". Try a different search term.` : "Your inventory is currently empty. Start by adding your first product."}
                            </p>
                        </div>
                        {!searchTerm && (
                            <button 
                                onClick={() => setIsFormOpen(true)}
                                className="mt-2 bg-[var(--primary-btn)] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
                            >
                                Add First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {loadingProducts ? (
                            Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                        ) : (
                            filteredProducts.map((p) => (
                                <div key={p.id} className={`bg-[var(--card-bg)] rounded-[16px] p-3 shadow-sm border border-[var(--border-color)] flex gap-3 transition-all hover:border-emerald-500/20 hover:shadow-md group ${p.is_active === false ? 'opacity-60 grayscale' : ''}`}>
                                     <div className="w-16 h-16 rounded-[10px] bg-[var(--bg-main)] flex-shrink-0 overflow-hidden border border-[var(--border-color)]">
                                        <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} loading="lazy" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1 leading-snug">{p.name}</h4>
                                                {p.is_active === false && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded border border-red-500/20">Hidden</span>}
                                            </div>
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 inline-block border border-amber-500/20">{p.category}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Stock: {p.stock} {p.unit}</span>
                                                <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{p.price}</div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setEditingId(p.id); setProductForm(p); setIsFormOpen(true); }} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 border border-blue-500/20 active:scale-95 transition-all"><Edit2 size={14}/></button>
                                                <button onClick={() => setDeleteConfirmId(p.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 border border-red-500/20 active:scale-95 transition-all"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
            <div className="space-y-3 animate-fade-in">
                 {orders.length === 0 && !loadingOrders ? (
                    <div className="p-12 text-center bg-[var(--card-bg)] rounded-[24px] border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 animate-fade-in transition-colors duration-200">
                        <div className="w-16 h-16 bg-[var(--bg-main)]/50 rounded-full flex items-center justify-center text-gray-400">
                            <ShoppingBag size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">No orders yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                When customers place orders, they will appear here for you to manage.
                            </p>
                        </div>
                    </div>
                 ) : (
                     loadingOrders ? (
                        Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
                     ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-[var(--card-bg)] rounded-[20px] shadow-sm border border-[#E7E5E4] dark:border-gray-800 overflow-hidden hover:border-[#064E3B]/20 transition-colors duration-200">
                                <div className="bg-[#FFFCF0] dark:bg-gray-800/50 p-4 border-b border-[var(--border-color)] flex justify-between items-center transition-colors duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-900/20 flex items-center justify-center text-[#064E3B] dark:text-emerald-400 font-bold border border-emerald-500/20 dark:border-emerald-900/30">
                                            #{order.id.slice(0, 4)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{order.customer_name}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                     <div className="text-right">
                                       <span className="block text-lg font-black text-[#064E3B] dark:text-emerald-400">₹{order.total}</span>
                                     </div>
                                </div>
                                
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Items</p>
                                        <div className="bg-[var(--bg-main)]/30 rounded-[16px] p-3 space-y-2 border border-[var(--border-color)] transition-colors duration-200">
                                            {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm border-b border-dashed border-[var(--border-color)] last:border-0 pb-1 last:pb-0">
                                                    <span className="font-medium text-[var(--text-body)]">{item.quantity} x {item.name}</span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Details</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-body)] bg-[var(--bg-main)]/30 p-2 rounded-[12px] border border-[var(--border-color)] transition-colors duration-200">
                                                    <Phone size={14} className="text-gray-400" /> <a href={`tel:${order.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{order.phone}</a>
                                                </div>
                                                <div className="flex items-start gap-2 text-xs font-medium text-[var(--text-body)] bg-[var(--bg-main)]/30 p-2 rounded-[12px] border border-[var(--border-color)] transition-colors duration-200">
                                                    <MapPin size={14} className="text-gray-400 mt-0.5" /> <span>{order.address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Update Status</p>
                                            <select 
                                                value={order.status || 'pending'} 
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-[12px] px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--text-primary)] transition-colors duration-200"
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
                     )
                 )}
            </div>
        )}

        {/* --- UPDATES TAB --- */}
        {activeTab === 'updates' && (
             <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
                                <div className="bg-[var(--card-bg)] rounded-[24px] shadow-sm border border-[var(--border-color)] p-5 transition-colors duration-200">
                                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Bell size={18} /> New Announcement</h3>
                                    <form onSubmit={(e) => { e.preventDefault(); postUpdate(); }} className="flex flex-col gap-3">
                                        <textarea 
                                            required 
                                            placeholder="Type update here..." 
                                            className="w-full p-4 rounded-[16px] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] text-sm font-medium resize-none h-28 text-[var(--text-body)] placeholder-gray-400 transition-colors duration-200"
                                            value={text} 
                                            onChange={e => setText(e.target.value)} 
                                        />
                                        <button type="submit" disabled={isSaving} className="bg-[var(--primary-btn)] text-white py-3 rounded-[12px] font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md self-end px-8 disabled:opacity-50">
                                            {isSaving ? 'Posting...' : 'Post Update'}
                                        </button>
                                    </form>
                                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Recent Posts</h3>
                    {updates.length === 0 && !loadingUpdates ? (
                        <div className="p-12 text-center bg-[var(--card-bg)] rounded-[24px] border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 animate-fade-in transition-colors duration-200">
                            <div className="w-16 h-16 bg-[var(--bg-main)]/50 rounded-full flex items-center justify-center text-gray-400">
                                <Bell size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">No updates yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                    Post announcements or store updates to keep your customers informed.
                                </p>
                            </div>
                        </div>
                    ) : (
                        loadingUpdates ? (
                            Array.from({ length: 3 }).map((_, i) => <UpdateSkeleton key={i} />)
                        ) : (
                            updates.map((u) => (
                                <div key={u.id} className="bg-[var(--card-bg)] p-4 rounded-[20px] border border-[var(--border-color)] flex gap-4 items-start shadow-sm relative group hover:bg-[var(--bg-main)]/50 transition-colors duration-200">
                                    <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-gray-400">
                                            <Bell size={18} />
                                        </div>
                                        <div className="h-full w-0.5 bg-[var(--bg-main)] rounded-full"></div>
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <p className="text-[var(--text-body)] font-medium text-sm leading-relaxed">{u.message}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(u.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button onClick={() => deleteUpdate(u.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        )}
      </div>
    </AppLayout>
  );
};
