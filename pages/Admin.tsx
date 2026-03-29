import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Product, Order, StoreUpdate } from '../types';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Package, ShoppingBag, Bell, ChevronDown, Image as ImageIcon,
  Search, Calendar, Phone, Clock, AlertTriangle, Loader2,
  Inbox, User, ArrowLeft
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';

// Helper function to create image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

// Helper function to get cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  canvas.width = image.width
  canvas.height = image.height

  ctx.translate(image.width / 2, image.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return ''
  }

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return croppedCanvas.toDataURL('image/jpeg', 0.8)
}

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
  
  // Crop State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // Product Form
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', category: '', price: '' as any, stock: '' as any, image_url: '', unit: 'kg', is_active: true 
  });
  
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

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (isFormOpen) {
      window.history.pushState({ modal: 'product-form' }, '');
      const handlePopState = () => {
        setIsFormOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isFormOpen]);

  const closeForm = () => {
    if (window.history.state?.modal === 'product-form') {
      window.history.back();
    } else {
      setIsFormOpen(false);
    }
  };

  const init = async () => {
    await fetchData();
  };

  const loadProducts = async () => {
    try {
      if (!supabase) return;
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
      if (!supabase) return;
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
      if (!supabase) return;
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
          setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      setProductForm(prev => ({ ...prev, image_url: croppedImage }));
      setCropImageSrc(null);
    } catch (e) {
      console.error(e);
      showToast("Error cropping image", "error");
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
        closeForm();
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
    if (!supabase) return;

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
        
        {/* Back Button */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => window.history.back()} 
                className="p-2 bg-[var(--card-bg)] rounded-xl text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold text-[var(--text-primary)]">Back</span>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
                    onClick={() => { setActiveTab(tab.id as any); resetForms(); closeForm(); }}
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
                        onClick={() => { resetForms(); setIsFormOpen(true); }}
                        className="bg-[var(--primary-btn)] text-white px-4 md:px-6 rounded-[12px] font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden md:inline">Add Product</span>
                    </button>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
                        <div className="bg-[var(--bg-main)] w-full max-w-lg max-h-[80vh] rounded-[24px] shadow-2xl relative z-10 flex flex-col animate-slide-up overflow-hidden border border-[var(--border-color)]">
                            <div className="bg-[var(--bg-main)] px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors duration-200">
                                <div className="flex items-center gap-3">
                                    <button onClick={closeForm} className="p-2 -ml-2 hover:bg-[var(--card-bg)] rounded-full transition-colors text-[var(--text-primary)]">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="font-bold text-[var(--text-primary)] text-base">
                                        {editingId ? 'Edit Product' : 'Add Product'}
                                    </h3>
                                </div>
                                <button onClick={closeForm} className="p-2 hover:bg-[var(--card-bg)] rounded-full transition-colors text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <form id="product-form" onSubmit={saveProduct} className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--border-color)] rounded-[16px] bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] transition-colors relative group">
                                            {productForm.image_url ? (
                                                <div className="relative w-24 h-24 rounded-[16px] overflow-hidden shadow-sm border border-[var(--border-color)]">
                                                    <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-gray-300 border border-[var(--border-color)]">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                            
                                            <label className="cursor-pointer">
                                                <span className="bg-[var(--card-bg)] text-[var(--text-body)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-[10px] font-bold shadow-sm hover:bg-[var(--bg-main)] transition-all inline-block">
                                                    {isSaving ? 'Processing...' : 'Choose Image'}
                                                </span>
                                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isSaving} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Product Name</label>
                                        <input type="text" required className="w-full py-2 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Urea Fertilizer" />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Category</label>
                                        <div className="relative">
                                            <select className="w-full py-2 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm appearance-none" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                                <option value="">Select...</option>
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Price (₹)</label>
                                            <input type="number" required className="w-full py-2 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Stock</label>
                                            <div className="flex gap-2">
                                                <input type="number" required className="w-full py-2 px-3 border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} placeholder="0" />
                                                <select className="w-20 px-1 text-center border border-[var(--border-color)] rounded-[12px] focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--input-bg)] font-bold text-[var(--text-primary)] text-sm" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})}>
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-[var(--bg-main)]/50 rounded-[12px] border border-[var(--border-color)]">
                                        <span className="text-sm font-bold text-[var(--text-body)]">Show in Catalog</span>
                                        <button
                                            type="button"
                                            onClick={() => setProductForm({ ...productForm, is_active: !productForm.is_active })}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                                productForm.is_active !== false ? 'bg-emerald-600' : 'bg-[var(--bg-main)]'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                    productForm.is_active !== false ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="bg-[var(--card-bg)] p-3 border-t border-[var(--border-color)] sticky bottom-0 z-20 shrink-0 w-full">
                                <button form="product-form" type="submit" disabled={isSaving} className="w-full bg-[var(--primary-btn)] text-white py-3 rounded-[12px] font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingId ? 'Update Product' : 'Save Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {cropImageSrc && (
                    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setCropImageSrc(null)} />
                        <div className="bg-[var(--card-bg)] rounded-[24px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col border border-[var(--border-color)]">
                            <div className="bg-[var(--bg-main)] px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center sticky top-0 z-20 shrink-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2 font-serif">
                                    <ImageIcon size={18} className="text-emerald-600"/>
                                    Crop Image
                                </h3>
                                <button onClick={() => setCropImageSrc(null)} className="bg-[var(--card-bg)] p-2 rounded-full hover:bg-[var(--bg-main)] border border-[var(--border-color)] transition-colors text-gray-500"><X size={18} /></button>
                            </div>
                            <div className="relative w-full h-[400px] bg-black/10">
                                <Cropper
                                  image={cropImageSrc}
                                  crop={crop}
                                  zoom={zoom}
                                  aspect={1}
                                  onCropChange={setCrop}
                                  onCropComplete={onCropComplete}
                                  onZoomChange={setZoom}
                                />
                            </div>
                            <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex justify-end gap-2">
                                <button onClick={() => setCropImageSrc(null)} className="px-4 py-2 rounded-[12px] font-bold text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                <button onClick={handleCropImage} className="bg-[var(--primary-btn)] text-white px-6 py-2 rounded-[12px] font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all">Crop & Save</button>
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
                            <div key={order.id} className="bg-[var(--card-bg)] rounded-[16px] p-3 shadow-sm border border-[var(--border-color)] transition-all hover:border-emerald-500/20">
                                {/* Row 1: Order ID + Status */}
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{order.id.slice(0, 8).toUpperCase()}</span>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                            STATUS_OPTIONS.find(opt => opt.value === order.status)?.color || 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={order.status || 'pending'}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="bg-transparent text-[10px] font-bold text-[var(--text-primary)] outline-none cursor-pointer pr-4 appearance-none"
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value} className="bg-[var(--card-bg)]">{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Row 2: Customer name + phone */}
                                <div className="flex justify-between items-center mb-2 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                                        <User size={12} className="text-gray-400" />
                                        <span>{order.customer_name}</span>
                                    </div>
                                    <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-blue-500 font-medium">
                                        <Phone size={12} />
                                        <span>{order.phone}</span>
                                    </a>
                                </div>

                                {/* Row 3: Total amount + Date */}
                                <div className="flex justify-between items-end pt-2 border-t border-[var(--border-color)] border-dashed">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Total Amount</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400">₹{order.total}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                        <Calendar size={10} />
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                {/* Collapsible Items (Optional, but good for detail) */}
                                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Items</p>
                                    <div className="space-y-1">
                                        {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-[10px] text-[var(--text-body)]">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-bold">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
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
