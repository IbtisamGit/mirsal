import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const colors = ['#fde047', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];

export default function InteractiveStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const addStar = (x: number, y: number) => {
      const size = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2;
      starsRef.current.push({
        x, y, size,
        opacity: 1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 40 + 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      mouseRef.current = { x: clientX, y: clientY, isMoving: true };
      
      // Add stars on movement
      for(let i = 0; i < 2; i++) {
         addStar(clientX, clientY);
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      starsRef.current.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life++;
        star.opacity = 1 - (star.life / star.maxLife);

        if (star.life >= star.maxLife) {
          starsRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        
        ctx.beginPath();
        // Draw a simple star shape
        const spikes = 5;
        const outerRadius = star.size;
        const innerRadius = star.size / 2;
        let rot = Math.PI / 2 * 3;
        let x = star.x;
        let y = star.y;
        let step = Math.PI / spikes;

        ctx.moveTo(x, y - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = star.x + Math.cos(rot) * outerRadius;
          y = star.y + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = star.x + Math.cos(rot) * innerRadius;
          y = star.y + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(star.x, star.y - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
