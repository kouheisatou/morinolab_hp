'use client';

import { useEffect, useRef } from 'react';
import { useParallaxScroll } from '@/hooks/use-scroll-animation';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  baseX: number;
  baseY: number;
  parallaxFactor: number;
  parallaxDirX: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const scrollY = useParallaxScroll();
  const scrollYRef = useRef(scrollY);

  // scrollYの最新値をrefに保存
  scrollYRef.current = scrollY;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(
        150,
        Math.floor((canvas.width * canvas.height) / 12000)
      );

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          color:
            Math.random() > 0.7
              ? '#3B82F6'
              : Math.random() > 0.4
                ? '#06B6D4'
                : '#8B5CF6',
          parallaxFactor: Math.random() * 0.8 + 0.2,
          parallaxDirX: Math.random() < 0.5 ? -1 : 1,
        });
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // refから最新のscrollY値を取得
      const currentScrollY = scrollYRef.current;

      // Create dynamic background gradients based on scroll (減らした係数)
      const scrollOffset = currentScrollY * 0.05; // 0.1 から 0.05 に減少
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(Date.now() * 0.001) * 100,
        canvas.height * 0.3 + Math.cos(Date.now() * 0.001) * 100,
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.8
      );
      gradient1.addColorStop(
        0,
        `rgba(59, 130, 246, ${0.02 + scrollOffset * 0.0005})` // 0.001 から 0.0005 に減少
      );
      gradient1.addColorStop(1, 'rgba(59, 130, 246, 0)');

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(Date.now() * 0.0015) * 150,
        canvas.height * 0.7 + Math.sin(Date.now() * 0.0015) * 150,
        0,
        canvas.width * 0.7,
        canvas.height * 0.7,
        canvas.width * 0.6
      );
      gradient2.addColorStop(
        0,
        `rgba(139, 92, 246, ${0.02 + scrollOffset * 0.0005})` // 0.001 から 0.0005 に減少
      );
      gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Apply parallax effect based on scroll (係数を大幅に減少)
        const parallaxX = currentScrollY * particle.parallaxFactor * 0.1; // 0.3 から 0.1 に減少
        const parallaxY = currentScrollY * particle.parallaxFactor * 0.03; // 0.1 から 0.03 に減少

        // Update position with enhanced movement
        particle.x +=
          particle.vx +
          Math.sin(Date.now() * 0.001 + particle.baseX * 0.01) * 0.5;
        particle.y +=
          particle.vy +
          Math.cos(Date.now() * 0.001 + particle.baseY * 0.01) * 0.5;

        // Apply parallax offset
        const displayX = particle.x - parallaxX * particle.parallaxDirX;
        const displayY = particle.y - parallaxY;

        // Bounce off edges (elastic). Remove damping to avoid particles losing energy and sticking to edges.
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          // Ensure inside bounds
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Dynamic size and opacity based on scroll (より穏やかな変化)
        const scrollInfluence =
          Math.abs(Math.sin(currentScrollY * 0.005)) * 0.3 + 0.7; // 0.01 から 0.005、範囲も調整
        const dynamicSize = particle.size * scrollInfluence;
        const dynamicOpacity = particle.opacity * scrollInfluence;

        // Draw particle with enhanced effects
        ctx.beginPath();
        ctx.arc(displayX, displayY, dynamicSize, 0, Math.PI * 2);

        // Create glow effect
        const gradient = ctx.createRadialGradient(
          displayX,
          displayY,
          0,
          displayX,
          displayY,
          dynamicSize * 3
        );
        gradient.addColorStop(
          0,
          `${particle.color}${Math.floor(dynamicOpacity * 255)
            .toString(16)
            .padStart(2, '0')}`
        );
        gradient.addColorStop(
          0.5,
          `${particle.color}${Math.floor(dynamicOpacity * 0.3 * 255)
            .toString(16)
            .padStart(2, '0')}`
        );
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fill();

        // Add core particle
        ctx.beginPath();
        ctx.arc(displayX, displayY, dynamicSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(dynamicOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fill();
      });

      // Draw enhanced connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const parallaxX1 = currentScrollY * particle.parallaxFactor * 0.1; // 0.3 から 0.1 に減少
          const parallaxY1 = currentScrollY * particle.parallaxFactor * 0.03; // 0.1 から 0.03 に減少
          const parallaxX2 =
            currentScrollY * otherParticle.parallaxFactor * 0.1; // 0.3 から 0.1 に減少
          const parallaxY2 =
            currentScrollY * otherParticle.parallaxFactor * 0.03; // 0.1 から 0.03 に減少

          const x1 = particle.x - parallaxX1 * particle.parallaxDirX;
          const y1 = particle.y - parallaxY1;
          const x2 = otherParticle.x - parallaxX2 * otherParticle.parallaxDirX;
          const y2 = otherParticle.y - parallaxY2;

          const dx = x1 - x2;
          const dy = y1 - y2;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const scrollInfluence =
              Math.abs(Math.sin(currentScrollY * 0.005)) * 0.2 + 0.1; // 0.01 から 0.005、範囲も調整
            const opacity = scrollInfluence * (1 - distance / 200);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(
              0,
              `${particle.color}${Math.floor(opacity * 255)
                .toString(16)
                .padStart(2, '0')}`
            );
            gradient.addColorStop(
              1,
              `${otherParticle.color}${Math.floor(opacity * 255)
                .toString(16)
                .padStart(2, '0')}`
            );

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + scrollInfluence;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // 依存配列は空配列のまま

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none z-0'
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}
    />
  );
}
