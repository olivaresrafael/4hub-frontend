import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { Button } from '../ui';
import { MusicalNoteIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <MusicalNoteIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SongWriter Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/explore"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Explorar
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/songs"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Mis Canciones
                </Link>
                <Link
                  to="/songs/new"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Nueva Canción
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden sm:inline font-medium">
                    {profile?.username || 'Usuario'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline ml-1">Salir</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
