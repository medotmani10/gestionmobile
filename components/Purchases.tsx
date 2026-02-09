
import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Filter, Truck, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Purchase } from '../types';

const Purchases: React.FC = () => {
  const [items, setItems] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    try {
      const { data, error } = await supabase.from('purchases').select('*').order('date', { ascending: false });
      if (error) throw error;

      const mappedData = data.map((p: any) => ({
        id: p.id,
        project: p.project_name,
        item: p.item,
        quantity: p.quantity, // Note: quantity in schema is text (e.g. "50 طن") or number, handling as is
        total: p.total,
        supplier: p.supplier,
        status: p.status,
        date: p.date
      }));
      setItems(mappedData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalPurchases = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const pendingOrders = items.filter(i => i.status !== 'تم الاستلام').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">طلبات التوريد والمشتريات</h2>
            <p className="text-xs text-slate-400">إدارة المواد الأولية والموردين</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">
          طلب شراء جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">إجمالي المشتريات</p>
          <p className="text-2xl font-black text-slate-800">SAR {totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">طلبات بانتظار الاستلام</p>
          <p className="text-2xl font-black text-amber-600">{pendingOrders} طلبات</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">أكثر الموردين تعاملاً</p>
          <p className="text-xl font-black text-blue-600">الحديد والصلب المتحدة</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
           <div className="relative w-72">
             <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="بحث في المشتريات..." className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none" />
           </div>
           <button className="text-xs font-bold text-slate-500 flex items-center gap-1"><Filter size={14}/> تصفية متقدمة</button>
        </div>
        
        {loading ? (
           <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-50">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">المشروع</th>
                  <th className="px-6 py-4">المادة</th>
                  <th className="px-6 py-4">الكمية</th>
                  <th className="px-6 py-4">الإجمالي</th>
                  <th className="px-6 py-4">المورد</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-[100px]" title={po.id}>{po.id.substring(0,8)}...</td>
                    <td className="px-6 py-4 text-slate-600">{po.project}</td>
                    <td className="px-6 py-4 font-medium">{po.item}</td>
                    <td className="px-6 py-4 text-slate-500">{po.quantity}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">SAR {po.total?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-blue-600 text-xs font-bold underline cursor-pointer">{po.supplier}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold w-fit ${
                        po.status === 'تم الاستلام' ? 'bg-green-100 text-green-700' : 
                        po.status === 'قيد الشحن' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {po.status === 'تم الاستلام' ? <CheckCircle2 size={12}/> : 
                        po.status === 'قيد الشحن' ? <Truck size={12}/> : <Clock size={12}/>}
                        {po.status}
                      </span>
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

export default Purchases;
