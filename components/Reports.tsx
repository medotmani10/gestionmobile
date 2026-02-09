import React, { useEffect, useState } from 'react';
import { BarChart3, FileSpreadsheet, FilePieChart, Download, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { CURRENCY } from '../constants';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    avgProgress: 0,
    activeCount: 0,
    totalBudget: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    try {
      setLoading(true);
      const { data: projects, error } = await supabase.from('projects').select('*');
      if (error) throw error;

      if (projects) {
        const activeProjects = projects.filter((p: any) => p.status === 'نشط');
        const avgProgress = activeProjects.length 
          ? activeProjects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / activeProjects.length 
          : 0;
        
        const totalBudget = projects.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0);
        const totalExpenses = projects.reduce((sum: number, p: any) => sum + (Number(p.expenses) || 0), 0);

        setReportData({
          avgProgress: Math.round(avgProgress),
          activeCount: activeProjects.length,
          totalBudget,
          totalExpenses
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const reports = [
    { title: 'تقرير الأرباح والخسائر', type: 'مالي', icon: <FilePieChart className="text-blue-500" /> },
    { title: 'كشف حضور العمال', type: 'إداري', icon: <FileSpreadsheet className="text-green-500" /> },
    { title: 'أداء المشاريع السنوي', type: 'فني', icon: <BarChart3 className="text-purple-500" /> },
    { title: 'جرد المشتريات', type: 'مخازن', icon: <FileSpreadsheet className="text-amber-500" /> },
  ];

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">مركز التقارير الذكي</h2>
            <p className="text-slate-400 text-sm mt-1">إحصائيات مباشرة من قاعدة البيانات</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100">
            بيانات حية ومحدثة
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reports.map((report, idx) => (
            <div key={idx} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {report.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{report.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">تصنيف: {report.type}</p>
              <button className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline">
                <Download size={14} />
                تصدير PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 mb-8">تحليل أداء المشاريع النشطة</h3>
           <div className="space-y-8">
              <div>
                 <div className="flex justify-between text-xs mb-3">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">متوسط إنجاز المشاريع ({reportData.activeCount})</span>
                    <span className="font-black text-blue-600">{reportData.avgProgress}%</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{width: `${reportData.avgProgress}%`}}></div>
                 </div>
              </div>
              
              <div>
                 <div className="flex justify-between text-xs mb-3">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">استهلاك الميزانية المجمع</span>
                    <span className="font-black text-amber-600">
                      {reportData.totalBudget > 0 
                        ? Math.round((reportData.totalExpenses / reportData.totalBudget) * 100) 
                        : 0}%
                    </span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                      style={{width: `${reportData.totalBudget > 0 ? (reportData.totalExpenses / reportData.totalBudget) * 100 : 0}%`}}
                    ></div>
                 </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إجمالي الميزانيات</p>
                  <p className="font-black text-slate-800 text-xl">{reportData.totalBudget.toLocaleString()} <span className="text-xs font-normal">{CURRENCY}</span></p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إجمالي المصروفات</p>
                  <p className="font-black text-red-600 text-xl">{reportData.totalExpenses.toLocaleString()} <span className="text-xs font-normal">{CURRENCY}</span></p>
                </div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6">التحليل التلقائي</h3>
              <p className="text-slate-400 text-sm mb-10 leading-loose min-h-[80px]">
                بناءً على المعطيات الحقيقية لـ {reportData.activeCount} مشاريع، نلاحظ أن معدل الإنجاز ({reportData.avgProgress}%) يتماشى مع المصاريف التشغيلية. النظام الجزائري "بناء برو" يقترح عليك موازنة المشتريات لتقليل تكاليف المواد.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                    <p className="text-[10px] text-blue-400 font-bold mb-1">الرؤية</p>
                    <p className="text-xs font-medium truncate">استقرار مالي جيد</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                    <p className="text-[10px] text-green-400 font-bold mb-1">التوصية</p>
                    <p className="text-xs font-medium truncate">تحسين المشتريات</p>
                 </div>
              </div>
           </div>
           <BarChart3 size={200} className="absolute -right-20 -bottom-20 text-white/5 group-hover:rotate-12 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};

export default Reports;