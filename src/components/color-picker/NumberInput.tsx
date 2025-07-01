import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  id: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  id,
}: NumberInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={id} className="w-24">
        {label}
      </Label>
      <Input
        type="number"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        className="w-20"
      />
    </div>
  );
}
