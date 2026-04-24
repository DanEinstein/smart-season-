import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function FieldManagement() {
  const [fields, setFields] = useState<any[]>([]);
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem('admin_unlocked') === 'true';

  useEffect(() => {
    api.get('/fields').then(res => setFields(Array.isArray(res.data) ? res.data : [])).catch(console.error);
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Delete this field? This cannot be undone.')) return;
    await api.delete(`/fields/${id}`);
    setFields(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">


      <Sidebar active="Fields" />

      <main className="md:ml-72 pt-24 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col gap-8 mb-10">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
                  {isAdmin ? 'Admin Field Registry' : 'Assigned Fields'}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {isAdmin ? 'Manage and monitor all agricultural sectors.' : 'View and monitor your assigned fields.'}
                </p>
              </div>
              {isAdmin && (
                <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-container transition-colors shadow-lg active:scale-95" onClick={() => navigate('/fields/create')}>
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Field
                </button>
              )}
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input className="w-full bg-surface-container-lowest border-none rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline/60" placeholder="Search field name, agent or crop type..." type="text" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-outline px-2">Filter By:</span>
                <select className="bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-sm font-semibold text-on-surface-variant min-w-[140px] focus:ring-2 focus:ring-primary/20">
                  <option>All Stages</option>
                  <option>Planted</option>
                  <option>Growing</option>
                  <option>Ready</option>
                </select>
                <select className="bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-sm font-semibold text-on-surface-variant min-w-[140px] focus:ring-2 focus:ring-primary/20">
                  <option>All Status</option>
                  <option>Healthy</option>
                  <option>At Risk</option>
                  <option>Dormant</option>
                </select>
              </div>
              <button className="bg-surface-container-high text-primary px-4 py-3 rounded-lg font-bold hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-xl align-middle">tune</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,27,0.04)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-none">
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Field Name</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Crop Type</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Planting Date</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Stage</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Assigned Agent</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest">Last Updated</th>
                  <th className="px-6 py-5 text-xs font-extrabold uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {fields.map(field => (
                  <tr key={field.id} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer" onClick={() => navigate(`/fields/${field.id}`)}>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary group-hover:text-secondary transition-colors">{field.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-medium">{field.crop_type}</td>
                    <td className="px-6 py-6 text-sm text-on-surface-variant">{new Date(field.planting_date).toLocaleDateString()}</td>
                    <td className="px-6 py-6">
                      <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{field.current_stage}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${field.status === 'at-risk' ? 'bg-error' : 'bg-secondary'}`}></div>
                        <span className={`text-sm font-semibold ${field.status === 'at-risk' ? 'text-error' : 'text-secondary'}`}>{field.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.assigned_agent?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-on-surface-variant">{new Date(field.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/fields/${field.id}`); }}>
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        {isAdmin && (
                          <>
                            <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/fields/${field.id}/edit`); }}>
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-error" onClick={(e) => handleDelete(e, field.id)}>
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-5 bg-surface-container-low/30 border-t border-surface-variant/30 flex items-center justify-between">
              <p className="text-sm font-medium text-on-surface-variant">Showing <span className="text-primary font-bold">{fields.length}</span> fields</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
