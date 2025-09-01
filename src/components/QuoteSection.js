import React, { useState, useEffect, useCallback } from 'react';

function QuoteSection() {
  const [quote, setQuote] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const quotes = useCallback(() => [
    "Take a deep breath. You're exactly where you need to be right now.",
    "In the midst of chaos, find your inner peace. Your calm is your superpower.",
    "Small moments of mindfulness create a lifetime of wellness.",
    "You don't have to be perfect to be amazing. Progress over perfection.",
    "Your mental space is sacred. Protect it, nurture it, and watch it flourish."
  ], []);

  useEffect(() => {
    // Select a random quote on component mount
    const quotesArray = quotes();
    const randomQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];
    setQuote(randomQuote);
    
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [quotes]);

  return (
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 transition-colors duration-200 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed font-sans">
            "{quote}"
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default QuoteSection;
