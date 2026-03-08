import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
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
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">XS</td>
                      <td className="px-6 py-4">80-84</td>
                      <td className="px-6 py-4">60-64</td>
                      <td className="px-6 py-4">86-90</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">S</td>
                      <td className="px-6 py-4">85-89</td>
                      <td className="px-6 py-4">65-69</td>
                      <td className="px-6 py-4">91-95</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">M</td>
                      <td className="px-6 py-4">90-94</td>
                      <td className="px-6 py-4">70-74</td>
                      <td className="px-6 py-4">96-100</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">L</td>
                      <td className="px-6 py-4">95-99</td>
                      <td className="px-6 py-4">75-79</td>
                      <td className="px-6 py-4">101-105</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">XL</td>
                      <td className="px-6 py-4">100-104</td>
                      <td className="px-6 py-4">80-84</td>
                      <td className="px-6 py-4">106-110</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                <p className="font-medium mb-2">Cómo medir:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Busto:</strong> Mide alrededor de la parte más completa del busto.</li>
                  <li><strong>Cintura:</strong> Mide alrededor de la parte más estrecha de tu cintura natural.</li>
                  <li><strong>Cadera:</strong> Mide alrededor de la parte más completa de tus caderas.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuideModal;
