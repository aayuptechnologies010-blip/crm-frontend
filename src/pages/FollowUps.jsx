import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Bell, Plus, Trash2, Edit2, User, Building2, Phone, Mail, Tag, ArrowRight } from 'lucide-react';
import Card from '../components/shared/Card';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { Input, Select, PrimaryButton, SecondaryButton, IconButton } from '../components/shared/FormElements';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const today = new Date();

function MiniCalendar({ followUps }) {
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const followUpDays = new Set(
    followUps.filter(f => {
      const d = new Date(f.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).map(f => new Date(f.date).getDate())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">‹</button>
        <span className="text-sm font-semibold text-gray-700">
          {current.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-colors relative
            ${!day ? '' : day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              ? 'bg-blue-500 text-white font-bold'
              : 'hover:bg-gray-100 text-gray-700'}`}>
            {day}
            {day && followUpDays.has(day) && !(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyForm = { lead: '', company: '', date: '', time: '', assignedTo: '', priority: 'Medium', status: 'Pending' };

export default function FollowUps() {
  const { getFollowUpsForUser, addFollowUp, updateFollowUp, deleteFollowUp, leads } = useData();
  const { teamMembers, currentUser } = useAuth();
  const navigate = useNavigate();
  const followUps = getFollowUpsForUser(currentUser);
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  const filtered = followUps.filter(f => filter === 'All' || f.status === filter);

  const openDetail = (f) => {
    const linkedLead = leads.find(l => l.name === f.lead || l._id === f.leadRef || l.id === f.leadRef);
    setSelectedFollowUp({ f, linkedLead });
  };

  const closeDetail = () => setSelectedFollowUp(null);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal('form'); };

  const openEdit = (f) => {
    closeDetail();
    setForm({ ...f });
    setEditId(f.id || f._id);
    setModal('form');
  };

  const handleSave = async () => {
    if (!form.lead.trim()) return;
    if (editId) await updateFollowUp(editId, form);
    else await addFollowUp(form);
    setModal(null);
  };

  const toggleDone = async (f) => {
    await updateFollowUp(f.id || f._id, { ...f, status: f.status === 'Done' ? 'Pending' : 'Done' });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Calendar</h3>
          </div>
          <MiniCalendar followUps={followUps} />
        </Card>

        {/* Follow-ups list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              {['All', 'Pending', 'Done'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {f}
                </button>
              ))}
            </div>
            <PrimaryButton onClick={openAdd} className="flex items-center gap-1.5">
              <Plus size={14} /> Add Follow-up
            </PrimaryButton>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-gray-400 text-sm">No follow-ups found.</Card>
            )}
            {filtered.map(f => (
              <div
                key={f.id || f._id}
                onClick={() => openDetail(f)}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={e => { e.stopPropagation(); toggleDone(f); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                      ${f.status === 'Done' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-blue-50 hover:bg-blue-100'}`}>
                    {f.status === 'Done'
                      ? <CheckCircle size={18} className="text-gray-400" />
                      : <Bell size={18} className="text-blue-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-800">{f.lead}</p>
                        <p className="text-sm text-gray-500">{f.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={f.priority} />
                        <StatusBadge status={f.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {f.time}</span>
                      <span>{f.date}</span>
                      <span>Assigned: {f.assignedTo}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <IconButton onClick={e => { e.stopPropagation(); openEdit(f); }} variant="blue" title="Edit"><Edit2 size={14} /></IconButton>
                    <IconButton onClick={e => { e.stopPropagation(); deleteFollowUp(f.id || f._id); }} variant="red" title="Delete"><Trash2 size={14} /></IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={selectedFollowUp !== null} onClose={closeDetail} title="Follow-up Details" size="md">
        {selectedFollowUp && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={selectedFollowUp.f.status} />
              <StatusBadge status={selectedFollowUp.f.priority} />
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                selectedFollowUp.f.status === 'Done' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {selectedFollowUp.f.status === 'Done' ? '✓ Completed' : '⏳ Pending'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Follow-up Info</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: 'Date',        value: selectedFollowUp.f.date },
                  { icon: Clock,    label: 'Time',        value: selectedFollowUp.f.time || '—' },
                  { icon: User,     label: 'Assigned To', value: selectedFollowUp.f.assignedTo || '—' },
                  { icon: Tag,      label: 'Priority',    value: selectedFollowUp.f.priority || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={13} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">Lead Details</p>
              {selectedFollowUp.linkedLead ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedFollowUp.linkedLead.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedFollowUp.linkedLead.name}</p>
                      <p className="text-xs text-gray-500">{selectedFollowUp.linkedLead.company}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Phone,     label: 'Phone',  value: selectedFollowUp.linkedLead.phone },
                      { icon: Mail,      label: 'Email',  value: selectedFollowUp.linkedLead.email },
                      { icon: Tag,       label: 'Status', value: selectedFollowUp.linkedLead.status },
                      { icon: Building2, label: 'Source', value: selectedFollowUp.linkedLead.source },
                    ].filter(i => i.value).map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <Icon size={12} className="text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400">{label}</p>
                          <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedFollowUp.f.lead}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedFollowUp.f.company || '—'}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                onClick={() => { toggleDone(selectedFollowUp.f); closeDetail(); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedFollowUp.f.status === 'Done'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
                }`}>
                <CheckCircle size={14} />
                {selectedFollowUp.f.status === 'Done' ? 'Mark Pending' : 'Mark Done'}
              </button>
              <div className="flex gap-2">
                {selectedFollowUp.linkedLead && (
                  <SecondaryButton onClick={() => { closeDetail(); navigate(`/leads/${selectedFollowUp.linkedLead._id || selectedFollowUp.linkedLead.id}`); }}>
                    View Lead <ArrowRight size={14} />
                  </SecondaryButton>
                )}
                <PrimaryButton onClick={() => openEdit(selectedFollowUp.f)}>
                  <Edit2 size={14} /> Edit
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Follow-up' : 'Add Follow-up'} size="md">
        <div className="space-y-4">
          <Input label="Lead Name" value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })} placeholder="Enter lead name" />
          <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Enter company name" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Assign To" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Select member</option>
            {teamMembers.map(m => <option key={m.id}>{m.name}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['Pending', 'Done'].map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{editId ? 'Save Changes' : 'Add Follow-up'}</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
