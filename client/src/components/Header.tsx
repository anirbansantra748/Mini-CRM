import { Link, useLocation } from 'react-router-dom';
import { useLogout, useMe } from '../api/hooks';

export default function Header() {
  const me = useMe();
  const logout = useLogout();
  const { pathname } = useLocation();
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold">Mini CRM</span>
          {me?.role === 'ADMIN' && (
            <nav className="flex gap-3 text-sm">
              <Link className={pathname === '/' ? 'font-semibold' : ''} to="/">Projects</Link>
              <Link className={pathname === '/audit' ? 'font-semibold' : ''} to="/audit">Audit</Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">{me?.email} • {me?.role}</span>
          <button onClick={logout} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Logout</button>
        </div>
      </div>
    </header>
  );
}
