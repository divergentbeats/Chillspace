import React from 'react';
import Navbar from './components/Navbar';
import QuoteSection from './components/QuoteSection';
import SessionCard from './components/SessionCard';
import FeatureGrid from './components/FeatureGrid';
import ProductivityMode from './components/ProductivityMode';
import HabitTracker from './components/HabitTracker';
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navbar />
      <QuoteSection />
      <SessionCard />
      <FeatureGrid />
      <ProductivityMode />
      <HabitTracker />
      <Hero />
    </div>
  );
}

export default App;
