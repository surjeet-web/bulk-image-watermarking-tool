import React from 'react';
import { WatermarkSettings } from '../types/watermark';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { Eye, EyeOff, Palette, Droplet, Wind } from 'lucide-react';

interface AdvancedSettingsProps {
  settings: WatermarkSettings;
  onSettingsChange: (settings: WatermarkSettings) => void;
}

export function AdvancedSettings({
  settings,
  onSettingsChange
}: AdvancedSettingsProps) {
  const handleChange = (key: keyof WatermarkSettings['effects'], value: any) => {
    onSettingsChange({
      ...settings,
      effects: {
        ...settings.effects,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold mb-4">Effects</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplet className="w-4 h-4" />
              Blur
            </label>
            <Slider
              min={0}
              max={20}
              value={settings.effects.blur}
              onChange={(value) => handleChange('blur', value)}
              suffix="px"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.effects.shadow}
              onChange={(e) => handleChange('shadow', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Shadow
            </label>
          </div>

          {settings.effects.shadow && (
            <div className="space-y-4 pl-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Shadow Color
                </label>
                <input
                  type="color"
                  value={settings.effects.shadowColor}
                  onChange={(e) => handleChange('shadowColor', e.target.value)}
                  className="block w-full h-10 mt-1 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Shadow Blur
                </label>
                <Slider
                  min={0}
                  max={50}
                  value={settings.effects.shadowBlur}
                  onChange={(value) => handleChange('shadowBlur', value)}
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
                  value={settings.effects.shadowOffset.x}
                  onChange={(value) =>
                    handleChange('shadowOffset', { ...settings.effects.shadowOffset, x: value })
                  }
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
                  value={settings.effects.shadowOffset.y}
                  onChange={(value) =>
                    handleChange('shadowOffset', { ...settings.effects.shadowOffset, y: value })
                  }
                  suffix="px"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.effects.stroke}
              onChange={(e) => handleChange('stroke', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Stroke
            </label>
          </div>

          {settings.effects.stroke && (
            <div className="space-y-4 pl-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Stroke Color
                </label>
                <input
                  type="color"
                  value={settings.effects.strokeColor}
                  onChange={(e) => handleChange('strokeColor', e.target.value)}
                  className="block w-full h-10 mt-1 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Stroke Width
                </label>
                <Slider
                  min={1}
                  max={10}
                  value={settings.effects.strokeWidth}
                  onChange={(value) => handleChange('strokeWidth', value)}
                  suffix="px"
                />
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Wind className="w-4 h-4" />
              Noise
            </label>
            <Slider
              min={0}
              max={100}
              value={settings.effects.noise}
              onChange={(value) => handleChange('noise', value)}
              suffix="%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}