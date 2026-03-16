import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeRow {
  size: string;
  bust: string;
  waist: string;
  hip: string;
}

interface SizeGuideData {
  rows: SizeRow[];
  instructions: string[];
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<SizeGuideData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSizeGuide();
    }
  }, [isOpen]);

  const fetchSizeGuide = async () => {
    setLoading(true);
    const { data: dbData, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'size_guide')
      .single();

    if (dbData && !error) {
      try {
        const parsed = JSON.parse(dbData.value);
        setData(parsed);
      } catch (e) {
        console.error('Error parsing size guide:', e);
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">Guía de Tallas</h2>
              
              {loading ? (
                <div className="py-12 text-center text-gray-500">Cargando guía...</div>
              ) : data ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Talla</th>
                          <th className="px-6 py-3">Busto (cm)</th>
                          <th className="px-6 py-3">Cintura (cm)</th>
                          <th className="px-6 py-3">Cadera (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, idx) => (
                          <tr key={idx} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-gray-900">{row.size}</td>
                            <td className="px-6 py-4">{row.bust}</td>
                            <td className="px-6 py-4">{row.waist}</td>
                            <td className="px-6 py-4">{row.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 text-xs text-gray-500">
                    <p className="font-medium mb-2">Cómo medir:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {data.instructions.map((inst, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: inst.replace(/^(.*?):/, '<strong>$1:</strong>') }} />
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-500 italic">No hay información de tallas disponible.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export default SizeGuideModal;
