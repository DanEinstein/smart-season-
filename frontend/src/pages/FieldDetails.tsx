import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';

export default function FieldDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/fields/${id}`).then(res => setField(res.data)).catch(console.error);
    api.get(`/fields/${id}/updates`).then(res => setUpdates(res.data)).catch(console.error);
  }, [id]);

  if (!field) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar active="Fields" />

      <main className="ml-72 pt-8 pb-12 px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" to="/fields">Fields</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-bold text-on-surface">{field.name}</span>
          </div>
          <button
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => navigate(`/fields/${id}/edit`)}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Update Field
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_-4px_rgba(25,28,27,0.06)]">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">{field.current_stage}</span>
              <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${field.status === 'at-risk' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>{field.status}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tighter mb-2">{field.name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-outline-variant/20 pt-8 mt-4">
              <div>
                <p className="text-xs text-outline font-bold tracking-widest uppercase mb-1">Crop Type</p>
                <p className="text-xl font-bold text-primary">{field.crop_type}</p>
              </div>
              <div>
                <p className="text-xs text-outline font-bold tracking-widest uppercase mb-1">Planting Date</p>
                <p className="text-xl font-bold text-primary">{new Date(field.planting_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-outline font-bold tracking-widest uppercase mb-1">Last Updated</p>
                <p className="text-xl font-bold text-primary">{new Date(field.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-outline font-bold tracking-widest uppercase mb-4">Assigned Agent</p>
            <h3 className="text-xl font-bold text-primary">{field.assigned_agent?.name || 'Unassigned'}</h3>
            <p className="text-on-surface-variant text-sm">{field.assigned_agent?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Update History</h2>
          <div className="space-y-0 relative">
            <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-outline-variant/30"></div>
            {updates.length === 0 && <p className="pl-16 text-on-surface-variant">No updates yet.</p>}
            {updates.map((u, i) => (
              <div key={i} className="relative pl-16 pb-12 group">
                <div className="absolute left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-container ring-4 ring-primary-fixed z-10"></div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">Stage: {u.stage}</span>
                    <span className="text-sm text-on-surface-variant">{new Date(u.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-on-surface leading-relaxed">{u.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
