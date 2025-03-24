import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function Slider({ min, max, value, onChange, suffix }: SliderProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm text-gray-600 min-w-[4ch]">
        {value}{suffix}
      </span>
    </div>
  );
}