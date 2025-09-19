import React from 'react';
import { motion } from 'framer-motion';

function Hero() {
  const scrollToQuotes = () => {
    const quotesSection = document.getElementById('quotes');
    if (quotesSection) {
      quotesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const navbarHeight = 64; // Height of the navbar (h-16 = 4rem = 64px)
      const elementPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset;
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
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <div id="hero" className="relative bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 overflow-hidden min-h-screen flex items-center">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-pastel-purple-200 dark:bg-pastel-purple-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pastel-blue-200 dark:bg-pastel-blue-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-40 left-40 w-80 h-80 bg-pastel-green-200 dark:bg-pastel-green-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-pastel-neutral-800 dark:text-pastel-neutral-100 mb-6 leading-tight font-sans"
          >
            Welcome to
            <span className="block gradient-text dark:gradient-text-dark">
              Chillspace
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl lg:text-3xl text-pastel-neutral-600 dark:text-pastel-neutral-300 max-w-4xl mx-auto mb-12 leading-relaxed font-sans"
          >
            Your calm corner for quotes, focus, and positivity.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.button 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={scrollToQuotes}
              className="bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 text-white font-semibold py-5 px-10 rounded-2xl text-xl transition-all duration-300 shadow-glow hover:shadow-glow-lg transform"
            >
              Explore Quotes
            </motion.button>
            
            <motion.button 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={scrollToFeatures}
              className="border-2 border-pastel-blue-500 dark:border-pastel-blue-400 text-pastel-blue-600 dark:text-pastel-blue-400 hover:bg-pastel-blue-500 hover:text-white font-semibold py-5 px-10 rounded-2xl text-xl transition-all duration-300 transform shadow-soft hover:shadow-glow"
            >
              Start Your Journey
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;
