import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteSection from './components/QuoteSection';
import SessionCard from './components/SessionCard';
import FeatureGrid from './components/FeatureGrid';
import ProductivityMode from './components/ProductivityMode';
import HabitTracker from './components/HabitTracker';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  console.log("Gemini works!");
  return (
    <ThemeProvider>
      {/* The 'relative' class is crucial for positioning the absolute background */}
      <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <AnimatedBackground />
        <Navbar />
        <Hero />
        <QuoteSection />
        <SessionCard />
        <FeatureGrid />
        <ProductivityMode />
        <HabitTracker />
        <ComingSoon />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
