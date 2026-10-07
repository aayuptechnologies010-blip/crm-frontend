import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { Input, PrimaryButton } from '../../components/shared/FormElements';
import { api } from '../../utils/api';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email Address" type="email" placeholder="Enter your registered email"
                  value={email} onChange={e => setEmail(e.target.value)} required />
                {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
                <PrimaryButton type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </PrimaryButton>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Check your email</h3>
              <p className="text-sm text-gray-500 mt-2">We sent a reset link to <strong>{email}</strong></p>
              <Link to="/reset-password"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors">
                Open Reset Page
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
