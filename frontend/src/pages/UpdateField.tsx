import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';

export default function UpdateField() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [form, setForm] = useState({ stage: 'growing', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/fields/${id}`).then(res => {
      setField(res.data);
      setForm(f => ({ ...f, stage: res.data.current_stage }));
    }).catch(console.error);
    api.get(`/fields/${id}/updates`).then(res => setUpdates(Array.isArray(res.data) ? res.data : [])).catch(console.error);
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/fields/${id}/updates`, form);
      navigate(`/fields/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit update.');
    }
  }

  return (
    <div className="bg-surface text-on-surface">
      <Sidebar active="Fields" />

      <main className="md:ml-72 min-h-screen">
        <header className="bg-[#f8faf8]/80 backdrop-blur-md text-emerald-900 shadow-[0_4px_24px_-4px_rgba(25,28,27,0.06)] flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined cursor-pointer hover:bg-surface-container rounded-full p-2 transition-all" onClick={() => navigate(`/fields/${id}`)}>arrow_back</button>
            <span className="text-xl font-extrabold tracking-tighter text-[#012d1d]">Field Detail: {field?.name || '...'}</span>
          </div>
        </header>

        <div className="p-8 space-y-12 max-w-7xl mx-auto">
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-primary mb-2">Agent Update Submission</h2>
                <p className="text-on-surface-variant">Daily field status and qualitative observations.</p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Current Stage</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface font-semibold focus:ring-2 focus:ring-primary-fixed-dim appearance-none"
                      value={form.stage}
                      onChange={e => setForm({ ...form, stage: e.target.value })}
                    >
                      <option value="planted">Planted</option>
                      <option value="growing">Growing</option>
                      <option value="ready">Ready for Harvest</option>
                      <option value="harvested">Harvested</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Field Notes & Observations</label>
                  <textarea
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-5 text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary-fixed-dim resize-none"
                    placeholder="Describe plant vigor, pest activity, or equipment needs..."
                    rows={6}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                  ></textarea>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  {error && <p className="text-xs text-error font-semibold flex-1">{error}</p>}
                  <button className="flex-1 md:flex-none md:px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all" type="submit">
                    Submit Update
                  </button>
                  <button className="px-6 py-4 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-all" type="button" onClick={() => navigate(`/fields/${id}`)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="space-y-8 pb-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary">Update History</h2>
            <div className="relative space-y-8">
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-outline-variant/30"></div>
              {updates.map((u, i) => (
                <div key={i} className="relative flex gap-8 group">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center z-10 shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  </div>
                  <div className="bg-surface-container-lowest p-6 rounded-xl flex-grow border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">Stage: {u.stage}</span>
                      <span className="text-xs text-on-surface-variant">{new Date(u.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-on-surface leading-relaxed">{u.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
