import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import {
  ImageUp,
  Type,
  Images,
  Layers,
  Sliders,
  Download,
  Camera,
  Building2,
  Users,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  HelpCircle
} from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { WatermarkControls } from './components/WatermarkControls';
import { BatchProcessor } from './components/BatchProcessor';
import { PresetManager } from './components/PresetManager';
import { Canvas } from './components/Canvas';
import { TextWatermarkControls } from './components/TextWatermarkControls';
import { WatermarkSettings, ImageFile } from './types/watermark';
import { useWatermarkStorage } from './hooks/useWatermarkStorage';
import { downloadWatermarkedImages } from './utils/downloadHandler';
import { TrueFocus } from './components/TrueFocus';
import { UserGuide } from './components/UserGuide';
import { useTourGuide } from './hooks/useTourGuide';

function App() {
  const [baseImages, setBaseImages] = useState<ImageFile[]>([]);
  const [watermarkImage, setWatermarkImage] = useState<ImageFile | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [watermarkType, setWatermarkType] = useState<'image' | 'text'>('image');
  const [showGuide, setShowGuide] = useState(false);
  const { settings, setSettings, recentSessions, addSession } = useWatermarkStorage();
  const { startTour } = useTourGuide();

  const handleBaseImageSelect = (files: File[]) => {
    Promise.all(
      files.map((file) => {
        return new Promise<ImageFile>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
              resolve({
                file,
                preview: reader.result as string,
                width: img.width,
                height: img.height
              });
            };
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((imageFiles) => {
      setBaseImages((prev) => [...prev, ...imageFiles]);
    });
  };

  const handleWatermarkSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        setWatermarkImage({
          file,
          preview: reader.result as string,
          width: img.width,
          height: img.height
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const renderWatermark = async (ctx: CanvasRenderingContext2D, image: ImageFile) => {
    if (watermarkType === 'text' && settings.text) {
      ctx.save();
      
      // Calculate scale factor based on original image dimensions
      const scaleFactor = ctx.canvas.width / image.width;
      const fontSize = settings.fontSize * scaleFactor;
      
      ctx.globalAlpha = settings.opacity / 100;
      ctx.font = `${fontSize}px ${settings.fontFamily}`;
      ctx.fillStyle = settings.fontColor;
      
      const textMetrics = ctx.measureText(settings.text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      let x = settings.customPosition?.x ?? 0;
      let y = settings.customPosition?.y ?? 0;

      if (!settings.customPosition) {
        const margin = settings.edgeMargin * scaleFactor;
        
        switch (settings.position) {
          case 'top-left':
            x = margin;
            y = margin + textHeight;
            break;
          case 'top-right':
            x = ctx.canvas.width - textWidth - margin;
            y = margin + textHeight;
            break;
          case 'bottom-left':
            x = margin;
            y = ctx.canvas.height - margin;
            break;
          case 'bottom-right':
            x = ctx.canvas.width - textWidth - margin;
            y = ctx.canvas.height - margin;
            break;
          case 'middle-center':
            x = (ctx.canvas.width - textWidth) / 2;
            y = ctx.canvas.height / 2;
            break;
        }
      } else {
        // Scale custom position coordinates
        x *= scaleFactor;
        y *= scaleFactor;
      }

      // Apply effects with proper scaling
      if (settings.effects.shadow) {
        ctx.shadowColor = settings.effects.shadowColor;
        ctx.shadowBlur = settings.effects.shadowBlur * scaleFactor;
        ctx.shadowOffsetX = settings.effects.shadowOffset.x * scaleFactor;
        ctx.shadowOffsetY = settings.effects.shadowOffset.y * scaleFactor;
      }

      // Handle different pattern types
      switch (settings.pattern) {
        case 'grid': {
          const quantity = settings.quantity || 9;
          const cols = Math.ceil(Math.sqrt(quantity));
          const rows = Math.ceil(quantity / cols);
          const xStep = (ctx.canvas.width - textWidth) / Math.max(cols - 1, 1);
          const yStep = (ctx.canvas.height - textHeight) / Math.max(rows - 1, 1);

          let count = 0;
          for (let row = 0; row < rows && count < quantity; row++) {
            for (let col = 0; col < cols && count < quantity; col++) {
              const posX = col * xStep;
              const posY = row * yStep + textHeight;
              
              ctx.save();
              ctx.translate(posX + textWidth/2, posY - textHeight/2);
              ctx.rotate(settings.rotation * Math.PI / 180);
              
              if (settings.effects.stroke) {
                ctx.strokeStyle = settings.effects.strokeColor;
                ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
                ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
              }
              
              ctx.fillText(settings.text, -textWidth/2, textHeight/2);
              ctx.restore();
              count++;
            }
          }
          break;
        }

        case 'diagonal': {
          const quantity = settings.quantity || 5;
          const diagonal = Math.sqrt(ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height);
          const step = diagonal / Math.max(quantity - 1, 1);
          
          for (let i = 0; i < quantity; i++) {
            const progress = i / Math.max(quantity - 1, 1);
            const posX = progress * (ctx.canvas.width - textWidth);
            const posY = progress * (ctx.canvas.height - textHeight) + textHeight;
            
            ctx.save();
            ctx.translate(posX + textWidth/2, posY - textHeight/2);
            ctx.rotate((45 + settings.rotation) * Math.PI / 180);
            
            if (settings.effects.stroke) {
              ctx.strokeStyle = settings.effects.strokeColor;
              ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
              ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
            }
            
            ctx.fillText(settings.text, -textWidth/2, textHeight/2);
            ctx.restore();
          }
          break;
        }

        case 'wave': {
          const quantity = settings.quantity || 5;
          const amplitude = settings.effects.waveAmplitude * scaleFactor;
          const frequency = settings.effects.waveFrequency;
          const step = ctx.canvas.width / Math.max(quantity - 1, 1);
          
          for (let i = 0; i < quantity; i++) {
            const posX = i * step;
            const posY = (ctx.canvas.height / 2) + 
                     Math.sin(posX * frequency) * amplitude + 
                     textHeight/2;
            
            ctx.save();
            ctx.translate(posX + textWidth/2, posY - textHeight/2);
            ctx.rotate(settings.rotation * Math.PI / 180);
            
            if (settings.effects.stroke) {
              ctx.strokeStyle = settings.effects.strokeColor;
              ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
              ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
            }
            
            ctx.fillText(settings.text, -textWidth/2, textHeight/2);
            ctx.restore();
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
            const posX = centerX + Math.cos(angle) * radius - textWidth/2;
            const posY = centerY + Math.sin(angle) * radius + textHeight/2;
            
            ctx.save();
            ctx.translate(posX + textWidth/2, posY - textHeight/2);
            ctx.rotate(settings.rotation * Math.PI / 180 + angle);
            
            if (settings.effects.stroke) {
              ctx.strokeStyle = settings.effects.strokeColor;
              ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
              ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
            }
            
            ctx.fillText(settings.text, -textWidth/2, textHeight/2);
            ctx.restore();
          }
          break;
        }

        case 'random': {
          const quantity = settings.quantity || 5;
          const margin = settings.edgeMargin * scaleFactor;
          const seed = Date.now();
          const random = (n: number) => {
            const x = Math.sin(seed + n) * 10000;
            return x - Math.floor(x);
          };
          
          for (let i = 0; i < quantity; i++) {
            const posX = margin + random(i) * (ctx.canvas.width - textWidth - 2 * margin);
            const posY = margin + random(i + 1000) * (ctx.canvas.height - textHeight - 2 * margin) + textHeight;
            const rotation = random(i + 2000) * 360 + settings.rotation;
            
            ctx.save();
            ctx.translate(posX + textWidth/2, posY - textHeight/2);
            ctx.rotate(rotation * Math.PI / 180);
            
            if (settings.effects.stroke) {
              ctx.strokeStyle = settings.effects.strokeColor;
              ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
              ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
            }
            
            ctx.fillText(settings.text, -textWidth/2, textHeight/2);
            ctx.restore();
          }
          break;
        }

        default: {
          ctx.save();
          ctx.translate(x + textWidth/2, y - textHeight/2);
          ctx.rotate(settings.rotation * Math.PI / 180);
          
          if (settings.effects.stroke) {
            ctx.strokeStyle = settings.effects.strokeColor;
            ctx.lineWidth = settings.effects.strokeWidth * scaleFactor;
            ctx.strokeText(settings.text, -textWidth/2, textHeight/2);
          }
          
          ctx.fillText(settings.text, -textWidth/2, textHeight/2);
          ctx.restore();
        }
      }

      ctx.restore();
    } else if (watermarkType === 'image' && watermarkImage) {
      const wmImg = new Image();
      await new Promise((resolve) => {
        wmImg.onload = resolve;
        wmImg.src = watermarkImage.preview;
      });

      ctx.save();
      const scale = settings.size / 100;
      const wmWidth = wmImg.width * scale;
      const wmHeight = wmImg.height * scale;

      ctx.globalAlpha = settings.opacity / 100;
      ctx.globalCompositeOperation = settings.blendMode as GlobalCompositeOperation;

      let x = settings.customPosition?.x ?? 0;
      let y = settings.customPosition?.y ?? 0;

      if (!settings.customPosition) {
        switch (settings.position) {
          case 'top-left':
            x = settings.edgeMargin;
            y = settings.edgeMargin;
            break;
          case 'top-right':
            x = ctx.canvas.width - wmWidth - settings.edgeMargin;
            y = settings.edgeMargin;
            break;
          case 'bottom-left':
            x = settings.edgeMargin;
            y = ctx.canvas.height - wmHeight - settings.edgeMargin;
            break;
          case 'bottom-right':
            x = ctx.canvas.width - wmWidth - settings.edgeMargin;
            y = ctx.canvas.height - wmHeight - settings.edgeMargin;
            break;
          case 'middle-center':
            x = (ctx.canvas.width - wmWidth) / 2;
            y = (ctx.canvas.height - wmHeight) / 2;
            break;
        }
      }

      if (settings.effects.shadow) {
        ctx.shadowColor = settings.effects.shadowColor;
        ctx.shadowBlur = settings.effects.shadowBlur;
        ctx.shadowOffsetX = settings.effects.shadowOffset.x;
        ctx.shadowOffsetY = settings.effects.shadowOffset.y;
      }

      switch (settings.pattern) {
        case 'grid':
          const cols = Math.ceil(Math.sqrt(settings.quantity || 1));
          const rows = Math.ceil((settings.quantity || 1) / cols);
          const xStep = (ctx.canvas.width - wmWidth) / Math.max(cols - 1, 1);
          const yStep = (ctx.canvas.height - wmHeight) / Math.max(rows - 1, 1);

          let count = 0;
          for (let row = 0; row < rows && count < (settings.quantity || 1); row++) {
            for (let col = 0; col < cols && count < (settings.quantity || 1); col++) {
              const posX = col * xStep;
              const posY = row * yStep;
              ctx.save();
              ctx.translate(posX + wmWidth/2, posY + wmHeight/2);
              ctx.rotate(settings.rotation * Math.PI / 180);
              ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
              ctx.restore();
              count++;
            }
          }
          break;

        case 'diagonal':
          const diagonal = Math.sqrt(ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height);
          const step = diagonal / Math.max((settings.quantity || 1) - 1, 1);
          
          for (let i = 0; i < (settings.quantity || 1); i++) {
            const progress = i / Math.max((settings.quantity || 1) - 1, 1);
            const posX = progress * (ctx.canvas.width - wmWidth);
            const posY = progress * (ctx.canvas.height - wmHeight);
            
            ctx.save();
            ctx.translate(posX + wmWidth/2, posY + wmHeight/2);
            ctx.rotate((45 + settings.rotation) * Math.PI / 180);
            ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
            ctx.restore();
          }
          break;

        case 'wave':
          const amplitude = settings.effects.waveAmplitude || 20;
          const frequency = settings.effects.waveFrequency || 0.02;
          
          for (let i = 0; i < (settings.quantity || 1); i++) {
            const progress = i / Math.max((settings.quantity || 1) - 1, 1);
            const posX = progress * (ctx.canvas.width - wmWidth);
            const posY = (ctx.canvas.height - wmHeight)/2 + Math.sin(posX * frequency) * amplitude;
            
            ctx.save();
            ctx.translate(posX + wmWidth/2, posY + wmHeight/2);
            ctx.rotate(settings.rotation * Math.PI / 180);
            ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
            ctx.restore();
          }
          break;

        case 'circular':
          const centerX = ctx.canvas.width / 2;
          const centerY = ctx.canvas.height / 2;
          const radius = Math.min(centerX - wmWidth/2, centerY - wmHeight/2) * 0.8;
          
          for (let i = 0; i < (settings.quantity || 1); i++) {
            const angle = (i / (settings.quantity || 1)) * Math.PI * 2;
            const posX = centerX + Math.cos(angle) * radius - wmWidth/2;
            const posY = centerY + Math.sin(angle) * radius - wmHeight/2;
            
            ctx.save();
            ctx.translate(posX + wmWidth/2, posY + wmHeight/2);
            ctx.rotate(angle + settings.rotation * Math.PI / 180);
            ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
            ctx.restore();
          }
          break;

        case 'random':
          const margin = settings.edgeMargin;
          const seed = Date.now();
          const random = (n: number) => {
            const x = Math.sin(seed + n) * 10000;
            return x - Math.floor(x);
          };
          
          for (let i = 0; i < (settings.quantity || 1); i++) {
            const posX = margin + random(i) * (ctx.canvas.width - wmWidth - 2 * margin);
            const posY = margin + random(i + 1000) * (ctx.canvas.height - wmHeight - 2 * margin);
            const rotation = random(i + 2000) * 360 + settings.rotation;
            
            ctx.save();
            ctx.translate(posX + wmWidth/2, posY + wmHeight/2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
            ctx.restore();
          }
          break;

        default:
          ctx.save();
          ctx.translate(x + wmWidth/2, y + wmHeight/2);
          ctx.rotate(settings.rotation * Math.PI / 180);
          ctx.drawImage(wmImg, -wmWidth/2, -wmHeight/2, wmWidth, wmHeight);
          ctx.restore();
      }

      ctx.restore();
    }
  };

  const processImages = async () => {
    if (baseImages.length === 0) return;

    setIsProcessing(true);
    setProcessedCount(0);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const processedImages: string[] = [];

    for (let i = 0; i < baseImages.length; i++) {
      const image = baseImages[i];
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      const baseImg = new Image();
      await new Promise((resolve) => {
        baseImg.onload = resolve;
        baseImg.src = image.preview;
      });
      
      // Clear canvas and draw base image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0);

      // Apply watermark with all effects
      await renderWatermark(ctx, image);

      processedImages.push(canvas.toDataURL('image/png'));
      setProcessedCount(i + 1);
    }

    await downloadWatermarkedImages(processedImages, baseImages);
    addSession(baseImages.length, settings);
    setIsProcessing(false);
  };

  if (showGuide) {
    return (
      <div className="min-h-screen bg-[#F3F0FF]">
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black text-white"
              onClick={() => setShowGuide(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="font-bold">User Guide</span>
          </div>
        </header>
        <UserGuide />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F0FF]">
      {/* Header */}
      <header className="watermark-tool-header flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-black text-white">
            <X className="h-4 w-4" />
          </Button>
          <span className="font-bold">Watermark Tool</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full" onClick={startTour}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Take Tour
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setShowGuide(true)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Guide
          </Button>
          <Button variant="outline" className="rounded-full">
            Settings
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Watermark Tool
        </h1>
        <TrueFocus
          sentence="Protect Personalize Perfect Your Images"
          borderColor="#6366f1"
          glowColor="rgba(99, 102, 241, 0.6)"
          blurAmount={3}
          animationDuration={0.7}
          pauseBetweenAnimations={1.5}
        />
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-8 pb-16">
        {/* Image Preview */}
        <div className="bg-white rounded-xl p-4">
          <Canvas
            baseImage={baseImages[activeImageIndex]?.preview || null}
            watermarkImage={watermarkType === 'image' ? watermarkImage?.preview || null : null}
            settings={{
              ...settings,
              text: watermarkType === 'text' ? settings.text : undefined
            }}
            onPositionChange={(x, y) => 
              setSettings(prev => ({
                ...prev,
                customPosition: { x, y }
              }))
            }
            onSettingsReset={() => 
              setSettings(prev => ({
                ...prev,
                customPosition: undefined,
                rotation: 0
              }))
            }
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('upload-input')?.click()}>
                <ImageUp className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button variant="outline" size="sm" onClick={processImages} disabled={isProcessing} className="preview-download">
                <Download className="h-4 w-4 mr-2" />
                {isProcessing ? `Processing (${processedCount}/${baseImages.length})` : 'Download'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {baseImages.length > 0 ? `${activeImageIndex + 1} / ${baseImages.length}` : '0 / 0'}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                disabled={activeImageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setActiveImageIndex(prev => Math.min(baseImages.length - 1, prev + 1))}
                disabled={activeImageIndex === baseImages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-[1fr,300px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Upload and Actions */}
            <div className="grid gap-6">
              <Card className="p-6 bg-[#F3F0FF]">
                <div className="batch-processor">
                  <BatchProcessor
                    images={baseImages}
                    onImagesSelect={handleBaseImageSelect}
                    onRemoveImage={(index) => {
                      setBaseImages(prev => prev.filter((_, i) => i !== index));
                      if (activeImageIndex >= index) {
                        setActiveImageIndex(prev => Math.max(0, prev - 1));
                      }
                    }}
                    isProcessing={isProcessing}
                    processedCount={processedCount}
                    totalCount={baseImages.length}
                  />
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-6 gap-4 watermark-type-selector">
                <Button 
                  variant={watermarkType === 'text' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setWatermarkType('text')}
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button 
                  variant={watermarkType === 'image' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setWatermarkType('image')}
                >
                  <Images className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Layers className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Sliders className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={processImages} disabled={isProcessing}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <FileCheck className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Watermark Controls */}
            <div className="watermark-controls">
              {watermarkType === 'text' ? (
                <TextWatermarkControls
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              ) : (
                <WatermarkControls
                  settings={settings}
                  onSettingsChange={setSettings}
                  onWatermarkSelect={handleWatermarkSelect}
                />
              )}
            </div>

            {/* Categories */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Camera, label: "Photographers", desc: "Fast Processing" },
                { icon: Building2, label: "Businesses", desc: "Batch Processing" },
                { icon: Users, label: "Content Creators", desc: "No Installation" },
                { icon: Download, label: "High-Quality", desc: "Fast Download" },
              ].map((category, i) => (
                <Card key={i} className="p-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <category.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs text-muted-foreground">{category.desc}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <PresetManager
              presets={[]}
              onSavePreset={(name) => {
                // Handle preset save
              }}
              onLoadPreset={() => {
                // Handle preset load
              }}
              onDeletePreset={() => {
                // Handle preset delete
              }}
              currentSettings={settings}
            />
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-medium">Recent Sessions</h3>
                <div className="space-y-2">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="text-sm">
                      <p className="font-medium">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        {session.imageCount} images processed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;