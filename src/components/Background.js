import React, { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useTheme } from '../context/ThemeContext';

const Background = () => {
  const { isDarkMode } = useTheme();

  const particlesInit = useCallback(async (engine) => {
    // This initializes the tsparticles engine
    await loadFull(engine);
  }, []);

  const particleOptions = useMemo(() => ({
    // Using CSS classes for positioning is more reliable than the library's fullScreen option
    fullScreen: { enable: false },
    particles: {
      number: {
        value: isDarkMode ? 80 : 40, // More stars in dark mode
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: '#ffffff', // White stars for both modes
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: isDarkMode ? 0.6 : 0.3, // Fainter stars in light mode
        random: true,
      },
      size: {
        value: { min: 0.5, max: 2 },
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'bottom',
        straight: true,
        outModes: 'out',
      },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
  }), [isDarkMode]);

  return <Particles id="tsparticles" className="absolute inset-0 -z-10" init={particlesInit} options={particleOptions} />;
};

export default Background;