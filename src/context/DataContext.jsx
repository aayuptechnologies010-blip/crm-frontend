import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [followUps, setFollowUps] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_followups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_activities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      return !saved;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!currentUser) {
      setLeads([]);
      setFollowUps([]);
      setActivities([]);
      setInvoices([]);
      setLoading(false);
      try {
        localStorage.removeItem('crm_leads');
        localStorage.removeItem('crm_followups');
        localStorage.removeItem('crm_activities');
        localStorage.removeItem('crm_invoices');
      } catch {}
      return;
    }
    const fetchData = async () => {
      try {
        const hasCache = localStorage.getItem('crm_leads');
        if (!hasCache) {
          setLoading(true);
        }
        const [leadsData, followUpsData, invoicesData] = await Promise.all([
          api.get('/leads'),
          api.get('/followups'),
          api.get('/invoices'),
        ]);
        const freshLeads = leadsData.leads || [];
        const freshFollowUps = followUpsData || [];
        const freshInvoices = invoicesData || [];

        setLeads(freshLeads);
        setFollowUps(freshFollowUps);
        setInvoices(freshInvoices);

        localStorage.setItem('crm_leads', JSON.stringify(freshLeads));
        localStorage.setItem('crm_followups', JSON.stringify(freshFollowUps));
        localStorage.setItem('crm_invoices', JSON.stringify(freshInvoices));
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
      } finally {
        setLoading(false);
      }
      // Activities load in background — non-blocking
      try {
        const activitiesData = await api.get('/activities');
        const freshActivities = activitiesData || [];
        setActivities(freshActivities);
        localStorage.setItem('crm_activities', JSON.stringify(freshActivities));
      } catch (_) {}
    };
    fetchData();
  }, [currentUser]);

  const cleanPhone = (p) => {
    if (!p) return '';
    const str = String(p).trim();
    if (/^\d{7,15}$/.test(str)) return str.slice(0, 15);
    const mob = str.match(/[Mm]ob(?:ile)?\s*:?\s*(\d{7,15})/);
    if (mob) return mob[1].slice(0, 15);
    const digits = str.replace(/\D/g, '');
    const match = digits.match(/[6-9]\d{9}/);
    if (match) return match[0];
    return digits.length >= 7 ? digits.slice(0, 15) : '';
  };

  const getMappedItem = (item) => {
    if (!item) return null;
    return {
      ...item,
      id: item._id || item.id,
      phone: cleanPhone(item.phone),
      email: item.email || '',
      company: item.company || '',
    };
  };

  const mappedLeads = leads.map(getMappedItem);
  const mappedFollowUps = followUps.map(getMappedItem);
  const mappedActivities = activities.map(getMappedItem);

  // ── Leads ──
  const addLead = async (data, userName = 'Admin') => {
    const newLead = await api.post('/leads', data);
    setLeads(prev => {
      const updated = [newLead, ...prev];
      try { localStorage.setItem('crm_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return getMappedItem(newLead);
  };

  const updateLead = async (id, data, userName = 'Admin') => {
    const updatedLead = await api.patch(`/leads/${id}`, data);
    setLeads(prev => {
      const updated = prev.map(l => {
        if (l._id === id || l.id === id) return { ...l, ...updatedLead };
        return l;
      });
      try { localStorage.setItem('crm_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return getMappedItem(updatedLead);
  };

  const deleteLead = async (ids) => {
    await api.delete('/leads', { ids });
    setLeads(prev => {
      const updated = prev.filter(l => !ids.includes(l._id) && !ids.includes(l.id));
      try { localStorage.setItem('crm_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const refreshLeads = async () => {
    const leadsData = await api.get('/leads');
    const fresh = leadsData.leads || [];
    setLeads(fresh);
    try { localStorage.setItem('crm_leads', JSON.stringify(fresh)); } catch {}
  };

  const addInvoice = async (data) => {
    const newInvoice = await api.post('/invoices', data);
    setInvoices(prev => {
      const updated = [newInvoice, ...prev];
      try { localStorage.setItem('crm_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return newInvoice;
  };

  const updateInvoice = async (id, data) => {
    const updated = await api.patch(`/invoices/${id}`, data);
    setInvoices(prev => {
      const updatedList = prev.map(inv => (inv._id === id || inv.id === id) ? updated : inv);
      try { localStorage.setItem('crm_invoices', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });
    return updated;
  };

  const deleteInvoice = async (id) => {
    await api.delete(`/invoices/${id}`);
    setInvoices(prev => {
      const updated = prev.filter(inv => inv._id !== id && inv.id !== id);
      try { localStorage.setItem('crm_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const importLeadsPreview = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.postForm('/leads/import/preview', formData);
  };

  const importLeadsConfirm = async (filename) => {
    const result = await api.post('/leads/import/confirm', { filename });
    await refreshLeads();
    return result;
  };

  const assignLead = async (ids, assignTo, followUpDate = '', userName = 'Admin') => {
    await api.patch('/leads/assign/bulk', { ids, assignedTo: assignTo, followUpDate });
    setLeads(prev => {
      const updated = prev.map(l => {
        if (ids.includes(l._id) || ids.includes(l.id)) {
          const u = { ...l, assignedTo: assignTo };
          if (followUpDate) u.followUpDate = followUpDate;
          return u;
        }
        return l;
      });
      try { localStorage.setItem('crm_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (followUpDate) {
      const followUpsData = await api.get('/followups');
      const freshFU = followUpsData || [];
      setFollowUps(freshFU);
      try { localStorage.setItem('crm_followups', JSON.stringify(freshFU)); } catch {}
    }
  };

  // ── Follow-ups ──
  const addFollowUp = async (data, userName = 'Admin') => {
    const newFU = await api.post('/followups', data);
    setFollowUps(prev => {
      const updated = [newFU, ...prev];
      try { localStorage.setItem('crm_followups', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return getMappedItem(newFU);
  };

  const updateFollowUp = async (id, data) => {
    const updatedFU = await api.patch(`/followups/${id}`, data);
    setFollowUps(prev => {
      const updated = prev.map(f => (f._id === id || f.id === id) ? updatedFU : f);
      try { localStorage.setItem('crm_followups', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return getMappedItem(updatedFU);
  };

  const deleteFollowUp = async (id) => {
    await api.delete(`/followups/${id}`);
    setFollowUps(prev => {
      const updated = prev.filter(f => f._id !== id && f.id !== id);
      try { localStorage.setItem('crm_followups', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // ── Role-filtered getters ──
  const getLeadsForUser = (user) => {
    if (!user) return [];
    if (user.role === 'Super Admin' || user.role === 'Admin') return mappedLeads;
    return mappedLeads.filter(l => l.assignedTo === user.name);
  };

  const getFollowUpsForUser = (user) => {
    if (!user) return [];
    if (user.role === 'Super Admin' || user.role === 'Admin') return mappedFollowUps;
    return mappedFollowUps.filter(f => f.assignedTo === user.name);
  };

  const getActivitiesForUser = (user) => {
    if (!user) return [];
    if (user.role === 'Super Admin' || user.role === 'Admin') return mappedActivities;
    return mappedActivities.filter(a => a.user === user.name);
  };

  return (
    <DataContext.Provider value={{
      leads: mappedLeads,
      followUps: mappedFollowUps,
      activities: mappedActivities,
      invoices,
      getLeadsForUser, getFollowUpsForUser, getActivitiesForUser,
      addLead, updateLead, deleteLead, assignLead,
      importLeadsPreview, importLeadsConfirm, refreshLeads,
      addFollowUp, updateFollowUp, deleteFollowUp,
      addInvoice, updateInvoice, deleteInvoice,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
