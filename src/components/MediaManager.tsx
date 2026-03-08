import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon, Film, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaImage {
  url: string;
  color?: string;
}

interface MediaManagerProps {
  images: MediaImage[];
  videos: string[];
  colors: { name: string; code: string }[];
  onImagesChange: (images: MediaImage[]) => void;
  onVideosChange: (urls: string[]) => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ images, videos, colors, onImagesChange, onVideosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    const newImages: MediaImage[] = [];

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        newImages.push({ url: data.publicUrl });
      }

      onImagesChange([...images, ...newImages]);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Error al subir imagen(es). Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const updateImageColor = (index: number, color: string) => {
    const newImages = [...images];
    newImages[index].color = color;
    onImagesChange(newImages);
  };

  const addVideo = () => {
    if (videoUrl) {
      onVideosChange([...videos, videoUrl]);
      setVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    onVideosChange(newVideos);
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Galería de Imágenes</label>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Sugerido: 1000x1000px o 800x1200px. Máx 2MB.
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative group bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-square relative">
                <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 border-t border-gray-200 bg-white">
                <select
                  value={img.color || ''}
                  onChange={(e) => updateImageColor(index, e.target.value)}
                  className="w-full text-xs border-gray-300 rounded-md focus:ring-vandora-emerald focus:border-vandora-emerald p-1"
                >
                  <option value="">Color (General)</option>
                  {colors.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          
          <div
            {...getRootProps()}
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragActive ? 'border-vandora-emerald bg-emerald-50' : 'border-gray-300 hover:border-vandora-emerald'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-vandora-emerald" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 text-center px-2">Añadir Fotos<br/>(Arrastrar o Click)</span>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Videos Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Videos del Producto</label>
        <div className="space-y-3">
          {videos.map((url, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
              <Film className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 flex-1 truncate">{url}</span>
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="URL del video (YouTube, Vimeo, MP4...)"
              className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
            />
            <button
              type="button"
              onClick={addVideo}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaManager;
