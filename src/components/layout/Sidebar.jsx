import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, CalendarClock, BarChart3, Settings, 
  X, UsersRound, FileText, Shield, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/leads', icon: Users, label: 'Leads', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/assign', icon: UserCheck, label: 'Assign Leads', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/followups', icon: CalendarClock, label: 'Follow-ups', roles: ['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'] },
  { to: '/team', icon: UsersRound, label: 'Team Members', roles: ['Super Admin', 'Admin', 'Branch Admin'] },
  { to: '/roles', icon: Shield, label: 'Roles & Permissions', roles: ['Super Admin', 'Admin'] },
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
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Brand Header - Modern Clean Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Layers size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                SALES <span className="text-emerald-600">CRM</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Workspace
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to} 
              to={to} 
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} 
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3.5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => { navigate('/settings'); onClose?.(); }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-card cursor-pointer transition-all border border-transparent hover:border-slate-200 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-emerald-600 shadow-sm text-white font-bold text-xs">
              {hasImage
                ? <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                : <span>{currentUser?.avatar || 'SA'}</span>
              }
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                {currentUser?.name || 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser?.role || 'Admin'}</p>
            </div>
            <Settings size={15} className="text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
