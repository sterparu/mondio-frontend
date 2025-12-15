import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/uploadService';
import { trainerService } from '../services/trainerService';
import { ImageUpload } from './ImageUpload';

export const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerForm, setTrainerForm] = useState({ name: '', bio: '' });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userService.getUser();
      setUser(userData);
    } catch (error) {
      // Ignore 404 errors for /user endpoint if backend doesn't have it implemented
      if (error.response?.status === 404) {
        console.warn('User endpoint not available, using default user info');
        // Set default user info from token or localStorage if needed
        const token = localStorage.getItem('token');
        if (token) {
          // Try to decode token or use email from localStorage if available
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ email: payload.email || 'User' });
          } catch (e) {
            // If token can't be decoded, just set a default
            setUser({ email: 'User' });
          }
        }
      } else {
        console.error('Error loading user:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoUpload = async (file) => {
    try {
      const result = await uploadService.uploadUserPhoto(file);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">M</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Mondio
                </h1>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dogs"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dogs')
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Câini
                </Link>
                <Link
                  to="/trainings"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/trainings')
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Antrenamente
                </Link>
                <Link
                  to="/sessions"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/sessions')
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sesiuni
                </Link>
              </div>
            </div>

            {/* Desktop Profile Menu */}
            <div className="hidden md:flex md:items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none touch-manipulation min-h-[44px]"
                >
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 break-words">{user?.email}</p>
                      {user?.isTrainer && (
                        <p className="text-xs text-green-600 mt-1">✓ Trainer</p>
                      )}
                    </div>
                    {!user?.isTrainer && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowTrainerModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors touch-manipulation min-h-[44px] flex items-center"
                      >
                        Devino Trainer
                      </button>
                    )}
                    <div className="px-2 py-2">
                      <ImageUpload
                        onUpload={handlePhotoUpload}
                        currentImage={user?.photoUrl}
                        label=""
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation min-h-[44px] flex items-center"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Profile Button */}
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              >
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-primary object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="min-w-[44px] min-h-[44px] p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none touch-manipulation flex items-center justify-center"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/dogs"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dogs')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Câini
              </Link>
              <Link
                to="/trainings"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/trainings')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Antrenamente
              </Link>
              <Link
                to="/sessions"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/sessions')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sesiuni
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <ImageUpload
                    onUpload={handlePhotoUpload}
                    currentImage={user?.photoUrl}
                    label="Poza de profil"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation min-h-[44px] flex items-center"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>

      {/* Trainer Modal */}
      {showTrainerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full m-2 sm:m-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-text-dark">Devino Trainer</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume (opțional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  placeholder="Numele tău de trainer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (opțional)
                </label>
                <textarea
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                  rows="3"
                  value={trainerForm.bio}
                  onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
                  placeholder="Despre tine ca trainer..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await trainerService.createTrainerProfile(trainerForm.name, trainerForm.bio);
                      await loadUser();
                      setShowTrainerModal(false);
                      setTrainerForm({ name: '', bio: '' });
                      alert('Felicitări! Ești acum trainer!');
                    } catch (error) {
                      console.error('Error creating trainer profile:', error);
                      alert(error.response?.data?.error || 'Eroare la crearea profilului de trainer');
                    }
                  }}
                  className="flex-1 px-4 py-3 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg active:opacity-90 transition-all font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                >
                  Devino Trainer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTrainerModal(false);
                    setTrainerForm({ name: '', bio: '' });
                  }}
                  className="flex-1 px-4 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
