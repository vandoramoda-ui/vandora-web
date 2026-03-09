import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login',
        });
        if (error) throw error;
        setMessage('Te hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu correo electrónico.');
        setTimeout(() => setIsForgotPassword(false), 5000);
      } else if (isLogin) {
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
      <SEO title={isForgotPassword ? "Recuperar Contraseña" : "Iniciar Sesión"} description="Ingresa o regístrate en Vandora" />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-vandora-emerald mb-2">
            {isForgotPassword ? 'Recuperar Contraseña' : (isLogin ? 'Bienvenida a Vandora' : 'Únete a Vandora')}
          </h1>
          <p className="text-gray-500">
            {isForgotPassword
              ? 'Ingresa tu correo para enviarte un enlace de recuperación'
              : (isLogin ? 'Ingresa a tu cuenta para continuar' : 'Crea una cuenta y forma parte de nuestra comunidad')}
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
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                required={!isLogin && !isForgotPassword}
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

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-xs text-vandora-emerald hover:text-emerald-800 focus:outline-none underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                type="password"
                required={!isForgotPassword}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald p-2 border"
              />
              {!isLogin && <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vandora-emerald hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vandora-emerald disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isForgotPassword ? 'Enviar Enlace' : (isLogin ? 'Ingresar' : 'Registrarse'))}
          </button>
        </form>

        <div className="mt-6 text-center">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-gray-600 flex items-center justify-center w-full hover:text-vandora-emerald focus:outline-none"
            >
              &larr; Volver a iniciar sesión
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
