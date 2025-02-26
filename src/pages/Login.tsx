import React, { useState } from 'react';
import { Eye, EyeOff, Play, Triangle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import VerificationModal from '../components/VerificationModal';

type VerificationType = 'userExists' | 'passwordValid' | 'companyLink' | 'companyActive' | 'subscriptionValid';

interface VerificationState {
  type: VerificationType;
  status: 'loading' | 'success' | 'error';
  message: string;
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [currentVerification, setCurrentVerification] = useState<VerificationState | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setCurrentVerification({
      type: 'userExists',
      status: 'loading',
      message: 'Verificando existência do usuário...'
    });

    try {
      const response = await fetch('https://apitubeflow.conexaocode.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        handleLoginError(data);
        return;
      }

      handleLoginSuccess(data);
      navigate('/dashboard');

    } catch (error) {
      handleNetworkError(error);
    }
  };

  const handleLoginError = (data: any) => {
    let type: VerificationType = 'userExists';
    let message = data.message || 'Erro no login';

    switch(data.message) {
      case 'Empresa inativa.':
        type = 'companyActive';
        break;
      case 'Assinatura da empresa expirada.':
        type = 'subscriptionValid';
        break;
      case 'Usuário não vinculado a uma empresa válida.':
        type = 'companyLink';
        break;
      default:
        if (data.message.includes('senha')) type = 'passwordValid';
    }

    setCurrentVerification({
      type,
      status: 'error',
      message
    });
  };

  const handleLoginSuccess = (data: any) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('isFreelancer', data.isFreelancer.toString());
    localStorage.setItem('companyId', data.companyId.toString());

    if (data.isFreelancer) {
      localStorage.setItem('userId', data.id);
    } else {
      localStorage.setItem('userIdA', data.id);
    }
  };

  const handleNetworkError = (error: any) => {
    console.error('Erro na solicitação de login:', error);
    toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
    setCurrentVerification(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <ToastContainer />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-200/30 rounded-full blur-3xl" />
      </div>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center gap-2">
          <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
          <Triangle className="w-8 h-8 text-blue-600 fill-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">TubeFlow</h1>
        </div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Bem-vindo à TubeFlow
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Entrar
            </button>

            <div className="mt-8 text-center">
              <a
                href="/recuperacao"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </form>
        </div>
      </div>

      <VerificationModal
        isOpen={currentVerification !== null}
        onClose={() => setCurrentVerification(null)}
        type={currentVerification?.type || 'userExists'}
        status={currentVerification?.status || 'loading'}
        message={currentVerification?.message}
      />
    </div>
  );
}

export default LoginPage;