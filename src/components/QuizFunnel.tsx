import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Check, RefreshCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// Quiz Data Structure
const QUIZ_DATA = {
  title: "Descubre tu Estilo Vandora",
  description: "Responde 3 preguntas rápidas y te recomendaremos el look perfecto para tu próxima conquista.",
  questions: [
    {
      id: 1,
      text: "¿Cuál es tu ocasión especial?",
      options: [
        { id: 'a', text: 'Reunión de Negocios', value: 'formal', icon: '💼' },
        { id: 'b', text: 'Cena Romántica', value: 'elegant', icon: '🍷' },
        { id: 'c', text: 'Evento Casual', value: 'casual', icon: '☕' },
        { id: 'd', text: 'Gala o Fiesta', value: 'party', icon: '✨' }
      ]
    },
    {
      id: 2,
      text: "¿Cómo te gusta sentirte con tu ropa?",
      options: [
        { id: 'a', text: 'Poderosa y Estructurada', value: 'structured', icon: '👑' },
        { id: 'b', text: 'Libre y Cómoda', value: 'flowy', icon: '🍃' },
        { id: 'c', text: 'Sensual y Sofisticada', value: 'fitted', icon: '💋' }
      ]
    },
    {
      id: 3,
      text: "¿Qué paleta de colores prefieres hoy?",
      options: [
        { id: 'a', text: 'Tonos Tierra (Crema, Café)', value: 'earth', icon: '🍂' },
        { id: 'b', text: 'Clásicos (Negro, Blanco)', value: 'classic', icon: '🎹' },
        { id: 'c', text: 'Vibrantes (Esmeralda, Rosa)', value: 'vibrant', icon: '🌺' }
      ]
    }
  ]
};

const QuizFunnel = () => {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    
    if (currentQuestion < QUIZ_DATA.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setFinished(true), 500);
    }
  };

  const resetQuiz = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setFinished(false);
  };

  // Mock recommendation logic
  const getRecommendation = () => {
    const occasion = answers[0];
    // Simple logic for demo purposes
    if (occasion === 'formal') return {
      title: "Look Ejecutiva Imparable",
      product: "Chaqueta Ejecutiva Rosa",
      desc: "Proyecta autoridad sin perder tu feminidad.",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
      link: "/product/4"
    };
    if (occasion === 'party' || occasion === 'elegant') return {
      title: "Look Noche Estrellada",
      product: "Vestido Esmeralda Real",
      desc: "Serás el centro de todas las miradas con elegancia absoluta.",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
      link: "/product/1"
    };
    return {
      title: "Look Casual Chic",
      product: "Blusa Seda Champagne",
      desc: "Comodidad elevada para tu día a día.",
      img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1000&auto=format&fit=crop",
      link: "/product/2"
    };
  };

  const recommendation = finished ? getRecommendation() : null;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto my-12 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        {/* Left Side: Visuals */}
        <div className="bg-vandora-emerald p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <Sparkles className="h-12 w-12 text-vandora-gold mb-6" />
                <h2 className="font-serif text-4xl mb-4 text-vandora-gold">Personal Shopper</h2>
                <p className="text-emerald-100 text-lg leading-relaxed">
                  No busques más. Deja que nuestra inteligencia de estilo encuentre la prenda perfecta para ti en segundos.
                </p>
              </motion.div>
            ) : finished ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center"
              >
                <h3 className="font-serif text-2xl text-vandora-gold mb-2">Tu Match Perfecto</h3>
                <div className="aspect-[3/4] w-48 mx-auto rounded-lg overflow-hidden shadow-2xl border-2 border-vandora-gold mb-4">
                  <img src={recommendation?.img} alt="Result" className="w-full h-full object-cover" />
                </div>
                <p className="font-medium text-lg">{recommendation?.product}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10"
              >
                <div className="text-vandora-gold text-sm font-bold tracking-widest uppercase mb-2">
                  Pregunta {currentQuestion + 1} de {QUIZ_DATA.questions.length}
                </div>
                <h3 className="font-serif text-3xl leading-tight">
                  {QUIZ_DATA.questions[currentQuestion].text}
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Interaction */}
        <div className="p-8 flex flex-col justify-center bg-gray-50">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h3 className="text-2xl font-serif text-gray-900 mb-4">{QUIZ_DATA.title}</h3>
                <p className="text-gray-600 mb-8">{QUIZ_DATA.description}</p>
                <button
                  onClick={() => setStarted(true)}
                  className="bg-vandora-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center mx-auto"
                >
                  Comenzar Quiz <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </motion.div>
            ) : finished ? (
              <motion.div
                key="finish"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h3 className="text-2xl font-serif text-vandora-emerald mb-2">{recommendation?.title}</h3>
                <p className="text-gray-600 mb-8">{recommendation?.desc}</p>
                
                <div className="space-y-4">
                  <Link
                    to={recommendation?.link || '/shop'}
                    className="block w-full bg-vandora-emerald text-white px-6 py-4 rounded-lg font-medium hover:bg-emerald-800 transition-colors shadow-lg"
                  >
                    Ver Prenda y Comprar
                  </Link>
                  <button
                    onClick={resetQuiz}
                    className="flex items-center justify-center w-full text-gray-500 hover:text-gray-800 py-2"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" /> Volver a intentar
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`q-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {QUIZ_DATA.questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-vandora-emerald hover:shadow-md transition-all flex items-center group"
                  >
                    <span className="text-2xl mr-4 group-hover:scale-110 transition-transform">{option.icon}</span>
                    <span className="font-medium text-gray-700 group-hover:text-vandora-emerald">{option.text}</span>
                    <div className="ml-auto w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-vandora-emerald flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-vandora-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizFunnel;
