import React, { useEffect, useRef } from "react";
import { audioEngine } from "../services/audioEngine";

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  className = "w-full h-12"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const freqData = audioEngine.getFrequencyData();
      const step = Math.floor(freqData.length / barCount) || 1;

      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (isPlaying) {
          const rawVal = freqData[i * step] || 0;
          // Normalize to [0.15, 1.0] when playing
          value = Math.max(0.12, rawVal / 255);
        } else {
          // Subtle idle resting pulse
          value = 0.08 + 0.04 * Math.sin(Date.now() / 400 + i * 0.3);
        }

        const barHeight = Math.max(4, value * height * 0.9);
        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, "#c084fc"); // Purple glow
        gradient.addColorStop(0.5, "#818cf8"); // Indigo
        gradient.addColorStop(1, "#38bdf8"); // Cyan

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={50}
      className={`${className} block rounded-lg overflow-hidden`}
    />
  );
};
