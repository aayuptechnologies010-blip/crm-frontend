import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(() => {
    try {
      const token = localStorage.getItem('crm_token');
      const session = localStorage.getItem('crm_session');
      return !(token && session);
    } catch {
      return true;
    }
  });

  // Verify token on mount and fetch users if authenticated
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.get('/auth/me');
        setCurrentUser(user);
        localStorage.setItem('crm_session', JSON.stringify(user));
        
        // Fetch all users if admin/super admin
        if (user.role === 'Super Admin' || user.role === 'Admin') {
          const usersList = await api.get('/users');
          setAllUsers(usersList);
        } else {
          const teamList = await api.get('/users/team');
          setAllUsers(teamList);
        }
      } catch (err) {
        console.error('Session verification failed:', err.message);
        // Only clear the credentials if the backend rejects the session (401/403).
        // Otherwise (e.g. network/offline error), we keep the local cached user session.
        if (err.status === 401 || err.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password, dryRun = false) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (dryRun) return { credValid: true };
      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_session', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      // Load users
      if (data.user.role === 'Super Admin' || data.user.role === 'Admin') {
        const usersList = await api.get('/users');
        setAllUsers(usersList);
      } else {
        const teamList = await api.get('/users/team');
        setAllUsers(teamList);
      }
      return { success: true, user: data.user };
    } catch (err) {
      if (dryRun) return { credValid: false, message: err.message };
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_session');
    setCurrentUser(null);
    setAllUsers([]);
  };

  const addUser = async (userData) => {
    const newUser = await api.post('/users', userData);
    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id, userData) => {
    const updatedUser = await api.patch(`/users/${id}`, userData);
    setAllUsers(prev => prev.map(u => u._id === id ? updatedUser : u));
    if (currentUser?._id === id || currentUser?.id === id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('crm_session', JSON.stringify(updatedUser));
    }
    return updatedUser;
  };

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    setAllUsers(prev => prev.filter(u => u._id !== id && u.id !== id));
  };

  const updateProfile = async (profileData) => {
    const updated = await api.patch('/auth/profile', profileData);
    setCurrentUser(updated);
    localStorage.setItem('crm_session', JSON.stringify(updated));
    setAllUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
    return updated;
  };

  const teamMembers = allUsers.filter(u => u.role !== 'Super Admin');

  // Helper to map old mock id or backend id
  const getMappedUser = (user) => {
    if (!user) return null;
    return {
      ...user,
      id: user._id || user.id
    };
  };

  const mappedCurrentUser = getMappedUser(currentUser);
  const mappedAllUsers = allUsers.map(getMappedUser);
  const mappedTeamMembers = teamMembers.map(getMappedUser);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin duration-1000"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-blue-400 shadow-inner">
              S
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Sales CRM
            </h2>
            <p className="text-xs text-slate-400 font-medium animate-pulse">Loading secure session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser: mappedCurrentUser, login, logout,
      addUser, updateUser, updateProfile, deleteUser,
      teamMembers: mappedTeamMembers, allUsers: mappedAllUsers,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
