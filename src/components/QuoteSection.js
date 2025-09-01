import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Quote } from 'lucide-react';
import quotes from '../data/quotes';

function QuoteSection() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    setQuote(randomQuote.text);
    setAuthor(randomQuote.author);
  }, []);

  useEffect(() => {
    // Select a random quote on component mount
    getRandomQuote();
  }, [getRandomQuote]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div id="quotes" className="bg-gradient-to-r from-pastel-blue-50 to-pastel-purple-50 dark:from-pastel-neutral-900 dark:to-pastel-neutral-800 transition-colors duration-200 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text dark:gradient-text-dark mb-6 font-sans"
          >
            Daily Inspiration
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-pastel-neutral-600 dark:text-pastel-neutral-300 font-sans"
          >
            Discover wisdom that resonates with your soul
          </motion.p>
        </motion.div>

        {/* Quote Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="card-base card-hover p-8 md:p-12"
        >
          <div className="text-center relative">
            {/* Decorative quote marks */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="text-6xl text-pastel-purple-200 dark:text-pastel-purple-700 font-serif">"</div>
            </div>
            
            {/* Quote Icon */}
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue-500 to-pastel-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
                <Quote className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            {/* Quote Text */}
            <AnimatePresence mode="wait">
              <motion.blockquote 
                key={quote}
                variants={quoteVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-3xl md:text-4xl lg:text-5xl font-medium text-pastel-neutral-800 dark:text-pastel-neutral-100 leading-relaxed font-serif italic mb-10 relative z-10"
              >
                {quote}
              </motion.blockquote>
            </AnimatePresence>
            
            {/* Author */}
            <motion.cite 
              variants={itemVariants}
              className="text-xl md:text-2xl text-pastel-neutral-600 dark:text-pastel-neutral-400 font-sans not-italic block"
            >
              — {author}
            </motion.cite>
          </div>
          
          {/* New Quote Button */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={getRandomQuote}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 text-white font-semibold py-5 px-10 rounded-2xl transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              <RefreshCw className="w-6 h-6" />
              New Quote
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuoteSection;
