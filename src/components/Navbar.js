import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'features', label: 'Features' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'coming-soon', label: 'Coming Soon' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/80 dark:bg-pastel-neutral-900/90 backdrop-blur-md shadow-soft border-b border-pastel-neutral-100 dark:border-pastel-neutral-800 transition-colors duration-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <div className="h-10 w-10 bg-gradient-to-br from-pastel-blue-500 to-pastel-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => scrollToSection(item.id)}
                  className="relative text-pastel-neutral-700 dark:text-pastel-neutral-200 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-300 group"
                >
                  {item.label}
                  {/* Animated underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-pastel-neutral-100 dark:bg-pastel-neutral-800 text-pastel-neutral-600 dark:text-pastel-neutral-300 hover:bg-pastel-blue-100 dark:hover:bg-pastel-blue-900/30 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 transition-all duration-300 shadow-soft"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                // Sun icon for dark mode
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for light mode
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-pastel-neutral-500 dark:text-pastel-neutral-400 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 p-2 transition-colors rounded-xl hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-800"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
