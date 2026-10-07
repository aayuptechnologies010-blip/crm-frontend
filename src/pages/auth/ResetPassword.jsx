import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { PrimaryButton } from '../../components/shared/FormElements';
import { api } from '../../utils/api';

export default function ResetPassword() {
  const [show, setShow]     = useState({ p: false, c: false });
  const [done, setDone]     = useState(false);
  const [form, setForm]     = useState({ password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const rules = [
    { label: 'At least 8 characters',    ok: form.password.length >= 8 },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Contains a number',         ok: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid or missing reset token'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">LeadFlow</span>
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg font-medium">CRM</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          {!done ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Set new password</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); setDone(true); }} className="space-y-4">
                {[
                  { key: 'password', label: 'New Password', showKey: 'p', placeholder: 'Enter new password' },
                  { key: 'confirm', label: 'Confirm Password', showKey: 'c', placeholder: 'Re-enter new password' },
                ].map(({ key, label, showKey, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <div className="relative">
                      <input type={show[showKey] ? 'text' : 'password'} placeholder={placeholder}
                        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all pr-10" required />
                      <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl">
                  {rules.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <CheckCircle size={14} className={r.ok ? 'text-blue-500' : 'text-gray-300'} />
                      <span className={`text-xs ${r.ok ? 'text-blue-600' : 'text-gray-400'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>

                <PrimaryButton type="submit" className="w-full">Reset Password</PrimaryButton>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Password reset!</h3>
              <p className="text-sm text-gray-500 mt-2">Your password has been updated successfully.</p>
              <button onClick={() => navigate('/login')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
