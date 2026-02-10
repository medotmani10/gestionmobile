import React, { useState, useEffect } from 'react';
import { Plus, Download, Printer, Filter, Trash2, Save, FileText, ChevronRight, Loader2, FileCheck, Calendar } from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, Client } from '../types';
import { supabase } from '../supabase';
import { CURRENCY } from '../constants';

const Invoices: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('ضريبية');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: '1', description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  
  // State for fetching data
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      // Fetch invoices with client name joined
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mappedInvoices = data.map((inv: any) => ({
        id: inv.id,
        client: inv.clients?.name || 'عميل غير معروف',
        amount: inv.total, // Using total here for display
        date: inv.date,
        type: inv.type,
        status: inv.status
      }));
      
      setInvoices(mappedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('id, name, address, phone');
    if (data) setClients(data as any);
  }

  const handleSaveInvoice = async () => {
    if (!selectedClientId) return alert('الرجاء اختيار العميل');
    
    setSaving(true);
    const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subTotal * 0.19; // Updated VAT to 19% for Algerian context
    const total = subTotal + tax;

    try {
      // 1. Insert Invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          type: invoiceType,
          client_id: selectedClientId,
          amount: subTotal,
          tax: tax,
          total: total,
          status: invoiceType === 'شكلية' ? 'مسودة' : 'معلقة',
          due_date: dueDate || null,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Insert Items
      if (invoiceData) {
        const invoiceItems = items.map(item => ({
          invoice_id: invoiceData.id,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
          
        if (itemsError) throw itemsError;
        
        setShowCreateModal(false);
        fetchInvoices(); // Refresh list
        // Reset form
        setItems([{ id: '1', description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }]);
        setSelectedClientId('');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToFinal = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من اعتماد هذه الفاتورة وتحويلها إلى فاتورة نهائية؟')) return;
    
    try {
      // 1. تحديث قاعدة البيانات
      const { error } = await supabase
        .from('invoices')
        .update({ 
          type: 'ضريبية', 
          status: 'معلقة' 
        })
        .eq('id', id);

      if (error) throw error;
      
      // 2. تحديث الواجهة فوراً (تحديث الحالة والنوع محلياً)
      setInvoices(currentInvoices => 
        currentInvoices.map(inv => 
          inv.id === id 
            ? { ...inv, type: 'ضريبية', status: 'معلقة' } 
            : inv
        )
      );

      // 3. إعادة تحميل البيانات للتأكد من المزامنة (اختياري لكن مفضل)
      fetchInvoices();
      
    } catch (error: any) {
      console.error('Error converting invoice:', error);
      alert('فشل عملية التحويل: ' + error.message);
    }
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    // 1. Open Print Window IMMEDIATELY to avoid popup blockers
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة');

    // Show loading state in the new window
    printWindow.document.write('<html dir="rtl"><body style="font-family:sans-serif;text-align:center;padding:50px;"><h3>جاري تحضير الفاتورة...</h3><p>يرجى الانتظار</p></body></html>');

    try {
      setPrintingId(invoiceId);
      
      // 2. Fetch full invoice details
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, address, phone),
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      const client = invoiceData.clients;
      const invItems = invoiceData.invoice_items;
      const isProforma = invoiceData.type === 'شكلية';
      const title = isProforma ? 'فاتورة شكلية / Proforma Invoice' : 'فاتورة / Invoice';

      // 3. Generate HTML
      const htmlContent = `
        <html dir="rtl" lang="ar">
        <head>
          <title>${title} #${invoiceData.id.substring(0, 8)}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .company-info h1 { margin: 0; color: #2563eb; font-size: 24px; }
            .company-info p { margin: 5px 0; font-size: 12px; color: #64748b; }
            .invoice-meta { text-align: left; }
            .invoice-meta h2 { margin: 0; color: #0f172a; font-size: 20px; text-transform: uppercase; }
            .invoice-meta p { margin: 5px 0; font-size: 12px; color: #64748b; }
            
            .client-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .client-box h3 { margin: 0 0 10px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .client-box p { margin: 3px 0; font-weight: bold; font-size: 14px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 12px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .totals { width: 300px; margin-right: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .totals-row.final { border-bottom: none; border-top: 2px solid #0f172a; margin-top: 10px; padding-top: 15px; font-weight: bold; font-size: 16px; }
            
            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-top">
            <div class="company-info">
              <h1>بناء برو للإنشاءات</h1>
              <p>الجزائر العاصمة، الجزائر</p>
              <p>هاتف: 0550000000 | ايميل: info@binaapro.dz</p>
              <p>رقم السجل التجاري: 123456789</p>
            </div>
            <div class="invoice-meta">
              <h2>${title}</h2>
              <p>رقم الفاتورة: <strong>#${invoiceData.id.substring(0, 8)}</strong></p>
              <p>التاريخ: ${new Date(invoiceData.date).toLocaleDateString('ar-DZ')}</p>
              ${invoiceData.due_date ? `<p>تاريخ الاستحقاق: ${invoiceData.due_date}</p>` : ''}
              <p>الحالة: ${invoiceData.status}</p>
            </div>
          </div>

          <div class="client-box">
            <h3>بيانات العميل</h3>
            <p>${client?.name}</p>
            <p style="font-weight: normal; font-size: 12px;">${client?.address || ''}</p>
            <p style="font-weight: normal; font-size: 12px;">${client?.phone || ''}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%">الوصف / الخدمة</th>
                <th style="width: 10%">الوحدة</th>
                <th style="width: 10%">الكمية</th>
                <th style="width: 15%">سعر الوحدة</th>
                <th style="width: 15%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invItems.map((item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.unit}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toLocaleString()}</td>
                  <td style="font-weight: bold;">${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>المجموع الفرعي (HT)</span>
              <span>${invoiceData.amount.toLocaleString()} ${CURRENCY}</span>
            </div>
            <div class="totals-row">
              <span>الضريبة (TVA 19%)</span>
              <span>${invoiceData.tax.toLocaleString()} ${CURRENCY}</span>
            </div>
            <div class="totals-row final">
              <span>الإجمالي (TTC)</span>
              <span>${invoiceData.total.toLocaleString()} ${CURRENCY}</span>
            </div>
          </div>

          <div class="footer">
            <p>نشكركم على تعاملكم معنا.</p>
            <p>تم استخراج هذه الفاتورة إلكترونياً عبر نظام بناء برو.</p>
          </div>

          <script>
            setTimeout(function() { window.print(); }, 500);
          </script>
        </body>
        </html>
      `;

      // 4. Update the window content
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

    } catch (error) {
      printWindow.close(); // Close if error
      console.error('Print error:', error);
      alert('حدث خطأ أثناء إعداد الطباعة');
    } finally {
      setPrintingId(null);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const tax = subTotal * 0.19; // Updated VAT to 19%
  const total = subTotal + tax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">إدارة الفواتير والمطالبات</h2>
          <p className="text-xs text-slate-400 mt-1">إنشاء الفواتير الضريبية والشكلية (Proforma)</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => { setInvoiceType('شكلية'); setShowCreateModal(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            <FileText size={18} />
            فاتورة شكلية
          </button>
          <button 
            onClick={() => { setInvoiceType('ضريبية'); setShowCreateModal(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus size={18} />
            فاتورة نهائية
          </button>
        </div>
      </div>

      {/* إنشاء فاتورة جديدة - Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">إنشاء فاتورة {invoiceType} جديدة</h3>
                <p className="text-xs text-slate-400">أدخل تفاصيل الخدمات وأسعار الوحدات</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1">العميل</label>
                  <select 
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">اختر العميل...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1">تاريخ الاستحقاق</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-700">بنود الخدمات (أسعار الوحدة)</h4>
                  <button onClick={addItem} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> إضافة بند
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end">
                      <div className="col-span-12 md:col-span-5 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">الوصف / الخدمة</label>
                        <input 
                          value={item.description}
                          onChange={(e) => updateItem(item.id!, 'description', e.target.value)}
                          placeholder="مثال: توريد خرسانة جاهزة" 
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">الوحدة</label>
                        <select 
                          value={item.unit}
                          onChange={(e) => updateItem(item.id!, 'unit', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                        >
                          <option>متر</option><option>طن</option><option>ساعة</option><option>م3</option><option>م2</option>
                        </select>
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">سعر الوحدة</label>
                        <input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id!, 'unitPrice', parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-center" 
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">الكمية</label>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id!, 'quantity', parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-center" 
                        />
                      </div>
                      <div className="col-span-3 md:col-span-1 flex justify-center pb-1">
                        <button onClick={() => removeItem(item.id!)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-8 text-right w-full md:w-auto">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">الإجمالي قبل الضريبة</p>
                  <p className="text-lg font-bold text-slate-700">{subTotal.toLocaleString()} {CURRENCY}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">الضريبة (19%)</p>
                  <p className="text-lg font-bold text-slate-500">{tax.toLocaleString()} {CURRENCY}</p>
                </div>
                <div className="border-r border-slate-200 pr-8">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">الصافي النهائي</p>
                  <p className="text-2xl font-black text-blue-600">{total.toLocaleString()} {CURRENCY}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
                <button 
                  onClick={handleSaveInvoice} 
                  disabled={saving}
                  className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  حفظ وإصدار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة الفواتير الحالية */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">المرجع</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-black text-blue-600 truncate max-w-[100px]" title={inv.id}>{inv.id.substring(0,8)}...</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      inv.type === 'شكلية' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{inv.client}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{inv.amount.toLocaleString()} {CURRENCY}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(inv.date).toLocaleDateString('ar-DZ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'مدفوعة بالكامل' ? 'bg-green-100 text-green-700' : 
                        inv.status === 'مسودة' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {inv.type === 'شكلية' && (
                        <button 
                          onClick={() => handleConvertToFinal(inv.id)} 
                          title="اعتماد كفاتورة نهائية" 
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FileCheck size={16}/>
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handlePrintInvoice(inv.id)}
                        disabled={printingId === inv.id}
                        title="تحميل PDF" 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                         {printingId === inv.id ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>}
                      </button>
                      
                      <button 
                        onClick={() => handlePrintInvoice(inv.id)}
                        title="طباعة" 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Printer size={16}/>
                      </button>
                      
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                 <tr><td colSpan={7} className="text-center py-8 text-slate-400">لا توجد فواتير حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;