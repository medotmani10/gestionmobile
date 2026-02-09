
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Landmark, Loader2, Plus } from 'lucide-react';
import { supabase } from '../supabase';
import { Transaction } from '../types';
import { CURRENCY } from '../constants';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    clientDebt: 0,
    supplierDebt: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (txError) throw txError;

      const { data: clientData } = await supabase.from('clients').select('total_debt');
      const { data: purchasesData } = await supabase.from('purchases').select('total').neq('status', 'تم الاستلام');

      const allTx = (txData || []).map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        method: t.method,
        status: t.status,
        type: t.type as 'income' | 'expense'
      }));

      const totalIncome = allTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = allTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      const currentMonth = new Date().getMonth();
      const monthlyIncome = allTx.filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth).reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpense = allTx.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth).reduce((sum, t) => sum + t.amount, 0);

      const totalClientDebt = clientData?.reduce((sum, c) => sum + (Number(c.total_debt) || 0), 0) || 0;
      const totalSupplierDebt = purchasesData?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) || 0;

      setTransactions(allTx);
      setFinancials({
        balance, monthlyIncome, monthlyExpense,
        clientDebt: totalClientDebt,
        supplierDebt: totalSupplierDebt
      });

    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-[32px] shadow-2xl shadow-blue-900/30 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium opacity-70 mb-2">الرصيد الصافي الحالي</p>
            <h2 className="text-3xl font-black mb-10">{financials.balance.toLocaleString()} <span className="text-lg font-normal opacity-60">{CURRENCY}</span></h2>
            <div className="flex justify-between items-center">
               <div>
                  <p className="text-[10px] text-blue-200 uppercase tracking-widest mb-1">الوضعية المالية</p>
                  <p className="font-bold text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">{financials.balance >= 0 ? 'رصيد إيجابي' : 'عجز مالي'}</p>
               </div>
               <Landmark size={44} className="opacity-10" />
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><ArrowUpRight size={24}/></div>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">هذا الشهر</span>
           </div>
           <div className="mt-4">
              <p className="text-slate-400 text-xs mb-1">إجمالي المداخيل</p>
              <p className="text-2xl font-black text-slate-800">{financials.monthlyIncome.toLocaleString()} <span className="text-xs font-normal text-slate-400">{CURRENCY}</span></p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ArrowDownRight size={24}/></div>
              <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase">هذا الشهر</span>
           </div>
           <div className="mt-4">
              <p className="text-slate-400 text-xs mb-1">إجمالي المصاريف</p>
              <p className="text-2xl font-black text-slate-800">{financials.monthlyExpense.toLocaleString()} <span className="text-xs font-normal text-slate-400">{CURRENCY}</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">سجل المعاملات</h3>
            <button onClick={fetchData} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><Plus size={20} className="text-blue-600"/></button>
          </div>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString('ar-DZ')} • {tx.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} {CURRENCY}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[28px] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-8">المستحقات والديون</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">مستحقات العملاء</span>
                <span className="font-black text-slate-800">{financials.clientDebt.toLocaleString()} {CURRENCY}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ديون الموردين</span>
                <span className="font-black text-amber-600">{financials.supplierDebt.toLocaleString()} {CURRENCY}</span>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all">تصدير التقرير المالي</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
