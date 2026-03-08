import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RefreshCcw, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useAnalytics } from '../context/AnalyticsContext';

const DynamicQuizPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [finished, setFinished] = useState(false);
  const { trackQuizStart, trackQuizComplete } = useAnalytics();

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
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [slug]);

  const handleStart = () => {
    setStarted(true);
    if (quiz) trackQuizStart(quiz.title);
  };

  const handleAnswer = (value: string) => {
    const questions = quiz.questions.steps;
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Logic to determine outcome would go here based on 'value' and previous answers
      // For this demo, we just show the first outcome or a default one
      setTimeout(() => {
        setFinished(true);
        if (quiz) trackQuizComplete(quiz.title, 'Completed');
      }, 500);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-vandora-emerald" /></div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz no encontrado</div>;

  const questions = quiz.questions.steps;
  const outcome = quiz.questions.outcomes?.[0] || { title: "Resultado", description: "Gracias por completar el quiz." };

  return (
    <div className="min-h-screen bg-vandora-cream flex flex-col">
      <SEO 
        title={quiz.seo_title || quiz.title} 
        description={quiz.seo_description || quiz.description} 
      />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full border border-gray-100 min-h-[600px] flex">
          
          {/* Visual Side */}
          <div className="hidden md:flex w-1/2 bg-vandora-emerald text-white p-12 flex-col justify-center relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <h2 className="text-4xl font-serif text-vandora-gold mb-6 relative z-10">{quiz.title}</h2>
             <p className="text-emerald-100 text-lg relative z-10">{quiz.description}</p>
          </div>

          {/* Interaction Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
             <AnimatePresence mode="wait">
                {!started ? (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <h1 className="md:hidden text-3xl font-serif text-vandora-emerald mb-4">{quiz.title}</h1>
                    <p className="md:hidden text-gray-600 mb-8">{quiz.description}</p>
                    
                    <button
                      onClick={handleStart}
                      className="bg-vandora-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center mx-auto"
                    >
                      Comenzar Experiencia <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>
                ) : finished ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <h3 className="text-2xl font-serif text-vandora-emerald mb-4">{outcome.title}</h3>
                    <p className="text-gray-600 mb-8">{outcome.description}</p>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
                       <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Te recomendamos:</p>
                       <p className="font-bold text-lg text-gray-900">{outcome.product_recommendation}</p>
                    </div>
                    <Link
                      to="/shop"
                      className="block w-full bg-vandora-emerald text-white px-6 py-4 rounded-lg font-medium hover:bg-emerald-800 transition-colors shadow-lg"
                    >
                      Ver Colección
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={questions[currentQuestion].id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-8">
                      <span className="text-xs font-bold text-vandora-gold uppercase tracking-widest">
                        Paso {currentQuestion + 1} de {questions.length}
                      </span>
                      <h3 className="text-2xl font-serif text-gray-900 mt-2">
                        {questions[currentQuestion].text}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((opt: any) => (
                        <button
                          key={opt.id}
                          onClick={() => handleAnswer(opt.value)}
                          className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-vandora-emerald hover:shadow-md transition-all flex items-center group"
                        >
                          <span className="text-2xl mr-4">{opt.icon}</span>
                          <span className="font-medium text-gray-700 group-hover:text-vandora-emerald">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicQuizPage;
