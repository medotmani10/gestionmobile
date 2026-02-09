
import React, { useEffect, useState } from 'react';
import { UserPlus, HardHat, CheckCircle, XCircle, Loader2, X, Save } from 'lucide-react';
import { supabase } from '../supabase';
import { Worker } from '../types';

const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    phone: '',
    daily_rate: 0,
    current_project: ''
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('workers').select('*').order('name');
      if (error) throw error;
      
      const mappedWorkers: Worker[] = data.map((w: any) => ({
        id: w.id,
        name: w.name,
        trade: w.trade,
        phone: w.phone,
        dailyRate: w.daily_rate,
        currentProject: w.current_project,
        isActive: w.is_active
      }));
      setWorkers(mappedWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('workers').insert([formData]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ name: '', trade: '', phone: '', daily_rate: 0, current_project: '' });
      fetchWorkers();
    } catch (err) {
      alert('خطأ في إضافة العامل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-1">إجمالي العمال</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : workers.length}</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-1">النشطين</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : workers.filter(w => w.isActive).length}
            </p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30">
          <UserPlus size={18} />
          إضافة عامل جديد
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">إضافة عامل جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddWorker} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم العامل</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">التخصص / الحرفة</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  placeholder="مثال: سباك، نجار، كهربائي"
                  value={formData.trade} onChange={e => setFormData({...formData, trade: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">رقم الجوال</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left" dir="ltr"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">اليومية (SAR)</label>
                  <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left" dir="ltr"
                    value={formData.daily_rate} onChange={e => setFormData({...formData, daily_rate: Number(e.target.value)})} />
                </div>
              </div>
              <button disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4">
                {saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> حفظ البيانات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">العامل</th>
                  <th className="px-6 py-4 font-bold">التخصص</th>
                  <th className="px-6 py-4 font-bold">المشروع الحالي</th>
                  <th className="px-6 py-4 font-bold">اليومية (SAR)</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map(worker => (
                  <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <HardHat size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{worker.name}</p>
                          <p className="text-[10px] text-slate-400 truncate w-20">{worker.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{worker.trade}</td>
                    <td className="px-6 py-4 text-slate-600">{worker.currentProject || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{worker.dailyRate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                        worker.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {worker.isActive ? <CheckCircle size={10}/> : <XCircle size={10}/>}
                        {worker.isActive ? 'نشط' : 'إجازة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-bold text-xs ml-4">سجل الحضور</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workers;
