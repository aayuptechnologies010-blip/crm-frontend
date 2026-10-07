import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, KeyRound, Search, Mail, MessageCircle, X } from 'lucide-react';
import Card from '../components/shared/Card';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { Input, Select, PrimaryButton, SecondaryButton, IconButton } from '../components/shared/FormElements';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const emptyForm = { name: '', email: '', password: '', role: 'Sales Executive', branch: '', team: '', status: 'Active' };

export default function Team() {
  const navigate = useNavigate();
  const { currentUser, teamMembers, allUsers, addUser, updateUser, deleteUser } = useAuth();
  const { leads } = useData();

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');

  const members = allUsers.filter(u => u.role !== 'Super Admin');
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isAdmin = isSuperAdmin || currentUser?.role === 'Admin';
  const isBranchAdmin = currentUser?.role === 'Branch Admin';
  const canManage = isAdmin || isBranchAdmin;

  // Distinct branches for filtering and assignment
  const branches = [...new Set(allUsers.map(u => u.branch).filter(Boolean))];
  const teams = [...new Set(allUsers.map(u => u.team).filter(t => t && t !== '-'))];

  // Hierarchy filter:
  // Super Admin / Admin: sabhi team members dekh sakte hain
  // Branch Admin: apne branch ke members + khud ko dekh sakta hai
  // Sales Executive: sirf apna profile
  const visibleMembers = isAdmin
    ? members
    : isBranchAdmin
      ? members.filter(m => (currentUser?.branch && m.branch === currentUser?.branch) || m._id === currentUser?._id || m.id === currentUser?.id)
      : members.filter(m => m._id === currentUser?._id || m.id === currentUser?.id);

  const filteredMembers = visibleMembers.filter(m =>
    ((m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase())) &&
    (filterRole ? m.role === filterRole : true) &&
    (filterBranch ? m.branch === filterBranch : true) &&
    (filterTeam ? m.team === filterTeam : true)
  );

  // Active leads = jo assigned hain (koi bhi status)
  const getActiveLeadsCount = (member) => leads.filter(l => l.assignedTo === member.name).length;
  const getConvertedCount = (member) => leads.filter(l => l.assignedTo === member.name && l.status === 'Won').length;

  const openAdd = () => { 
    setForm({ 
      ...emptyForm, 
      branch: isBranchAdmin ? (currentUser?.branch || '') : '' 
    }); 
    setEditId(null); 
    setFormError(''); 
    setModal('form'); 
  };
  const openEdit = (m) => { 
    setForm({ ...m, password: '', branch: m.branch || '' }); 
    setEditId(m.id || m._id); 
    setFormError(''); 
    setModal('form'); 
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and Email are required.'); return; }
    if (!editId && !form.password.trim()) { setFormError('Password is required for new members.'); return; }
    const duplicate = allUsers.find(u => u.email.toLowerCase() === form.email.toLowerCase() && (u.id !== editId && u._id !== editId));
    if (duplicate) { setFormError('This email is already registered.'); return; }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        branch: form.branch?.trim() || '',
        team: form.team || '-',
        status: form.status,
      };
      if (form.password && form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editId) await updateUser(editId, payload);
      else await addUser(payload);
      setModal(null);
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) await deleteUser(id);
  };

  const openMemberLeads = (member) => {
    setSelectedMember(member);
    setLeadSearch('');
    setLeadStatusFilter('All');
    setModal('memberLeads');
  };

  const memberLeads = selectedMember ? leads.filter(l => l.assignedTo === selectedMember.name) : [];
  // Dynamic statuses from actual leads of this member
  const memberStatuses = ['All', ...new Set(memberLeads.map(l => l.status).filter(Boolean))];
  const filteredMemberLeads = memberLeads.filter(l => {
    const s = leadSearch.toLowerCase();
    const matchSearch = !s || (l.name || '').toLowerCase().includes(s) || (l.company || '').toLowerCase().includes(s);
    const matchStatus = leadStatusFilter === 'All' || l.status === leadStatusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'name', label: 'Name', sortable: true, render: (v, row) => (
        <button
          onClick={() => openMemberLeads(row)}
          className="flex items-center gap-2.5 hover:text-blue-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 group-hover:bg-blue-200">
            {row.profileImage
              ? <img src={row.profileImage} alt={v} className="w-full h-full object-cover" />
              : row.avatar}
          </div>
          <span className="font-medium text-gray-800 group-hover:text-blue-600">{v}</span>
        </button>
      )
    },
    { key: 'email', label: 'Email', render: v => <span className="text-gray-500">{v}</span> },
    {
      key: 'role', label: 'Role', render: v => {
        let badgeColor = 'bg-gray-100 text-gray-600';
        if (v === 'Admin') badgeColor = 'bg-blue-100 text-blue-700';
        if (v === 'Branch Admin') badgeColor = 'bg-purple-100 text-purple-700 font-semibold';
        return <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${badgeColor}`}>{v}</span>;
      }
    },
    { key: 'branch', label: 'Branch', render: v => v || <span className="text-gray-400 italic text-xs">—</span> },
    { key: 'team', label: 'Team' },
    {
      key: 'leads', label: 'Leads (Active)', sortable: true,
      render: (_, row) => (
        <button onClick={() => openMemberLeads(row)} className="font-semibold text-blue-600 hover:underline">
          {getActiveLeadsCount(row)}
        </button>
      )
    },
    { key: 'converted', label: 'Converted', sortable: true, render: (_, row) => getConvertedCount(row) },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'contact', label: 'Contact', render: (_, row) => (
        <div className="flex gap-1.5">
          <a href={`mailto:${row.email}`} title={`Email ${row.name}`}
            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200 transition-all">
            <Mail size={14} />
          </a>
          <a href={row.phone ? `https://wa.me/${row.phone.replace(/\D/g, '')}` : '#'}
            title={row.phone ? `WhatsApp ${row.name}` : 'No phone'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${row.phone ? 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
            onClick={e => !row.phone && e.preventDefault()}>
            <MessageCircle size={14} />
          </a>
        </div>
      )
    },
    {
      key: 'id', label: 'Actions', render: (_, row) => (
        <div className="flex gap-1">
          <IconButton onClick={() => openEdit(row)} variant="blue" title="Edit Member"><Edit2 size={14} /></IconButton>
          <IconButton onClick={() => handleDelete(row.id || row._id)} variant="red" title="Remove Member"><Trash2 size={14} /></IconButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {isAdmin && teams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teams.map(team => {
            const teamList = members.filter(m => m.team === team);
            return (
              <Card key={team} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{team}</h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-medium">{teamList.length} members</span>
                </div>
                <div className="flex -space-x-2">
                  {teamList.map(m => (
                    <div key={m.id || m._id} title={m.name}
                      className="w-8 h-8 border-2 border-white rounded-full overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                      {m.profileImage
                        ? <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                        : m.avatar}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {teamList.reduce((s, m) => s + getActiveLeadsCount(m), 0)} active leads · {teamList.reduce((s, m) => s + getConvertedCount(m), 0)} converted
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <span className="text-sm font-semibold text-gray-700">{filteredMembers.length} Team Members</span>
          {canManage && <PrimaryButton onClick={openAdd}><Plus size={14} /> Add Member</PrimaryButton>}
        </div>
        {canManage && (
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center flex-wrap">
            <div className="relative flex-1 min-w-48 w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none">
                <option value="">All Roles</option>
                {isAdmin && <option value="Admin">Admin</option>}
                <option value="Branch Admin">Branch Admin</option>
                <option value="Sales Executive">Sales Executive</option>
              </select>
              {isAdmin && (
                <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                  className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b}>{b}</option>)}
                </select>
              )}
              <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none">
                <option value="">All Teams</option>
                {teams.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
        <DataTable columns={columns} data={filteredMembers} />
      </Card>

      {/* Member Leads Modal */}
      <Modal isOpen={modal === 'memberLeads'} onClose={() => setModal(null)}
        title={selectedMember ? `${selectedMember.name}'s Assigned Leads` : ''} size="xl">
        {selectedMember && (
          <div className="space-y-4">

            {/* Member summary + status-wise count */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl flex-wrap">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {selectedMember.profileImage
                  ? <img src={selectedMember.profileImage} alt={selectedMember.name} className="w-full h-full object-cover" />
                  : selectedMember.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{selectedMember.name}</p>
                <p className="text-xs text-gray-500">{selectedMember.role} · {selectedMember.team || '—'}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Total', value: memberLeads.length, color: 'text-blue-600' },
                  { label: 'Won', value: memberLeads.filter(l => l.status === 'Won').length, color: 'text-green-600' },
                  { label: 'Lost', value: memberLeads.filter(l => l.status === 'Lost').length, color: 'text-red-500' },
                  { label: 'Pending', value: memberLeads.filter(l => !['Won','Lost'].includes(l.status)).length, color: 'text-orange-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Search + Dynamic Status Filter chips */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                  placeholder="Search by name or company..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none bg-white" />
              </div>
              {/* Dynamic status chips — only statuses that exist in this member's leads */}
              <div className="flex gap-1.5 flex-wrap">
                {memberStatuses.map(s => (
                  <button key={s} onClick={() => setLeadStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      leadStatusFilter === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}>
                    {s}{s !== 'All' && ` (${memberLeads.filter(l => l.status === s).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads table */}
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-100">
              {filteredMemberLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No leads found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                    <tr>
                      {['Lead', 'Status', 'Value', 'Follow-up', 'Last Remark'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMemberLeads.map(lead => {
                      const lastNote = lead.notes?.length > 0 ? lead.notes[0] : null;
                      return (
                        <tr key={lead._id || lead.id}
                          onClick={() => { setModal(null); navigate(`/leads/${lead._id || lead.id}`); }}
                          className="hover:bg-blue-50 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-blue-600">{lead.contactPerson || lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.company || '—'} · {lead.phone || ''}</p>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                          <td className="px-4 py-3 text-gray-700 font-medium text-xs">{lead.value ? `₹${lead.value}` : '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{lead.followUpDate || '—'}</td>
                          <td className="px-4 py-3">
                            {lastNote ? (
                              <div>
                                <p className="text-xs text-gray-700 line-clamp-2">{lastNote.text || lastNote}</p>
                                {lastNote.time && <p className="text-[10px] text-gray-400 mt-0.5">{lastNote.time}</p>}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 italic">No remarks</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center">Click any row to view full lead details, notes & activity</p>
          </div>
        )}
      </Modal>

      {/* Add/Edit Member Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Member' : 'Add Team Member'} size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name}
            onChange={e => { setForm({ ...form, name: e.target.value }); setFormError(''); }} placeholder="Enter full name" />
          <Input label="Email Address" type="email" value={form.email}
            onChange={e => { setForm({ ...form, email: e.target.value }); setFormError(''); }} placeholder="Enter email address" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <KeyRound size={13} className="text-gray-400" />
              {editId ? 'New Password (leave blank to keep)' : 'Login Password'}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setFormError(''); }}
                placeholder="Enter login password"
                className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all pr-16" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600 font-semibold">
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-400">Member will use this password to login.</p>
          </div>
          <Select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {isAdmin && <option value="Admin">Admin</option>}
            <option value="Branch Admin">Branch Admin</option>
            <option value="Sales Executive">Sales Executive</option>
          </Select>
          <Input label="Branch Location / Code" value={form.branch || ''}
            onChange={e => setForm({ ...form, branch: e.target.value })} 
            placeholder="e.g. Delhi, Mumbai, Noida" />
          <Select label="Team" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })}>
            <option value="">Select Team / Enter below</option>
            {teams.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Or enter new team name" value={teams.includes(form.team) ? '' : form.team}
            onChange={e => setForm({ ...form, team: e.target.value })} placeholder="e.g. Team Delta" />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
          </Select>
          {formError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{formError}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{editId ? 'Save Changes' : 'Add Member'}</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
