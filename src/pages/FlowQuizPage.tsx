import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useAnalytics } from '../context/AnalyticsContext';
import { v4 as uuidv4 } from 'uuid';

const FlowQuizPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(uuidv4());
  const { trackQuizStart, trackQuizComplete, trackEvent } = useAnalytics();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (data) {
        setQuiz(data);
        if (data.flow_data) {
          setNodes(data.flow_data.nodes);
          setEdges(data.flow_data.edges);
          // Find start node (usually type 'welcome' or the first one)
          const startNode = data.flow_data.nodes.find((n: any) => n.type === 'welcome') || data.flow_data.nodes[0];
          setCurrentNodeId(startNode?.id);
        }
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [slug]);

  const logEvent = async (eventType: string, nodeId: string, payload?: any) => {
    // Log to DB
    await supabase.from('quiz_events').insert({
      quiz_id: quiz.id,
      session_id: sessionId,
      node_id: nodeId,
      event_type: eventType,
      payload
    });
    // Log to Analytics Context
    trackEvent('Quiz Flow', eventType, nodeId);
  };

  const handleNext = (targetNodeId?: string) => {
    if (!targetNodeId) {
      // Try to find default edge from current node
      const edge = edges.find(e => e.source === currentNodeId);
      if (edge) targetNodeId = edge.target;
    }

    if (targetNodeId) {
      setCurrentNodeId(targetNodeId);
      logEvent('view', targetNodeId);
      
      // Check if it's a result node
      const targetNode = nodes.find(n => n.id === targetNodeId);
      if (targetNode?.type === 'result') {
        trackQuizComplete(quiz.title, targetNode.data.title);
        logEvent('completion', targetNodeId);
      }
    }
  };

  const renderMedia = (data: any, heightClass = "h-64") => {
    const mediaUrl = data.media || data.image;
    if (!mediaUrl) return null;

    const type = data.mediaType || 'image';

    if (type === 'image') {
      return <img src={mediaUrl} alt="" className={`w-full ${heightClass} object-cover rounded-xl mb-6 shadow-md`} />;
    } else if (type === 'video') {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className={`w-full ${heightClass} object-cover rounded-xl mb-6 shadow-md`}
        />
      );
    } else if (type === 'audio') {
      return (
        <div className="w-full bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200 flex items-center justify-center">
          <audio src={mediaUrl} controls className="w-full" />
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-vandora-emerald" /></div>;
  if (!quiz || !currentNodeId) return <div className="min-h-screen flex items-center justify-center">Quiz no disponible</div>;

  const currentNode = nodes.find(n => n.id === currentNodeId);
  if (!currentNode) return <div>Error: Node not found</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <SEO title={quiz.seo_title || quiz.title} description={quiz.seo_description} />
      
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px] flex flex-col"
          >
            {/* Progress Bar (Simplified) */}
            <div className="h-1 bg-gray-100 w-full">
              <div className="h-full bg-vandora-emerald transition-all duration-500" style={{ width: '30%' }} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-8">
              {currentNode.type === 'welcome' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {renderMedia(currentNode.data, "h-64")}
                  <h1 className="text-3xl font-serif text-vandora-emerald mb-4">{currentNode.data.title}</h1>
                  <p className="text-gray-600 mb-8">{currentNode.data.description}</p>
                  <button
                    onClick={() => {
                      logEvent('start', currentNode.id);
                      handleNext();
                    }}
                    className="w-full bg-vandora-black text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all flex items-center justify-center"
                  >
                    {currentNode.data.buttonText || 'Comenzar'} <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              )}

              {currentNode.type === 'question' && (
                <div className="flex-1 flex flex-col">
                  {renderMedia(currentNode.data, "h-48")}
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">{currentNode.data.question}</h2>
                  
                  <div className="space-y-3 flex-1">
                    {currentNode.data.options?.map((opt: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          logEvent('interaction', currentNode.id, { answer: opt.label });
                          // Find edge connected to this specific handle if using handles, or just default next
                          // For simplicity in this demo, we just go next. In full version, map option ID to edge sourceHandle.
                          handleNext(); 
                        }}
                        className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-vandora-emerald hover:bg-emerald-50 transition-all flex items-center group"
                      >
                        {opt.media && <img src={opt.media} className="w-12 h-12 rounded-lg object-cover mr-4" />}
                        <span className="font-medium text-gray-700 group-hover:text-vandora-emerald text-lg">{opt.label}</span>
                        <div className="ml-auto w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-vandora-emerald flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-vandora-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentNode.type === 'result' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h2 className="text-3xl font-serif text-vandora-emerald mb-2">{currentNode.data.title}</h2>
                  <p className="text-gray-600 mb-8">{currentNode.data.description || 'Aquí tienes tu recomendación personalizada.'}</p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Tu Match Ideal</p>
                    <p className="text-xl font-bold text-gray-900">{currentNode.data.productName}</p>
                  </div>

                  <Link
                    to="/tienda"
                    className="w-full bg-vandora-emerald text-white py-4 rounded-xl font-medium text-lg hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-200"
                  >
                    Ver Producto y Comprar
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">Powered by Vandora AI</p>
        </div>
      </div>
    </div>
  );
};

export default FlowQuizPage;
