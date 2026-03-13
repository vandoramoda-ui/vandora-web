import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Plus, Trash2, Ruler } from 'lucide-react';

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

const SizeGuideEditor = () => {
  const [data, setData] = useState<SizeGuideData>({
    rows: [
      { size: 'XS', bust: '80-84', waist: '60-64', hip: '86-90' },
      { size: 'S', bust: '85-89', waist: '65-69', hip: '91-95' },
      { size: 'M', bust: '90-94', waist: '70-74', hip: '96-100' },
      { size: 'L', bust: '95-99', waist: '75-79', hip: '101-105' },
      { size: 'XL', bust: '100-104', waist: '80-84', hip: '106-110' }
    ],
    instructions: [
      'Busto: Mide alrededor de la parte más completa del busto.',
      'Cintura: Mide alrededor de la parte más estrecha de tu cintura natural.',
      'Cadera: Mide alrededor de la parte más completa de tus caderas.'
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSizeGuide();
  }, []);

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
        if (parsed && Array.isArray(parsed.rows)) {
          setData(parsed);
        }
      } catch (e) {
        console.error('Error parsing size guide data:', e);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          key: 'size_guide', 
          value: JSON.stringify(data) 
        });

      if (error) throw error;
      alert('Guía de tallas guardada correctamente.');
    } catch (error: any) {
      console.error('Error saving size guide:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    setData({
      ...data,
      rows: [...data.rows, { size: '', bust: '', waist: '', hip: '' }]
    });
  };

  const removeRow = (index: number) => {
    setData({
      ...data,
      rows: data.rows.filter((_, i) => i !== index)
    });
  };

  const updateRow = (index: number, field: keyof SizeRow, value: string) => {
    const newRows = [...data.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setData({ ...data, rows: newRows });
  };

  const addInstruction = () => {
    setData({
      ...data,
      instructions: [...data.instructions, '']
    });
  };

  const removeInstruction = (index: number) => {
    setData({
      ...data,
      instructions: data.instructions.filter((_, i) => i !== index)
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...data.instructions];
    newInstructions[index] = value;
    setData({ ...data, instructions: newInstructions });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando guía de tallas...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center text-vandora-emerald">
            <Ruler className="h-6 w-6 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Editor de Guía de Tallas</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-vandora-emerald text-white px-6 py-2 rounded-md hover:bg-emerald-800 flex items-center shadow-sm disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </button>
        </div>

        <div className="space-y-8">
          {/* Table Editor */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">Tabla de Medidas</h3>
              <button
                onClick={addRow}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md flex items-center transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" /> Añadir Fila
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Talla</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Busto (cm)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cintura (cm)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cadera (cm)</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.rows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.size}
                          onChange={(e) => updateRow(index, 'size', e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-vandora-emerald rounded px-2"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.bust}
                          onChange={(e) => updateRow(index, 'bust', e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-vandora-emerald rounded px-2"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.waist}
                          onChange={(e) => updateRow(index, 'waist', e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-vandora-emerald rounded px-2"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.hip}
                          onChange={(e) => updateRow(index, 'hip', e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-vandora-emerald rounded px-2"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => removeRow(index)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions Editor */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">Instrucciones "Cómo medir"</h3>
              <button
                onClick={addInstruction}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md flex items-center transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" /> Añadir Punto
              </button>
            </div>
            <div className="space-y-3">
              {data.instructions.map((inst, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={inst}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={1}
                    className="flex-1 rounded-md border-gray-200 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald sm:text-sm p-3 border"
                    placeholder="Ej: Busto: Mide alrededor de..."
                  />
                  <button
                    onClick={() => removeInstruction(index)}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideEditor;
