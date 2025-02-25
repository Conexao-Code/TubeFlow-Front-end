import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  Shield, 
  Download,
  Building2,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Confetti from 'react-confetti';

interface PaymentSuccessState {
  paymentId: string;
  amount: number | string;
  plan: string;
}

interface RegistrationData {
  email: string;
  companyName: string;
  password: string;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    companyName: '',
    password: ''
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Função para conversão segura de valores monetários
  const safeParseAmount = (value: any): number => {
    try {
      if (typeof value === 'string') {
        const cleanedValue = value
          .replace(/[^0-9.,]/g, '')
          .replace(',', '.');
        const parsedValue = parseFloat(cleanedValue);
        return Number(parsedValue.toFixed(2));
      }
      return Number(Number(value).toFixed(2));
    } catch (error) {
      console.error('[PaymentSuccessPage] Erro na conversão do valor:', error);
      return 0;
    }
  };

  // Processamento dos dados recebidos
  const paymentData = {
    paymentId: location.state?.paymentId || '',
    amount: safeParseAmount(location.state?.amount),
    plan: location.state?.plan || ''
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Simula verificação da API para conta existente
    const checkAccount = setTimeout(() => {
      setIsLoading(false);
      setHasAccount(false); // Será substituído pela chamada real da API
    }, 2000);

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(checkAccount);
      clearTimeout(confettiTimer);
    };
  }, []);

  useEffect(() => {
    if (!paymentData.paymentId) {
      navigate('/', { replace: true });
    }
  }, [paymentData.paymentId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simula chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Será substituído pela integração real com a API
      console.log('Dados de registro:', registrationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      setIsLoading(false);
    }
  };

  const formatPlanType = (type: string) => {
    const planNames: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return planNames[type.toLowerCase()] || type;
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
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

  // Validação completa dos dados
  if (!paymentData.paymentId || isNaN(paymentData.amount) || paymentData.amount <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erro no processamento do pagamento
          </h1>
          
          <div className="text-left mb-4">
            <p className="text-gray-600">
              <strong>ID da Transação:</strong> {paymentData.paymentId || 'Não informado'}
            </p>
            <p className="text-gray-600">
              <strong>Valor Recebido:</strong> {location.state?.amount?.toString() || 'Não informado'}
            </p>
            <p className="text-gray-600">
              <strong>Valor Convertido:</strong> {paymentData.amount}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando sua conta...</p>
        </motion.div>
      </div>
    );
  }

  if (hasAccount === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conta Encontrada!
          </h2>
          <p className="text-gray-600 mb-8">
            Detectamos que você já possui uma conta. Por favor, faça login para continuar.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Fazer Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Formatação monetária profissional
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(paymentData.amount);

  // Formulário de registro para novos usuários
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
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
        className="max-w-xl mx-auto"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pagamento Confirmado!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Plano {formatPlanType(paymentData.plan)}
          </p>
          <p className="text-2xl font-bold text-green-600 mb-8">
            {formattedAmount}
          </p>
          <p className="text-gray-600">
            Para começar a usar sua conta, precisamos de algumas informações
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={formVariants}
        >
          <div className="space-y-6">
            <motion.div variants={inputVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={registrationData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </motion.div>

            <motion.div variants={inputVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="companyName"
                  required
                  value={registrationData.companyName}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Nome da sua empresa"
                />
              </div>
            </motion.div>

            <motion.div variants={inputVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={registrationData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-12 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Escolha uma senha segura"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          <motion.button
            type="submit"
            className="mt-8 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Criar minha conta
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </motion.button>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-blue-50"
                variants={inputVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.form>

        <motion.div
          className="mt-8 text-center text-sm text-gray-500"
          variants={formVariants}
        >
          <p>
            Ao criar sua conta, você concorda com nossos{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
            <CreditCard className="h-4 w-4" />
            <span>Pagamento processado com segurança</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;