import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function CreateEditField() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    crop_type: 'Winter Wheat',
    planting_date: '',
    current_stage: 'planted',
    assigned_agent_id: ''
  });

  useEffect(() => {
    api.get('/users/agents').then(res => setAgents(res.data)).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/fields', { ...form, assigned_agent_id: form.assigned_agent_id || null });
    navigate('/fields');
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Sidebar active="Fields" />
      <main className="ml-72 min-h-screen">
        <TopBar title="Create Field" />
        <div className="p-12 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_-4px_rgba(25,28,27,0.06)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                Field Configuration
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Field Name</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-fixed transition-all placeholder:text-on-surface-variant/40"
                      placeholder="e.g. North Valley Sector 4"
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Crop Type</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary-fixed transition-all"
                        value={form.crop_type}
                        onChange={e => setForm({ ...form, crop_type: e.target.value })}
                      >
                        <option>Winter Wheat</option>
                        <option>Soybeans</option>
                        <option>Maize (Corn)</option>
                        <option>Sunflowers</option>
                        <option>Barley</option>
                        <option>Rice</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>

                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Planting Date</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-fixed transition-all"
                      type="date"
                      value={form.planting_date}
                      onChange={e => setForm({ ...form, planting_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Current Stage</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary-fixed transition-all"
                        value={form.current_stage}
                        onChange={e => setForm({ ...form, current_stage: e.target.value })}
                      >
                        <option value="planted">Planted</option>
                        <option value="growing">Growing</option>
                        <option value="ready">Ready</option>
                        <option value="harvested">Harvested</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">vital_signs</span>
                    </div>
                  </div>

                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Assign Agent</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary-fixed transition-all"
                        value={form.assigned_agent_id}
                        onChange={e => setForm({ ...form, assigned_agent_id: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">person_search</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                  <button
                    className="px-8 py-3 text-primary font-bold hover:bg-surface-container-high rounded-lg transition-all"
                    type="button"
                    onClick={() => navigate('/fields')}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all"
                    type="submit"
                  >
                    Save Field
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-8">
            <div className="bg-primary-fixed text-on-primary-fixed-variant rounded-xl p-6 relative overflow-hidden">
              <span className="material-symbols-outlined text-6xl absolute -right-4 -bottom-4 opacity-10 rotate-12">info</span>
              <h4 className="font-bold mb-2">SmartSeason Tip</h4>
              <p className="text-sm leading-relaxed opacity-90">Assigning an agent ensures accountability and timely field updates throughout the crop lifecycle.</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Stage Indicators</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-tight">Planted</span>
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-tight">Growing</span>
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-tight">Ready</span>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-tight">At Risk</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
