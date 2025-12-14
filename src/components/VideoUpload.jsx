import { useState } from 'react';

export const VideoUpload = ({ onUpload, currentVideo, label = 'Upload Video' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentVideo || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Upload file
    setUploading(true);
    try {
      const result = await onUpload(file);
      if (result.videoUrl) {
        setPreview(result.videoUrl);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Eroare la upload');
      setPreview(currentVideo || null);
      URL.revokeObjectURL(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="space-y-2">
        {preview && (
          <div className="relative">
            <video
              src={preview}
              controls
              className="w-full max-w-md rounded-lg border-2 border-gray-200"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        )}
        <label className="cursor-pointer inline-block">
          <span className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition-colors inline-block">
            {uploading ? 'Se încarcă...' : preview ? 'Schimbă video' : 'Selectează video'}
          </span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};


