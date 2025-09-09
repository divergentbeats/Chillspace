import React from 'react';
import { motion } from 'framer-motion';

const LoginBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
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
  );
};

export default LoginBackground;
