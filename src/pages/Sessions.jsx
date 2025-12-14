import { useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService';
import { dogService } from '../services/dogService';
import { trainingService } from '../services/trainingService';
import { uploadService } from '../services/uploadService';
import { trainerService } from '../services/trainerService';
import { userService } from '../services/userService';
import { CustomSelect } from '../components/CustomSelect';

export const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [user, setUser] = useState(null);
  const [editingTrainerNote, setEditingTrainerNote] = useState({ entryId: null, note: '' });
  const [visibleVideos, setVisibleVideos] = useState(new Set()); // Track which videos are visible
  const [formData, setFormData] = useState({
    dogId: '',
    date: new Date().toISOString().split('T')[0],
    level: 'MR1',
    notes: '',
    videoFile: null,
    existingVideoUrl: null,
    entries: [{ trainingId: '', score: '', notes: '', videoFile: null }],
  });

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    try {
      const [sessionsData, dogsData, trainingsData] = await Promise.all([
        sessionService.getSessions(),
        dogService.getDogs(),
        trainingService.getTrainings(),
      ]);
      setSessions(sessionsData);
      setDogs(dogsData);
      setTrainings(trainingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  const toggleSession = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const handleAddEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { trainingId: '', score: '', notes: '', videoFile: null }],
    });
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...formData.entries];
    newEntries[index][field] = value;
    setFormData({ ...formData, entries: newEntries });
  };

  const handleEntryVideoFileChange = (index, file) => {
    const newEntries = [...formData.entries];
    newEntries[index].videoFile = file;
    setFormData({ ...formData, entries: newEntries });
  };

  const handleSessionVideoFileChange = (file) => {
    setFormData({ ...formData, videoFile: file });
  };

  const handleEdit = (session) => {
    console.log('handleEdit called with session:', session);
    console.log('Current showModal state:', showModal);
    
    // Set editing session first
    setEditingSession(session);
    
    // Format date
    const dateStr = new Date(session.date).toISOString().split('T')[0];
    
    // Prepare form data
    const newFormData = {
      dogId: session.dogId.toString(),
      date: dateStr,
      level: session.level,
      notes: session.notes || '',
      videoFile: null,
      existingVideoUrl: session.videoUrl || null,
      entries: session.entries.length > 0
        ? session.entries.map((e) => ({
            trainingId: e.trainingId.toString(),
            score: e.score.toString(),
            notes: e.notes || '',
            videoFile: null,
            existingVideoUrl: e.videoUrl || null,
            entryId: e.id,
          }))
        : [{ trainingId: '', score: '', notes: '', videoFile: null }],
    };
    
    console.log('Setting formData:', newFormData);
    setFormData(newFormData);
    
    console.log('Setting showModal to true');
    setShowModal(true);
    
    // Force update check
    setTimeout(() => {
      console.log('After timeout - showModal should be true');
    }, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această sesiune?')) {
      return;
    }
    try {
      await sessionService.deleteSession(id);
      loadData();
    } catch (error) {
      console.error('Error deleting session:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Eroare la ștergerea sesiunii';
      alert(`Eroare: ${errorMessage}`);
    }
  };

  const handleDeleteEntry = async (sessionId, entryId, entryName) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi antrenamentul "${entryName}" din această sesiune?`)) {
      return;
    }
    try {
      await sessionService.deleteEntry(sessionId, entryId);
      loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Eroare la ștergerea antrenamentului';
      alert(`Eroare: ${errorMessage}`);
    }
  };

  const handleAddTrainerNote = async (sessionId, entryId, trainerNote) => {
    if (!trainerNote || trainerNote.trim() === '') {
      alert('Te rugăm să introduci o notă înainte de a salva.');
      return;
    }
    try {
      await trainerService.addTrainerNote(sessionId, entryId, trainerNote.trim());
      setEditingTrainerNote({ entryId: null, note: '' });
      loadData(); // Reload data to show the updated note
    } catch (error) {
      console.error('Error adding trainer note:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Eroare la salvarea notei trainer';
      alert(`Eroare: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSession(null);
    setFormData({
      dogId: '',
      date: new Date().toISOString().split('T')[0],
      level: 'MR1',
      notes: '',
      videoFile: null,
      existingVideoUrl: null,
      entries: [{ trainingId: '', score: '', notes: '', videoFile: null }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dogId) {
      alert('Selectează un câine');
      return;
    }
    
    const validEntries = formData.entries.filter((e) => e.trainingId && e.score);
    if (validEntries.length === 0) {
      alert('Adaugă cel puțin un antrenament cu scor');
      return;
    }

    try {
      const sessionData = {
        dogId: parseInt(formData.dogId),
        date: formData.date,
        level: formData.level,
        notes: formData.notes || null,
        entries: validEntries.map((e) => ({
          trainingId: parseInt(e.trainingId),
          score: parseInt(e.score) || 0,
          notes: e.notes || null,
        })),
      };
      
      let sessionId;
      let createdEntries = [];
      
      if (editingSession) {
        const updated = await sessionService.updateSession(editingSession.id, sessionData);
        sessionId = updated.id;
        createdEntries = updated.entries;
      } else {
        const created = await sessionService.createSession(sessionData);
        sessionId = created.id;
        createdEntries = created.entries;
      }
      
      // Upload session video if provided
      if (formData.videoFile) {
        try {
          await uploadService.uploadSessionVideo(sessionId, formData.videoFile);
        } catch (error) {
          console.error('Error uploading session video:', error);
        }
      }

      // Upload videos for entries that have video files
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        if (entry.videoFile && createdEntries[i]) {
          try {
            await uploadService.uploadEntryVideo(createdEntries[i].id, entry.videoFile);
          } catch (error) {
            console.error(`Error uploading video for entry ${i}:`, error);
          }
        }
      }
      
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || (editingSession ? 'Eroare la actualizarea sesiunii' : 'Eroare la crearea sesiunii');
      alert(`Eroare: ${errorMessage}`);
    }
  };

  // Separate sessions into own sessions and client sessions (for trainers)
  const ownSessions = sessions.filter(session => session.userId === (user?.id || -1));
  const clientSessions = user?.isTrainer 
    ? sessions.filter(session => session.userId !== (user?.id || -1)).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  function renderSessionCard(session, isExpanded) {
    return (
      <>
        {/* Session Header */}
        <div
          className="p-3 sm:p-4 cursor-pointer flex items-center justify-between gap-2 sm:gap-4"
          onClick={() => toggleSession(session.id)}
        >
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {session.dog.photoUrl && (
              <img
                src={session.dog.photoUrl}
                alt={session.dog.name}
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-text-dark text-sm sm:text-base truncate">{session.dog.name}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                    {session.level}
                  </span>
                </div>
                {session.trainer && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 hidden sm:inline-block">
                    Trainer: {session.trainer.email || 'N/A'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                <span className="whitespace-nowrap">{new Date(session.date).toLocaleDateString('ro-RO')}</span>
                <span className="whitespace-nowrap">{session.entries.length} antrenamente</span>
                {session.dog.user && session.dog.user.id !== (user?.id || -1) && (
                  <span className="text-blue-600 font-medium truncate max-w-[150px] sm:max-w-none">Cursant: {session.dog.user.email}</span>
                )}
                {session.dog.user && session.dog.user.id === (user?.id || -1) && user?.isTrainer && (
                  <span className="text-gray-500 truncate max-w-[150px] sm:max-w-none">Proprietar: {session.dog.user.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {(session.userId === (user?.id || -1) || user?.isTrainer) && (
              <>
                {session.userId === (user?.id || -1) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(session);
                    }}
                    className="min-w-[44px] min-h-[44px] p-2 sm:p-2 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors cursor-pointer touch-manipulation"
                    title="Editează"
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(session.id);
                  }}
                  className="min-w-[44px] min-h-[44px] p-2 sm:p-2 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors touch-manipulation"
                  title="Șterge"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => toggleSession(session.id)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              <svg
                className={`w-6 h-6 sm:w-5 sm:h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-4 border-t border-gray-200 bg-gray-50">
            {session.notes && (
              <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-primary">
                <p className="text-sm text-gray-700 italic">"{session.notes}"</p>
              </div>
            )}
            
            {session.videoUrl && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Video sesiune:</h4>
                  {visibleVideos.has(`session-${session.id}`) && (
                    <button
                      onClick={() => {
                        const newVisible = new Set(visibleVideos);
                        newVisible.delete(`session-${session.id}`);
                        setVisibleVideos(newVisible);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      title="Ascunde videoclip"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ascunde
                    </button>
                  )}
                </div>
                {visibleVideos.has(`session-${session.id}`) ? (
                  <>
                    <video
                      src={session.videoUrl}
                      controls
                      className="w-full max-w-md rounded-lg border border-gray-200"
                      preload="metadata"
                      onError={(e) => {
                        console.error('Error loading session video:', session.videoUrl, e);
                      }}
                      onLoadStart={() => {
                        console.log('Loading session video:', session.videoUrl);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: {session.videoUrl}</p>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      const newVisible = new Set(visibleVideos);
                      newVisible.add(`session-${session.id}`);
                      setVisibleVideos(newVisible);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vezi videoclip
                  </button>
                )}
              </div>
            )}
            
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">Antrenamente:</h4>
              {session.entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-text-dark">{entry.training.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold">
                        Scor: {entry.score}
                      </span>
                      {session.userId === (user?.id || -1) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(session.id, entry.id, entry.training.name);
                          }}
                          className="min-w-[44px] min-h-[44px] p-2 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors touch-manipulation"
                          title="Șterge antrenament"
                        >
                          <svg className="w-5 h-5 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>
                  )}
                  {entry.trainerNote && (
                    <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Notă trainer:</p>
                      <p className="text-sm text-blue-900">{entry.trainerNote}</p>
                    </div>
                  )}
                  {user?.isTrainer && !entry.trainerNote && (
                    <div className="mt-2">
                      {editingTrainerNote.entryId === entry.id ? (
                        <div className="p-2 bg-gray-50 rounded border">
                          <textarea
                            className="w-full text-sm p-2 border rounded"
                            rows="2"
                            placeholder="Adaugă o notă..."
                            value={editingTrainerNote.note}
                            onChange={(e) => setEditingTrainerNote({ ...editingTrainerNote, note: e.target.value })}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAddTrainerNote(session.id, entry.id, editingTrainerNote.note)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Salvează
                            </button>
                            <button
                              onClick={() => setEditingTrainerNote({ entryId: null, note: '' })}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                            >
                              Anulează
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingTrainerNote({ entryId: entry.id, note: '' })}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          + Adaugă notă trainer
                        </button>
                      )}
                    </div>
                  )}
                  {entry.videoUrl && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        {visibleVideos.has(`entry-${entry.id}`) && (
                          <button
                            onClick={() => {
                              const newVisible = new Set(visibleVideos);
                              newVisible.delete(`entry-${entry.id}`);
                              setVisibleVideos(newVisible);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            title="Ascunde videoclip"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Ascunde
                          </button>
                        )}
                      </div>
                      {visibleVideos.has(`entry-${entry.id}`) ? (
                        <>
                          <video
                            src={entry.videoUrl}
                            controls
                            className="w-full max-w-md rounded-lg"
                            preload="metadata"
                            onError={(e) => {
                              console.error('Error loading video:', entry.videoUrl, e);
                            }}
                            onLoadStart={() => {
                              console.log('Loading video:', entry.videoUrl);
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">URL: {entry.videoUrl}</p>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            const newVisible = new Set(visibleVideos);
                            newVisible.add(`entry-${entry.id}`);
                            setVisibleVideos(newVisible);
                          }}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-xs font-medium flex items-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Vezi videoclip
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Sesiuni de antrenament</h1>
          <p className="text-sm sm:text-base text-gray-600">Înregistrează și urmărește progresul antrenamentelor</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg active:opacity-90 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation min-h-[44px] text-base sm:text-sm"
          disabled={dogs.length === 0 || trainings.length === 0}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adaugă sesiune
        </button>
      </div>

      {dogs.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">Adaugă cel puțin un câine și un antrenament înainte de a crea sesiuni.</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4 text-lg">Nu ai creat încă nicio sesiune.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={dogs.length === 0 || trainings.length === 0}
          >
            Creează prima sesiune
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Own Sessions Section */}
          {ownSessions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-dark mb-4">Sesiunile mele</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                {ownSessions.map((session) => {
                  const isExpanded = expandedSessions.has(session.id);
                  return (
                    <div key={session.id} className="hover:bg-gray-50 transition-colors">
                      {renderSessionCard(session, isExpanded)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Sessions Section (for trainers) */}
          {user?.isTrainer && clientSessions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-dark mb-4">Sesiuni cursanți</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                {clientSessions.map((session) => {
                  const isExpanded = expandedSessions.has(session.id);
                  return (
                    <div key={session.id} className="hover:bg-gray-50 transition-colors">
                      {renderSessionCard(session, isExpanded)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal ? (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-y-auto p-2 sm:p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            WebkitOverflowScrolling: 'touch'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative z-[10000] m-2 sm:m-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-text-dark">
                {editingSession ? 'Editează sesiune' : 'Adaugă sesiune nouă'}
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câine *
                  </label>
                  <CustomSelect
                    required
                    value={formData.dogId}
                    onChange={(e) => setFormData({ ...formData, dogId: e.target.value })}
                    placeholder="Selectează câine"
                    options={[
                      { value: '', label: 'Selectează câine', disabled: true },
                      ...dogs.map((dog) => ({ value: dog.id.toString(), label: dog.name }))
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dată *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video sesiune (opțional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleSessionVideoFileChange(file);
                      }
                    }}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primaryDark file:cursor-pointer"
                  />
                  {formData.videoFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ {formData.videoFile.name}
                    </p>
                  )}
                  {formData.existingVideoUrl && !formData.videoFile && (
                    <p className="text-xs text-primary mt-1">
                      Video existent va fi păstrat
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Antrenamente *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddEntry}
                      className="text-sm text-primary hover:text-primaryDark font-medium"
                    >
                      + Adaugă antrenament
                    </button>
                  </div>
                  {formData.entries.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg mb-3 space-y-3 border border-gray-200"
                    >
                      <CustomSelect
                        required
                        value={entry.trainingId}
                        onChange={(e) =>
                          handleEntryChange(index, 'trainingId', e.target.value)
                        }
                        placeholder="Selectează antrenament"
                        options={[
                          { value: '', label: 'Selectează antrenament', disabled: true },
                          ...trainings.map((training) => ({ 
                            value: training.id.toString(), 
                            label: training.name 
                          }))
                        ]}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Scor"
                          min="0"
                          required
                          className="px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                          value={entry.score}
                          onChange={(e) =>
                            handleEntryChange(index, 'score', e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="Note"
                          className="px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-manipulation"
                          value={entry.notes}
                          onChange={(e) =>
                            handleEntryChange(index, 'notes', e.target.value)
                          }
                        />
                      </div>
                      {/* Video Upload for Entry */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Video (opțional)
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleEntryVideoFileChange(index, file);
                            }
                          }}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primaryDark file:cursor-pointer"
                        />
                        {entry.videoFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            ✓ {entry.videoFile.name}
                          </p>
                        )}
                        {entry.existingVideoUrl && !entry.videoFile && (
                          <p className="text-xs text-primary mt-1">
                            Video existent va fi păstrat
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg active:opacity-90 transition-all font-medium text-base sm:text-sm touch-manipulation min-h-[44px]"
                  >
                    {editingSession ? 'Salvează' : 'Adaugă'}
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
        </div>
      ) : null}
    </div>
  );
};
