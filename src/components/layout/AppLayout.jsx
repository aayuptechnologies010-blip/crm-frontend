import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Management',
  '/leads/': 'Lead Details',
  '/assign': 'Assign Leads',
  '/followups': 'Follow-up Management',
  '/team': 'Team Members',
  '/pipeline': 'Lead Pipeline',
  '/calendar': 'Calendar & Meetings',
  '/invoices': 'Invoices & Quotations',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginRequest, setLoginRequest] = useState(null); // { email, requestSocketId }
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || 'LeadFlow CRM';

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Register this device's socket + listen for login requests
  useEffect(() => {
    if (!currentUser?.email) return;
    socket.connect();
    socket.emit('register', currentUser.email);

    socket.on('login_request', ({ email, requestSocketId }) => {
      setLoginRequest({ email, requestSocketId });
    });

    return () => {
      socket.off('login_request');
    };
  }, [currentUser?.email]);

  const handleApprove = () => {
    socket.emit('login_approve', loginRequest);
    setLoginRequest(null);
  };

  const handleReject = () => {
    socket.emit('login_reject', loginRequest);
    setLoginRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} pageTitle={title} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto relative min-h-[calc(100vh-4rem)]">
          {loading && (
            <div className="fixed inset-0 lg:left-64 bg-[#f4fafc]/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-inner"></div>
              <p className="mt-4 text-sm text-gray-500 font-medium tracking-wide">Initializing...</p>
            </div>
          )}
          <div className={loading ? 'invisible opacity-0' : 'opacity-100 transition-opacity duration-300'}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Login approval notification */}
      {loginRequest && (
        <div className="fixed top-4 right-4 z-[100] w-80 bg-white border border-orange-200 rounded-2xl shadow-2xl p-5 animate-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔐</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Naya Login Request</p>
              <p className="text-xs text-gray-500 mt-0.5">
                <strong>{loginRequest.email}</strong> kisi doosre device se login karne ki koshish kar raha hai.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Kya aap is login ko allow karna chahte hain? Allow karne par aapka current session band ho jaayega.</p>
          <div className="flex gap-2">
            <button onClick={handleReject}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              Ignore
            </button>
            <button onClick={handleApprove}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              Allow Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
