import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/shared/Card';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const FUNNEL_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export default function Reports() {
  const { leads } = useData();
  const { teamMembers } = useAuth();

  const teamPerformance = teamMembers.map(m => ({
    name: m.name.split(' ')[0],
    leads: m.leadsCount ?? leads.filter(l => l.assignedTo === m.name).length,
    converted: m.convertedCount ?? leads.filter(l => l.assignedTo === m.name && l.status === 'Won').length,
  }));

  const conversionFunnel = [
    { stage: 'Total Leads', count: leads.length },
    { stage: 'Contacted', count: leads.filter(l => l.assignedTo).length },
    { stage: 'Interested', count: leads.filter(l => l.status === 'Interested').length },
    { stage: 'Negotiation', count: Math.round(leads.filter(l => l.status === 'Interested').length * 0.5) },
    { stage: 'Won', count: leads.filter(l => l.status === 'Won').length },
  ];

  const avgConversion = teamPerformance.length > 0
    ? Math.round(teamPerformance.reduce((s, m) => s + (m.leads > 0 ? (m.converted / m.leads) * 100 : 0), 0) / teamPerformance.length)
    : 0;

  const bestPerformer = [...teamPerformance].sort((a, b) => b.converted - a.converted)[0];
  const totalLeads = leads.length;

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Leads', value: totalLeads, icon: DollarSign, sub: 'All time' },
          { label: 'Avg Conversion Rate', value: `${avgConversion}%`, icon: Target, sub: 'Across all executives' },
          { label: 'Best Performer', value: bestPerformer?.name || '—', icon: TrendingUp, sub: `${bestPerformer?.converted || 0} conversions` },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xs text-blue-500 mt-0.5">{sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Performance Chart */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Team-wise Performance</h3>
        <p className="text-xs text-gray-400 mb-4">Leads assigned vs converted</p>
        {teamPerformance.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No team members yet. Add members from Team page.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamPerformance} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Bar dataKey="leads" fill="#DBEAFE" radius={[6, 6, 0, 0]} name="Leads" />
              <Bar dataKey="converted" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Conversion Funnel</h3>
        <p className="text-xs text-gray-400 mb-6">Lead journey from entry to close</p>
        {leads.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
            No leads yet. Add leads to see funnel data.
          </div>
        ) : (
          <div className="space-y-3">
            {conversionFunnel.map((stage, i) => {
              const total = conversionFunnel[0].count || 1;
              const pct = Math.round((stage.count / total) * 100);
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-gray-600 text-right flex-shrink-0">{stage.stage}</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-xl overflow-hidden">
                    <div className="h-full rounded-xl flex items-center px-3 transition-all"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: FUNNEL_COLORS[i] }}>
                      <span className="text-xs font-semibold text-white">{stage.count}</span>
                    </div>
                  </div>
                  <div className="w-12 text-xs text-gray-400 flex-shrink-0">{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Executive Performance Table */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Executive Performance Table</h3>
        {teamPerformance.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No team members added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Executive', 'Team', 'Leads', 'Converted', 'Conversion Rate', 'Performance'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teamMembers.map(m => {
                  const mLeads = m.leadsCount ?? leads.filter(l => l.assignedTo === m.name).length;
                  const mConverted = m.convertedCount ?? leads.filter(l => l.assignedTo === m.name && l.status === 'Won').length;
                  const rate = mLeads > 0 ? Math.round((mConverted / mLeads) * 100) : 0;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{m.avatar}</div>
                          <span className="font-medium text-gray-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{m.team}</td>
                      <td className="px-3 py-3 text-gray-700">{mLeads}</td>
                      <td className="px-3 py-3 text-blue-600 font-medium">{mConverted}</td>
                      <td className="px-3 py-3 text-gray-700">{rate}%</td>
                      <td className="px-3 py-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
