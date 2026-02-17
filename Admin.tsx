import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'next/navigation';
import { Product, Order } from '../types';
import { Plus, Trash2, Edit2, LogOut, Save, X, ArrowLeft, Package, ShoppingBag, Calendar } from 'lucide-react';
import Link from 'next/link';

export const Admin: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    image_url: ''
  });

  useEffect(() => {
    // We can assume user is authenticated here because of ProtectedRoute wrapper
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch (error) {
      console.error("Error loading admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching orders:", error);
    }
    setOrders(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- Product Handlers ---

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
    else alert("Failed to delete. Check console for details.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingId) {
      const { error } = await supabase.from('products').update(formData).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchProducts();
      } else {
        alert("Update failed: " + error.message);
      }
    } else {
      const { error } = await supabase.from('products').insert([formData]);
      if (!error) {
        resetForm();
        fetchProducts();
      } else {
        alert("Creation failed: " + error.message);
      }
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: 0, stock: 0, image_url: '' });
    setEditingId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFCF0]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#064E3B]"></div>
        <p className="text-[#064E3B] font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFCF0] pb-20">
      {/* Admin Header */}
      <div className="bg-[#FFFCF0]/95 backdrop-blur-sm border-b border-[#E7E5E4] px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
              <ArrowLeft size={20} className="text-[var(--text-primary)]" />
            </Link>
            <h1 className="font-bold text-xl text-[var(--text-primary)] font-serif">Store Manager</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#78350F] hover:text-red-600 flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#E7E5E4]/50 rounded-xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[#78350F] hover:bg-white/50'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[#78350F] hover:bg-white/50'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {activeTab === 'products' ? (
          <>
            {/* Product Form */}
            <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E7E5E4] p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)] font-serif">
                  {editingId ? <Edit2 size={20} className="text-blue-500"/> : <Plus size={20} className="text-[var(--text-primary)]"/>}
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#78350F] uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Urea 50kg"
                    className="w-full p-3 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0]"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[#78350F] uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full p-3 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0]"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#78350F] uppercase tracking-wider mb-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0]"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#78350F] uppercase tracking-wider mb-1">Stock</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0]"
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        required
                      />
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#78350F] uppercase tracking-wider mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full p-3 border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#064E3B] outline-none bg-[#FFFCF0]"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>

                <div className="mt-2">
                  <button 
                    type="submit"
                    className={`w-full py-4 rounded-[16px] font-bold text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#064E3B] hover:bg-[#065E4B]'}`}
                  >
                    {editingId ? <Save size={18} /> : <Plus size={18} />}
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E7E5E4] overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFCF0]/50 flex justify-between items-center">
                <h3 className="font-bold text-[var(--text-primary)] font-serif">Inventory ({products.length})</h3>
              </div>
              
              <div className="divide-y divide-[#E7E5E4]">
                {products.map(product => (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-[#FFFCF0] transition-colors">
                    <img 
                      src={product.image_url || 'https://via.placeholder.com/50'} 
                      alt={product.name} 
                      className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1">{product.name}</h4>
                      <div className="text-[10px] text-[#78350F] flex gap-2 mt-1">
                        <span className="bg-[#FFEDD5] px-2 py-0.5 rounded-full font-bold">{product.category}</span>
                        <span className="font-bold opacity-70">Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="text-right mr-2">
                      <div className="font-black text-[var(--text-primary)]">₹{product.price}</div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => startEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg active:scale-90 transition-transform"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg active:scale-90 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No products in inventory.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Orders List */
          <div className="space-y-4 animate-fade-in">
             {orders.length === 0 ? (
               <div className="text-center py-20 opacity-50">
                 <ShoppingBag size={48} className="mx-auto mb-4 text-[#78350F]" />
                 <p className="font-bold text-[var(--text-primary)]">No orders yet</p>
               </div>
             ) : (
               orders.map((order) => (
                 <div key={order.id} className="bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E7E5E4] overflow-hidden">
                   <div className="bg-[#FFFCF0]/50 p-4 border-b border-[#E7E5E4] flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#064E3B]">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#78350F] uppercase tracking-wider">Order ID</p>
                          <p className="text-xs font-bold text-[var(--text-primary)]">#{order.id.slice(0, 8)}</p>
                        </div>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-[#78350F] uppercase tracking-wider flex items-center justify-end gap-1">
                         <Calendar size={10} />
                         {new Date(order.created_at).toLocaleDateString()}
                       </p>
                       <p className="text-sm font-black text-[var(--text-primary)]">₹{order.total_price}</p>
                     </div>
                   </div>
                   <div className="p-4">
                     <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">Items</p>
                     <div className="space-y-2">
                       {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-[#E7E5E4] last:border-0 pb-1 last:pb-0">
                           <span className="text-gray-700 font-medium">
                             {item.quantity}x {item.name}
                           </span>
                           <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>
    </div>
  );
};