import { useEffect, useState } from 'react';
import { trainingService } from '../services/trainingService';

export const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const data = await trainingService.getTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (training) => {
    setEditingTraining(training);
    setFormData({ name: training.name });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest antrenament?')) {
      return;
    }
    try {
      await trainingService.deleteTraining(id);
      loadTrainings();
    } catch (error) {
      console.error('Error deleting training:', error);
      // Check if it's a 400 error (training is used in sessions)
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Acest antrenament este folosit în sesiuni și nu poate fi șters';
        alert(`Eroare: ${errorMessage}`);
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Eroare la ștergerea antrenamentului';
        alert(`Eroare: ${errorMessage}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTraining) {
        await trainingService.updateTraining(editingTraining.id, formData);
      } else {
        await trainingService.createTraining(formData);
      }
      setShowModal(false);
      setEditingTraining(null);
      setFormData({ name: '' });
      loadTrainings();
    } catch (error) {
      console.error('Error saving training:', error);
      alert(editingTraining ? 'Eroare la actualizarea antrenamentului' : 'Eroare la crearea antrenamentului');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTraining(null);
    setFormData({ name: '' });
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Antrenamente</h1>
          <p className="text-sm sm:text-base text-gray-600">Creează și gestionează antrenamentele personalizate</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg active:opacity-90 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 touch-manipulation min-h-[44px] text-base sm:text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Creează antrenament
        </button>
      </div>

      {/* Trainings Grid */}
      {trainings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4 text-lg">Nu ai creat încă niciun antrenament.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark active:opacity-90 transition-colors font-medium touch-manipulation min-h-[44px] text-base sm:text-sm"
          >
            Creează primul antrenament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Training Card */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-text-dark">{training.name}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(training)}
                      className="min-w-[44px] min-h-[44px] p-2 bg-gray-100 hover:bg-primary hover:text-white active:bg-primary/80 rounded-lg transition-colors touch-manipulation flex items-center justify-center"
                      title="Editează"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(training.id)}
                      className="min-w-[44px] min-h-[44px] p-2 bg-gray-100 hover:bg-red-500 hover:text-white active:bg-red-600 rounded-lg transition-colors touch-manipulation flex items-center justify-center"
                      title="Șterge"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  💡 Video-urile pot fi încărcate doar din sesiuni, pentru fiecare antrenament individual
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full m-2 sm:m-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-text-dark">
                {editingTraining ? 'Editează antrenament' : 'Creează antrenament nou'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume antrenament *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="ex: Sărituri, Așezare, etc."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg active:opacity-90 transition-all font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                >
                  {editingTraining ? 'Salvează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
