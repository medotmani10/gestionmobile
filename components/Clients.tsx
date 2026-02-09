import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, Mail, MapPin, MoreHorizontal, Loader2, X, Save } from 'lucide-react';
import { supabase } from '../supabase';
import { Client } from '../types';
import { CURRENCY } from '../constants';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('clients').insert([formData]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchClients();
    } catch (err) {
      alert('خطأ في إضافة العميل');
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن عميل..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
          <UserPlus size={18} />
          إضافة عميل
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">إضافة عميل جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم العميل / الشركة</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">رقم الجوال</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left" dir="ltr"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">البريد الإلكتروني</label>
                <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left" dir="ltr"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">العنوان</label>
                <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <button disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4">
                {saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> حفظ البيانات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl group-hover:scale-110 transition-transform">
                  {client.name.charAt(0)}
                </div>
                <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={20}/></button>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-4">{client.name}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Phone size={12} /></div>
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Mail size={12} /></div>
                  <span>{client.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">المشاريع</p>
                  <p className="font-bold text-slate-700">{client.totalProjects || 0}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">المديونية</p>
                  <p className={`font-bold ${Number(client.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(client.totalDebt || 0).toLocaleString()} {CURRENCY}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clients;