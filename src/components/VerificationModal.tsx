import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, XCircle, Building2, Calendar } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'userExists' | 'passwordValid' | 'companyLink' | 'companyActive' | 'subscriptionValid';
  status: 'loading' | 'success' | 'error';
  message?: string;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const icons = {
  userExists: AlertCircle,
  passwordValid: AlertCircle,
  companyLink: Building2,
  companyActive: Building2,
  subscriptionValid: Calendar,
};

const titles = {
  userExists: 'Verificação de Usuário',
  passwordValid: 'Validação de Senha',
  companyLink: 'Vínculo Empresarial',
  companyActive: 'Status da Empresa',
  subscriptionValid: 'Validade da Assinatura',
};

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  status,
  message,
}) => {
  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="relative p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-blue-50">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {titles[type]}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-4 rounded-lg ${
                    status === 'loading' ? 'bg-gray-50' :
                    status === 'success' ? 'bg-green-50' :
                    status === 'error' ? 'bg-red-50' : ''
                  }`}>
                    {status === 'loading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                    )}
                    {status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-sm ${
                      status === 'loading' ? 'text-gray-600' :
                      status === 'success' ? 'text-green-600' :
                      status === 'error' ? 'text-red-600' : ''
                    }`}>
                      {message || 'Verificando...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerificationModal;