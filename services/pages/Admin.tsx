import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Plus, Trash2, Edit2, LogOut, Save, X } from 'lucide-react';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    image_url: ''
  });

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      fetchProducts();
    } else {
      alert('Error deleting product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', editingId);
        
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([formData]);
        
      if (!error) {
        resetForm();
        fetchProducts();
      }
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      image_url: ''
    });
    setEditingId(null);
  };

  // Function to seed initial data if empty
  const seedData = async () => {
    const seedProducts = [
      {
        name: "Urea Fertilizer 45kg",
        category: "Fertilizer",
        price: 266,
        stock: 100,
        image_url: "https://images.unsplash.com/photo-1627920769842-6887c91c3608?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "DAP (Di-ammonium Phosphate)",
        category: "Fertilizer",
        price: 1350,
        stock: 50,
        image_url: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "Hybrid Wheat Seeds",
        category: "Seeds",
        price: 800,
        stock: 200,
        image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800"
      }
    ];

    await supabase.from('products').insert(seedProducts);
    fetchProducts();
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="font-bold text-xl text-gray-800">Store Manager</h1>
        <button 
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-500 flex items-center gap-2 text-sm font-medium"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Product Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {editingId ? <Edit2 size={20} className="text-blue-500"/> : <Plus size={20} className="text-emerald-500"/>}
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
              <input
                type="text"
                placeholder="e.g. Urea 50kg"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Seeds">Seeds</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Tools">Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
              <input
                type="number"
                placeholder="0"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <button 
                type="submit"
                className={`w-full py-3 rounded-lg font-bold text-white shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Inventory ({products.length})</h3>
            {products.length === 0 && (
              <button onClick={seedData} className="text-xs text-emerald-600 underline">Add Demo Data</button>
            )}
          </div>
          
          <div className="divide-y">
            {products.map(product => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <img 
                  src={product.image_url || 'https://via.placeholder.com/50'} 
                  alt={product.name} 
                  className="w-12 h-12 rounded object-cover bg-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{product.name}</h4>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{product.category}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold text-emerald-600">₹{product.price}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No products in inventory.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
