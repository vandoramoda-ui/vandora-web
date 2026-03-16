import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, FileAudio, FileVideo, Image as ImageIcon } from 'lucide-react';
import { r2Storage } from '../lib/storage';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  type: 'image' | 'video' | 'audio';
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUpload, currentUrl, type }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Subfolder for media type
      const folder = type === 'image' ? 'products' : `quiz-${type}`;
      
      const { url, error: uploadError } = await r2Storage.uploadFile(file, folder);

      if (uploadError) throw uploadError;

      if (url) {
        setPreview(url);
        onUpload(url);
      }
    } catch (err: any) {
      console.error('Error uploading media:', err);
      setError('Error al subir el archivo. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }, [onUpload, type]);

  const acceptTypes = {
    image: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    video: { 'video/*': ['.mp4', '.webm', '.ogg'] },
    audio: { 'audio/*': ['.mp3', '.wav', '.ogg'] }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes[type],
    maxFiles: 1,
    multiple: false
  } as any);

  const removeMedia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      await r2Storage.deleteFile(preview);
    }
    setPreview(null);
    onUpload('');
  };

  const renderPreview = () => {
    if (!preview) return null;

    if (type === 'image') {
      return <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />;
    } else if (type === 'video') {
      return <video src={preview} controls className="w-full h-48 object-cover rounded-lg" />;
    } else if (type === 'audio') {
      return (
        <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg">
          <audio src={preview} controls className="w-full px-4" />
        </div>
      );
    }
  };

  const Icon = type === 'image' ? ImageIcon : type === 'video' ? FileVideo : FileAudio;

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-vandora-emerald bg-emerald-50' : 'border-gray-300 hover:border-vandora-emerald'
        } ${preview ? 'border-none p-0' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-vandora-emerald mb-2" />
            <p className="text-sm text-gray-500">Subiendo...</p>
          </div>
        ) : preview ? (
          <div className="relative group">
            {renderPreview()}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center pointer-events-none">
              <button
                onClick={removeMedia}
                className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 pointer-events-auto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Click o arrastra {type === 'image' ? 'imagen' : type === 'video' ? 'video' : 'audio'}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default MediaUpload;
