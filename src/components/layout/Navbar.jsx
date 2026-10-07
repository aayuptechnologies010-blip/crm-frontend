import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

function Avatar({ user, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (user?.profileImage) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white`}>
        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {user?.avatar || 'U'}
    </div>
  );
}

export default function Navbar({ onMenuClick, pageTitle }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getActivitiesForUser } = useData();

  const allActivities = getActivitiesForUser(currentUser).slice(0, 20);
  const [readIds, setReadIds] = useState([]);
  const [cleared, setCleared] = useState(false);

  const visibleActivities = cleared ? [] : allActivities;
  const unreadCount = visibleActivities.filter(a => !readIds.includes(a.id)).length;

  const markAllRead = () => setReadIds(visibleActivities.map(a => a.id));
  const clearAll = () => { setCleared(true); setReadIds([]); };

  // Reset cleared state when new activities come in
  const handleBellClick = () => {
    if (cleared && allActivities.length > 0) setCleared(false);
    setNotifOpen(o => !o);
    setProfileOpen(false);
  };

  const getNotifRoute = (type) => {
    if (type === 'followup') return '/followups';
    if (type === 'assign') return '/assign';
    return '/leads';
  };

  const handleNotifClick = (notif) => {
    setNotifOpen(false);
    navigate(getNotifRoute(notif.type));
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{pageTitle}</h1>
      </div>

      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search leads, contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button onClick={handleBellClick}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  {visibleActivities.length > 0 && (
                    <button onClick={clearAll}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {visibleActivities.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications</div>
                ) : (
                  visibleActivities.map(n => {
                    const isRead = readIds.includes(n.id);
                    return (
                      <div key={n.id} onClick={() => { handleNotifClick(n); setReadIds(p => [...p, n.id]); }}
                        className={`px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer flex items-start gap-2 ${
                          isRead ? 'opacity-50' : ''
                        }`}>
                        {!isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className={!isRead ? '' : 'ml-3.5'}>
                          <p className="text-sm text-gray-700">{n.action}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.lead} &middot; {n.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Avatar user={currentUser} size="sm" />
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-gray-700">{currentUser?.name || 'User'}</span>
              <span className="text-xs text-gray-400">{currentUser?.role || ''}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 py-1">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <Avatar user={currentUser} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg font-semibold">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
              <button onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={14} className="text-gray-400" /> My Profile
              </button>
              <button onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={14} className="text-gray-400" /> Settings
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
