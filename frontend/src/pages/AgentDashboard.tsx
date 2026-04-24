import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const stageColor: Record<string, string> = {
  planted: 'bg-blue-100 text-blue-800',
  growing: 'bg-teal-100 text-teal-800',
  ready: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  harvested: 'bg-surface-container-high text-on-surface-variant',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  'at-risk': 'bg-amber-100 text-amber-800',
  completed: 'bg-surface-container-high text-on-surface-variant',
};

export default function AgentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/agent').then(res => setStats(res.data)).catch(console.error);
    api.get('/fields').then(res => setFields(Array.isArray(res.data) ? res.data : [])).catch(console.error);
  }, []);

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar active="Dashboard" />
      <main className="flex-1 ml-72">
        <TopBar title="My Dashboard" />
        <div className="p-8 max-w-5xl mx-auto space-y-8">

          {/* Stats */}
          <section className="grid grid-cols-3 gap-4">
            {[
              { label: 'Assigned Fields', value: stats?.total_fields || 0, icon: 'agriculture' },
              { label: 'At Risk', value: stats?.by_status?.['at-risk'] || 0, icon: 'warning' },
              { label: 'Completed', value: stats?.by_status?.completed || 0, icon: 'task_alt' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-symbols-outlined text-primary">{icon}</span>
                </div>
                <p className="text-sm font-semibold text-on-surface-variant mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-primary">{value}</p>
              </div>
            ))}
          </section>

          {/* Assigned Fields */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Assigned Fields</h3>
            {fields.length === 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">agriculture</span>
                <p className="text-on-surface-variant">No fields assigned to you yet.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map(field => (
                <div
                  key={field.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/fields/${field.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-primary">{field.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor[field.status] || ''}`}>
                      {field.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-3">{field.crop_type}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${stageColor[field.current_stage] || ''}`}>
                      {field.current_stage}
                    </span>
                    <button
                      className="text-xs font-bold text-primary hover:underline"
                      onClick={e => { e.stopPropagation(); navigate(`/fields/${field.id}/edit`); }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          {stats?.recent_updates?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <h4 className="text-base font-bold text-primary mb-4">Recent Updates</h4>
              <div className="space-y-3">
                {stats.recent_updates.map((u: any) => (
                  <div key={u.id} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-semibold text-primary">{u.field_name}</span>
                      <span className="text-on-surface-variant ml-2">→ {u.stage}</span>
                      {u.notes && <p className="text-xs text-on-surface-variant italic mt-0.5">"{u.notes}"</p>}
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap ml-4">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
