import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';

const agentLinks = [
  { to: '/agent', icon: 'dashboard', label: 'Dashboard' },
  { to: '/fields', icon: 'agriculture', label: 'Fields' },
  { to: '/admin-gate', icon: 'admin_panel_settings', label: 'Admin Access' },
];

const adminLinks = [
  { to: '/admin', icon: 'dashboard', label: 'Overview' },
  { to: '/fields', icon: 'agriculture', label: 'Fields' },
  { to: '/agent', icon: 'person', label: 'Agent View' },
];

export default function Sidebar({ active }: { active: string }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminSection = location.pathname === '/admin' || sessionStorage.getItem('admin_unlocked') === 'true';
  const links = isAdminSection ? adminLinks : agentLinks;

  return (
    <aside className="h-screen w-72 flex flex-col fixed left-0 top-0 bg-[#f2f4f2] z-50">
      <div className="flex flex-col h-full py-8">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: '"FILL" 1' }}>agriculture</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#012d1d]">SmartSeason</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#012d1d]/60 font-bold">
                {isAdminSection ? 'Admin Panel' : 'Field Agent'}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-1">
            {links.map(({ to, icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm transition-colors ${
                    active === label
                      ? 'bg-[#1b4332] text-[#c1ecd4] border-l-4 border-[#c1ecd4]'
                      : 'text-[#012d1d]/70 hover:bg-[#e6e9e7]'
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {active === 'Fields' && isAdminSection && (
            <div className="px-6 mt-8">
              <button
                onClick={() => navigate('/fields/create')}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Field
              </button>
            </div>
          )}
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 pt-6">
          <div className="px-6 py-3 text-sm font-semibold text-[#012d1d]/70">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</div>
          <button
            onClick={() => { sessionStorage.removeItem('admin_unlocked'); signOut(() => navigate('/login')); }}
            className="text-[#012d1d]/70 flex items-center gap-3 px-6 py-3 hover:bg-[#e6e9e7] transition-colors w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
