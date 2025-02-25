import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, CreditCard, Shield, Download } from 'lucide-react';
import Confetti from 'react-confetti';

interface PaymentSuccessState {
  paymentId: string;
  amount: number | string;
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

  // Função para conversão segura de valores monetários
  const safeParseAmount = (value: any): number => {
    try {
      // Se o valor for string, faz tratamento especial
      if (typeof value === 'string') {
        // Remove caracteres não numéricos exceto pontos e vírgulas
        const cleanedValue = value
          .replace(/[^0-9.,]/g, '')
          .replace(',', '.'); // Uniformiza separador decimal
        
        // Converte para float com precisão de 2 casas decimais
        const parsedValue = parseFloat(cleanedValue);
        return Number(parsedValue.toFixed(2));
      }
      
      // Se já for número, converte diretamente
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

  // Logs de depuração
  console.log('[PaymentSuccessPage] Estado inicial:', location.state);
  console.log('[PaymentSuccessPage] Dados processados:', paymentData);

  useEffect(() => {
    console.log('[PaymentSuccessPage] Efeito de montagem - Dados recebidos:', {
      paymentId: location.state?.paymentId,
      amount: location.state?.amount,
      plan: location.state?.plan
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    const confettiTimer = setTimeout(() => {
      console.log('[PaymentSuccessPage] Desativando confetes após 5 segundos');
      setShowConfetti(false);
    }, 5000);

    return () => {
      console.log('[PaymentSuccessPage] Limpeza de efeitos');
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  useEffect(() => {
    console.log('[PaymentSuccessPage] Verificando ID do pagamento');
    if (!paymentData.paymentId) {
      console.warn('[PaymentSuccessPage] ID de pagamento ausente - Redirecionando');
      navigate('/', { replace: true });
    }
  }, [paymentData.paymentId, navigate]);

  const formatPlanType = (type: string) => {
    const planNames: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return planNames[type.toLowerCase()] || type;
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

  // Validação completa dos dados
  if (!paymentData.paymentId || isNaN(paymentData.amount) || paymentData.amount <= 0) {
    console.error('[PaymentSuccessPage] Dados inválidos:', {
      paymentIdValid: !!paymentData.paymentId,
      amountValid: !isNaN(paymentData.amount) && paymentData.amount > 0,
      originalAmount: location.state?.amount
    });

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

  // Formatação monetária profissional
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(paymentData.amount);

  console.log('[PaymentSuccessPage] Renderizando componente principal');

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

        <motion.div
          className="text-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => {
              console.log('[PaymentSuccessPage] Navegando para o dashboard');
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