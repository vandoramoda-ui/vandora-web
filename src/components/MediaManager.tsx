import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon, Film, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaItem {
  url: string;
  color?: string;
}

interface MediaManagerProps {
  images: MediaItem[];
  videos: MediaItem[];
  colors: { name: string; code: string }[];
  onImagesChange: (images: MediaItem[]) => void;
  onVideosChange: (videos: MediaItem[]) => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ images, videos, colors, onImagesChange, onVideosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    const newImages: MediaItem[] = [];

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
  } as any);

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
      onVideosChange([...videos, { url: videoUrl }]);
      setVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    onVideosChange(newVideos);
  };

  const updateVideoColor = (index: number, color: string) => {
    const newVideos = [...videos];
    newVideos[index].color = color;
    onVideosChange(newVideos);
  };

  return (
    <div className="space-y-8">
      {/* Images Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-semibold text-gray-900 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" /> Galería de Imágenes
          </label>
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Drag & Drop activo
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square relative">
                <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="p-1 px-2 pb-2 bg-white">
                <select
                  value={img.color || ''}
                  onChange={(e) => updateImageColor(index, e.target.value)}
                  className="w-full text-xs border-transparent rounded-md focus:ring-0 focus:border-vandora-emerald p-1 bg-gray-50 font-medium text-gray-700"
                >
                  <option value="">Cualquier color</option>
                  {colors.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div
            {...getRootProps()}
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive ? 'border-vandora-emerald bg-emerald-50 scale-95' : 'border-gray-200 hover:border-vandora-emerald hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-vandora-emerald" />
            ) : (
              <>
                <div className="bg-gray-100 p-2 rounded-full mb-2">
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight text-center px-1">Subir Fotos</span>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
      </div>

      {/* Videos Section */}
      <div className="border-t pt-6 border-gray-100">
        <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Film className="w-4 h-4 mr-2" /> Videos del Producto
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {videos.map((vid, index) => (
            <div key={index} className="flex flex-col bg-white border border-gray-200 rounded-lg p-3 shadow-sm group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded text-vandora-emerald">
                  <Film className="h-4 w-4" />
                </div>
                <span className="text-xs text-gray-600 flex-1 truncate font-medium">{vid.url}</span>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Mostrar para el color:</span>
                <select
                  value={vid.color || ''}
                  onChange={(e) => updateVideoColor(index, e.target.value)}
                  className="text-[11px] border-none rounded-md focus:ring-0 p-1 bg-gray-50 font-semibold text-gray-700 max-w-[120px]"
                >
                  <option value="">Cualquier color</option>
                  {colors.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="URL del video (YouTube, MP4...)"
            className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-1 focus:ring-vandora-emerald outline-none"
          />
          <button
            type="button"
            onClick={addVideo}
            className="px-4 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800 shadow-sm transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaManager;
