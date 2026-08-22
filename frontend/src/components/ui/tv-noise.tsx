import React, { useEffect, useRef } from 'react';

interface TVNoiseProps {
  className?: string;
  opacity?: number;
  intensity?: number;
  speed?: number;
}

export const TVNoise: React.FC<TVNoiseProps> = ({
  className = '',
  opacity = 0.04,
  intensity = 0.15,
  speed = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameDelay = 1000 / speed;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width * (window.devicePixelRatio || 1);
      const height = rect.height * (window.devicePixelRatio || 1);

      if (width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height)) {
        canvas.width = width;
        canvas.height = height;
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
    };

    const animate = () => {
      const { width, height } = canvas;

      if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
        setTimeout(() => {
          if (animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        }, frameDelay);
        return;
      }

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();
        if (noise < intensity) {
          const value = Math.floor(Math.random() * 255);
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
          data[i + 3] = Math.floor(Math.random() * 100 + 40);
        } else {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      setTimeout(() => {
        if (animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      }, frameDelay);
    };

    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resizeCanvas);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [intensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full z-10 ${className}`}
      style={{
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
};

export default TVNoise;
