import React, { useEffect, useRef, useState } from 'react';
import { Sliders, Activity } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface AudioVisualizerProps {
  isPlaying: boolean;
  themeColor?: string; // e.g. '#C8B087'
}

type VisualizerMode = 'bars' | 'waves';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  themeColor = '#C8B087',
}) => {
  const { analyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('waves');
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Store heights and target heights of spectrum bars for smooth lerping
  const barCount = 36;
  const barHeightsRef = useRef<number[]>(Array(barCount).fill(4));
  const targetHeightsRef = useRef<number[]>(Array(barCount).fill(4));
  
  // Wave phase tracker
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    // Handle high DPI screens
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      width = canvas.width;
      height = canvas.height;
    };

    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * window.devicePixelRatio,
        y: (e.clientY - rect.top) * window.devicePixelRatio,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment phase for sine waves
      if (isPlaying) {
        phaseRef.current += 0.05;
      } else {
        phaseRef.current += 0.005; // very gentle breathing
      }

      const activeColor = themeColor;
      const hoverEffect = mouseRef.current.active;
      const mouseX = mouseRef.current.x;

      // Prepare raw audio data buffer if analyser is active
      const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
      if (isPlaying && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      if (mode === 'bars') {
        // --- 1. RENDER BARS MODE ---
        const spacing = width / barCount;
        const barWidth = spacing * 0.65;
        const maxBarHeight = height * 0.85;

        for (let i = 0; i < barCount; i++) {
          if (isPlaying) {
            let target = 0;

            if (analyser && dataArray) {
              // Real music frequency mapping
              // Sample frequencies with a curved logarithmic focus on lower/mid tones
              const percent = i / barCount;
              const index = Math.min(
                Math.floor(percent * percent * dataArray.length * 0.85) + 1,
                dataArray.length - 1
              );
              const frequencyVal = dataArray[index];
              target = (frequencyVal / 255) * maxBarHeight;
            } else {
              // High fidelity simulation fallback if Analyser node is initializing or CORS-restricted
              const baseFreq = i / barCount;
              const wave1 = Math.sin(baseFreq * Math.PI * 4 + phaseRef.current * 1.5) * 0.35;
              const wave2 = Math.cos(baseFreq * Math.PI * 8 - phaseRef.current * 2.1) * 0.25;
              const wave3 = Math.sin(baseFreq * Math.PI * 12 + phaseRef.current * 0.7) * 0.15;
              const noise = Math.random() * 0.25;
              const freqWeight = Math.exp(-baseFreq * 0.8) * 0.4 + 0.6;
              target = (0.3 + wave1 + wave2 + wave3 + noise) * maxBarHeight * freqWeight;
            }

            // Influence of cursor position
            if (hoverEffect) {
              const currentX = i * spacing + barWidth / 2;
              const dist = Math.abs(currentX - mouseX);
              if (dist < 100 * window.devicePixelRatio) {
                const force = (1 - dist / (100 * window.devicePixelRatio));
                target += force * maxBarHeight * 0.45;
              }
            }

            targetHeightsRef.current[i] = Math.max(6, Math.min(target, maxBarHeight));
          } else {
            // Calm breathing pattern
            const breathing = Math.sin(phaseRef.current * 2 + i * 0.3) * 3 + 6;
            targetHeightsRef.current[i] = breathing;
          }

          // Smoothly interpolate current bar heights towards targets
          const lerpSpeed = isPlaying ? 0.22 : 0.1;
          barHeightsRef.current[i] += (targetHeightsRef.current[i] - barHeightsRef.current[i]) * lerpSpeed;

          // Draw bar
          const h = barHeightsRef.current[i];
          const x = i * spacing + (spacing - barWidth) / 2;
          const y = (height - h) / 2; // centered vertically

          // Create elegant gradient for each bar
          const gradient = ctx.createLinearGradient(x, y, x, y + h);
          gradient.addColorStop(0, activeColor);
          gradient.addColorStop(0.5, '#111111');
          gradient.addColorStop(1, activeColor);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          // Draw rounded bar
          ctx.roundRect(x, y, barWidth, h, [4]);
          ctx.fill();
        }
      } else {
        // --- 2. RENDER WAVES MODE ---
        // Elegant overlayed sine waves (Siri/Gemini style)
        let averageFreq = 0;
        if (isPlaying && analyser && dataArray) {
          let sum = 0;
          for (let k = 0; k < dataArray.length; k++) {
            sum += dataArray[k];
          }
          averageFreq = sum / dataArray.length;
        }

        const waveCount = 3;
        const opacities = [0.8, 0.45, 0.25];
        const lineWidths = [3, 1.5, 1];
        const frequencies = [1, 2, 3];
        const speedFactors = [1, -0.7, 1.3];

        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.strokeStyle = activeColor;
          ctx.globalAlpha = opacities[w];
          ctx.lineWidth = lineWidths[w];

          // Dynamic wave amplitude modulated in real-time by current music frequencies
          let amplitudeBase = height * 0.08;
          if (isPlaying) {
            if (analyser && dataArray) {
              // Real volume-derived amplitude
              amplitudeBase = Math.max(12, (averageFreq / 150) * height * 0.45) * (1 - w * 0.15);
            } else {
              // Simulated dynamic wave fallback
              amplitudeBase = height * 0.35;
            }
          }

          for (let x = 0; x <= width; x += 4) {
            const normalizedX = x / width;
            
            // Beautiful fluid sine wave calculation
            const speed = phaseRef.current * speedFactors[w];
            let angle = normalizedX * Math.PI * 2 * frequencies[w] + speed;
            
            // Envelope to pinch the wave at the ends so it fits inside beautifully
            const envelope = Math.sin(normalizedX * Math.PI);
            
            let y = Math.sin(angle) * amplitudeBase * envelope;

            // Cursor gravity influence on the waves
            if (hoverEffect) {
              const dist = Math.abs(x - mouseX);
              if (dist < 120 * window.devicePixelRatio) {
                const force = (1 - dist / (120 * window.devicePixelRatio));
                y += Math.sin(angle * 2) * force * height * 0.2;
              }
            }

            const finalY = height / 2 + y;

            if (x === 0) {
              ctx.moveTo(x, finalY);
            } else {
              ctx.lineTo(x, finalY);
            }
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0; // Reset opacity
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (ro) {
        ro.disconnect();
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlaying, mode, themeColor, analyser]);

  return (
    <div className="relative w-full bg-white/70 backdrop-blur-md border border-[#ECECEC] rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col space-y-3">
      {/* Visualizer header & control options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs font-heading font-bold text-[#111111] uppercase tracking-wider">
            Ambient Visualizer
          </span>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex bg-[#F7F7F5] rounded-full p-0.5 border border-[#ECECEC]">
          <button
            onClick={() => setMode('waves')}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              mode === 'waves'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#7A7A7A] hover:text-[#111111]'
            }`}
            title="Fluid Waves Mode"
          >
            <Activity size={14} />
          </button>
          <button
            onClick={() => setMode('bars')}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              mode === 'bars'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#7A7A7A] hover:text-[#111111]'
            }`}
            title="Spectrum Bars Mode"
          >
            <Sliders size={14} className="rotate-90" />
          </button>
        </div>
      </div>

      {/* Visualizer Canvas container */}
      <div className="relative h-24 w-full bg-[#FDFDFD] rounded-xl border border-[#F2F2F0] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer block" />
        
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#7A7A7A]">
        <span>0Hz</span>
        <span>{isPlaying ? 'Active Audio Sync' : 'Music Idle • Gentle Breath'}</span>
        <span>22kHz</span>
      </div>
    </div>
  );
};
