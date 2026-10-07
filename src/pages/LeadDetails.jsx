import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, Building2, Calendar, Plus, CheckCircle, Clock, 
  MessageCircle, DollarSign, User, FileText, Upload, ShieldCheck, MapPin, 
  Send, Layers, ChevronRight, AlertCircle, FileCheck, RefreshCw
} from 'lucide-react';
import Card from '../components/shared/Card';
import { Input, Select, PrimaryButton, SecondaryButton, GhostButton, IconButton } from '../components/shared/FormElements';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import CallPanel from '../components/shared/CallPanel';
import { api } from '../utils/api';

// 16 Stages ordered logically according to PDF Section 3 & 17
const STAGES = [
  'New Lead',
  'Lead Assigned',
  'First Contact',
  'Contacted',
  'Requirement Collected',
  'Meeting / Demo',
  'Quotation Sent',
  'Follow-up',
  'Negotiation',
  'Project Confirmed',
  'Documentation',
  'Payment / Advance',
  'Project Started',
  'Project In Progress',
  'Project Completed',
  'Closed / Won'
];

const DROP_OFF_STAGES = ['Not Interested', 'Lost / Closed Lost'];

const ACTIVITY_ICONS = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  Meeting: Calendar,
  'Site Visit': MapPin,
  Requirement: Layers,
  Quotation: FileText,
  Payment: DollarSign,
  'Follow-up': Clock,
  'Status Change': RefreshCw,
  Note: FileText,
  'Document Upload': Upload,
  Assignment: User,
  Other: CheckCircle
};

const ACTIVITY_COLORS = {
  Call: 'bg-emerald-500 text-white',
  WhatsApp: 'bg-green-600 text-white',
  Email: 'bg-sky-500 text-white',
  Meeting: 'bg-purple-600 text-white',
  'Site Visit': 'bg-indigo-600 text-white',
  Requirement: 'bg-amber-500 text-white',
  Quotation: 'bg-pink-600 text-white',
  Payment: 'bg-emerald-700 text-white',
  'Follow-up': 'bg-blue-600 text-white',
  'Status Change': 'bg-violet-600 text-white',
  Note: 'bg-gray-600 text-white',
  'Document Upload': 'bg-cyan-600 text-white',
  Assignment: 'bg-orange-500 text-white',
  Other: 'bg-slate-500 text-white'
};

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead, addFollowUp } = useData();
  const { teamMembers, currentUser } = useAuth();

  const currentLead = leads.find(l => String(l._id || l.id) === String(id) || String(l.id) === String(id));
  const [lead, setLead] = useState(currentLead || null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'quotations' | 'documents' | 'payments' | 'requirements'

  // Activity Timeline
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Log Activity Modal / Inline Form state
  const [actType, setActType] = useState('Call');
  const [actRemark, setActRemark] = useState('');
  const [actNextAction, setActNextAction] = useState('');
  const [actNextDate, setActNextDate] = useState('');
  const [isSubmittingAct, setIsSubmittingAct] = useState(false);

  // Status Change Dialog / State
  const [status, setStatus] = useState(lead?.status || 'New Lead');
  const [statusRemark, setStatusRemark] = useState('');

  // Quotation form state
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteFileUrl, setQuoteFileUrl] = useState('');

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState('Advance');
  const [payMode, setPayMode] = useState('UPI');
  const [payTxId, setPayTxId] = useState('');

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('KYC');
  const [docFileUrl, setDocFileUrl] = useState('');

  // Call & Followup
  const [callOpen, setCallOpen] = useState(false);
  const [fuDate, setFuDate] = useState(lead?.followUpDate || '');
  const [fuTime, setFuTime] = useState('10:00');
  const [fuAssign, setFuAssign] = useState('');
  const [scheduled, setScheduled] = useState(false);

  // Fetch full lead details directly if available
  useEffect(() => {
    if (id) {
      api.get(`/leads/${id}`)
        .then(data => {
          if (data) {
            setLead(data);
            setStatus(data.status || 'New Lead');
          }
        })
        .catch(() => {});
    }
  }, [id]);

  // Fetch Chronological Timeline
  const loadTimeline = async () => {
    if (!lead?._id && !id) return;
    setLoadingTimeline(true);
    try {
      const res = await api.get(`/workflow/leads/${lead?._id || id}/timeline`);
      if (res?.activities) {
        setTimeline(res.activities);
      }
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [lead?._id, id]);

  if (!lead) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
        <User size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">Lead not found</p>
      <SecondaryButton onClick={() => navigate('/leads')}><ArrowLeft size={14} /> Back to Leads</SecondaryButton>
    </div>
  );

  // Status Change Handler
  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.patch(`/leads/${lead._id || lead.id}`, {
        status: newStatus,
        statusRemark: statusRemark || `Transitioned to ${newStatus}`
      });
      setStatus(newStatus);
      setStatusRemark('');
      setLead(prev => ({ ...prev, status: newStatus }));
      loadTimeline();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Add Workflow Activity Handler
  const handleAddActivity = async (e) => {
    e?.preventDefault();
    if (!actRemark.trim() && !actNextAction.trim()) {
      alert('Please enter a remark or next action');
      return;
    }
    setIsSubmittingAct(true);
    try {
      await api.post(`/workflow/leads/${lead._id || lead.id}/timeline`, {
        activityType: actType,
        remark: actRemark,
        nextAction: actNextAction,
        nextFollowUpDate: actNextDate || undefined
      });
      setActRemark('');
      setActNextAction('');
      setActNextDate('');
      loadTimeline();
    } catch (err) {
      alert(err.message || 'Failed to record activity');
    } finally {
      setIsSubmittingAct(false);
    }
  };

  // Add Quotation Handler
  const handleAddQuotation = async (e) => {
    e.preventDefault();
    if (!quoteAmount) return alert('Please enter quotation amount');
    try {
      const res = await api.post(`/workflow/leads/${lead._id || lead.id}/quotations`, {
        quotationNumber: quoteNumber,
        amount: quoteAmount,
        fileUrl: quoteFileUrl,
        fileName: 'Quotation_Proposal.pdf',
        status: 'Sent'
      });
      if (res?.quotations) {
        setLead(prev => ({ ...prev, quotations: res.quotations, status: 'Quotation Sent' }));
        setStatus('Quotation Sent');
      }
      setQuoteAmount('');
      setQuoteNumber('');
      setQuoteFileUrl('');
      loadTimeline();
      alert('Quotation added successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add quotation');
    }
  };

  // Record Advance Payment Handler
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payAmount) return alert('Please enter payment amount');
    try {
      const res = await api.post(`/workflow/leads/${lead._id || lead.id}/payments`, {
        amount: payAmount,
        type: payType,
        paymentMode: payMode,
        transactionId: payTxId,
      });
      if (res?.payments) {
        setLead(prev => ({ ...prev, payments: res.payments, status: payType === 'Advance' ? 'Payment / Advance' : prev.status }));
        if (payType === 'Advance') setStatus('Payment / Advance');
      }
      setPayAmount('');
      setPayTxId('');
      loadTimeline();
      alert('Payment recorded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  // Document Upload Handler
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docTitle) return alert('Please enter document title');
    try {
      const res = await api.post(`/workflow/leads/${lead._id || lead.id}/documents`, {
        title: docTitle,
        documentType: docType,
        fileUrl: docFileUrl || 'https://example.com/sample_doc.pdf'
      });
      if (res?.documents) {
        setLead(prev => ({ ...prev, documents: res.documents }));
      }
      setDocTitle('');
      setDocFileUrl('');
      loadTimeline();
      alert('Document uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add document');
    }
  };

  // Quick Follow-up Scheduler
  const handleSchedule = async () => {
    if (!fuDate) return;
    await addFollowUp({
      lead: lead.name, company: lead.company, date: fuDate, time: fuTime,
      assignedTo: fuAssign || lead.assignedTo || '', priority: lead.priority || 'Medium', status: 'Pending',
    }, currentUser?.name);
    setScheduled(true);
    setTimeout(() => setScheduled(false), 2500);
  };

  // Stage progress calculations
  const currentStageIndex = STAGES.indexOf(status);

  return (
    <div className="space-y-5">
      {/* ── 1. LEAD HEADER BAR (PDF Section 14) ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <GhostButton onClick={() => navigate('/leads')} className="!px-2.5">
              <ArrowLeft size={18} />
            </GhostButton>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{lead.name || lead.contactPerson}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {status}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  lead.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                  lead.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {lead.priority || 'Medium Priority'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span><strong>ID:</strong> #{lead._id?.slice(-6) || lead.id}</span>
                <span>•</span>
                <span><strong>Company:</strong> {lead.company || '—'}</span>
                <span>•</span>
                <span><strong>Owner:</strong> {lead.assignedTo || 'Unassigned'}</span>
                <span>•</span>
                <span><strong>Branch:</strong> {lead.branch || 'Main HQ'}</span>
                <span>•</span>
                <span><strong>Source:</strong> {lead.source || 'Website'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons (Call, WhatsApp, Email, Schedule) */}
          <div className="flex items-center gap-2 flex-wrap">
            {lead.phone && (
              <button onClick={() => setCallOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-sm font-semibold transition-all shadow-sm">
                <Phone size={15} /> Call
              </button>
            )}
            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=Hi ${lead.name?.split(' ')[0] || ''},`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Mail size={15} /> Email
            </a>
          </div>
        </div>

        {/* ── 16-STAGE PROGRESS STEPPER BAR (PDF Section 3 & 17) ── */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 overflow-x-auto">
          <div className="flex items-center min-w-max gap-2 text-xs">
            {STAGES.map((stg, idx) => {
              const isCurrent = status === stg;
              const isPast = currentStageIndex > -1 && idx < currentStageIndex;
              return (
                <div key={stg} className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(stg)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 font-bold'
                        : isPast
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{idx + 1}.</span> {stg}
                  </button>
                  {idx < STAGES.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. MAIN WORKFLOW TABS ── */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        {[
          { id: 'timeline', label: 'Activity Timeline', icon: Clock, count: timeline.length },
          { id: 'requirements', label: 'Requirements & Scope', icon: Layers },
          { id: 'quotations', label: 'Quotations', icon: FileText, count: lead.quotations?.length || 0 },
          { id: 'documents', label: 'Documents / KYC', icon: FileCheck, count: lead.documents?.length || 0 },
          { id: 'payments', label: 'Payments & Advance', icon: DollarSign, count: lead.payments?.length || 0 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. TAB PANELS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Overview & Quick Actions) */}
        <div className="space-y-4">
          {/* Quick Log Activity Panel (PDF Section 4) */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Send size={15} className="text-blue-600" /> Log Activity
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Activity Type</label>
                <select
                  value={actType}
                  onChange={e => setActType(e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Conversation</option>
                  <option value="Email">Email Communication</option>
                  <option value="Meeting">Meeting / Demo</option>
                  <option value="Site Visit">Site Visit</option>
                  <option value="Requirement">Requirement Collected</option>
                  <option value="Follow-up">Follow-up Attempt</option>
                  <option value="Note">Internal Note</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Remark / Discussion Note</label>
                <textarea
                  rows={2}
                  value={actRemark}
                  onChange={e => setActRemark(e.target.value)}
                  placeholder="What was discussed?"
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Next Action</label>
                  <input
                    type="text"
                    value={actNextAction}
                    onChange={e => setActNextAction(e.target.value)}
                    placeholder="e.g. Send revised quote"
                    className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Next Follow-up</label>
                  <input
                    type="datetime-local"
                    value={actNextDate}
                    onChange={e => setActNextDate(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <PrimaryButton type="submit" disabled={isSubmittingAct} className="w-full justify-center mt-2">
                {isSubmittingAct ? 'Saving...' : 'Add Activity Event'}
              </PrimaryButton>
            </form>
          </Card>

          {/* Quick Follow-up Schedule (PDF Section 11) */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock size={15} className="text-amber-500" /> Schedule Next Follow-up
            </h3>
            <div className="space-y-3">
              <Input label="Date" type="date" value={fuDate} onChange={e => setFuDate(e.target.value)} />
              <Input label="Time" type="time" value={fuTime} onChange={e => setFuTime(e.target.value)} />
              <Select label="Assign To" value={fuAssign} onChange={e => setFuAssign(e.target.value)}>
                <option value="">Assigned Owner ({lead.assignedTo || 'Unassigned'})</option>
                {teamMembers.map(m => <option key={m.id || m.name} value={m.name}>{m.name}</option>)}
              </Select>
              <SecondaryButton onClick={handleSchedule} className="w-full justify-center">
                {scheduled ? <><CheckCircle size={14} /> Scheduled!</> : <><Clock size={14} /> Set Reminder</>}
              </SecondaryButton>
            </div>
          </Card>

          {/* Drop-off / Closed Lost Action */}
          <Card className="p-4 border-red-100 bg-red-50/30">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Alternative Closure</h4>
            <div className="flex gap-2">
              {DROP_OFF_STAGES.map(ds => (
                <button
                  key={ds}
                  onClick={() => handleStatusChange(ds)}
                  className="flex-1 py-1.5 px-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all"
                >
                  {ds}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Dynamic Tab Contents) */}
        <div className="lg:col-span-2 space-y-4">
          {/* TAB 1: ACTIVITY TIMELINE STREAM (PDF Section 4 & 6) */}
          {activeTab === 'timeline' && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">Chronological Workflow History</h3>
                <span className="text-xs text-gray-500 font-medium">Immutable Audit Trail</span>
              </div>

              {loadingTimeline ? (
                <div className="py-12 text-center text-gray-400">Loading timeline history...</div>
              ) : timeline.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No activity recorded yet for this lead.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                  {timeline.map((event) => {
                    const Icon = ACTIVITY_ICONS[event.activityType] || CheckCircle;
                    const colorClass = ACTIVITY_COLORS[event.activityType] || 'bg-blue-600 text-white';
                    return (
                      <div key={event._id || event.id} className="relative group">
                        <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${colorClass}`}>
                          <Icon size={12} />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 hover:border-gray-200 transition-all">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {event.activityType}
                              {event.systemGenerated && (
                                <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-normal">System</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {event.previousStatus && event.newStatus && (
                            <p className="text-xs text-blue-700 font-semibold mb-1">
                              Stage updated: <span className="line-through text-gray-400">{event.previousStatus}</span> → {event.newStatus}
                            </p>
                          )}

                          {event.remark && (
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{event.remark}</p>
                          )}

                          {event.nextAction && (
                            <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                              <span><strong>Next Action:</strong> {event.nextAction}</span>
                              {event.nextFollowUpDate && (
                                <span>Due: {new Date(event.nextFollowUpDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-400">
                            <span>Logged by: <strong>{event.performedByName || 'System'}</strong> ({event.performedByRole || 'Agent'})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: REQUIREMENTS & SCOPE (PDF Section 3 & 14) */}
          {activeTab === 'requirements' && (
            <Card className="p-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">Client Requirements & Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">Target Budget</span>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">₹{lead.budget || lead.value || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">Project / Care Type</span>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{lead.projectType || lead.typeOfCare || 'Standard'}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">Location / Pin Code</span>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{lead.location || lead.pinCode || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">Tech Stack / Details</span>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{lead.techStack || lead.course || '—'}</p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Detailed Requirements & Notes</span>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lead.requirementDetails || 'No additional requirement specifications added yet. You can log them using the "Log Activity" button on the left.'}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 3: QUOTATIONS (PDF Section 7 & 14) */}
          {activeTab === 'quotations' && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">Quotation Management</h3>
              </div>

              {/* Add Quotation Form */}
              <form onSubmit={handleAddQuotation} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase">Create & Send New Quotation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Quote # (e.g. QT-102)"
                    value={quoteNumber}
                    onChange={e => setQuoteNumber(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Quotation Document Link"
                    value={quoteFileUrl}
                    onChange={e => setQuoteFileUrl(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
                <PrimaryButton type="submit" className="w-full justify-center">Record Quotation</PrimaryButton>
              </form>

              {/* Quotations List */}
              <div className="space-y-3">
                {(!lead.quotations || lead.quotations.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-6">No quotations generated yet.</p>
                ) : (
                  lead.quotations.map((q, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{q.quotationNumber}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {q.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Sent on {new Date(q.sentDate || q.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">₹{q.amount?.toLocaleString()}</p>
                        {q.fileUrl && (
                          <a href={q.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                            View PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* TAB 4: DOCUMENTS / KYC (PDF Section 11 & 14) */}
          {activeTab === 'documents' && (
            <Card className="p-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">Required Documents & Verification</h3>

              <form onSubmit={handleAddDocument} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase">Upload / Record Document</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Document Title (e.g. KYC Pan Card)"
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="KYC">KYC</option>
                    <option value="Agreement">Agreement / Contract</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Requirement">Requirement Spec</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="File URL or path"
                    value={docFileUrl}
                    onChange={e => setDocFileUrl(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
                <PrimaryButton type="submit" className="w-full justify-center">Attach Document</PrimaryButton>
              </form>

              <div className="space-y-3">
                {(!lead.documents || lead.documents.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-6">No documents attached yet.</p>
                ) : (
                  lead.documents.map((d, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.title}</p>
                          <span className="text-xs text-gray-400">{d.documentType} • {new Date(d.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {d.fileUrl && (
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                          View
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* TAB 5: PAYMENTS & ADVANCE (PDF Section 12 & 14) */}
          {activeTab === 'payments' && (
            <Card className="p-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">Payment & Advance Records</h3>

              <form onSubmit={handleAddPayment} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase">Record Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <select
                    value={payType}
                    onChange={e => setPayType(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="Advance">Advance</option>
                    <option value="Part Payment">Part Payment</option>
                    <option value="Final Settlement">Final Settlement</option>
                  </select>
                  <select
                    value={payMode}
                    onChange={e => setPayMode(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tx ID / Ref"
                    value={payTxId}
                    onChange={e => setPayTxId(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
                <PrimaryButton type="submit" className="w-full justify-center">Record Payment</PrimaryButton>
              </form>

              <div className="space-y-3">
                {(!lead.payments || lead.payments.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet.</p>
                ) : (
                  lead.payments.map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">₹{p.amount?.toLocaleString()}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            {p.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{p.paymentMode} {p.transactionId ? `• Ref: ${p.transactionId}` : ''}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(p.paymentDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {callOpen && <CallPanel lead={lead} onClose={() => setCallOpen(false)} />}
    </div>
  );
}
