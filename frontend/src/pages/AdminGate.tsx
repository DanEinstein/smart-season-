import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_unlocked', 'true');
      navigate('/admin');
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white">admin_panel_settings</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">Admin Access</h2>
          <p className="text-sm text-on-surface-variant mt-1">Enter the admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <p className="text-xs text-error font-semibold">{error}</p>}
          </div>
          <button className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity" type="submit">
            Enter Admin
          </button>
          <button type="button" className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => navigate('/agent')}>
            Back to Agent Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
