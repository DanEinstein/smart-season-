import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/admin').then(res => setStats(res.data)).catch(console.error);
  }, []);


  return (
    <div className="bg-surface text-on-surface antialiased flex min-h-screen">
      <Sidebar active="Overview" />
      <main className="ml-72 flex-grow min-h-screen">
        <TopBar title="Admin Overview" />
        <div className="p-8 max-w-5xl mx-auto space-y-8">

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Fields', value: stats?.total_fields || 0, icon: 'analytics', color: 'text-primary' },
              { label: 'Active', value: stats?.by_status?.active || 0, icon: 'check_circle', color: 'text-secondary' },
              { label: 'At Risk', value: stats?.by_status?.['at-risk'] || 0, icon: 'warning', color: 'text-amber-600' },
              { label: 'Completed', value: stats?.by_status?.completed || 0, icon: 'task_alt', color: 'text-outline' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm font-medium mb-2">{label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-extrabold text-primary">{value}</h3>
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Stage Breakdown */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h4 className="text-base font-bold text-primary mb-6">Stage Breakdown</h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Planted', value: stats?.by_stage?.planted || 0, color: 'bg-blue-500' },
                { label: 'Growing', value: stats?.by_stage?.growing || 0, color: 'bg-teal-500' },
                { label: 'Ready', value: stats?.by_stage?.ready || 0, color: 'bg-secondary' },
                { label: 'Harvested', value: stats?.by_stage?.harvested || 0, color: 'bg-outline' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-primary">{value}</div>
                  <div className={`h-1.5 rounded-full ${color} mt-2 mb-1`}></div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-base font-bold text-primary">Recent Activity</h4>
              <button className="text-sm font-bold text-primary hover:underline" onClick={() => navigate('/fields')}>View All Fields</button>
            </div>
            {stats?.recent_updates?.length === 0 && (
              <p className="text-on-surface-variant text-sm">No updates yet.</p>
            )}
            <div className="space-y-4">
              {stats?.recent_updates?.map((u: any) => (
                <div key={u.id} className="flex items-start justify-between p-4 rounded-xl bg-surface hover:bg-surface-container-low transition-all cursor-pointer" onClick={() => navigate(`/fields/${u.field_id}`)}>
                  <div>
                    <p className="font-semibold text-primary text-sm">{u.field_name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Stage: {u.stage} • by {u.agent_name}</p>
                    {u.notes && <p className="text-xs text-on-surface-variant mt-1 italic">"{u.notes}"</p>}
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap ml-4">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
