import React from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step,
  label,
}: SliderProps) {
  return (
    <div className="flex items-center space-x-4">
      <label className="w-24">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <span className="w-12 text-right">{value.toFixed(2)}</span>
    </div>
  );
}
