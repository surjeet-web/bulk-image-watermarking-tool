import React, { useState } from 'react';
import { WatermarkPreset, WatermarkSettings } from '../types/watermark';
import { Save, Trash2, Edit } from 'lucide-react';

interface PresetManagerProps {
  presets: WatermarkPreset[];
  onSavePreset: (name: string, settings: WatermarkSettings) => void;
  onLoadPreset: (preset: WatermarkPreset) => void;
  onDeletePreset: (id: string) => void;
  currentSettings: WatermarkSettings;
}

export function PresetManager({
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  currentSettings
}: PresetManagerProps) {
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName, currentSettings);
    setNewPresetName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Presets</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          New Preset
        </button>
      </div>

      {isCreating && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name"
            className="flex-1 px-3 py-1 border rounded-lg"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <h4 className="font-medium">{preset.name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(preset.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLoadPreset(preset)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeletePreset(preset.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}