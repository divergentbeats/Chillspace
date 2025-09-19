import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteSection from './components/QuoteSection';
import SessionCard from './components/SessionCard';
import FeatureGrid from './components/FeatureGrid';
import ProductivityMode from './components/ProductivityMode';
import HabitTracker from './components/HabitTracker';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Preferences from './components/Preferences';
import VentingVenue from './components/VentingVenue';
import CommunityConnect from './components/CommunityConnect';
import MoodAnalyzer from './components/MoodAnalyzer';
import TrackYourProgress from './components/TrackYourProgress';

// Updated: Added smooth starfield background animation and fixed navbar scroll offset

// Starfield Background Component
const Starfield = () => {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      const numStars = isDarkMode ? 150 : 100;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Update twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 1 || star.opacity <= 0) {
          star.twinkleDirection *= -1;
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (isDarkMode ? 0.8 : 0.6)})`;
        ctx.fill();

        // Add glow effect for dark mode
        if (isDarkMode) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

function AppContent() {
  const location = useLocation();
  const isPreferencesPage = location.pathname === '/preferences';
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {!isPreferencesPage && <Starfield />}
      <Navbar />
      <div className="absolute top-4 right-4 z-20">
        <button onClick={toggleTheme} className="px-3 py-1 rounded bg-pastel-blue-500 text-white hover:bg-pastel-blue-600 transition-colors">
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      {/* Each section is given an ID to act as a scroll target */}
      <div id="hero">
        <Hero />
      </div>
      <div id="quotes">
        <QuoteSection />
      </div>
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Signup />
            </motion.div>
          }
        />
        <Route
          path="/preferences"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Preferences />
            </motion.div>
          }
        />
        <Route
          path="/vent"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VentingVenue />
            </motion.div>
          }
        />
        <Route
          path="/community-connect"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommunityConnect />
            </motion.div>
          }
        />
        <Route
          path="/mood-analyzer"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MoodAnalyzer />
            </motion.div>
          }
        />
        <Route
          path="/*"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AppContent />
            </motion.div>
          }
        />
        <Route
          path="/track-your-progress"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TrackYourProgress />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
