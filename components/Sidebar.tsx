
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Database } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-20 transition-all duration-300">
      <div className="p-6 flex items-center space-x-3 space-x-reverse border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-black">B</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">بناء برو</span>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          قاعدة البيانات متصلة
        </div>
        <div className="text-[10px] text-slate-500">
          الإصدار 1.2.0 &copy; 2024
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
