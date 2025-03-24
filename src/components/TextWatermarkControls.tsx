import React, { useEffect, useState } from "react";
import { WatermarkSettings, CustomFont } from '../types/watermark';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { Search, Upload, Type, Grid, Droplet, Wind } from 'lucide-react';
import WebFont from 'webfontloader';

const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Source Sans Pro',
  'Raleway',
  'Ubuntu',
  'Merriweather'
];

interface TextWatermarkControlsProps {
  settings: WatermarkSettings;
  onSettingsChange: (settings: WatermarkSettings) => void;
}

export function TextWatermarkControls({ settings, onSettingsChange }: TextWatermarkControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFonts] = useState<string[]>([
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Courier New'
  ]);

  useEffect(() => {
    // Load Google Fonts
    WebFont.load({
      google: {
        families: GOOGLE_FONTS
      }
    });
  }, []);

  const handleChange = (key: keyof WatermarkSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fontUrl = URL.createObjectURL(file);
      const fontFace = new FontFace(file.name.replace(/\.[^/.]+$/, ""), `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      const newFont: CustomFont = {
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: fontUrl,
        isNew: true,
        uploadedAt: new Date().toISOString()
      };

      handleChange('customFonts', [...(settings.customFonts || []), newFont]);
    } catch (error) {
      console.error('Error loading font:', error);
    }
  };

  const allFonts = [...systemFonts, ...GOOGLE_FONTS, ...(settings.customFonts || []).map(f => f.name)];
  const filteredFonts = allFonts.filter(font => 
    font.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const patternOptions = [
    { value: 'single', label: 'Single' },
    { value: 'grid', label: 'Grid' },
    { value: 'diagonal', label: 'Diagonal' },
    { value: 'wave', label: 'Wave' },
    { value: 'circular', label: 'Circular' },
    { value: 'random', label: 'Random' }
  ];

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Type className="w-4 h-4" />
            Text
          </label>
          <input
            type="text"
            value={settings.text ?? ''}
            onChange={(e) => handleChange('text', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Enter watermark text"
          />
        </div>

        {/* Font Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Font Family</label>
            <label className="relative inline-block">
              <Upload className="w-4 h-4 cursor-pointer" />
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Font Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fonts..."
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <Select
            value={settings.fontFamily ?? 'Arial'}
            onChange={(value) => handleChange('fontFamily', value)}
            options={filteredFonts.map(font => ({
              value: font,
              label: font + (settings.customFonts?.find(f => f.name === font)?.isNew ? ' (New)' : '')
            }))}
          />
        </div>

        {/* Pattern Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Grid className="w-4 h-4" />
            Pattern
          </label>
          <Select
            value={settings.pattern ?? 'single'}
            onChange={(value) => handleChange('pattern', value)}
            options={patternOptions}
          />
        </div>

        {settings.pattern !== 'single' && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Pattern Quantity</label>
              <Slider
                min={2}
                max={50}
                value={settings.quantity ?? 2}
                onChange={(value) => handleChange('quantity', value)}
                suffix=""
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Pattern Spacing</label>
              <Slider
                min={0}
                max={200}
                value={settings.spacing ?? 20}
                onChange={(value) => handleChange('spacing', value)}
                suffix="px"
              />
            </div>
          </>
        )}

        {/* Basic Text Settings */}
        <div>
          <label className="text-sm font-medium text-gray-700">Font Size</label>
          <Slider
            min={8}
            max={200}
            value={settings.fontSize ?? 24}
            onChange={(value) => handleChange('fontSize', value)}
            suffix="px"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Font Color</label>
          <input
            type="color"
            value={settings.fontColor ?? '#ffffff'}
            onChange={(e) => handleChange('fontColor', e.target.value)}
            className="mt-1 block w-full h-10 rounded-md"
          />
        </div>

        {/* Effects */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Effects</h3>

          {/* Stroke Effect */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.effects?.stroke ?? false}
                onChange={(e) => handleChange('effects', {
                  ...settings.effects,
                  stroke: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Stroke
              </label>
            </div>

            {settings.effects?.stroke && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Stroke Color
                  </label>
                  <input
                    type="color"
                    value={settings.effects?.strokeColor ?? '#000000'}
                    onChange={(e) => handleChange('effects', {
                      ...settings.effects,
                      strokeColor: e.target.value
                    })}
                    className="mt-1 block w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Stroke Width
                  </label>
                  <Slider
                    min={1}
                    max={20}
                    value={settings.effects?.strokeWidth ?? 1}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      strokeWidth: value
                    })}
                    suffix="px"
                  />
                </div>
              </>
            )}
          </div>

          {/* Shadow Effect */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.effects?.shadow ?? false}
                onChange={(e) => handleChange('effects', {
                  ...settings.effects,
                  shadow: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Shadow
              </label>
            </div>

            {settings.effects?.shadow && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Shadow Color
                  </label>
                  <input
                    type="color"
                    value={settings.effects?.shadowColor ?? '#000000'}
                    onChange={(e) => handleChange('effects', {
                      ...settings.effects,
                      shadowColor: e.target.value
                    })}
                    className="mt-1 block w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Shadow Blur
                  </label>
                  <Slider
                    min={0}
                    max={50}
                    value={settings.effects?.shadowBlur ?? 5}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      shadowBlur: value
                    })}
                    suffix="px"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Shadow Offset X
                  </label>
                  <Slider
                    min={-50}
                    max={50}
                    value={settings.effects?.shadowOffset?.x ?? 0}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      shadowOffset: { ...settings.effects?.shadowOffset, x: value }
                    })}
                    suffix="px"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Shadow Offset Y
                  </label>
                  <Slider
                    min={-50}
                    max={50}
                    value={settings.effects?.shadowOffset?.y ?? 0}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      shadowOffset: { ...settings.effects?.shadowOffset, y: value }
                    })}
                    suffix="px"
                  />
                </div>
              </>
            )}
          </div>

          {/* Glow Effect */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.effects?.glow ?? false}
                onChange={(e) => handleChange('effects', {
                  ...settings.effects,
                  glow: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Glow
              </label>
            </div>

            {settings.effects?.glow && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Glow Color
                  </label>
                  <input
                    type="color"
                    value={settings.effects?.glowColor ?? '#ffffff'}
                    onChange={(e) => handleChange('effects', {
                      ...settings.effects,
                      glowColor: e.target.value
                    })}
                    className="mt-1 block w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Glow Intensity
                  </label>
                  <Slider
                    min={0}
                    max={100}
                    value={settings.effects?.glowIntensity ?? 50}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      glowIntensity: value
                    })}
                    suffix="%"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Glow Spread
                  </label>
                  <Slider
                    min={0}
                    max={50}
                    value={settings.effects?.glowSpread ?? 10}
                    onChange={(value) => handleChange('effects', {
                      ...settings.effects,
                      glowSpread: value
                    })}
                    suffix="px"
                  />
                </div>
              </>
            )}
          </div>

          {/* Wave Effect for Text */}
          {settings.pattern === 'wave' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Wind className="w-4 h-4" />
                Wave Settings
              </label>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Wave Amplitude
                </label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.effects?.waveAmplitude ?? 20}
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
                  value={settings.effects?.waveFrequency ?? 0.02}
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
    </div>
  );
}