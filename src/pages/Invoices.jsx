import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, FileText, Search, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/Card';
import DataTable from '../components/shared/DataTable';
import Modal from '../components/shared/Modal';
import { Input, Select, PrimaryButton, SecondaryButton, IconButton } from '../components/shared/FormElements';

const emptyForm = { client: '', contact: '', amount: '', status: 'Pending', issueDate: '', dueDate: '' };

export default function Invoices() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = invoices.filter(inv =>
    ((inv.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus ? inv.status === filterStatus : true)
  );

  const paid    = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0);
  const pending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (i.amount || 0), 0);
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.amount || 0), 0);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal('form'); };
  const openEdit = (inv) => {
    setForm({ client: inv.client, contact: inv.contact || '', amount: inv.amount, status: inv.status, issueDate: inv.issueDate || '', dueDate: inv.dueDate || '' });
    setEditId(inv._id || inv.id);
    setModal('form');
  };

  const handleSave = async () => {
    if (!form.client.trim() || !form.amount) return;
    if (editId) await updateInvoice(editId, form);
    else await addInvoice(form);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    await deleteInvoice(id);
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice ID', sortable: true, render: v => <span className="font-semibold text-gray-800">{v}</span> },
    {
      key: 'client', label: 'Client', sortable: true, render: (v, row) => (
        <div>
          <div className="font-semibold text-gray-800">{v}</div>
          <div className="text-gray-500 text-xs mt-0.5">{row.contact}</div>
        </div>
      )
    },
    { key: 'amount', label: 'Amount', sortable: true, render: v => <span className="font-semibold text-gray-800">₹{(v || 0).toLocaleString()}</span> },
    { key: 'issueDate', label: 'Issue Date', sortable: true, render: v => <span className="text-gray-600">{v || '—'}</span> },
    {
      key: 'status', label: 'Status', render: v => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          v === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
          v === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>{v}</span>
      )
    },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex gap-1 justify-end">
          <IconButton onClick={() => navigate(`/invoices/${row._id || row.id}`)} variant="blue" title="View Invoice"><Eye size={16} /></IconButton>
          <IconButton onClick={() => navigate(`/invoices/${row._id || row.id}?print=true`)} variant="green" title="Download PDF"><Download size={16} /></IconButton>
          {isAdmin && <IconButton onClick={() => openEdit(row)} variant="blue" title="Edit"><FileText size={14} /></IconButton>}
          {isAdmin && <IconButton onClick={() => handleDelete(row._id || row.id)} variant="red" title="Delete"><X size={14} /></IconButton>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 sm:flex-initial">
            <div className="pl-3 pr-2 py-2.5 flex items-center text-gray-400">
              <Search size={16} />
            </div>
            <input type="text" placeholder="Search invoices..."
              className="py-2.5 pr-4 outline-none text-sm w-full sm:w-64"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-150 outline-none shadow-sm">
            <option value="">All Statuses</option>
            {['Paid', 'Pending', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {isAdmin && (
          <PrimaryButton onClick={openAdd}>
            <Plus size={16} /> Create Invoice
          </PrimaryButton>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Paid Invoices', amount: paid, icon: FileText, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Pending', amount: pending, icon: FileText, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Overdue', amount: overdue, icon: FileText, bg: 'bg-red-100', color: 'text-red-600' },
        ].map(({ label, amount, icon: Icon, bg, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <h4 className="text-2xl font-bold text-gray-800">₹{amount.toLocaleString()}</h4>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No invoices yet. {isAdmin && 'Click "Create Invoice" to add one.'}
          </div>
        )}
        <DataTable columns={columns} data={filtered} />
      </Card>

      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Invoice' : 'Create Invoice'} size="md">
        <div className="space-y-4">
          <Input label="Client Name" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Company / Client name" />
          <Input label="Contact Person" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Contact person name" />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['Pending', 'Paid', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Issue Date" type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => setModal(null)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{editId ? 'Save Changes' : 'Create Invoice'}</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
