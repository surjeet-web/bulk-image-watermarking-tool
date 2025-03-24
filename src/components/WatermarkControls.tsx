import React from 'react';
import { Select } from './ui/Select';
import { Slider } from './ui/Slider';
import { WatermarkSettings } from '../types/watermark';
import { ImageUploader } from './ImageUploader';
import { Move, Grid, Layers } from 'lucide-react';

interface WatermarkControlsProps {
  settings: WatermarkSettings;
  onSettingsChange: (settings: WatermarkSettings) => void;
  onWatermarkSelect: (file: File) => void;
}

export function WatermarkControls({
  settings,
  onSettingsChange,
  onWatermarkSelect
}: WatermarkControlsProps) {
  const handleChange = (key: keyof WatermarkSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const blendModeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'exclusion', label: 'Exclusion' },
    { value: 'hue', label: 'Hue' },
    { value: 'saturation', label: 'Saturation' },
    { value: 'color', label: 'Color' },
    { value: 'luminosity', label: 'Luminosity' }
  ];

  const patternOptions = [
    { value: 'single', label: 'Single' },
    { value: 'grid', label: 'Grid' },
    { value: 'diagonal', label: 'Diagonal' },
    { value: 'wave', label: 'Wave' },
    { value: 'circular', label: 'Circular' },
    { value: 'random', label: 'Random' }
  ];

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'middle-center', label: 'Center' },
    { value: 'custom', label: 'Custom Position' }
  ];

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <ImageUploader
          onImageSelect={onWatermarkSelect}
          accept="image/*"
          label="Upload Watermark"
        />

        {/* Pattern Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Grid className="w-4 h-4" />
            Pattern Type
          </label>
          <Select
            value={settings.pattern}
            onChange={(value) => handleChange('pattern', value)}
            options={patternOptions}
          />
        </div>

        {settings.pattern !== 'single' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pattern Quantity
              </label>
              <Slider
                min={2}
                max={50}
                value={settings.quantity || 2}
                onChange={(value) => handleChange('quantity', value)}
                suffix=""
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pattern Spacing
              </label>
              <Slider
                min={0}
                max={200}
                value={settings.spacing}
                onChange={(value) => handleChange('spacing', value)}
                suffix="px"
              />
            </div>
          </>
        )}

        {/* Position Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Move className="w-4 h-4" />
            Position
          </label>
          <Select
            value={settings.position}
            onChange={(value) => handleChange('position', value)}
            options={positionOptions}
          />
        </div>

        {settings.position === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">X Position</label>
              <Slider
                min={0}
                max={100}
                value={settings.customPosition?.x || 0}
                onChange={(value) => handleChange('customPosition', { 
                  ...settings.customPosition,
                  x: value 
                })}
                suffix="%"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Y Position</label>
              <Slider
                min={0}
                max={100}
                value={settings.customPosition?.y || 0}
                onChange={(value) => handleChange('customPosition', {
                  ...settings.customPosition,
                  y: value
                })}
                suffix="%"
              />
            </div>
          </div>
        )}

        {/* Size and Opacity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Size</label>
          <Slider
            min={1}
            max={100}
            value={settings.size}
            onChange={(value) => handleChange('size', value)}
            suffix="%"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opacity</label>
          <Slider
            min={0}
            max={100}
            value={settings.opacity}
            onChange={(value) => handleChange('opacity', value)}
            suffix="%"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rotation</label>
          <Slider
            min={-180}
            max={180}
            value={settings.rotation}
            onChange={(value) => handleChange('rotation', value)}
            suffix="°"
          />
        </div>

        {/* Blending Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Layers className="w-4 h-4" />
            Blend Mode
          </label>
          <Select
            value={settings.blendMode}
            onChange={(value) => handleChange('blendMode', value)}
            options={blendModeOptions}
          />
        </div>

        {/* Edge Margin */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Edge Margin</label>
          <Slider
            min={0}
            max={100}
            value={settings.edgeMargin}
            onChange={(value) => handleChange('edgeMargin', value)}
            suffix="px"
          />
        </div>

        {/* Color Tint */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!settings.colorTint}
              onChange={(e) => handleChange('colorTint', e.target.checked ? '#ffffff' : undefined)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Color Tint
            </label>
          </div>
          {settings.colorTint && (
            <input
              type="color"
              value={settings.colorTint}
              onChange={(e) => handleChange('colorTint', e.target.value)}
              className="block w-full h-10 mt-1 rounded-md"
            />
          )}
        </div>

        {/* Effects */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.embossed}
              onChange={(e) => handleChange('embossed', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Emboss Effect
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.invertColors}
              onChange={(e) => handleChange('invertColors', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Invert Colors
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.transparencyGradient}
              onChange={(e) => handleChange('transparencyGradient', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Transparency Gradient
            </label>
          </div>
        </div>

        {/* Wave Pattern Settings */}
        {settings.pattern === 'wave' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Wave Amplitude
              </label>
              <Slider
                min={0}
                max={100}
                value={settings.effects.waveAmplitude}
                onChange={(value) => handleChange('effects', {
                  ...settings.effects,
                  waveAmplitude: value
                })}
                suffix="px"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Wave Frequency
              </label>
              <Slider
                min={0}
                max={0.1}
                step={0.001}
                value={settings.effects.waveFrequency}
                onChange={(value) => handleChange('effects', {
                  ...settings.effects,
                  waveFrequency: value
                })}
                suffix=""
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}