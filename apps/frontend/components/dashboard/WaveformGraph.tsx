import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MetricPoint } from '@escrow/utils';

interface WaveformGraphProps {
  data: MetricPoint[];
  title: string;
  color?: string;
  height?: number;
  width?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  className?: string;
}

export const WaveformGraph: React.FC<WaveformGraphProps> = ({
  data,
  title,
  color = '#3B82F6',
  height = 200,
  width = 400,
  showGrid = true,
  showLabels = true,
  animate = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<MetricPoint | null>(null);
  const controls = useAnimation();

  // Calculate data bounds
  const values = data.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Convert data points to canvas coordinates
  const getCanvasPoint = (point: MetricPoint, canvasWidth: number, canvasHeight: number) => {
    const x = ((point.timestamp - data[0].timestamp) / (data[data.length - 1].timestamp - data[0].timestamp)) * canvasWidth;
    const y = canvasHeight - ((point.value - minValue) / valueRange) * canvasHeight;
    return { x, y };
  };

  // Draw waveform
  const drawWaveform = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (canvasWidth / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (canvasHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    // Draw waveform line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((point, index) => {
      const { x, y } = getCanvasPoint(point, canvasWidth, canvasHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, `${color}20`);
    gradient.addColorStop(1, `${color}05`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);

    data.forEach((point, index) => {
      const { x, y } = getCanvasPoint(point, canvasWidth, canvasHeight);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    data.forEach((point, index) => {
      const { x, y } = getCanvasPoint(point, canvasWidth, canvasHeight);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Highlight hovered point
      if (hoveredPoint && hoveredPoint.timestamp === point.timestamp) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  // Animation loop
  const animateWaveform = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWaveform(ctx, canvas.width, canvas.height);

    if (animate) {
      animationRef.current = requestAnimationFrame(animateWaveform);
    }
  };

  // Handle mouse events
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Find closest data point
    let closestPoint: MetricPoint | null = null;
    let minDistance = Infinity;

    data.forEach(point => {
      const { x, y } = getCanvasPoint(point, canvas.width, canvas.height);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      
      if (distance < minDistance && distance < 20) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    setHoveredPoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setIsHovered(false);
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Start animation
    if (animate) {
      animateWaveform();
    } else {
      drawWaveform(ctx, width, height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, width, height, animate, color, showGrid, hoveredPoint]);

  // Animate on mount
  useEffect(() => {
    if (animate) {
      controls.start({
        opacity: [0, 1],
        scale: [0.95, 1],
        transition: { duration: 0.5, ease: 'easeOut' },
      });
    }
  }, [animate, controls]);

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
      animate={controls}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600"
          >
            {new Date(hoveredPoint.timestamp).toLocaleTimeString()}: {hoveredPoint.value.toFixed(2)}
          </motion.div>
        )}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Y-axis labels */}
        {showLabels && (
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
            <span>{maxValue.toFixed(1)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
            <span>{minValue.toFixed(1)}</span>
          </div>
        )}

        {/* X-axis labels */}
        {showLabels && (
          <div className="absolute left-0 right-0 top-full mt-2 flex justify-between text-xs text-gray-500">
            <span>{new Date(data[0]?.timestamp || 0).toLocaleTimeString()}</span>
            <span>{new Date(data[data.length - 1]?.timestamp || 0).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{maxValue.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Peak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{minValue.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Min</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg</div>
        </div>
      </div>

      {/* Real-time indicator */}
      {animate && (
        <motion.div
          className="absolute top-2 right-2 flex items-center space-x-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-green-600">Live</span>
        </motion.div>
      )}
    </motion.div>
  );
}; 