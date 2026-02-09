import React, { useState, useEffect } from 'react';
import { Package, Search, Phone, MapPin, Loader2, X, Save, Building, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Supplier } from '../types';
import { CURRENCY } from '../constants';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    phone: '',
    address: '',
    materialType: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      
      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        address: s.address,
        materialType: s.material_type,
        totalPurchases: s.total_purchases || 0
      }));
      setSuppliers(mapped);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        material_type: formData.materialType
      };

      if (editingId) {
        const { error } = await supabase.from('suppliers').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('suppliers').insert([payload]);
        if (error) throw error;
      }
      closeModal();
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('خطأ في حفظ بيانات المورد');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (error) {
      alert('فشل حذف المورد');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      phone: supplier.phone || '',
      address: supplier.address || '',
      materialType: supplier.materialType || ''
    });
    setEditingId(supplier.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.materialType && s.materialType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن مورد أو نوع مادة..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
          <Package size={18} />
          إضافة مورد
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingId ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم المورد / الشركة</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">نوع المواد الموردة</label>
                <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  placeholder="مثال: إسمنت، حديد، خشب..."
                  value={formData.materialType} onChange={e => setFormData({...formData, materialType: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">رقم الهاتف</label>
                <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left" dir="ltr"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">العنوان</label>
                <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <button disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4">
                {saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> {editingId ? 'حفظ التعديلات' : 'حفظ البيانات'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Building size={24} />
                </div>
                <div className="flex gap-1">
                   <button onClick={() => handleEdit(supplier)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                   <button onClick={() => handleDelete(supplier.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                 <h3 className="font-bold text-slate-800 text-lg">{supplier.name}</h3>
                 <span className="px-2 py-0.5 bg-slate-50 rounded text-[9px] font-bold text-slate-500">{supplier.materialType || 'عام'}</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Phone size={14} className="text-slate-400" />
                  <span>{supplier.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{supplier.address || '-'}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4">
                <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">إجمالي المشتريات</p>
                <p className="font-bold text-slate-700">
                  {supplier.totalPurchases?.toLocaleString()} {CURRENCY}
                </p>
              </div>
            </div>
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400">
              لا يوجد موردين مطابقين للبحث.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Suppliers;