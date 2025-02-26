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

function App() {
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
        if (data.message === 'Empresa inativa.') {
          setCurrentVerification({
            type: 'companyActive',
            status: 'error',
            message: data.message
          });
        } else if (data.message === 'Assinatura da empresa expirada.') {
          setCurrentVerification({
            type: 'subscriptionValid',
            status: 'error',
            message: data.message
          });
        } else if (data.message === 'Usuário não vinculado a uma empresa válida.') {
          setCurrentVerification({
            type: 'companyLink',
            status: 'error',
            message: data.message
          });
        } else {
          setCurrentVerification({
            type: 'userExists',
            status: 'error',
            message: data.message || 'Erro no login'
          });
        }
        return;
      }

      setCurrentVerification({
        type: 'userExists',
        status: 'success',
        message: 'Usuário encontrado!'
      });

      setTimeout(() => {
        setCurrentVerification({
          type: 'passwordValid',
          status: 'loading',
          message: 'Validando senha...'
        });
      }, 1000);

      if (!data.token) {
        setCurrentVerification({
          type: 'passwordValid',
          status: 'error',
          message: 'Senha incorreta.'
        });
        return;
      }

      setCurrentVerification({
        type: 'passwordValid',
        status: 'success',
        message: 'Senha válida!'
      });

      if (!data.isFreelancer) {
        setTimeout(() => {
          setCurrentVerification({
            type: 'companyLink',
            status: 'loading',
            message: 'Verificando vínculo empresarial...'
          });
        }, 1000);

        if (!data.companyId) {
          setCurrentVerification({
            type: 'companyLink',
            status: 'error',
            message: 'Usuário não vinculado a uma empresa.'
          });
          return;
        }

        setCurrentVerification({
          type: 'companyLink',
          status: 'success',
          message: 'Empresa vinculada!'
        });

        setTimeout(() => {
          setCurrentVerification({
            type: 'companyActive',
            status: 'loading',
            message: 'Verificando status da empresa...'
          });
        }, 1000);

        if (!data.companyActive) {
          setCurrentVerification({
            type: 'companyActive',
            status: 'error',
            message: 'Empresa inativa.'
          });
          return;
        }

        setCurrentVerification({
          type: 'companyActive',
          status: 'success',
          message: 'Empresa ativa!'
        });

        setTimeout(() => {
          setCurrentVerification({
            type: 'subscriptionValid',
            status: 'loading',
            message: 'Verificando assinatura...'
          });
        }, 1000);

        if (!data.subscriptionValid) {
          setCurrentVerification({
            type: 'subscriptionValid',
            status: 'error',
            message: 'Assinatura expirada.'
          });
          return;
        }

        setCurrentVerification({
          type: 'subscriptionValid',
          status: 'success',
          message: 'Assinatura válida!'
        });
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('isFreelancer', data.isFreelancer.toString());
      localStorage.setItem('companyId', data.companyId);

      if (data.isFreelancer) {
        localStorage.setItem('userId', data.id);
      } else {
        localStorage.setItem('userIdA', data.id);
      }

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Erro na solicitação de login:', error);
      toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
      setCurrentVerification(null);
    }
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
                E-mail ou nome de usuário
              </label>
              <input
                type="text"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Digite seu e-mail ou nome de usuário"
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
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
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

export default App;