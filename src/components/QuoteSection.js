import React, { useState, useEffect } from 'react';

function QuoteSection() {
  const [quote, setQuote] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const quotes = [
    "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    "Productivity is not about being busy. It's about being present and purposeful.",
    "Small steps every day lead to big changes over time. Be patient with your progress.",
    "You are capable of amazing things. Start where you are, use what you have, do what you can.",
    "Wellness is the complete integration of body, mind, and spirit. Start your journey today."
  ];

  useEffect(() => {
    // Select a random quote on component mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed font-sans">
            "{quote}"
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default QuoteSection;
