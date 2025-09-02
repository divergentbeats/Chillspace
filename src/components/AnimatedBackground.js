import React, { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const { isDarkMode } = useTheme();

  const particlesInit = useCallback(async (engine) => {
    // Initializes the tsparticles engine
    await loadFull(engine);
  }, []);

  const particleOptions = useMemo(() => ({
    // We'll control the positioning via CSS classes on the component
    // instead of the fullScreen option to prevent layout shifts.
    fullScreen: { enable: false },
    particles: {
      number: {
        value: isDarkMode ? 80 : 40,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        // Glowing white stars in dark mode, faint purple particles in light mode
        value: isDarkMode ? '#ffffff' : '#a855f7',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: isDarkMode ? 0.5 : 0.25,
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

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 -z-10" // Positioned behind content
      init={particlesInit}
      options={particleOptions}
    />
  );
};

export default AnimatedBackground;