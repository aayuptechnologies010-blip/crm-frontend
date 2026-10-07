const getBaseUrl = () => {
  // Check if a custom VITE_API_URL is supplied via Vite environment
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  
  // If hosted on Render (e.g. salesmanagementcrm-frontend.onrender.com)
  if (hostname.includes('salesmanagementcrm-frontend.onrender.com')) {
    return 'https://salesmanagementcrm-backend.onrender.com/api';
  }
  
  // Dynamic replacement for custom Render/Vercel environments with '-frontend'
  if (hostname.includes('-frontend.')) {
    return `https://${hostname.replace('-frontend.', '-backend.')}/api`;
  }
  
  // Default fallback for development
  return 'http://localhost:5009/api';
};

const BASE_URL = getBaseUrl();

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('crm_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.message || 'Something went wrong');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const api = {
  async get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async post(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async patch(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  // For multipart/form-data (file uploads) — do NOT set Content-Type manually
  async postForm(endpoint, formData) {
    const token = localStorage.getItem('crm_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },
};
