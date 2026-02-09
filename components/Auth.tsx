
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // إنشاء حساب جديد
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
        });
        
        if (signUpError) throw signUpError;

        // إذا نجح التسجيل، نتحقق مما إذا كان المستخدم قد سجل دخوله تلقائياً (حسب إعدادات Supabase)
        // أو نقوم بتحويله لصفحة تسجيل الدخول
        if (data.session) {
          setSuccess('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
        } else {
          setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
          setIsSignUp(false); // التحويل لواجهة تسجيل الدخول
          setPassword(''); // مسح كلمة المرور للأمان
        }
      } else {
        // تسجيل الدخول
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      let message = 'حدث خطأ غير متوقع';
      if (err.message.includes('Invalid login credentials')) {
        message = 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور';
      } else if (err.message.includes('User already registered')) {
        message = 'هذا البريد الإلكتروني مسجل مسبقاً';
      } else if (err.message.includes('Password should be')) {
        message = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
      } else if (err.message.includes('Email not confirmed')) {
        message = 'يرجى تفعيل خيار "Confirm Email = Off" من إعدادات Supabase للسماح بالدخول المباشر';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 size={32} className="text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800">بناء برو</h1>
            <p className="text-slate-400 text-sm mt-2">
              {isSignUp ? 'أنشئ حسابك لإدارة مشاريعك باحترافية' : 'مرحباً بك مجدداً، سجل دخولك للمتابعة'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isSignUp ? (
                <>
                  <UserPlus size={20} />
                  إنشاء حساب جديد
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isSignUp ? 'تمتلك حساباً بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
