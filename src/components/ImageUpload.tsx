import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { r2Storage } from '../lib/storage';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Upload to R2 Storage
      const { url, error: uploadError } = await r2Storage.uploadFile(file, 'products');

      if (uploadError) throw uploadError;

      if (url) {
        setPreview(url);
        onUpload(url);
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    multiple: false
  } as any);

  const removeImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      await r2Storage.deleteFile(preview);
    }
    setPreview(null);
    onUpload('');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-vandora-emerald bg-emerald-50' : 'border-gray-300 hover:border-vandora-emerald'
        } ${preview ? 'border-none p-0' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-vandora-emerald mb-2" />
            <p className="text-sm text-gray-500">Subiendo imagen...</p>
          </div>
        ) : preview ? (
          <div className="relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <button
                onClick={removeImage}
                className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Click o arrastra para reemplazar</p>
          </div>
        ) : (
          <div className="py-8">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              Arrastra una imagen aquí o haz click para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP hasta 5MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
