import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserCheck, TrendingUp, Clock, AlertTriangle, 
  Calendar, FileText, CheckCircle2, XCircle, ArrowUpRight, 
  Building2, Award, Zap, Bell, Shield, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/shared/Card';
import StatusBadge from '../components/shared/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { requestNotificationPermission } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

const STAGE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#14B8A6', '#64748B'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isSalesExec = currentUser?.role === 'Sales Executive';
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // FCM Status
  const [fcmStatus, setFcmStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) return Notification.permission;
    return 'default';
  });
  const [fcmTestSent, setFcmTestSent] = useState(false);

  useEffect(() => {
    api.get('/dashboard')
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error('Error fetching dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const triggerTestNotification = async () => {
    if (!('Notification' in window)) return alert('Notifications not supported');
    if (Notification.permission !== 'granted') {
      await requestNotificationPermission();
      setFcmStatus(Notification.permission);
    }
    if (Notification.permission === 'granted') {
      try {
        new Notification('🔥 Sales CRM Live Notification', {
          body: `Hello ${currentUser?.name || 'User'}! Follow-up reminder active.`,
          icon: '/logo.png'
        });
        setFcmTestSent(true);
        setTimeout(() => setFcmTestSent(false), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading analytics dashboard...
      </div>
    );
  }

  const { kpis, stageWiseCounts, todayFollowUps, recentTimelineActivities, executivePerformance, branchPerformance } = stats;

  // Primary KPIs defined in PDF Section 12
  const primaryKpis = [
    { label: 'Total Leads', value: kpis?.totalLeads ?? 0, icon: Users, color: 'bg-emerald-50 text-emerald-700', link: '/leads' },
    { label: 'New Leads', value: kpis?.newLeads ?? 0, icon: UserPlus, color: 'bg-slate-100 text-slate-700', link: '/leads?status=New Lead' },
    { label: 'Unassigned', value: kpis?.unassignedLeads ?? 0, icon: UserCheck, color: 'bg-amber-50 text-amber-700', link: '/assign' },
    { label: 'Overdue Follow-ups', value: kpis?.overdueFollowUps ?? 0, icon: AlertTriangle, color: 'bg-rose-50 text-rose-700', isAlert: true, link: '/followups' },
    { label: "Today's Follow-ups", value: kpis?.todayFollowUps ?? 0, icon: Clock, color: 'bg-emerald-100 text-emerald-800', link: '/followups' },
  ];

  // Pipeline Flow KPIs
  const pipelineKpis = [
    { label: 'Meetings / Demos', value: kpis?.meetingsScheduled ?? 0, icon: Calendar, color: 'text-emerald-700' },
    { label: 'Quotations Sent', value: kpis?.quotationsSent ?? 0, icon: FileText, color: 'text-emerald-600' },
    { label: 'Negotiations', value: kpis?.negotiations ?? 0, icon: TrendingUp, color: 'text-amber-700' },
    { label: 'Won Deals', value: kpis?.wonDeals ?? 0, icon: CheckCircle2, color: 'text-emerald-700' },
    { label: 'Lost / Dropped', value: kpis?.lostLeads ?? 0, icon: XCircle, color: 'text-slate-500' },
    { label: 'Conversion Rate', value: `${kpis?.conversionRate ?? 0}%`, icon: Award, color: 'text-emerald-700' },
  ];

  const stageChartData = (stageWiseCounts || []).map(s => ({
    name: s._id || 'Unspecified',
    count: s.count
  }));

  return (
    <div className="space-y-6">
      {/* ── FCM Live Banner for Admins ── */}
      

      {/* ── 1. PRIMARY METRICS BAR (PDF Section 12) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {primaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.label} 
              onClick={() => kpi.link && navigate(kpi.link)}
              className="p-5 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <p className={`text-2xl font-bold ${kpi.isAlert && kpi.value > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {/* ── 2. PIPELINE CONVERSION FLOW KPIs ── */}
      <Card className="p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pipeline Velocity & Conversion Flow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {pipelineKpis.map(pk => {
            const Icon = pk.icon;
            return (
              <div key={pk.label} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={pk.color} />
                  <span className="text-xs font-semibold text-gray-500 truncate">{pk.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{pk.value}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 3. CHARTS ROW: STAGE-WISE DISTRIBUTION & EXECUTIVE PERFORMANCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage-wise Lead Count (PDF Section 12) */}
        <Card className="p-5 lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-800 mb-1">Stage-wise Lead Breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">Volume across all active workflow stages</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {stageChartData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No leads found</p>
            ) : (
              stageChartData.map((stg, i) => (
                <div key={stg.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                  <span className="font-medium text-gray-700 truncate">{stg.name}</span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900">{stg.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Executive-wise Performance (PDF Section 12) */}
        {!isSalesExec && (
          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Executive Performance & Conversion</h3>
            <p className="text-xs text-gray-400 mb-4">Total assigned vs deals won per sales executive</p>
            {(!executivePerformance || executivePerformance.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-12">No executive performance data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={executivePerformance} barGap={6}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                  <Bar dataKey="assigned" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Assigned Leads" />
                  <Bar dataKey="won" fill="#16a34a" radius={[6, 6, 0, 0]} name="Won Deals" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}
      </div>

      {/* ── 4. BRANCH PERFORMANCE & TODAY'S FOLLOW-UPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Branch-wise Performance (PDF Section 12) */}
        {isAdmin && (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-700" /> Branch-wise Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">Leads and closures across company branches</p>
            {(!branchPerformance || branchPerformance.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-8">No branches registered yet</p>
            ) : (
              <div className="space-y-3">
                {branchPerformance.map(bp => (
                  <div key={bp.branch} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{bp.branch}</p>
                      <span className="text-xs text-gray-400">Code: {bp.code}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-700">{bp.totalLeads} Total Leads</p>
                      <span className="text-xs font-bold text-emerald-600">{bp.wonDeals} Won</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Today's Follow-ups List */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" /> Today's Scheduled Follow-ups
              </h3>
              <p className="text-xs text-gray-400">Tasks requiring immediate call / action today</p>
            </div>
            <button onClick={() => navigate('/followups')} className="text-xs text-emerald-700 font-semibold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {(!todayFollowUps || todayFollowUps.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-8">No follow-ups due today 🎉</p>
            ) : (
              todayFollowUps.map(fu => (
                <div key={fu._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between gap-3 border border-gray-100 hover:border-gray-200 transition-all">
                  <div>
                    <p className="font-semibold text-xs text-gray-800">{fu.lead}</p>
                    <p className="text-[11px] text-gray-400">{fu.time} • Assigned to: {fu.assignedTo}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fu.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {fu.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
