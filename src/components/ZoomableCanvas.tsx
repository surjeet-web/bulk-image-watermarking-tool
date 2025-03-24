import React, { useEffect, useRef, useState } from 'react';
import { WatermarkSettings } from '../types/watermark';
import { ZoomIn, ZoomOut, Move, Eye, Grid, Shield } from 'lucide-react';

interface ZoomableCanvasProps {
  baseImage: string;
  watermarkImage: string | null;
  settings: WatermarkSettings;
  onPositionChange: (x: number, y: number) => void;
}

export function ZoomableCanvas({ baseImage, watermarkImage, settings, onPositionChange }: ZoomableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [previewMode, setPreviewMode] = useState<'normal' | 'pattern' | 'security'>('normal');

  // Store the last used random seed
  const lastRandomSeed = useRef(Math.random());

  const renderCanvas = () => {
    if (!canvasRef.current || !baseImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const base = new Image();
    base.onload = () => {
      canvas.width = base.width;
      canvas.height = base.height;
      
      if (previewMode === 'pattern') {
        ctx.globalAlpha = 0.3;
      }
      
      ctx.drawImage(base, 0, 0);

      if (watermarkImage) {
        const watermark = new Image();
        watermark.onload = () => {
          applyWatermark(ctx, watermark);
        };
        watermark.src = watermarkImage;
      }

      if (previewMode === 'security') {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    base.src = baseImage;
  };

  const applyWatermark = (ctx: CanvasRenderingContext2D, watermark: HTMLImageElement) => {
    const scale = settings.size / 100;
    const wmWidth = watermark.width * scale;
    const wmHeight = watermark.height * scale;

    ctx.globalAlpha = settings.opacity / 100;

    if (settings.glowEffect) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;
    }

    if (settings.glassMorphism) {
      ctx.filter = 'blur(0.5px) brightness(1.2)';
    }

    // Use consistent random seed for the session unless explicitly changed
    const randomSeed = settings.randomSeed ?? lastRandomSeed.current;
    lastRandomSeed.current = randomSeed;

    switch (settings.pattern) {
      case 'diagonal':
        applyDiagonalPattern(ctx, watermark, wmWidth, wmHeight, randomSeed);
        break;
      case 'wave':
        applyWavePattern(ctx, watermark, wmWidth, wmHeight);
        break;
      case 'grid':
        applyGridPattern(ctx, watermark, wmWidth, wmHeight);
        break;
      case 'circular':
        applyCircularPattern(ctx, watermark, wmWidth, wmHeight);
        break;
      case 'random':
        applyRandomPattern(ctx, watermark, wmWidth, wmHeight, randomSeed);
        break;
      default:
        applySingleWatermark(ctx, watermark, wmWidth, wmHeight);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.filter = 'none';
  };

  const applyDiagonalPattern = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number,
    seed: number
  ) => {
    const spacing = settings.spacing;
    const diagonal = Math.sqrt(ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height);
    const steps = Math.ceil(diagonal / (Math.max(wmWidth, wmHeight) + spacing));
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const x = progress * ctx.canvas.width - wmWidth / 2;
      const y = progress * ctx.canvas.height - wmHeight / 2;
      
      ctx.save();
      ctx.translate(x + wmWidth/2, y + wmHeight/2);
      ctx.rotate((45 + settings.rotation) * Math.PI / 180);
      ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
      ctx.restore();
    }
  };

  const applyWavePattern = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number
  ) => {
    const amplitude = settings.waveAmplitude || 50;
    const frequency = settings.waveFrequency || 0.02;
    const steps = Math.ceil(ctx.canvas.width / (wmWidth + settings.spacing));
    
    for (let i = 0; i < steps; i++) {
      const x = i * (wmWidth + settings.spacing);
      const y = ctx.canvas.height/2 + Math.sin(x * frequency) * amplitude;
      
      ctx.save();
      ctx.translate(x + wmWidth/2, y);
      ctx.rotate(settings.rotation * Math.PI / 180);
      ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
      ctx.restore();
    }
  };

  const applyGridPattern = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number
  ) => {
    const spacing = settings.spacing;
    const cols = Math.ceil(ctx.canvas.width / (wmWidth + spacing));
    const rows = Math.ceil(ctx.canvas.height / (wmHeight + spacing));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (wmWidth + spacing);
        const y = row * (wmHeight + spacing);
        
        ctx.save();
        ctx.translate(x + wmWidth/2, y + wmHeight/2);
        ctx.rotate(settings.rotation * Math.PI / 180);
        ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
        ctx.restore();
      }
    }
  };

  const applyCircularPattern = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number
  ) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const count = settings.quantity || 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius - wmWidth / 2;
      const y = centerY + Math.sin(angle) * radius - wmHeight / 2;
      
      ctx.save();
      ctx.translate(x + wmWidth/2, y + wmHeight/2);
      ctx.rotate(angle + settings.rotation * Math.PI / 180);
      ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
      ctx.restore();
    }
  };

  const applyRandomPattern = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number,
    seed: number
  ) => {
    const pseudoRandom = (x: number) => {
      const a = Math.sin(seed + x) * 10000;
      return a - Math.floor(a);
    };

    const count = settings.quantity || 10;
    const margin = settings.edgeMargin;
    
    for (let i = 0; i < count; i++) {
      const x = margin + pseudoRandom(i) * (ctx.canvas.width - wmWidth - 2 * margin);
      const y = margin + pseudoRandom(i + count) * (ctx.canvas.height - wmHeight - 2 * margin);
      const rotation = pseudoRandom(i + 2 * count) * 360 + settings.rotation;
      
      ctx.save();
      ctx.translate(x + wmWidth/2, y + wmHeight/2);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
      ctx.restore();
    }
  };

  const applySingleWatermark = (
    ctx: CanvasRenderingContext2D,
    watermark: HTMLImageElement,
    wmWidth: number,
    wmHeight: number
  ) => {
    let x = settings.customPosition?.x ?? 0;
    let y = settings.customPosition?.y ?? 0;

    if (!settings.customPosition) {
      switch (settings.position) {
        case 'top-left': x = settings.edgeMargin; y = settings.edgeMargin; break;
        case 'top-right': x = ctx.canvas.width - wmWidth - settings.edgeMargin; y = settings.edgeMargin; break;
        case 'bottom-left': x = settings.edgeMargin; y = ctx.canvas.height - wmHeight - settings.edgeMargin; break;
        case 'bottom-right': x = ctx.canvas.width - wmWidth - settings.edgeMargin; y = ctx.canvas.height - wmHeight - settings.edgeMargin; break;
        case 'middle-center': x = (ctx.canvas.width - wmWidth) / 2; y = (ctx.canvas.height - wmHeight) / 2; break;
      }
    }

    ctx.save();
    ctx.translate(x + wmWidth/2, y + wmHeight/2);
    ctx.rotate(settings.rotation * Math.PI / 180);
    ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
    ctx.restore();
  };

  useEffect(() => {
    renderCanvas();
  }, [baseImage, watermarkImage, settings, previewMode]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isZoomMode) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setIsZoomMode(!isZoomMode)}
          className={`p-2 rounded-lg ${isZoomMode ? 'bg-blue-500 text-white' : 'bg-white'}`}
          title={isZoomMode ? 'Pan Mode' : 'Zoom Mode'}
        >
          {isZoomMode ? <Move className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        </button>
        {isZoomMode && (
          <>
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
              className="p-2 rounded-lg bg-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.5))}
              className="p-2 rounded-lg bg-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="h-6 w-px bg-gray-200" />
        <button
          onClick={() => setPreviewMode('normal')}
          className={`p-2 rounded-lg ${previewMode === 'normal' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          title="Normal View"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPreviewMode('pattern')}
          className={`p-2 rounded-lg ${previewMode === 'pattern' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          title="Pattern View"
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPreviewMode('security')}
          className={`p-2 rounded-lg ${previewMode === 'security' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          title="Security Check"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
      <div 
        className="overflow-hidden bg-gray-100 rounded-lg transition-all duration-300"
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className={`max-w-full max-h-full mx-auto cursor-${isZoomMode ? 'move' : 'default'} transition-transform duration-300`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0'
          }}
        />
      </div>
    </div>
  );
}