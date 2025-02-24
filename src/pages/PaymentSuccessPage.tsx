import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, CreditCard, Shield, Download } from 'lucide-react';
import Confetti from 'react-confetti';

interface PaymentSuccessState {
  paymentId: string;
  amount: number;
  plan: string;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Log inicial do estado da localização
  console.log('[PaymentSuccessPage] Location state:', location.state);

  // Efeito para debug do estado
  useEffect(() => {
    console.log('[PaymentSuccessPage] State after initialization:', {
      paymentId: location.state?.paymentId,
      amount: location.state?.amount,
      plan: location.state?.plan
    });
  }, []);

  // Dados com fallbacks e validação
  const paymentData = {
    paymentId: location.state?.paymentId || '',
    amount: location.state?.amount || 0,
    plan: location.state?.plan || ''
  };

  console.log('[PaymentSuccessPage] Processed payment data:', paymentData);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    const confettiTimer = setTimeout(() => {
      console.log('[PaymentSuccessPage] Confetti disabled after 5 seconds');
      setShowConfetti(false);
    }, 5000);

    return () => {
      console.log('[PaymentSuccessPage] Cleanup effects');
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  useEffect(() => {
    console.log('[PaymentSuccessPage] Checking payment ID existence');
    if (!location.state?.paymentId) {
      console.warn('[PaymentSuccessPage] No payment ID - redirecting to home');
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const formatPlanType = (type: string) => {
    console.log('[PaymentSuccessPage] Formatting plan type:', type);
    
    const plans = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };

    const formatted = plans[type.toLowerCase() as keyof typeof plans] || type;
    console.log('[PaymentSuccessPage] Formatted plan result:', formatted);
    return formatted;
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

  // Verificação detalhada dos dados
  if (!location.state?.paymentId) {
    console.error('[PaymentSuccessPage] Missing critical payment data:', {
      state: location.state,
      path: location.pathname,
      search: location.search
    });
    return null;
  }

  // Validação adicional do amount
  if (typeof paymentData.amount !== 'number' || isNaN(paymentData.amount)) {
    console.error('[PaymentSuccessPage] Invalid amount value:', paymentData.amount);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro no processamento</h1>
          <p className="text-gray-600 mb-4">
            Valor do pagamento inválido. Por favor entre em contato com o suporte.
          </p>
          <p className="text-sm text-gray-500">
            ID da transação: {paymentData.paymentId}
          </p>
        </div>
      </div>
    );
  }

  console.log('[PaymentSuccessPage] Rendering component');

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
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">Valor pago</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {paymentData.amount?.toFixed(2) || '0,00'}
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

        <motion.div
          className="text-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => {
              console.log('[PaymentSuccessPage] Navigating to dashboard');
              navigate('/dashboard');
            }}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Acessar minha conta
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>

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