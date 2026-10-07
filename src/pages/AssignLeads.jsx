import { useState } from 'react';
import { Shuffle, UserCheck, Users, Search, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/shared/Card';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import CallPanel from '../components/shared/CallPanel';
import { Select, PrimaryButton, SecondaryButton, BadgeButton } from '../components/shared/FormElements';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

function TeamWorkload({ leads, teamMembers }) {
  const [expanded, setExpanded] = useState(null);
  const [memberLeadSearch, setMemberLeadSearch] = useState('');

  const toggle = (name) => {
    setExpanded(prev => prev === name ? null : name);
    setMemberLeadSearch('');
  };

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Team Workload — Click member to see their leads</h3>
      <div className="space-y-2">
        {teamMembers.map(m => {
          const memberLeads = leads.filter(l => l.assignedTo === m.name);
          const count = memberLeads.length;
          const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
          const isOpen = expanded === m.name;

          const filtered = memberLeads.filter(l => {
            const s = memberLeadSearch.toLowerCase();
            return !s || (l.name || '').toLowerCase().includes(s) || (l.company || '').toLowerCase().includes(s);
          });

          return (
            <div key={m.id} className="border border-gray-100 rounded-2xl overflow-hidden">
              {/* Member Row */}
              <button
                onClick={() => toggle(m.name)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                  {m.avatar || m.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{m.name}</span>
                    <span className="text-xs font-semibold text-blue-600">{count} leads</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="ml-2 text-gray-400">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded Leads */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {/* Search inside member leads */}
                  {count > 5 && (
                    <div className="px-4 pt-3">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={memberLeadSearch}
                          onChange={e => setMemberLeadSearch(e.target.value)}
                          placeholder={`Search ${m.name}'s leads...`}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {count === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No leads assigned</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-500">Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-500">Company</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-500">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filtered.map(lead => (
                            <tr key={lead.id} className="hover:bg-white transition-colors">
                              <td className="px-4 py-2 font-medium text-gray-800">{lead.contactPerson || lead.name}</td>
                              <td className="px-3 py-2 text-gray-500">{lead.company || '—'}</td>
                              <td className="px-3 py-2">
                                <StatusBadge status={lead.status} />
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  lead.leadType === 'Student Training' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>{lead.leadType || 'Client Project'}</span>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filtered.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-3">No results found</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {teamMembers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No team members added yet.</p>
        )}
      </div>
    </Card>
  );
}

export default function AssignLeads() {
  const { leads, assignLead } = useData();
  const { teamMembers, currentUser } = useAuth();

  // Only Super Admin and Admin can access this page
  const canAccess = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
        <UserCheck size={28} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">Access Restricted</p>
      <p className="text-sm text-gray-400">Only Admins can assign leads.</p>
    </div>
  );

  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [callLead, setCallLead] = useState(null); // lead being called

  // Filter states
  const [search, setSearch] = useState('');
  const [filterAssignment, setFilterAssignment] = useState('Unassigned');
  const [filterSource, setFilterSource] = useState('');
  const [filterLeadType, setFilterLeadType] = useState('');

  const unassigned = leads.filter(l => !l.assignedTo);
  const isAlreadyAssigned = (lead) => !!lead.assignedTo;
  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const filteredLeads = leads.filter(l => {
    const s = search.toLowerCase();
    const matchesSearch = 
      ((l.name || '').toLowerCase().includes(s)) || 
      (l.company && l.company.toLowerCase().includes(s)) ||
      (l.phone && l.phone.toLowerCase().includes(s)) ||
      (l.email && l.email.toLowerCase().includes(s)) ||
      (l.leadType && l.leadType.toLowerCase().includes(s)) ||
      (l.course && l.course.toLowerCase().includes(s)) ||
      (l.college && l.college.toLowerCase().includes(s)) ||
      (l.projectType && l.projectType.toLowerCase().includes(s)) ||
      (l.techStack && l.techStack.toLowerCase().includes(s));

    const matchesAssignment = filterAssignment === 'All' ? true 
                            : filterAssignment === 'Assigned' ? !!l.assignedTo 
                            : !l.assignedTo;
    const matchesSource = filterSource ? l.source === filterSource : true;
    const matchesLeadType = filterLeadType ? l.leadType === filterLeadType : true;
    return matchesSearch && matchesAssignment && matchesSource && matchesLeadType;
  });

  const handleBulkAssign = async () => {
    if (!assignTo) return;
    await assignLead(selected, assignTo, followUpDate);
    setSelected([]);
    setAssignTo('');
    setFollowUpDate('');
    setMemberSearch('');
    setModal(null);
  };

  const handleRoundRobin = async () => {
    const execs = teamMembers.filter(m => m.role === 'Sales Executive');
    if (execs.length === 0) return;
    const unassignedIds = unassigned.map(l => l.id);
    const assignments = {};
    unassignedIds.forEach((id, idx) => {
      const exec = execs[idx % execs.length].name;
      if (!assignments[exec]) assignments[exec] = [];
      assignments[exec].push(id);
    });
    await Promise.all(Object.entries(assignments).map(([exec, ids]) => assignLead(ids, exec)));
    setModal(null);
  };

  const columns = [
    { key: 'name', label: 'Lead Name', sortable: true },
    { key: 'company', label: 'Company' },
    {
      key: 'leadType', label: 'Type', render: v => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${v === 'Student Training' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {v || 'Client Project'}
        </span>
      )
    },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'assignedTo', label: 'Assigned To', render: v => v
        ? <span className="text-blue-600 font-semibold">{v}</span>
        : <span className="text-gray-400 italic text-xs">Unassigned</span>
    },
    {
      key: 'id', label: 'Actions', render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.assignedTo ? (
            <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">Assigned</span>
          ) : (
            <BadgeButton
              color="blue"
              onClick={() => { setSelected([row.id]); setAssignTo(''); setModal('single'); }}
            >
              Assign
            </BadgeButton>
          )}
          {row.phone && (
            <button
              onClick={() => setCallLead(row)}
              title={`Call ${row.phone}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 text-xs font-semibold transition-all"
            >
              <Phone size={11} /> Call
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Users, color: 'bg-gray-100 text-gray-500' },
          { label: 'Assigned', value: leads.filter(l => l.assignedTo).length, icon: UserCheck, color: 'bg-blue-50 text-blue-500' },
          { label: 'Unassigned', value: unassigned.length, icon: Users, color: 'bg-orange-50 text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        {selected.length > 0 && (
          <PrimaryButton onClick={() => { setAssignTo(''); setModal('bulk'); }}>
            <UserCheck size={14} /> Bulk Assign ({selected.length})
          </PrimaryButton>
        )}
        <SecondaryButton onClick={() => setModal('roundrobin')}>
          <Shuffle size={14} /> Round-Robin Auto Assign
        </SecondaryButton>
      </div>

      {/* Table */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <span className="text-sm font-semibold text-gray-700">{filteredLeads.length} Leads — Assignment View</span>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 min-w-48 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search leads by name or company..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={filterAssignment} 
              onChange={e => setFilterAssignment(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="All">All Assignment Status</option>
              <option value="Assigned">Assigned Only</option>
              <option value="Unassigned">Unassigned Only</option>
            </select>
            <select 
              value={filterLeadType} 
              onChange={e => setFilterLeadType(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">All Lead Types</option>
              <option value="Client Project">Client Project</option>
              <option value="Student Training">Student Training</option>
            </select>
            <select 
              value={filterSource} 
              onChange={e => setFilterSource(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">All Sources</option>
              {['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Conference'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={filteredLeads} selectable disabledRows={leads.filter(l => l.assignedTo).map(l => l.id)} onSelectionChange={setSelected} />
      </Card>

      {/* Team Workload */}
      <TeamWorkload leads={leads} teamMembers={teamMembers} />

      {/* Single / Bulk Assign Modal */}
      <Modal isOpen={modal === 'single' || modal === 'bulk'} onClose={() => { setModal(null); setMemberSearch(''); }}
        title={modal === 'bulk' ? `Bulk Assign (${selected.length} leads)` : 'Assign Lead'} size="sm">
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1.5">Assign To (Search Team Member)</label>
            <input 
              type="text" 
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Search member by name or role..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white mb-2 transition-all" 
            />
            <div className="border border-gray-200 rounded-2xl max-h-40 overflow-y-auto p-1.5 space-y-1 bg-gray-50/50">
              {filteredMembers.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No team members found</p>
              )}
              {filteredMembers.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAssignTo(m.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs border
                    ${assignTo === m.name ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold shadow-sm' : 'hover:bg-white border-transparent text-gray-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[10px] text-blue-600 flex-shrink-0">
                      {m.avatar || m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.name}</p>
                      <p className="text-[10px] text-gray-400 font-normal">{m.role}</p>
                    </div>
                  </div>
                  {assignTo === m.name && <span className="text-blue-500 font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1.5">Follow-up Date</label>
            <input 
              type="date" 
              value={followUpDate} 
              onChange={e => setFollowUpDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white transition-all" 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => { setModal(null); setMemberSearch(''); }}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleBulkAssign}><UserCheck size={14} /> Assign</PrimaryButton>
        </div>
      </Modal>

      {/* Call Panel */}
      {callLead && (
        <CallPanel
          lead={callLead}
          onClose={() => setCallLead(null)}
          onSaved={() => setCallLead(null)}
        />
      )}

      {/* Round Robin Modal */}
      <Modal isOpen={modal === 'roundrobin'} onClose={() => setModal(null)} title="Round-Robin Auto Assignment" size="sm">
        <div className="p-4 bg-blue-50 rounded-xl mb-4">
          <p className="text-sm text-blue-700 font-semibold">Auto-assign {unassigned.length} unassigned leads</p>
          <p className="text-xs text-blue-500 mt-1">Leads will be distributed evenly across all Sales Executives.</p>
        </div>
        <div className="space-y-2">
          {teamMembers.filter(m => m.role === 'Sales Executive').map(m => (
            <div key={m.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">{m.name}</span>
              <span className="text-xs text-blue-500 font-semibold">
                ~{teamMembers.filter(x => x.role === 'Sales Executive').length > 0
                  ? Math.ceil(unassigned.length / teamMembers.filter(x => x.role === 'Sales Executive').length)
                  : 0} leads
              </span>
            </div>
          ))}
          {teamMembers.filter(m => m.role === 'Sales Executive').length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No Sales Executives found.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleRoundRobin}>
            <Shuffle size={14} /> Auto Assign
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
