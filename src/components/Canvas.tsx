import React, { useEffect, useRef, useState } from 'react';
import { WatermarkSettings } from '../types/watermark';
import { Move, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';

interface CanvasProps {
  baseImage: string | null;
  watermarkImage: string | null;
  settings: WatermarkSettings;
  onPositionChange: (x: number, y: number) => void;
  onSettingsReset: () => void;
}

export function Canvas({ 
  baseImage, 
  watermarkImage, 
  settings, 
  onPositionChange,
  onSettingsReset 
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [watermarkSize, setWatermarkSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const MOVE_STEP = 5;

  const adjustCanvasSize = (imageWidth: number, imageHeight: number) => {
    if (!containerRef.current) return { width: imageWidth, height: imageHeight };

    const container = containerRef.current;
    const maxWidth = container.clientWidth;
    const maxHeight = window.innerHeight * 0.6;
    const aspectRatio = imageWidth / imageHeight;

    let newWidth = imageWidth;
    let newHeight = imageHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return { width: newWidth, height: newHeight };
  };

  const calculateWatermarkDimensions = (watermark: HTMLImageElement, scale: number) => {
    // Use original image dimensions for consistent scaling
    const maxSize = Math.min(originalImageSize.width, originalImageSize.height) * (scale / 100);
    const aspectRatio = watermark.width / watermark.height;
    
    let wmWidth, wmHeight;
    if (watermark.width > watermark.height) {
      wmWidth = maxSize;
      wmHeight = maxSize / aspectRatio;
    } else {
      wmHeight = maxSize;
      wmWidth = maxSize * aspectRatio;
    }
    
    // Scale dimensions for display
    const displayScale = canvasSize.width / originalImageSize.width;
    return {
      width: wmWidth * displayScale,
      height: wmHeight * displayScale,
      originalWidth: wmWidth,
      originalHeight: wmHeight
    };
  };

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas context not available');
      return;
    }

    try {
      const base = new Image();
      base.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        base.onload = resolve;
        base.onerror = reject;
        base.src = baseImage;
      });

      // Store original image dimensions
      setOriginalImageSize({ width: base.width, height: base.height });

      // Set display dimensions
      const { width, height } = adjustCanvasSize(base.width, base.height);
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });

      // Clear and draw base image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(base, 0, 0, width, height);

      // Apply text watermark
      if (settings.text) {
        await renderTextWatermark(ctx);
      }
      // Apply image watermark
      else if (watermarkImage) {
        await renderImageWatermark(ctx);
      }

      setError(null);
    } catch (err) {
      console.error('Error rendering canvas:', err);
      setError('Failed to render image');
    }
  };

  const getScaledCoordinates = (x: number, y: number) => {
    const scale = canvasSize.width / originalImageSize.width;
    return {
      x: x * scale,
      y: y * scale
    };
  };

  const getOriginalCoordinates = (x: number, y: number) => {
    const scale = originalImageSize.width / canvasSize.width;
    return {
      x: x * scale,
      y: y * scale
    };
  };

  const renderTextWatermark = async (ctx: CanvasRenderingContext2D) => {
    if (!settings.text) return;

    const scale = canvasSize.width / originalImageSize.width;
    const fontSize = settings.fontSize * scale;

    const applyTextWatermark = (x: number, y: number, rotation: number = settings.rotation) => {
      ctx.save();
      ctx.globalAlpha = settings.opacity / 100;
      ctx.font = `${fontSize}px ${settings.fontFamily}`;
      ctx.fillStyle = settings.fontColor;
      
      const textMetrics = ctx.measureText(settings.text!);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      if (settings.effects.shadow) {
        ctx.shadowColor = settings.effects.shadowColor;
        ctx.shadowBlur = settings.effects.shadowBlur * scale;
        ctx.shadowOffsetX = settings.effects.shadowOffset.x * scale;
        ctx.shadowOffsetY = settings.effects.shadowOffset.y * scale;
      }

      ctx.translate(x + textWidth/2, y - textHeight/2);
      ctx.rotate(rotation * Math.PI / 180);

      if (settings.effects.stroke) {
        ctx.strokeStyle = settings.effects.strokeColor;
        ctx.lineWidth = settings.effects.strokeWidth * scale;
        ctx.strokeText(settings.text!, -textWidth/2, textHeight/2);
      }

      ctx.fillText(settings.text!, -textWidth/2, textHeight/2);
      ctx.restore();
    };

    const textMetrics = ctx.measureText(settings.text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    switch (settings.pattern) {
      case 'grid': {
        const quantity = settings.quantity || 9;
        const cols = Math.ceil(Math.sqrt(quantity));
        const rows = Math.ceil(quantity / cols);
        const xStep = (ctx.canvas.width - textWidth) / (cols - 1);
        const yStep = (ctx.canvas.height - textHeight) / (rows - 1);

        let count = 0;
        for (let row = 0; row < rows && count < quantity; row++) {
          for (let col = 0; col < cols && count < quantity; col++) {
            const x = col * xStep;
            const y = row * yStep + textHeight;
            applyTextWatermark(x, y);
            count++;
          }
        }
        break;
      }

      case 'diagonal': {
        const quantity = settings.quantity || 5;
        const step = Math.sqrt(
          (ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height)
        ) / (quantity - 1);

        for (let i = 0; i < quantity; i++) {
          const progress = i / (quantity - 1);
          const x = progress * (ctx.canvas.width - textWidth);
          const y = progress * (ctx.canvas.height - textHeight) + textHeight;
          applyTextWatermark(x, y, settings.rotation + 45);
        }
        break;
      }

      case 'wave': {
        const quantity = settings.quantity || 5;
        const amplitude = settings.effects.waveAmplitude * scale;
        const frequency = settings.effects.waveFrequency;
        const step = ctx.canvas.width / (quantity - 1);

        for (let i = 0; i < quantity; i++) {
          const x = i * step;
          const y = (ctx.canvas.height / 2) + 
                   Math.sin(x * frequency) * amplitude + 
                   textHeight/2;
          applyTextWatermark(x, y);
        }
        break;
      }

      case 'circular': {
        const quantity = settings.quantity || 8;
        const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.35;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        for (let i = 0; i < quantity; i++) {
          const angle = (i / quantity) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius - textWidth/2;
          const y = centerY + Math.sin(angle) * radius + textHeight/2;
          applyTextWatermark(x, y, settings.rotation + (angle * 180 / Math.PI));
        }
        break;
      }

      case 'random': {
        const quantity = settings.quantity || 5;
        const margin = settings.edgeMargin * scale;
        const seed = Date.now();
        const random = (n: number) => {
          const x = Math.sin(seed + n) * 10000;
          return x - Math.floor(x);
        };

        for (let i = 0; i < quantity; i++) {
          const x = margin + random(i) * (ctx.canvas.width - textWidth - 2 * margin);
          const y = margin + random(i + 1000) * (ctx.canvas.height - textHeight - 2 * margin) + textHeight;
          const rotation = random(i + 2000) * 360 + settings.rotation;
          applyTextWatermark(x, y, rotation);
        }
        break;
      }

      default: {
        let { x, y } = settings.customPosition ? 
          getScaledCoordinates(settings.customPosition.x, settings.customPosition.y) :
          { x: 0, y: 0 };

        if (!settings.customPosition) {
          switch (settings.position) {
            case 'top-left':
              x = settings.edgeMargin * scale;
              y = settings.edgeMargin * scale + textHeight;
              break;
            case 'top-right':
              x = ctx.canvas.width - textWidth - settings.edgeMargin * scale;
              y = settings.edgeMargin * scale + textHeight;
              break;
            case 'bottom-left':
              x = settings.edgeMargin * scale;
              y = ctx.canvas.height - settings.edgeMargin * scale;
              break;
            case 'bottom-right':
              x = ctx.canvas.width - textWidth - settings.edgeMargin * scale;
              y = ctx.canvas.height - settings.edgeMargin * scale;
              break;
            case 'middle-center':
              x = (ctx.canvas.width - textWidth) / 2;
              y = ctx.canvas.height / 2 + textHeight/2;
              break;
          }
        }

        applyTextWatermark(x, y);
      }
    }
  };

  const renderImageWatermark = async (ctx: CanvasRenderingContext2D) => {
    if (!watermarkImage) return;

    const watermark = new Image();
    watermark.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      watermark.onload = resolve;
      watermark.onerror = reject;
      watermark.src = watermarkImage;
    });

    const { width: wmWidth, height: wmHeight, originalWidth, originalHeight } = 
      calculateWatermarkDimensions(watermark, settings.size);
    setWatermarkSize({ width: originalWidth, height: originalHeight });

    const scale = canvasSize.width / originalImageSize.width;

    const applyImageWatermark = (x: number, y: number, rotation: number = settings.rotation) => {
      ctx.save();
      ctx.globalAlpha = settings.opacity / 100;
      ctx.globalCompositeOperation = settings.blendMode as GlobalCompositeOperation;

      if (settings.effects.shadow) {
        ctx.shadowColor = settings.effects.shadowColor;
        ctx.shadowBlur = settings.effects.shadowBlur * scale;
        ctx.shadowOffsetX = settings.effects.shadowOffset.x * scale;
        ctx.shadowOffsetY = settings.effects.shadowOffset.y * scale;
      }

      ctx.translate(x + wmWidth/2, y + wmHeight/2);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(watermark, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
      ctx.restore();
    };

    switch (settings.pattern) {
      case 'grid': {
        const quantity = settings.quantity || 9;
        const cols = Math.ceil(Math.sqrt(quantity));
        const rows = Math.ceil(quantity / cols);
        const xStep = (ctx.canvas.width - wmWidth) / (cols - 1);
        const yStep = (ctx.canvas.height - wmHeight) / (rows - 1);

        let count = 0;
        for (let row = 0; row < rows && count < quantity; row++) {
          for (let col = 0; col < cols && count < quantity; col++) {
            const x = col * xStep;
            const y = row * yStep;
            applyImageWatermark(x, y);
            count++;
          }
        }
        break;
      }

      case 'diagonal': {
        const quantity = settings.quantity || 5;
        const step = Math.sqrt(
          (ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height)
        ) / (quantity - 1);

        for (let i = 0; i < quantity; i++) {
          const progress = i / (quantity - 1);
          const x = progress * (ctx.canvas.width - wmWidth);
          const y = progress * (ctx.canvas.height - wmHeight);
          applyImageWatermark(x, y, settings.rotation + 45);
        }
        break;
      }

      case 'wave': {
        const quantity = settings.quantity || 5;
        const amplitude = settings.effects.waveAmplitude * scale;
        const frequency = settings.effects.waveFrequency;
        const step = ctx.canvas.width / (quantity - 1);

        for (let i = 0; i < quantity; i++) {
          const x = i * step;
          const y = (ctx.canvas.height / 2) + 
                   Math.sin(x * frequency) * amplitude - 
                   wmHeight/2;
          applyImageWatermark(x, y);
        }
        break;
      }

      case 'circular': {
        const quantity = settings.quantity || 8;
        const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.35;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        for (let i = 0; i < quantity; i++) {
          const angle = (i / quantity) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius - wmWidth/2;
          const y = centerY + Math.sin(angle) * radius - wmHeight/2;
          applyImageWatermark(x, y, settings.rotation + (angle * 180 / Math.PI));
        }
        break;
      }

      case 'random': {
        const quantity = settings.quantity || 5;
        const margin = settings.edgeMargin * scale;
        const seed = Date.now();
        const random = (n: number) => {
          const x = Math.sin(seed + n) * 10000;
          return x - Math.floor(x);
        };

        for (let i = 0; i < quantity; i++) {
          const x = margin + random(i) * (ctx.canvas.width - wmWidth - 2 * margin);
          const y = margin + random(i + 1000) * (ctx.canvas.height - wmHeight - 2 * margin);
          const rotation = random(i + 2000) * 360 + settings.rotation;
          applyImageWatermark(x, y, rotation);
        }
        break;
      }

      default: {
        let { x, y } = settings.customPosition ? 
          getScaledCoordinates(settings.customPosition.x, settings.customPosition.y) :
          { x: 0, y: 0 };

        if (!settings.customPosition) {
          switch (settings.position) {
            case 'top-left':
              x = settings.edgeMargin * scale;
              y = settings.edgeMargin * scale;
              break;
            case 'top-right':
              x = ctx.canvas.width - wmWidth - settings.edgeMargin * scale;
              y = settings.edgeMargin * scale;
              break;
            case 'bottom-left':
              x = settings.edgeMargin * scale;
              y = ctx.canvas.height - wmHeight - settings.edgeMargin * scale;
              break;
            case 'bottom-right':
              x = ctx.canvas.width - wmWidth - settings.edgeMargin * scale;
              y = ctx.canvas.height - wmHeight - settings.edgeMargin * scale;
              break;
            case 'middle-center':
              x = (ctx.canvas.width - wmWidth) / 2;
              y = (ctx.canvas.height - wmHeight) / 2;
              break;
          }
        }

        applyImageWatermark(x, y);
      }
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [baseImage, watermarkImage, settings, zoom]);

  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    setDragStart({
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    let newX = x - dragStart.x + (settings.customPosition?.x ?? 0);
    let newY = y - dragStart.y + (settings.customPosition?.y ?? 0);

    const { x: originalX, y: originalY } = getOriginalCoordinates(newX, newY);
    const { x: constrainedX, y: constrainedY } = constrainPosition(
      originalX,
      originalY,
      watermarkSize.width,
      watermarkSize.height
    );

    onPositionChange(constrainedX, constrainedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 3));
    }
  };

  const constrainPosition = (x: number, y: number, wmWidth: number, wmHeight: number) => {
    if (!originalImageSize.width || !originalImageSize.height) return { x, y };

    return {
      x: Math.max(0, Math.min(x, originalImageSize.width - wmWidth)),
      y: Math.max(0, Math.min(y, originalImageSize.height - wmHeight))
    };
  };

  const moveWatermark = (direction: 'up' | 'down' | 'left' | 'right') => {
    const currentX = settings.customPosition?.x ?? 0;
    const currentY = settings.customPosition?.y ?? 0;
    
    let newX = currentX;
    let newY = currentY;

    const moveDistance = MOVE_STEP * (originalImageSize.width / canvasSize.width);

    switch (direction) {
      case 'up':
        newY = currentY - moveDistance;
        break;
      case 'down':
        newY = currentY + moveDistance;
        break;
      case 'left':
        newX = currentX - moveDistance;
        break;
      case 'right':
        newX = currentX + moveDistance;
        break;
    }

    const { x: constrainedX, y: constrainedY } = constrainPosition(
      newX,
      newY,
      watermarkSize.width,
      watermarkSize.height
    );

    onPositionChange(constrainedX, constrainedY);
  };

  return (
    <div className="space-y-4">
      {/* Canvas Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className={isDragging ? 'bg-blue-500 text-white' : ''}
            title="Drag to move watermark"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onSettingsReset}
            title="Reset watermark position"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => moveWatermark('up')}
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => moveWatermark('down')}
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => moveWatermark('left')}
            title="Move Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => moveWatermark('right')}
            title="Move Right"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(prev => Math.min(prev * 1.1, 3))}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(prev => Math.max(prev * 0.9, 0.5))}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative w-full" ref={containerRef}>
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
            {error}
          </div>
        )}
        
        <div 
          className="relative w-full h-[60vh] overflow-hidden bg-gray-100 rounded-lg"
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: canvasSize.width > 0 ? '100%' : 'auto',
              height: canvasSize.height > 0 ? '100%' : 'auto',
              objectFit: 'contain',
              transform: `scale(${zoom})`,
              transformOrigin: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
}