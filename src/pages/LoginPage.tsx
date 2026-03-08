import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          setMessage('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vandora-cream flex items-center justify-center px-4 py-12">
      <SEO title="Iniciar Sesión" description="Ingresa o regístrate en Vandora" />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-vandora-emerald mb-2">
            {isLogin ? 'Bienvenida a Vandora' : 'Únete a Vandora'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Crea una cuenta y forma parte de nuestra comunidad'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm border border-green-100">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                required={!isLogin}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald p-2 border"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald p-2 border"
            />
            {!isLogin && <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vandora-emerald hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vandora-emerald disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vandora-emerald transition-colors"
          >
            Ver Demo Superadmin
          </button>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Demo Cliente
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Demo Editor
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Demo Soporte
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-vandora-emerald hover:text-emerald-800 underline focus:outline-none"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
