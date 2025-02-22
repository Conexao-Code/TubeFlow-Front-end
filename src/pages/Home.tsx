import React, { useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Sparkles, Youtube, Users, Target, BarChart, MessageSquare, PlaySquare, TrendingUp, Zap, Check, MonitorPlay, Briefcase, BarChart as ChartBar, Rocket, Mail, Phone, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

type BillingPeriodKey = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

type BillingPeriod = {
  type: string; 
  label: string;
  price: number;
  discount: number;
  savings?: number;
};

const BILLING_PERIODS: Record<BillingPeriodKey, BillingPeriod> = {
  MONTHLY: {
    type: 'monthly', // Agora está válido
    label: 'Mensal',
    price: 297,
    discount: 0
  },
  QUARTERLY: {
    type: 'quarterly',
    label: 'Trimestral',
    price: 267,
    discount: 10,
    savings: 90
  },
  ANNUAL: {
    type: 'annual',
    label: 'Anual',
    price: 237,
    discount: 20,
    savings: 720
  }
};

const features = [
  {
    icon: Youtube,
    title: 'Gestão de Canais',
    description: 'Gerencie até 10 canais do YouTube de forma centralizada e eficiente.'
  },
  {
    icon: Users,
    title: 'Equipe de Freelancers',
    description: 'Coordene uma equipe de até 20 freelancers com facilidade e organização.'
  },
  {
    icon: MonitorPlay,
    title: 'Fluxo de Produção',
    description: 'Organize todo o processo de criação e publicação de conteúdo.'
  },
  {
    icon: ChartBar,
    title: 'Analytics Avançado',
    description: 'Acompanhe métricas e resultados em tempo real de todos os canais.'
  }
];

const stats = [
  { value: '10+', label: 'Canais Gerenciados' },
  { value: '20+', label: 'Freelancers' },
  { value: '24/7', label: 'Suporte Dedicado' },
  { value: '100%', label: 'Foco em YouTube' }
];

const planHighlights = [
  {
    icon: Youtube,
    title: '10 Canais',
    description: 'Gerencie múltiplos canais do YouTube em uma única plataforma'
  },
  {
    icon: Users,
    title: '20 Freelancers',
    description: 'Equipe completa para produção de conteúdo'
  },
  {
    icon: ChartBar,
    title: 'Analytics',
    description: 'Métricas detalhadas e relatórios em tempo real'
  },
  {
    icon: Rocket,
    title: 'Suporte 24/7',
    description: 'Assistência dedicada para sua equipe'
  }
];

function App() {
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView({ triggerOnce: true });
  const [statsRef, statsInView] = useInView({ triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true });
  const [planRef, planInView] = useInView({ triggerOnce: true });
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriodKey>('MONTHLY');

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre a gestão de canais do YouTube.', '_blank');
  };

  const handlePayment = () => {
    navigate('/payment', {
      state: {
        plan: {
          type: 'annual', // Garanta o type correto
          period: 'annual',
          price: 237,
          label: 'Anual'
        }
      }
    });
};

const activePlan = BILLING_PERIODS[selectedPeriod];

return (
  <div className="bg-white">
    <Header />
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />

    {/* Hero Section */}
    <section
      ref={heroRef}
      className="pt-32 pb-24 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-blue-100/30 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center gap-4 mb-8">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Gestão de YouTube
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Resultados Reais
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900"
          >
            Gerencie seus
            <span className="block text-blue-600">Canais do YouTube</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Simplifique a gestão dos seus canais do YouTube e equipe de freelancers com a plataforma mais completa do mercado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Comece Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Stats Section */}
    <section
      ref={statsRef}
      className="py-24 bg-blue-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section
      id="features"
      ref={featuresRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Recursos Exclusivos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tudo que você precisa para gerenciar seus canais do YouTube e equipe de freelancers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-blue-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Plan Section */}
    <section
      id="plan"
      ref={planRef}
      className="py-24 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={planInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plano Profissional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tudo que você precisa em um único plano
          </p>
        </motion.div>

        {/* Billing Period Selector */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-2 rounded-xl shadow-md inline-flex gap-2">
            {Object.entries(BILLING_PERIODS).map(([key, period]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as BillingPeriodKey)}
                className={`px-6 py-3 rounded-lg transition-all relative ${selectedPeriod === key
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {selectedPeriod === key && (
                  <motion.div
                    layoutId="billingPeriodBackground"
                    className="absolute inset-0 bg-blue-600 rounded-lg"
                    style={{ zIndex: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{period.label}</span>
                {period.discount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    -{period.discount}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={planInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="relative">
              <motion.div
                key={selectedPeriod}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-bold text-blue-600"
              >
                R$ {activePlan.price}
              </motion.div>
              <div className="text-xl text-gray-600 mt-2">
                por mês
                {selectedPeriod !== 'MONTHLY' && (
                  <span className="text-green-600 ml-2">
                    (economia de R$ {activePlan.savings}/ano)
                  </span>
                )}
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-medium">
                Sem Fidelidade
              </div>
            </div>

            <div className="grid gap-4">
              {planHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={planInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <highlight.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{highlight.title}</h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg flex items-center justify-center gap-2"
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={planInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-blue-100">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2100&q=80"
                alt="Dashboard"
                className="w-full rounded-xl shadow-lg mb-8"
              />
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Dashboard personalizado</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Relatórios detalhados</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Suporte prioritário</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Contact Section */}
    <section id="contact" className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500 bg-opacity-20 text-white mb-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            Suporte 24/7
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para Revolucionar
            <span className="block text-blue-200">seus Canais do YouTube?</span>
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-12">
            Converse agora mesmo com nossa equipe especializada e descubra como podemos transformar seus canais
          </p>

          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-3 px-6 py-4 md:px-8 md:py-6 bg-[#25D366] text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#1ea952] hover:shadow-lg"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-base md:text-lg">Iniciar Conversa no WhatsApp</span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <p className="mt-6 text-blue-200 text-sm">
            Resposta em até 5 minutos durante horário comercial
          </p>
        </div>
      </div>
    </section>
  </div>
);
}

export default App;