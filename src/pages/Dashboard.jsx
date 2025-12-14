import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dogService } from '../services/dogService';
import { trainingService } from '../services/trainingService';
import { sessionService } from '../services/sessionService';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    dogs: 0,
    trainings: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dogs, trainings, sessions] = await Promise.all([
          dogService.getDogs(),
          trainingService.getTrainings(),
          sessionService.getSessions(),
        ]);
        setStats({
          dogs: dogs.length,
          trainings: trainings.length,
          sessions: sessions.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Vizualizează statisticile și progresul tău</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          to="/dogs"
          className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary group touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Câini</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {stats.dogs}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/trainings"
          className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary group touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Antrenamente</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {stats.trainings}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/sessions"
          className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary group touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Sesiuni</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {stats.sessions}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-primary/10 via-white to-primary-dark/10 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-primary/20">
        <h2 className="text-xl sm:text-2xl font-bold text-text-dark mb-3">Bine ai venit!</h2>
        <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
          Folosește Mondio pentru a gestiona antrenamentele câinilor tăi. Poți adăuga câini,
          crea antrenamente personalizate și înregistra sesiuni de antrenament cu video.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Link
            to="/dogs"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg active:opacity-90 transition-all transform hover:scale-105 font-medium text-center touch-manipulation min-h-[44px] flex items-center justify-center text-sm sm:text-base"
          >
            Adaugă câine
          </Link>
          <Link
            to="/trainings"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-accent to-orange-500 text-white rounded-xl hover:shadow-lg active:opacity-90 transition-all transform hover:scale-105 font-medium text-center touch-manipulation min-h-[44px] flex items-center justify-center text-sm sm:text-base"
          >
            Creează antrenament
          </Link>
          <Link
            to="/sessions"
            className="w-full sm:w-auto px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white active:opacity-90 transition-all font-medium text-center touch-manipulation min-h-[44px] flex items-center justify-center text-sm sm:text-base"
          >
            Vezi sesiuni
          </Link>
        </div>
      </div>
    </div>
  );
};
