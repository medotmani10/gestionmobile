
import React from 'react';
import { LayoutDashboard, Briefcase, Users, HardHat, FileText, ShoppingCart, DollarSign, PieChart, Truck, Package } from 'lucide-react';
import { ProjectStatus } from './types';

export const CURRENCY = 'د.ج';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'projects', label: 'المشاريع', icon: <Briefcase size={20} /> },
  { id: 'clients', label: 'العملاء', icon: <Users size={20} /> },
  { id: 'workers', label: 'العمال', icon: <HardHat size={20} /> },
  { id: 'suppliers', label: 'الموردين', icon: <Package size={20} /> },
  { id: 'transport', label: 'النقل والآليات', icon: <Truck size={20} /> },
  { id: 'finance', label: 'النظام المالي', icon: <DollarSign size={20} /> },
  { id: 'invoices', label: 'الفواتير', icon: <FileText size={20} /> },
  { id: 'purchases', label: 'المشتريات', icon: <ShoppingCart size={20} /> },
  { id: 'reports', label: 'التقارير', icon: <PieChart size={20} /> },
];

export const STATUS_COLORS: Record<string, string> = {
  [ProjectStatus.ACTIVE]: 'bg-blue-100 text-blue-700',
  [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [ProjectStatus.DELAYED]: 'bg-red-100 text-red-700',
  [ProjectStatus.PENDING]: 'bg-gray-100 text-gray-700',
};