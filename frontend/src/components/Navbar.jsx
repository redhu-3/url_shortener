import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="text-white font-bold text-lg tracking-tight">
          ⚡ <span className="text-violet-400">snip</span>.ly
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm hidden sm:block">Hey, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}