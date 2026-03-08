import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';

const VANDORA_CONTEXT = `
Eres "Vandora AI", la asistente virtual experta en moda de la tienda exclusiva "Vandora" en Ecuador.
Tu tono es elegante, empático, profesional y cálido.
Ideología: "El Legado del Florecimiento". La elegancia es un estado de superación.
Productos: Vestidos, blusas, pantalones, faldas y chaquetas de alta calidad.
Envíos: A todo el Ecuador por $5.00. Gratis en compras mayores a $100. Tiempo de entrega 2-3 días hábiles.
Pagos: Transferencia bancaria y Efectivo contra entrega (solo Quito y Guayaquil).
Cambios: 7 días para cambios.
Ubicación: Tienda online, pronto showroom físico en Quito.
Objetivo: Ayudar al cliente a elegir prendas, resolver dudas de tallas y envíos, y cerrar la venta.
Si te preguntan por algo que no sabes, sugiere contactar a un humano por WhatsApp.
Responde de manera concisa (máximo 3 oraciones por turno a menos que sea necesario más detalle).
`;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Bienvenida a Vandora. Soy tu asesora de moda personal. ¿En qué puedo ayudarte hoy para que luzcas espectacular?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // 1. Fetch OpenAI key from settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();

      const apiKey = settingsData?.value;
      if (!apiKey) {
        throw new Error('El administrador aún no ha configurado la clave de conexión. Por favor usa WhatsApp.');
      }

      // 2. Format history for OpenAI
      const systemMessage = { role: 'system', content: VANDORA_CONTEXT };
      const apiMessages = [systemMessage, ...messages, { role: 'user', content: userMessage }].map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content
      }));

      // 3. Call OpenAI using fetch
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error('Error en la comunicación con la inteligencia artificial.');
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || 'Revisaré esto de inmediato...';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: error.message || 'Lo siento, tuve un pequeño problema de conexión. ¿Podrías contactarnos por WhatsApp?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-vandora-emerald p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Sparkles className="h-5 w-5 text-vandora-gold" />
                </div>
                <div>
                  <h3 className="text-white font-serif font-medium">Asistente Vandora</h3>
                  <p className="text-emerald-200 text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    En línea
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-80">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${ msg.role === 'user' ? 'justify-end' : 'justify-start' }`}
                >
                  <div
                    className={
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm " + 
                      (msg.role === 'user'
                        ? 'bg-vandora-emerald text-white rounded-br-none'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none')
                    }
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                    <Loader2 className="h-4 w-4 animate-spin text-vandora-emerald" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-vandora-emerald focus:ring-1 focus:ring-vandora-emerald"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-vandora-emerald text-white p-2 rounded-full hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 text-center">
                <a
                  href="https://wa.me/593999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-vandora-emerald transition-colors"
                >
                  ¿Prefieres WhatsApp? Haz clic aquí
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-vandora-emerald text-white p-4 rounded-full shadow-lg z-50 hover:bg-emerald-800 transition-colors flex items-center justify-center group"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-0 top-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vandora-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-vandora-gold"></span>
        </span>
      </motion.button>
    </>
  );
};

export default ChatWidget;
