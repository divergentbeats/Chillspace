import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteSection from './components/QuoteSection';
import SessionCard from './components/SessionCard';
import FeatureGrid from './components/FeatureGrid';
import ProductivityMode from './components/ProductivityMode';
import HabitTracker from './components/HabitTracker';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';
import ParticlesBg from 'particles-bg';

function AppContent() {
  const { isDarkMode } = useTheme();
  const particleColor = isDarkMode ? '#FFFFFF' : '#a855f7';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ParticlesBg type="lines" color={particleColor} num={isDarkMode ? 60 : 40} bg={true} />
      <Navbar />
      {/* Each section is given an ID to act as a scroll target */}
      <Hero />
      <QuoteSection />
      <SessionCard />
      <div id="features">
        <FeatureGrid />
      </div>
      <div id="productivity">
        <ProductivityMode />
      </div>
      <div id="habits">
        <HabitTracker />
      </div>
      <div id="coming-soon">
        <ComingSoon />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
