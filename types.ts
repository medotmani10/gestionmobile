
export enum ProjectStatus {
  ACTIVE = 'نشط',
  COMPLETED = 'مكتمل',
  DELAYED = 'متأخر',
  PENDING = 'قيد الانتظار'
}

export interface InvoiceItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceType = 'شكلية' | 'ضريبية';

export interface Invoice {
  id: string;
  type: InvoiceType;
  date: string;
  projectId: string;
  clientId: string;
  items: InvoiceItem[];
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'مسودة' | 'معلقة' | 'مدفوعة جزئياً' | 'مدفوعة بالكامل' | 'متأخرة';
  dueDate: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  expenses: number;
  progress: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  totalProjects: number;
  totalDebt: number;
  totalPaid?: number; // Calculated on frontend
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  trade: string;
  phone: string;
  dailyRate: number;
  currentProject: string;
  isActive: boolean;
  // Financial properties for UI
  totalDaysWorked?: number;
  totalEarned?: number;
  totalPaid?: number;
  balance?: number;
}

export interface Attendance {
  id: string;
  workerId: string;
  date: string;
  morning: boolean;
  evening: boolean;
}

export interface WorkerPayment {
  id: string;
  workerId: string;
  amount: number;
  date: string;
  notes: string;
}

export interface Purchase {
  id: string;
  date: string;
  project: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  supplier: string;
  status: 'تم الطلب' | 'تم الاستلام' | 'قيد الشحن';
}

export interface Expense {
  id: string;
  date: string;
  project: string;
  type: 'مواد' | 'رواتب' | 'تشغيل' | 'أخرى';
  amount: number;
  description: string;
  paymentMethod: 'نقدي' | 'شيك' | 'تحويل';
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  stage: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: 'لم تبدأ' | 'قيد التنفيذ' | 'مكتملة';
  progress: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  type: 'income' | 'expense';
  category?: string;
  clientId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  materialType: string;
  totalPurchases: number;
  totalPaid?: number;
  balance?: number;
  notes?: string;
}

export interface Transport {
  id: string;
  vehicleType: string;
  plateNumber: string;
  driverName: string;
  phone: string;
  status: 'نشط' | 'في الصيانة' | 'خارج الخدمة';
}