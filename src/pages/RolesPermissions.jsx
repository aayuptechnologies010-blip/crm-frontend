import { useState, useEffect } from 'react';
import { Shield, Check, X, Save, History, Layers, Info, Building } from 'lucide-react';
import Card from '../components/shared/Card';
import { PrimaryButton, SecondaryButton } from '../components/shared/FormElements';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'leads',       label: 'Leads Management' },
  { id: 'activities',  label: 'Activities / Timeline' },
  { id: 'followups',   label: 'Follow-ups' },
  { id: 'quotations',  label: 'Quotations' },
  { id: 'documents',   label: 'Documents / KYC' },
  { id: 'payments',    label: 'Payments & Advance' },
  { id: 'users',       label: 'User Management' },
  { id: 'roles',       label: 'Roles & Permissions' },
  { id: 'branches',    label: 'Branch Management' },
  { id: 'auditLogs',   label: 'Audit Trail Logs' },
  { id: 'reports',     label: 'Reports & Analytics' },
];

const ACTIONS = [
  { id: 'view',    label: 'View' },
  { id: 'create',  label: 'Create' },
  { id: 'edit',    label: 'Edit' },
  { id: 'delete',  label: 'Delete' },
  { id: 'assign',  label: 'Assign' },
  { id: 'export',  label: 'Export' },
  { id: 'approve', label: 'Approve' },
];

const SCOPES = [
  { id: 'all',      label: 'All Data' },
  { id: 'branch',   label: 'Branch Data' },
  { id: 'team',     label: 'Team Data' },
  { id: 'assigned', label: 'Own Assigned Data' },
];

export default function RolesPermissions() {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Sales Executive');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active sub-tab: 'matrix' | 'audit' | 'branches'
  const [activeTab, setActiveTab] = useState('matrix');
  const [auditLogs, setAuditLogs] = useState([]);
  const [branches, setBranches] = useState([]);

  // New branch modal/input
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchCity, setBranchCity] = useState('');

  // Load roles matrix from backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      if (res?.roles) {
        setRoles(res.roles);
        if (!selectedRole && res.roles.length > 0) {
          setSelectedRole(res.roles[0].role);
        }
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/roles/audit-logs/list?limit=50');
      if (res?.logs) setAuditLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res?.branches) setBranches(res.branches);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'branches') fetchBranches();
  }, [activeTab]);

  // Current selected role config
  const currentRoleDoc = roles.find(r => r.role === selectedRole);

  // Helper to toggle action checkbox
  const handleToggleAction = (moduleId, actionId) => {
    if (selectedRole === 'Super Admin') return; // Super admin always has full access

    setRoles(prevRoles => {
      return prevRoles.map(r => {
        if (r.role !== selectedRole) return r;
        const currentModules = [...(r.modules || [])];
        let mod = currentModules.find(m => m.module === moduleId);
        if (!mod) {
          mod = { module: moduleId, view: false, create: false, edit: false, delete: false, assign: false, export: false, approve: false, scope: 'assigned' };
          currentModules.push(mod);
        }
        mod[actionId] = !mod[actionId];
        return { ...r, modules: currentModules };
      });
    });
  };

  // Helper to change data scope
  const handleChangeScope = (moduleId, scopeValue) => {
    if (selectedRole === 'Super Admin') return;

    setRoles(prevRoles => {
      return prevRoles.map(r => {
        if (r.role !== selectedRole) return r;
        const currentModules = [...(r.modules || [])];
        let mod = currentModules.find(m => m.module === moduleId);
        if (!mod) {
          mod = { module: moduleId, view: false, create: false, edit: false, delete: false, assign: false, export: false, approve: false, scope: scopeValue };
          currentModules.push(mod);
        } else {
          mod.scope = scopeValue;
        }
        return { ...r, modules: currentModules };
      });
    });
  };

  // Save changes to backend
  const handleSavePermissions = async () => {
    if (!currentRoleDoc) return;
    setSaving(true);
    try {
      await api.put(`/roles/${encodeURIComponent(selectedRole)}`, {
        modules: currentRoleDoc.modules,
        displayName: currentRoleDoc.displayName,
        description: currentRoleDoc.description
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Role permissions saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Create branch handler
  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!branchName || !branchCode) return alert('Branch name and code are required');
    try {
      await api.post('/branches', {
        name: branchName,
        code: branchCode,
        city: branchCity
      });
      setBranchName('');
      setBranchCode('');
      setBranchCity('');
      fetchBranches();
      alert('Branch created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create branch');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={24} /> Role & Permission Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure granular module permissions, action rights, and data visibility scopes (PDF Section 7, 8, 9, 10).
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'branches' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Branches
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'audit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* ── TAB 1: PERMISSION MATRIX ── */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Role Selector Card */}
          <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Select Role:</span>
              <div className="flex gap-2 flex-wrap">
                {['Super Admin', 'Admin', 'Branch Admin', 'Sales Executive'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedRole === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PrimaryButton onClick={handleSavePermissions} disabled={saving || selectedRole === 'Super Admin'}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Permissions'}
              </PrimaryButton>
            </div>
          </Card>

          {selectedRole === 'Super Admin' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
              <Info size={15} /> Super Admin has full unrestricted access across all modules, actions, and branches by default.
            </div>
          )}

          {/* Matrix Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Module / Feature</th>
                    {ACTIONS.map(a => (
                      <th key={a.id} className="p-3.5 text-center">{a.label}</th>
                    ))}
                    <th className="p-3.5 pr-5">Data Visibility Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MODULES.map(m => {
                    const modConfig = currentRoleDoc?.modules?.find(cm => cm.module === m.id) || {
                      view: selectedRole === 'Super Admin',
                      create: selectedRole === 'Super Admin',
                      edit: selectedRole === 'Super Admin',
                      delete: selectedRole === 'Super Admin',
                      assign: selectedRole === 'Super Admin',
                      export: selectedRole === 'Super Admin',
                      approve: selectedRole === 'Super Admin',
                      scope: selectedRole === 'Super Admin' ? 'all' : (selectedRole === 'Branch Admin' ? 'branch' : 'assigned')
                    };

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5 pl-5 font-semibold text-gray-800 flex items-center gap-2">
                          <Layers size={13} className="text-gray-400" /> {m.label}
                        </td>
                        {ACTIONS.map(a => {
                          const isChecked = selectedRole === 'Super Admin' || !!modConfig[a.id];
                          return (
                            <td key={a.id} className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={selectedRole === 'Super Admin'}
                                onChange={() => handleToggleAction(m.id, a.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer disabled:opacity-60"
                              />
                            </td>
                          );
                        })}
                        <td className="p-3.5 pr-5">
                          <select
                            value={modConfig.scope || 'assigned'}
                            disabled={selectedRole === 'Super Admin'}
                            onChange={e => handleChangeScope(m.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-400 disabled:opacity-60"
                          >
                            {SCOPES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: BRANCH MANAGEMENT ── */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Building size={16} className="text-blue-600" /> Add New Branch
            </h3>
            <form onSubmit={handleCreateBranch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Branch Name (e.g. Mumbai South)"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white"
              />
              <input
                type="text"
                placeholder="Branch Code (e.g. MUM-01)"
                value={branchCode}
                onChange={e => setBranchCode(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white uppercase"
              />
              <input
                type="text"
                placeholder="City (e.g. Mumbai)"
                value={branchCity}
                onChange={e => setBranchCity(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white"
              />
              <PrimaryButton type="submit" className="justify-center">Add Branch</PrimaryButton>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">Active Branches</h3>
            {branches.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No branches added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {branches.map(b => (
                  <div key={b._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm">{b.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{b.city || 'No city specified'}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
                      <span>Status: <strong className="text-green-600">{b.status}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 3: AUDIT TRAIL LOGS (PDF Section 13) ── */}
      {activeTab === 'audit' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <History size={16} className="text-gray-600" /> Immutable Audit Trail
            </h3>
            <span className="text-xs text-gray-400">Non-editable system activity log</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <th className="p-3 pl-4">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 pr-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">No audit logs recorded yet.</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="p-3 pl-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          log.action === 'PERMISSION_CHANGE' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-gray-800 uppercase">{log.entity}</td>
                      <td className="p-3 text-gray-700">{log.performedByName}</td>
                      <td className="p-3 text-gray-500">{log.performedByRole || 'System'}</td>
                      <td className="p-3 pr-4 text-gray-600">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
