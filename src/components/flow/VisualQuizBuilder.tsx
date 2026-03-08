import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './CustomNodes';
import { Save, Plus, Image as ImageIcon, Type, Video, Layout, Settings, BarChart3, ArrowLeft, Smartphone, MessageSquarePlus, Flag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MediaUpload from '../MediaUpload';
import { v4 as uuidv4 } from 'uuid';

const initialNodes = [
  { id: 'start', type: 'welcome', position: { x: 250, y: 0 }, data: { title: 'Bienvenido al Quiz', description: 'Descubre tu estilo ideal', buttonText: 'Comenzar', mediaType: 'image' } },
];

const VisualQuizBuilder = ({ quizId, onBack }: { quizId?: string, onBack: () => void }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'design' | 'analytics'>('build');

  // Load existing flow if editing
  useEffect(() => {
    if (quizId) {
      loadQuizFlow();
    }
  }, [quizId]);

  const loadQuizFlow = async () => {
    const { data } = await supabase.from('quizzes').select('flow_data').eq('id', quizId).single();
    if (data?.flow_data) {
      setNodes(data.flow_data.nodes || initialNodes);
      setEdges(data.flow_data.edges || []);
    }
  };

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: string) => {
    const id = uuidv4();
    const newNode: any = {
      id,
      type,
      position: { x: 250, y: nodes.length * 150 + 100 },
      data: { 
        title: type === 'question' ? 'Nueva Pregunta' : 'Nuevo Resultado',
        options: type === 'question' ? [{ id: '1', label: 'Opción 1' }, { id: '2', label: 'Opción 2' }] : undefined,
        mediaType: 'image'
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: { ...node.data, [key]: value },
          };
          setSelectedNode(updatedNode); // Update local state to reflect changes immediately in panel
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If creating new (no ID), we'd need to insert first. For now assume ID exists or handle create.
      // Simplification: We update the 'flow_data' column.
      if (quizId) {
        await supabase.from('quizzes').update({
          flow_data: { nodes, edges }
        }).eq('id', quizId);
        alert('Flujo guardado correctamente');
      } else {
        // Create new quiz logic would go here
        alert('Modo creación no implementado en esta demo, edita uno existente.');
      }
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('build')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'build' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Constructor
            </button>
            <button 
              onClick={() => setActiveTab('design')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'design' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Diseño
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Analítica
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
            <Smartphone className="w-4 h-4 mr-1" /> Vista Previa
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-vandora-emerald text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 flex items-center"
          >
            {saving ? 'Guardando...' : 'Guardar y Publicar'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / Toolbar */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 z-10">
          <button onClick={() => addNode('question')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 tooltip-trigger" title="Pregunta">
            <MessageSquarePlus className="w-6 h-6" />
          </button>
          <button onClick={() => addNode('result')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Resultado">
            <Flag className="w-6 h-6" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#f1f1f1" gap={16} />
              <Controls />
              <MiniMap />
              <Panel position="top-center" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 text-xs text-gray-500">
                Arrastra nodos para conectar el flujo
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6 shadow-xl z-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Editar Nodo</h3>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-6">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título / Pregunta</label>
                <textarea
                  value={selectedNode.data.title || selectedNode.data.question || ''}
                  onChange={(e) => updateNodeData(selectedNode.type === 'question' ? 'question' : 'title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-vandora-emerald focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Multimedia</label>
                <div className="flex space-x-2 mb-2">
                  {['image', 'video', 'audio'].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateNodeData('mediaType', type)}
                      className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                        (selectedNode.data.mediaType || 'image') === type
                          ? 'bg-vandora-emerald text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'image' ? 'Imagen' : type === 'video' ? 'Video' : 'Audio'}
                    </button>
                  ))}
                </div>
                <MediaUpload 
                  type={selectedNode.data.mediaType || 'image'}
                  currentUrl={selectedNode.data.media || selectedNode.data.image}
                  onUpload={(url) => updateNodeData('media', url)}
                />
              </div>

              {/* Question Specifics */}
              {selectedNode.type === 'question' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opciones de Respuesta</label>
                  <div className="space-y-3">
                    {selectedNode.data.options?.map((opt: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOptions = [...selectedNode.data.options];
                            newOptions[idx].label = e.target.value;
                            updateNodeData('options', newOptions);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 focus:border-vandora-emerald outline-none text-sm mb-2"
                          placeholder="Texto opción"
                        />
                        <div className="flex items-center space-x-2">
                           <button className="text-xs text-blue-600 hover:underline">Subir Icono</button>
                           <button 
                             onClick={() => {
                               const newOptions = selectedNode.data.options.filter((_: any, i: number) => i !== idx);
                               updateNodeData('options', newOptions);
                             }}
                             className="text-xs text-red-500 hover:underline ml-auto"
                           >
                             Eliminar
                           </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => updateNodeData('options', [...(selectedNode.data.options || []), { id: uuidv4(), label: 'Nueva Opción' }])}
                      className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-vandora-emerald hover:text-vandora-emerald transition-colors"
                    >
                      + Agregar Opción
                    </button>
                  </div>
                </div>
              )}

              {/* Result Specifics */}
              {selectedNode.type === 'result' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto Recomendado</label>
                  <input
                    type="text"
                    value={selectedNode.data.productName || ''}
                    onChange={(e) => updateNodeData('productName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    placeholder="Ej: Vestido Esmeralda"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nombre del producto que se mostrará.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualQuizBuilder;
