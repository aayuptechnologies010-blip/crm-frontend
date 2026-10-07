import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { Input, PrimaryButton } from '../../components/shared/FormElements';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../utils/firebase';

const OLD_KEYS = ['crm_leads', 'crm_followups', 'crm_activities', 'crm_seeded', 'crm_migrated_v2', 'crm_migrated_v3'];
if (!localStorage.getItem('crm_cleaned_v1')) {
  OLD_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('crm_cleaned_v1', '1');
}

export default function Login() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoggingIn(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        requestNotificationPermission().catch(() => {});
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Logo - Clean, Static & Elegant */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3">
            <Layers size={26} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            SALES <span className="text-emerald-600">CRM</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Enterprise Workflow & Lead Tracking</p>
        </div>

        {/* Clean White Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }}
              required 
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={show ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }}
                  className="w-full border border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all pr-10 bg-white text-slate-800 placeholder:text-slate-400"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 font-medium">
                {error}
              </p>
            )}

            <PrimaryButton type="submit" loading={loggingIn} className="w-full justify-center py-3 mt-2">
              Sign In <ArrowRight size={16} />
            </PrimaryButton>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Secure 256-bit encrypted authentication
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
