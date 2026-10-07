import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Upload, Plus, Trash2, UserCheck, Calendar, Phone, Download } from 'lucide-react';
import Card from '../components/shared/Card';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { Input, Select, PrimaryButton, SecondaryButton } from '../components/shared/FormElements';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import LeadImportModal from '../components/shared/LeadImportModal';
import CallPanel from '../components/shared/CallPanel';

const emptyForm = {
  name: '', company: '', phone: '', email: '', source: '', status: 'New',
  leadType: 'Client Project', assignedTo: '', followUpDate: '',
  course: '', branch: '', college: '', year: '', trainingType: '',
  projectType: '', techStack: '', timeline: '', value: '',
  contactPerson: '', pinCode: '', typeOfCare: '', hospitalZone: '', tpaName: '',
};

export default function Leads() {
  const navigate = useNavigate();
  const { getLeadsForUser, addLead, updateLead, deleteLead, assignLead } = useData();
  const { teamMembers, currentUser } = useAuth();

  const leads = getLeadsForUser(currentUser);
  const isSalesExec  = currentUser?.role === 'Sales Executive';
  const isAdmin      = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterLeadType, setFilterLeadType] = useState('');
  const [selected, setSelected]           = useState([]);
  const [modal, setModal]                 = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [editId, setEditId]               = useState(null);
  const [assignTo, setAssignTo]           = useState('');
  const [importOpen, setImportOpen]       = useState(false);
  const [callLead, setCallLead]           = useState(null);

  const filtered = leads.filter(l =>
    ((l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus ? l.status === filterStatus : true) &&
    (filterLeadType ? l.leadType === filterLeadType : true)
  );

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModal('form'); };
  const openEdit = (lead) => { setForm({ ...lead }); setEditId(lead.id); setModal('form'); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) await updateLead(editId, form, currentUser?.name);
    else await addLead(form, currentUser?.name);
    setModal(null);
  };

  const handleDelete = async () => {
    await deleteLead(selected);
    setSelected([]);
    setModal(null);
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    await assignLead(selected, assignTo, '', currentUser?.name);
    setSelected([]);
    setAssignTo('');
    setModal(null);
  };

  const handleExport = () => {
    const rows = [
      ['Name','Phone','Email','Company','Source','Status','Lead Type','Assigned To','Follow-up Date','Deal Value'],
      ...filtered.map(l => [
        l.name, l.phone, l.email, l.company, l.source, l.status,
        l.leadType, l.assignedTo, l.followUpDate, l.value
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name', label: 'Name', sortable: true, render: (v, row) => {
        const displayName = row.contactPerson || v;
        return (
          <button onClick={() => navigate(`/leads/${row.id}`)}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline text-left">{displayName}</button>
        );
      }
    },
    { key: 'company', label: 'Company', sortable: true },
    {
      key: 'leadType', label: 'Type', render: v => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${v === 'Student Training' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {v || 'Client Project'}
        </span>
      )
    },
    {
      key: 'phone', label: 'Phone', render: (v, row) => (
        <button onClick={() => setCallLead(row)}
          className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline font-medium">
          <Phone size={13} className="text-green-500" /> {v}
        </button>
      )
    },
    { key: 'email', label: 'Email', render: v => <span className="text-gray-500">{v}</span> },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    ...(!isSalesExec ? [{ key: 'assignedTo', label: 'Assigned To', render: v => v || <span className="text-gray-400 italic text-xs">Unassigned</span> }] : []),
    {
      key: 'followUpDate', label: 'Follow-up', sortable: true,
      render: (v, row) => v
        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"><Calendar size={12} />{v}</span>
        : <button onClick={() => navigate(`/leads/${row.id}`)} className="text-xs text-blue-500 hover:underline">+ Schedule</button>
    },
    ...(isAdmin ? [{
      key: 'id', label: '', render: (_, row) => (
        <button onClick={() => openEdit(row)} className="text-xs text-blue-500 hover:text-blue-600 font-medium">Edit</button>
      )
    }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none">
            <option value="">All Status</option>
            {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Interested', 'Won', 'Lost', 'No Response'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterLeadType} onChange={e => setFilterLeadType(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none">
            <option value="">All Lead Types</option>
            {['Client Project', 'Student Training'].map(t => <option key={t}>{t}</option>)}
          </select>
          {selected.length > 0 && !isSalesExec && (
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setModal('assign')} className="flex items-center gap-1.5">
                <UserCheck size={14} /> Assign ({selected.length})
              </SecondaryButton>
              <button onClick={() => setModal('delete')}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
        {!isSalesExec && (
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setImportOpen(true)} className="flex items-center gap-1.5">
              <Upload size={14} /> Import
            </SecondaryButton>
            <SecondaryButton onClick={handleExport} className="flex items-center gap-1.5">
              <Download size={14} /> Export
            </SecondaryButton>
            <PrimaryButton onClick={openAdd} className="flex items-center gap-1.5">
              <Plus size={14} /> Add Lead
            </PrimaryButton>
          </div>
        )}
      </div>

      {isSalesExec && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-blue-700 flex items-center gap-2">
          <UserCheck size={15} />
          Showing only leads assigned to you — <strong>{currentUser?.name}</strong>
        </div>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">{filtered.length} Leads</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Filter size={12} /> Filtered
          </div>
        </div>
        <DataTable columns={columns} data={filtered} selectable={!isSalesExec} onSelectionChange={setSelected} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Lead' : 'Add New Lead'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" />
          <Select label="Lead Type" value={form.leadType || 'Client Project'} onChange={e => setForm({ ...form, leadType: e.target.value })}>
            <option value="Client Project">Client Project</option>
            <option value="Student Training">Student Training</option>
          </Select>
          <Select label="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
            <option value="">Select source</option>
            {['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Conference'].map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Interested', 'Won', 'Lost', 'No Response'].map(s => <option key={s}>{s}</option>)}
          </Select>

          {form.leadType === 'Student Training' && (
            <>
              <Input label="Course Name" value={form.course || ''} onChange={e => setForm({ ...form, course: e.target.value })} placeholder="e.g. Full Stack Web Development" />
              <Input label="Branch" value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="e.g. CSE / IT / ECE" />
              <Input label="College Name" value={form.college || ''} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="Enter college name" />
              <Select label="Year of Study" value={form.year || ''} onChange={e => setForm({ ...form, year: e.target.value })}>
                <option value="">Select Year</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Passed Out'].map(y => <option key={y}>{y}</option>)}
              </Select>
              <Select label="Training Mode" value={form.trainingType || ''} onChange={e => setForm({ ...form, trainingType: e.target.value })}>
                <option value="">Select Mode</option>
                {['Online', 'Offline'].map(m => <option key={m}>{m}</option>)}
              </Select>
            </>
          )}

          {(form.leadType === 'Client Project' || !form.leadType) && (
            <>
              <Input label="Company Name" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Enter company name" />
              <Input label="Contact Person" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} placeholder="e.g. Dr. Rahul Sharma" />
              <Input label="Pin Code" value={form.pinCode || ''} onChange={e => setForm({ ...form, pinCode: e.target.value })} placeholder="e.g. 400001" />
              <Input label="Type of Care" value={form.typeOfCare || ''} onChange={e => setForm({ ...form, typeOfCare: e.target.value })} placeholder="e.g. ICU, OPD, General Ward" />
              <Input label="Hospital Zone" value={form.hospitalZone || ''} onChange={e => setForm({ ...form, hospitalZone: e.target.value })} placeholder="e.g. North Zone, Zone A" />
              <Input label="TPA Name" value={form.tpaName || ''} onChange={e => setForm({ ...form, tpaName: e.target.value })} placeholder="e.g. Medi Assist, Star Health TPA" />
              <Select label="Project Type" value={form.projectType || ''} onChange={e => setForm({ ...form, projectType: e.target.value })}>
                <option value="">Select Project Type</option>
                {['Web Application', 'Mobile Application', 'E-Commerce Website', 'UI/UX Design', 'Custom ERP/CRM Software', 'Other'].map(pt => <option key={pt}>{pt}</option>)}
              </Select>
              <Input label="Preferred Tech Stack" value={form.techStack || ''} onChange={e => setForm({ ...form, techStack: e.target.value })} placeholder="e.g. MERN Stack, Python, PHP" />
              <Select label="Expected Timeline" value={form.timeline || ''} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                <option value="">Select Timeline</option>
                {['< 1 Month', '1 - 3 Months', '3 - 6 Months', '6+ Months'].map(t => <option key={t}>{t}</option>)}
              </Select>
              <Input label="Deal Value (₹)" value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Enter project budget" />
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{editId ? 'Save Changes' : 'Add Lead'}</PrimaryButton>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Delete Leads" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selected.length}</strong> selected lead(s)? This cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">Delete</button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={modal === 'assign'} onClose={() => setModal(null)} title="Assign Leads" size="sm">
        <p className="text-sm text-gray-500 mb-4">Assign <strong>{selected.length}</strong> selected lead(s) to:</p>
        <Select label="Sales Executive" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
          <option value="">Select member</option>
          {teamMembers.map(m => <option key={m.id}>{m.name}</option>)}
        </Select>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleAssign} className="flex items-center gap-1.5"><UserCheck size={14} /> Assign</PrimaryButton>
        </div>
      </Modal>

      <LeadImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
      {callLead && <CallPanel lead={callLead} onClose={() => setCallLead(null)} />}
    </div>
  );
}
