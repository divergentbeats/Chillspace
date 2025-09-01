import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import quotes from '../data/quotes';

function QuoteSection() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    setQuote(randomQuote.text);
    setAuthor(randomQuote.author);
    setIsVisible(false);
    
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    // Select a random quote on component mount
    getRandomQuote();
  }, [getRandomQuote]);

  return (
    <div data-section="quotes" className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 transition-colors duration-200 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 font-sans">
            Daily Inspiration
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-sans">
            Discover wisdom that resonates with your soul
          </p>
        </div>

        {/* Quote Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center">
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Quote Text */}
            <blockquote className={`text-3xl md:text-4xl font-medium text-gray-800 dark:text-white leading-relaxed font-serif italic mb-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              "{quote}"
            </blockquote>
            
            {/* Author */}
            <cite className="text-lg text-gray-600 dark:text-gray-400 font-sans not-italic">
              — {author}
            </cite>
          </div>
          
          {/* New Quote Button */}
          <div className="text-center mt-10">
            <button
              onClick={getRandomQuote}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              New Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteSection;
