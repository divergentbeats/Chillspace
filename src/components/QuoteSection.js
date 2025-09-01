import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Quote } from 'lucide-react';

function QuoteSection() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const quotes = useCallback(() => [
    { text: "Take a deep breath. You're exactly where you need to be right now.", author: "Mindful Living" },
    { text: "In the midst of chaos, find your inner peace. Your calm is your superpower.", author: "Zen Wisdom" },
    { text: "Small moments of mindfulness create a lifetime of wellness.", author: "Wellness Journey" },
    { text: "You don't have to be perfect to be amazing. Progress over perfection.", author: "Growth Mindset" },
    { text: "Your mental space is sacred. Protect it, nurture it, and watch it flourish.", author: "Self-Care Guide" },
    { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Daily Inspiration" },
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Calm mind brings inner strength and self-confidence.", author: "Dalai Lama" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" }
  ], []);

  const getRandomQuote = useCallback(() => {
    const quotesArray = quotes();
    const randomIndex = Math.floor(Math.random() * quotesArray.length);
    const randomQuote = quotesArray[randomIndex];
    setQuote(randomQuote.text);
    setAuthor(randomQuote.author);
    setIsVisible(false);
    
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100);
  }, [quotes]);

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
