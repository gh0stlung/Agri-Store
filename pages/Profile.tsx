import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, User, Phone, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      })
      .eq('id', user.id);

    if (error) {
      alert("❌ Error saving profile: " + error.message);
    } else {
      alert("✅ Profile updated successfully");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 font-serif text-[#064E3B]">My Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
            <input 
                type="text" 
                className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
        </div>
        
        <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
            <input 
                type="tel" 
                className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all"
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
            />
        </div>
        
        <div className="relative group">
            <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
            <textarea 
                rows={3}
                className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all resize-none"
                placeholder="Full Address"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
            />
        </div>

        <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-4 rounded-[16px] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6"
        >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
