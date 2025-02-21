import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Youtube, Play, Triangle } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navItems = [
    { name: 'Início', href: '#' },
    { name: 'Recursos', href: '#features' },
    { name: 'Plano', href: '#plan' },
    { name: 'Contato', href: '#contact' }
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' }
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-2xl font-bold"
            >
              <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
              <Triangle className="w-6 h-6 text-blue-600 fill-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">TubeFlow</h1>

            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </motion.a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Começar Agora
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { height: 'auto', opacity: 1 },
          closed: { height: 0, opacity: 0 }
        }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden bg-white"
      >
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileTap={{ scale: 0.95 }}
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </motion.a>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full px-3 py-2 mt-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Começar Agora
          </motion.button>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;