import { useState } from 'react';

export const ImageUpload = ({ onUpload, currentImage, label = 'Upload Image', accept = 'image/*' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const result = await onUpload(file);
      if (result.photoUrl) {
        setPreview(result.photoUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Eroare la upload');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        )}
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition-colors inline-block">
            {uploading ? 'Se încarcă...' : preview ? 'Schimbă imaginea' : 'Selectează imagine'}
          </span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};


