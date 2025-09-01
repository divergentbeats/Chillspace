import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import QuoteSection from './components/QuoteSection';
import SessionCard from './components/SessionCard';
import FeatureGrid from './components/FeatureGrid';
import ProductivityMode from './components/ProductivityMode';
import HabitTracker from './components/HabitTracker';
import Hero from './components/Hero';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <Navbar />
        <QuoteSection />
        <SessionCard />
        <FeatureGrid />
        <ProductivityMode />
        <HabitTracker />
        <Hero />
      </div>
    </ThemeProvider>
  );
}

export default App;
