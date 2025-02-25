import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  Shield, 
  Download, 
  User, 
  Lock, 
  Mail,
  Loader2
} from 'lucide-react';
import Confetti from 'react-confetti';

interface PaymentSuccessState {
  paymentId: string;
  amount: number | string;
  plan: string;
  userEmail?: string;
}

interface UserCheckResponse {
  isRegistered: boolean;
  exists: boolean;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Processamento seguro dos dados recebidos
  const paymentData = {
    paymentId: location.state?.paymentId || '',
    amount: location.state?.amount || 0,
    plan: location.state?.plan || '',
    userEmail: location.state?.userEmail || ''
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (!paymentData.userEmail) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://apitubeflow.conexaocode.com/api/users/check?email=${encodeURIComponent(paymentData.userEmail)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) throw new Error('Falha na verificação do usuário');
        
        const data: UserCheckResponse = await response.json();
        setIsRegistered(data.isRegistered || data.exists);
      } catch (error) {
        console.error('Erro ao verificar status do usuário:', error);
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [paymentData.userEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!formData.name.trim()) {
      errors.push('Nome completo é obrigatório');
    }

    if (!passwordRegex.test(formData.password)) {
      errors.push('Senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('As senhas não coincidem');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch(
        'https://apitubeflow.conexaocode.com/api/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...formData,
            email: paymentData.userEmail,
            paymentId: paymentData.paymentId,
            plan: paymentData.plan
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no registro');
      }

      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsRegistered(true);
      setFormErrors([]);
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : 'Erro desconhecido ao criar conta']);
    }
  };

  const safeParseAmount = (value: any): number => {
    try {
      if (typeof value === 'string') {
        const cleanedValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        return parseFloat(cleanedValue);
      }
      return Number(value);
    } catch (error) {
      console.error('Erro na conversão do valor:', error);
      return 0;
    }
  };

  const formatPlanType = (type: string) => {
    const plans: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return plans[type.toLowerCase()] || type;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Acesso Imediato',
      description: 'Comece a usar agora mesmo todos os recursos premium'
    },
    {
      icon: Shield,
      title: 'Garantia de 7 dias',
      description: 'Não ficou satisfeito? Devolvemos seu dinheiro'
    },
    {
      icon: Download,
      title: 'Suporte Premium',
      description: 'Atendimento prioritário 24/7 para você'
    }
  ];

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(safeParseAmount(paymentData.amount));

  if (!paymentData.paymentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento não identificado
          </h1>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.div
            className="inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pagamento Confirmado!
          </h1>
          <p className="text-xl text-gray-600">
            Seu plano {formatPlanType(paymentData.plan)} foi ativado com sucesso
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          variants={itemVariants}
        >
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Detalhes do Pagamento
                </h2>
                <p className="text-gray-600">
                  ID da transação: {paymentData.paymentId}
                </p>
                {paymentData.userEmail && (
                  <p className="text-gray-600 mt-2">
                    Email vinculado: {paymentData.userEmail}
                  </p>
                )}
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">Valor pago</p>
                <p className="text-3xl font-bold text-green-600">
                  {formattedAmount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-blue-50"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Verificando seu status...</p>
          </div>
        ) : (
          <div className="mt-8">
            {isRegistered ? (
              <motion.div
                className="text-center space-y-4"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Acessar minha conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <p className="text-gray-600">
                  Você será redirecionado automaticamente em 5 segundos...
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg mt-8 max-w-md mx-auto"
                variants={itemVariants}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Complete seu cadastro
                </h2>
                
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Crie uma senha segura"
                      />
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirme sua senha
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Repita sua senha"
                      />
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {formErrors.length > 0 && (
                    <div className="text-red-500 text-sm space-y-1">
                      {formErrors.map((error, index) => (
                        <p key={index} className="flex items-center gap-1">
                          <span>•</span>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Criar conta e acessar
                  </button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-600">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <a
                    href="/terms"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Termos de Serviço
                  </a>
                </p>
              </motion.div>
            )}
          </div>
        )}

        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-500">
            Um e-mail com os detalhes da sua compra foi enviado para você
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-400">
            <CreditCard className="h-4 w-4" />
            <span>Pagamento processado com segurança pelo Mercado Pago</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;