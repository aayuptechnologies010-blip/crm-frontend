import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, CalendarClock, BarChart3, Settings, X, UsersRound, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/leads', icon: Users, label: 'Leads', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/assign', icon: UserCheck, label: 'Assign Leads', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/followups', icon: CalendarClock, label: 'Follow-ups', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/team', icon: UsersRound, label: 'Team Members', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/invoices', icon: FileText, label: 'Invoices', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
];


export default function Sidebar({ open, onClose }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const hasImage = !!currentUser?.profileImage;

  const navItems = allNavItems.filter(item => item.roles.includes(currentUser?.role || 'Sales Executive'));

  return (
    <>
      <style>{`
        @keyframes cube-rotate {
          0%, 20% { transform: rotateX(0deg); }
          25%, 45% { transform: rotateX(90deg); }
          50%, 70% { transform: rotateX(180deg); }
          75%, 95% { transform: rotateX(270deg); }
          100% { transform: rotateX(360deg); }
        }
        .logo-cube-container {
          perspective: 1000px;
          width: 150px;
          height: 40px;
        }
        .logo-cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-rotate 8s infinite cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .logo-cube-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          background: white;
          backface-visibility: hidden;
        }
        .logo-cube-front  { transform: rotateX(0deg) translateZ(20px); }
        .logo-cube-bottom { transform: rotateX(-90deg) translateZ(20px); }
        .logo-cube-back   { transform: rotateX(-180deg) translateZ(20px); }
        .logo-cube-top    { transform: rotateX(-270deg) translateZ(20px); }
      `}</style>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="logo-cube-container ml-2">
              <div className="logo-cube">
                <div className="logo-cube-face logo-cube-front">
                  <span className="font-extrabold text-lg tracking-widest uppercase bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent w-full text-center">
                    SALES CRM
                  </span>
                </div>
                <div className="logo-cube-face logo-cube-bottom">
                  <span className="font-extrabold text-lg tracking-widest uppercase bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent w-full text-center">
                    SALES CRM
                  </span>
                </div>
                <div className="logo-cube-face logo-cube-back">
                  <span className="font-extrabold text-lg tracking-widest uppercase bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent w-full text-center">
                    SALES CRM
                  </span>
                </div>
                <div className="logo-cube-face logo-cube-top">
                  <span className="font-extrabold text-lg tracking-widest uppercase bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent w-full text-center">
                    SALES CRM
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={() => { navigate('/settings'); onClose?.(); }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-blue-500">
              {hasImage
                ? <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-bold">{currentUser?.avatar || 'SA'}</span>
              }
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{currentUser?.name || 'Super Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email || ''}</p>
            </div>
            <Settings size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
