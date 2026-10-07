import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  const hostname = window.location.hostname;
  if (hostname.includes('salesmanagementcrm-frontend.onrender.com')) {
    return 'https://salesmanagementcrm-backend.onrender.com';
  }
  if (hostname.includes('-frontend.')) {
    return `https://${hostname.replace('-frontend.', '-backend.')}`;
  }
  return 'http://localhost:5009';
};

const socket = io(getSocketUrl(), {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
