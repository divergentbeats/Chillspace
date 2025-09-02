import React, { useEffect, useRef } from 'react';

const LoginStarfield = () => {
  const canvasRef = useRef(null);

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
      const numStars = 80;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.005 + 0.001,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
          moveX: (Math.random() - 0.5) * 0.02,
          moveY: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Update twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 0.8 || star.opacity <= 0.3) {
          star.twinkleDirection *= -1;
        }

        // Update position subtly
        star.x += star.moveX;
        star.y += star.moveY;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
    });

    return () => {
      window.removeEventListener('resize', () => {});
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default LoginStarfield;
