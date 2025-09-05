import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (item) => {
    setIsOpen(false); // Close mobile menu on navigation

    if (item.isRoute) {
      // Navigate to route
      window.location.href = `/${item.id}`;
    } else {
      // Smooth scroll to section
      const element = document.getElementById(item.id);
      if (element) {
        const navbarHeight = 64; // Height of the navbar (h-16 = 4rem = 64px)
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        // Use requestAnimationFrame for smoother scrolling
        const scrollTo = (targetY) => {
          const startY = window.pageYOffset;
          const distance = targetY - startY;
          const duration = 800; // ms
          let startTime = null;

          const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeInOutQuad(progress);

            window.scrollTo(0, startY + distance * easeProgress);

            if (progress < 1) {
              requestAnimationFrame(animation);
            }
          };

          requestAnimationFrame(animation);
        };

        scrollTo(offsetPosition);
      }
    }
  };



  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'features', label: 'Features' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'habits', label: 'Habits' },
    { id: 'vent', label: 'Venting Venue', isRoute: true },
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
            className="flex-shrink-0 p-1"
          >
            <img
              src="/logo.png"
              alt="Chillspace Logo"
              className="h-10 w-auto object-contain"
            />
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => handleNavigation(item)}
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
            {user ? (
              <motion.button
                key="logout"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="relative text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 px-3 py-2 text-sm font-medium transition-colors duration-300"
              >
                Logout
              </motion.button>
            ) : (
              <>
                <motion.button
                  key="login"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    window.location.href = '/login';
                    setIsOpen(false);
                  }}
                  className="relative text-pastel-blue-600 hover:text-pastel-blue-700 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Login
                </motion.button>
                <motion.button
                  key="signup"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (navItems.length + 1) * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    window.location.href = '/signup';
                    setIsOpen(false);
                  }}
                  className="relative text-pastel-blue-600 hover:text-pastel-blue-700 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Sign Up
                </motion.button>
              </>
            )}
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
                onClick={() => setIsOpen(!isOpen)}
                className="text-pastel-neutral-500 dark:text-pastel-neutral-400 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 p-2 transition-colors rounded-xl hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-800"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Hamburger Icon */}
                  <path className={!isOpen ? 'block' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  {/* Close Icon */}
                  <path className={isOpen ? 'block' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className="block w-full text-left text-pastel-neutral-700 dark:text-pastel-neutral-200 hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-800 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
              Logout
            </button>
          ) : (
            <>
              <button onClick={() => { window.location.href = '/login'; setIsOpen(false); }} className="block w-full text-left text-pastel-blue-600 hover:text-pastel-blue-700 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-800 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Login
              </button>
              <button onClick={() => { window.location.href = '/signup'; setIsOpen(false); }} className="block w-full text-left text-pastel-blue-600 hover:text-pastel-blue-700 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-800 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Sign Up
              </button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;

