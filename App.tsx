
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Clients from './components/Clients';
import Workers from './components/Workers';
import Finance from './components/Finance';
import Invoices from './components/Invoices';
import Purchases from './components/Purchases';
import Reports from './components/Reports';
import Suppliers from './components/Suppliers';
import Auth from './components/Auth';
import { Menu, LogOut, Loader2 } from 'lucide-react';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'clients': return <Clients />;
      case 'workers': return <Workers />;
      case 'suppliers': return <Suppliers />;
      case 'finance': return <Finance />;
      case 'invoices': return <Invoices />;
      case 'purchases': return <Purchases />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // إذا لم يكن هناك جلسة، اعرض صفحة المصادقة
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      <main className="flex-1 overflow-y-auto w-full">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate max-w-[200px] md:max-w-none">
                {activeTab === 'dashboard' && 'نظرة عامة'}
                {activeTab === 'projects' && 'المشاريع'}
                {activeTab === 'clients' && 'العملاء'}
                {activeTab === 'workers' && 'العمال'}
                {activeTab === 'suppliers' && 'الموردين'}
                {activeTab === 'finance' && 'المالية'}
                {activeTab === 'invoices' && 'الفواتير'}
                {activeTab === 'purchases' && 'المشتريات'}
                {activeTab === 'reports' && 'التقارير'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:block text-left">
                <p className="text-xs md:text-sm font-semibold">{session.user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 text-right">المسؤول</p>
             </div>
             <button 
               onClick={handleLogout}
               title="تسجيل الخروج"
               className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
             >
               <LogOut size={20} />
             </button>
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                {session.user.email?.[0]}
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 pb-20 md:pb-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;