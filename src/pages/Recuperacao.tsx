import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Triangle, ArrowLeft, Mail, Check, AlertTriangle } from 'lucide-react';

type Notification = {
  type: 'success' | 'error';
  message: string;
};

function Recuperacao() {
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setNotification({ type: 'error', message: 'Por favor, insira seu e-mail' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setNotification({ type: 'error', message: 'Por favor, insira um e-mail válido' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('apitubeflow.conexaocode.com/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: data.message });
        localStorage.setItem('recoveryEmail', email);
        setTimeout(() => navigate('/codigo'), 1500); 
      } else {
        setNotification({ type: 'error', message: data.message || 'Erro ao enviar o código.' });
      }
    } catch (error) {
      console.error('Erro na solicitação:', error);
      setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
        <Triangle className="w-8 h-8 text-blue-600 fill-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">TubeFlow</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h1>
          <p className="text-gray-600">Digite seu e-mail para receber um código de recuperação</p>
        </div>

        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu e-mail"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-2 px-4 rounded-lg text-white font-medium
              transition-colors duration-200
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <a href="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default Recuperacao;
