import { useEffect, useState } from 'react';
import { dogService } from '../services/dogService';
import { uploadService } from '../services/uploadService';
import { userService } from '../services/userService';
import { ImageUpload } from '../components/ImageUpload';
import { CustomSelect } from '../components/CustomSelect';

export const Dogs = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    level: 'MR1',
  });

  useEffect(() => {
    loadUser();
    loadDogs();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadDogs = async () => {
    try {
      const data = await dogService.getDogs();
      setDogs(data);
    } catch (error) {
      console.error('Error loading dogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEditDog = (dog) => {
    // Only can edit own dogs (userId must match current user)
    return dog.userId === (user?.id || -1);
  };

  const handleEdit = (dog) => {
    // Check permissions before allowing edit
    if (!canEditDog(dog)) {
      alert('Nu poți edita câinii clienților. Poți doar să îi vizualizezi.');
      return;
    }
    
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed || '',
      age: dog.age || '',
      level: dog.level,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Find the dog to check permissions
    const dog = dogs.find(d => d.id === id);
    if (!dog) {
      alert('Câinele nu a fost găsit.');
      return;
    }

    // Check permissions before allowing delete
    if (!canEditDog(dog)) {
      alert('Nu poți șterge câinii clienților.');
      return;
    }

    if (!window.confirm('Ești sigur că vrei să ștergi acest câine?')) {
      return;
    }
    try {
      await dogService.deleteDog(id);
      loadDogs();
    } catch (error) {
      console.error('Error deleting dog:', error);
      alert('Eroare la ștergerea câinelui');
    }
  };

  const handlePhotoUpload = async (file, dogId) => {
    // Find the dog to check permissions
    const dog = dogs.find(d => d.id === dogId);
    if (!dog) {
      alert('Câinele nu a fost găsit.');
      throw new Error('Dog not found');
    }

    // Check permissions before allowing photo upload
    if (!canEditDog(dog)) {
      alert('Nu poți încărca fotografii pentru câinii clienților.');
      throw new Error('Permission denied');
    }

    try {
      const result = await uploadService.uploadDogPhoto(dogId, file);
      loadDogs(); // Reload to get updated photo
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If editing, check permissions
    if (editingDog && !canEditDog(editingDog)) {
      alert('Nu poți edita câinii clienților.');
      setShowModal(false);
      setEditingDog(null);
      setFormData({ name: '', breed: '', age: '', level: 'MR1' });
      return;
    }

    try {
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };
      
      console.log('Submitting dog form:', { editingDog, data });
      
      if (editingDog) {
        await dogService.updateDog(editingDog.id, data);
      } else {
        await dogService.createDog(data);
      }
      
      console.log('Dog saved successfully, closing modal and reloading...');
      setShowModal(false);
      setEditingDog(null);
      setFormData({ name: '', breed: '', age: '', level: 'MR1' });
      await loadDogs();
      console.log('Dogs reloaded');
    } catch (error) {
      console.error('Error saving dog:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || (editingDog ? 'Eroare la actualizarea câinelui' : 'Eroare la adăugarea câinelui');
      alert(`Eroare: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDog(null);
    setFormData({ name: '', breed: '', age: '', level: 'MR1' });
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Câinii mei</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestionează câinii tăi și progresul lor</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg active:opacity-90 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 touch-manipulation min-h-[44px] text-base sm:text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adaugă câine
        </button>
      </div>

      {/* Dogs Grid */}
      {dogs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4 text-lg">Nu ai adăugat încă niciun câine.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark transition-colors font-medium"
          >
            Adaugă primul câine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => {
            // Check if this dog belongs to the current user (not a client's dog)
            // A dog belongs to the user if userId matches
            const isOwnDog = user?.id && dog.userId === user.id;
            // Check if user is trainer and this is a client's dog
            // A client's dog has trainerId matching user.id but userId different
            const isClientDog = user?.isTrainer && dog.trainerId === user.id && dog.userId !== user.id;
            // Only can edit own dogs (userId must match)
            const canEdit = isOwnDog;
            
            // Debug logging (can be removed later)
            if (user?.isTrainer) {
              console.log('Dog:', dog.name, 'userId:', dog.userId, 'trainerId:', dog.trainerId, 'user.id:', user.id, 'canEdit:', canEdit);
            }
            
            return (
              <div
                key={dog.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {/* Dog Photo */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20">
                  {dog.photoUrl ? (
                    <img
                      src={dog.photoUrl}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(dog);
                        }}
                        className="min-w-[44px] min-h-[44px] p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white active:bg-white/80 transition-colors shadow-md touch-manipulation flex items-center justify-center"
                        title="Editează"
                      >
                        <svg className="w-5 h-5 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(dog.id);
                        }}
                        className="min-w-[44px] min-h-[44px] p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white active:bg-white/80 transition-colors shadow-md touch-manipulation flex items-center justify-center"
                        title="Șterge"
                      >
                        <svg className="w-5 h-5 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Dog Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-text-dark">{dog.name}</h3>
                    {isClientDog && dog.user && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {dog.user.email || 'Proprietar'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    {dog.breed && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{dog.breed}</span>
                      </div>
                    )}
                    {dog.age && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{dog.age} ani</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {dog.level}
                      </span>
                    </div>
                  </div>

                  {/* Photo Upload - only for own dogs */}
                  {canEdit && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ImageUpload
                        onUpload={(file) => handlePhotoUpload(file, dog.id)}
                        currentImage={dog.photoUrl}
                        label=""
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-2 sm:m-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-text-dark">
                {editingDog ? 'Editează câine' : 'Adaugă câine nou'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rasă
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vârstă
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel *
                </label>
                <CustomSelect
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Selectează nivel"
                  options={[
                    { value: 'MR1', label: 'MR1' },
                    { value: 'MR2', label: 'MR2' },
                    { value: 'MR3', label: 'MR3' },
                    { value: 'MR4', label: 'MR4' },
                    { value: 'MR5', label: 'MR5' }
                  ]}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg active:opacity-90 transition-all font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                >
                  {editingDog ? 'Salvează' : 'Adaugă'}
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
