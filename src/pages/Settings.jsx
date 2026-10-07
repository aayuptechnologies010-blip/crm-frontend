import { useState, useRef, useEffect } from 'react';
import { Building2, Bell, Shield, Save, User, Edit2, X, Camera, Phone, Mail, Briefcase } from 'lucide-react';
import Card from '../components/shared/Card';
import { Input, Select, PrimaryButton, SecondaryButton } from '../components/shared/FormElements';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { requestNotificationPermission } from '../utils/firebase';

const allTabs = [
  { id: 'company', label: 'Company Profile', icon: Building2, roles: ['Super Admin', 'Admin', 'Sales Executive'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['Super Admin', 'Admin', 'Sales Executive'] },
  { id: 'permissions', label: 'Role Permissions', icon: Shield, roles: ['Super Admin'] },
];

// Notifications per role
const notifsByRole = {
  'Super Admin': [
    { key: 'newLead', label: 'New Lead Created', desc: 'Get notified when a new lead is added' },
    { key: 'assignment', label: 'Lead Assignment', desc: 'Notify when a lead is assigned' },
    { key: 'followup', label: 'Follow-up Reminders', desc: 'Reminders before scheduled follow-ups' },
    { key: 'conversion', label: 'Lead Conversion', desc: 'Notify when a lead is marked as Won' },
    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly performance summary' },
  ],
  'Admin': [
    { key: 'newLead', label: 'New Lead Created', desc: 'Get notified when a new lead is added' },
    { key: 'assignment', label: 'Lead Assignment', desc: 'Notify when a lead is assigned' },
    { key: 'followup', label: 'Follow-up Reminders', desc: 'Reminders before scheduled follow-ups' },
    { key: 'conversion', label: 'Lead Conversion', desc: 'Notify when a lead is marked as Won' },
    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly performance summary' },
  ],
  'Sales Executive': [
    { key: 'assignment', label: 'Lead Assigned to Me', desc: 'Notify when a lead is assigned to you' },
    { key: 'followup', label: 'Follow-up Reminders', desc: 'Reminders before your scheduled follow-ups' },
    { key: 'conversion', label: 'Lead Conversion', desc: 'Notify when your lead is marked as Won' },
  ],
};

const roles = ['Super Admin', 'Admin / Sales Manager', 'Branch Admin', 'Sales Executive'];
const permissions = [
  'View Dashboard', 'Manage Leads', 'Assign Leads', 'Delete Leads',
  'View Reports', 'Manage Team', 'Export Data', 'Manage Settings',
];
const defaultPerms = {
  'Super Admin': new Set(permissions),
  'Admin / Sales Manager': new Set(['View Dashboard', 'Manage Leads', 'Assign Leads', 'View Reports', 'Manage Team', 'Export Data']),
  'Branch Admin': new Set(['View Dashboard', 'Manage Leads', 'Assign Leads', 'View Reports', 'Manage Team']),
  'Sales Executive': new Set(['View Dashboard', 'Manage Leads']),
};

export default function Settings() {
  const { currentUser, updateProfile } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const tabs = allTabs.filter(t => t.roles.includes(currentUser?.role));
  const [tab, setTab] = useState('company');
  const [editMode, setEditMode] = useState(false);
  const [perms, setPerms] = useState(defaultPerms);
  const [notifs, setNotifs] = useState({
    newLead:      currentUser?.notifications?.newLead      ?? true,
    assignment:   currentUser?.notifications?.assignment   ?? true,
    followup:     currentUser?.notifications?.followup     ?? true,
    conversion:   currentUser?.notifications?.conversion   ?? false,
    weeklyReport: currentUser?.notifications?.weeklyReport ?? true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved,  setNotifSaved]  = useState(false);
  const [fcmToken, setFcmToken] = useState(() => localStorage.getItem('fcm_token') || '');
  const [testSent, setTestSent] = useState(false);

  const [permSaving, setPermSaving] = useState(false);
  const [permSaved, setPermSaved] = useState(false);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await api.get('/settings/permissions');
        if (res && typeof res === 'object') {
          const loaded = { ...defaultPerms };
          Object.entries(res).forEach(([r, pList]) => {
            if (Array.isArray(pList)) {
              loaded[r] = new Set(pList);
            }
          });
          setPerms(loaded);
        }
      } catch (e) {
        console.error('Failed to load role permissions:', e);
      }
    };
    fetchPerms();
  }, []);

  const handleSavePerms = async () => {
    setPermSaving(true);
    try {
      const payload = {};
      Object.entries(perms).forEach(([r, setObj]) => {
        payload[r] = Array.from(setObj);
      });
      await api.patch('/settings/permissions', { rolePermissions: payload });
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to save permissions');
    } finally {
      setPermSaving(false);
    }
  };

  const handleSaveNotifs = async () => {
    setNotifSaving(true);
    try {
      await api.patch('/auth/notifications', { notifications: notifs });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2500);
    } catch {}
    finally { setNotifSaving(false); }
  };

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    profileImage: currentUser?.profileImage || null,
  });
  const [previewImage, setPreviewImage] = useState(currentUser?.profileImage || null);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target.result);
      setForm(f => ({ ...f, profileImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await updateProfile(form);
    setEditMode(false);
  };

  const handleCancel = () => {
    setForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      profileImage: currentUser?.profileImage || null,
    });
    setPreviewImage(currentUser?.profileImage || null);
    setEditMode(false);
  };

  const togglePerm = (role, perm) => {
    setPerms(p => {
      const next = new Set(p[role]);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return { ...p, [role]: next };
    });
  };

  const displayImage = previewImage || currentUser?.profileImage;
  const avatarInitials = currentUser?.avatar || 'U';

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setEditMode(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Company Profile Tab — includes My Profile section */}
      {tab === 'company' && (
        <div className="space-y-4 max-w-2xl">

          {/* ── My Profile Section ── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">My Profile</h3>
              {!editMode ? (
                <PrimaryButton onClick={() => setEditMode(true)}>
                  <Edit2 size={14} /> Edit Profile
                </PrimaryButton>
              ) : (
                <div className="flex gap-2">
                  <SecondaryButton onClick={handleCancel}>
                    <X size={14} /> Cancel
                  </SecondaryButton>
                  <PrimaryButton onClick={handleSave}>
                    <Save size={14} /> Save Changes
                  </PrimaryButton>
                </div>
              )}
            </div>

            {/* Avatar + basic info */}
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-500 flex items-center justify-center shadow-sm">
                  {displayImage
                    ? <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                    : <span className="text-white text-2xl font-bold">{avatarInitials}</span>
                  }
                </div>
                {editMode && (
                  <>
                    <button onClick={() => fileRef.current.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                      <Camera size={13} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{currentUser?.name}</p>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
                <span className="inline-block mt-1.5 text-xs bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-lg font-semibold">
                  {currentUser?.role}
                </span>
                {editMode && (
                  <p className="text-xs text-gray-400 mt-1.5">Click the camera icon to change photo</p>
                )}
              </div>
            </div>

            {/* Fields — edit or read */}
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name" />
                  <Input label="Phone Number" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX" />
                </div>
                <Input label="Email Address" value={currentUser?.email} disabled
                  className="bg-gray-50 text-gray-400 cursor-not-allowed" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Role" value={currentUser?.role} disabled
                    className="bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <Input label="Team" value={currentUser?.team} disabled
                    className="bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <p className="text-xs text-gray-400">Email, Role and Team can only be changed by Super Admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Full Name', value: currentUser?.name },
                  { icon: Phone, label: 'Phone Number', value: currentUser?.phone || 'Not set' },
                  { icon: Mail, label: 'Email Address', value: currentUser?.email },
                  { icon: Briefcase, label: 'Role', value: currentUser?.role },
                  { icon: Building2, label: 'Team', value: currentUser?.team },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>


        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-gray-800 mb-1">Notification Preferences</h3>
          <p className="text-xs text-gray-400 mb-5">Manage notifications for <span className="font-semibold text-blue-600">{currentUser?.name}</span></p>
          <div className="space-y-4">
            {(notifsByRole[currentUser?.role] || notifsByRole['Sales Executive']).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors outline-none ${notifs[key] ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <PrimaryButton onClick={handleSaveNotifs} disabled={notifSaving}>
                <Save size={14} /> {notifSaving ? 'Saving...' : notifSaved ? 'Saved ✓' : 'Save Preferences'}
              </PrimaryButton>
            </div>
          </div>

          {/* FCM Push Notification Live Tester (Super Admin & Admin Only) */}
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                  🔔
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">FCM Live Push Notification Test Panel</h4>
                  <p className="text-xs text-gray-400">Test live browser & desktop notifications for your device</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-700">Device Push Permission:</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission.toUpperCase() : 'NOT SUPPORTED'}
                  </span>
                </div>

                {fcmToken ? (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">Your FCM Token (Active):</span>
                    <div className="p-2 bg-white rounded-xl border border-gray-200 text-[11px] font-mono text-gray-600 break-all select-all max-h-20 overflow-y-auto">
                      {fcmToken}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Token generate karne ke liye neeche permission enable kijiye.</p>
                )}

                <div className="flex gap-2 flex-wrap pt-1">
                  <SecondaryButton
                    onClick={async () => {
                      const token = await requestNotificationPermission();
                      if (token) setFcmToken(token);
                    }}
                    className="!text-xs !py-2"
                  >
                    ⚡ Request / Refresh Token
                  </SecondaryButton>

                  <PrimaryButton
                    onClick={async () => {
                      if (!('Notification' in window)) {
                        alert('Browser desktop notifications support nahi karta.');
                        return;
                      }
                      if (Notification.permission !== 'granted') {
                        const token = await requestNotificationPermission();
                        if (token) setFcmToken(token);
                      }
                      if (Notification.permission === 'granted') {
                        new Notification('🔥 CRM Live Test Notification', {
                          body: `Hello ${currentUser?.name || 'User'}! FCM live notification system is working perfectly.`,
                          icon: '/logo.png',
                          badge: '/logo.png'
                        });
                        setTestSent(true);
                        setTimeout(() => setTestSent(false), 3000);
                      } else {
                        alert('Please allow notification permission in your browser URL bar.');
                      }
                    }}
                    className="!text-xs !py-2 !bg-indigo-600 hover:!bg-indigo-700"
                  >
                    🚀 {testSent ? 'Notification Sent! ✓' : 'Send Test Notification'}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Role Permissions */}
      {tab === 'permissions' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Role Permissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Permission</th>
                  {roles.map(r => (
                    <th key={r} className="text-center px-3 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {permissions.map(perm => (
                  <tr key={perm} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-gray-700">{perm}</td>
                    {roles.map(role => (
                      <td key={role} className="px-3 py-3 text-center">
                        <input type="checkbox" checked={perms[role].has(perm)} onChange={() => togglePerm(role, perm)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200 cursor-pointer" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <PrimaryButton onClick={handleSavePerms} disabled={permSaving}>
              <Save size={14} /> {permSaving ? 'Saving...' : permSaved ? 'Permissions Saved ✓' : 'Save Permissions'}
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}
